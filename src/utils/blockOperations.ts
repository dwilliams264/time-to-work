import type { TimeBlock } from '../types';
import { hasOverlap, calculateOverlap } from './timeCalculations';
import { TOTAL_HOURS } from '../constants/calendar';

/**
 * Finds the nearest valid position for a block, snapping to existing blocks if needed
 * @param startTime - Proposed start time in minutes
 * @param duration - Proposed duration in minutes
 * @param timeBlocks - Existing time blocks to avoid
 * @param excludeId - ID of block to exclude from conflict check (when moving/resizing)
 * @returns Adjusted start time and duration
 */
export function snapBlockToValid(
    startTime: number,
    duration: number,
    timeBlocks: TimeBlock[],
    excludeId?: string,
): { startTime: number; duration: number } {
    let adjustedStart = startTime;
    let adjustedDuration = duration;

    // Get all blocks that might conflict (excluding the current one if moving/resizing)
    const conflictingBlocks = timeBlocks
        .filter((block) => block.id !== excludeId)
        .sort((a, b) => a.startTime - b.startTime);

    // Check each conflicting block
    for (const block of conflictingBlocks) {
        const blockEnd = block.startTime + block.duration;
        const currentEnd = adjustedStart + adjustedDuration;

        // If there's overlap
        if (hasOverlap(adjustedStart, currentEnd, block.startTime, blockEnd)) {
            // Determine which snap point is closer
            const distanceToSnapBefore = Math.abs(currentEnd - block.startTime);
            const distanceToSnapAfter = Math.abs(adjustedStart - blockEnd);

            if (distanceToSnapBefore <= distanceToSnapAfter) {
                // Snap the end to the start of the blocking block
                adjustedDuration = Math.max(15, block.startTime - adjustedStart);
            } else {
                // Snap the start to the end of the blocking block
                adjustedStart = blockEnd;
            }
        }
    }

    // Ensure we're within calendar bounds
    adjustedStart = Math.max(0, Math.min(adjustedStart, TOTAL_HOURS * 60 - adjustedDuration));
    adjustedDuration = Math.min(adjustedDuration, TOTAL_HOURS * 60 - adjustedStart);

    return { startTime: adjustedStart, duration: adjustedDuration };
}

/**
 * Calculates total work time excluding lunch overlaps
 * @param timeBlocks - Array of time blocks
 * @param lunchEnabled - Whether lunch break is enabled
 * @param lunchStartTime - Start time of lunch in minutes
 * @param lunchMinutes - Duration of lunch in minutes
 * @returns Total work minutes
 */
export function calculateTotalWorkTime(
    timeBlocks: TimeBlock[],
    lunchEnabled: boolean,
    lunchStartTime: number,
    lunchMinutes: number,
): number {
    return timeBlocks.reduce((sum, block) => {
        let workTime = block.duration;

        // If lunch is enabled, subtract any overlap with lunch time
        if (lunchEnabled) {
            const lunchOverlap = calculateOverlap(block.startTime, block.duration, lunchStartTime, lunchMinutes);
            workTime -= lunchOverlap;
        }

        return sum + workTime;
    }, 0);
}
