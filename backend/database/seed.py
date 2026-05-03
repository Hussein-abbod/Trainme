"""
Utility script to seed the database with sample data for development.
Run: python database/seed.py

This will DROP and recreate all tables before seeding.
"""
import sys
import os

# Add parent directory to path so we can import from app
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import json
from datetime import datetime, timedelta

from sqlalchemy import text

from app.database import SessionLocal, create_tables, engine, Base
from app.models import (
    Application, ApplicationStatus, Bookmark, Company,
    Internship, InternshipStatus, Student, University, User, UserRole, WorkType,
)
from app.security import hash_password


def reset_and_seed():
    # ── Drop all tables and recreate ──────────────────────────
    print("[INFO] Dropping all existing tables...")
    Base.metadata.drop_all(bind=engine)
    print("[OK]   All tables dropped.")

    print("[INFO] Creating tables...")
    create_tables()
    print("[OK]   Tables created.\n")

    db = SessionLocal()

    try:
        now = datetime.utcnow()

        # ── Universities ───────────────────────────────────────
        mmu_user = User(
            role=UserRole.university,
            name="MMU Admin",
            email="admin@mmu.edu.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )
        utm_user = User(
            role=UserRole.university,
            name="UTM Admin",
            email="admin@utm.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )

        db.add_all([mmu_user, utm_user])
        db.flush()

        mmu = University(
            user_id=mmu_user.id,
            uni_name="Multimedia University (MMU)",
            email_domain="student.mmu.edu.my",
            website="https://www.mmu.edu.my",
            description="A private university specializing in multimedia and communication technology.",
            address="Persiaran Multimedia, 63100 Cyberjaya, Selangor",
        )
        utm = University(
            user_id=utm_user.id,
            uni_name="Universiti Teknologi Malaysia (UTM)",
            email_domain="graduate.utm.my",
            website="https://www.utm.my",
            description="A leading technology and engineering university in Malaysia.",
            address="81310 UTM Johor Bahru, Johor",
        )

        db.add_all([mmu, utm])
        db.flush()

        # ── Companies (3) ──────────────────────────────────────
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
        company_user3 = User(
            role=UserRole.company,
            name="GreenEnergy HR",
            email="hr@greenenergy.com.my",
            password_hash=hash_password("password123"),
            is_active=True,
            is_verified=True,
        )

        db.add_all([company_user1, company_user2, company_user3])
        db.flush()

        company1 = Company(
            user_id=company_user1.id,
            company_name="TechSolutions Sdn Bhd",
            ssm_number="202301012345",
            industry="Information Technology",
            website="https://techsolutions.com.my",
            description="Leading software consultancy in KL specializing in enterprise solutions.",
            verified=True,
            employee_count="200+",
        )
        company2 = Company(
            user_id=company_user2.id,
            company_name="FinanceHub Malaysia",
            ssm_number="202301067890",
            industry="Finance & Banking",
            website="https://financehub.com.my",
            description="Malaysia's fastest-growing fintech company powering digital payments.",
            verified=True,
            employee_count="50-200",
        )
        company3 = Company(
            user_id=company_user3.id,
            company_name="GreenEnergy Solutions",
            ssm_number="202301099999",
            industry="Renewable Energy",
            website="https://greenenergy.com.my",
            description="Pioneering sustainable energy solutions across Southeast Asia.",
            verified=True,
            employee_count="50-200",
        )

        db.add_all([company1, company2, company3])
        db.flush()

        # ── Students (6) — 4 MMU, 2 UTM ───────────────────────
        s_users = [
            User(role=UserRole.student, name="Ahmad Razif", email="ahmad@student.mmu.edu.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
            User(role=UserRole.student, name="Nurul Ain", email="nurul@student.mmu.edu.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
            User(role=UserRole.student, name="Wei Liang Chen", email="weiliang@student.mmu.edu.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
            User(role=UserRole.student, name="Priya Nair", email="priya@student.mmu.edu.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
            User(role=UserRole.student, name="Arif Hakim", email="arif@graduate.utm.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
            User(role=UserRole.student, name="Siti Hajar", email="siti@graduate.utm.my",
                 password_hash=hash_password("password123"), is_active=True, is_verified=True),
        ]
        db.add_all(s_users)
        db.flush()

        student_profiles = [
            Student(user_id=s_users[0].id, university="Multimedia University (MMU)", student_id="1211104001",
                    year_of_study=3, cgpa=3.6, major="Computer Science", cv_url="/uploads/dummy_cv.pdf",
                    bio="Passionate CS student interested in full-stack development.",
                    skills=json.dumps(["Python", "JavaScript", "React", "FastAPI", "SQL"])),
            Student(user_id=s_users[1].id, university="Multimedia University (MMU)", student_id="1211104002",
                    year_of_study=2, cgpa=3.8, major="Information Technology", cv_url="/uploads/dummy_cv.pdf",
                    bio="IT student passionate about UI/UX design and mobile development.",
                    skills=json.dumps(["Flutter", "Figma", "JavaScript", "HTML", "CSS"])),
            Student(user_id=s_users[2].id, university="Multimedia University (MMU)", student_id="1211104003",
                    year_of_study=3, cgpa=3.4, major="Data Science", cv_url="/uploads/dummy_cv.pdf",
                    bio="Data enthusiast with a love for machine learning and visualization.",
                    skills=json.dumps(["Python", "R", "TensorFlow", "Power BI", "SQL"])),
            Student(user_id=s_users[3].id, university="Multimedia University (MMU)", student_id="1211104004",
                    year_of_study=4, cgpa=3.9, major="Software Engineering", cv_url="/uploads/dummy_cv.pdf",
                    bio="Final year student specializing in cloud architecture and DevOps.",
                    skills=json.dumps(["AWS", "Docker", "Kubernetes", "CI/CD", "Python"])),
            Student(user_id=s_users[4].id, university="Universiti Teknologi Malaysia (UTM)", student_id="A21EC0001",
                    year_of_study=3, cgpa=3.5, major="Electrical Engineering", cv_url="/uploads/dummy_cv.pdf",
                    bio="Engineering student keen on embedded systems and IoT.",
                    skills=json.dumps(["C++", "Arduino", "MATLAB", "Python", "PCB Design"])),
            Student(user_id=s_users[5].id, university="Universiti Teknologi Malaysia (UTM)", student_id="A21EC0002",
                    year_of_study=2, cgpa=3.7, major="Finance", cv_url="/uploads/dummy_cv.pdf",
                    bio="Finance student interested in risk management and investment analysis.",
                    skills=json.dumps(["Excel", "Bloomberg", "Financial Modelling", "SQL", "Power BI"])),
        ]
        db.add_all(student_profiles)
        db.flush()

        # ── Internships (5) ────────────────────────────────────
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
        internship4 = Internship(
            company_id=company_user3.id,
            title="IoT & Embedded Systems Intern",
            department="R&D",
            description="Work on IoT sensors and embedded hardware for our smart grid infrastructure.",
            location="Shah Alam",
            duration="6 months",
            work_type=WorkType.onsite,
            stipend="RM 1,100/mo",
            skills=json.dumps(["C++", "Arduino", "MATLAB", "Python", "IoT"]),
            deadline=now + timedelta(days=40),
            start_date=now + timedelta(days=70),
            status=InternshipStatus.active,
        )
        internship5 = Internship(
            company_id=company_user3.id,
            title="Environmental Data Analyst Intern",
            department="Data Science",
            description="Analyze environmental sensor data and build dashboards for sustainability reporting.",
            location="Remote",
            duration="3 months",
            work_type=WorkType.remote,
            stipend="RM 800/mo",
            skills=json.dumps(["Python", "Power BI", "GIS", "SQL", "Excel"]),
            deadline=now + timedelta(days=50),
            start_date=now + timedelta(days=80),
            status=InternshipStatus.active,
        )

        db.add_all([internship1, internship2, internship3, internship4, internship5])
        db.flush()

        # ── Applications (several — mix of statuses) ───────────
        # Ahmad → TechSolutions Software (ACCEPTED — university can see)
        app1 = Application(
            student_id=s_users[0].id,
            internship_id=internship1.id,
            status=ApplicationStatus.accepted,
            cover_letter="I am highly motivated and eager to contribute to TechSolutions.",
            start_date=now - timedelta(days=30),
            end_date=now + timedelta(days=150),
            months_completed=1,
            rating=4.5,
            company_comment="Ahmad is a proactive intern who adapts quickly. Excellent communication skills and strong Python fundamentals.",
        )
        # Nurul → TechSolutions Data (ACCEPTED — university can see)
        app2 = Application(
            student_id=s_users[1].id,
            internship_id=internship2.id,
            status=ApplicationStatus.accepted,
            cover_letter="I have strong skills in data visualization and would love to contribute to your analytics team.",
            start_date=now - timedelta(days=15),
            end_date=now + timedelta(days=75),
            months_completed=1,
            rating=4.0,
            company_comment="Nurul shows great attention to detail in her dashboard work. She is a fast learner.",
        )
        # Wei Liang → TechSolutions Software (UNDER REVIEW)
        app3 = Application(
            student_id=s_users[2].id,
            internship_id=internship1.id,
            status=ApplicationStatus.under_review,
            cover_letter="Machine learning enthusiast with solid Python and SQL skills.",
        )
        # Priya → TechSolutions Data (PENDING)
        app4 = Application(
            student_id=s_users[3].id,
            internship_id=internship2.id,
            status=ApplicationStatus.pending,
            cover_letter="Final year student with AWS and DevOps experience.",
        )
        # Arif → IoT Internship at GreenEnergy (ACCEPTED — UTM can see)
        app5 = Application(
            student_id=s_users[4].id,
            internship_id=internship4.id,
            status=ApplicationStatus.accepted,
            cover_letter="Embedded systems enthusiast with hands-on Arduino experience.",
            start_date=now - timedelta(days=45),
            end_date=now + timedelta(days=135),
            months_completed=2,
            rating=4.8,
            company_comment="Arif is exceptionally talented in IoT and embedded systems. One of the best interns we have had.",
        )
        # Siti → Finance Intern at FinanceHub (ACCEPTED — UTM can see)
        app6 = Application(
            student_id=s_users[5].id,
            internship_id=internship3.id,
            status=ApplicationStatus.accepted,
            cover_letter="Finance student with Bloomberg and financial modelling skills.",
            start_date=now - timedelta(days=20),
            end_date=now + timedelta(days=100),
            months_completed=1,
            rating=3.8,
            company_comment="Siti is diligent and has shown good understanding of risk frameworks. Needs to work on speed.",
        )

        db.add_all([app1, app2, app3, app4, app5, app6])

        # ── Bookmark ───────────────────────────────────────────
        bookmark = Bookmark(student_id=s_users[0].id, internship_id=internship3.id)
        db.add(bookmark)

        db.commit()
        print("[OK] Database seeded successfully!\n")
        print("=" * 55)
        print("SAMPLE ACCOUNTS")
        print("=" * 55)
        print("\n[Universities]")
        print("  MMU Admin -> admin@mmu.edu.my          | password123")
        print("  UTM Admin -> admin@utm.my              | password123")
        print("\n[Companies]")
        print("  TechSolutions -> hr@techsolutions.com.my | password123")
        print("  FinanceHub    -> hr@financehub.com.my    | password123")
        print("  GreenEnergy   -> hr@greenenergy.com.my   | password123")
        print("\n[Students - MMU  @student.mmu.edu.my]")
        print("  Ahmad Razif   -> ahmad@student.mmu.edu.my    | password123 | ID: 1211104001")
        print("  Nurul Ain     -> nurul@student.mmu.edu.my    | password123 | ID: 1211104002")
        print("  Wei Liang     -> weiliang@student.mmu.edu.my | password123 | ID: 1211104003")
        print("  Priya Nair    -> priya@student.mmu.edu.my    | password123 | ID: 1211104004")
        print("\n[Students - UTM  @graduate.utm.my]")
        print("  Arif Hakim    -> arif@graduate.utm.my        | password123 | ID: A21EC0001")
        print("  Siti Hajar    -> siti@graduate.utm.my        | password123 | ID: A21EC0002")
        print("\n  Docs -> http://localhost:8000/docs\n")

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {exc}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()



if __name__ == "__main__":
    reset_and_seed()
