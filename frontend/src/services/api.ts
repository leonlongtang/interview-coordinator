import axios from "axios";

/**
 * Ensure a URL has a protocol prefix. If no protocol is provided,
 * https:// is prepended. This guards against misconfigured env vars
 * like "example.com" instead of "https://example.com".
 */
function ensureProtocol(url: string): string {
  if (!url) return url;
  // If URL already has a protocol (http:// or https://), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  // Default to https for production URLs
  return `https://${url}`;
}

/**
 * Backend API base URL. Vite inlines VITE_API_URL at build time;
 * fallback to localhost for local dev. No trailing slash.
 * 
 * The ensureProtocol wrapper handles cases where the env var is set
 * without a protocol (e.g., "backend.railway.app" instead of
 * "https://backend.railway.app"), which would cause axios to treat
 * it as a relative URL.
 */
const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API_BASE = ensureProtocol(rawApiUrl);

/**
 * Axios instance configured for our Django backend API.
 * Centralizes API configuration so all requests use the same base URL and headers.
 * Includes JWT token handling via interceptors.
 */
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor: Automatically attach JWT access token to requests.
 * Skips auth endpoints (login, register, refresh) since they don't need tokens
 * and may fail if an invalid token is present.
 */
api.interceptors.request.use(
  (config) => {
    // Skip attaching token for auth endpoints
    const isAuthEndpoint = config.url?.includes("/auth/login") ||
                          config.url?.includes("/auth/registration") ||
                          config.url?.includes("/auth/token/refresh");
    
    if (!isAuthEndpoint) {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Flag to prevent multiple simultaneous token refresh attempts.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Process queued requests after token refresh completes.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Response interceptor: Handle 401 errors by attempting token refresh.
 * If refresh succeeds, retry the original request with new token.
 * If refresh fails, redirect to login.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401 errors that aren't already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if we're already on auth endpoints
      if (originalRequest.url?.includes("/auth/")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request to retry after refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        // No refresh token - user needs to login
        // Clear all auth data for security
        isRefreshing = false;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the access token (use same base as api instance)
        const response = await axios.post(
          `${API_BASE}/api/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const { access, refresh: newRefresh } = response.data;

        // Store new tokens
        localStorage.setItem("access_token", access);
        if (newRefresh) {
          localStorage.setItem("refresh_token", newRefresh);
        }

        // Update authorization header and retry original request
        originalRequest.headers.Authorization = `Bearer ${access}`;
        processQueue(null, access);

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear all auth data and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log non-401 errors for debugging
    if (error.response?.status !== 401) {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

