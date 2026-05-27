"""
AgroConnect - Auth Routes
POST /register  →  create new user
POST /login     →  return JWT token
"""
import secrets
from google.oauth2 import id_token
from google.auth.transport import requests
from fastapi.concurrency import run_in_threadpool
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password, create_access_token
from app.db.database import get_db
from app.models.user import User
from app.schemas.user import UserRegister, UserLogin, GoogleLoginRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Register a new FARMER or BUYER account."""
    # Check uniqueness
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=payload.role,
        phone=payload.phone,
        location=payload.location,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate via Google ID token, find or create the user, and return JWT."""
    id_credential = payload.credential

    client_id = settings.google_client_id
    if not client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google Client ID is not configured on the server"
        )

    try:
        # Run Google token verification in a thread pool to avoid blocking the event loop.
        # This checks signatures, issuer, and expiration, and verifies the client ID.
        google_payload = await run_in_threadpool(
            id_token.verify_oauth2_token,
            id_credential,
            requests.Request(),
            client_id
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Google authentication failed: {str(e)}"
        )

    email = google_payload.get("email")
    name = google_payload.get("name") or (email.split("@")[0] if email else "Google User")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account does not provide email address"
        )

    # 3. Find or create user in DB
    user = db.query(User).filter(User.email == email).first()

    if not user:
        # Create a new user with random password
        random_password = secrets.token_urlsafe(24)
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(random_password),
            role=payload.role,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account disabled"
        )

    # 4. Generate JWT access token and return
    token = create_access_token({"sub": user.email, "role": user.role})
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))
