/**
 * Represents a block of time worked during the day
 */
export interface TimeBlock {
    /** Unique identifier for the time block */
    id: string;
    /** Start time in minutes from HOURS_START (e.g., 0 = 6:00 AM) */
    startTime: number;
    /** Duration of the block in minutes */
    duration: number;
}

/**
 * Direction for resizing a time block
 */
export type ResizeDirection = 'top' | 'bottom';

/**
 * State for tracking resize operations
 */
export interface ResizeState {
    id: string;
    direction: ResizeDirection;
}
