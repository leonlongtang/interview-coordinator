# Interview Coordinator - Setup Guide

Complete guide to set up and run the Interview Coordinator application.

## Overview

Interview Coordinator helps you track job applications and interviews through the entire hiring pipeline. Features include:

- Track applications from submission to offer
- Schedule and manage interviews
- Record interview rounds with notes and outcomes
- Email reminders for upcoming interviews
- Dashboard with statistics and insights

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Django 5.x + Django REST Framework |
| Frontend | React 18 + TypeScript + Vite |
| Database | PostgreSQL 16 |
| Task Queue | Celery + Redis |
| Styling | Tailwind CSS |
| Auth | JWT (djangorestframework-simplejwt) |

---

## Quick Start (Docker)

The fastest way to get started is with Docker Compose.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Git

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/interview-coordinator.git
cd interview-coordinator

# 2. Create environment file
cp .env.example .env
# Edit .env with your settings (defaults work for development)

# 3. Start all services
docker-compose up --build

# 4. Run database migrations (in a new terminal)
docker-compose exec backend python manage.py migrate

# 5. Create admin user (optional)
docker-compose exec backend python manage.py createsuperuser
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Django Settings
DJANGO_SETTINGS_MODULE=config.settings.dev
SECRET_KEY=change-me-to-a-random-secret-key
DEBUG=1
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (PostgreSQL)
DB_NAME=interview_coordinator_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres
DB_PORT=5432

# Redis (Celery)
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0

# Email (optional - leave empty for console output)
EMAIL_HOST=
EMAIL_PORT=587
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Interview Coordinator <noreply@example.com>
```

### Generating a Secret Key

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Manual Setup (Without Docker)

### System Requirements

- Python 3.10+
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/dev.txt

# Set environment variables
export DJANGO_SETTINGS_MODULE=config.settings.dev
export SECRET_KEY=your-secret-key
export DEBUG=1
export DB_NAME=interview_coordinator_db
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Celery Setup (for email reminders)

```bash
# Terminal 1: Start Celery worker
celery -A config worker -l info

# Terminal 2: Start Celery beat (scheduler)
celery -A config beat -l info
```

---

## Docker Commands

### Daily Development

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Database Operations

```bash
# Run migrations
docker-compose exec backend python manage.py migrate

# Create migrations
docker-compose exec backend python manage.py makemigrations

# Access Django shell
docker-compose exec backend python manage.py shell

# Access PostgreSQL
docker-compose exec postgres psql -U postgres -d interview_coordinator_db
```

### Rebuilding

```bash
# Rebuild after dependency changes
docker-compose build --no-cache backend
docker-compose build --no-cache frontend

# Full rebuild
docker-compose down -v
docker-compose up --build
```

---

## Email Configuration

### Development (Console)

By default, emails are printed to the console. No configuration needed.

### Production (SMTP)

Configure these environment variables:

```env
EMAIL_HOST=smtp.gmail.com  # or your SMTP server
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=Interview Coordinator <your-email@gmail.com>
```

For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

### Testing Email

1. Go to Settings in the app
2. Click "Send Test Email"
3. Check your inbox (or console in development)

---

## API Documentation

### Authentication

All endpoints except `/api/auth/login/` and `/api/auth/registration/` require authentication.

Include the JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Main Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/registration/` | Register new user |
| `POST /api/auth/login/` | Login, get tokens |
| `POST /api/auth/token/refresh/` | Refresh access token |
| `GET /api/interviews/` | List interviews |
| `POST /api/interviews/` | Create interview |
| `GET /api/interviews/{id}/` | Get interview with rounds |
| `GET /api/interviews/dashboard-stats/` | Dashboard data |
| `GET /api/profile/` | User settings |

See `backend/README.md` for complete API documentation.

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker-compose logs backend

# Common fixes:
# - Ensure PostgreSQL is running
# - Check DATABASE_URL in .env
# - Run migrations
```

### Frontend can't connect to API

```bash
# Ensure backend is running on port 8000
# Check CORS settings in backend
# Verify API URL in frontend/src/services/api.ts
```

### Celery tasks not running

```bash
# Ensure Redis is running
docker-compose logs redis

# Check Celery worker logs
docker-compose logs celery-worker

# Verify CELERY_BROKER_URL in .env
```

### Database connection errors

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Verify database credentials in .env
# Try recreating the database:
docker-compose down -v
docker-compose up postgres
```

---

## Production Deployment

### Checklist

- [ ] Set `DEBUG=0`
- [ ] Generate new `SECRET_KEY`
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Set up HTTPS (SECURE_SSL_REDIRECT=1)
- [ ] Configure production database
- [ ] Set up email with real SMTP
- [ ] Configure HSTS (SECURE_HSTS_SECONDS=31536000)
- [ ] Set up monitoring and logging
- [ ] Run `python manage.py collectstatic`

### Production Settings

Use `config.settings.prod` for production:

```env
DJANGO_SETTINGS_MODULE=config.settings.prod
DEBUG=0
SECRET_KEY=<strong-random-key>
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECURE_SSL_REDIRECT=1
SECURE_HSTS_SECONDS=31536000
```

---

## V2 Roadmap

Future features planned:

- Calendar view with drag-and-drop
- Interview preparation checklists
- Company research integration
- Analytics and reporting
- Mobile app (React Native)
- Browser extension for job boards
