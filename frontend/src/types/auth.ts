/**
 * Authentication-related types for the frontend.
 * These mirror the backend's auth API response structures.
 */

export interface User {
  pk: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Response from dj-rest-auth login endpoint.
 * Contains both tokens and user info.
 */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Response from dj-rest-auth registration endpoint.
 */
export interface RegisterResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Response from token refresh endpoint.
 */
export interface RefreshResponse {
  access: string;
  refresh?: string; // Only present if ROTATE_REFRESH_TOKENS is True
}

