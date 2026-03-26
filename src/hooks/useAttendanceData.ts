import { useState, useEffect } from 'react';
import type { AttendanceDay, AttendanceSettings, DayType } from '../types/attendance';
import { AttendanceStorageService } from '../utils/attendanceStorage';
import { DEFAULT_DAYS_PER_WEEK } from '../constants/attendance';

const DEFAULT_SETTINGS: AttendanceSettings = {
    daysWorkedPerWeek: DEFAULT_DAYS_PER_WEEK,
};

export function useAttendanceData() {
    const [settings, setSettings] = useState<AttendanceSettings>(() => {
        return AttendanceStorageService.loadSettings() ?? DEFAULT_SETTINGS;
    });

    const [attendanceDays, setAttendanceDays] = useState<AttendanceDay[]>(() => {
        // Load everything in storage — retention is handled by cleanupOldData
        return AttendanceStorageService.loadAllDays();
    });

    // Run cleanup on mount
    useEffect(() => {
        AttendanceStorageService.cleanupOldData();
    }, []);

    const updateSettings = (next: AttendanceSettings) => {
        setSettings(next);
        AttendanceStorageService.saveSettings(next);
    };

    const getDayType = (date: string): DayType | undefined => {
        return attendanceDays.find((d) => d.date === date)?.type;
    };

    const setDayType = (date: string, type: DayType | null) => {
        AttendanceStorageService.saveDay(date, type);
        setAttendanceDays((prev) => {
            const without = prev.filter((d) => d.date !== date);
            if (type === null) return without;
            return [...without, { date, type }];
        });
    };

    return { settings, updateSettings, getDayType, setDayType, attendanceDays };
}
