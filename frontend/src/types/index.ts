/**
 * Re-export types from services for convenient imports.
 * Components can import from '@/types' instead of digging into services.
 */
export type { 
  Interview, 
  InterviewFormData, 
  InterviewStage, 
  ApplicationStatus,
  InterviewRound,
  InterviewRoundFormData,
  InterviewWithRounds,
  RoundStage,
  RoundOutcome,
  PipelineStage,  // Kept for backwards compatibility
} from "../services/interviewService";
export type { UserProfile, UserProfileUpdate, TestEmailResponse } from "./profile";

/**
 * Options for select dropdowns - matches Django model choices.
 */
export const INTERVIEW_TYPE_OPTIONS = [
  { value: "phone", label: "Phone Screen" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "final", label: "Final Round" },
] as const;

export const STATUS_OPTIONS = [
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const LOCATION_OPTIONS = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
] as const;

/**
 * Interview stage options - where you are in the interview process.
 * Separate from outcome/status.
 */
export const INTERVIEW_STAGE_OPTIONS = [
  { value: "applied", label: "Applied", color: "gray", icon: "📝" },
  { value: "screening", label: "Phone Screening", color: "blue", icon: "📞" },
  { value: "technical", label: "Technical Interview", color: "purple", icon: "💻" },
  { value: "onsite", label: "Onsite Interview", color: "indigo", icon: "🏢" },
  { value: "final", label: "Final Round", color: "yellow", icon: "🎯" },
  { value: "completed", label: "Completed", color: "teal", icon: "✅" },
] as const;

/**
 * Application status options - the outcome/decision of the application.
 */
export const APPLICATION_STATUS_OPTIONS = [
  { value: "in_progress", label: "In Progress", color: "sky", icon: "🔄" },
  { value: "offer", label: "Offer Received", color: "green", icon: "🎉" },
  { value: "accepted", label: "Accepted", color: "emerald", icon: "✨" },
  { value: "rejected", label: "Rejected", color: "red", icon: "❌" },
  { value: "declined", label: "Declined", color: "orange", icon: "🚫" },
  { value: "withdrawn", label: "Withdrawn", color: "gray", icon: "↩️" },
] as const;

/**
 * @deprecated Use INTERVIEW_STAGE_OPTIONS and APPLICATION_STATUS_OPTIONS instead.
 * Kept for backwards compatibility during transition.
 */
export const PIPELINE_STAGE_OPTIONS = [
  { value: "applied", label: "Applied", color: "gray" },
  { value: "screening", label: "Phone Screening", color: "blue" },
  { value: "technical", label: "Technical Interview", color: "purple" },
  { value: "onsite", label: "Onsite Interview", color: "indigo" },
  { value: "final", label: "Final Round", color: "yellow" },
  { value: "offer", label: "Offer Received", color: "green" },
  { value: "rejected", label: "Rejected", color: "red" },
  { value: "accepted", label: "Accepted", color: "emerald" },
  { value: "declined", label: "Declined", color: "orange" },
] as const;

/**
 * Round stage options - for interview rounds (excludes applied and completed).
 */
export const ROUND_STAGE_OPTIONS = [
  { value: "screening", label: "Phone Screening", color: "blue", icon: "📞" },
  { value: "technical", label: "Technical Interview", color: "purple", icon: "💻" },
  { value: "onsite", label: "Onsite Interview", color: "indigo", icon: "🏢" },
  { value: "final", label: "Final Round", color: "yellow", icon: "🎯" },
] as const;

/**
 * Round outcome options - result of each interview round.
 */
export const ROUND_OUTCOME_OPTIONS = [
  { value: "pending", label: "Pending", color: "gray", icon: "⏳" },
  { value: "passed", label: "Passed", color: "green", icon: "✅" },
  { value: "failed", label: "Failed", color: "red", icon: "❌" },
  { value: "cancelled", label: "Cancelled", color: "orange", icon: "🚫" },
] as const;
