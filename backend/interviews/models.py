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
