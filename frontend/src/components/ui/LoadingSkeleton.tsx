interface LoadingSkeletonProps {
  variant?: "card" | "text" | "avatar" | "button";
  className?: string;
  count?: number;
}

/**
 * Reusable skeleton loader component with shimmer effect.
 * Provides placeholder UI while content is loading.
 */
export default function LoadingSkeleton({
  variant = "text",
  className = "",
  count = 1,
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

  const renderSkeleton = () => {
    switch (variant) {
      case "card":
        return (
          <div className={`${baseClasses} rounded-xl p-5 ${className}`}>
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="h-5 bg-gray-300 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-300 rounded w-1/2" />
              </div>
              <div className="h-6 w-20 bg-gray-300 rounded-full" />
            </div>
            <div className="h-4 bg-gray-300 rounded w-2/3 mb-2" />
            <div className="h-4 bg-gray-300 rounded w-1/3 mb-4" />
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-300 rounded-full" />
              <div className="h-6 w-16 bg-gray-300 rounded-full" />
            </div>
            <div className="flex gap-2 pt-3 mt-3 border-t border-gray-200">
              <div className="h-9 flex-1 bg-gray-300 rounded-lg" />
              <div className="h-9 flex-1 bg-gray-300 rounded-lg" />
            </div>
          </div>
        );

      case "avatar":
        return (
          <div
            className={`${baseClasses} rounded-full h-10 w-10 ${className}`}
          />
        );

      case "button":
        return (
          <div
            className={`${baseClasses} rounded-lg h-10 w-24 ${className}`}
          />
        );

      case "text":
      default:
        return (
          <div className={`${baseClasses} rounded h-4 w-full ${className}`} />
        );
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
