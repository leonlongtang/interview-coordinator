import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthState,
} from "../types/auth";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getCurrentUser,
  getAccessToken,
} from "../services/authService";

/**
 * AuthContext provides authentication state and methods throughout the app.
 * Handles login, register, logout, and automatic token validation on mount.
 */

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading to check existing auth
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  /**
   * Check if user is already authenticated on app load.
   * Validates existing token by fetching user info.
   */
  const checkAuth = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch {
      // Token invalid or expired - user needs to login again
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Log in with username and password.
   * On success, stores tokens and sets user state.
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginService(credentials);
      setUser(response.user);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Login failed. Please check your credentials.");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register a new user account.
   * On success, automatically logs in the user.
   */
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await registerService(credentials);
      setUser(response.user);
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Registration failed. Please try again.");
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the current user.
   * Clears tokens and user state.
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutService();
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  };

  /**
   * Clear any authentication error.
   */
  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context.
 * Must be used within an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

/**
 * Extract a user-friendly error message from API errors.
 * Handles various error response formats from dj-rest-auth.
 */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === "object" && err !== null && "response" in err) {
    const response = (err as { response?: { data?: unknown } }).response;
    const data = response?.data;

    if (typeof data === "object" && data !== null) {
      // Handle field-specific errors (e.g., { username: ["This field is required."] })
      const dataObj = data as Record<string, unknown>;
      
      // Check for non_field_errors first
      if (Array.isArray(dataObj.non_field_errors)) {
        return dataObj.non_field_errors.join(" ");
      }

      // Check for detail message
      if (typeof dataObj.detail === "string") {
        return dataObj.detail;
      }

      // Collect field errors
      const fieldErrors: string[] = [];
      for (const [field, messages] of Object.entries(dataObj)) {
        if (Array.isArray(messages)) {
          fieldErrors.push(`${field}: ${messages.join(", ")}`);
        }
      }
      if (fieldErrors.length > 0) {
        return fieldErrors.join("; ");
      }
    }

    if (typeof data === "string") {
      return data;
    }
  }

  return fallback;
}

export default AuthContext;

