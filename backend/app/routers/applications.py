"""
Application routes — students apply, companies manage pipeline.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_company, require_student
from app.models import (
    Application, ApplicationStatus, Internship,
    InternshipStatus, Notification, NotificationType, Student, User,
)
from app.schemas import (
    ApplicationCreate, ApplicationOut, ApplicationStatusUpdate,
    ApplicantOut, MessageResponse,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


def _create_notification(db: Session, user_id: int, notif_type: NotificationType, title: str, message: str):
    notif = Notification(user_id=user_id, type=notif_type, title=title, message=message)
    db.add(notif)


# ─── Student endpoints ────────────────────────────────────────

@router.post("/", response_model=ApplicationOut, status_code=status.HTTP_201_CREATED)
def apply_to_internship(
    payload: ApplicationCreate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student applies to an internship."""
    internship = db.query(Internship).filter(
        Internship.id == payload.internship_id,
        Internship.status == InternshipStatus.active,
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found or not active.")

    existing = db.query(Application).filter(
        Application.student_id == current_user.id,
        Application.internship_id == payload.internship_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You have already applied to this internship.")

    application = Application(
        student_id=current_user.id,
        internship_id=payload.internship_id,
        cover_letter=payload.cover_letter,
        status=ApplicationStatus.pending,
    )
    db.add(application)

    # Resolve student name for the notification (TokenUser has no .name)
    student_user = db.query(User).filter(User.id == current_user.id).first()
    student_name = student_user.name if student_user else "A student"

    # Notify the company
    _create_notification(
        db, internship.company_id,
        NotificationType.application_received,
        "New Application Received",
        f"{student_name} applied for {internship.title}.",
    )

    db.commit()
    db.refresh(application)
    return application


@router.get("/my", response_model=list[ApplicationOut])
def my_applications(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Return all applications made by the current student."""
    return (
        db.query(Application)
        .filter(Application.student_id == current_user.id)
        .order_by(Application.applied_at.desc())
        .all()
    )


@router.delete("/{application_id}", response_model=MessageResponse)
def withdraw_application(
    application_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Student withdraws a pending application."""
    app = db.query(Application).filter(
        Application.id == application_id,
        Application.student_id == current_user.id,
    ).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")
    if app.status not in {ApplicationStatus.pending, ApplicationStatus.under_review}:
        raise HTTPException(status_code=400, detail="Cannot withdraw at this stage.")
    app.status = ApplicationStatus.withdrawn
    db.commit()
    return MessageResponse(message="Application withdrawn.")


# ─── Company endpoints ────────────────────────────────────────

@router.get("/internship/{internship_id}", response_model=list[ApplicantOut])
def list_applicants(
    internship_id: int,
    status_filter: ApplicationStatus | None = None,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Company views all applicants for one of their internships."""
    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.company_id == current_user.id,
    ).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found.")

    query = db.query(Application).filter(Application.internship_id == internship_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
    return query.order_by(Application.applied_at.desc()).all()


@router.patch("/{application_id}/status", response_model=MessageResponse)
def update_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user: User = Depends(require_company),
    db: Session = Depends(get_db),
):
    """Company updates the status of an application (ATS pipeline)."""
    app = (
        db.query(Application)
        .join(Internship, Application.internship_id == Internship.id)
        .filter(
            Application.id == application_id,
            Internship.company_id == current_user.id,
        )
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found.")

    app.status = payload.status
    if payload.notes is not None:
        app.notes = payload.notes

    # Notify the student
    status_labels = {
        ApplicationStatus.under_review: "Under Review",
        ApplicationStatus.interview:    "Interview Scheduled",
        ApplicationStatus.accepted:     "Accepted 🎉",
        ApplicationStatus.rejected:     "Rejected",
    }
    label = status_labels.get(payload.status, payload.status.value)
    _create_notification(
        db, app.student_id,
        NotificationType.status_changed,
        "Application Status Updated",
        f"Your application for {app.internship.title} is now: {label}.",
    )

    db.commit()
    return MessageResponse(message=f"Application status updated to {payload.status.value}.")
