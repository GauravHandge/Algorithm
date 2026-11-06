import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.database import SessionLocal
from backend.auth.models import User
from backend.payment.models import SubjectPlan, Purchase, UserSubjectAccess, EmailNotification
from backend.payment.init_plans import migrate_and_seed_payment_system

class TestMonetizationPlatform(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Seed default plans and settings
        migrate_and_seed_payment_system()

    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()

        # Clean test users
        self.test_user_email = "student_monetize_test@algoverse.io"
        self.friend_user_email = "friend_monetize_test@algoverse.io"
        self.admin_user_email = "admin_monetize_test@algoverse.io"

        for em in [self.test_user_email, self.friend_user_email, self.admin_user_email]:
            self.db.query(EmailNotification).filter(EmailNotification.recipient_email == em).delete()
            u = self.db.query(User).filter(User.email == em).first()
            if u:
                self.db.query(UserSubjectAccess).filter(UserSubjectAccess.user_id == u.id).delete()
                self.db.query(Purchase).filter(Purchase.user_id == u.id).delete()
                self.db.delete(u)
        self.db.commit()

        # Create standard test user
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Monetization Student",
            "email": self.test_user_email,
            "password": "secureStudentPass123"
        })
        self.user_token = reg_res.json()["token"]
        self.user_id = reg_res.json()["user"]["id"]

        # Create admin user
        admin_res = self.client.post("/api/auth/register", json={
            "name": "Platform Admin",
            "email": self.admin_user_email,
            "password": "adminSecretPass123"
        })
        self.admin_token = admin_res.json()["token"]
        self.admin_id = admin_res.json()["user"]["id"]
        
        # Grant admin rights in db
        db_admin = self.db.query(User).filter(User.id == self.admin_id).first()
        db_admin.is_admin = True
        db_admin.role = "Admin"
        self.db.commit()

    def tearDown(self):
        for em in [self.test_user_email, self.friend_user_email, self.admin_user_email]:
            self.db.query(EmailNotification).filter(EmailNotification.recipient_email == em).delete()
            u = self.db.query(User).filter(User.email == em).first()
            if u:
                self.db.query(UserSubjectAccess).filter(UserSubjectAccess.user_id == u.id).delete()
                self.db.query(Purchase).filter(Purchase.user_id == u.id).delete()
                self.db.delete(u)
        self.db.commit()
        self.db.close()

    def test_01_free_preview_content_accessible(self):
        """Test 1: Free preview algorithms (e.g. bubble_sort) are accessible without payment."""
        res = self.client.get(
            "/api/algorithms/bubble_sort",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["algorithm"]["id"], "bubble_sort")
        self.assertTrue(data["algorithm"]["is_free_preview"])

    def test_02_premium_algorithm_locked_for_unpurchased_user(self):
        """Test 2: Unpurchased user accessing premium AI algorithm receives 403 Forbidden."""
        res = self.client.get(
            "/api/algorithms/a_star",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(res.status_code, 403)
        detail = res.json()["detail"]
        self.assertEqual(detail["error"], "PREMIUM_LOCKED")
        self.assertEqual(detail["subject_id"], "ai")

    def test_03_submit_dsa_purchase_order_creates_pending_record(self):
        """Test 3: User submits DSA purchase request for ₹40 -> order created with status PENDING."""
        order_res = self.client.post(
            "/api/payment/order",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={
                "subject_id": "dsa",
                "upi_ref_id": "UPI_REF_9876543210"
            }
        )
        self.assertEqual(order_res.status_code, 200)
        data = order_res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["purchase"]["status"], "PENDING")
        self.assertEqual(data["purchase"]["subject_id"], "dsa")
        self.assertEqual(data["purchase"]["amount"], 40)

        # Content should still be locked while pending
        locked_check = self.client.get(
            "/api/algorithms/bfs",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(locked_check.status_code, 403)

    def test_04_admin_approves_payment_unlocks_subject(self):
        """Test 4: Admin approves DSA payment -> DSA content automatically becomes accessible."""
        # 1. Submit purchase
        order_res = self.client.post(
            "/api/payment/order",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={
                "subject_id": "dsa",
                "upi_ref_id": "UPI_REF_APPROVE_12345"
            }
        )
        self.assertEqual(order_res.status_code, 200)
        purchase_id = order_res.json()["purchase"]["id"]

        # 2. Admin approves
        approve_res = self.client.post(
            "/api/admin/purchases/approve",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={
                "purchase_id": purchase_id,
                "admin_notes": "Verified in SBI UPI Bank feed"
            }
        )
        self.assertEqual(approve_res.status_code, 200)
        self.assertTrue(approve_res.json()["success"])

        # 3. User now has full access to DSA algorithm
        dsa_access_res = self.client.get(
            "/api/algorithms/bfs",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(dsa_access_res.status_code, 200)
        self.assertTrue(dsa_access_res.json()["success"])

    def test_05_purchasing_dsa_leaves_ai_locked(self):
        """Test 5: Subject isolation: purchasing DSA does NOT unlock AI or other subjects."""
        # Give user DSA access
        order_res = self.client.post(
            "/api/payment/order",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={"subject_id": "dsa", "upi_ref_id": "UPI_REF_ISOLATION_77"}
        )
        self.assertEqual(order_res.status_code, 200)
        purchase_id = order_res.json()["purchase"]["id"]

        self.client.post(
            "/api/admin/purchases/approve",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={"purchase_id": purchase_id}
        )

        # AI remains 403 locked
        ai_res = self.client.get(
            "/api/algorithms/a_star",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(ai_res.status_code, 403)
        self.assertEqual(ai_res.json()["detail"]["subject_id"], "ai")

    def test_06_admin_grants_free_access_to_friend(self):
        """Test 6: Admin grants ML access to friend via email -> ML becomes accessible without payment."""
        # Register friend
        friend_res = self.client.post("/api/auth/register", json={
            "name": "Close Friend",
            "email": self.friend_user_email,
            "password": "friendPassword123"
        })
        friend_token = friend_res.json()["token"]

        # Admin grants free ML access
        grant_res = self.client.post(
            "/api/admin/access/grant-free",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={
                "user_email": self.friend_user_email,
                "subject_id": "ml",
                "reason": "College classmate / friend"
            }
        )
        self.assertEqual(grant_res.status_code, 200)
        self.assertTrue(grant_res.json()["success"])

        # Check DB record shows ADMIN_GRANTED using a fresh session
        check_db = SessionLocal()
        friend_user = check_db.query(User).filter(User.email == self.friend_user_email).first()
        access_rec = check_db.query(UserSubjectAccess).filter(
            UserSubjectAccess.user_id == friend_user.id,
            UserSubjectAccess.subject_id == "ml"
        ).first()
        self.assertIsNotNone(access_rec)
        self.assertEqual(access_rec.access_source, "ADMIN_GRANTED")
        self.assertEqual(access_rec.status, "ACTIVE")
        check_db.close()

        # Friend can now access premium ML algorithm
        ml_res = self.client.get(
            "/api/algorithms/kmeans",
            headers={"Authorization": f"Bearer {friend_token}"}
        )
        self.assertEqual(ml_res.status_code, 200)

    def test_07_admin_revokes_access(self):
        """Test 7: Admin revokes access -> content is locked again (403)."""
        # Grant access first
        self.client.post(
            "/api/admin/access/grant-free",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={"user_email": self.test_user_email, "subject_id": "cybersecurity", "reason": "Test grant"}
        )
        # Verify access active on premium cybersecurity algorithm 'rsa'
        cyber_res = self.client.get(
            "/api/algorithms/rsa",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(cyber_res.status_code, 200)

        # Admin revokes
        revoke_res = self.client.post(
            "/api/admin/access/revoke",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={"user_email": self.test_user_email, "subject_id": "cybersecurity", "reason": "Test revocation"}
        )
        self.assertEqual(revoke_res.status_code, 200)

        # Verify content is locked again
        cyber_res_after = self.client.get(
            "/api/algorithms/rsa",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(cyber_res_after.status_code, 403)

    def test_08_non_admin_cannot_access_admin_routes(self):
        """Test 8: Non-admin user cannot access admin routes (403 Forbidden)."""
        res = self.client.get(
            "/api/admin/overview",
            headers={"Authorization": f"Bearer {self.user_token}"}
        )
        self.assertEqual(res.status_code, 403)
        self.assertIn("Administrator privileges required", res.json()["detail"])

    def test_09_duplicate_payment_webhook_prevents_duplicate_grants(self):
        """Test 9: Duplicate payment webhook / submission does not create duplicate active access."""
        # 1. Create order
        order_res = self.client.post(
            "/api/payment/order",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={"subject_id": "cybersecurity", "upi_ref_id": "UPI_WEBHOOK_DUP_01"}
        )
        self.assertEqual(order_res.status_code, 200)
        order_id = order_res.json()["purchase"]["order_id"]

        # 2. First webhook call
        wh1 = self.client.post(
            "/api/payment/webhook",
            json={"order_id": order_id, "status": "SUCCESS"}
        )
        self.assertEqual(wh1.status_code, 200)

        # 3. Second identical webhook call (idempotent)
        wh2 = self.client.post(
            "/api/payment/webhook",
            json={"order_id": order_id, "status": "SUCCESS"}
        )
        self.assertEqual(wh2.status_code, 200)
        self.assertIn("already verified", wh2.json()["message"].lower())

        # Check total active access records for this subject is exactly 1
        check_db = SessionLocal()
        count = check_db.query(UserSubjectAccess).filter(
            UserSubjectAccess.user_id == self.user_id,
            UserSubjectAccess.subject_id == "cybersecurity",
            UserSubjectAccess.status == "ACTIVE"
        ).count()
        self.assertEqual(count, 1)
        check_db.close()

    def test_10_email_notification_logs_created(self):
        """Test 10: Email notifications are logged to database for payment approvals and free gifts."""
        # Grant free access to friend
        self.client.post(
            "/api/admin/access/grant-free",
            headers={"Authorization": f"Bearer {self.admin_token}"},
            json={"user_email": self.test_user_email, "subject_id": "ai", "reason": "Friend bonus"}
        )
        check_db = SessionLocal()
        email_log = check_db.query(EmailNotification).filter(
            EmailNotification.recipient_email == self.test_user_email,
            EmailNotification.email_type == "FREE_ACCESS_GRANTED"
        ).order_by(EmailNotification.id.desc()).first()
        self.assertIsNotNone(email_log)
        self.assertIn("Artificial Intelligence", email_log.body)
        check_db.close()

    def test_11_existing_algorithms_execution_preserved(self):
        """Test 11: Existing algorithms and simulations continue to execute without breaking."""
        exec_res = self.client.post(
            "/api/algorithms/bubble_sort/execute",
            headers={"Authorization": f"Bearer {self.user_token}"},
            json={"input_data": {"array": [5, 2, 8, 1, 9]}}
        )
        self.assertEqual(exec_res.status_code, 200)
        data = exec_res.json()
        self.assertTrue(data["success"])
        self.assertTrue(len(data["steps"]) > 0)

if __name__ == "__main__":
    unittest.main()
