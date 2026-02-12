import { useState, useRef, useEffect, useCallback } from 'react';
import type { TimeBlock, ResizeState } from '../types';
import {
  HOURS_START,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  MIN_BLOCK_DURATION,
  TIME_UPDATE_INTERVAL,
  TIME_SNAP_INTERVAL,
} from '../constants/calendar';
import { timeToY, yToTime, getCurrentTimeMinutes } from '../utils/timeCalculations';
import { formatTime, formatDuration } from '../utils/timeFormatters';
import './DayCalendar.css';

interface DayCalendarProps {
  timeBlocks: TimeBlock[];
  onAddBlock: (startTime: number, duration: number) => void;
  onRemoveBlock: (id: string) => void;
  onUpdateBlock: (id: string, startTime: number, duration: number) => void;
  onClearAll: () => void;
}

/**
 * Interactive calendar component for creating and managing time blocks
 * Supports drag-and-drop to create blocks, move blocks, and resize blocks
 * Works with both mouse and touch events for mobile support
 */
function DayCalendar({ timeBlocks, onAddBlock, onRemoveBlock, onUpdateBlock, onClearAll }: DayCalendarProps) {
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [movingBlock, setMovingBlock] = useState<string | null>(null);
  const [resizingBlock, setResizingBlock] = useState<ResizeState | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  /**
   * Handles mouse down event to start creating a new time block
   */
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    const target = e.target as HTMLElement;
    const isTimeBlock = target.closest('.time-block');
    if (isTimeBlock) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 12;
    const minutes = yToTime(y);

    setDragStart(minutes);
    setDragEnd(minutes);
    setIsDragging(true);
  };

  /**
   * Handles mouse move for dragging, moving, or resizing
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top - 12;
    const minutes = yToTime(y);

    if (isDragging && dragStart !== null) {
      setDragEnd(minutes);
    } else if (movingBlock) {
      const block = timeBlocks.find((b) => b.id === movingBlock);
      if (block) {
        const rawStartTime = minutes - block.duration / 2;
        const snappedStartTime = Math.round(rawStartTime / TIME_SNAP_INTERVAL) * TIME_SNAP_INTERVAL;
        const newStartTime = Math.max(
          0,
          Math.min(snappedStartTime, TOTAL_HOURS * 60 - block.duration)
        );
        onUpdateBlock(block.id, newStartTime, block.duration);
      }
    } else if (resizingBlock) {
      const block = timeBlocks.find((b) => b.id === resizingBlock.id);
      if (block) {
        if (resizingBlock.direction === 'bottom') {
          const newDuration = Math.max(MIN_BLOCK_DURATION, minutes - block.startTime);
          onUpdateBlock(block.id, block.startTime, newDuration);
        } else {
          const newStartTime = Math.max(0, minutes);
          const newDuration = Math.max(
            MIN_BLOCK_DURATION,
            block.startTime + block.duration - newStartTime
          );
          onUpdateBlock(block.id, newStartTime, newDuration);
        }
      }
    }
  };

  /**
   * Handles mouse up to finish creating a time block
   */
  const handleMouseUp = useCallback(() => {
    if (isDragging && dragStart !== null && dragEnd !== null) {
      const startTime = Math.min(dragStart, dragEnd);
      const endTime = Math.max(dragStart, dragEnd);
      const duration = endTime - startTime;

      if (duration >= MIN_BLOCK_DURATION) {
        onAddBlock(startTime, duration);
      }
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
    setMovingBlock(null);
    setResizingBlock(null);
  }, [isDragging, dragStart, dragEnd, onAddBlock]);

  /**
   * Touch event handlers for mobile support
   */
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    const target = e.target as HTMLElement;
    const isTimeBlock = target.closest('.time-block');
    if (isTimeBlock) return;

    const rect = calendarRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top - 12;
    const minutes = yToTime(y);

    setDragStart(minutes);
    setDragEnd(minutes);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!calendarRef.current) return;

    e.preventDefault();

    const rect = calendarRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top - 12;
    const minutes = yToTime(y);

    if (isDragging && dragStart !== null) {
      setDragEnd(minutes);
    } else if (movingBlock) {
      const block = timeBlocks.find((b) => b.id === movingBlock);
      if (block) {
        const rawStartTime = minutes - block.duration / 2;
        const snappedStartTime = Math.round(rawStartTime / TIME_SNAP_INTERVAL) * TIME_SNAP_INTERVAL;
        const newStartTime = Math.max(
          0,
          Math.min(snappedStartTime, TOTAL_HOURS * 60 - block.duration)
        );
        onUpdateBlock(block.id, newStartTime, block.duration);
      }
    } else if (resizingBlock) {
      const block = timeBlocks.find((b) => b.id === resizingBlock.id);
      if (block) {
        if (resizingBlock.direction === 'bottom') {
          const newDuration = Math.max(MIN_BLOCK_DURATION, minutes - block.startTime);
          onUpdateBlock(block.id, block.startTime, newDuration);
        } else {
          const newStartTime = Math.max(0, minutes);
          const newDuration = Math.max(
            MIN_BLOCK_DURATION,
            block.startTime + block.duration - newStartTime
          );
          onUpdateBlock(block.id, newStartTime, newDuration);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Global mouse up handler
  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseUp]);

  // Update current time periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, TIME_UPDATE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const currentTimeMinutes = getCurrentTimeMinutes(currentTime, HOURS_START);
  const showCurrentTimeLine =
    currentTimeMinutes >= 0 && currentTimeMinutes <= TOTAL_HOURS * 60;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOURS_START + i);

  const previewBlock =
    isDragging && dragStart !== null && dragEnd !== null
      ? {
          startTime: Math.min(dragStart, dragEnd),
          duration: Math.abs(dragEnd - dragStart),
        }
      : null;

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-header-top">
          <h2>Today's Schedule</h2>
          <button 
            className="clear-all-button"
            onClick={onClearAll}
            disabled={timeBlocks.length === 0}
          >
            Clear All
          </button>
        </div>
        <p className="calendar-hint">Drag to create a time block</p>
      </div>

      <div
        ref={calendarRef}
        className="calendar"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
      >
        {hours.map((hour) => (
          <div key={hour} className="hour-row" style={{ height: `${HOUR_HEIGHT}px` }}>
            <div className="hour-label">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="hour-line" />
          </div>
        ))}

        {timeBlocks.map((block) => (
          <div
            key={block.id}
            className="time-block"
            style={{
              top: `${timeToY(block.startTime) + 50}px`,
              height: `${timeToY(block.duration)}px`
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              setMovingBlock(block.id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setMovingBlock(block.id);
            }}
          >
            <div
              className="resize-handle resize-top"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingBlock({ id: block.id, direction: 'top' });
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setResizingBlock({ id: block.id, direction: 'top' });
              }}
            />
            <div className="time-block-content">
              <span className="time-block-time">
                {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
              </span>
              <span className="time-block-duration">{formatDuration(block.duration)}</span>
              <button
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBlock(block.id);
                }}
                aria-label="Delete time block"
              >
                ×
              </button>
            </div>
            <div
              className="resize-handle resize-bottom"
              onMouseDown={(e) => {
                e.stopPropagation();
                setResizingBlock({ id: block.id, direction: 'bottom' });
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                setResizingBlock({ id: block.id, direction: 'bottom' });
              }}
            />
          </div>
        ))}

        {previewBlock && previewBlock.duration >= MIN_BLOCK_DURATION && (
          <div
            className="time-block preview"
            style={{
              top: `${timeToY(previewBlock.startTime) + 12}px`,
              height: `${timeToY(previewBlock.duration)}px`,
            }}
          >
            <div className="time-block-content">
              <span className="time-block-duration">{formatDuration(previewBlock.duration)}</span>
            </div>
          </div>
        )}

        {showCurrentTimeLine && (
          <div
            className="current-time-line"
            style={{ top: `${timeToY(currentTimeMinutes) + 12}px` }}
          >
            <div className="current-time-indicator" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DayCalendar;
