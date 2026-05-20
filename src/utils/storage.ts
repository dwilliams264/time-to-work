import type { TimeBlock } from '../types';

/**
 * Interface for daily data stored in localStorage
 */
export interface DayData {
    timeBlocks: TimeBlock[];
    goalMinutes: number;
    lunchEnabled: boolean;
    lunchMinutes: number;
    lunchStartTime: number;
}

/**
 * Storage utility for managing localStorage operations
 */
export class StorageService {
    private static readonly PREFIX = 'timeToWork_';
    private static readonly MAX_STORAGE_DAYS = 365;

    /**
     * Generates a storage key for a specific date
     */
    static generateKey(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${this.PREFIX}${year}-${month}-${day}`;
    }

    /**
     * Saves day data to localStorage
     */
    static saveDayData(key: string, data: DayData): void {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save data to localStorage:', error);
        }
    }

    /**
     * Loads day data from localStorage
     */
    static loadDayData(key: string): DayData | null {
        try {
            const savedData = localStorage.getItem(key);
            if (savedData) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Failed to load data from localStorage:', error);
        }
        return null;
    }

    /**
     * Removes old data entries from localStorage
     */
    static cleanupOldData(): void {
        try {
            const keys = Object.keys(localStorage);
            const timeToWorkKeys = keys.filter((key) => key.startsWith(this.PREFIX));
            const today = new Date();

            timeToWorkKeys.forEach((key) => {
                const dateStr = key.replace(this.PREFIX, '');
                const itemDate = new Date(dateStr);
                const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

                if (daysDiff > this.MAX_STORAGE_DAYS) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Failed to clean up old localStorage data:', error);
        }
    }
}
