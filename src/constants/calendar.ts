/**
 * Calendar configuration constants
 */

/** Starting hour for the calendar display (24-hour format) */
export const HOURS_START = 5;

/** Ending hour for the calendar display (24-hour format) */
export const HOURS_END = 20;

/** Total hours displayed in the calendar */
export const TOTAL_HOURS = HOURS_END - HOURS_START;

/** Height in pixels for each hour row */
export const HOUR_HEIGHT = 80;

/** Minimum duration for a time block in minutes */
export const MIN_BLOCK_DURATION = 15;

/** Snap interval for time blocks in minutes */
export const TIME_SNAP_INTERVAL = 15;

/** Default goal in minutes (7 hours 30 minutes) */
export const DEFAULT_GOAL_MINUTES = 450;

/** Default lunch time in minutes from HOURS_START (12:00 PM = 420 minutes from 5 AM) */
export const DEFAULT_LUNCH_TIME = 420;

/** Update interval for current time indicator in milliseconds */
export const TIME_UPDATE_INTERVAL = 60000; // 1 minute
