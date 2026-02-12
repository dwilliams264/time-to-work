import { useState, useEffect } from 'react';
import { StorageService, type DayData } from '../utils/storage';
import { DEFAULT_GOAL_MINUTES, DEFAULT_LUNCH_TIME, DEFAULT_LUNCH_MINUTES } from '../constants/calendar';

/**
 * Custom hook to persist state to localStorage with a specific key
 * @param storageKey - The localStorage key to use
 * @param defaultValue - Default value if no stored value exists
 * @param extractValue - Function to extract value from DayData
 * @returns Tuple of [state, setState]
 */
function usePersistedField<T>(
    storageKey: string,
    defaultValue: T,
    extractValue: (data: DayData) => T | undefined,
): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [value, setValue] = useState<T>(() => {
        const data = StorageService.loadDayData(storageKey);
        if (data) {
            const extracted = extractValue(data);
            return extracted !== undefined ? extracted : defaultValue;
        }
        return defaultValue;
    });

    return [value, setValue];
}

/**
 * Hook to manage all persisted day data with automatic localStorage sync
 */
export function useDayData(storageKey: string) {
    const [timeBlocks, setTimeBlocks] = usePersistedField(storageKey, [], (data) => data.timeBlocks);

    const [goalMinutes, setGoalMinutes] = usePersistedField(
        storageKey,
        DEFAULT_GOAL_MINUTES,
        (data) => data.goalMinutes,
    );

    const [lunchEnabled, setLunchEnabled] = usePersistedField(storageKey, true, (data) => data.lunchEnabled);

    const [lunchMinutes, setLunchMinutes] = usePersistedField(
        storageKey,
        DEFAULT_LUNCH_MINUTES,
        (data) => data.lunchMinutes,
    );

    const [lunchStartTime, setLunchStartTime] = usePersistedField(
        storageKey,
        DEFAULT_LUNCH_TIME,
        (data) => data.lunchStartTime,
    );

    // Save all data to localStorage whenever any state changes
    useEffect(() => {
        const data: DayData = {
            timeBlocks,
            goalMinutes,
            lunchEnabled,
            lunchMinutes,
            lunchStartTime,
        };
        StorageService.saveDayData(storageKey, data);
    }, [storageKey, timeBlocks, goalMinutes, lunchEnabled, lunchMinutes, lunchStartTime]);

    return {
        timeBlocks,
        setTimeBlocks,
        goalMinutes,
        setGoalMinutes,
        lunchEnabled,
        setLunchEnabled,
        lunchMinutes,
        setLunchMinutes,
        lunchStartTime,
        setLunchStartTime,
    };
}

/**
 * Hook to handle storage cleanup of old data
 */
export function useStorageCleanup(currentDate: string) {
    useEffect(() => {
        StorageService.cleanupOldData();
    }, [currentDate]);
}
