import hashlib
import secrets
import base64
import time
import json

def hash_password(password: str, salt: str = None) -> tuple[str, str]:
    """Hashes password with SHA-256 and unique cryptographic salt."""
    if not salt:
        salt = secrets.token_hex(16)
    salted = (password + salt).encode('utf-8')
    hashed = hashlib.sha256(salted).hexdigest()
    return hashed, salt

def verify_password(password: str, hashed_password: str, salt: str) -> bool:
    """Verifies that the provided plain password matches the stored hash."""
    hashed, _ = hash_password(password, salt)
    return secrets.compare_digest(hashed, hashed_password)

def create_auth_token(user_id: int, email: str) -> str:
    """Generates a signed authentication token with expiration."""
    payload = {
        "sub": user_id,
        "email": email,
        "iat": int(time.time()),
        "exp": int(time.time()) + 86400 * 7 # 7 days validity
    }
    raw = json.dumps(payload).encode('utf-8')
    token_b64 = base64.urlsafe_b64encode(raw).decode('utf-8')
    sig = hashlib.sha256((token_b64 + "algoverse_secret_key_2026").encode('utf-8')).hexdigest()[:16]
    return f"{token_b64}.{sig}"

def verify_auth_token(token: str) -> dict | None:
    """Validates token signature and expiration."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        token_b64, sig = parts
        expected_sig = hashlib.sha256((token_b64 + "algoverse_secret_key_2026").encode('utf-8')).hexdigest()[:16]
        if not secrets.compare_digest(sig, expected_sig):
            return None
        raw = base64.urlsafe_b64decode(token_b64.encode('utf-8'))
        payload = json.loads(raw)
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

