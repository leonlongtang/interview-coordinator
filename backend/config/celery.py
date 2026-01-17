import os

from celery import Celery

"""
Celery configuration for the Interview Coordinator project.
This sets up the task queue for background jobs like email reminders.

Celery uses Redis as a message broker to queue and distribute tasks.
Workers pick up tasks from the queue and execute them asynchronously.
"""

# Set the default Django settings module for Celery
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

# Create the Celery app instance
app = Celery("interview_coordinator")

# Load config from Django settings, using CELERY_ prefix for settings
# e.g., CELERY_BROKER_URL in Django settings becomes broker_url in Celery
app.config_from_object("django.conf:settings", namespace="CELERY")

# Auto-discover tasks in all registered Django apps
# Looks for tasks.py in each app directory
app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to verify Celery is working."""
    print(f"Request: {self.request!r}")

