import type { ApplicationStatus, InterviewType, InterviewOutcome } from "../types";

/**
 * Size variants for badges - smaller on mobile, larger for emphasis.
 */
const SIZE_CLASSES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
  lg: "px-3 py-1.5 text-base",
};

/**
 * Application Status Badge - shows the outcome/decision status of an application.
 */
const APPLICATION_STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  in_progress: {
    label: "In Progress",
    bgColor: "bg-sky-100",
    textColor: "text-sky-700",
  },
  offer: {
    label: "Offer",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  accepted: {
    label: "Accepted",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  declined: {
    label: "Declined",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  withdrawn: {
    label: "Withdrawn",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
  },
};

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md" | "lg";
}

export function ApplicationStatusBadge({
  status,
  size = "md",
}: ApplicationStatusBadgeProps) {
  const config = APPLICATION_STATUS_CONFIG[status];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}

/**
 * Interview Type Badge - shows the type of interview.
 */
const INTERVIEW_TYPE_CONFIG: Record<
  InterviewType,
  { label: string; bgColor: string; textColor: string }
> = {
  phone_screening: {
    label: "Phone Screen",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  recruiter_call: {
    label: "Recruiter",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
  },
  technical: {
    label: "Technical",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  coding: {
    label: "Coding",
    bgColor: "bg-violet-100",
    textColor: "text-violet-700",
  },
  system_design: {
    label: "System Design",
    bgColor: "bg-indigo-100",
    textColor: "text-indigo-700",
  },
  behavioral: {
    label: "Behavioral",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  hiring_manager: {
    label: "Hiring Manager",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  team_fit: {
    label: "Team Fit",
    bgColor: "bg-lime-100",
    textColor: "text-lime-700",
  },
  onsite: {
    label: "Onsite",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  final: {
    label: "Final Round",
    bgColor: "bg-pink-100",
    textColor: "text-pink-700",
  },
  hr_final: {
    label: "HR Final",
    bgColor: "bg-rose-100",
    textColor: "text-rose-700",
  },
  offer_call: {
    label: "Offer Call",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
};

interface InterviewTypeBadgeProps {
  type: InterviewType;
  size?: "sm" | "md" | "lg";
}

export function InterviewTypeBadge({
  type,
  size = "md",
}: InterviewTypeBadgeProps) {
  const config = INTERVIEW_TYPE_CONFIG[type];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}

/**
 * Interview Outcome Badge - shows the result of an interview.
 */
const INTERVIEW_OUTCOME_CONFIG: Record<
  InterviewOutcome,
  { label: string; bgColor: string; textColor: string }
> = {
  pending: {
    label: "Pending",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  passed: {
    label: "Passed",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  failed: {
    label: "Failed",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
};

interface InterviewOutcomeBadgeProps {
  outcome: InterviewOutcome;
  size?: "sm" | "md" | "lg";
}

export function InterviewOutcomeBadge({
  outcome,
  size = "md",
}: InterviewOutcomeBadgeProps) {
  const config = INTERVIEW_OUTCOME_CONFIG[outcome];
  const sizeClass = SIZE_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${config.bgColor} ${config.textColor} ${sizeClass}`}
    >
      {config.label}
    </span>
  );
}

// Default export for backwards compatibility
export default ApplicationStatusBadge;
