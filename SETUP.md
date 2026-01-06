# Project Setup Guide

This document explains how to set up and run the project locally.

## Tech Stack

-   Backend: Django (API-only)
-   Database: PostgreSQL
-   Frontend: React (Vite)
-   Styling: Tailwind CSS

------------------------------------------------------------------------

## 1. System Requirements

### Required

-   Git (https://git-scm.com/install/)
-   Python ≥ 3.10 (https://www.python.org/downloads/)
-   Node.js ≥ 18 (https://nodejs.org/en/download)
-   PostgreSQL ≥ 15 (https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)

### Recommended

-   Docker & Docker Compose (https://www.docker.com/products/docker-desktop/)
-   VS Code + Cursor 

------------------------------------------------------------------------

## 2. Backend Setup (Django)

### 2.1 Create a virtual environment

``` bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Linux / macOS
# .venv\Scripts\activate  # Windows
```

### 2.2 Install dependencies

``` bash
pip install -r requirements/dev.txt
```

### 2.3 Environment variables

``` bash
cp ../.env.example .env
```

``` env
DJANGO_SETTINGS_MODULE=config.settings.dev
SECRET_KEY=change-me
DATABASE_URL=postgresql://localhost:5432/myapp
DEBUG=1
```

### 2.4 Run checks

``` bash
python manage.py check
```

### 2.5 Start backend server

``` bash
python manage.py runserver
```

Backend: http://localhost:8000

------------------------------------------------------------------------

## 3. PostgreSQL Setup

### Local

``` bash
# Start PostgreSQL service (varies by OS)
# Linux: sudo systemctl start postgresql
# macOS (Homebrew): brew services start postgresql
# Windows: Start from Services or use pg_ctl
```

### Docker

``` bash
docker compose up postgres
```

### Create database

``` bash
createdb myapp
# Or via psql:
# psql -c "CREATE DATABASE myapp;"
```

------------------------------------------------------------------------

## 4. Frontend Setup

``` bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

------------------------------------------------------------------------

## 5. Common Commands

### Backend

``` bash
python manage.py runserver
python manage.py test
```

### Frontend

``` bash
npm run dev
npm run build
npm run preview
```

------------------------------------------------------------------------

## 6. Docker Full Stack

### First-time setup

``` bash
# Copy environment file
cp .env.example .env

# Build and start all services
docker compose up --build

# In a new terminal, run migrations
docker compose exec backend python manage.py migrate

# Create admin user (optional)
docker compose exec backend python manage.py createsuperuser
```

### Daily commands

``` bash
# Start services
docker compose up

# Stop services
docker compose down

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Run Django commands
docker compose exec backend python manage.py <command>

# Access PostgreSQL
docker compose exec postgres psql -U myapp -d myapp

# Rebuild after Dockerfile or dependency changes
docker compose build --no-cache
```

------------------------------------------------------------------------

## 7. Verification Checklist

-   [ ] `.env` file created from `.env.example`
-   [ ] Backend starts: http://localhost:8000/health/
-   [ ] Frontend loads: http://localhost:5173
-   [ ] Admin panel: http://localhost:8000/admin/
-   [ ] PostgreSQL connected (migrations run successfully)
