"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path

from interviews.views import user_profile, send_test_reminder
from interviews.auth_views import (
    RateLimitedLoginView,
    RateLimitedRegisterView,
    RateLimitedLogoutView,
    RateLimitedPasswordChangeView,
    RateLimitedPasswordResetView,
    RateLimitedTokenRefreshView,
)


def health_check(request):
    """Simple health check endpoint for container orchestration."""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health_check"),
    
    # API routes
    path("api/interviews/", include("interviews.urls")),
    
    # ==========================================================================
    # User Profile / Settings endpoints
    # ==========================================================================
    # GET/PUT/PATCH /api/profile/ - Get or update notification preferences
    path("api/profile/", user_profile, name="user_profile"),
    # POST /api/profile/test-email/ - Send a test email to verify notifications
    path("api/profile/test-email/", send_test_reminder, name="send_test_reminder"),
    
    # ==========================================================================
    # Authentication endpoints with rate limiting
    # ==========================================================================
    # These custom views wrap dj-rest-auth with:
    # - Strict rate limiting (5 attempts/minute) to prevent brute force
    # - Security logging for audit trails
    
    # POST /api/auth/login/ - Login with username/password, returns JWT tokens
    path("api/auth/login/", RateLimitedLoginView.as_view(), name="rest_login"),
    # POST /api/auth/logout/ - Logout (blacklists refresh token)
    path("api/auth/logout/", RateLimitedLogoutView.as_view(), name="rest_logout"),
    # POST /api/auth/password/change/ - Change password (authenticated)
    path("api/auth/password/change/", RateLimitedPasswordChangeView.as_view(), name="rest_password_change"),
    # POST /api/auth/password/reset/ - Request password reset email
    path("api/auth/password/reset/", RateLimitedPasswordResetView.as_view(), name="rest_password_reset"),
    
    # Include remaining dj-rest-auth URLs (user details, etc.)
    # GET /api/auth/user/ - Get current user details
    path("api/auth/", include("dj_rest_auth.urls")),
    
    # POST /api/auth/registration/ - Register new user (rate limited)
    path("api/auth/registration/", RateLimitedRegisterView.as_view(), name="rest_register"),
    # Include remaining registration URLs (verify-email, etc.)
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    
    # POST /api/auth/token/refresh/ - Get new access token using refresh token
    path("api/auth/token/refresh/", RateLimitedTokenRefreshView.as_view(), name="token_refresh"),
]
