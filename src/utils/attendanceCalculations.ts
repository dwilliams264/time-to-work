import type { AttendanceDay, AttendanceSettings, AttendanceResult } from '../types/attendance';

export interface MonthlyAttendancePoint {
    month: number; // 0-based, 0=January
    attendancePct: number;
    metTarget: boolean;
    inProgress: boolean; // true = current month, data up to today only
}

/** Returns per-month attendance for each completed month of `year`, up to `completedMonthCount`. */
export function getMonthlyAttendance(
    days: AttendanceDay[],
    year: number,
    completedMonthCount: number,
    settings: AttendanceSettings,
): MonthlyAttendancePoint[] {
    const results: MonthlyAttendancePoint[] = [];
    for (let m = 0; m < completedMonthCount; m++) {
        const start = new Date(year, m, 1);
        const end = new Date(year, m + 1, 0); // last day of month m
        const result = calculateAttendance(days, start, end, settings);
        results.push({ month: m, attendancePct: result.attendancePct, metTarget: result.metTarget, inProgress: false });
    }
    return results;
}

/** Returns all Mon–Fri dates within the inclusive range [start, end]. */
export function getWeekdays(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);
    const endNorm = new Date(end);
    endNorm.setHours(23, 59, 59, 999);

    while (current <= endNorm) {
        const dow = current.getDay(); // 0=Sun, 6=Sat
        if (dow >= 1 && dow <= 5) {
            days.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
    }
    return days;
}

function toDateStr(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function calculateAttendance(
    days: AttendanceDay[],
    periodStart: Date,
    periodEnd: Date,
    settings: AttendanceSettings,
): AttendanceResult {
    const dayMap = new Map(days.map((d) => [d.date, d.type]));
    const weekdays = getWeekdays(periodStart, periodEnd);

    let publicHolidays = 0;
    let annualLeave = 0;
    let sick = 0;
    let attendance = 0;
    let wfh = 0;

    for (const date of weekdays) {
        const type = dayMap.get(toDateStr(date));
        if (type === 'public-holiday') publicHolidays++;
        else if (type === 'annual-leave') annualLeave++;
        else if (type === 'sick') sick++;
        else if (type === 'office' || type === 'offsite') attendance++;
        else if (type === 'wfh') wfh++;
    }

    const totalWorkDays = weekdays.length - publicHolidays;
    const leaveDays = annualLeave + sick;
    const availableWorkDays = totalWorkDays - leaveDays;
    const attendancePct = availableWorkDays > 0 ? Math.round((attendance / availableWorkDays) * 100) : 0;
    const targetPct = Math.round((settings.daysInOffice / settings.daysWorkedPerWeek) * 100);
    const metTarget = attendancePct >= targetPct;

    return {
        totalWorkDays,
        availableWorkDays,
        attendanceDays: attendance,
        wfhDays: wfh,
        leaveDays,
        attendancePct,
        targetPct,
        metTarget,
    };
}

function startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

/** Monday of the week containing `date`. */
function getMondayOf(date: Date): Date {
    const d = startOfDay(date);
    const dow = d.getDay(); // 0=Sun
    const diff = dow === 0 ? -6 : 1 - dow;
    d.setDate(d.getDate() + diff);
    return d;
}

/** Friday of the week containing `date`. */
function getFridayOf(date: Date): Date {
    const mon = getMondayOf(date);
    const fri = new Date(mon);
    fri.setDate(fri.getDate() + 4);
    return fri;
}

export function getThisWeekRange(date?: Date): [Date, Date] {
    const ref = date ?? new Date();
    const monday = getMondayOf(ref);
    const today = startOfDay(ref);
    const friday = getFridayOf(ref);
    // End at today so future unrecorded days don't dilute the percentage
    const end = today < friday ? today : friday;
    return [monday, end];
}

export function getThisMonthRange(date?: Date): [Date, Date] {
    const ref = date ?? new Date();
    const start = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const today = startOfDay(ref);
    const lastDay = new Date(ref.getFullYear(), ref.getMonth() + 1, 0);
    // End at today so future unrecorded days don't dilute the percentage
    const end = today < lastDay ? today : lastDay;
    return [start, end];
}

/**
 * Returns [Jan 1, last day of previous month] for the current year.
 * Returns null in January (no completed months yet).
 */
export function getYearToDateRange(date?: Date): [Date, Date] | null {
    const ref = date ?? new Date();
    const month = ref.getMonth(); // 0-based
    if (month === 0) return null; // January: no completed months
    const start = new Date(ref.getFullYear(), 0, 1);
    const end = new Date(ref.getFullYear(), month, 0); // last day of previous month
    return [start, end];
}

export function getThisYearRange(date?: Date): [Date, Date] {
    const ref = date ?? new Date();
    const start = new Date(ref.getFullYear(), 0, 1);
    const today = startOfDay(ref);
    const lastDay = new Date(ref.getFullYear(), 11, 31);
    const end = today < lastDay ? today : lastDay;
    return [start, end];
}

export function getHalfYearRange(date?: Date): [Date, Date] {
    const ref = date ?? new Date();
    const month = ref.getMonth(); // 0-based
    const today = startOfDay(ref);
    if (month < 6) {
        // H1: Jan–Jun
        const start = new Date(ref.getFullYear(), 0, 1);
        const lastDay = new Date(ref.getFullYear(), 5, 30);
        const end = today < lastDay ? today : lastDay;
        return [start, end];
    } else {
        // H2: Jul–Dec
        const start = new Date(ref.getFullYear(), 6, 1);
        const lastDay = new Date(ref.getFullYear(), 11, 31);
        const end = today < lastDay ? today : lastDay;
        return [start, end];
    }
}
