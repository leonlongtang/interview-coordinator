from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import JobApplication, Interview, UserProfile
from .serializers import (
    JobApplicationSerializer,
    JobApplicationWithInterviewsSerializer,
    InterviewSerializer,
    UserProfileSerializer,
)


class JobApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for JobApplication CRUD operations.
    
    ModelViewSet automatically provides:
    - list()   -> GET /applications/        (list all for current user)
    - create() -> POST /applications/       (create new, auto-assigns user)
    - retrieve() -> GET /applications/{id}/ (get one, only if owned by user)
    - update() -> PUT /applications/{id}/   (full update, only if owned)
    - partial_update() -> PATCH /applications/{id}/ (partial update, only if owned)
    - destroy() -> DELETE /applications/{id}/ (delete, only if owned)
    
    Security: Users can only see and modify their own applications.
    """

    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        """
        Use different serializers for list vs detail views.
        Detail view includes all interviews for the application.
        """
        if self.action == "retrieve":
            return JobApplicationWithInterviewsSerializer
        return JobApplicationSerializer

    def get_queryset(self):
        """
        Filter applications to only return those belonging to the current user.
        This ensures users can never access other users' applications.
        """
        return JobApplication.objects.filter(user=self.request.user).prefetch_related("interviews")

    def perform_create(self, serializer):
        """
        Automatically set the user field when creating a new application.
        The user doesn't need to (and can't) specify themselves - it's automatic.
        """
        serializer.save(user=self.request.user)


class InterviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Interview CRUD operations.
    
    Allows users to manage individual interviews for their job applications.
    Each interview represents an actual interview event (phone screen, technical, etc.)
    
    Security: Users can only access interviews for their own applications.
    """

    serializer_class = InterviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filter interviews to only return those belonging to the current user's applications.
        """
        return Interview.objects.filter(job_application__user=self.request.user)

    def perform_create(self, serializer):
        """
        Validate that the job application belongs to the current user before creating an interview.
        """
        application_id = self.request.data.get("job_application")
        try:
            application = JobApplication.objects.get(id=application_id, user=self.request.user)
            serializer.save(job_application=application)
        except JobApplication.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add interviews to your own applications.")


@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def user_profile(request):
    """
    API endpoint for user profile and notification settings.
    
    GET: Retrieve current user's profile
    PUT/PATCH: Update profile settings (notification preferences)
    
    The profile is auto-created when a user registers, so it should always exist.
    """
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
    
    Returns counts by application status, upcoming interviews,
    and summary metrics like total applications and success rate.
    """
    user = request.user
    applications = JobApplication.objects.filter(user=user)
    interviews = Interview.objects.filter(job_application__user=user)
    now = timezone.now()
    seven_days_later = now + timedelta(days=7)

    # Count applications by status
    by_application_status = {}
    for status_code, status_label in JobApplication.APPLICATION_STATUS_CHOICES:
        by_application_status[status_code] = applications.filter(
            application_status=status_code
        ).count()

    # Count interviews by type
    by_interview_type = {}
    for type_code, type_label in Interview.INTERVIEW_TYPE_CHOICES:
        by_interview_type[type_code] = interviews.filter(
            interview_type=type_code
        ).count()

    # Upcoming interviews (scheduled within next 7 days, still pending)
    upcoming_interviews = interviews.filter(
        scheduled_date__gte=now,
        scheduled_date__lte=seven_days_later,
        outcome="pending",
        job_application__application_status="in_progress",
    ).select_related("job_application").order_by("scheduled_date")

    upcoming_list = [
        {
            "id": i.id,
            "application_id": i.job_application.id,
            "company_name": i.job_application.company_name,
            "position": i.job_application.position,
            "interview_type": i.interview_type,
            "interview_type_display": i.get_interview_type_display(),
            "scheduled_date": i.scheduled_date.isoformat(),
            "location": i.location,
        }
        for i in upcoming_interviews[:5]
    ]

    # Awaiting response: applications with no interviews yet
    from django.db.models import Count
    awaiting_response = applications.filter(
        application_status="in_progress",
    ).annotate(
        interview_count=Count("interviews")
    ).filter(interview_count=0).order_by("-application_date", "-created_at")

    awaiting_list = [
        {
            "id": a.id,
            "company_name": a.company_name,
            "position": a.position,
            "application_date": a.application_date.isoformat() if a.application_date else None,
            "days_waiting": (timezone.now().date() - a.application_date).days if a.application_date else None,
        }
        for a in awaiting_response[:5]
    ]

    # Needs review: interviews that have passed but outcome not updated
    needs_review = interviews.filter(
        scheduled_date__lt=now,
        outcome="pending",
        job_application__application_status="in_progress",
    ).select_related("job_application").order_by("-scheduled_date")

    needs_review_list = [
        {
            "id": i.id,
            "application_id": i.job_application.id,
            "company_name": i.job_application.company_name,
            "position": i.job_application.position,
            "interview_type": i.interview_type,
            "interview_type_display": i.get_interview_type_display(),
            "scheduled_date": i.scheduled_date.isoformat(),
            "days_ago": (now.date() - i.scheduled_date.date()).days,
        }
        for i in needs_review[:5]
    ]

    # Calculate summary stats
    total = applications.count()
    
    # Offers = offer received + accepted
    offers = by_application_status.get("offer", 0) + by_application_status.get("accepted", 0)
    
    # Active = still in progress
    active = by_application_status.get("in_progress", 0)

    # Success rate: (offers + accepted) / total resolved applications
    resolved = (
        by_application_status.get("offer", 0) +
        by_application_status.get("accepted", 0) +
        by_application_status.get("rejected", 0) +
        by_application_status.get("declined", 0)
    )
    success_rate = round((offers / resolved) * 100, 1) if resolved > 0 else 0

    # Total interviews
    total_interviews = interviews.count()

    return Response({
        "total": total,
        "active": active,
        "offers": offers,
        "success_rate": success_rate,
        "total_interviews": total_interviews,
        "upcoming_count": upcoming_interviews.count(),
        "upcoming_interviews": upcoming_list,
        "awaiting_count": awaiting_response.count(),
        "awaiting_response": awaiting_list,
        "needs_review_count": needs_review.count(),
        "needs_review": needs_review_list,
        "by_application_status": by_application_status,
        "by_interview_type": by_interview_type,
    })
