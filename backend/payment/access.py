import datetime
from typing import Optional
from fastapi import Header, HTTPException, status, Depends
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.auth.models import User
from backend.auth.security import verify_auth_token
from backend.payment.models import UserSubjectAccess, SubjectPlan, AdminLog

def get_current_user_optional(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> Optional[User]:
    """Extracts user from Bearer token if present, else returns None."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = verify_auth_token(token)
    if not payload:
        return None
    return db.query(User).filter(User.id == payload.get("sub")).first()

def get_current_authenticated_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Requires a valid authenticated user session."""
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in to continue."
        )
    return user

def require_admin_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)) -> User:
    """Enforces administrator role-based access control."""
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please sign in as Administrator."
        )

    if not (user.is_admin or user.role == "Admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return user

def check_user_subject_access(db: Session, user: Optional[User], subject_id: str) -> bool:
    """Checks whether the user has active premium access to the requested subject.
    Access is strictly subject-specific: purchasing DSA unlocks DSA only."""
    if not user:
        return False

    # Normalize subject_id if needed
    sid = subject_id.lower().strip()
    if sid in ["aiml", "ai"]:
        sid_candidates = ["ai", "aiml"]
    else:
        sid_candidates = [sid]

    access_record = db.query(UserSubjectAccess).filter(
        UserSubjectAccess.user_id == user.id,
        UserSubjectAccess.subject_id.in_(sid_candidates),
        UserSubjectAccess.status == "ACTIVE"
    ).first()

    if not access_record:
        return False

    # Check expiry if configured
    if access_record.expires_at and access_record.expires_at < datetime.datetime.utcnow():
        access_record.status = "EXPIRED"
        db.commit()
        return False

    return True

def get_user_access_map(db: Session, user: Optional[User]) -> dict:
    """Returns access overview for all 4 core subjects for the current user.
    Each subject's status is independently checked from the database."""
    subjects = ["ai", "dsa", "ml", "cybersecurity"]
    plans = {p.id: p for p in db.query(SubjectPlan).all()}
    result = {}

    for sid in subjects:
        plan = plans.get(sid)
        price = plan.price if plan else (20.0 if sid in ["ai", "ml"] else (40.0 if sid == "dsa" else 10.0))
        name = plan.name if plan else sid.upper()

        if not user:
            result[sid] = {
                "subject_id": sid,
                "name": name,
                "price": price,
                "has_access": False,
                "status": "LOCKED",
                "access_source": None
            }
            continue

        # Check DB strictly for this subject
        sid_candidates = ["ai", "aiml"] if sid == "ai" else [sid]
        record = db.query(UserSubjectAccess).filter(
            UserSubjectAccess.user_id == user.id,
            UserSubjectAccess.subject_id.in_(sid_candidates),
            UserSubjectAccess.status == "ACTIVE"
        ).first()

        if record:
            result[sid] = {
                "subject_id": sid,
                "name": name,
                "price": price,
                "has_access": True,
                "status": "PURCHASED" if record.access_source == "PURCHASED" else "FREE_ACCESS",
                "access_source": record.access_source,
                "granted_at": record.granted_at.isoformat() if record.granted_at else None,
                "expires_at": record.expires_at.isoformat() if record.expires_at else None,
                "reason": record.reason
            }
        else:
            result[sid] = {
                "subject_id": sid,
                "name": name,
                "price": price,
                "has_access": False,
                "status": "LOCKED",
                "access_source": None
            }

    return result

def grant_user_access(
    db: Session,
    user_id: int,
    subject_id: str,
    access_source: str = "PURCHASED",
    purchase_id: Optional[int] = None,
    granted_by: Optional[int] = None,
    reason: Optional[str] = None,
    expires_at: Optional[datetime.datetime] = None
) -> UserSubjectAccess:
    """Grants active access to a user for a subject, avoiding duplicates."""
    sid = subject_id.lower().strip()
    existing = db.query(UserSubjectAccess).filter(
        UserSubjectAccess.user_id == user_id,
        UserSubjectAccess.subject_id == sid
    ).first()

    if existing:
        existing.status = "ACTIVE"
        existing.access_source = access_source
        existing.purchase_id = purchase_id or existing.purchase_id
        existing.granted_by = granted_by or existing.granted_by
        existing.reason = reason or existing.reason
        existing.expires_at = expires_at
        existing.granted_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing)
        record = existing
    else:
        record = UserSubjectAccess(
            user_id=user_id,
            subject_id=sid,
            access_type="PREMIUM",
            access_source=access_source,
            purchase_id=purchase_id,
            granted_by=granted_by,
            reason=reason,
            granted_at=datetime.datetime.utcnow(),
            expires_at=expires_at,
            status="ACTIVE"
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return record

def revoke_user_access(db: Session, user_id: int, subject_id: str, admin_id: int, reason: Optional[str] = None) -> bool:
    """Revokes active access for a user on a given subject."""
    sid = subject_id.lower().strip()
    records = db.query(UserSubjectAccess).filter(
        UserSubjectAccess.user_id == user_id,
        UserSubjectAccess.subject_id == sid,
        UserSubjectAccess.status == "ACTIVE"
    ).all()

    if not records:
        return False

    for r in records:
        r.status = "REVOKED"

    # Log action
    log = AdminLog(
        admin_id=admin_id,
        action="REVOKE_ACCESS",
        target_type="USER",
        target_id=str(user_id),
        details={"subject_id": sid, "reason": reason}
    )
    db.add(log)
    db.commit()
    return True

