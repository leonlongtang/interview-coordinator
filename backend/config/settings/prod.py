from .base import *
import dj_database_url  # Add this import at the top

DEBUG = False

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

# =============================================================================
# Database Configuration - Use Railway's private URL (no egress) when available
# =============================================================================
_db_url = os.environ.get("DATABASE_PRIVATE_URL") or os.environ.get("DATABASE_URL")
DATABASES = {
    'default': dj_database_url.config(
        default=_db_url,
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# =============================================================================
# CORS Configuration - Allow your frontend domain(s)
# Comma-separated FRONTEND_URL supports multiple origins (e.g. preview + prod).
# =============================================================================
_raw = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _raw.split(",") if o.strip()]

# =============================================================================
# Celery Configuration - Use Railway's Redis
# =============================================================================
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')
CELERY_RESULT_BACKEND = os.environ.get('REDIS_URL', 'redis://localhost:6379/0')

# =============================================================================
# Security Hardening for Production
# =============================================================================

# XSS Protection
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# Cookie Security - only send cookies over HTTPS
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

# Session Security
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"

# Clickjacking Protection
X_FRAME_OPTIONS = "DENY"

# HSTS - Force HTTPS
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# HTTPS Redirect
SECURE_SSL_REDIRECT = True

# Proxy SSL Header (Railway uses this)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Logging configuration for security events
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
        "security": {
            "format": "[SECURITY] {levelname} {asctime} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
        "security_console": {
            "class": "logging.StreamHandler",
            "formatter": "security",
        },
    },
    "loggers": {
        "django.security": {
            "handlers": ["console", "security_console"],
            "level": "WARNING",
            "propagate": False,
        },
        "interviews.security": {
            "handlers": ["console", "security_console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}