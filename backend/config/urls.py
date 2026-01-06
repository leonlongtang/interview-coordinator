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
from rest_framework_simplejwt.views import TokenRefreshView


def health_check(request):
    """Simple health check endpoint for container orchestration."""
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check, name="health_check"),
    
    # API routes
    path("api/interviews/", include("interviews.urls")),
    
    # ==========================================================================
    # Authentication endpoints (provided by dj-rest-auth)
    # ==========================================================================
    # POST /api/auth/login/     - Login with username/password, returns JWT tokens
    # POST /api/auth/logout/    - Logout (blacklists refresh token)
    # POST /api/auth/password/reset/ - Request password reset email
    # POST /api/auth/password/change/ - Change password (authenticated)
    # GET  /api/auth/user/      - Get current user details
    path("api/auth/", include("dj_rest_auth.urls")),
    
    # POST /api/auth/registration/ - Register new user
    # POST /api/auth/registration/verify-email/ - Verify email address
    path("api/auth/registration/", include("dj_rest_auth.registration.urls")),
    
    # POST /api/auth/token/refresh/ - Get new access token using refresh token
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
