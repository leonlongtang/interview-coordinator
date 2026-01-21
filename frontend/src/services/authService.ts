import api from "./api";
import type {
  LoginCredentials,
  RegisterCredentials,
  LoginResponse,
  RegisterResponse,
  RefreshResponse,
  User,
} from "../types/auth";

/**
 * Authentication service for handling user auth operations.
 * Communicates with dj-rest-auth endpoints on the backend.
 */

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

/**
 * Store tokens in localStorage for persistence across sessions.
 */
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

/**
 * Retrieve stored access token.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Retrieve stored refresh token.
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_KEY);
}

/**
 * Clear all auth tokens from storage (used on logout).
 * Also clears any other auth-related data from storage.
 */
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  
  // Clear any other auth-related data that might be stored
  // This ensures complete cleanup on logout
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

/**
 * Clear all authentication data from all storage mechanisms.
 * Use this for complete security cleanup (e.g., on security events).
 */
export function clearAllAuthData(): void {
  clearTokens();
  
  // Clear any cached user data
  // Note: If you add user caching in the future, clear it here
}

/**
 * Register a new user account.
 * On success, stores tokens and returns user data.
 */
export async function register(
  credentials: RegisterCredentials
): Promise<LoginResponse> {
  const response = await api.post<RegisterResponse>(
    "/auth/registration/",
    credentials
  );
  const { access, refresh, user } = response.data;
  setTokens(access, refresh);
  return { access, refresh, user };
}

/**
 * Log in with existing credentials.
 * On success, stores tokens and returns user data.
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login/", credentials);
  const { access, refresh, user } = response.data;
  setTokens(access, refresh);
  return { access, refresh, user };
}

/**
 * Log out the current user.
 * Clears tokens from storage and notifies backend.
 */
export async function logout(): Promise<void> {
  try {
    // Notify backend to blacklist the refresh token
    await api.post("/auth/logout/");
  } catch {
    // Even if backend call fails, clear local tokens
    console.warn("Logout API call failed, clearing local tokens anyway");
  } finally {
    clearTokens();
  }
}

/**
 * Refresh the access token using the stored refresh token.
 * Updates stored tokens on success.
 */
export async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) {
    return null;
  }

  try {
    const response = await api.post<RefreshResponse>("/auth/token/refresh/", {
      refresh,
    });
    const { access, refresh: newRefresh } = response.data;

    // Update tokens (refresh may be rotated)
    setTokens(access, newRefresh || refresh);
    return access;
  } catch {
    // Refresh failed - tokens are invalid
    clearTokens();
    return null;
  }
}

/**
 * Get the currently authenticated user's info.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await api.get<User>("/auth/user/");
    return response.data;
  } catch {
    return null;
  }
}

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  clearAllAuthData,
};

