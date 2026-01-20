from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import InterviewViewSet, InterviewRoundViewSet, dashboard_stats

# DefaultRouter automatically generates URL patterns for all ViewSet actions
# Main interviews: /api/interviews/, /api/interviews/{id}/
# Rounds: /api/interviews/rounds/, /api/interviews/rounds/{id}/
router = DefaultRouter()
router.register(r"", InterviewViewSet, basename="interview")
router.register(r"rounds", InterviewRoundViewSet, basename="round")

urlpatterns = [
    # Dashboard stats endpoint - must come before router urls to avoid conflict
    path("dashboard-stats/", dashboard_stats, name="dashboard-stats"),
] + router.urls

