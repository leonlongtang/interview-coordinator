# Verify Docker After Railway Changes

Quick checks to ensure the app still works locally with Docker. Railway-related edits (e.g. `VITE_API_URL`, `FRONTEND_URL` CORS, `serve` script) don't affect Docker dev, but it's good to confirm.

## Prerequisites

- Docker Desktop running
- `.env` in `interview_coordinator/` (see SETUP.md)

## Manual steps

Run these from **`interview_coordinator`** (where `docker-compose.yml` lives).

### 1. Rebuild and start

```powershell
cd interview_coordinator
docker compose build --no-cache
docker compose up -d
```

### 2. Migrate (if needed)

```powershell
docker compose exec backend python manage.py migrate --noinput
```

### 3. Health check

```powershell
curl http://localhost:8000/health/
```

Expected: `{"status":"ok"}`.

### 4. Open the app

- **Frontend:** http://localhost:5173  
- **Backend API:** http://localhost:8000/api  
- **Admin:** http://localhost:8000/admin  

### 5. Smoke test

1. Register a new user (or log in).
2. Add an interview, open dashboard.
3. (Optional) Log out and log back in (covers token refresh).

If all of that works, Docker setup is fine.

## Automated script (PowerShell)

From `interview_coordinator`:

```powershell
.\scripts\verify-docker.ps1
```

Runs rebuild, up, migrate, health check, and prints the manual checklist.

## What we're checking

| Change | Docker impact |
|--------|----------------|
| `api.ts` uses `VITE_API_URL` | No `VITE_API_URL` in dev � fallback `http://localhost:8000`. Browser calls backend on host port 8000.  |
| Prod CORS `FRONTEND_URL` | Docker uses **dev** settings (`CORS_ALLOW_ALL_ORIGINS = True`). Prod CORS not used.  |
| `serve` + `start` script | Docker runs `npm run dev`, not `start`.  |
| `railway.json` (backend/frontend) | Only used by Railway.  |

So Docker behavior is unchanged; we're just confirming nothing's broken.

---

## "Empty reply from server" when curling `/health/`

**1. Try IPv4 first** � `localhost` often resolves to `::1` (IPv6); Docker on Windows may only forward IPv4:
   ```bash
   curl -v http://127.0.0.1:8000/health/
   ```
   If that works, use `127.0.0.1` instead of `localhost`.

**2. Use Gunicorn** � Docker backend now runs gunicorn (not runserver). Rebuild: `docker compose build --no-cache backend && docker compose up -d backend`, then `curl http://127.0.0.1:8000/health/`.

**3. Watch logs while you curl**  in one terminal:
   ```bash
   docker compose logs -f backend
   ```
   In another: `curl -v http://localhost:8000/health/`. Check the logs for tracebacks or errors when the request hits.

3. **See if it's health-specific**: try `curl -v http://localhost:8000/admin/`. If that also returns "Empty reply", the issue is the server or connection, not the health view.

4. **Health view** uses `HttpResponse` (not `JsonResponse`) to avoid runserver quirks. Ensure you're on the latest `config/urls.py` health implementation.
