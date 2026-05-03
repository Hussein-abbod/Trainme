"""
Authentication routes: register (student/company/university), login, me.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Company, Student, University, User, UserRole
from app.schemas import (
    CompanyRegisterRequest,
    LoginRequest,
    StudentRegisterRequest,
    TokenResponse,
    UniversityRegisterRequest,
    UserOut,
)
from app.security import create_access_token, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register/student", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_student(payload: StudentRegisterRequest, db: Session = Depends(get_db)):
    """Register a new student account."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        role=UserRole.student,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()  # get the user.id without committing

    student = Student(user_id=user.id, university=payload.university, student_id=payload.student_id)
    db.add(student)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, name=user.name)


@router.post("/register/company", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_company(payload: CompanyRegisterRequest, db: Session = Depends(get_db)):
    """Register a new company account."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    user = User(
        role=UserRole.company,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    company = Company(
        user_id=user.id,
        company_name=payload.company_name,
        ssm_number=payload.ssm_number,
        industry=payload.industry,
    )
    db.add(company)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, name=user.name)


@router.post("/register/university", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_university(payload: UniversityRegisterRequest, db: Session = Depends(get_db)):
    """Register a new university account."""
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Ensure the email_domain is unique
    domain = payload.email_domain.lower().strip()
    if db.query(University).filter(University.email_domain == domain).first():
        raise HTTPException(status_code=400, detail="A university with this email domain is already registered.")

    user = User(
        role=UserRole.university,
        name=payload.name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    university = University(
        user_id=user.id,
        uni_name=payload.uni_name,
        email_domain=domain,
        website=payload.website,
        address=payload.address,
    )
    db.add(university)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, name=user.name)


@router.get("/universities", response_model=list[dict])
def list_universities(db: Session = Depends(get_db)):
    """Public endpoint: list all registered universities (for student registration dropdown)."""
    unis = db.query(University).all()
    return [
        {
            "uni_name": u.uni_name,
            "email_domain": u.email_domain,
        }
        for u in unis
    ]


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT access token."""
    user = db.query(User).filter(User.email == payload.email, User.is_active == True).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return TokenResponse(access_token=token, role=user.role, user_id=user.id, name=user.name)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the currently authenticated user's details."""
    return current_user
