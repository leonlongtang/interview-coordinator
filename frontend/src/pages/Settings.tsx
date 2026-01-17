import { useState, useEffect } from "react";
import { Button, Input } from "../components/ui";
import { getProfile, updateProfile, sendTestEmail } from "../services/profileService";
import type { UserProfile } from "../types/profile";

/**
 * Settings page for managing user notification preferences.
 * Allows users to enable/disable email notifications, set reminder timing,
 * and send a test email to verify their settings.
 */
export default function Settings() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(1);
  const [reminderTime, setReminderTime] = useState("09:00");

  // Fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        setIsLoading(true);
        const data = await getProfile();
        setProfile(data);
        setEmailNotificationsEnabled(data.email_notifications_enabled);
        setReminderDaysBefore(data.reminder_days_before);
        setReminderTime(data.reminder_time);
      } catch (err) {
        setError("Failed to load settings. Please try again.");
        console.error("Error fetching profile:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const updated = await updateProfile({
        email_notifications_enabled: emailNotificationsEnabled,
        reminder_days_before: reminderDaysBefore,
        reminder_time: reminderTime,
      });
      setProfile(updated);
      setSuccessMessage("Settings saved successfully!");
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    try {
      setIsSendingTest(true);
      setError(null);
      const result = await sendTestEmail();
      setSuccessMessage(result.message || "Test email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send test email. Please try again.");
      console.error("Error sending test email:", err);
    } finally {
      setIsSendingTest(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <span>⚙️</span> Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your notification preferences and account settings.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <span className="text-green-600 text-xl">✓</span>
          <p className="text-green-800">{successMessage}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600 text-xl">⚠</span>
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Profile Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>👤</span> Account Info
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Username
            </label>
            <p className="text-gray-900 font-medium">{profile?.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Email
            </label>
            <p className="text-gray-900 font-medium">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Email Notifications Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span>📧</span> Email Notifications
        </h2>

        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between py-4 border-b border-gray-100">
          <div>
            <p className="font-medium text-gray-900">Interview Reminders</p>
            <p className="text-sm text-gray-500">
              Receive email reminders before your scheduled interviews.
            </p>
          </div>
          <button
            onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              emailNotificationsEnabled ? "bg-indigo-600" : "bg-gray-200"
            }`}
            role="switch"
            aria-checked={emailNotificationsEnabled}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                emailNotificationsEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reminder Settings (only shown when enabled) */}
        {emailNotificationsEnabled && (
          <div className="pt-4 space-y-4">
            <div>
              <label
                htmlFor="reminderDays"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Remind me before interview
              </label>
              <select
                id="reminderDays"
                value={reminderDaysBefore}
                onChange={(e) => setReminderDaysBefore(Number(e.target.value))}
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>1 week before</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="reminderTime"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Reminder time
              </label>
              <Input
                id="reminderTime"
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Time is in your local timezone.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Test Email Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span>🧪</span> Test Notifications
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Send a test email to verify your notification settings are working correctly.
        </p>
        <Button
          type="button"
          variant="secondary"
          onClick={handleTestEmail}
          disabled={isSendingTest || !emailNotificationsEnabled}
        >
          {isSendingTest ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Sending...
            </>
          ) : (
            <>
              <span className="mr-2">📤</span>
              Send Test Email
            </>
          )}
        </Button>
        {!emailNotificationsEnabled && (
          <p className="mt-2 text-xs text-gray-500">
            Enable email notifications to send a test email.
          </p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

