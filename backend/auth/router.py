from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from backend.database.database import get_db, Base, engine
from backend.auth.models import User
from backend.auth.schemas import UserRegisterRequest, UserLoginRequest, AuthResponse, UserResponse
from backend.auth.security import hash_password, verify_password, create_auth_token, verify_auth_token

# Ensure users table is created
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/api/auth", tags=["Authentication & Authorization"])

def seed_default_user_if_needed(db: Session):
    """Ensure demo user exists in database for testing."""
    existing = db.query(User).filter(User.email == "gaurav@algoverse.io").first()
    if not existing:
        hashed, salt = hash_password("algoverse123")
        demo_user = User(
            name="Gaurav Handge",
            email="gaurav@algoverse.io",
            hashed_password=hashed,
            salt=salt,
            role="Pro Developer",
            avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
        )
        db.add(demo_user)
        db.commit()

@router.post("/register", response_model=AuthResponse)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Check if email already registered
    email_clean = req.email.strip().lower()
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in."
        )

    # 2. Validate password strength
    if len(req.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    # 3. Hash password with unique salt
    hashed_pwd, salt = hash_password(req.password)

    # 4. Create and persist user
    new_user = User(
        name=req.name.strip(),
        email=email_clean,
        hashed_password=hashed_pwd,
        salt=salt,
        role="Learner",
        avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 5. Generate signed auth token
    token = create_auth_token(new_user.id, new_user.email)

    return AuthResponse(
        success=True,
        message="Account created successfully!",
        user=UserResponse(
            id=new_user.id,
            name=new_user.name,
            email=new_user.email,
            role=new_user.role,
            avatar=new_user.avatar
        ),
        token=token
    )

@router.post("/login", response_model=AuthResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    seed_default_user_if_needed(db)
    email_clean = req.email.strip().lower()

    # 1. Check if user exists in database
    user = db.query(User).filter(User.email == email_clean).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found. No user is registered with this email. Please create an account first."
        )

    # 2. Check password verification
    if not verify_password(req.password, user.hashed_password, user.salt):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. Please verify your password and try again."
        )

    # 3. Successful authentication
    token = create_auth_token(user.id, user.email)
    return AuthResponse(
        success=True,
        message="Sign in successful!",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar
        ),
        token=token
    )

@router.get("/me", response_model=AuthResponse)
def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")
    
    token = authorization.split(" ")[1]
    payload = verify_auth_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Session expired or invalid token. Please sign in again.")

    user = db.query(User).filter(User.id == payload.get("sub")).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account no longer exists.")

    return AuthResponse(
        success=True,
        message="Authenticated",
        user=UserResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            role=user.role,
            avatar=user.avatar
        ),
        token=token
    )
