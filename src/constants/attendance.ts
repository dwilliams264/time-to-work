import type { DayType } from '../types/attendance';

export const DEFAULT_DAYS_PER_WEEK = 5 as const;

export const AUTO_TARGET_MAP: Record<3 | 4 | 5, number> = {
    3: 100,
    4: 75,
    5: 60,
};

interface DayTypeConfig {
    label: string;
    shortLabel: string;
    colorClass: string;
    /** true = counts as an attendance day; false = work day only; null = excluded */
    role: 'attendance' | 'work-only' | 'excluded-from-available' | 'excluded-from-total';
}

export const DAY_TYPE_CONFIG: Record<DayType, DayTypeConfig> = {
    office: {
        label: 'Office',
        shortLabel: 'Office',
        colorClass: 'day-type-office',
        role: 'attendance',
    },
    offsite: {
        label: 'Offsite / Conference',
        shortLabel: 'Offsite',
        colorClass: 'day-type-offsite',
        role: 'attendance',
    },
    wfh: {
        label: 'Work From Home',
        shortLabel: 'WFH',
        colorClass: 'day-type-wfh',
        role: 'work-only',
    },
    'annual-leave': {
        label: 'Annual Leave',
        shortLabel: 'Leave',
        colorClass: 'day-type-annual-leave',
        role: 'excluded-from-available',
    },
    sick: {
        label: 'Sick Leave',
        shortLabel: 'Sick',
        colorClass: 'day-type-sick',
        role: 'excluded-from-available',
    },
    'public-holiday': {
        label: 'Public Holiday',
        shortLabel: 'Holiday',
        colorClass: 'day-type-public-holiday',
        role: 'excluded-from-total',
    },
};

/** Ordered cycle for clicking through day types */
export const DAY_TYPE_CYCLE: Array<DayType | undefined> = [
    undefined,
    'office',
    'wfh',
    'annual-leave',
    'offsite',
    'sick',
    'public-holiday',
];
