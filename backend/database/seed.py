"""
Utility script to seed the database with sample data for development.
Run: python database/seed.py
"""
import sys
import os

# Add parent directory to path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
from datetime import datetime, timedelta

from app.database import SessionLocal, create_tables
from app.models import (
    Application, ApplicationStatus, Bookmark, Company,
    Internship, InternshipStatus, Student, User, UserRole, WorkType,
)
from app.security import hash_password


def seed():
    create_tables()
    db = SessionLocal()

    try:
        # ── Users ─────────────────────────────────────────
        student_user = User(
            role=UserRole.student,
            name="Ahmad Razif",
            email="ahmad@student.mmu.edu.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )
        company_user1 = User(
            role=UserRole.company,
            name="TechSolutions HR",
            email="hr@techsolutions.com.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )
        company_user2 = User(
            role=UserRole.company,
            name="FinanceHub HR",
            email="hr@financehub.com.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )

        db.add_all([student_user, company_user1, company_user2])
        db.flush()

        # ── Profiles ───────────────────────────────────────
        student_profile = Student(
            user_id=student_user.id,
            university="Multimedia University (MMU)",
            year_of_study=3,
            cgpa=3.6,
            major="Computer Science",
            bio="Passionate CS student interested in full-stack development.",
            skills=json.dumps(["Python", "JavaScript", "React", "FastAPI", "SQL"]),
        )
        company1 = Company(
            user_id=company_user1.id,
            company_name="TechSolutions Sdn Bhd",
            ssm_number="202301012345",
            industry="Information Technology",
            website="https://techsolutions.com.my",
            description="Leading software consultancy in KL.",
            verified=True,
            employee_count="200+",
        )
        company2 = Company(
            user_id=company_user2.id,
            company_name="FinanceHub Malaysia",
            ssm_number="202301067890",
            industry="Finance & Banking",
            website="https://financehub.com.my",
            description="Malaysia's fastest-growing fintech company.",
            verified=True,
            employee_count="50-200",
        )

        db.add_all([student_profile, company1, company2])
        db.flush()

        # ── Internships ────────────────────────────────────
        now = datetime.utcnow()
        internship1 = Internship(
            company_id=company_user1.id,
            title="Software Engineering Intern",
            department="Engineering",
            description=(
                "Join our engineering team and work on real-world products. "
                "You'll build REST APIs, contribute to frontend features, and participate in sprint planning."
            ),
            location="Kuala Lumpur",
            duration="6 months",
            work_type=WorkType.onsite,
            stipend="RM 1,200/mo",
            skills=json.dumps(["Python", "JavaScript", "Node.js", "REST APIs", "Git"]),
            deadline=now + timedelta(days=60),
            start_date=now + timedelta(days=90),
            status=InternshipStatus.active,
        )
        internship2 = Internship(
            company_id=company_user1.id,
            title="Data Analyst Intern",
            department="Data & Analytics",
            description="Analyze datasets, build dashboards, and support business intelligence initiatives.",
            location="Kuala Lumpur",
            duration="3 months",
            work_type=WorkType.hybrid,
            stipend="RM 900/mo",
            skills=json.dumps(["Python", "SQL", "Power BI", "Excel"]),
            deadline=now + timedelta(days=30),
            start_date=now + timedelta(days=60),
            status=InternshipStatus.active,
        )
        internship3 = Internship(
            company_id=company_user2.id,
            title="Finance & Risk Intern",
            department="Risk Management",
            description="Support the risk team with financial modelling, reporting, and regulatory compliance tasks.",
            location="Petaling Jaya",
            duration="4 months",
            work_type=WorkType.onsite,
            stipend="RM 1,000/mo",
            skills=json.dumps(["Excel", "Financial Modelling", "Bloomberg", "SQL"]),
            deadline=now + timedelta(days=45),
            start_date=now + timedelta(days=75),
            status=InternshipStatus.active,
        )

        db.add_all([internship1, internship2, internship3])
        db.flush()

        # ── Application ────────────────────────────────────
        application = Application(
            student_id=student_user.id,
            internship_id=internship1.id,
            status=ApplicationStatus.under_review,
            cover_letter="I am highly motivated and eager to contribute to TechSolutions.",
        )
        db.add(application)

        # ── Bookmark ───────────────────────────────────────
        bookmark = Bookmark(student_id=student_user.id, internship_id=internship3.id)
        db.add(bookmark)

        db.commit()
        print("\n✅ Database seeded successfully!")
        print("\nSample accounts:")
        print("  Student  → email: ahmad@student.mmu.edu.my  | password: password123")
        print("  Company1 → email: hr@techsolutions.com.my   | password: password123")
        print("  Company2 → email: hr@financehub.com.my      | password: password123")
        print("\n  Docs → http://localhost:8000/docs\n")

    except Exception as exc:
        db.rollback()
        print(f"\n❌ Seeding failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
