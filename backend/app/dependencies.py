"""
FastAPI dependencies — authentication guards and role checks.
"""
from dataclasses import dataclass

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, UserRole
from app.security import decode_token

bearer_scheme = HTTPBearer()


@dataclass
class TokenUser:
    """Lightweight user object decoded directly from the JWT — zero DB queries.
    
    Exposes .id and .role so all existing router code (current_user.id,
    current_user.role) works without modification.
    """
    id: int
    role: str


def _decode_or_401(credentials: HTTPAuthorizationCredentials) -> object:
    """Shared helper: decode JWT or raise 401."""
    token_data = decode_token(credentials.credentials)
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token_data


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Full auth: validate token AND verify user still exists/is active in DB.
    
    Use this only when you genuinely need the full SQLAlchemy User row
    (e.g. /auth/me, admin routes). For role-gated endpoints prefer
    require_company / require_student which skip the extra DB round-trip.
    """
    token_data = _decode_or_401(credentials)
    user = db.query(User).filter(User.id == token_data.user_id, User.is_active == True).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user


def require_student(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenUser:
    """Validate JWT and assert role == student — NO database query."""
    token_data = _decode_or_401(credentials)
    if token_data.role != UserRole.student.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Students only.")
    return TokenUser(id=token_data.user_id, role=token_data.role)


def require_company(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenUser:
    """Validate JWT and assert role == company — NO database query."""
    token_data = _decode_or_401(credentials)
    if token_data.role != UserRole.company.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Companies only.")
    return TokenUser(id=token_data.user_id, role=token_data.role)


def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> TokenUser:
    """Validate JWT and assert role == admin — NO database query."""
    token_data = _decode_or_401(credentials)
    if token_data.role != UserRole.admin.value:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admins only.")
    return TokenUser(id=token_data.user_id, role=token_data.role)
