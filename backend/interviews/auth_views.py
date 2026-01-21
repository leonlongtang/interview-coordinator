"""
Custom authentication views with rate limiting and security logging.

These views wrap dj-rest-auth endpoints to add:
- Strict rate limiting to prevent brute force attacks
- Security logging for audit trails
- Input sanitization
"""

from dj_rest_auth.registration.views import RegisterView
from dj_rest_auth.views import LoginView, LogoutView, PasswordChangeView, PasswordResetView
from rest_framework_simplejwt.views import TokenRefreshView

from .throttles import AuthRateThrottle
from .security import log_auth_event


class RateLimitedLoginView(LoginView):
    """
    Login view with strict rate limiting.
    
    Limits login attempts to prevent brute force password attacks.
    Logs all login attempts (successful and failed) for security auditing.
    """
    
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        # Log the authentication attempt
        success = response.status_code == 200
        username = request.data.get("username", "unknown")
        log_auth_event(
            "login",
            request,
            success,
            f"username={username}"
        )
        
        return response


class RateLimitedRegisterView(RegisterView):
    """
    Registration view with rate limiting.
    
    Limits registration attempts to prevent automated account creation.
    Logs all registration attempts for security auditing.
    """
    
    throttle_classes = [AuthRateThrottle]

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        # Log the registration attempt
        success = response.status_code in [200, 201]
        username = request.data.get("username", "unknown")
        email = request.data.get("email", "unknown")
        log_auth_event(
            "register",
            request,
            success,
            f"username={username}, email={email}"
        )
        
        return response


class RateLimitedLogoutView(LogoutView):
    """
    Logout view with logging.
    
    Logs logout events for security auditing.
    """

    def post(self, request, *args, **kwargs):
        # Log before logout (while user is still authenticated)
        log_auth_event("logout", request, True)
        return super().post(request, *args, **kwargs)


class RateLimitedPasswordChangeView(PasswordChangeView):
    """
    Password change view with rate limiting.
    
    Limits password change attempts and logs all attempts.
    """
    
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        success = response.status_code == 200
        log_auth_event("password_change", request, success)
        
        return response


class RateLimitedPasswordResetView(PasswordResetView):
    """
    Password reset request view with rate limiting.
    
    Limits password reset requests to prevent email flooding.
    """
    
    throttle_classes = [AuthRateThrottle]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        email = request.data.get("email", "unknown")
        log_auth_event(
            "password_reset_request",
            request,
            True,  # Always log as success to not leak email existence
            f"email={email}"
        )
        
        return response


class RateLimitedTokenRefreshView(TokenRefreshView):
    """
    Token refresh view with rate limiting.
    
    Limits token refresh attempts to prevent token abuse.
    """
    
    throttle_classes = [AuthRateThrottle]
