export type DayType = 'office' | 'wfh' | 'annual-leave' | 'offsite' | 'sick' | 'public-holiday';

export interface AttendanceDay {
    date: string; // YYYY-MM-DD
    type: DayType;
}

export interface AttendanceSettings {
    daysWorkedPerWeek: 3 | 4 | 5;
    daysInOffice: number;
}

export interface AttendanceResult {
    totalWorkDays: number;
    availableWorkDays: number;
    attendanceDays: number;
    wfhDays: number;
    leaveDays: number;
    attendancePct: number;
    targetPct: number;
    metTarget: boolean;
}
