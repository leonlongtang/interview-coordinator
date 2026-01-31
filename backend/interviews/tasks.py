from datetime import timedelta
import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from .models import Interview, UserProfile

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_interview_reminder(self, interview_id: int) -> dict:
    """
    Send an email reminder for a specific interview.
    
    This task:
    1. Fetches the interview and user preferences
    2. Checks if reminders are enabled
    3. Renders and sends the email
    4. Marks the interview as reminder_sent
    
    Args:
        interview_id: The ID of the interview to send a reminder for
        
    Returns:
        dict with status and details
    """
    try:
        # Fetch interview with related job application and user profile
        interview = Interview.objects.select_related(
            "job_application",
            "job_application__user",
            "job_application__user__profile"
        ).get(id=interview_id)
    except Interview.DoesNotExist:
        logger.error(f"Interview {interview_id} not found")
        return {"status": "error", "message": f"Interview {interview_id} not found"}

    # Check if reminder already sent
    if interview.reminder_sent:
        logger.info(f"Reminder already sent for interview {interview_id}")
        return {"status": "skipped", "message": "Reminder already sent"}

    # Get user from job application
    user = interview.job_application.user

    # Check user preferences
    try:
        profile = user.profile
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=user)

    if not profile.email_notifications_enabled:
        logger.info(f"User {user.username} has notifications disabled")
        return {"status": "skipped", "message": "User has notifications disabled"}

    # Calculate time until interview
    now = timezone.now()
    time_diff = interview.scheduled_date - now
    
    if time_diff.days > 0:
        time_until = f"in {time_diff.days} day{'s' if time_diff.days > 1 else ''}"
    elif time_diff.seconds > 3600:
        hours = time_diff.seconds // 3600
        time_until = f"in {hours} hour{'s' if hours > 1 else ''}"
    else:
        time_until = "very soon"

    # Get application details
    application = interview.job_application

    # Render email templates
    context = {
        "user": user,
        "interview": interview,
        "application": application,
        "time_until": time_until,
    }
    
    html_message = render_to_string("emails/interview_reminder.html", context)
    plain_message = render_to_string("emails/interview_reminder.txt", context)

    # Send the email
    subject = f"Interview Reminder: {application.company_name} - {interview.get_interview_type_display()}"
    
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as e:
        logger.error(f"Failed to send email for interview {interview_id}: {e}")
        raise self.retry(exc=e, countdown=60 * 5)

    # Mark reminder as sent
    interview.reminder_sent = True
    interview.save(update_fields=["reminder_sent"])

    logger.info(f"Reminder sent for interview {interview_id} to {user.email}")
    return {
        "status": "success",
        "interview_id": interview_id,
        "user": user.username,
        "company": application.company_name,
        "interview_type": interview.get_interview_type_display(),
    }


@shared_task
def check_upcoming_interviews() -> dict:
    """
    Periodic task to check for upcoming interviews and send reminders.
    
    This task runs daily (scheduled via Celery Beat) and:
    1. Finds all interviews in the next N days (based on user preferences)
    2. Filters out interviews that already had reminders sent
    3. Queues individual reminder tasks for each
    
    Returns:
        dict with count of reminders queued
    """
    now = timezone.now()
    reminders_queued = 0
    
    # Get all users with notifications enabled
    profiles = UserProfile.objects.filter(email_notifications_enabled=True)
    
    for profile in profiles:
        # Calculate the reminder window for this user
        reminder_date = now + timedelta(days=profile.reminder_days_before)
        
        # Find interviews for this user that:
        # - Are scheduled within the reminder window
        # - Haven't had a reminder sent yet
        # - Are still pending (not cancelled/completed)
        # - Application is still in progress
        interviews = Interview.objects.filter(
            job_application__user=profile.user,
            scheduled_date__date=reminder_date.date(),
            reminder_sent=False,
            outcome="pending",
            job_application__application_status="in_progress",
        )
        
        for interview in interviews:
            send_interview_reminder.delay(interview.id)
            reminders_queued += 1
            logger.info(
                f"Queued reminder for interview {interview.id} "
                f"({interview.job_application.company_name} - {interview.get_interview_type_display()}) "
                f"for user {profile.user.username}"
            )

    logger.info(f"Check complete: {reminders_queued} reminders queued")
    return {"reminders_queued": reminders_queued}


@shared_task
def send_test_email(email: str) -> dict:
    """
    Test task to verify email configuration is working.
    
    Args:
        email: Email address to send test to
        
    Returns:
        dict with status
    """
    try:
        send_mail(
            subject="Interview Coordinator - Test Email",
            message="This is a test email from Interview Coordinator. If you received this, email notifications are working!",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
        logger.info(f"Test email sent to {email}")
        return {"status": "success", "email": email}
    except Exception as e:
        logger.error(f"Failed to send test email: {e}")
        return {"status": "error", "message": str(e)}
