"""
Student profile routes.
"""
import json
import os
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user, require_student
from app.models import Student, User
from app.schemas import MessageResponse, StudentProfileOut, StudentProfileUpdate

router = APIRouter(prefix="/students", tags=["Students"])
settings = get_settings()


def _get_student_or_404(user_id: int, db: Session) -> Student:
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found.")
    return student


@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    """Get the logged-in student's profile."""
    return _get_student_or_404(current_user.id, db)


@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(
    payload: StudentProfileUpdate,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Update the logged-in student's profile."""
    student = _get_student_or_404(current_user.id, db)

    update_data = payload.model_dump(exclude_unset=True)
    if "skills" in update_data and update_data["skills"] is not None:
        update_data["skills"] = json.dumps(update_data["skills"])

    for field, value in update_data.items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)
    return student


@router.post("/me/upload-cv", response_model=MessageResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    """Upload or replace the student's CV (PDF only, max 5 MB)."""
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > max_bytes:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB} MB limit.")

    from app.cloudinary_utils import upload_file_to_cloudinary
    secure_url = upload_file_to_cloudinary(contents, folder="trainme/cvs", resource_type="auto")

    student = _get_student_or_404(current_user.id, db)
    student.cv_url = secure_url
    db.commit()

    return MessageResponse(message="CV uploaded successfully.")


@router.get("/{user_id}", response_model=StudentProfileOut)
def get_student_profile(user_id: int, _: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get any student's public profile (authenticated users only)."""
    return _get_student_or_404(user_id, db)
