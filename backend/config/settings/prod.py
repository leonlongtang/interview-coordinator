from .base import *

DEBUG = False

ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "").split(",")

# =============================================================================
# Security Hardening for Production
# =============================================================================

# XSS Protection
SECURE_BROWSER_XSS_FILTER = True  # Add X-XSS-Protection header
SECURE_CONTENT_TYPE_NOSNIFF = True  # Prevent MIME type sniffing

# Cookie Security - only send cookies over HTTPS
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True  # Prevent JavaScript access to CSRF cookie

# Session Security
SESSION_COOKIE_HTTPONLY = True  # Prevent JavaScript access to session cookie
SESSION_COOKIE_SAMESITE = "Lax"  # Prevent CSRF via cross-site requests
CSRF_COOKIE_SAMESITE = "Lax"

# Clickjacking Protection
X_FRAME_OPTIONS = "DENY"  # Prevent embedding in iframes

# HSTS - Force HTTPS (enable when you have SSL certificate)
# Tells browsers to only access site via HTTPS for specified duration
SECURE_HSTS_SECONDS = int(os.environ.get("SECURE_HSTS_SECONDS", 0))  # Set to 31536000 (1 year) in production
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# HTTPS Redirect (enable when behind HTTPS)
SECURE_SSL_REDIRECT = os.environ.get("SECURE_SSL_REDIRECT", "0") == "1"

# Proxy SSL Header (for deployments behind a reverse proxy like nginx)
# If your proxy sets X-Forwarded-Proto, uncomment this:
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Logging configuration for security events
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
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
        "security_file": {
            "class": "logging.FileHandler",
            "filename": os.environ.get("SECURITY_LOG_FILE", "/var/log/interview_coordinator/security.log"),
            "formatter": "security",
        },
    },
    "loggers": {
        "django.security": {
            "handlers": ["console", "security_file"],
            "level": "WARNING",
            "propagate": False,
        },
        "interviews.security": {
            "handlers": ["console", "security_file"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
