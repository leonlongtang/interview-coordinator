"""
Config package for Interview Coordinator.
Exports the Celery app so it's loaded when Django starts.
"""

# Import Celery app so it's registered when Django starts
# This ensures tasks are discovered and the app is ready
from .celery import app as celery_app

__all__ = ("celery_app",)

