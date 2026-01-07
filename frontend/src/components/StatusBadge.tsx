import type { PipelineStage } from "../types";

/**
 * StatusBadge displays the pipeline stage with color-coded styling.
 * Colors help users quickly identify where each application stands.
 */

interface StatusBadgeProps {
  stage: PipelineStage;
  size?: "sm" | "md" | "lg";
}

/**
 * Maps pipeline stages to their display labels and Tailwind color classes.
 * Using specific color combinations for good contrast and visual hierarchy.
 */
const STAGE_CONFIG: Record<
  PipelineStage,
  { label: string; bgColor: string; textColor: string }
> = {
  applied: {
    label: "Applied",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  screening: {
    label: "Screening",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  technical: {
    label: "Technical",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  onsite: {
    label: "Onsite",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  final: {
    label: "Final Round",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
  },
  offer: {
    label: "Offer",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  accepted: {
    label: "Accepted",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  declined: {
    label: "Declined",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
};

/**
 * Size variants for the badge - smaller on mobile, larger for emphasis.
 */
const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

export default function StatusBadge({ stage, size = "md" }: StatusBadgeProps) {
  const config = STAGE_CONFIG[stage];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}

