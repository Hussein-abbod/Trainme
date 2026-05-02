"""
Company dashboard metrics route.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_company
from app.models import Application, ApplicationStatus, Internship, InternshipStatus, User, Student
from sqlalchemy.orm import joinedload

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/company")
def company_dashboard(
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Return aggregated metrics for the company dashboard."""
    active_internships = db.query(func.count(Internship.id)).filter(
        Internship.company_id == current_user.id,
        Internship.status == InternshipStatus.active,
    ).scalar()

    total_internships = db.query(func.count(Internship.id)).filter(
        Internship.company_id == current_user.id
    ).scalar()

    total_applications = (
        db.query(func.count(Application.id))
        .join(Internship, Application.internship_id == Internship.id)
        .filter(Internship.company_id == current_user.id)
        .scalar()
    )

    recent_apps = (
        db.query(Application)
        .join(Internship, Application.internship_id == Internship.id)
        .filter(Internship.company_id == current_user.id)
        .options(
            joinedload(Application.internship),
            joinedload(Application.student).joinedload(Student.user)
        )
        .order_by(Application.applied_at.desc())
        .limit(5)
        .all()
    )

    # Manually serialize to prevent DetachedInstanceError or Pydantic validation issues
    recent_applications = []
    for app in recent_apps:
        student_name = "Unknown"
        if app.student and app.student.user:
            student_name = app.student.user.name

        recent_applications.append({
            "id": app.id,
            "status": app.status.value if hasattr(app.status, 'value') else app.status,
            "applied_at": app.applied_at.isoformat(),
            "internship": {"title": app.internship.title} if app.internship else {},
            "student": {"user": {"name": student_name}}
        })

    return {
        "active_internships": active_internships or 0,
        "total_internships": total_internships or 0,
        "total_applications": total_applications or 0,
        "recent_applications": recent_applications,
    }
