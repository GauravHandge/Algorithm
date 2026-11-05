import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.database import SessionLocal
from backend.auth.models import User

class TestAuthenticationAPI(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        self.db = SessionLocal()
        # Clean test user if exists
        self.db.query(User).filter(User.email == "testuser@algoverse.io").delete()
        self.db.commit()

    def tearDown(self):
        self.db.query(User).filter(User.email == "testuser@algoverse.io").delete()
        self.db.commit()
        self.db.close()

    def test_01_register_new_user(self):
        """Test registration creates new user with hashed password in database."""
        response = self.client.post("/api/auth/register", json={
            "name": "Test Learner",
            "email": "testuser@algoverse.io",
            "password": "strongPassword123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["email"], "testuser@algoverse.io")
        self.assertIn("token", data)

        # Verify in database
        db_user = self.db.query(User).filter(User.email == "testuser@algoverse.io").first()
        self.assertIsNotNone(db_user)
        self.assertNotEqual(db_user.hashed_password, "strongPassword123")
        self.assertIsNotNone(db_user.salt)

    def test_02_register_duplicate_email_fails(self):
        """Test registering already registered email returns 400 error."""
        # First registration
        self.client.post("/api/auth/register", json={
            "name": "Test Learner",
            "email": "testuser@algoverse.io",
            "password": "strongPassword123"
        })
        # Duplicate registration
        response = self.client.post("/api/auth/register", json={
            "name": "Test Learner 2",
            "email": "testuser@algoverse.io",
            "password": "differentPassword"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("already exists", response.json()["detail"].lower())

    def test_03_login_unregistered_email_fails(self):
        """Test login with non-existent email returns 404 error."""
        response = self.client.post("/api/auth/login", json={
            "email": "ghost_unknown_user_999@algoverse.io",
            "password": "password123"
        })
        self.assertEqual(response.status_code, 404)
        self.assertIn("not found", response.json()["detail"].lower())

    def test_04_login_wrong_password_fails(self):
        """Test login with wrong password returns 401 error."""
        # Register user
        self.client.post("/api/auth/register", json={
            "name": "Test Learner",
            "email": "testuser@algoverse.io",
            "password": "correctPassword123"
        })
        # Try logging in with wrong password
        response = self.client.post("/api/auth/login", json={
            "email": "testuser@algoverse.io",
            "password": "WRONG_PASSWORD_XYZ"
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn("incorrect password", response.json()["detail"].lower())

    def test_05_login_success(self):
        """Test successful login with registered credentials."""
        # Register user
        self.client.post("/api/auth/register", json={
            "name": "Test Learner",
            "email": "testuser@algoverse.io",
            "password": "correctPassword123"
        })
        # Login
        response = self.client.post("/api/auth/login", json={
            "email": "testuser@algoverse.io",
            "password": "correctPassword123"
        })
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["user"]["name"], "Test Learner")
        self.assertIn("token", data)

if __name__ == "__main__":
    unittest.main()

