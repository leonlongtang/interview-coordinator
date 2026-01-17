/**
 * Re-export types from services for convenient imports.
 * Components can import from '@/types' instead of digging into services.
 */
export type { Interview, InterviewFormData, PipelineStage } from "../services/interviewService";
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
 * Pipeline stage options - tracks overall job application progress.
 * Each stage has a value, label, and associated color for the UI.
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

