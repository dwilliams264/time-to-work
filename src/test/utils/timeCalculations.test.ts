import { describe, it, expect } from 'vitest';
import { timeToY, yToTime, getCurrentTimeMinutes, hasOverlap, calculateOverlap } from '../../utils/timeCalculations';
import { HOUR_HEIGHT } from '../../constants/calendar';

describe('timeToY', () => {
    it('returns 0 for 0 minutes', () => {
        expect(timeToY(0)).toBe(0);
    });

    it('returns HOUR_HEIGHT for 60 minutes', () => {
        expect(timeToY(60)).toBe(HOUR_HEIGHT);
    });

    it('returns HOUR_HEIGHT * 2 for 120 minutes', () => {
        expect(timeToY(120)).toBe(HOUR_HEIGHT * 2);
    });

    it('returns proportional value for fractional hours', () => {
        expect(timeToY(30)).toBe(HOUR_HEIGHT / 2);
    });
});

describe('yToTime', () => {
    it('returns 0 for y = 0', () => {
        expect(yToTime(0)).toBe(0);
    });

    it('is the inverse of timeToY for values snapped to 15-minute intervals', () => {
        const snappedMinutes = [0, 15, 30, 45, 60, 90, 120, 195];
        for (const minutes of snappedMinutes) {
            expect(yToTime(timeToY(minutes))).toBe(minutes);
        }
    });

    it('snaps to the nearest 15-minute interval', () => {
        const result = yToTime(timeToY(7)); // 7 min → rounds to 0 or 15
        expect(result % 15).toBe(0);
    });

    it('clamps to 0 for negative y values', () => {
        expect(yToTime(-100)).toBe(0);
    });

    it('clamps to maximum calendar time (TOTAL_HOURS * 60)', () => {
        const TOTAL_HOURS = 15;
        expect(yToTime(timeToY(TOTAL_HOURS * 60 + 60))).toBe(TOTAL_HOURS * 60);
    });
});

describe('getCurrentTimeMinutes', () => {
    it('returns 0 when current time equals hoursStart', () => {
        const date = new Date('2026-03-18T05:00:00');
        expect(getCurrentTimeMinutes(date, 5)).toBe(0);
    });

    it('returns 60 for one hour after hoursStart', () => {
        const date = new Date('2026-03-18T06:00:00');
        expect(getCurrentTimeMinutes(date, 5)).toBe(60);
    });

    it('returns a negative value for times before hoursStart', () => {
        const date = new Date('2026-03-18T04:00:00');
        expect(getCurrentTimeMinutes(date, 5)).toBe(-60);
    });

    it('returns correct minutes within an hour', () => {
        const date = new Date('2026-03-18T05:30:00');
        expect(getCurrentTimeMinutes(date, 5)).toBe(30);
    });
});

describe('hasOverlap', () => {
    it('returns true for overlapping ranges', () => {
        expect(hasOverlap(0, 60, 30, 90)).toBe(true);
    });

    it('returns false for non-overlapping ranges', () => {
        expect(hasOverlap(0, 60, 90, 150)).toBe(false);
    });

    it('returns false for adjacent ranges (touching but not overlapping)', () => {
        expect(hasOverlap(0, 60, 60, 120)).toBe(false);
    });

    it('returns true when one range is fully contained within another', () => {
        expect(hasOverlap(0, 120, 30, 60)).toBe(true);
    });

    it('returns true when ranges are identical', () => {
        expect(hasOverlap(60, 120, 60, 120)).toBe(true);
    });
});

describe('calculateOverlap', () => {
    it('returns 0 for non-overlapping ranges', () => {
        expect(calculateOverlap(0, 60, 90, 60)).toBe(0);
    });

    it('returns 0 for adjacent ranges', () => {
        expect(calculateOverlap(0, 60, 60, 60)).toBe(0);
    });

    it('returns the overlap duration for partially overlapping ranges', () => {
        // 0–60 and 30–90: overlap is 30–60 = 30 minutes
        expect(calculateOverlap(0, 60, 30, 60)).toBe(30);
    });

    it('returns the smaller duration when one range is fully inside another', () => {
        // 0–120 and 30–60: overlap is 30–60 = 30 minutes
        expect(calculateOverlap(0, 120, 30, 30)).toBe(30);
    });

    it('returns the full duration when ranges are identical', () => {
        expect(calculateOverlap(60, 60, 60, 60)).toBe(60);
    });
});
