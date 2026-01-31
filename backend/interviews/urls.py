from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import JobApplicationViewSet, InterviewViewSet, dashboard_stats

# DefaultRouter automatically generates URL patterns for all ViewSet actions
# Register interviews FIRST to avoid conflicts with application IDs
# Interviews: /api/applications/interviews/, /api/applications/interviews/{id}/
# Applications: /api/applications/, /api/applications/{id}/
router = DefaultRouter()
router.register(r"interviews", InterviewViewSet, basename="interview")
router.register(r"", JobApplicationViewSet, basename="application")

urlpatterns = [
    # Dashboard stats endpoint - must come before router urls to avoid conflict
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),
] + router.urls
