"""
Company profile routes.
"""
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user, require_company
from app.models import Company, User
from app.schemas import CompanyProfileOut, CompanyProfileUpdate, MessageResponse

router = APIRouter(prefix="/companies", tags=["Companies"])
settings = get_settings()


def _get_company_or_404(user_id: int, db: Session) -> Company:
    company = db.query(Company).filter(Company.user_id == user_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found.")
    return company


@router.get("/", response_model=list[CompanyProfileOut])
def list_companies(
    skip: int = 0,
    limit: int = 20,
    industry: str | None = None,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Browse all verified companies (student directory)."""
    query = db.query(Company).filter(Company.verified == True)
    if industry:
        query = query.filter(Company.industry.ilike(f"%{industry}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/me", response_model=CompanyProfileOut)
def get_my_company(current_user: User = Depends(require_company), db: Session = Depends(get_db)):
    return _get_company_or_404(current_user.id, db)


@router.put("/me", response_model=CompanyProfileOut)
def update_my_company(
    payload: CompanyProfileUpdate,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    company = _get_company_or_404(current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company


@router.post("/me/upload-logo", response_model=MessageResponse)
async def upload_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Upload company logo (PNG/JPG, max 2 MB)."""
    allowed = {".png", ".jpg", ".jpeg", ".webp"}
    ext = Path(file.filename).suffix.lower() if file.filename else ""
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="Only PNG/JPG/WEBP images accepted.")

    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Logo exceeds 2 MB limit.")

    upload_dir = Path(settings.UPLOAD_DIR) / "logos"
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"logo_{current_user.id}{ext}"
    (upload_dir / filename).write_bytes(contents)

    company = _get_company_or_404(current_user.id, db)
    company.logo_url = f"/uploads/logos/{filename}"
    db.commit()

    return MessageResponse(message="Logo uploaded successfully.")


@router.get("/{user_id}", response_model=CompanyProfileOut)
def get_company(user_id: int, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_company_or_404(user_id, db)
