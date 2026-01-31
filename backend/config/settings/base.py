import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security
SECRET_KEY = os.environ["SECRET_KEY"]
DEBUG = os.environ.get("DEBUG") == "1"

ALLOWED_HOSTS = os.environ.get(
    "ALLOWED_HOSTS", "localhost,127.0.0.1"
).split(",")

# Applications
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",  # Required by django-allauth

    # Third-party
    "rest_framework",
    "rest_framework.authtoken",  # Token support for dj-rest-auth
    "rest_framework_simplejwt",  # JWT authentication
    "corsheaders",
    
    # Authentication - dj-rest-auth provides ready-to-use auth endpoints
    "dj_rest_auth",
    "dj_rest_auth.registration",
    
    # django-allauth handles registration, email verification, etc.
    "allauth",
    "allauth.account",
    "allauth.socialaccount",  # Required even if not using social auth

    # Task scheduling - Celery Beat stores periodic tasks in database
    "django_celery_beat",

    # Local apps
    "interviews",
]

# Required by django-allauth - identifies the current site in multi-site setups
SITE_ID = 1

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "config.middleware.DisableCSRFForAPI",  # Must be before CsrfViewMiddleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",  # Required by django-allauth
]

# URLs
ROOT_URLCONF = "config.urls"

# Templates (used for email templates and admin)
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # Project-level templates (emails, etc.)
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# Database (PostgreSQL)
# Railway: prefer DATABASE_PRIVATE_URL (no egress fees). Fall back to DATABASE_URL.
# Heroku/local: use DATABASE_URL or individual DB_* vars.
_db_url = os.environ.get("DATABASE_PRIVATE_URL") or os.environ.get("DATABASE_URL")
if _db_url:
    import dj_database_url

    DATABASES = {
        "default": dj_database_url.config(
            default=_db_url,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ["DB_NAME"],
            "USER": os.environ["DB_USER"],
            "PASSWORD": os.environ["DB_PASSWORD"],
            "HOST": os.environ["DB_HOST"],
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Default PK
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# =============================================================================
# Password Validation - Enforce strong passwords
# =============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        # Prevents passwords too similar to user attributes (username, email)
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        # Minimum length requirement
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {
            "min_length": 8,
        },
    },
    {
        # Blocks common passwords (e.g., "password123", "qwerty")
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        # Prevents all-numeric passwords
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# =============================================================================
# Django REST Framework Configuration
# =============================================================================
REST_FRAMEWORK = {
    # Use JWT for API authentication - stateless, secure, and scalable
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    # By default, require authentication for all endpoints
    # Individual views can override this with permission_classes = [AllowAny]
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    # Rate limiting (throttling) to prevent abuse
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",  # Anonymous users: 100 requests per hour
        "user": "1000/hour",  # Authenticated users: 1000 requests per hour
        "auth": "5/minute",  # Auth endpoints: 5 attempts per minute (stricter)
    },
}

# =============================================================================
# JWT Configuration (Simple JWT)
# =============================================================================
from datetime import timedelta

SIMPLE_JWT = {
    # Access tokens expire after 60 minutes - short-lived for security
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    # Refresh tokens last 7 days - used to get new access tokens
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # Issue a new refresh token when refreshing - prevents token reuse attacks
    "ROTATE_REFRESH_TOKENS": True,
    # Blacklist old refresh tokens after rotation
    "BLACKLIST_AFTER_ROTATION": True,
    # Use Bearer prefix in Authorization header
    "AUTH_HEADER_TYPES": ("Bearer",),
}

# =============================================================================
# dj-rest-auth Configuration
# =============================================================================
# Use JWT tokens instead of Django's session-based tokens
REST_AUTH = {
    "USE_JWT": True,
    "JWT_AUTH_HTTPONLY": False,  # Allow JS to read tokens (needed for SPA)
}

# =============================================================================
# django-allauth Configuration
# =============================================================================
# Email is required for registration
ACCOUNT_EMAIL_REQUIRED = True
# Username is also required (can change to email-only if preferred)
ACCOUNT_USERNAME_REQUIRED = True
# Users log in with username (alternatives: 'email' or 'username_email')
ACCOUNT_AUTHENTICATION_METHOD = "username"
# Skip email verification for now (change to 'mandatory' in production)
# Options: 'none', 'optional', 'mandatory'
ACCOUNT_EMAIL_VERIFICATION = "none"

# =============================================================================
# Celery Configuration (Task Queue)
# =============================================================================
# Redis as message broker - connects Celery workers to task queue
CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "redis://redis:6379/0")
# Redis for storing task results (optional but useful for debugging)
CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND", "redis://redis:6379/0")
# Only accept JSON serialized tasks (secure, no pickle)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
# Use Django's timezone setting
CELERY_TIMEZONE = TIME_ZONE
# Store scheduled tasks in Django database (django-celery-beat)
CELERY_BEAT_SCHEDULER = "django_celery_beat.schedulers:DatabaseScheduler"

# =============================================================================
# Email Configuration (Base - override in dev.py/prod.py)
# =============================================================================
# Default sender for emails
DEFAULT_FROM_EMAIL = os.environ.get(
    "DEFAULT_FROM_EMAIL", "Interview Coordinator <noreply@example.com>"
)

# =============================================================================
# Celery Beat Schedule (Periodic Tasks)
# =============================================================================
from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    # Check for upcoming interviews daily at 9 AM UTC
    "check-upcoming-interviews-daily": {
        "task": "interviews.tasks.check_upcoming_interviews",
        "schedule": crontab(hour=9, minute=0),
    },
}