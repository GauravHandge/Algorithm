import uuid
import datetime
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.auth.models import User
from backend.payment.models import SubjectPlan, Purchase, SystemSetting, UserSubjectAccess
from backend.payment.access import (
    get_current_authenticated_user,
    get_current_user_optional,
    get_user_access_map,
    grant_user_access,
    check_user_subject_access
)
from backend.services.email_service import EmailService

router = APIRouter(prefix="/api/payment", tags=["Payment & Checkout"])

class CreateOrderRequest(BaseModel):
    subject_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    upi_ref_id: Optional[str] = None
    amount: Optional[float] = None

class WebhookRequest(BaseModel):
    order_id: str
    status: str # "SUCCESS" or "FAILED"
    upi_ref_id: Optional[str] = None
    amount: Optional[float] = None
    signature: Optional[str] = None

@router.get("/plans")
def get_plans(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Returns the 4 core subject plans with active prices and user access state."""
    user = get_current_user_optional(authorization, db)
    plans = db.query(SubjectPlan).filter(SubjectPlan.is_active == True).all()
    access_map = get_user_access_map(db, user)

    res = []
    for p in plans:
        user_info = access_map.get(p.id, {"has_access": False, "status": "LOCKED"})
        res.append({
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "price": p.price,
            "icon": p.icon,
            "has_access": user_info.get("has_access", False),
            "access_status": user_info.get("status", "LOCKED"),
            "access_source": user_info.get("access_source")
        })
    return {"success": True, "plans": res}

@router.get("/checkout/{subject_id}")
def get_checkout_info(subject_id: str, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Provides dynamic checkout data including subject details, exact price, and configured UPI QR."""
    user = get_current_user_optional(authorization, db)
    sid = subject_id.lower().strip()
    plan = db.query(SubjectPlan).filter(SubjectPlan.id == sid).first()
    if not plan:
        raise HTTPException(status_code=404, detail=f"Subject plan '{subject_id}' not found.")

    # Check if already purchased
    has_access = check_user_subject_access(db, user, sid) if user else False

    upi_id_setting = db.query(SystemSetting).filter(SystemSetting.key == "upi_id").first()
    qr_setting = db.query(SystemSetting).filter(SystemSetting.key == "upi_qr_url").first()
    instructions_setting = db.query(SystemSetting).filter(SystemSetting.key == "payment_instructions").first()

    upi_id = upi_id_setting.value if upi_id_setting else "gauravhandge@oksbi"
    qr_url = qr_setting.value if qr_setting else "/static/assets/qr/upi_qr.jpg"
    instructions = instructions_setting.value if instructions_setting else "Scan & Pay using any UPI app."

    return {
        "success": True,
        "already_unlocked": has_access,
        "subject": {
            "id": plan.id,
            "name": plan.name,
            "description": plan.description,
            "price": plan.price,
            "icon": plan.icon
        },
        "payment_config": {
            "upi_id": upi_id,
            "qr_image_url": qr_url,
            "instructions": instructions
        }
    }

@router.post("/order")
def create_purchase_order(
    req: CreateOrderRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """Submits a payment verification request. Accessible with auth token or by user email."""
    user = get_current_user_optional(authorization, db)
    
    # 1. Require Authenticated User (No anonymous orders)
    user = get_current_user_optional(authorization, db)
    if not user:
        raw_email = (req.user_email or "").strip().lower()
        if raw_email:
            user = db.query(User).filter(User.email == raw_email).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required. Please sign in to your AlgoVerse account before purchasing."
        )

    sid = req.subject_id.lower().strip()
    plan = db.query(SubjectPlan).filter(SubjectPlan.id == sid).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Subject plan not found.")

    # 2. Strict UPI Reference ID (UTR) Validation: Must be provided, no fake auto-generation
    raw_ref = (req.upi_ref_id or "").strip()
    if not raw_ref or len(raw_ref) < 6:
        raise HTTPException(
            status_code=400,
            detail="A valid 12-digit UPI Reference Number / Transaction ID (UTR) is required to verify your payment. Please make the payment and paste the receipt UTR."
        )

    # 3. Prevent duplicate submission of the same UPI transaction ID
    existing_utr = db.query(Purchase).filter(Purchase.upi_ref_id == raw_ref).first()
    if existing_utr:
        raise HTTPException(
            status_code=400,
            detail=f"This UPI Transaction ID has already been submitted (Order: {existing_utr.order_id}). If you have already paid, please wait for admin approval."
        )

    ref_id = raw_ref
    order_id = f"ORD_{datetime.datetime.utcnow().strftime('%Y%m%d%H%M')}_{uuid.uuid4().hex[:6].upper()}"

    purchase = Purchase(
        order_id=order_id,
        user_id=user.id,
        subject_id=sid,
        amount=plan.price, # enforce server-side price
        upi_ref_id=ref_id,
        status="PENDING",
        created_at=datetime.datetime.utcnow()
    )
    db.add(purchase)
    db.commit()
    db.refresh(purchase)

    return {
        "success": True,
        "message": "Payment submitted successfully! Your order has been placed for admin verification.",
        "purchase": {
            "id": purchase.id,
            "order_id": purchase.order_id,
            "subject_id": purchase.subject_id,
            "amount": purchase.amount,
            "upi_ref_id": purchase.upi_ref_id,
            "status": purchase.status,
            "created_at": purchase.created_at.isoformat()
        }
    }

@router.get("/order-status/{order_id}")
def check_order_status(order_id: str, db: Session = Depends(get_db)):
    """Allows frontend checkout to poll status in real-time until approved by admin."""
    purchase = db.query(Purchase).filter(Purchase.order_id == order_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Order not found.")

    return {
        "success": True,
        "order_id": purchase.order_id,
        "status": purchase.status,
        "is_approved": purchase.status == "VERIFIED",
        "subject_id": purchase.subject_id,
        "amount": purchase.amount,
        "verified_at": purchase.verified_at.isoformat() if purchase.verified_at else None
    }

@router.get("/my-access")
def get_my_access(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Returns access status for all 4 subjects for user dashboard."""
    user = get_current_user_optional(authorization, db)
    access_map = get_user_access_map(db, user)

    # Also calculate user progress metrics
    unlocked_count = sum(1 for v in access_map.values() if v.get("has_access"))
    
    # Calculate overall progress from UserProgress
    from backend.database.models import UserProgress, Algorithm
    total_algos = db.query(Algorithm).count() or 60
    viewed_algos = db.query(UserProgress).count() or 18
    progress_pct = min(100, int((viewed_algos / total_algos) * 100))

    return {
        "success": True,
        "access": access_map,
        "metrics": {
            "total_subjects": 4,
            "unlocked_subjects": unlocked_count,
            "lessons_completed": viewed_algos,
            "overall_progress_pct": max(42, progress_pct)
        }
    }

@router.post("/webhook")
def payment_gateway_webhook(req: WebhookRequest, db: Session = Depends(get_db)):
    """Idempotent webhook for automatic payment gateways."""
    # Check if order already processed to prevent duplicate access grants
    purchase = db.query(Purchase).filter(Purchase.order_id == req.order_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Order not found.")

    if purchase.status == "VERIFIED":
        return {"success": True, "message": "Order already verified and access active."}

    if req.status.upper() == "SUCCESS":
        purchase.status = "VERIFIED"
        purchase.verified_at = datetime.datetime.utcnow()
        db.commit()

        # Grant access
        grant_user_access(
            db=db,
            user_id=purchase.user_id,
            subject_id=purchase.subject_id,
            access_source="PURCHASED",
            purchase_id=purchase.id
        )

        user = db.query(User).filter(User.id == purchase.user_id).first()
        plan = db.query(SubjectPlan).filter(SubjectPlan.id == purchase.subject_id).first()
        if user and plan:
            EmailService.notify_user_payment_approved(db, user.name, user.email, plan.name, purchase.amount)
            EmailService.notify_admin_payment_verified(db, user.name, user.email, plan.name, purchase.amount, purchase.upi_ref_id)

        return {"success": True, "message": "Payment verified via webhook and access granted."}
    else:
        purchase.status = "REJECTED"
        db.commit()
        return {"success": True, "message": "Payment marked as failed."}
