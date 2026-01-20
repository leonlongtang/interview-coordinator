from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Interview, InterviewRound, UserProfile
from .serializers import (
    InterviewSerializer,
    InterviewWithRoundsSerializer,
    InterviewRoundSerializer,
    UserProfileSerializer,
)


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

    # Require authentication for all operations on this viewset
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Use different serializers for list vs detail views.
        Detail view includes interview rounds history.
        """
        if self.action == "retrieve":
            return InterviewWithRoundsSerializer
        return InterviewSerializer

    def get_queryset(self):
        """
        Filter interviews to only return those belonging to the current user.
        This ensures users can never access other users' interviews.
        """
        return Interview.objects.filter(user=self.request.user).prefetch_related("rounds")

    def perform_create(self, serializer):
        """
        Automatically set the user field when creating a new interview.
        The user doesn't need to (and can't) specify themselves - it's automatic.
        """
        serializer.save(user=self.request.user)


class InterviewRoundViewSet(viewsets.ModelViewSet):
    """
    ViewSet for InterviewRound CRUD operations.
    
    Allows users to manage individual interview rounds (stages) for their interviews.
    Rounds track the history of each stage with notes, outcome, and timing.
    
    Security: Users can only access rounds for their own interviews.
    """

    serializer_class = InterviewRoundSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter rounds to only return those belonging to the current user's interviews.
        """
        return InterviewRound.objects.filter(interview__user=self.request.user)

    def perform_create(self, serializer):
        """
        Validate that the interview belongs to the current user before creating a round.
        """
        interview_id = self.request.data.get("interview")
        try:
            interview = Interview.objects.get(id=interview_id, user=self.request.user)
            serializer.save()
        except Interview.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add rounds to your own interviews.")


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
    
    Returns counts by interview stage, application status, upcoming interviews,
    and summary metrics like total interviews and success rate.
    """
    user = request.user
    interviews = Interview.objects.filter(user=user)
    now = timezone.now()
    seven_days_later = now + timedelta(days=7)

    # Count interviews by interview stage (where in the process)
    by_interview_stage = {}
    for stage_code, stage_label in Interview.INTERVIEW_STAGE_CHOICES:
        by_interview_stage[stage_code] = interviews.filter(interview_stage=stage_code).count()

    # Count interviews by application status (outcome)
    by_application_status = {}
    for status_code, status_label in Interview.APPLICATION_STATUS_CHOICES:
        by_application_status[status_code] = interviews.filter(application_status=status_code).count()

    # Upcoming interviews (scheduled within next 7 days, not cancelled)
    upcoming_interviews = interviews.filter(
        interview_date__gte=now,
        interview_date__lte=seven_days_later,
        status="scheduled",
        application_status="in_progress",  # Only show if still in progress
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

    # Awaiting response: applied but no interview scheduled yet
    # These are applications where user is waiting to hear back
    awaiting_response = interviews.filter(
        interview_date__isnull=True,
        interview_stage__in=["applied", "screening"],  # Early stages without scheduled interview
        application_status="in_progress",  # Still active
    ).order_by("-application_date", "-created_at")

    awaiting_list = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "position": i.position,
            "application_date": i.application_date.isoformat() if i.application_date else None,
            "interview_stage": i.interview_stage,
            "days_waiting": (timezone.now().date() - i.application_date).days if i.application_date else None,
        }
        for i in awaiting_response[:5]  # Limit to 5 for the widget
    ]

    # Needs review: interviews that have passed but status not updated
    # These need user to record how the interview went and update status
    needs_review = interviews.filter(
        interview_date__lt=now,
        status="scheduled",  # Still marked as scheduled but date has passed
        application_status="in_progress",  # Not yet resolved
    ).order_by("-interview_date")

    needs_review_list = [
        {
            "id": i.id,
            "company_name": i.company_name,
            "position": i.position,
            "interview_date": i.interview_date.isoformat(),
            "interview_type": i.interview_type,
            "interview_stage": i.interview_stage,
            "days_ago": (now.date() - i.interview_date.date()).days,
        }
        for i in needs_review[:5]  # Limit to 5 for the widget
    ]

    # Calculate summary stats using new fields
    total = interviews.count()
    
    # Offers = offer received + accepted
    offers = by_application_status.get("offer", 0) + by_application_status.get("accepted", 0)
    
    # Active = still in progress
    active = by_application_status.get("in_progress", 0)

    # Success rate: (offers + accepted) / total resolved applications
    # Resolved = offer, rejected, accepted, declined (not in_progress or withdrawn)
    resolved = (
        by_application_status.get("offer", 0) +
        by_application_status.get("accepted", 0) +
        by_application_status.get("rejected", 0) +
        by_application_status.get("declined", 0)
    )
    success_rate = round((offers / resolved) * 100, 1) if resolved > 0 else 0

    return Response({
        "total": total,
        "active": active,
        "offers": offers,
        "success_rate": success_rate,
        "upcoming_count": upcoming_interviews.count(),
        "upcoming_interviews": upcoming_list,
        "awaiting_count": awaiting_response.count(),
        "awaiting_response": awaiting_list,
        "needs_review_count": needs_review.count(),
        "needs_review": needs_review_list,
        "by_interview_stage": by_interview_stage,
        "by_application_status": by_application_status,
    })
