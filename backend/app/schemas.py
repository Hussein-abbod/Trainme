"""
Pydantic schemas for request/response validation.
"""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, field_validator, model_validator

from app.models import (
    ApplicationStatus, InternshipStatus, NotificationType,
    UserRole, WorkType, StudentEligibility
)


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def _parse_skills(value: Any) -> list[str]:
    """Accept either a list or a JSON string and return a list."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            return parsed if isinstance(parsed, list) else []
        except (json.JSONDecodeError, ValueError):
            return []
    return []


# ─────────────────────────────────────────────────────────────
# Auth Schemas
# ─────────────────────────────────────────────────────────────

class StudentRegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    university: Optional[str] = None
    student_id: Optional[str] = None   # university-assigned student ID

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class CompanyRegisterRequest(BaseModel):
    name: str           # owner/contact name
    email: EmailStr
    password: str
    company_name: str
    ssm_number: Optional[str] = None
    industry: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class UniversityRegisterRequest(BaseModel):
    name: str           # contact person name
    email: EmailStr
    password: str
    uni_name: str
    email_domain: str   # e.g. "mmu.edu.my"
    website: Optional[str] = None
    address: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    name: str


class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


# ─────────────────────────────────────────────────────────────
# User Schemas
# ─────────────────────────────────────────────────────────────

class UserOut(BaseModel):
    id: int
    role: UserRole
    name: str
    email: str
    avatar_url: Optional[str]
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Student Schemas
# ─────────────────────────────────────────────────────────────

class StudentProfileUpdate(BaseModel):
    university: Optional[str] = None
    student_id: Optional[str] = None
    year_of_study: Optional[int] = None
    cgpa: Optional[float] = None
    major: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    skills: Optional[list[str]] = None


class StudentProfileOut(BaseModel):
    user_id: int
    university: Optional[str]
    student_id: Optional[str]
    year_of_study: Optional[int]
    cgpa: Optional[float]
    major: Optional[str]
    bio: Optional[str]
    cv_url: Optional[str]
    linkedin: Optional[str]
    github: Optional[str]
    portfolio: Optional[str]
    skills: list[str] = []
    user: UserOut

    @field_validator("skills", mode="before")
    @classmethod
    def parse_skills(cls, v: Any) -> list[str]:
        return _parse_skills(v)

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Company Schemas
# ─────────────────────────────────────────────────────────────

class CompanyProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    ssm_number: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    employee_count: Optional[str] = None


class CompanyProfileOut(BaseModel):
    user_id: int
    company_name: str
    ssm_number: Optional[str]
    industry: Optional[str]
    website: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    verified: bool
    employee_count: Optional[str]
    user: UserOut

    model_config = {"from_attributes": True}


class CompanyListOut(BaseModel):
    """Simplified company schema for list views."""
    user_id: int
    company_name: str
    industry: Optional[str]
    logo_url: Optional[str]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# University Schemas
# ─────────────────────────────────────────────────────────────

class UniversityProfileUpdate(BaseModel):
    uni_name: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None


class UniversityProfileOut(BaseModel):
    user_id: int
    uni_name: str
    email_domain: str
    website: Optional[str]
    description: Optional[str]
    logo_url: Optional[str]
    address: Optional[str]
    user: UserOut

    model_config = {"from_attributes": True}


class UniversityStudentOut(BaseModel):
    """Summary of a student's internship for the university dashboard."""
    student_user_id: int
    student_name: str
    student_email: str
    student_id_number: Optional[str]   # university student ID
    major: Optional[str]
    cgpa: Optional[float]
    cv_url: Optional[str]
    # Internship info
    application_id: int
    internship_title: str
    company_name: str
    company_user_id: int
    application_status: str
    applied_at: datetime
    internship_start_date: Optional[datetime]
    internship_end_date: Optional[datetime]
    months_completed: Optional[int]
    # Company evaluation
    rating: Optional[float]
    company_comment: Optional[str]

    model_config = {"from_attributes": True}


class ApplicationRatingUpdate(BaseModel):
    """Company updates rating/comment for university visibility."""
    rating: Optional[float] = None
    company_comment: Optional[str] = None
    months_completed: Optional[int] = None
    end_date: Optional[datetime] = None


# ─────────────────────────────────────────────────────────────
# Internship Schemas
# ─────────────────────────────────────────────────────────────

class InternshipCreate(BaseModel):
    title: str
    department: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    work_type: WorkType = WorkType.onsite
    stipend: Optional[str] = None
    skills: Optional[list[str]] = None
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    status: InternshipStatus = InternshipStatus.active
    eligibility: StudentEligibility = StudentEligibility.both


class InternshipUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    duration: Optional[str] = None
    work_type: Optional[WorkType] = None
    stipend: Optional[str] = None
    skills: Optional[list[str]] = None
    deadline: Optional[datetime] = None
    start_date: Optional[datetime] = None
    status: Optional[InternshipStatus] = None
    eligibility: Optional[StudentEligibility] = None


class InternshipOut(BaseModel):
    id: int
    company_id: int
    title: str
    department: Optional[str]
    description: Optional[str]
    location: Optional[str]
    duration: Optional[str]
    work_type: WorkType
    stipend: Optional[str]
    skills: list[str] = []
    deadline: Optional[datetime]
    start_date: Optional[datetime]
    status: InternshipStatus
    eligibility: StudentEligibility
    created_at: datetime
    company: CompanyProfileOut

    @field_validator("skills", mode="before")
    @classmethod
    def parse_skills(cls, v: Any) -> list[str]:
        return _parse_skills(v)

    model_config = {"from_attributes": True}


class InternshipListOut(BaseModel):
    """Lightweight version for list views (no nested company)."""
    id: int
    company_id: int
    title: str
    department: Optional[str]
    location: Optional[str]
    duration: Optional[str]
    work_type: WorkType
    stipend: Optional[str]
    skills: list[str] = []
    deadline: Optional[datetime]
    status: InternshipStatus
    eligibility: StudentEligibility
    created_at: datetime
    applicant_count: int = 0
    company: Optional[CompanyListOut] = None

    @field_validator("skills", mode="before")
    @classmethod
    def parse_skills(cls, v: Any) -> list[str]:
        return _parse_skills(v)

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Application Schemas
# ─────────────────────────────────────────────────────────────

class ApplicationCreate(BaseModel):
    internship_id: int
    cover_letter: Optional[str] = None


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None


class ApplicationOut(BaseModel):
    id: int
    student_id: int
    internship_id: int
    status: ApplicationStatus
    cover_letter: Optional[str]
    notes: Optional[str]
    rating: Optional[float]
    company_comment: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    months_completed: Optional[int]
    applied_at: datetime
    updated_at: datetime
    internship: InternshipListOut

    model_config = {"from_attributes": True}


class ApplicantOut(BaseModel):
    """Used by company to see who applied to their internship."""
    id: int
    student_id: int
    status: ApplicationStatus
    cover_letter: Optional[str]
    notes: Optional[str]
    rating: Optional[float]
    company_comment: Optional[str]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    months_completed: Optional[int]
    applied_at: datetime
    updated_at: datetime
    student: StudentProfileOut

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Bookmark Schemas
# ─────────────────────────────────────────────────────────────

class BookmarkOut(BaseModel):
    id: int
    student_id: int
    internship_id: int
    created_at: datetime
    internship: InternshipListOut

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Message Schemas
# ─────────────────────────────────────────────────────────────

class MessageCreate(BaseModel):
    receiver_id: int
    content: str


class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Notification Schemas
# ─────────────────────────────────────────────────────────────

class NotificationOut(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Pagination + Generic
# ─────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[Any]


class MessageResponse(BaseModel):
    message: str
    success: bool = True
