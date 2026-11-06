import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime
from typing import Optional
from sqlalchemy.orm import Session
from backend.payment.models import EmailNotification, SystemSetting

class EmailService:
    @staticmethod
    def _get_setting(db: Session, key: str, default: str = "") -> str:
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        return setting.value if setting else default

    @classmethod
    def send_email(cls, db: Session, to_email: str, subject: str, html_body: str, email_type: str, to_name: Optional[str] = None):
        """Records notification in database and dispatches via SMTP if configured."""
        # 1. Log notification in database
        notification = EmailNotification(
            recipient_email=to_email,
            recipient_name=to_name,
            subject=subject,
            body=html_body,
            email_type=email_type,
            status="PENDING",
            created_at=datetime.datetime.utcnow()
        )
        db.add(notification)
        db.commit()

        # 2. Check SMTP environment variables
        smtp_host = os.getenv("SMTP_HOST")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASSWORD")
        from_email = os.getenv("SMTP_FROM", cls._get_setting(db, "smtp_from_email", "noreply@algoverse.io"))

        if not (smtp_host and smtp_user and smtp_pass):
            # SMTP credentials not provided yet: mark as LOGGED in development
            notification.status = "LOGGED_NO_SMTP"
            db.commit()
            print(f"[Email Notification Logged] Type: {email_type} -> To: {to_email} | Subject: {subject}")
            return True

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"AlgoVerse Platform <{from_email}>"
            msg["To"] = to_email
            msg.attach(MIMEText(html_body, "html"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())

            notification.status = "SENT"
            db.commit()
            print(f"[Email Dispatched Successfully] Type: {email_type} -> To: {to_email}")
            return True
        except Exception as e:
            notification.status = f"FAILED: {str(e)[:100]}"
            db.commit()
            print(f"[Email Dispatch Error] {e}")
            return False

    @classmethod
    def notify_user_payment_approved(cls, db: Session, user_name: str, user_email: str, subject_name: str, amount: float):
        subject = f"🎉 Access Confirmed: {subject_name} is Now Unlocked on AlgoVerse!"
        html = f"""
        <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #E2E8F0; border-radius:12px; background:#FFFFFF;">
            <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#2563EB; margin:0;">AlgoVerse</h2>
                <p style="color:#64748B; font-size:14px; margin:4px 0 0 0;">Interactive Computer Science Learning Platform</p>
            </div>
            <hr style="border:none; border-top:1px solid #F1F5F9; margin:20px 0;">
            <p style="font-size:16px; color:#0F172A;">Hello <strong>{user_name}</strong>,</p>
            <p style="color:#334155; font-size:15px; line-height:1.5;">
                Your payment of <strong>₹{amount:.2f}</strong> for <strong>{subject_name}</strong> has been verified and approved! Your full premium workspace is now unlocked.
            </p>
            <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:16px; margin:20px 0;">
                <p style="margin:4px 0; color:#475569; font-size:14px;"><strong>Subject:</strong> {subject_name}</p>
                <p style="margin:4px 0; color:#475569; font-size:14px;"><strong>Amount Paid:</strong> ₹{amount:.2f}</p>
                <p style="margin:4px 0; color:#475569; font-size:14px;"><strong>Access Status:</strong> <span style="color:#16A34A; font-weight:700;">Premium Unlocked (Active)</span></p>
            </div>
            <div style="text-align:center; margin-top:24px;">
                <a href="http://127.0.0.1:8000/static/dashboard.html" style="background:#2563EB; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; display:inline-block;">
                    Open Learning Dashboard ➔
                </a>
            </div>
            <p style="color:#94A3B8; font-size:12px; margin-top:30px; text-align:center;">
                Happy Learning!<br>The AlgoVerse Engineering Team
            </p>
        </div>
        """
        return cls.send_email(db, user_email, subject, html, "USER_PAYMENT_CONFIRMATION", user_name)

    @classmethod
    def notify_admin_payment_verified(cls, db: Session, user_name: str, user_email: str, subject_name: str, amount: float, upi_ref_id: str):
        admin_email = cls._get_setting(db, "admin_notify_email", "gaurav@algoverse.io")
        subject = f"💰 New Payment Approved: ₹{amount:.2f} for {subject_name} by {user_name}"
        now_str = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p UTC")
        html = f"""
        <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #E2E8F0; border-radius:12px; background:#FFFFFF;">
            <h3 style="color:#0F172A; margin-top:0;">Payment Approved & Access Activated</h3>
            <p style="color:#475569; font-size:14px;">A purchase transaction has been approved and registered:</p>
            <table style="width:100%; border-collapse:collapse; margin:16px 0; font-size:14px;">
                <tr><td style="padding:8px 0; color:#64748B;">User Name:</td><td style="padding:8px 0; font-weight:600;">{user_name}</td></tr>
                <tr><td style="padding:8px 0; color:#64748B;">User Email:</td><td style="padding:8px 0; font-weight:600;">{user_email}</td></tr>
                <tr><td style="padding:8px 0; color:#64748B;">Subject:</td><td style="padding:8px 0; font-weight:600;">{subject_name}</td></tr>
                <tr><td style="padding:8px 0; color:#64748B;">Amount:</td><td style="padding:8px 0; font-weight:700; color:#16A34A;">₹{amount:.2f}</td></tr>
                <tr><td style="padding:8px 0; color:#64748B;">UPI Ref ID:</td><td style="padding:8px 0; font-family:monospace; font-weight:600;">{upi_ref_id}</td></tr>
                <tr><td style="padding:8px 0; color:#64748B;">Timestamp:</td><td style="padding:8px 0;">{now_str}</td></tr>
            </table>
            <a href="http://127.0.0.1:8000/static/admin.html" style="background:#0F172A; color:#FFFFFF; text-decoration:none; padding:10px 20px; border-radius:6px; font-size:13px; font-weight:600; display:inline-block;">
                View Admin Dashboard
            </a>
        </div>
        """
        return cls.send_email(db, admin_email, subject, html, "ADMIN_PAYMENT_VERIFIED", "Administrator")

    @classmethod
    def notify_user_free_access_granted(cls, db: Session, user_name: str, user_email: str, subject_name: str, reason: Optional[str] = None):
        subject = f"🎁 Special Access Granted: Free Full Access to {subject_name} on AlgoVerse!"
        html = f"""
        <div style="font-family:'Inter',sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #E2E8F0; border-radius:12px; background:#FFFFFF;">
            <div style="text-align:center; margin-bottom:20px;">
                <h2 style="color:#2563EB; margin:0;">AlgoVerse</h2>
                <p style="color:#64748B; font-size:14px; margin:4px 0 0 0;">Interactive Computer Science Learning Platform</p>
            </div>
            <p style="font-size:16px; color:#0F172A;">Hello <strong>{user_name}</strong>,</p>
            <p style="color:#334155; font-size:15px; line-height:1.5;">
                You have been granted <strong>complete free access</strong> to <strong>{subject_name}</strong> by the AlgoVerse Administrator{f' ({reason})' if reason else ''}!
            </p>
            <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:8px; padding:16px; margin:20px 0;">
                <p style="margin:0; color:#166534; font-weight:600;">
                    ✓ All interactive visualizations, lessons, and practice modules for this subject are now unlocked.
                </p>
            </div>
            <div style="text-align:center; margin-top:24px;">
                <a href="http://127.0.0.1:8000/static/dashboard.html" style="background:#2563EB; color:#FFFFFF; text-decoration:none; padding:12px 24px; border-radius:8px; font-weight:700; display:inline-block;">
                    Launch Learning Dashboard ➔
                </a>
            </div>
            <p style="color:#94A3B8; font-size:12px; margin-top:30px; text-align:center;">
                Happy Coding!<br>AlgoVerse Team
            </p>
        </div>
        """
        return cls.send_email(db, user_email, subject, html, "FREE_ACCESS_GRANTED", user_name)
