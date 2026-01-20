from datetime import timedelta

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers

from .models import Interview, InterviewRound, UserProfile


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
    Serializer for the Interview model.
    Converts Interview instances to/from JSON for the API.
    Includes validation and computed fields for tracking.
    """

    # Computed read-only fields for frontend convenience
    days_in_pipeline = serializers.SerializerMethodField()
    is_upcoming = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = [
            "id",
            "company_name",
            "position",
            "interview_date",
            "interview_type",
            "status",
            "location",
            # New split fields
            "interview_stage",
            "application_status",
            # Legacy field (kept for backwards compatibility during transition)
            "pipeline_stage",
            "application_date",
            "notes",
            "created_at",
            "updated_at",
            # Computed fields
            "days_in_pipeline",
            "is_upcoming",
        ]
        # These fields are auto-generated and shouldn't be modified via API
        read_only_fields = ["id", "created_at", "updated_at", "days_in_pipeline", "is_upcoming"]

    def get_days_in_pipeline(self, obj):
        """
        Calculate days since application was submitted.
        Returns None if no application_date is set.
        """
        if obj.application_date:
            return (timezone.now().date() - obj.application_date).days
        return None

    def get_is_upcoming(self, obj):
        """
        Check if interview is scheduled within the next 7 days.
        Returns False if no interview date is set.
        """
        if not obj.interview_date:
            return False
        now = timezone.now()
        seven_days_later = now + timedelta(days=7)
        return now <= obj.interview_date <= seven_days_later

    def validate_interview_date(self, value):
        """
        Prevent scheduling new interviews in the past.
        Only applies when creating (not updating) an interview.
        Allows None for applications without scheduled interviews.
        """
        if value is None:
            return value
        # self.instance is None when creating, exists when updating
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError(
                "Interview date cannot be in the past."
            )
        return value


class InterviewRoundSerializer(serializers.ModelSerializer):
    """
    Serializer for InterviewRound - tracks individual interview stages.
    Each round represents one step in the interview process with its own
    scheduled date, notes, and outcome.
    """

    stage_display = serializers.CharField(source="get_stage_display", read_only=True)
    outcome_display = serializers.CharField(source="get_outcome_display", read_only=True)

    class Meta:
        model = InterviewRound
        fields = [
            "id",
            "interview",
            "stage",
            "stage_display",
            "scheduled_date",
            "completed_date",
            "duration_minutes",
            "notes",
            "outcome",
            "outcome_display",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "stage_display", "outcome_display"]

    def validate_duration_minutes(self, value):
        """Ensure duration is reasonable (1-480 minutes / 8 hours max)."""
        if value is not None and (value < 1 or value > 480):
            raise serializers.ValidationError(
                "Duration must be between 1 and 480 minutes."
            )
        return value


class InterviewWithRoundsSerializer(InterviewSerializer):
    """
    Extended Interview serializer that includes all interview rounds.
    Used for detailed view of an interview with full history.
    """

    rounds = InterviewRoundSerializer(many=True, read_only=True)

    class Meta(InterviewSerializer.Meta):
        fields = InterviewSerializer.Meta.fields + ["rounds"]

