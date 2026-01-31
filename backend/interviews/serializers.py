import re
from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import JobApplication, Interview, UserProfile


# =============================================================================
# Input Sanitization Utilities
# =============================================================================

def sanitize_text(value: str, max_length: int = None) -> str:
    """
    Sanitize text input to prevent XSS and injection attacks.
    
    - Strips leading/trailing whitespace
    - Removes null bytes and control characters
    - Truncates to max_length if specified
    """
    if not value:
        return value
    
    # Remove null bytes and control characters (except newlines/tabs)
    value = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]', '', value)
    
    # Strip whitespace
    value = value.strip()
    
    # Truncate if needed
    if max_length and len(value) > max_length:
        value = value[:max_length]
    
    return value


def validate_no_html(value: str) -> str:
    """
    Validate that input doesn't contain HTML tags.
    Prevents basic XSS attempts in text fields.
    """
    if not value:
        return value
    
    # Check for HTML-like patterns
    if re.search(r'<[^>]+>', value):
        raise serializers.ValidationError(
            "HTML tags are not allowed in this field."
        )
    
    return value


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile - manages notification preferences.
    Used for the settings page where users can configure reminders.
    """

    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            "username",
            "email",
            "email_notifications_enabled",
            "reminder_days_before",
            "reminder_time",
        ]
        read_only_fields = ["username", "email"]

    def validate_reminder_days_before(self, value):
        """Ensure reminder days is reasonable (1-7 days)."""
        if value < 1 or value > 7:
            raise serializers.ValidationError(
                "Reminder days must be between 1 and 7."
            )
        return value


class InterviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Interview - represents an actual interview event.
    Each interview belongs to a JobApplication and tracks scheduling,
    outcome, and feedback for that specific interview.
    """

    # Display fields for frontend convenience
    interview_type_display = serializers.CharField(
        source="get_interview_type_display", read_only=True
    )
    outcome_display = serializers.CharField(
        source="get_outcome_display", read_only=True
    )
    location_display = serializers.CharField(
        source="get_location_display", read_only=True
    )
    
    # Computed fields
    is_upcoming = serializers.BooleanField(read_only=True)
    is_past = serializers.BooleanField(read_only=True)

    class Meta:
        model = Interview
        fields = [
            "id",
            "job_application",
            "interview_type",
            "interview_type_display",
            "scheduled_date",
            "completed_date",
            "duration_minutes",
            "location",
            "location_display",
            "interviewer_name",
            "interviewer_title",
            "feedback",
            "outcome",
            "outcome_display",
            "reminder_sent",
            "is_upcoming",
            "is_past",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "interview_type_display",
            "outcome_display",
            "location_display",
            "is_upcoming",
            "is_past",
        ]

    def validate_scheduled_date(self, value):
        """
        Prevent scheduling new interviews in the past.
        Only applies when creating (not updating) an interview.
        """
        if value is None:
            return value
        # self.instance is None when creating, exists when updating
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError(
                "Interview date cannot be in the past."
            )
        return value

    def validate_duration_minutes(self, value):
        """Ensure duration is reasonable (1-480 minutes / 8 hours max)."""
        if value is not None and (value < 1 or value > 480):
            raise serializers.ValidationError(
                "Duration must be between 1 and 480 minutes."
            )
        return value

    def validate_feedback(self, value):
        """Sanitize feedback field."""
        if value:
            value = sanitize_text(value, max_length=5000)
            if re.search(r'<script', value, re.IGNORECASE):
                raise serializers.ValidationError(
                    "Script tags are not allowed."
                )
        return value

    def validate_interviewer_name(self, value):
        """Sanitize interviewer name field."""
        if value:
            value = sanitize_text(value, max_length=200)
            value = validate_no_html(value)
        return value

    def validate_interviewer_title(self, value):
        """Sanitize interviewer title field."""
        if value:
            value = sanitize_text(value, max_length=200)
            value = validate_no_html(value)
        return value


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for JobApplication - the overall job application journey.
    Tracks company, position, application date, and final outcome.
    Individual interviews are managed separately via InterviewSerializer.
    """

    # Computed read-only fields for frontend convenience
    days_in_pipeline = serializers.SerializerMethodField()
    current_stage = serializers.CharField(read_only=True)
    interview_count = serializers.SerializerMethodField()
    next_interview_date = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "company_name",
            "position",
            "application_date",
            "application_status",
            "notes",
            "job_url",
            "salary_min",
            "salary_max",
            "created_at",
            "updated_at",
            # Computed fields
            "days_in_pipeline",
            "current_stage",
            "interview_count",
            "next_interview_date",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "days_in_pipeline",
            "current_stage",
            "interview_count",
            "next_interview_date",
        ]

    def get_days_in_pipeline(self, obj):
        """
        Calculate days since application was submitted.
        Returns None if no application_date is set.
        """
        if obj.application_date:
            return (timezone.now().date() - obj.application_date).days
        return None

    def get_interview_count(self, obj):
        """Return the total number of interviews for this application."""
        return obj.interviews.count()

    def get_next_interview_date(self, obj):
        """Return the next upcoming interview date, if any."""
        next_interview = obj.next_interview
        if next_interview and next_interview.scheduled_date:
            return next_interview.scheduled_date.isoformat()
        return None

    def validate_company_name(self, value):
        """Sanitize and validate company name."""
        value = sanitize_text(value, max_length=200)
        value = validate_no_html(value)
        if len(value) < 2:
            raise serializers.ValidationError(
                "Company name must be at least 2 characters."
            )
        return value

    def validate_position(self, value):
        """Sanitize and validate position title."""
        value = sanitize_text(value, max_length=200)
        value = validate_no_html(value)
        if len(value) < 2:
            raise serializers.ValidationError(
                "Position must be at least 2 characters."
            )
        return value

    def validate_notes(self, value):
        """Sanitize notes field - allows longer text but still sanitized."""
        if value:
            value = sanitize_text(value, max_length=5000)
            if re.search(r'<script', value, re.IGNORECASE):
                raise serializers.ValidationError(
                    "Script tags are not allowed."
                )
        return value

    def validate_job_url(self, value):
        """Validate job URL if provided."""
        if value:
            value = sanitize_text(value, max_length=500)
        return value


class JobApplicationWithInterviewsSerializer(JobApplicationSerializer):
    """
    Extended JobApplication serializer that includes all interviews.
    Used for detailed view of an application with full interview history.
    """

    interviews = InterviewSerializer(many=True, read_only=True)

    class Meta(JobApplicationSerializer.Meta):
        fields = JobApplicationSerializer.Meta.fields + ["interviews"]
