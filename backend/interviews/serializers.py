from django.utils import timezone
from rest_framework import serializers

from .models import Interview


class InterviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Interview model.
    Converts Interview instances to/from JSON for the API.
    Includes validation to prevent scheduling interviews in the past.
    """

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
            "notes",
            "created_at",
            "updated_at",
        ]
        # These fields are auto-generated and shouldn't be modified via API
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_interview_date(self, value):
        """
        Prevent scheduling new interviews in the past.
        Only applies when creating (not updating) an interview.
        """
        # self.instance is None when creating, exists when updating
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError(
                "Interview date cannot be in the past."
            )
        return value

