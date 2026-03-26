import { describe, it, expect } from 'vitest';
import {
    getWeekdays,
    calculateAttendance,
    getThisWeekRange,
    getThisMonthRange,
    getThisYearRange,
    getHalfYearRange,
    getYearToDateRange,
} from '../../utils/attendanceCalculations';
import type { AttendanceDay, AttendanceSettings } from '../../types/attendance';

const SETTINGS_5: AttendanceSettings = { daysWorkedPerWeek: 5, daysInOffice: 3 };
const SETTINGS_4: AttendanceSettings = { daysWorkedPerWeek: 4, daysInOffice: 3 };
const SETTINGS_3: AttendanceSettings = { daysWorkedPerWeek: 3, daysInOffice: 3 };

// ── Helpers ────────────────────────────────────────────────────────────────────

function d(yyyy: number, mm: number, dd: number): Date {
    return new Date(yyyy, mm - 1, dd);
}

function day(date: string, type: AttendanceDay['type']): AttendanceDay {
    return { date, type };
}

// ── getWeekdays ────────────────────────────────────────────────────────────────

describe('getWeekdays', () => {
    it('returns Mon–Fri for a standard week', () => {
        const days = getWeekdays(d(2026, 3, 23), d(2026, 3, 27)); // Mon–Fri
        expect(days).toHaveLength(5);
        expect(days[0].getDate()).toBe(23);
        expect(days[4].getDate()).toBe(27);
    });

    it('excludes weekends', () => {
        const days = getWeekdays(d(2026, 3, 21), d(2026, 3, 29)); // Sat–Sun included
        // 21 Sat, 22 Sun, 23 Mon, 24 Tue, 25 Wed, 26 Thu, 27 Fri, 28 Sat, 29 Sun → 5
        expect(days).toHaveLength(5);
    });

    it('works across a month boundary (Jan → Feb)', () => {
        const days = getWeekdays(d(2026, 1, 26), d(2026, 2, 6));
        // 26 Mon, 27 Tue, 28 Wed, 29 Thu, 30 Fri, 2 Mon, 3 Tue, 4 Wed, 5 Thu, 6 Fri = 10
        expect(days).toHaveLength(10);
    });

    it('works across a year boundary (Dec → Jan)', () => {
        const days = getWeekdays(d(2025, 12, 29), d(2026, 1, 2));
        // 29 Mon, 30 Tue, 31 Wed, 1 Thu, 2 Fri = 5
        expect(days).toHaveLength(5);
    });

    it('returns empty array when start > end', () => {
        const days = getWeekdays(d(2026, 3, 27), d(2026, 3, 23));
        expect(days).toHaveLength(0);
    });
});

// ── calculateAttendance — worked example ──────────────────────────────────────

describe('calculateAttendance — spec worked example', () => {
    it('12 ÷ 18 = 67%, target 60%, metTarget: true', () => {
        // 4-week month Jan 2026 = 20 weekdays
        const start = d(2026, 1, 1);
        const end = d(2026, 1, 31); // 22 weekdays (Thu-Fri Jan 1-2, then 4 full weeks)
        // Build 11 office + 1 offsite + 2 annual leave days
        // Jan 2026 weekdays: 1,2,5,6,7,8,9,12,13,14,15,16,19,20,21,22,23,26,27,28,29,30 = 22
        const days: AttendanceDay[] = [
            day('2026-01-05', 'office'),
            day('2026-01-06', 'office'),
            day('2026-01-07', 'office'),
            day('2026-01-08', 'office'),
            day('2026-01-09', 'office'),
            day('2026-01-12', 'office'),
            day('2026-01-13', 'office'),
            day('2026-01-14', 'office'),
            day('2026-01-15', 'office'),
            day('2026-01-16', 'office'),
            day('2026-01-19', 'office'),
            day('2026-01-20', 'offsite'),
            day('2026-01-21', 'annual-leave'),
            day('2026-01-22', 'annual-leave'),
        ];
        const result = calculateAttendance(days, start, end, SETTINGS_5);
        // 22 weekdays, 0 public holidays → totalWorkDays = 22, 2 leave → available = 20
        // attendance = 11 office + 1 offsite = 12 → 12/20 = 60%
        expect(result.attendanceDays).toBe(12);
        expect(result.availableWorkDays).toBe(20);
        expect(result.attendancePct).toBe(60);
        expect(result.targetPct).toBe(60);
        expect(result.metTarget).toBe(true);
    });

    it('uses the exact numbers from the spec (20 work days, 2 leave, 12 attendance)', () => {
        // Use a custom month with exactly 20 weekdays by trimming end to Jan 30
        const start = d(2026, 1, 5); // Mon
        const end = d(2026, 1, 30); // Fri — 4 full weeks = 20 weekdays
        const days: AttendanceDay[] = [
            // 11 office
            day('2026-01-05', 'office'),
            day('2026-01-06', 'office'),
            day('2026-01-07', 'office'),
            day('2026-01-08', 'office'),
            day('2026-01-09', 'office'),
            day('2026-01-12', 'office'),
            day('2026-01-13', 'office'),
            day('2026-01-14', 'office'),
            day('2026-01-15', 'office'),
            day('2026-01-16', 'office'),
            day('2026-01-19', 'office'),
            // 1 offsite
            day('2026-01-20', 'offsite'),
            // 2 annual leave
            day('2026-01-21', 'annual-leave'),
            day('2026-01-22', 'annual-leave'),
        ];
        const result = calculateAttendance(days, start, end, SETTINGS_5);
        expect(result.totalWorkDays).toBe(20);
        expect(result.leaveDays).toBe(2);
        expect(result.availableWorkDays).toBe(18);
        expect(result.attendanceDays).toBe(12);
        expect(result.attendancePct).toBe(67);
        expect(result.targetPct).toBe(60);
        expect(result.metTarget).toBe(true);
    });
});

// ── calculateAttendance — edge cases ──────────────────────────────────────────

describe('calculateAttendance — edge cases', () => {
    it('public holidays reduce totalWorkDays', () => {
        const start = d(2026, 3, 23);
        const end = d(2026, 3, 27);
        const days: AttendanceDay[] = [day('2026-03-25', 'public-holiday')];
        const result = calculateAttendance(days, start, end, SETTINGS_5);
        expect(result.totalWorkDays).toBe(4);
        expect(result.availableWorkDays).toBe(4);
    });

    it('zero available days → 0% attendance', () => {
        const start = d(2026, 3, 23);
        const end = d(2026, 3, 27);
        const days: AttendanceDay[] = [
            day('2026-03-23', 'annual-leave'),
            day('2026-03-24', 'annual-leave'),
            day('2026-03-25', 'annual-leave'),
            day('2026-03-26', 'annual-leave'),
            day('2026-03-27', 'annual-leave'),
        ];
        const result = calculateAttendance(days, start, end, SETTINGS_5);
        expect(result.availableWorkDays).toBe(0);
        expect(result.attendancePct).toBe(0);
    });

    it('returns metTarget: false when below target', () => {
        const start = d(2026, 3, 23);
        const end = d(2026, 3, 27);
        const days: AttendanceDay[] = [
            day('2026-03-23', 'wfh'),
            day('2026-03-24', 'wfh'),
            day('2026-03-25', 'wfh'),
            day('2026-03-26', 'wfh'),
            day('2026-03-27', 'wfh'),
        ];
        const result = calculateAttendance(days, start, end, SETTINGS_5);
        expect(result.attendancePct).toBe(0);
        expect(result.metTarget).toBe(false);
    });

    it('target is 100% for 3 days/week workers', () => {
        const start = d(2026, 3, 23);
        const end = d(2026, 3, 27);
        const days: AttendanceDay[] = [
            day('2026-03-23', 'office'),
            day('2026-03-24', 'office'),
            day('2026-03-25', 'office'),
        ];
        const result = calculateAttendance(days, start, end, SETTINGS_3);
        expect(result.targetPct).toBe(100);
    });

    it('target is 75% for 4 days/week workers', () => {
        const result = calculateAttendance([], d(2026, 3, 23), d(2026, 3, 27), SETTINGS_4);
        expect(result.targetPct).toBe(75);
    });
});

// ── Period boundary helpers ────────────────────────────────────────────────────

describe('getThisWeekRange', () => {
    it('starts on Monday', () => {
        const [start] = getThisWeekRange(d(2026, 3, 25)); // Wednesday
        expect(start.getDay()).toBe(1); // Monday
        expect(start.getDate()).toBe(23);
    });

    it('ends on today when today is before Friday', () => {
        const ref = d(2026, 3, 25); // Wednesday
        const [, end] = getThisWeekRange(ref);
        expect(end.getDate()).toBe(25);
    });

    it('ends on Friday when today is Friday', () => {
        const ref = d(2026, 3, 27); // Friday
        const [, end] = getThisWeekRange(ref);
        expect(end.getDate()).toBe(27);
        expect(end.getDay()).toBe(5);
    });
});

describe('getThisMonthRange', () => {
    it('starts on 1st of current month', () => {
        const [start] = getThisMonthRange(d(2026, 3, 15));
        expect(start.getDate()).toBe(1);
        expect(start.getMonth()).toBe(2); // 0-based March
    });

    it('ends on today when today is not the last day', () => {
        const ref = d(2026, 3, 15);
        const [, end] = getThisMonthRange(ref);
        expect(end.getDate()).toBe(15);
    });

    it('ends on last day when today is the last day of month', () => {
        const ref = d(2026, 1, 31); // January 31
        const [, end] = getThisMonthRange(ref);
        expect(end.getDate()).toBe(31);
        expect(end.getMonth()).toBe(0); // January
    });
});

describe('getYearToDateRange', () => {
    it('returns null in January (no completed months)', () => {
        expect(getYearToDateRange(d(2026, 1, 15))).toBeNull();
    });

    it('starts on Jan 1 of current year', () => {
        const range = getYearToDateRange(d(2026, 3, 25));
        expect(range).not.toBeNull();
        const [start] = range!;
        expect(start.getFullYear()).toBe(2026);
        expect(start.getMonth()).toBe(0); // January
        expect(start.getDate()).toBe(1);
    });

    it('ends on last day of previous month (March → Feb 28)', () => {
        const [, end] = getYearToDateRange(d(2026, 3, 25))!;
        expect(end.getMonth()).toBe(1); // February
        expect(end.getDate()).toBe(28);
    });

    it('ends on last day of previous month (December → Nov 30)', () => {
        const [, end] = getYearToDateRange(d(2026, 12, 1))!;
        expect(end.getMonth()).toBe(10); // November
        expect(end.getDate()).toBe(30);
    });

    it('covers only completed months (April → Jan–Mar)', () => {
        const [start, end] = getYearToDateRange(d(2026, 4, 15))!;
        expect(start.getMonth()).toBe(0); // Jan
        expect(end.getMonth()).toBe(2); // March
        expect(end.getDate()).toBe(31);
    });
});

describe('getThisYearRange', () => {
    it('starts on Jan 1st', () => {
        const [start] = getThisYearRange(d(2026, 6, 15));
        expect(start.getMonth()).toBe(0);
        expect(start.getDate()).toBe(1);
    });

    it('ends on today', () => {
        const ref = d(2026, 6, 15);
        const [, end] = getThisYearRange(ref);
        expect(end.getDate()).toBe(15);
        expect(end.getMonth()).toBe(5);
    });
});

describe('getHalfYearRange', () => {
    it('H1: Jan 1 to today when in H1', () => {
        const ref = d(2026, 3, 25);
        const [start, end] = getHalfYearRange(ref);
        expect(start.getMonth()).toBe(0); // Jan
        expect(end.getDate()).toBe(25);
        expect(end.getMonth()).toBe(2); // March
    });

    it('H2: Jul 1 to today when in H2', () => {
        const ref = d(2026, 9, 10);
        const [start] = getHalfYearRange(ref);
        expect(start.getMonth()).toBe(6); // Jul
        expect(start.getDate()).toBe(1);
    });

    it('H1 end is capped at Jun 30 when past end of H1', () => {
        const ref = d(2026, 6, 30); // June 30 = last day of H1
        const [, end] = getHalfYearRange(ref);
        expect(end.getMonth()).toBe(5); // June
        expect(end.getDate()).toBe(30);
    });
});
