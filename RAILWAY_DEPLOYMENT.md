# Railway Deployment Guide

## Problem: 404 Errors on Deployed Frontend

If you're seeing 404 errors like:
```
API Error: Not Found
Request failed with status code 404
```

This means the frontend is trying to connect to `http://localhost:8000` instead of your Railway backend URL.

## Root Cause

Vite inlines environment variables **at build time**, not runtime. If `VITE_API_URL` is not set during the build process, it defaults to `http://localhost:8000`, which gets hardcoded into the built JavaScript files.

## Solution: Set Environment Variables in Railway

### Step 1: Find Your Backend Railway URL

1. Go to your Railway dashboard
2. Open your **backend** service
3. Go to the **Settings** tab
4. Find the **Public Domain** or **Custom Domain** - this is your backend URL
   - Example: `https://backend-production-xxxx.up.railway.app`
   - Or: `https://your-backend.railway.app`

### Step 2: Set Frontend Environment Variable

1. Go to your **frontend** service in Railway
2. Go to the **Variables** tab
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: Your backend URL (e.g., `https://backend-production-xxxx.up.railway.app`)
   - **Important**: Include the protocol (`https://`) but NO trailing slash

### Step 3: Rebuild the Frontend

After setting the environment variable:

1. Go to your frontend service in Railway
2. Click **Deploy** → **Redeploy** (or trigger a new deployment)
3. Railway will rebuild the frontend with the correct `VITE_API_URL` baked in

### Step 4: Verify Backend CORS Settings

Make sure your backend allows requests from your frontend domain:

1. Go to your **backend** service → **Variables**
2. Set `FRONTEND_URL` to your frontend Railway URL:
   - Example: `https://frontend-production-d6eb6.up.railway.app`
   - Or comma-separated for multiple: `https://frontend-production-d6eb6.up.railway.app,http://localhost:5173`

## Environment Variables Checklist

### Frontend Service Variables:
- ✅ `VITE_API_URL` = `https://your-backend.railway.app` (no trailing slash)

### Backend Service Variables:
- ✅ `FRONTEND_URL` = `https://your-frontend.railway.app` (or comma-separated list)
- ✅ `ALLOWED_HOSTS` = `your-backend.railway.app,*.railway.app`
- ✅ `DJANGO_SETTINGS_MODULE` = `config.settings.prod`
- ✅ `SECRET_KEY` = (your secret key)
- ✅ `DATABASE_URL` = (Railway PostgreSQL URL)
- ✅ `REDIS_URL` = (Railway Redis URL, if using Celery)

## Testing

After redeploying:

1. Open your frontend URL in a browser
2. Open browser DevTools → Network tab
3. Try logging in or loading data
4. Check that API requests go to your backend URL (not localhost:8000)
5. Verify responses are 200 OK, not 404

## Troubleshooting

### Still getting 404s?

1. **Check the built files**: After rebuild, check Network tab - requests should go to your backend URL
2. **Verify backend is running**: Visit `https://your-backend.railway.app/health/` - should return `{"status":"ok"}`
3. **Check CORS**: Backend logs will show CORS errors if `FRONTEND_URL` is wrong
4. **Verify environment variable**: In Railway, check that `VITE_API_URL` is set correctly (no typos)

### Backend returns 404 for `/api/` routes?

- Check that your backend is using `config.settings.prod` (not `dev`)
- Verify `ALLOWED_HOSTS` includes your backend domain
- Check Railway logs for Django errors

## Quick Reference

**Frontend API Base URL**: `${VITE_API_URL}/api`
- Example: `https://backend-production-xxxx.up.railway.app/api`

**Backend API Endpoints**:
- `/api/auth/login/` - Login
- `/api/auth/registration/` - Register
- `/api/applications/` - Applications CRUD
- `/api/applications/dashboard-stats/` - Dashboard stats
- `/api/profile/` - User profile
