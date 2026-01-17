from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Interview, UserProfile
from .serializers import InterviewSerializer, UserProfileSerializer


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview CRUD operations.
    
    ModelViewSet automatically provides:
    - list()   -> GET /interviews/        (list all for current user)
    - create() -> POST /interviews/       (create new, auto-assigns user)
    - retrieve() -> GET /interviews/{id}/ (get one, only if owned by user)
    - update() -> PUT /interviews/{id}/   (full update, only if owned)
    - partial_update() -> PATCH /interviews/{id}/ (partial update, only if owned)
    - destroy() -> DELETE /interviews/{id}/ (delete, only if owned)
    
    Security: Users can only see and modify their own interviews.
    """

    serializer_class = InterviewSerializer
    # Require authentication for all operations on this viewset
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter interviews to only return those belonging to the current user.
        This ensures users can never access other users' interviews.
        """
        return Interview.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically set the user field when creating a new interview.
        The user doesn't need to (and can't) specify themselves - it's automatic.
        """
        serializer.save(user=self.request.user)


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    API endpoint for user profile and notification settings.
    
    GET: Retrieve current user's profile
    PUT/PATCH: Update profile settings (notification preferences)
    
    The profile is auto-created when a user registers, so it should always exist.
    """
    # Get or create profile (handles edge case for users created before profiles existed)
    profile, created = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "GET":
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)

    elif request.method in ["PUT", "PATCH"]:
        partial = request.method == "PATCH"
        serializer = UserProfileSerializer(profile, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_test_reminder(request):
    """
    Manually trigger a test email to verify email configuration.
    Useful for users to test their notification setup.
    """
    from .tasks import send_test_email
    
    # Queue the test email task
    send_test_email.delay(request.user.email)
    
    return Response({
        "status": "queued",
        "message": f"Test email queued for {request.user.email}",
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """
    Aggregate statistics for the user's dashboard.
    
    Returns counts by pipeline stage, upcoming interviews,
    and summary metrics like total interviews and success rate.
    """
    user = request.user
    interviews = Interview.objects.filter(user=user)
    now = timezone.now()
    seven_days_later = now + timedelta(days=7)

    # Count interviews in each pipeline stage
    by_stage = {}
    for stage_code, stage_label in Interview.PIPELINE_CHOICES:
        by_stage[stage_code] = interviews.filter(pipeline_stage=stage_code).count()

    # Upcoming interviews (scheduled within next 7 days, not cancelled)
    upcoming_interviews = interviews.filter(
        interview_date__gte=now,
        interview_date__lte=seven_days_later,
        status="scheduled",
    ).order_by("interview_date")

    # Serialize upcoming interviews for the widget
    upcoming_list = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "position": i.position,
            "interview_date": i.interview_date.isoformat(),
            "interview_type": i.interview_type,
            "location": i.location,
        }
        for i in upcoming_interviews[:5]  # Limit to 5 for the widget
    ]

    # Calculate summary stats
    total = interviews.count()
    offers = by_stage.get("offer", 0) + by_stage.get("accepted", 0)
    active = total - by_stage.get("rejected", 0) - by_stage.get("declined", 0) - by_stage.get("accepted", 0)

    # Success rate: (offers + accepted) / total completed applications
    # Completed = offer, rejected, accepted, declined
    completed = offers + by_stage.get("rejected", 0) + by_stage.get("declined", 0)
    success_rate = round((offers / completed) * 100, 1) if completed > 0 else 0

    return Response({
        "total": total,
        "active": active,
        "offers": offers,
        "success_rate": success_rate,
        "upcoming_count": upcoming_interviews.count(),
        "upcoming_interviews": upcoming_list,
        "by_stage": by_stage,
    })
