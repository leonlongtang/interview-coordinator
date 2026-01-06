from rest_framework.routers import DefaultRouter

from .views import InterviewViewSet

# DefaultRouter automatically generates URL patterns for all ViewSet actions
# This creates: /interviews/, /interviews/{id}/, etc.
router = DefaultRouter()
router.register(r"", InterviewViewSet, basename="interview")

urlpatterns = router.urls

