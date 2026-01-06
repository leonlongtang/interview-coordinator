import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";

/**
 * Main layout wrapper for the app.
 * Provides consistent header, navigation, and footer across all pages.
 */

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo / Title */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              <h1 className="text-xl font-bold text-gray-900">
                Interview Coordinator
              </h1>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/add"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                + Add Interview
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Interview Coordinator &copy; {new Date().getFullYear()} — Track your job interviews
        </div>
      </footer>
    </div>
  );
}

