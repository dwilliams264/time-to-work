import { useRef } from 'react';
import type { TimeBlock } from '../types';
import {
  HOURS_START,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  MIN_BLOCK_DURATION,
  TIME_UPDATE_INTERVAL,
} from '../constants/calendar';
import { timeToY, getCurrentTimeMinutes } from '../utils/timeCalculations';
import { formatTime, formatDuration } from '../utils/timeFormatters';
import { useCalendarInteractions, useCurrentTime } from '../hooks/useCalendarInteractions';
import './DayCalendar.css';

interface DayCalendarProps {
  timeBlocks: TimeBlock[];
  onAddBlock: (startTime: number, duration: number) => void;
  onRemoveBlock: (id: string) => void;
  onUpdateBlock: (id: string, startTime: number, duration: number) => void;
  onClearAll: () => void;
  lunchEnabled: boolean;
  lunchStartTime: number;
  lunchDuration: number;
  onLunchTimeChange: (startTime: number) => void;
  snapBlockToValid: (startTime: number, duration: number, excludeId?: string) => { startTime: number; duration: number };
}

/**
 * Interactive calendar component for creating and managing time blocks
 * Supports drag-and-drop to create blocks, move blocks, and resize blocks
 * Works with both mouse and touch events for mobile support
 */
function DayCalendar({ 
  timeBlocks, 
  onAddBlock, 
  onRemoveBlock, 
  onUpdateBlock, 
  onClearAll,
  lunchEnabled,
  lunchStartTime,
  lunchDuration,
  onLunchTimeChange,
  snapBlockToValid
}: DayCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for all interactions
  const {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    previewBlock,
    startMovingBlock,
    startResizingBlock,
    startMovingLunch,
  } = useCalendarInteractions(
    calendarRef,
    timeBlocks,
    lunchDuration,
    onAddBlock,
    onUpdateBlock,
    onLunchTimeChange,
    snapBlockToValid
  );

  // Track current time
  const currentTime = useCurrentTime(TIME_UPDATE_INTERVAL);

  const currentTimeMinutes = getCurrentTimeMinutes(currentTime, HOURS_START);
  const showCurrentTimeLine =
    currentTimeMinutes >= 0 && currentTimeMinutes <= TOTAL_HOURS * 60;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOURS_START + i);

  // Unified event handlers for mouse and touch
  const handlePointerDownEvent = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    handlePointerDown(e);
  };

  const handlePointerMoveEvent = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    handlePointerMove(e);
  };

  const handlePointerUpEvent = () => {
    handlePointerUp();
  };

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
        onMouseDown={handlePointerDownEvent}
        onMouseMove={handlePointerMoveEvent}
        onTouchStart={handlePointerDownEvent}
        onTouchMove={handlePointerMoveEvent}
        onTouchEnd={handlePointerUpEvent}
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
              top: `${timeToY(block.startTime) + 12}px`,
              height: `${timeToY(block.duration)}px`
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startMovingBlock(block.id);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              startMovingBlock(block.id);
            }}
          >
            <div
              className="resize-handle resize-top"
              onMouseDown={(e) => {
                e.stopPropagation();
                startResizingBlock(block.id, 'top');
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                startResizingBlock(block.id, 'top');
              }}
            />
            <div className="time-block-content">
              <span className="time-block-title">💻 Work</span>
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
                startResizingBlock(block.id, 'bottom');
              }}
              onTouchStart={(e) => {
                e.stopPropagation();
                startResizingBlock(block.id, 'bottom');
              }}
            />
          </div>
        ))}

        {lunchEnabled && (
          <div
            className="lunch-indicator"
            style={{
              top: `${timeToY(lunchStartTime) + 12}px`,
              height: `${timeToY(lunchDuration)}px`
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              startMovingLunch();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              startMovingLunch();
            }}
          >
            <div className="lunch-content">
              <span className="lunch-title">🍽️ Lunch</span>
              <span className="lunch-time">{formatTime(lunchStartTime)}</span>
            </div>
          </div>
        )}

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
