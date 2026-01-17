/**
 * Service for user profile and notification settings API calls.
 * Handles fetching and updating user preferences.
 */

import api from "./api";
import type { UserProfile, UserProfileUpdate, TestEmailResponse } from "../types/profile";

/**
 * Fetch the current user's profile settings.
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await api.get<UserProfile>("/profile/");
  return response.data;
}

/**
 * Update the current user's profile settings.
 * Only sends the fields that are being updated.
 */
export async function updateProfile(data: UserProfileUpdate): Promise<UserProfile> {
  const response = await api.patch<UserProfile>("/profile/", data);
  return response.data;
}

/**
 * Send a test email to verify notification settings.
 * Triggers a Celery task to send a test email to the user's address.
 */
export async function sendTestEmail(): Promise<TestEmailResponse> {
  const response = await api.post<TestEmailResponse>("/profile/test-email/");
  return response.data;
}

