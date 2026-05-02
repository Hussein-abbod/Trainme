# TrainMe Backend 🎓

A production-ready **FastAPI + MySQL** backend for the TrainMe internship marketplace platform.

## 🗂️ Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app factory, CORS, lifespan hooks
│   ├── config.py            # Settings via pydantic-settings (.env)
│   ├── database.py          # SQLAlchemy engine, session, Base
│   ├── models.py            # ORM models (User, Student, Company, Internship, …)
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── security.py          # bcrypt hashing + JWT create/decode
│   ├── dependencies.py      # FastAPI auth dependencies (require_student, etc.)
│   └── routers/
│       ├── auth.py          # POST /auth/register/student|company, /auth/login
│       ├── students.py      # GET|PUT /students/me, POST /students/me/upload-cv
│       ├── companies.py     # GET|PUT /companies/me, GET /companies/
│       ├── internships.py   # Full CRUD + search/filter
│       ├── applications.py  # Apply, withdraw, ATS pipeline, status updates
│       ├── bookmarks.py     # Save / unsave internships
│       ├── messages.py      # Direct messages between users
│       ├── notifications.py # In-app notifications
│       └── dashboard.py     # Company metrics aggregation
├── database/
│   ├── init.sql             # Run once to create the MySQL database
│   └── seed.py              # Populate dev database with sample data
├── uploads/                 # CV / logo / avatar uploads (auto-created)
├── venv/                    # Python virtual environment
├── .env                     # Environment variables (do NOT commit)
├── .env.example             # Template for .env
├── requirements.txt
└── main.py                  # Entry point (runs uvicorn)
```

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.11+
- MySQL 8.0+ running locally (or any MySQL-compatible server)

### 2. Create the MySQL Database

```bash
mysql -u root -p < database/init.sql
```

### 3. Configure Environment

Copy `.env.example` → `.env` and fill in your values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trainme_db
SECRET_KEY=your-super-secret-key
```

### 4. Activate Virtual Environment

```bash
# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate
```

### 5. Install Dependencies

```bash
pip install -r requirements.txt
```

### 6. Start the Server

```bash
python main.py
# OR
uvicorn app.main:app --reload --port 8000
```

### 7. (Optional) Seed Sample Data

```bash
python database/seed.py
```

---

## 📖 API Documentation

Once the server is running:

| URL | Description |
|-----|-------------|
| `http://localhost:8000/docs` | Swagger UI (interactive) |
| `http://localhost:8000/redoc` | ReDoc documentation |
| `http://localhost:8000/health` | Health check |

---

## 🔑 Authentication

All protected endpoints require a **Bearer JWT token** in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

Get a token via `POST /api/v1/auth/login`.

---

## 🛣️ API Routes Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| **Auth** | | | |
| POST | `/api/v1/auth/register/student` | — | Register student |
| POST | `/api/v1/auth/register/company` | — | Register company |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| GET | `/api/v1/auth/me` | ✅ | Current user info |
| **Students** | | | |
| GET | `/api/v1/students/me` | Student | My profile |
| PUT | `/api/v1/students/me` | Student | Update profile |
| POST | `/api/v1/students/me/upload-cv` | Student | Upload CV (PDF) |
| GET | `/api/v1/students/{id}` | Any | Public profile |
| **Companies** | | | |
| GET | `/api/v1/companies/` | Any | Browse companies |
| GET | `/api/v1/companies/me` | Company | My company |
| PUT | `/api/v1/companies/me` | Company | Update company |
| POST | `/api/v1/companies/me/upload-logo` | Company | Upload logo |
| **Internships** | | | |
| GET | `/api/v1/internships/` | Any | Browse + search |
| GET | `/api/v1/internships/{id}` | Any | Detail view |
| POST | `/api/v1/internships/` | Company | Create listing |
| PUT | `/api/v1/internships/{id}` | Company | Edit listing |
| DELETE | `/api/v1/internships/{id}` | Company | Delete listing |
| GET | `/api/v1/internships/company/my-listings` | Company | Own listings |
| **Applications** | | | |
| POST | `/api/v1/applications/` | Student | Apply |
| GET | `/api/v1/applications/my` | Student | My applications |
| DELETE | `/api/v1/applications/{id}` | Student | Withdraw |
| GET | `/api/v1/applications/internship/{id}` | Company | View applicants (ATS) |
| PATCH | `/api/v1/applications/{id}/status` | Company | Update status |
| **Bookmarks** | | | |
| GET | `/api/v1/bookmarks/` | Student | Saved internships |
| POST | `/api/v1/bookmarks/{id}` | Student | Save |
| DELETE | `/api/v1/bookmarks/{id}` | Student | Unsave |
| **Messages** | | | |
| POST | `/api/v1/messages/` | Any | Send message |
| GET | `/api/v1/messages/?other_user_id=X` | Any | Thread |
| GET | `/api/v1/messages/unread-count` | Any | Unread count |
| **Notifications** | | | |
| GET | `/api/v1/notifications/` | Any | List |
| PATCH | `/api/v1/notifications/{id}/read` | Any | Mark read |
| PATCH | `/api/v1/notifications/read-all` | Any | Mark all read |
| GET | `/api/v1/notifications/unread-count` | Any | Unread count |
| **Dashboard** | | | |
| GET | `/api/v1/dashboard/company` | Company | Metrics |

---

## 🗄️ Database Schema

```
users         → id, role, name, email, password_hash, avatar_url, is_active, is_verified
students      → user_id (FK), university, year, cgpa, major, bio, cv_url, linkedin, github, portfolio, skills
companies     → user_id (FK), company_name, ssm_number, industry, website, description, logo_url, verified
internships   → id, company_id (FK), title, department, description, location, duration, work_type, stipend, skills, deadline, status
applications  → id, student_id (FK), internship_id (FK), status, cover_letter, notes
bookmarks     → id, student_id (FK), internship_id (FK)
messages      → id, sender_id (FK), receiver_id (FK), content, is_read
notifications → id, user_id (FK), type, title, message, is_read
```

---

## 🌍 CORS

The backend allows requests from `http://localhost:3000` (the frontend Node.js server) by default.
Edit `ALLOWED_ORIGINS` in `.env` to add more origins.
