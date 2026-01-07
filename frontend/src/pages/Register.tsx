import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button, Input } from "../components/ui";

/**
 * Registration page component.
 * Provides a form for new users to create an account.
 * Automatically logs in the user after successful registration.
 */

export default function Register() {
  const navigate = useNavigate();
  const { register, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    // Basic validation
    if (!username.trim()) {
      setLocalError("Username is required");
      return;
    }
    if (!email.trim()) {
      setLocalError("Email is required");
      return;
    }
    if (!password1) {
      setLocalError("Password is required");
      return;
    }
    if (password1.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return;
    }
    if (password1 !== password2) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password1,
        password2,
      });
      // Navigate to dashboard after successful registration
      navigate("/", { replace: true });
    } catch {
      // Error is handled by AuthContext and displayed via error state
    }
  };

  const displayError = localError || error;

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password1) return { level: 0, text: "", color: "" };
    if (password1.length < 6) return { level: 1, text: "Weak", color: "bg-red-500" };
    if (password1.length < 8) return { level: 2, text: "Fair", color: "bg-yellow-500" };
    if (password1.length >= 8 && /[A-Z]/.test(password1) && /[0-9]/.test(password1)) {
      return { level: 4, text: "Strong", color: "bg-green-500" };
    }
    return { level: 3, text: "Good", color: "bg-blue-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="text-4xl">📅</span>
            <h1 className="text-2xl font-bold text-white">Interview Coordinator</h1>
          </Link>
          <p className="mt-2 text-slate-400">Create your account to get started</p>
        </div>

        {/* Register Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">Create account</h2>

          {/* Error Message */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Username <span className="text-red-400">*</span>
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoComplete="username"
                autoFocus
                className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email <span className="text-red-400">*</span>
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
            </div>

            <div>
              <label
                htmlFor="password1"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password <span className="text-red-400">*</span>
              </label>
              <Input
                id="password1"
                type="password"
                value={password1}
                onChange={(e) => setPassword1(e.target.value)}
                placeholder="Create a strong password"
                autoComplete="new-password"
                className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
              {/* Password strength indicator */}
              {password1 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.level
                            ? passwordStrength.color
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Password strength: <span className="font-medium">{passwordStrength.text}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="password2"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <Input
                id="password2"
                type="password"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Confirm your password"
                autoComplete="new-password"
                className="w-full bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-400 focus:ring-indigo-400/20"
              />
              {/* Password match indicator */}
              {password2 && (
                <p
                  className={`mt-1 text-xs ${
                    password1 === password2 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {password1 === password2 ? "✓ Passwords match" : "✗ Passwords do not match"}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-slate-500 text-sm">
          By creating an account, you agree to track your interviews responsibly
        </p>
      </div>
    </div>
  );
}

