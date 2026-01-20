import type { ReactNode } from "react";

interface ErrorMessageProps {
  message: string | ReactNode;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Reusable error message component with dismiss functionality.
 * Displays a styled alert banner for error states.
 */
export default function ErrorMessage({
  message,
  onDismiss,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 ${className}`}
      role="alert"
    >
      <span className="text-red-500 text-xl flex-shrink-0">⚠</span>
      <div className="flex-1 text-red-800 text-sm">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
          aria-label="Dismiss error"
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
