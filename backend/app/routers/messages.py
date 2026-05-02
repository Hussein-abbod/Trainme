"""
Messaging routes — direct messages between students and companies.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Message, Notification, NotificationType, User
from app.schemas import MessageCreate, MessageOut

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageOut)
def send_message(
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receiver = db.query(User).filter(User.id == payload.receiver_id, User.is_active == True).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Recipient not found.")
    if receiver.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot message yourself.")

    msg = Message(sender_id=current_user.id, receiver_id=receiver.id, content=payload.content)
    db.add(msg)

    notif = Notification(
        user_id=receiver.id,
        type=NotificationType.message_received,
        title="New Message",
        message=f"{current_user.name} sent you a message.",
    )
    db.add(notif)
    db.commit()
    db.refresh(msg)
    return msg


@router.get("/", response_model=list[MessageOut])
def get_conversation(
    other_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve conversation thread between current user and another user."""
    messages = (
        db.query(Message)
        .filter(
            or_(
                and_(Message.sender_id == current_user.id, Message.receiver_id == other_user_id),
                and_(Message.sender_id == other_user_id, Message.receiver_id == current_user.id),
            )
        )
        .order_by(Message.created_at.asc())
        .all()
    )
    # Mark received messages as read
    for m in messages:
        if m.receiver_id == current_user.id and not m.is_read:
            m.is_read = True
    db.commit()
    return messages


@router.get("/contacts")
def get_contacts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieve a list of users the current user has active conversations with."""
    # Find all messages where current user is sender or receiver
    messages = db.query(Message).filter(
        or_(Message.sender_id == current_user.id, Message.receiver_id == current_user.id)
    ).order_by(Message.created_at.desc()).all()
    
    contacts = {}
    for m in messages:
        other_id = m.receiver_id if m.sender_id == current_user.id else m.sender_id
        if other_id not in contacts:
            other_user = db.query(User).filter(User.id == other_id).first()
            if other_user:
                contacts[other_id] = {
                    "id": other_user.id,
                    "name": other_user.name,
                    "role": other_user.role.value if hasattr(other_user.role, 'value') else other_user.role,
                    "last_message": m.content,
                    "last_message_at": m.created_at.isoformat(),
                    "unread": 0
                }
        if m.receiver_id == current_user.id and not m.is_read:
            contacts[other_id]["unread"] += 1

    return list(contacts.values())


@router.get("/unread-count")
def unread_count(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Message).filter(
        Message.receiver_id == current_user.id,
        Message.is_read == False,
    ).count()
    return {"unread_count": count}
