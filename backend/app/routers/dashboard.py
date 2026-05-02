"""
Company dashboard metrics route.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_company
from app.models import Application, ApplicationStatus, Internship, InternshipStatus, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/company")
def company_dashboard(
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Return aggregated metrics for the company dashboard."""
    active_listings = db.query(func.count(Internship.id)).filter(
        Internship.company_id == current_user.id,
        Internship.status == InternshipStatus.active,
    ).scalar()

    total_applicants = (
        db.query(func.count(Application.id))
        .join(Internship, Application.internship_id == Internship.id)
        .filter(Internship.company_id == current_user.id)
        .scalar()
    )

    pending_reviews = (
        db.query(func.count(Application.id))
        .join(Internship, Application.internship_id == Internship.id)
        .filter(
            Internship.company_id == current_user.id,
            Application.status == ApplicationStatus.pending,
        )
        .scalar()
    )

    return {
        "active_listings": active_listings or 0,
        "total_applicants": total_applicants or 0,
        "pending_reviews": pending_reviews or 0,
    }
