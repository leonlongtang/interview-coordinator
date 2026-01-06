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

    # Local apps
    "interviews",
]

# Required by django-allauth - identifies the current site in multi-site setups
SITE_ID = 1

# Middleware
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "allauth.account.middleware.AccountMiddleware",  # Required by django-allauth
]

# URLs
ROOT_URLCONF = "config.urls"

# Templates (still OK even for API-only)
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
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
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ["DB_HOST"],
        "PORT": os.environ["DB_PORT"],
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
ACCOUNT_EMAIL_VERIFICATION = "optional"
