import type { ReactNode } from "react";

interface SuccessMessageProps {
  message: string | ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable success message component with dismiss functionality.
 * Displays a styled alert banner for success states.
 */
export default function SuccessMessage({
  message,
  onDismiss,
  className = "",
}: SuccessMessageProps) {
  return (
    <div
      className={`bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 ${className}`}
      role="status"
    >
      <span className="text-green-500 text-xl flex-shrink-0">✓</span>
      <div className="flex-1 text-green-800 text-sm">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 transition-colors flex-shrink-0"
          aria-label="Dismiss message"
        >
          <svg
            className="w-5 h-5"
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
        </button>
      )}
    </div>
  );
}
