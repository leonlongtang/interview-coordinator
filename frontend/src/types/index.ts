/**
 * Re-export types from services for convenient imports.
 * Components can import from '@/types' instead of digging into services.
 */
export type { Interview, InterviewFormData } from "../services/interviewService";

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

