import { NavLink } from "react-router-dom";
import type { User } from "../../types/auth";

/**
 * Mobile navigation menu. Slides down when hamburger is toggled.
 * Contains nav links and sign-out action.
 */

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  isLoading: boolean;
  onLogout: () => Promise<void>;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-3 rounded-lg transition-colors ${
    isActive
      ? "bg-indigo-100 text-indigo-700 font-medium"
      : "text-gray-600 hover:bg-gray-100"
  }`;

export default function MobileNav({
  isOpen,
  onClose,
  user,
  isLoading,
  onLogout,
}: MobileNavProps) {
  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await onLogout();
  };

  return (
    <nav className="md:hidden mt-4 pt-4 border-t border-gray-200 animate-slide-up">
      <div className="flex flex-col gap-2">
        <NavLink to="/" onClick={onClose} className={navLinkClass}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/add" onClick={onClose} className={navLinkClass}>
          ➕ Add Interview
        </NavLink>
        <NavLink to="/settings" onClick={onClose} className={navLinkClass}>
          ⚙️ Settings
        </NavLink>
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="px-4 py-2 text-sm text-gray-500">
            Signed in as <span className="font-medium text-gray-700">{user?.username}</span>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
          >
            🚪 {isLoading ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </nav>
  );
}
