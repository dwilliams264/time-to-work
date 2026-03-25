import type { AttendanceDay, AttendanceSettings, DayType } from '../types/attendance';

const PREFIX = 'daysToWork_';
const DAY_PREFIX = `${PREFIX}day_`;
const SETTINGS_KEY = `${PREFIX}settings`;
const MAX_STORAGE_DAYS = 400; // keep just over a full year so the YTD chart always has data

export class AttendanceStorageService {
    static formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    static saveDay(date: string, type: DayType | null): void {
        try {
            const key = `${DAY_PREFIX}${date}`;
            if (type === null) {
                localStorage.removeItem(key);
            } else {
                localStorage.setItem(key, JSON.stringify({ date, type }));
            }
        } catch (error) {
            console.error('Failed to save attendance day:', error);
        }
    }

    static loadDay(date: string): AttendanceDay | null {
        try {
            const raw = localStorage.getItem(`${DAY_PREFIX}${date}`);
            if (raw) {
                return JSON.parse(raw) as AttendanceDay;
            }
        } catch (error) {
            console.error('Failed to load attendance day:', error);
        }
        return null;
    }

    static saveSettings(settings: AttendanceSettings): void {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save attendance settings:', error);
        }
    }

    static loadSettings(): AttendanceSettings | null {
        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (raw) {
                return JSON.parse(raw) as AttendanceSettings;
            }
        } catch (error) {
            console.error('Failed to load attendance settings:', error);
        }
        return null;
    }

    /** Returns every attendance day currently held in localStorage. */
    static loadAllDays(): AttendanceDay[] {
        const days: AttendanceDay[] = [];
        try {
            Object.keys(localStorage).forEach((key) => {
                if (!key.startsWith(DAY_PREFIX)) return;
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        days.push(JSON.parse(raw) as AttendanceDay);
                    }
                } catch {
                    // skip malformed entries
                }
            });
        } catch (error) {
            console.error('Failed to load all attendance days:', error);
        }
        return days;
    }

    static getAllDaysInRange(start: Date, end: Date): AttendanceDay[] {
        const days: AttendanceDay[] = [];
        const current = new Date(start);
        current.setHours(0, 0, 0, 0);
        const endNorm = new Date(end);
        endNorm.setHours(23, 59, 59, 999);

        while (current <= endNorm) {
            const dateStr = this.formatDate(current);
            const day = this.loadDay(dateStr);
            if (day) {
                days.push(day);
            }
            current.setDate(current.getDate() + 1);
        }
        return days;
    }

    static cleanupOldData(): void {
        try {
            const today = new Date();
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (!key.startsWith(DAY_PREFIX)) return;
                const dateStr = key.replace(DAY_PREFIX, '');
                const itemDate = new Date(dateStr);
                const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff > MAX_STORAGE_DAYS) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clean up old attendance data:', error);
        }
    }
}
