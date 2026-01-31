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


class JobApplication(models.Model):
    """
    Represents a job application - the entire journey from applying to a company
    through all interview stages to final outcome.
    
    This is the parent model that contains one or more Interview records
    (each Interview represents an actual interview event like phone screen, technical, etc.)
    """

    # Application status choices - the outcome/decision status
    APPLICATION_STATUS_CHOICES = [
        ("in_progress", "In Progress"),
        ("offer", "Offer Received"),
        ("accepted", "Accepted"),
        ("rejected", "Rejected"),
        ("declined", "Declined"),
        ("withdrawn", "Withdrawn"),
    ]

    # User ownership - each application belongs to one user
    # CASCADE means if user is deleted, their applications are also deleted
    # related_name allows reverse lookup: user.applications.all()
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    # Core application details
    company_name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)

    # Date when the application was submitted
    application_date = models.DateField(null=True, blank=True)

    # Application status - the outcome/decision
    application_status = models.CharField(
        max_length=20,
        choices=APPLICATION_STATUS_CHOICES,
        default="in_progress",
    )

    # Optional notes field for additional context about the application
    notes = models.TextField(blank=True, null=True)

    # Job posting URL (optional but useful for reference)
    job_url = models.URLField(max_length=500, blank=True, null=True)

    # Salary information (optional)
    salary_min = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Minimum salary expectation or offer amount",
    )
    salary_max = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Maximum salary expectation or offer amount",
    )

    # Automatic timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"

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

    @property
    def current_stage(self):
        """
        Derive the current interview stage from the most recent interview.
        Returns 'applied' if no interviews exist yet.
        """
        latest_interview = self.interviews.order_by("-scheduled_date", "-created_at").first()
        if latest_interview:
            return latest_interview.interview_type
        return "applied"

    @property
    def next_interview(self):
        """Get the next upcoming interview for this application."""
        from django.utils import timezone
        return self.interviews.filter(
            scheduled_date__gte=timezone.now(),
            outcome="pending",
        ).order_by("scheduled_date").first()


class Interview(models.Model):
    """
    Represents a single interview event in the job application process.
    
    Each interview belongs to a JobApplication and tracks:
    - The type of interview (phone screen, technical, etc.)
    - When it's scheduled and when it happened
    - The outcome and any feedback
    
    A JobApplication can have multiple interviews as the candidate
    progresses through the hiring pipeline.
    """

    # Interview type choices - expanded to cover more interview formats
    INTERVIEW_TYPE_CHOICES = [
        ("phone_screening", "Phone Screening"),
        ("recruiter_call", "Recruiter Call"),
        ("technical", "Technical Interview"),
        ("coding", "Coding Challenge"),
        ("system_design", "System Design"),
        ("behavioral", "Behavioral Interview"),
        ("hiring_manager", "Hiring Manager"),
        ("team_fit", "Team Fit / Culture"),
        ("onsite", "Onsite Interview"),
        ("final", "Final Round"),
        ("hr_final", "HR Final"),
        ("offer_call", "Offer Call"),
    ]

    # Location choices - where the interview takes place
    LOCATION_CHOICES = [
        ("remote", "Remote"),
        ("onsite", "On-site"),
        ("hybrid", "Hybrid"),
    ]

    # Outcome choices for each interview
    OUTCOME_CHOICES = [
        ("pending", "Pending"),
        ("passed", "Passed"),
        ("failed", "Failed"),
        ("cancelled", "Cancelled"),
    ]

    # Link to parent job application
    job_application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="interviews",
    )

    # Interview type - what kind of interview this is
    interview_type = models.CharField(
        max_length=20,
        choices=INTERVIEW_TYPE_CHOICES,
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

    # Location of the interview
    location = models.CharField(
        max_length=20,
        choices=LOCATION_CHOICES,
        default="remote",
    )

    # Interviewer information
    interviewer_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Name(s) of the interviewer(s)",
    )
    interviewer_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Title/role of the interviewer",
    )

    # Feedback and notes about this interview
    feedback = models.TextField(
        blank=True,
        null=True,
        help_text="Feedback received or personal notes about how it went",
    )

    # Outcome of this interview
    outcome = models.CharField(
        max_length=20,
        choices=OUTCOME_CHOICES,
        default="pending",
    )

    # Email reminder tracking - prevents duplicate reminders
    reminder_sent = models.BooleanField(
        default=False,
        help_text="Whether an email reminder has been sent for this interview",
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["scheduled_date", "created_at"]
        verbose_name = "Interview"
        verbose_name_plural = "Interviews"

    def __str__(self):
        return f"{self.job_application.company_name} - {self.get_interview_type_display()} ({self.get_outcome_display()})"

    @property
    def is_upcoming(self):
        """Check if this interview is in the future."""
        if not self.scheduled_date:
            return False
        from django.utils import timezone
        return self.scheduled_date > timezone.now()

    @property
    def is_past(self):
        """Check if this interview has passed."""
        if not self.scheduled_date:
            return False
        from django.utils import timezone
        return self.scheduled_date < timezone.now()
