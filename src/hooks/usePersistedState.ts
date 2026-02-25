import { useState, useEffect } from 'react';
import { StorageService, type DayData } from '../utils/storage';
import { DEFAULT_GOAL_MINUTES, DEFAULT_LUNCH_TIME, DEFAULT_LUNCH_MINUTES } from '../constants/calendar';

/**
 * Hook to manage all persisted day data with automatic localStorage sync
 */
export function useDayData(storageKey: string) {
    // Load initial data
    const loadData = (key: string): DayData => {
        const data = StorageService.loadDayData(key);
        if (data) {
            return data;
        }
        return {
            timeBlocks: [],
            goalMinutes: DEFAULT_GOAL_MINUTES,
            lunchEnabled: true,
            lunchMinutes: DEFAULT_LUNCH_MINUTES,
            lunchStartTime: DEFAULT_LUNCH_TIME,
        };
    };

    const [timeBlocks, setTimeBlocks] = useState<DayData['timeBlocks']>(() => loadData(storageKey).timeBlocks);
    const [goalMinutes, setGoalMinutes] = useState<number>(() => loadData(storageKey).goalMinutes);
    const [lunchEnabled, setLunchEnabled] = useState<boolean>(() => loadData(storageKey).lunchEnabled);
    const [lunchMinutes, setLunchMinutes] = useState<number>(() => loadData(storageKey).lunchMinutes);
    const [lunchStartTime, setLunchStartTime] = useState<number>(() => loadData(storageKey).lunchStartTime);

    // Reload all data when storage key changes (e.g., when navigating between days)
    useEffect(() => {
        const data = loadData(storageKey);
        setTimeBlocks(data.timeBlocks);
        setGoalMinutes(data.goalMinutes);
        setLunchEnabled(data.lunchEnabled);
        setLunchMinutes(data.lunchMinutes);
        setLunchStartTime(data.lunchStartTime);
    }, [storageKey]);

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
