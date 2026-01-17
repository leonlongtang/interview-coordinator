/**
 * Types for user profile and notification settings.
 * Matches the backend UserProfile model and serializer.
 */

export interface UserProfile {
  username: string;
  email: string;
  email_notifications_enabled: boolean;
  reminder_days_before: number;
  reminder_time: string; // Format: "HH:MM"
}

export interface UserProfileUpdate {
  email_notifications_enabled?: boolean;
  reminder_days_before?: number;
  reminder_time?: string;
}

export interface TestEmailResponse {
  status: string;
  message: string;
  task_id?: string;
}

