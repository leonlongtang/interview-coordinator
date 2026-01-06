import { format, parseISO, isPast, formatDistanceToNow } from "date-fns";

/**
 * Utility functions for date formatting throughout the app.
 * Centralizes date logic so format changes only need to happen in one place.
 */

/**
 * Format a date string for display (e.g., "Jan 15, 2026 at 10:00 AM")
 */
export function formatInterviewDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy 'at' h:mm a");
}

/**
 * Format a date for the datetime-local input (e.g., "2026-01-15T10:00")
 */
export function formatForInput(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

/**
 * Check if a date is in the past
 */
export function isDatePast(dateString: string): boolean {
  return isPast(parseISO(dateString));
}

/**
 * Get relative time (e.g., "in 3 days" or "2 hours ago")
 */
export function getRelativeTime(dateString: string): string {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
}

