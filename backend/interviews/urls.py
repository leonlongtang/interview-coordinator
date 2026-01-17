from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import InterviewViewSet, dashboard_stats

# DefaultRouter automatically generates URL patterns for all ViewSet actions
# This creates: /interviews/, /interviews/{id}/, etc.
router = DefaultRouter()
router.register(r"", InterviewViewSet, basename="interview")

urlpatterns = [
    # Dashboard stats endpoint - must come before router urls
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),
] + router.urls

