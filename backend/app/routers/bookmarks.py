"""
Bookmark routes — students save/unsave internships.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_student
from app.models import Bookmark, Internship, User
from app.schemas import BookmarkOut, MessageResponse

router = APIRouter(prefix="/bookmarks", tags=["Bookmarks"])


@router.post("/{internship_id}", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def add_bookmark(
    internship_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found.")

    existing = db.query(Bookmark).filter(
        Bookmark.student_id == current_user.id,
        Bookmark.internship_id == internship_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already bookmarked.")

    db.add(Bookmark(student_id=current_user.id, internship_id=internship_id))
    db.commit()
    return MessageResponse(message="Internship bookmarked.")


@router.delete("/{internship_id}", response_model=MessageResponse)
def remove_bookmark(
    internship_id: int,
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    bookmark = db.query(Bookmark).filter(
        Bookmark.student_id == current_user.id,
        Bookmark.internship_id == internship_id,
    ).first()
    if not bookmark:
        raise HTTPException(status_code=404, detail="Bookmark not found.")
    db.delete(bookmark)
    db.commit()
    return MessageResponse(message="Bookmark removed.")


@router.get("/", response_model=list[BookmarkOut])
def list_bookmarks(
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    return (
        db.query(Bookmark)
        .filter(Bookmark.student_id == current_user.id)
        .order_by(Bookmark.created_at.desc())
        .all()
    )
