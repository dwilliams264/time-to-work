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
