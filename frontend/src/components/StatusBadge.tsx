import type { InterviewStage, ApplicationStatus, PipelineStage } from "../types";

/**
 * Size variants for badges - smaller on mobile, larger for emphasis.
 */
const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

/**
 * Interview Stage Badge - shows where you are in the interview process.
 */
const INTERVIEW_STAGE_CONFIG: Record<
  InterviewStage,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  applied: {
    label: "Applied",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: "📝",
  },
  screening: {
    label: "Screening",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    icon: "📞",
  },
  technical: {
    label: "Technical",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    icon: "💻",
  },
  onsite: {
    label: "Onsite",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
    icon: "🏢",
  },
  final: {
    label: "Final Round",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-800",
    icon: "🎯",
  },
  completed: {
    label: "Completed",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
    icon: "✅",
  },
};

interface InterviewStageBadgeProps {
  stage: InterviewStage;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function InterviewStageBadge({ stage, size = "md", showIcon = false }: InterviewStageBadgeProps) {
  const config = INTERVIEW_STAGE_CONFIG[stage];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}

/**
 * Application Status Badge - shows the outcome/decision status.
 */
const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  in_progress: {
    label: "In Progress",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
    icon: "🔄",
  },
  offer: {
    label: "Offer",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    icon: "🎉",
  },
  accepted: {
    label: "Accepted",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
    icon: "✨",
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    icon: "❌",
  },
  declined: {
    label: "Declined",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    icon: "🚫",
  },
  withdrawn: {
    label: "Withdrawn",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    icon: "↩️",
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export function ApplicationStatusBadge({ status, size = "md", showIcon = false }: ApplicationStatusBadgeProps) {
  const config = APPLICATION_STATUS_CONFIG[status];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {showIcon && <span>{config.icon}</span>}
      {config.label}
    </span>
  );
}

/**
 * @deprecated Use InterviewStageBadge and ApplicationStatusBadge instead.
 * Kept for backwards compatibility during transition.
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

interface StatusBadgeProps {
  stage: PipelineStage;
  size?: "sm" | "md" | "lg";
}

/**
 * @deprecated Use InterviewStageBadge and ApplicationStatusBadge instead.
 */
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

