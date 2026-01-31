"""
Custom middleware for the Interview Coordinator backend.

CSRF exemption for API: JWT auth uses Authorization header, not cookies.
Django's CSRF protects session-based auth; our SPA sends no CSRF token on
cross-origin POST (login, register). Exempt /api/ so those requests succeed.
"""


class DisableCSRFForAPI:
    """
    Disable CSRF checks for /api/ paths.

    JWT auth is stateless—tokens in Authorization header. CSRF protects
    against cookie-based attacks; our API doesn't use session cookies.
    
    Uses Django's internal _dont_enforce_csrf_checks flag which is the most
    reliable way to skip CSRF validation for specific requests.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Set internal Django flag to skip CSRF checks for API paths
        # This is the same flag used by @csrf_exempt decorator internally
        if request.path.startswith("/api/"):
            request._dont_enforce_csrf_checks = True
        return self.get_response(request)
