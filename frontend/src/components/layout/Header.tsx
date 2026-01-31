import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import type { User } from "../../types/auth";
import UserMenu from "./UserMenu";
import MobileNav from "./MobileNav";

/**
 * App header with logo, desktop nav, user menu, and mobile menu toggle.
 * Manages mobile menu open state and composes UserMenu + MobileNav.
 */

interface HeaderProps {
  user: User | null;
  isLoading: boolean;
  onLogout: () => Promise<void>;
}

const desktopNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-lg transition-colors ${
    isActive
      ? "bg-indigo-100 text-indigo-700 font-medium"
      : "text-gray-600 hover:bg-gray-100"
  }`;

export default function Header({ user, isLoading, onLogout }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">📅</span>
            <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
              Interview Coordinator
            </h1>
            <h1 className="text-xl font-bold text-gray-900 sm:hidden">IC</h1>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/" className={desktopNavLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/add" className={desktopNavLinkClass}>
              + Add Interview
            </NavLink>
            <UserMenu user={user} isLoading={isLoading} onLogout={onLogout} />
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        <MobileNav
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          user={user}
          isLoading={isLoading}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
