import { describe, it, expect } from 'vitest';
import { snapBlockToValid, calculateTotalWorkTime } from '../../utils/blockOperations';
import type { TimeBlock } from '../../types';

function block(id: string, startTime: number, duration: number): TimeBlock {
    return { id, startTime, duration };
}

describe('snapBlockToValid', () => {
    it('returns unchanged position when no conflicts exist', () => {
        const result = snapBlockToValid(60, 60, []);
        expect(result).toEqual({ startTime: 60, duration: 60 });
    });

    it('snaps start to the end of a preceding block when closer', () => {
        const blocks = [block('a', 0, 60)]; // occupies 0–60
        // New block wants 30–90 → overlaps → pushed to start at 60
        const result = snapBlockToValid(30, 60, blocks);
        expect(result.startTime).toBe(60);
    });

    it('snaps end to the start of a following block when closer', () => {
        const blocks = [block('a', 120, 60)]; // occupies 120–180
        // New block wants 90–150 → overlaps → end snapped back to 120
        const result = snapBlockToValid(90, 60, blocks);
        expect(result.startTime + result.duration).toBe(120);
    });

    it('excludes the specified block from conflict detection', () => {
        const blocks = [block('a', 60, 60)];
        // Moving block 'a' to its own position should not conflict with itself
        const result = snapBlockToValid(60, 60, blocks, 'a');
        expect(result).toEqual({ startTime: 60, duration: 60 });
    });

    it('resolves all overlaps with 3 adjacent blocks (multi-pass fix)', () => {
        const blocks = [
            block('a', 0, 60), // 0–60
            block('b', 60, 60), // 60–120
            block('c', 120, 60), // 120–180
        ];
        // New block overlaps all three
        const result = snapBlockToValid(30, 120, blocks);
        const hasNoOverlap = blocks.every((b) => {
            const bEnd = b.startTime + b.duration;
            const rEnd = result.startTime + result.duration;
            return result.startTime >= bEnd || rEnd <= b.startTime;
        });
        expect(hasNoOverlap).toBe(true);
    });

    it('clamps start time to calendar minimum (0)', () => {
        const result = snapBlockToValid(-30, 60, []);
        expect(result.startTime).toBeGreaterThanOrEqual(0);
    });

    it('clamps to calendar maximum (TOTAL_HOURS * 60 = 900 min)', () => {
        const CALENDAR_MAX = 15 * 60; // 5 AM–8 PM = 15 hours = 900 min
        const result = snapBlockToValid(CALENDAR_MAX - 30, 120, []);
        expect(result.startTime + result.duration).toBeLessThanOrEqual(CALENDAR_MAX);
    });

    it('enforces minimum block duration of 15 minutes when snapping end', () => {
        const blocks = [block('a', 100, 60)]; // 100–160
        // New block 90–120: end is closer to block start (100), so end snaps to 100 → duration = 10 → clamped to 15
        const result = snapBlockToValid(90, 30, blocks);
        expect(result.duration).toBeGreaterThanOrEqual(15);
    });
});

describe('calculateTotalWorkTime', () => {
    it('returns the sum of all block durations when lunch is disabled', () => {
        const blocks = [block('a', 0, 60), block('b', 120, 90)];
        expect(calculateTotalWorkTime(blocks, false, 60, 60)).toBe(150);
    });

    it('subtracts lunch overlap from work time when lunch is enabled', () => {
        // Block 60–180, lunch 120–180 (60 min overlap)
        const blocks = [block('a', 60, 120)];
        expect(calculateTotalWorkTime(blocks, true, 120, 60)).toBe(60);
    });

    it('returns 0 for an empty blocks array', () => {
        expect(calculateTotalWorkTime([], true, 60, 60)).toBe(0);
    });

    it('does not subtract when block and lunch do not overlap', () => {
        // Block 0–60, lunch 120–180
        const blocks = [block('a', 0, 60)];
        expect(calculateTotalWorkTime(blocks, true, 120, 60)).toBe(60);
    });

    it('handles partial overlap correctly', () => {
        // Block 0–90, lunch 60–120 (30 min overlap)
        const blocks = [block('a', 0, 90)];
        expect(calculateTotalWorkTime(blocks, true, 60, 60)).toBe(60);
    });
});
