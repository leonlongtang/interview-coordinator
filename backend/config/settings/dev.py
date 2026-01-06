from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Django Debug Toolbar (only if installed)
# INSTALLED_APPS += ["debug_toolbar"]
# MIDDLEWARE = ["debug_toolbar.middleware.DebugToolbarMiddleware"] + MIDDLEWARE

# CORS (development-friendly)
CORS_ALLOW_ALL_ORIGINS = True
