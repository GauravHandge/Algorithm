import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database.database import Base

class SubjectPlan(Base):
    __tablename__ = "subject_plans"

    id = Column(String, primary_key=True, index=True) # "ai", "dsa", "ml", "cybersecurity"
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False, default=20.0) # Configurable in Admin
    icon = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    purchases = relationship("Purchase", back_populates="subject_plan")
    access_records = relationship("UserSubjectAccess", back_populates="subject_plan")

class Purchase(Base):
    __tablename__ = "purchases"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(String, unique=True, index=True, nullable=False) # e.g. "ORD_20261106_A1B2C3"
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(String, ForeignKey("subject_plans.id"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    upi_ref_id = Column(String, nullable=False, index=True) # Transaction / UTR reference ID
    status = Column(String, default="PENDING", index=True) # "PENDING", "VERIFIED", "REJECTED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id])
    verifier = relationship("User", foreign_keys=[verified_by])
    subject_plan = relationship("SubjectPlan", back_populates="purchases")
    access_record = relationship("UserSubjectAccess", back_populates="purchase", uselist=False)

class UserSubjectAccess(Base):
    __tablename__ = "user_subject_access"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(String, ForeignKey("subject_plans.id"), nullable=False, index=True)
    access_type = Column(String, default="PREMIUM") # "PREMIUM", "FREE_PREVIEW"
    access_source = Column(String, default="PURCHASED", index=True) # "PURCHASED", "ADMIN_GRANTED"
    purchase_id = Column(Integer, ForeignKey("purchases.id"), nullable=True)
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True) # Admin user ID if admin-granted
    reason = Column(String, nullable=True) # e.g. "Friend", "Collaboration", "Internal Access"
    granted_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True) # None = Lifetime access
    status = Column(String, default="ACTIVE", index=True) # "ACTIVE", "REVOKED", "EXPIRED"

    user = relationship("User", foreign_keys=[user_id])
    grantor = relationship("User", foreign_keys=[granted_by])
    subject_plan = relationship("SubjectPlan", back_populates="access_records")
    purchase = relationship("Purchase", back_populates="access_record")

class SystemSetting(Base):
    __tablename__ = "system_settings"

    key = Column(String, primary_key=True, index=True) # e.g. "upi_id", "upi_qr_url", "payment_instructions", "admin_notify_email"
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False, index=True) # "APPROVE_PAYMENT", "REJECT_PAYMENT", "GRANT_FREE_ACCESS", "REVOKE_ACCESS", "UPDATE_PRICE", "UPDATE_QR"
    target_type = Column(String, nullable=True) # "USER", "PURCHASE", "SUBJECT", "SETTING"
    target_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    admin = relationship("User", foreign_keys=[admin_id])

class EmailNotification(Base):
    __tablename__ = "email_notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipient_email = Column(String, nullable=False, index=True)
    recipient_name = Column(String, nullable=True)
    subject = Column(String, nullable=False)
    body = Column(Text, nullable=False)
    email_type = Column(String, nullable=False, index=True) # "ADMIN_PAYMENT_VERIFIED", "USER_PAYMENT_CONFIRMATION", "FREE_ACCESS_GRANTED", "PAYMENT_REJECTED"
    status = Column(String, default="SENT") # "SENT", "PENDING", "FAILED"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

