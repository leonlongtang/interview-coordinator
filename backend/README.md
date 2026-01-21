# Interview Coordinator - Backend

Django REST API for the Interview Coordinator application.

## Tech Stack

- **Framework**: Django 5.x + Django REST Framework
- **Database**: PostgreSQL 16
- **Authentication**: JWT (djangorestframework-simplejwt + dj-rest-auth)
- **Task Queue**: Celery + Redis
- **Email**: Django email with SMTP support

## API Endpoints

### Authentication (Rate Limited: 5 req/min)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/registration/` | Register new user |
| POST | `/api/auth/login/` | Login, returns JWT tokens |
| POST | `/api/auth/logout/` | Logout, blacklists refresh token |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/user/` | Get current user details |

### Interviews (Requires Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/interviews/` | List all interviews |
| POST | `/api/interviews/` | Create new interview |
| GET | `/api/interviews/{id}/` | Get interview with rounds |
| PUT/PATCH | `/api/interviews/{id}/` | Update interview |
| DELETE | `/api/interviews/{id}/` | Delete interview |
| GET | `/api/interviews/dashboard-stats/` | Dashboard statistics |

### Interview Rounds

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/interviews/rounds/` | List/Create rounds |
| GET/PUT/DELETE | `/api/interviews/rounds/{id}/` | Manage round |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT/PATCH | `/api/profile/` | Get/Update profile settings |
| POST | `/api/profile/test-email/` | Send test email |

## Environment Variables

```env
DJANGO_SETTINGS_MODULE=config.settings.dev
SECRET_KEY=your-secret-key
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=interview_coordinator_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

## Local Development

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
python manage.py migrate
python manage.py runserver
```

## Security Features

- Rate limiting on auth endpoints (5 req/min)
- Strong password validation (min 8 chars, no common passwords)
- Input sanitization (XSS prevention)
- Security event logging
- JWT token rotation
