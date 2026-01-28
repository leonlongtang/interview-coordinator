# Deploy Interview Coordinator on Railway

Step-by-step guide to deploy the backend (Django), frontend (React/Vite), and optional Celery worker on [Railway](https://railway.app).

## Overview

| Service    | Root Directory           | Build / Start |
|-----------|---------------------------|---------------|
| Backend   | `interview_coordinator/backend` | Nixpacks → migrate, collectstatic, Gunicorn |
| Frontend  | `interview_coordinator/frontend` | Nixpacks → `npm run build` → `serve -s dist` |
| Worker    | `interview_coordinator/backend` | `celery -A config worker --loglevel=info` (optional) |

You’ll add **PostgreSQL** and **Redis** via Railway plugins; the backend uses `DATABASE_URL` and `REDIS_URL` from those.

---

## Prerequisites

- [Railway account](https://railway.app)
- Project in a **Git** repo (e.g. GitHub) Railway can access
- Repo root contains `interview_coordinator/` with `backend/` and `frontend/` inside

---

## 1. Create project and add PostgreSQL + Redis

1. Go to [Railway Dashboard](https://railway.app/dashboard) → **New Project**.
2. **Add PostgreSQL**: Project → **+ New** → **Database** → **PostgreSQL**. Railway creates a DB and exposes `DATABASE_URL`.
3. **Add Redis**: **+ New** → **Database** → **Redis**. Railway exposes `REDIS_URL` (or `REDIS_PRIVATE_URL`).

Keep this project open; we’ll add the backend and frontend services next.

---

## 2. Deploy the backend

1. **New service from repo**
   - **+ New** → **GitHub Repo** (or **Empty Service** and connect Git later).
   - Choose your repo.

2. **Root directory**
   - Select the backend service → **Settings** → **Root Directory**.
   - Set to `interview_coordinator/backend` (or `backend` if your repo root is `interview_coordinator`).
   - Save.

3. **Environment variables**
   - **Variables** tab. Add (or **Add Reference** for DB/Redis):

   | Variable | Value | Notes |
   |----------|--------|--------|
   | `DJANGO_SETTINGS_MODULE` | `config.settings.prod` | Use prod settings |
   | `SECRET_KEY` | `<random secret>` | [Generate](https://docs.djangoproject.com/en/stable/ref/django-admin/#django-admin-createsuperuser) a strong key |
   | `DEBUG` | `0` | Always `0` in prod |
   | `ALLOWED_HOSTS` | `*` initially | Replace with your backend domain after generating one |
   | `DATABASE_URL` | *from PostgreSQL plugin* | **Add Reference** → PostgreSQL → `DATABASE_URL` |
   | `REDIS_URL` | *from Redis plugin* | **Add Reference** → Redis → `REDIS_URL` (or `REDIS_PRIVATE_URL`) |
   | `FRONTEND_URL` | *(leave empty for now)* | Set after frontend is deployed |

   Generate a secret key:
   ```bash
   python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   ```

4. **Domain**
   - **Settings** → **Networking** → **Generate Domain**.
   - Note the URL (e.g. `https://your-backend.up.railway.app`).

5. **Update `ALLOWED_HOSTS`**
   - Set `ALLOWED_HOSTS` to that host only, e.g. `your-backend.up.railway.app` (no `https://`, no trailing slash).
   - Optionally add `*.railway.app` if you use multiple subdomains.

6. **Deploy**
   - Railway builds with Nixpacks and runs the deploy `startCommand` from `backend/railway.json` (migrate → collectstatic → Gunicorn). No extra config needed.

7. **Health check**
   - Open `https://your-backend.up.railway.app/health/`. You should see `{"status":"ok"}`.

---

## 3. Deploy the frontend

1. **New service from same repo**
   - **+ New** → **GitHub Repo** → same repo as backend.

2. **Root directory**
   - **Settings** → **Root Directory** → `interview_coordinator/frontend` (or `frontend` if repo root is `interview_coordinator`).

3. **Environment variables**
   - **Variables** tab:

   | Variable | Value | Notes |
   |----------|--------|--------|
   | `VITE_API_URL` | `https://your-backend.up.railway.app` | Backend base URL (no trailing slash). Used at **build** time. |

   Use the exact backend domain you generated earlier.

4. **Build / Start**
   - Nixpacks detects Node, runs `npm install` and `npm run build`. `npm run start` runs `serve -s dist`; Railway sets `PORT`, and `serve` uses it automatically.
   - No need to change build/start commands if you use `frontend/railway.json` and `package.json` scripts as in this repo.

5. **Domain**
   - **Settings** → **Networking** → **Generate Domain**.
   - Note the frontend URL (e.g. `https://your-frontend.up.railway.app`).

6. **Redeploy**
   - If you added or changed `VITE_API_URL` after the first deploy, trigger a **Redeploy** so the frontend is built again with the new API URL.

---

## 4. Connect frontend and backend

1. **CORS / `FRONTEND_URL`**
   - Backend service → **Variables**.
   - Set `FRONTEND_URL` to your frontend origin, e.g. `https://your-frontend.up.railway.app` (no trailing slash).
   - For multiple origins (e.g. preview + prod), use a comma‑separated list.

2. **Redeploy backend** so the new `FRONTEND_URL` is applied.

3. Open the frontend URL in a browser. You should be able to register, log in, and use the app.

---

## 5. Optional: Celery worker (reminders, etc.)

For email reminders and other Celery tasks:

1. **New service from same repo**
   - **+ New** → **GitHub Repo** → same repo.

2. **Root directory**
   - **Settings** → **Root Directory** → `interview_coordinator/backend` (same as backend).

3. **Environment variables**
   - Same as backend: `DJANGO_SETTINGS_MODULE`, `SECRET_KEY`, `DATABASE_URL`, `REDIS_URL`, etc. Reuse them via **Add Reference** where possible.

4. **Start command**
   - **Settings** → **Deploy** → **Custom Start Command**:
     ```bash
     celery -A config worker --loglevel=info
     ```
   - Disable or override the deploy `startCommand` from `railway.json` so this service runs only the worker (e.g. via Railway’s **Custom Start Command**).

5. **Deploy**
   - No domain needed. The worker runs in the background and processes tasks from Redis.

---

## 6. Optional: Celery Beat (scheduled tasks)

Celery Beat runs periodic tasks (e.g. daily reminder checks). You can run it either:

- **Same process as worker** (simplest): custom start command  
  `celery -A config worker --loglevel=info -B`
- **Dedicated service**: new service, same root and env as backend, start command  
  `celery -A config beat --loglevel=info`

---

## Environment variable summary

### Backend

| Variable | Required | Description |
|----------|----------|-------------|
| `DJANGO_SETTINGS_MODULE` | Yes | `config.settings.prod` |
| `SECRET_KEY` | Yes | Strong random key |
| `DEBUG` | Yes | `0` in prod |
| `ALLOWED_HOSTS` | Yes | Backend host(s), comma‑separated |
| `DATABASE_URL` | Yes | From PostgreSQL plugin |
| `REDIS_URL` | Yes | From Redis plugin (or `REDIS_PRIVATE_URL`) |
| `FRONTEND_URL` | Yes | Frontend origin(s), comma‑separated |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend base URL (used at build time) |

### Worker (optional)

Same as backend; no `FRONTEND_URL` needed for the worker itself.

---

## Troubleshooting

### Backend: 502 / crash on deploy

- Check **Deploy** and **Build** logs.
- Ensure `DATABASE_URL` and `REDIS_URL` are set (via references).
- Confirm `ALLOWED_HOSTS` includes your backend domain.
- Run migrations locally if you changed models and didn’t commit migrations.

### Frontend: “Cannot connect to API” / CORS errors

- Confirm `VITE_API_URL` is the backend URL (no trailing slash) and that you **rebuilt** the frontend after changing it.
- Ensure backend `FRONTEND_URL` matches the frontend origin exactly (including `https`).
- Check browser DevTools (Network tab) for the failing request and CORS headers.

### Static files (admin, etc.) not loading

- Backend `startCommand` runs `collectstatic` before Gunicorn. If you changed it, ensure `collectstatic --noinput` is still run.
- Confirm WhiteNoise is in use (`config.settings.base`).

### Celery tasks not running

- Ensure Redis is added and `REDIS_URL` is set for the worker.
- Check worker service logs.
- Confirm the worker’s start command is `celery -A config worker ...` (and optionally `-B` for Beat).

---

## Security checklist

- [ ] `DEBUG=0` in production.
- [ ] Strong, unique `SECRET_KEY`; never commit it.
- [ ] `ALLOWED_HOSTS` restricted to your backend domain(s).
- [ ] `FRONTEND_URL` restricted to your frontend domain(s).
- [ ] HTTPS only (Railway provides this; prod settings use `SECURE_SSL_REDIRECT`).
- [ ] DB and Redis credentials only in Railway (references); no `.env` in repo.

---

## References

- [Railway Build and Start Commands](https://docs.railway.com/reference/build-and-start-commands)
- [Railway Config as Code](https://docs.railway.app/guides/config-as-code)
- [Railway Pre-Deploy Commands](https://docs.railway.com/guides/pre-deploy-command) (alternative to running migrate in `startCommand`)
- Project [SETUP.md](./SETUP.md) for local development and env vars.
