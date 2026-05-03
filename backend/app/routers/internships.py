"""
Internship CRUD routes.
"""
import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_company
from app.models import Application, Company, Internship, InternshipStatus, User
from app.schemas import (
    InternshipCreate,
    InternshipListOut,
    InternshipOut,
    InternshipUpdate,
    MessageResponse,
)

router = APIRouter(prefix="/internships", tags=["Internships"])


def _get_internship_or_404(internship_id: int, db: Session) -> Internship:
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found.")
    return internship


def _enrich_with_count(items: list[Internship], db: Session) -> list[dict]:
    """Attach applicant count to each internship dict."""
    result = []
    for item in items:
        count = db.query(func.count(Application.id)).filter(Application.internship_id == item.id).scalar()
        d = {col.name: getattr(item, col.name) for col in item.__table__.columns}
        d["applicant_count"] = count or 0
        if item.company:
            d["company"] = {
                "user_id": item.company.user_id,
                "company_name": item.company.company_name,
                "industry": item.company.industry,
                "logo_url": item.company.logo_url
            }
        result.append(d)
    return result


# ─── Public / Student browsing ────────────────────────────────

@router.get("/", response_model=list[InternshipListOut])
def list_internships(
    search: str | None = Query(None, description="Search in title, location, skills"),
    location: str | None = Query(None),
    industry: str | None = Query(None),
    work_type: str | None = Query(None),
    eligibility: str | None = Query(None),
    sort: str | None = Query("newest", description="Sort by newest, deadline, or stipend-high"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Browse active internship listings with optional full-text search & filters."""
    query = (
        db.query(Internship)
        .join(Company, Internship.company_id == Company.user_id)
        .filter(Internship.status == InternshipStatus.active)
    )

    if search:
        like = f"%{search}%"
        query = query.filter(
            or_(
                Internship.title.ilike(like),
                Internship.location.ilike(like),
                Internship.description.ilike(like),
                Internship.skills.ilike(like),
            )
        )
    if location:
        query = query.filter(Internship.location.ilike(f"%{location}%"))
    if industry:
        query = query.filter(Company.industry.ilike(f"%{industry}%"))
    if work_type:
        query = query.filter(Internship.work_type == work_type)
    if eligibility:
        query = query.filter(Internship.eligibility == eligibility)

    if sort == "deadline":
        query = query.order_by(Internship.deadline.asc())
    elif sort == "stipend-high":
        # Stipend is a string like "RM 1,200/mo". Simple desc string sort is a decent approximation 
        # or we could try to cast but SQLite/MySQL handle string casting differently.
        query = query.order_by(Internship.stipend.desc())
    else:
        query = query.order_by(Internship.created_at.desc())

    items = query.offset(skip).limit(limit).all()
    return _enrich_with_count(items, db)


@router.get("/{internship_id}", response_model=InternshipOut)
def get_internship(
    internship_id: int,
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_internship_or_404(internship_id, db)


# ─── Company management ───────────────────────────────────────

@router.post("/", response_model=InternshipOut, status_code=status.HTTP_201_CREATED)
def create_internship(
    payload: InternshipCreate,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found.")

    internship = Internship(
        company_id=current_user.id,
        **{
            **payload.model_dump(exclude={"skills"}),
            "skills": json.dumps(payload.skills or []),
        },
    )
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return internship


@router.put("/{internship_id}", response_model=InternshipOut)
def update_internship(
    internship_id: int,
    payload: InternshipUpdate,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    internship = _get_internship_or_404(internship_id, db)
    if internship.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your internship listing.")

    update_data = payload.model_dump(exclude_unset=True)
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = json.dumps(update_data["skills"])

    for field, value in update_data.items():
        setattr(internship, field, value)

    db.commit()
    db.refresh(internship)
    return internship


@router.delete("/{internship_id}", response_model=MessageResponse)
def delete_internship(
    internship_id: int,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    internship = _get_internship_or_404(internship_id, db)
    if internship.company_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your internship listing.")
    db.delete(internship)
    db.commit()
    return MessageResponse(message="Internship deleted successfully.")


@router.get("/company/my-listings", response_model=list[InternshipListOut])
def my_listings(
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Get all internships posted by the logged-in company."""
    items = (
        db.query(Internship)
        .filter(Internship.company_id == current_user.id)
        .order_by(Internship.created_at.desc())
        .all()
    )
    return _enrich_with_count(items, db)
