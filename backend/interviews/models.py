from django.contrib.auth.models import User
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver


class UserProfile(models.Model):
    """
    Extended user profile for notification preferences.
    Auto-created when a new User is registered via signal.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    # Email notification settings
    email_notifications_enabled = models.BooleanField(
        default=True,
        help_text="Receive email reminders for upcoming interviews",
    )
    reminder_days_before = models.PositiveIntegerField(
        default=1,
        help_text="Days before interview to send reminder",
    )
    reminder_time = models.TimeField(
        default="09:00",
        help_text="Preferred time to receive reminders (24h format)",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to auto-create UserProfile when a User is created.
    This ensures every user has notification preferences from the start.
    """
    if created:
        UserProfile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal handler to save UserProfile when User is saved.
    Handles edge case where profile might not exist for older users.
    """
    if hasattr(instance, "profile"):
        instance.profile.save()


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

    # Interview stage choices - where you are in the interview process
    INTERVIEW_STAGE_CHOICES = [
        ("applied", "Applied"),
        ("screening", "Phone Screening"),
        ("technical", "Technical Interview"),
        ("onsite", "Onsite Interview"),
        ("final", "Final Round"),
        ("completed", "Completed"),  # Finished all interview rounds
    ]

    # Application status choices - the outcome/decision status
    APPLICATION_STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("offer", "Offer Received"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("declined", "Declined"),
        ("withdrawn", "Withdrawn"),  # Candidate withdrew
    ]

    # DEPRECATED: Keep for backwards compatibility during migration
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
    # Optional - null when application submitted but no interview scheduled yet
    interview_date = models.DateTimeField(null=True, blank=True)

    # Interview metadata - optional until interview is scheduled
    # These fields are only relevant once an interview date is set
    interview_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        null=True,
        blank=True,
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        null=True,
        blank=True,
    )
    location = models.CharField(
        max_length=20,
        choices=LOCATION_CHOICES,
        null=True,
        blank=True,
    )

    # Interview stage - where you are in the interview process
    interview_stage = models.CharField(
        max_length=20,
        choices=INTERVIEW_STAGE_CHOICES,
        default="applied",
    )

    # Application status - the outcome/decision
    application_status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS_CHOICES,
        default="in_progress",
    )

    # DEPRECATED: Keep for backwards compatibility, will be removed after migration
    pipeline_stage = models.CharField(
        max_length=20,
        choices=PIPELINE_CHOICES,
        default="applied",
    )

    # Date when the application was submitted (optional, for tracking time in pipeline)
    application_date = models.DateField(null=True, blank=True)

    # Optional notes field for additional context
    notes = models.TextField(blank=True, null=True)

    # Email reminder tracking - prevents duplicate reminders
    reminder_sent = models.BooleanField(
        default=False,
        help_text="Whether an email reminder has been sent for this interview",
    )

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

    def save(self, *args, **kwargs):
        """
        Override save to handle auto-behaviors:
        1. Auto-set stage to 'completed' when status becomes offer/accepted
        2. Track previous stage for round creation
        """
        # Auto-complete stage when final status is set
        if self.application_status in ["offer", "accepted"]:
            self.interview_stage = "completed"

        # Check if this is an update (has pk) and stage is changing
        is_new = self.pk is None
        old_stage = None
        if not is_new:
            try:
                old_instance = Interview.objects.get(pk=self.pk)
                old_stage = old_instance.interview_stage
            except Interview.DoesNotExist:
                pass

        super().save(*args, **kwargs)

        # If stage advanced, create a new round for the new stage
        if not is_new and old_stage and old_stage != self.interview_stage:
            # Only create round if advancing (not going to 'completed' status)
            if self.interview_stage != "completed" and self.interview_stage != "applied":
                InterviewRound.objects.create(
                    interview=self,
                    stage=self.interview_stage,
                    outcome="pending",
                )


class InterviewRound(models.Model):
    """
    Represents a single interview round/stage in the interview process.
    Tracks the history of each stage with notes, outcome, and timing.
    Multiple rounds can belong to one Interview (e.g., screening → technical → onsite).
    """

    # Stage choices - matches the interview stages (excluding applied and completed)
    STAGE_CHOICES = [
        ("screening", "Phone Screening"),
        ("technical", "Technical Interview"),
        ("onsite", "Onsite Interview"),
        ("final", "Final Round"),
    ]

    # Outcome choices for each round
    OUTCOME_CHOICES = [
        ("pending", "Pending"),
        ("passed", "Passed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    # Link to parent interview
    interview = models.ForeignKey(
        Interview,
        on_delete=models.CASCADE,
        related_name="rounds",
    )

    # Which stage this round represents
    stage = models.CharField(
        max_length=20,
        choices=STAGE_CHOICES,
    )

    # Scheduling
    scheduled_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the interview is scheduled",
    )
    completed_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the interview actually happened",
    )

    # Duration in minutes (filled after interview)
    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="How long the interview lasted in minutes",
    )

    # Notes about this specific round
    notes = models.TextField(
        blank=True,
        null=True,
        help_text="Notes about how this round went, questions asked, etc.",
    )

    # Outcome of this round
    outcome = models.CharField(
        max_length=20,
        choices=OUTCOME_CHOICES,
        default="pending",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]  # Chronological order

    def __str__(self):
        return f"{self.interview.company_name} - {self.get_stage_display()} ({self.get_outcome_display()})"
