/**
 * Re-export types from services for convenient imports.
 * Components can import from '@/types' instead of digging into services.
 */
export type {
  JobApplication,
  JobApplicationFormData,
  JobApplicationWithInterviews,
  Interview,
  InterviewFormData,
  InterviewType,
  InterviewLocation,
  InterviewOutcome,
  ApplicationStatus,
  DashboardStats,
  UpcomingInterview,
  AwaitingApplication,
  NeedsReviewInterview,
} from "../services/applicationService";

export type { UserProfile, UserProfileUpdate, TestEmailResponse } from "./profile";

/**
 * Application status options - the outcome/decision of the application.
 */
export const APPLICATION_STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress", color: "sky", icon: "hourglass" },
  { value: "offer", label: "Offer Received", color: "green", icon: "gift" },
  { value: "accepted", label: "Accepted", color: "emerald", icon: "check-circle" },
  { value: "rejected", label: "Rejected", color: "red", icon: "x-circle" },
  { value: "declined", label: "Declined", color: "orange", icon: "ban" },
  { value: "withdrawn", label: "Withdrawn", color: "gray", icon: "arrow-left" },
] as const;

/**
 * Interview type options - expanded to cover more interview formats.
 */
export const INTERVIEW_TYPE_OPTIONS = [
  { value: "phone_screening", label: "Phone Screening", color: "blue", icon: "phone" },
  { value: "recruiter_call", label: "Recruiter Call", color: "cyan", icon: "phone" },
  { value: "technical", label: "Technical Interview", color: "purple", icon: "code" },
  { value: "coding", label: "Coding Challenge", color: "violet", icon: "terminal" },
  { value: "system_design", label: "System Design", color: "indigo", icon: "cube" },
  { value: "behavioral", label: "Behavioral Interview", color: "teal", icon: "users" },
  { value: "hiring_manager", label: "Hiring Manager", color: "amber", icon: "briefcase" },
  { value: "team_fit", label: "Team Fit / Culture", color: "lime", icon: "users" },
  { value: "onsite", label: "Onsite Interview", color: "orange", icon: "building" },
  { value: "final", label: "Final Round", color: "pink", icon: "flag" },
  { value: "hr_final", label: "HR Final", color: "rose", icon: "clipboard" },
  { value: "offer_call", label: "Offer Call", color: "emerald", icon: "phone-incoming" },
] as const;

/**
 * Interview location options.
 */
export const INTERVIEW_LOCATION_OPTIONS = [
  { value: "remote", label: "Remote", icon: "video" },
  { value: "onsite", label: "On-site", icon: "building" },
  { value: "hybrid", label: "Hybrid", icon: "arrows-split" },
] as const;

/**
 * Interview outcome options.
 */
export const INTERVIEW_OUTCOME_OPTIONS = [
  { value: "pending", label: "Pending", color: "gray", icon: "clock" },
  { value: "passed", label: "Passed", color: "green", icon: "check" },
  { value: "failed", label: "Failed", color: "red", icon: "x" },
  { value: "cancelled", label: "Cancelled", color: "orange", icon: "ban" },
] as const;
