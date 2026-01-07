from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Django Debug Toolbar (only if installed)
# INSTALLED_APPS += ["debug_toolbar"]
# MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

# CORS (development-friendly)
CORS_ALLOW_ALL_ORIGINS = True

# Email backend for development - prints emails to console instead of sending
# This avoids the need for an actual SMTP server during development
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"