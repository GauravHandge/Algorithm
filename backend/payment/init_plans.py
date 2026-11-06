import os
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.database.database import engine, Base, SessionLocal
from backend.auth.models import User
from backend.database.models import Algorithm, Subject, Topic
from backend.payment.models import SubjectPlan, SystemSetting, Purchase, UserSubjectAccess, AdminLog, EmailNotification
from backend.auth.security import hash_password

def migrate_and_seed_payment_system():
    """Initializes tables, seeds subject plans, system settings, and default admin user."""
    # 1. Create all missing tables in database
    Base.metadata.create_all(bind=engine)

    # 2. Add column is_admin to users if missing in existing SQLite schema
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
            conn.commit()
            print("[Database Migration] Added is_admin column to users table.")
        except Exception:
            pass # column already exists
        
        try:
            conn.execute(text("ALTER TABLE algorithms ADD COLUMN is_free_preview BOOLEAN DEFAULT 0"))
            conn.commit()
            print("[Database Migration] Added is_free_preview column to algorithms table.")
        except Exception:
            pass

    db: Session = SessionLocal()
    try:
        # 3. Ensure Gaurav Handge is Admin
        admin_user = db.query(User).filter(User.email == "gaurav@algoverse.io").first()
        if not admin_user:
            hashed, salt = hash_password("algoverse123")
            admin_user = User(
                name="Gaurav Handge",
                email="gaurav@algoverse.io",
                hashed_password=hashed,
                salt=salt,
                role="Admin",
                is_admin=True,
                avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
            )
            db.add(admin_user)
            db.commit()
            print("[Database] Created Administrator account: gaurav@algoverse.io")
        else:
            admin_user.is_admin = True
            admin_user.role = "Admin"
            db.commit()

        # 4. Seed the 4 Monetization Subject Plans with default prices
        plans_data = [
            {
                "id": "ai",
                "name": "Artificial Intelligence (AI)",
                "description": "Learn AI concepts, models, and real-world applications with 8 RAG Architectures & LangGraph Studio.",
                "price": 20.0,
                "icon": "brain"
            },
            {
                "id": "dsa",
                "name": "Data Structures & Algorithms (DSA)",
                "description": "Master DSA with visualizations, practice, and real problems across 16+ core data structures and algorithms.",
                "price": 40.0,
                "icon": "code"
            },
            {
                "id": "ml",
                "name": "Machine Learning (ML)",
                "description": "Learn ML algorithms, models, and practical implementations from Linear Regression to Neural Networks.",
                "price": 20.0,
                "icon": "chart"
            },
            {
                "id": "cybersecurity",
                "name": "Cybersecurity & Cryptography",
                "description": "Learn security, threats, tools, and hands-on concepts including RSA and classical ciphers.",
                "price": 10.0,
                "icon": "shield"
            }
        ]

        for p in plans_data:
            existing_plan = db.query(SubjectPlan).filter(SubjectPlan.id == p["id"]).first()
            if not existing_plan:
                plan_obj = SubjectPlan(
                    id=p["id"],
                    name=p["name"],
                    description=p["description"],
                    price=p["price"],
                    icon=p["icon"],
                    is_active=True
                )
                db.add(plan_obj)
            else:
                existing_plan.name = p["name"]
                existing_plan.description = p["description"]
                existing_plan.icon = p["icon"]
        db.commit()

        # 5. Seed System Settings (UPI QR, UPI ID, Instructions, Admin Email)
        default_settings = [
            ("upi_id", "gauravhandge@oksbi", "Configured UPI ID for payments"),
            ("upi_qr_url", "/static/assets/qr/upi_qr.jpg", "Path to configured UPI QR Code image"),
            ("admin_notify_email", "gaurav@algoverse.io", "Administrator notification email address"),
            ("smtp_from_email", "noreply@algoverse.io", "Sender email address for notifications"),
            ("payment_instructions", "1. Scan the QR code using any UPI app (GPay/PhonePe/Paytm).\n2. Pay the exact amount.\n3. Enter the UPI Transaction ID below and click Verify.", "User payment instructions")
        ]

        for key, val, desc in default_settings:
            setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
            if not setting:
                db.add(SystemSetting(key=key, value=val, description=desc))
        db.commit()

        # 6. Flag Introductory Free Previews
        free_algo_ids = [
            "simple_rag",        # AI Free Preview
            "bubble_sort",       # DSA Free Preview
            "binary_search",     # DSA Free Preview
            "linear_search",     # DSA Free Preview
            "linear_regression", # ML Free Preview
            "knn",               # ML Free Preview
            "caesar_cipher"      # Cybersecurity Free Preview
        ]

        # Reset all to False, then set Free Previews
        db.query(Algorithm).update({"is_free_preview": False})
        db.query(Algorithm).filter(Algorithm.id.in_(free_algo_ids)).update({"is_free_preview": True}, synchronize_session=False)
        db.commit()
        print("[Database] Freemium/Premium content flags configured successfully.")

    except Exception as e:
        print(f"[Payment System Init Error] {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_and_seed_payment_system()

