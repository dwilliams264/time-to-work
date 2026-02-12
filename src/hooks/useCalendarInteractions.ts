import { useState, useCallback, useEffect } from 'react';
import type { TimeBlock, ResizeState } from '../types';
import { yToTime } from '../utils/timeCalculations';
import { getPointerY, isTargetOrParent } from '../utils/pointerEvents';
import { MIN_BLOCK_DURATION, TIME_SNAP_INTERVAL, TOTAL_HOURS } from '../constants/calendar';

/**
 * Hook for managing drag-to-create block functionality
 */
export function useBlockCreation(
    calendarRef: React.RefObject<HTMLDivElement | null>,
    onAddBlock: (startTime: number, duration: number) => void,
    snapBlockToValid: (
        startTime: number,
        duration: number,
        excludeId?: string,
    ) => { startTime: number; duration: number },
) {
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [dragEnd, setDragEnd] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handlePointerDown = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (!calendarRef.current) return;

            // Don't start creating if clicking on an existing element
            if (isTargetOrParent(e.target, '.time-block') || isTargetOrParent(e.target, '.lunch-indicator')) {
                return;
            }

            const rect = calendarRef.current.getBoundingClientRect();
            const y = getPointerY(e, rect, 12);
            const minutes = yToTime(y);

            setDragStart(minutes);
            setDragEnd(minutes);
            setIsDragging(true);
        },
        [calendarRef],
    );

    const handlePointerMove = useCallback(
        (minutes: number) => {
            if (isDragging && dragStart !== null) {
                setDragEnd(minutes);
            }
        },
        [isDragging, dragStart],
    );

    const handlePointerUp = useCallback(() => {
        if (isDragging && dragStart !== null && dragEnd !== null) {
            const startTime = Math.min(dragStart, dragEnd);
            const endTime = Math.max(dragStart, dragEnd);
            const duration = endTime - startTime;

            if (duration >= MIN_BLOCK_DURATION) {
                const snapped = snapBlockToValid(startTime, duration);
                onAddBlock(snapped.startTime, snapped.duration);
            }
        }

        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
    }, [isDragging, dragStart, dragEnd, onAddBlock, snapBlockToValid]);

    const previewBlock =
        isDragging && dragStart !== null && dragEnd !== null
            ? {
                  startTime: Math.min(dragStart, dragEnd),
                  duration: Math.abs(dragEnd - dragStart),
              }
            : null;

    return {
        isDragging,
        previewBlock,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
    };
}

/**
 * Hook for managing block movement functionality
 */
export function useBlockMovement(
    timeBlocks: TimeBlock[],
    onUpdateBlock: (id: string, startTime: number, duration: number) => void,
    snapBlockToValid: (
        startTime: number,
        duration: number,
        excludeId?: string,
    ) => { startTime: number; duration: number },
) {
    const [movingBlock, setMovingBlock] = useState<string | null>(null);

    const handlePointerMove = useCallback(
        (minutes: number) => {
            if (!movingBlock) return false;

            const block = timeBlocks.find((b) => b.id === movingBlock);
            if (block) {
                const rawStartTime = minutes - block.duration / 2;
                const snappedStartTime = Math.round(rawStartTime / TIME_SNAP_INTERVAL) * TIME_SNAP_INTERVAL;
                const newStartTime = Math.max(0, Math.min(snappedStartTime, TOTAL_HOURS * 60 - block.duration));

                const snapped = snapBlockToValid(newStartTime, block.duration, block.id);
                onUpdateBlock(block.id, snapped.startTime, snapped.duration);
                return true;
            }
            return false;
        },
        [movingBlock, timeBlocks, onUpdateBlock, snapBlockToValid],
    );

    const handlePointerUp = useCallback(() => {
        setMovingBlock(null);
    }, []);

    const startMoving = useCallback((blockId: string) => {
        setMovingBlock(blockId);
    }, []);

    return {
        movingBlock,
        startMoving,
        handlePointerMove,
        handlePointerUp,
    };
}

/**
 * Hook for managing block resize functionality
 */
export function useBlockResize(
    timeBlocks: TimeBlock[],
    onUpdateBlock: (id: string, startTime: number, duration: number) => void,
    snapBlockToValid: (
        startTime: number,
        duration: number,
        excludeId?: string,
    ) => { startTime: number; duration: number },
) {
    const [resizingBlock, setResizingBlock] = useState<ResizeState | null>(null);

    const handlePointerMove = useCallback(
        (minutes: number) => {
            if (!resizingBlock) return false;

            const block = timeBlocks.find((b) => b.id === resizingBlock.id);
            if (block) {
                if (resizingBlock.direction === 'bottom') {
                    const newDuration = Math.max(MIN_BLOCK_DURATION, minutes - block.startTime);
                    const snapped = snapBlockToValid(block.startTime, newDuration, block.id);
                    onUpdateBlock(block.id, snapped.startTime, snapped.duration);
                } else {
                    const newStartTime = Math.max(0, minutes);
                    const newDuration = Math.max(MIN_BLOCK_DURATION, block.startTime + block.duration - newStartTime);
                    const snapped = snapBlockToValid(newStartTime, newDuration, block.id);
                    onUpdateBlock(block.id, snapped.startTime, snapped.duration);
                }
                return true;
            }
            return false;
        },
        [resizingBlock, timeBlocks, onUpdateBlock, snapBlockToValid],
    );

    const handlePointerUp = useCallback(() => {
        setResizingBlock(null);
    }, []);

    const startResizing = useCallback((blockId: string, direction: 'top' | 'bottom') => {
        setResizingBlock({ id: blockId, direction });
    }, []);

    return {
        resizingBlock,
        startResizing,
        handlePointerMove,
        handlePointerUp,
    };
}

/**
 * Hook for managing lunch indicator movement
 */
export function useLunchMovement(lunchDuration: number, onLunchTimeChange: (startTime: number) => void) {
    const [movingLunch, setMovingLunch] = useState(false);

    const handlePointerMove = useCallback(
        (minutes: number) => {
            if (!movingLunch) return false;

            const rawStartTime = minutes - lunchDuration / 2;
            const snappedStartTime = Math.round(rawStartTime / TIME_SNAP_INTERVAL) * TIME_SNAP_INTERVAL;
            const newStartTime = Math.max(0, Math.min(snappedStartTime, TOTAL_HOURS * 60 - lunchDuration));
            onLunchTimeChange(newStartTime);
            return true;
        },
        [movingLunch, lunchDuration, onLunchTimeChange],
    );

    const handlePointerUp = useCallback(() => {
        setMovingLunch(false);
    }, []);

    const startMoving = useCallback(() => {
        setMovingLunch(true);
    }, []);

    return {
        movingLunch,
        startMoving,
        handlePointerMove,
        handlePointerUp,
    };
}

/**
 * Orchestrates all calendar interactions (creation, movement, resize)
 */
export function useCalendarInteractions(
    calendarRef: React.RefObject<HTMLDivElement | null>,
    timeBlocks: TimeBlock[],
    lunchDuration: number,
    onAddBlock: (startTime: number, duration: number) => void,
    onUpdateBlock: (id: string, startTime: number, duration: number) => void,
    onLunchTimeChange: (startTime: number) => void,
    snapBlockToValid: (
        startTime: number,
        duration: number,
        excludeId?: string,
    ) => { startTime: number; duration: number },
) {
    const creation = useBlockCreation(calendarRef, onAddBlock, snapBlockToValid);
    const movement = useBlockMovement(timeBlocks, onUpdateBlock, snapBlockToValid);
    const resize = useBlockResize(timeBlocks, onUpdateBlock, snapBlockToValid);
    const lunch = useLunchMovement(lunchDuration, onLunchTimeChange);

    // Unified pointer move handler
    const handlePointerMove = useCallback(
        (e: React.MouseEvent | React.TouchEvent) => {
            if (!calendarRef.current) return;

            const rect = calendarRef.current.getBoundingClientRect();
            const y = getPointerY(e, rect, 12);
            const minutes = yToTime(y);

            // Handle different interaction types in priority order
            if (lunch.handlePointerMove(minutes)) return;
            if (movement.handlePointerMove(minutes)) return;
            if (resize.handlePointerMove(minutes)) return;
            creation.handlePointerMove(minutes);
        },
        [calendarRef, creation, movement, resize, lunch],
    );

    // Unified pointer up handler
    const handlePointerUp = useCallback(() => {
        creation.handlePointerUp();
        movement.handlePointerUp();
        resize.handlePointerUp();
        lunch.handlePointerUp();
    }, [creation, movement, resize, lunch]);

    // Set up global mouse up listener
    useEffect(() => {
        window.addEventListener('mouseup', handlePointerUp);
        return () => window.removeEventListener('mouseup', handlePointerUp);
    }, [handlePointerUp]);

    return {
        // Handlers for calendar
        handlePointerDown: creation.handlePointerDown,
        handlePointerMove,
        handlePointerUp,

        // State for rendering
        previewBlock: creation.previewBlock,
        isDragging: creation.isDragging,

        // Handlers for blocks
        startMovingBlock: movement.startMoving,
        startResizingBlock: resize.startResizing,
        startMovingLunch: lunch.startMoving,
    };
}

/**
 * Hook for managing current time display
 */
export function useCurrentTime(updateInterval: number) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, updateInterval);

        return () => clearInterval(timer);
    }, [updateInterval]);

    return currentTime;
}
