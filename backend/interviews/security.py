"""
Security utilities for logging and monitoring.

Provides functions for logging security-relevant events like
authentication attempts, permission denials, and suspicious activity.
"""

import logging
from functools import wraps

from django.utils import timezone

# Get the security logger configured in settings
security_logger = logging.getLogger("interviews.security")


def log_auth_event(event_type: str, request, success: bool, details: str = ""):
    """
    Log an authentication-related event.
    
    Args:
        event_type: Type of event (login, logout, register, password_change)
        request: The HTTP request object
        success: Whether the operation succeeded
        details: Additional details about the event
    """
    # Get client IP
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    
    # Get user identifier
    if hasattr(request, "user") and request.user.is_authenticated:
        user_id = f"user:{request.user.id}:{request.user.username}"
    else:
        user_id = "anonymous"
    
    # Get user agent
    user_agent = request.META.get("HTTP_USER_AGENT", "unknown")[:100]
    
    # Format log message
    status = "SUCCESS" if success else "FAILED"
    message = f"{event_type.upper()} {status} | IP: {ip} | User: {user_id} | UA: {user_agent}"
    
    if details:
        message += f" | Details: {details}"
    
    # Log at appropriate level
    if success:
        security_logger.info(message)
    else:
        security_logger.warning(message)


def log_permission_denied(request, resource: str, reason: str = ""):
    """
    Log when a user is denied access to a resource.
    
    Args:
        request: The HTTP request object
        resource: The resource that was accessed
        reason: Why access was denied
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    
    user_id = "anonymous"
    if hasattr(request, "user") and request.user.is_authenticated:
        user_id = f"user:{request.user.id}:{request.user.username}"
    
    message = f"PERMISSION_DENIED | IP: {ip} | User: {user_id} | Resource: {resource}"
    if reason:
        message += f" | Reason: {reason}"
    
    security_logger.warning(message)


def log_rate_limited(request, endpoint: str):
    """
    Log when a request is rate limited.
    
    Args:
        request: The HTTP request object
        endpoint: The endpoint that was rate limited
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    
    message = f"RATE_LIMITED | IP: {ip} | Endpoint: {endpoint}"
    security_logger.warning(message)


def log_suspicious_activity(request, activity_type: str, details: str):
    """
    Log suspicious activity that might indicate an attack.
    
    Args:
        request: The HTTP request object
        activity_type: Type of suspicious activity
        details: Details about the activity
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "unknown")
    
    user_id = "anonymous"
    if hasattr(request, "user") and request.user.is_authenticated:
        user_id = f"user:{request.user.id}:{request.user.username}"
    
    message = f"SUSPICIOUS | Type: {activity_type} | IP: {ip} | User: {user_id} | Details: {details}"
    security_logger.error(message)
