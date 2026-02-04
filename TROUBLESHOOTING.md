# Troubleshooting 404 Errors

## Quick Diagnostic Steps

### 1. Verify Frontend Was Rebuilt
**Critical**: After setting `VITE_API_URL`, you MUST redeploy/rebuild the frontend.

- Go to Railway → Frontend Service → Deployments
- Check if there's a deployment AFTER you set `VITE_API_URL`
- If not, trigger a new deployment (Railway should auto-deploy on env var change, but verify)

### 2. Test Backend API Directly

Try these URLs in your browser or curl:

```bash
# Health check (should work)
curl https://backend-production-4499.up.railway.app/health/

# Test API endpoint (should return 401 Unauthorized, NOT 404)
curl https://backend-production-4499.up.railway.app/api/applications/

# Test auth endpoint (should return 400 Bad Request for missing data, NOT 404)
curl -X POST https://backend-production-4499.up.railway.app/api/auth/login/
```

**Expected Results:**
- `/health/` → `{"status":"ok"}` ✅
- `/api/applications/` → `401 Unauthorized` ✅ (means route exists)
- `/api/auth/login/` → `400 Bad Request` ✅ (means route exists)

**If you get 404 on these**, the backend routes aren't working.

### 3. Check Browser Network Tab

1. Open your deployed frontend: `https://frontend-production-d6eb6.up.railway.app`
2. Open DevTools → Network tab
3. Try to login or load data
4. Check the **Request URL** column:
   - ✅ **Correct**: `https://backend-production-4499.up.railway.app/api/auth/login/`
   - ❌ **Wrong**: `http://localhost:8000/api/auth/login/` (frontend not rebuilt)

### 4. Verify Backend Environment Variables

In Railway → Backend Service → Variables, ensure:

- `DJANGO_SETTINGS_MODULE` = `config.settings.prod`
- `ALLOWED_HOSTS` = `backend-production-4499.up.railway.app,*.railway.app` (or your exact domain)
- `FRONTEND_URL` = `https://frontend-production-d6eb6.up.railway.app`

### 5. Check Railway Logs

**Backend Logs:**
```bash
# In Railway → Backend Service → Logs
# Look for:
# - "Starting development server" (wrong - should use gunicorn)
# - "Application startup complete" (good)
# - Any 404 errors or routing issues
```

**Frontend Logs:**
```bash
# In Railway → Frontend Service → Logs
# Look for build output showing VITE_API_URL
```

## Common Issues & Fixes

### Issue: Frontend still calling localhost:8000
**Fix**: Rebuild frontend after setting `VITE_API_URL`
1. Railway → Frontend Service
2. Variables → Verify `VITE_API_URL` is set
3. Deployments → Trigger new deployment
4. Wait for build to complete
5. Test again

### Issue: Backend returns 404 for all `/api/` routes
**Possible Causes:**
1. `ALLOWED_HOSTS` doesn't include backend domain
2. `DJANGO_SETTINGS_MODULE` is wrong (should be `config.settings.prod`)
3. Backend not using production settings

**Fix:**
1. Set `ALLOWED_HOSTS` = `backend-production-4499.up.railway.app,*.railway.app`
2. Set `DJANGO_SETTINGS_MODULE` = `config.settings.prod`
3. Redeploy backend

### Issue: CORS errors in browser console
**Fix**: Set `FRONTEND_URL` in backend to your frontend URL:
```
FRONTEND_URL=https://frontend-production-d6eb6.up.railway.app
```

### Issue: Backend health works but API returns 404
**Check:**
- Backend is using `config.settings.prod` (not `dev`)
- Routes are correctly configured in `config/urls.py`
- No middleware blocking requests

## Still Not Working?

1. **Share backend logs** from Railway (last 50 lines)
2. **Share browser Network tab** screenshot showing the failed request
3. **Verify** the exact URL the frontend is calling (check Network tab)
