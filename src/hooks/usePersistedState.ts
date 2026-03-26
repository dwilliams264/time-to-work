import React, { useState, useEffect } from 'react';
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

    const [dayData, setDayData] = useState<DayData>(() => loadData(storageKey));
    const [currentKey, setCurrentKey] = useState(storageKey);

    // Reload all data when storage key changes (e.g., when navigating between days)
    if (currentKey !== storageKey) {
        setCurrentKey(storageKey);
        setDayData(loadData(storageKey));
    }

    const { timeBlocks, goalMinutes, lunchEnabled, lunchMinutes, lunchStartTime } = dayData;

    // Save all data to localStorage whenever any state changes
    useEffect(() => {
        StorageService.saveDayData(storageKey, dayData);
    }, [storageKey, dayData]);

    const setTimeBlocks: React.Dispatch<React.SetStateAction<DayData['timeBlocks']>> = (action) =>
        setDayData((prev) => ({
            ...prev,
            timeBlocks: typeof action === 'function' ? action(prev.timeBlocks) : action,
        }));
    const setGoalMinutes: React.Dispatch<React.SetStateAction<number>> = (action) =>
        setDayData((prev) => ({
            ...prev,
            goalMinutes: typeof action === 'function' ? action(prev.goalMinutes) : action,
        }));
    const setLunchEnabled: React.Dispatch<React.SetStateAction<boolean>> = (action) =>
        setDayData((prev) => ({
            ...prev,
            lunchEnabled: typeof action === 'function' ? action(prev.lunchEnabled) : action,
        }));
    const setLunchMinutes: React.Dispatch<React.SetStateAction<number>> = (action) =>
        setDayData((prev) => ({
            ...prev,
            lunchMinutes: typeof action === 'function' ? action(prev.lunchMinutes) : action,
        }));
    const setLunchStartTime: React.Dispatch<React.SetStateAction<number>> = (action) =>
        setDayData((prev) => ({
            ...prev,
            lunchStartTime: typeof action === 'function' ? action(prev.lunchStartTime) : action,
        }));

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
