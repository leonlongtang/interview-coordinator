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
    Must run before CsrfViewMiddleware so process_view patches the view first.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_view(self, request, view_func, view_args, view_kwargs):
        # CsrfViewMiddleware checks getattr(view_func, 'csrf_exempt', False)
        if request.path.startswith("/api/"):
            view_func.csrf_exempt = True
        return None
