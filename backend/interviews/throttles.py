"""
Custom throttle classes for rate limiting.

These throttles protect sensitive endpoints (like authentication) from
brute force attacks by limiting the number of requests per time period.
"""

from rest_framework.throttling import SimpleRateThrottle


class AuthRateThrottle(SimpleRateThrottle):
    """
    Strict rate limit for authentication endpoints.
    
    Limits login/register attempts to prevent brute force attacks.
    Uses client IP as the identifier for anonymous requests.
    Rate is configured in settings.REST_FRAMEWORK['DEFAULT_THROTTLE_RATES']['auth']
    """
    
    scope = "auth"

    def get_cache_key(self, request, view):
        """
        Use IP address as the cache key for rate limiting.
        This ensures rate limiting works for unauthenticated requests.
        """
        # Get client IP, considering proxy headers
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")
        
        return self.cache_format % {
            "scope": self.scope,
            "ident": ip,
        }


class BurstRateThrottle(SimpleRateThrottle):
    """
    Burst rate limit for general API endpoints.
    
    Allows short bursts of requests but limits sustained high-volume usage.
    More permissive than AuthRateThrottle but still protects against abuse.
    """
    
    scope = "burst"

    def get_cache_key(self, request, view):
        if request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return self.cache_format % {
            "scope": self.scope,
            "ident": ident,
        }
