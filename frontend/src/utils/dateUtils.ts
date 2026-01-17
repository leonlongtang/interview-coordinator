import { format, parseISO, isPast, formatDistanceToNow } from "date-fns";

/**
 * Utility functions for date formatting throughout the app.
 * Centralizes date logic so format changes only need to happen in one place.
 * All functions handle null/undefined dates gracefully.
 */

/**
 * Format a date string for display (e.g., "Jan 15, 2026 at 10:00 AM")
 * Returns fallback text if date is null/undefined.
 */
export function formatInterviewDate(dateString: string | null | undefined): string {
  if (!dateString) return "Not scheduled";
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date for the datetime-local input (e.g., "2026-01-15T10:00")
 * Returns empty string if date is null/undefined.
 */
export function formatForInput(dateString: string | null | undefined): string {
  if (!dateString) return "";
  const date = parseISO(dateString);
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Check if a date is in the past.
 * Returns false if date is null/undefined.
 */
export function isDatePast(dateString: string | null | undefined): boolean {
  if (!dateString) return false;
  return isPast(parseISO(dateString));
}

/**
 * Get relative time (e.g., "in 3 days" or "2 hours ago")
 * Returns fallback text if date is null/undefined.
 */
export function getRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Awaiting response";
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

