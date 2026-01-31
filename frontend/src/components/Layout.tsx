import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "./layout/Header";

/**
 * Main layout wrapper for the app.
 * Provides consistent header with navigation, user menu, and footer.
 * Composes layout/Header (which includes UserMenu + MobileNav).
 * Only rendered for authenticated users.
 */

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} isLoading={isLoading} onLogout={handleLogout} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          Interview Coordinator &copy; {new Date().getFullYear()} — Track your
          job interviews
        </div>
      </footer>
    </div>
  );
}
