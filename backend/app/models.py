"""
SQLAlchemy ORM models — maps Python classes to MySQL tables.
"""
from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import (
    BigInteger, Boolean, Column, DateTime, Enum, ForeignKey,
    Integer, String, Text, Float, UniqueConstraint, func,
)
from sqlalchemy.orm import relationship

from app.database import Base


# ─────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    student = "student"
    company = "company"
    admin   = "admin"


class ApplicationStatus(str, enum.Enum):
    pending       = "pending"
    under_review  = "under_review"
    interview     = "interview"
    accepted      = "accepted"
    rejected      = "rejected"
    withdrawn     = "withdrawn"


class InternshipStatus(str, enum.Enum):
    draft     = "draft"
    active    = "active"
    closed    = "closed"
    archived  = "archived"


class WorkType(str, enum.Enum):
    onsite = "onsite"
    remote = "remote"
    hybrid = "hybrid"


class StudentEligibility(str, enum.Enum):
    local = "local"
    international = "international"
    both = "both"


class NotificationType(str, enum.Enum):
    application_received  = "application_received"
    status_changed        = "status_changed"
    message_received      = "message_received"
    internship_deadline   = "internship_deadline"
    system               = "system"


# ─────────────────────────────────────────────────────────────
# Mixin
# ─────────────────────────────────────────────────────────────

class TimestampMixin:
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)


# ─────────────────────────────────────────────────────────────
# Core Tables
# ─────────────────────────────────────────────────────────────

class User(TimestampMixin, Base):
    __tablename__ = "users"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    role       = Column(Enum(UserRole), nullable=False)
    name       = Column(String(255), nullable=False)
    email      = Column(String(255), nullable=False, unique=True, index=True)
    password_hash = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active  = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Relationships
    student_profile  = relationship("Student",      back_populates="user", uselist=False, cascade="all, delete-orphan")
    company_profile  = relationship("Company",      back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications    = relationship("Notification", back_populates="user",                cascade="all, delete-orphan")
    sent_messages    = relationship("Message",      foreign_keys="Message.sender_id",   back_populates="sender")
    received_messages= relationship("Message",      foreign_keys="Message.receiver_id", back_populates="receiver")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"


class Student(TimestampMixin, Base):
    __tablename__ = "students"

    user_id       = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    university    = Column(String(255), nullable=True)
    year_of_study = Column(Integer, nullable=True)
    cgpa          = Column(Float, nullable=True)
    major         = Column(String(255), nullable=True)
    bio           = Column(Text, nullable=True)
    cv_url        = Column(String(500), nullable=True)
    linkedin      = Column(String(500), nullable=True)
    github        = Column(String(500), nullable=True)
    portfolio     = Column(String(500), nullable=True)
    skills        = Column(Text, nullable=True)   # JSON-encoded list stored as TEXT

    # Relationships
    user         = relationship("User",        back_populates="student_profile")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    bookmarks    = relationship("Bookmark",    back_populates="student", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Student user_id={self.user_id} university={self.university}>"


class Company(TimestampMixin, Base):
    __tablename__ = "companies"

    user_id        = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    company_name   = Column(String(255), nullable=False)
    ssm_number     = Column(String(100), nullable=True, unique=True)
    industry       = Column(String(100), nullable=True)
    website        = Column(String(500), nullable=True)
    description    = Column(Text, nullable=True)
    logo_url       = Column(String(500), nullable=True)
    verified       = Column(Boolean, default=False, nullable=False)
    employee_count = Column(String(50), nullable=True)  # e.g., "50-200"

    # Relationships
    user        = relationship("User",        back_populates="company_profile")
    internships = relationship("Internship",  back_populates="company", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Company user_id={self.user_id} name={self.company_name}>"


# ─────────────────────────────────────────────────────────────
# Internships
# ─────────────────────────────────────────────────────────────

class Internship(TimestampMixin, Base):
    __tablename__ = "internships"

    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    company_id  = Column(BigInteger, ForeignKey("companies.user_id", ondelete="CASCADE"), nullable=False, index=True)
    title       = Column(String(255), nullable=False)
    department  = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    location    = Column(String(255), nullable=True)
    duration    = Column(String(50), nullable=True)   # e.g., "3 months"
    work_type   = Column(Enum(WorkType), default=WorkType.onsite)
    stipend     = Column(String(50), nullable=True)   # e.g., "RM 1200"
    skills      = Column(Text, nullable=True)          # JSON-encoded list
    deadline    = Column(DateTime, nullable=True)
    start_date  = Column(DateTime, nullable=True)
    status      = Column(Enum(InternshipStatus), default=InternshipStatus.active)
    eligibility = Column(Enum(StudentEligibility), default=StudentEligibility.both)

    # Relationships
    company      = relationship("Company",     back_populates="internships")
    applications = relationship("Application", back_populates="internship", cascade="all, delete-orphan")
    bookmarks    = relationship("Bookmark",    back_populates="internship", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Internship id={self.id} title={self.title}>"


# ─────────────────────────────────────────────────────────────
# Applications
# ─────────────────────────────────────────────────────────────

class Application(TimestampMixin, Base):
    __tablename__ = "applications"
    __table_args__ = (
        UniqueConstraint("student_id", "internship_id", name="uq_student_internship"),
    )

    id            = Column(BigInteger, primary_key=True, autoincrement=True)
    student_id    = Column(BigInteger, ForeignKey("students.user_id", ondelete="CASCADE"), nullable=False, index=True)
    internship_id = Column(BigInteger, ForeignKey("internships.id",   ondelete="CASCADE"), nullable=False, index=True)
    status        = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending, nullable=False)
    cover_letter  = Column(Text, nullable=True)
    notes         = Column(Text, nullable=True)  # Company internal notes
    applied_at    = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    student    = relationship("Student",    back_populates="applications")
    internship = relationship("Internship", back_populates="applications")

    def __repr__(self) -> str:
        return f"<Application id={self.id} student={self.student_id} internship={self.internship_id} status={self.status}>"


# ─────────────────────────────────────────────────────────────
# Bookmarks
# ─────────────────────────────────────────────────────────────

class Bookmark(Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint("student_id", "internship_id", name="uq_bookmark"),
    )

    id            = Column(BigInteger, primary_key=True, autoincrement=True)
    student_id    = Column(BigInteger, ForeignKey("students.user_id",  ondelete="CASCADE"), nullable=False)
    internship_id = Column(BigInteger, ForeignKey("internships.id",    ondelete="CASCADE"), nullable=False)
    created_at    = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    student    = relationship("Student",    back_populates="bookmarks")
    internship = relationship("Internship", back_populates="bookmarks")


# ─────────────────────────────────────────────────────────────
# Messages
# ─────────────────────────────────────────────────────────────

class Message(Base):
    __tablename__ = "messages"

    id          = Column(BigInteger, primary_key=True, autoincrement=True)
    sender_id   = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    receiver_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content     = Column(Text, nullable=False)
    is_read     = Column(Boolean, default=False, nullable=False)
    created_at  = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    sender   = relationship("User", foreign_keys=[sender_id],   back_populates="sent_messages")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_messages")


# ─────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────

class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id    = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type       = Column(Enum(NotificationType), nullable=False)
    title      = Column(String(255), nullable=False)
    message    = Column(Text, nullable=False)
    is_read    = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="notifications")
