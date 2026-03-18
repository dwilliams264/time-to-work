import { describe, it, expect } from 'vitest';
import { formatTime, formatDuration, formatDate } from '../../utils/timeFormatters';

describe('formatTime', () => {
    it('formats 0 minutes as the calendar start time (05:00)', () => {
        expect(formatTime(0)).toBe('05:00');
    });

    it('formats 60 minutes as 06:00', () => {
        expect(formatTime(60)).toBe('06:00');
    });

    it('formats 90 minutes as 06:30', () => {
        expect(formatTime(90)).toBe('06:30');
    });

    it('formats 10 minutes as 05:10 (pads both digits)', () => {
        expect(formatTime(10)).toBe('05:10');
    });

    it('formats 420 minutes (7 h from 5 AM = noon) as 12:00', () => {
        expect(formatTime(420)).toBe('12:00');
    });

    it('returns a string matching HH:MM format', () => {
        expect(formatTime(135)).toMatch(/^\d{2}:\d{2}$/);
    });
});

describe('formatDuration', () => {
    it('formats 0 minutes as "0m"', () => {
        expect(formatDuration(0)).toBe('0m');
    });

    it('formats whole hours as "Xh"', () => {
        expect(formatDuration(60)).toBe('1h');
        expect(formatDuration(120)).toBe('2h');
    });

    it('formats minutes only as "Xm"', () => {
        expect(formatDuration(45)).toBe('45m');
        expect(formatDuration(30)).toBe('30m');
    });

    it('formats hours and minutes together as "Xh Ym"', () => {
        expect(formatDuration(90)).toBe('1h 30m');
        expect(formatDuration(510)).toBe('8h 30m');
    });
});

describe('formatDate', () => {
    it('returns a non-empty string for any date', () => {
        expect(formatDate(new Date('2026-03-18')).length).toBeGreaterThan(0);
    });

    it('includes the numeric day', () => {
        expect(formatDate(new Date('2026-03-18'))).toContain('18');
    });

    it('includes the full year', () => {
        expect(formatDate(new Date('2026-03-18'))).toContain('2026');
    });

    it('includes the month name', () => {
        expect(formatDate(new Date('2026-03-18'))).toContain('March');
    });
});
