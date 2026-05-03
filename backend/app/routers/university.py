"""
University routes — dashboard, student tracking, and profile management.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import get_current_user, require_university
from app.models import (
    Application, ApplicationStatus, Company, Internship,
    Student, University, User, UserRole,
)
from app.schemas import (
    MessageResponse,
    UniversityProfileOut,
    UniversityProfileUpdate,
    UniversityStudentOut,
)

router = APIRouter(prefix="/university", tags=["University"])


def _get_university_or_404(user_id: int, db: Session) -> University:
    uni = db.query(University).filter(University.user_id == user_id).first()
    if not uni:
        raise HTTPException(status_code=404, detail="University profile not found.")
    return uni


# ─── Profile endpoints ────────────────────────────────────────

@router.get("/me", response_model=UniversityProfileOut)
def get_my_profile(current_user=Depends(require_university), db: Session = Depends(get_db)):
    """Get the logged-in university's profile."""
    return _get_university_or_404(current_user.id, db)


@router.put("/me", response_model=UniversityProfileOut)
def update_my_profile(
    payload: UniversityProfileUpdate,
    current_user=Depends(require_university),
    db: Session = Depends(get_db),
):
    """Update the university's profile."""
    uni = _get_university_or_404(current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(uni, field, value)
    db.commit()
    db.refresh(uni)
    return uni


# ─── Student tracking endpoints ───────────────────────────────

@router.get("/students", response_model=list[UniversityStudentOut])
def get_my_students(
    search_student_id: str | None = Query(None, description="Filter by student ID number"),
    search_name: str | None = Query(None, description="Filter by student name"),
    current_user=Depends(require_university),
    db: Session = Depends(get_db),
):
    """
    Get all accepted students whose email domain matches this university.
    Returns their internship progress, rating, and company comments.
    """
    uni = _get_university_or_404(current_user.id, db)
    email_domain = uni.email_domain  # e.g. "mmu.edu.my"

    # Build query: find all users with matching email domain AND student role
    student_query = (
        db.query(Student)
        .join(User, Student.user_id == User.id)
        .filter(
            User.role == UserRole.student,
            User.email.like(f"%@{email_domain}"),
        )
    )

    if search_student_id:
        student_query = student_query.filter(Student.student_id.like(f"%{search_student_id}%"))
    if search_name:
        student_query = student_query.filter(User.name.like(f"%{search_name}%"))

    students = student_query.all()

    results = []
    for student in students:
        # Get accepted applications only
        accepted_apps = (
            db.query(Application)
            .join(Internship, Application.internship_id == Internship.id)
            .join(Company, Internship.company_id == Company.user_id)
            .filter(
                Application.student_id == student.user_id,
                Application.status == ApplicationStatus.accepted,
            )
            .options(
                joinedload(Application.internship).joinedload(Internship.company)
            )
            .all()
        )

        if not accepted_apps:
            continue  # Only show students with at least one accepted application

        for app in accepted_apps:
            internship = app.internship
            company = internship.company

            results.append(UniversityStudentOut(
                student_user_id=student.user_id,
                student_name=student.user.name,
                student_email=student.user.email,
                student_id_number=student.student_id,
                major=student.major,
                cgpa=student.cgpa,
                cv_url=student.cv_url,
                application_id=app.id,
                internship_title=internship.title,
                company_name=company.company_name,
                company_user_id=company.user_id,
                application_status=app.status.value,
                applied_at=app.applied_at,
                internship_start_date=app.start_date or internship.start_date,
                internship_end_date=app.end_date,
                months_completed=app.months_completed,
                rating=app.rating,
                company_comment=app.company_comment,
            ))

    return results
