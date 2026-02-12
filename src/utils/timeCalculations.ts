import { HOUR_HEIGHT, TIME_SNAP_INTERVAL, TOTAL_HOURS } from '../constants/calendar';

/**
 * Converts minutes to Y-coordinate position on the calendar
 * @param minutes - Minutes from the start of the calendar
 * @returns Y-coordinate in pixels
 */
export function timeToY(minutes: number): number {
    const hourOffset = minutes / 60;
    return hourOffset * HOUR_HEIGHT;
}

/**
 * Converts Y-coordinate position to minutes, snapping to the nearest interval
 * @param y - Y-coordinate in pixels
 * @returns Minutes from the start of the calendar, snapped to TIME_SNAP_INTERVAL
 */
export function yToTime(y: number): number {
    const hours = y / HOUR_HEIGHT;
    const minutes = Math.round((hours * 60) / TIME_SNAP_INTERVAL) * TIME_SNAP_INTERVAL;
    return Math.max(0, Math.min(minutes, TOTAL_HOURS * 60));
}

/**
 * Gets the current time as minutes from the start of the calendar
 * @param currentTime - Current date/time
 * @param hoursStart - Starting hour of the calendar
 * @returns Minutes from the start of the calendar
 */
export function getCurrentTimeMinutes(currentTime: Date, hoursStart: number): number {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours - hoursStart) * 60 + minutes;
}

/**
 * Checks if two time ranges overlap
 * @param start1 - Start time of first range in minutes
 * @param end1 - End time of first range in minutes
 * @param start2 - Start time of second range in minutes
 * @param end2 - End time of second range in minutes
 * @returns True if ranges overlap
 */
export function hasOverlap(start1: number, end1: number, start2: number, end2: number): boolean {
    return start1 < end2 && start2 < end1;
}

/**
 * Calculates the overlap duration between two time ranges
 * @param start1 - Start time of first range in minutes
 * @param duration1 - Duration of first range in minutes
 * @param start2 - Start time of second range in minutes
 * @param duration2 - Duration of second range in minutes
 * @returns Duration of overlap in minutes (0 if no overlap)
 */
export function calculateOverlap(start1: number, duration1: number, start2: number, duration2: number): number {
    const end1 = start1 + duration1;
    const end2 = start2 + duration2;

    if (!hasOverlap(start1, end1, start2, end2)) {
        return 0;
    }

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    return overlapEnd - overlapStart;
}
