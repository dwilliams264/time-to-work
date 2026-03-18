import { useState, useEffect, useRef } from 'react';
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

    // Cache the initial load to avoid reading localStorage once per useState call
    const initialRef = useRef<DayData | null>(null);
    if (!initialRef.current) {
        initialRef.current = loadData(storageKey);
    }
    const initial = initialRef.current;

    const [timeBlocks, setTimeBlocks] = useState<DayData['timeBlocks']>(initial.timeBlocks);
    const [goalMinutes, setGoalMinutes] = useState<number>(initial.goalMinutes);
    const [lunchEnabled, setLunchEnabled] = useState<boolean>(initial.lunchEnabled);
    const [lunchMinutes, setLunchMinutes] = useState<number>(initial.lunchMinutes);
    const [lunchStartTime, setLunchStartTime] = useState<number>(initial.lunchStartTime);

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
