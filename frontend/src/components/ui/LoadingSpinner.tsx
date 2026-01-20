interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZE_CLASSES = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-3",
  lg: "h-12 w-12 border-4",
};

/**
 * Reusable loading spinner component.
 * Provides visual feedback during async operations.
 */
export default function LoadingSpinner({
  size = "md",
  className = "",
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-indigo-500 border-t-transparent ${SIZE_CLASSES[size]}`}
        role="status"
        aria-label={label || "Loading"}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
