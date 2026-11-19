"""Auth router: signup, login, me."""

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# --- Request/Response schemas ---

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str | None = None
    full_name: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class UserBrief(BaseModel):
    id: str
    email: str
    name: str | None = None
    full_name: str | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserBrief
    user_id: str
    email: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str | None = None
    full_name: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Helpers ---

def _create_token(user_id: str, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expire,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


# --- Endpoints ---

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    """Register a new user."""
    normalized_email = body.email.strip().lower()
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    display_name = body.name or body.full_name or normalized_email.split("@")[0]
    user = User(
        email=normalized_email,
        hashed_password=pwd_context.hash(body.password),
        full_name=display_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    user_brief = UserBrief(
        id=user.id,
        email=user.email,
        name=user.full_name,
        full_name=user.full_name,
    )
    token = _create_token(user.id, user.email)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_brief,
        user_id=user.id,
        email=user.email,
    )


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    """Login and return JWT."""
    normalized_email = body.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not pwd_context.verify(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_brief = UserBrief(
        id=user.id,
        email=user.email,
        name=user.full_name or user.email.split("@")[0],
        full_name=user.full_name,
    )
    token = _create_token(user.id, user.email)
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=user_brief,
        user_id=user.id,
        email=user.email,
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Get current user info."""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.full_name or current_user.email.split("@")[0],
        full_name=current_user.full_name,
        created_at=current_user.created_at,
    )
