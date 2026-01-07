from django.contrib.auth.models import User
from django.db import models


class Interview(models.Model):
    """
    Represents a job interview. This is the core model for the Interview Coordinator app.
    Tracks company, position, scheduling details, pipeline stage, and status of each interview.
    Each interview belongs to a specific user (ForeignKey relationship).
    """

    # Choices for interview_type field - represents the format of the interview
    TYPE_CHOICES = [
        ("phone", "Phone Screen"),
        ("technical", "Technical"),
        ("behavioral", "Behavioral"),
        ("final", "Final Round"),
    ]

    # Choices for status field - tracks the current state of the interview appointment
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    # Choices for location field - where the interview takes place
    LOCATION_CHOICES = [
        ("onsite", "On-site"),
        ("remote", "Remote"),
        ("hybrid", "Hybrid"),
    ]

    # Pipeline stage choices - tracks overall job application progress
    # This represents where the candidate is in the hiring pipeline
    PIPELINE_CHOICES = [
        ("applied", "Applied"),
        ("screening", "Phone Screening"),
        ("technical", "Technical Interview"),
        ("onsite", "Onsite Interview"),
        ("final", "Final Round"),
        ("offer", "Offer Received"),
        ("rejected", "Rejected"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]

    # User ownership - each interview belongs to one user
    # CASCADE means if user is deleted, their interviews are also deleted
    # related_name allows reverse lookup: user.interviews.all()
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interviews",
    )

    # Core interview details
    company_name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    interview_date = models.DateTimeField()

    # Interview metadata using choices for data consistency
    interview_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="phone",
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="scheduled",
    )
    location = models.CharField(
        max_length=20,
        choices=LOCATION_CHOICES,
        default="remote",
    )

    # Pipeline tracking - where the candidate is in the overall hiring process
    pipeline_stage = models.CharField(
        max_length=20,
        choices=PIPELINE_CHOICES,
        default="applied",
    )

    # Date when the application was submitted (optional, for tracking time in pipeline)
    application_date = models.DateField(null=True, blank=True)

    # Optional notes field for additional context
    notes = models.TextField(blank=True, null=True)

    # Automatic timestamps - auto_now_add sets on creation, auto_now updates on every save
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Orders interviews by date descending (most recent first)
        ordering = ["-interview_date"]

    def __str__(self):
        """String representation shown in admin and shell."""
        return f"{self.company_name} - {self.position}"

    @property
    def days_in_pipeline(self):
        """Calculate how many days since application was submitted."""
        if self.application_date:
            from django.utils import timezone
            return (timezone.now().date() - self.application_date).days
        return None
