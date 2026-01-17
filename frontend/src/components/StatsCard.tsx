import type { ReactNode } from "react";

/**
 * StatsCard displays a single dashboard metric with icon and value.
 * Used in the dashboard header to show key statistics at a glance.
 */

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: "indigo" | "green" | "amber" | "rose" | "sky";
  subtitle?: string;
}

// Color mappings for the icon background and accent
const colorStyles = {
  indigo: {
    bg: "bg-indigo-100",
    icon: "text-indigo-600",
    accent: "border-indigo-200",
  },
  green: {
    bg: "bg-emerald-100",
    icon: "text-emerald-600",
    accent: "border-emerald-200",
  },
  amber: {
    bg: "bg-amber-100",
    icon: "text-amber-600",
    accent: "border-amber-200",
  },
  rose: {
    bg: "bg-rose-100",
    icon: "text-rose-600",
    accent: "border-rose-200",
  },
  sky: {
    bg: "bg-sky-100",
    icon: "text-sky-600",
    accent: "border-sky-200",
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  color = "indigo",
  subtitle,
}: StatsCardProps) {
  const styles = colorStyles[color];

  return (
    <div
      className={`bg-white rounded-xl border ${styles.accent} p-5 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${styles.bg} ${styles.icon} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
