import { HOURS_START } from '../constants/calendar';

/**
 * Formats minutes into a human-readable time string (e.g., "14:30")
 * @param minutes - Minutes from the start of the calendar (0 = HOURS_START)
 * @returns Formatted time string in HH:MM format
 */
export function formatTime(minutes: number): string {
    const totalMinutes = HOURS_START * 60 + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Formats a duration in minutes into a human-readable string (e.g., "2h 30m")
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;

    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
}

/**
 * Formats the current date into a human-readable string
 * @param date - Date object to format
 * @returns Formatted date string (e.g., "Monday, 10 February 2026")
 */
export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
