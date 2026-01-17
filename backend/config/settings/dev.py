import os
from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Django Debug Toolbar (only if installed)
# INSTALLED_APPS += ["debug_toolbar"]
# MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

# CORS (development-friendly)
CORS_ALLOW_ALL_ORIGINS = True

# Email configuration - uses Mailtrap or other SMTP service if configured,
# otherwise falls back to console backend for local development
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = int(os.environ.get("EMAIL_PORT", "587"))
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = os.environ.get("EMAIL_USE_TLS", "True") == "True"

# Use SMTP backend if credentials are provided, otherwise use console
if EMAIL_HOST and EMAIL_HOST_USER:
    EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
else:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"