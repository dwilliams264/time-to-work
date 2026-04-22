import { useRef, useEffect } from 'react';
import type { TimeBlock } from '../../types';
import {
  HOURS_START,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  MIN_BLOCK_DURATION,
  TIME_UPDATE_INTERVAL,
  CALENDAR_PADDING_TOP,
} from '../../constants/calendar';
import { timeToY, getCurrentTimeMinutes } from '../../utils/timeCalculations';
import { formatDuration } from '../../utils/timeFormatters';
import { useCalendarInteractions, useCurrentTime } from '../../hooks/useCalendarInteractions';
import TimeBlockComponent from './time-block/time-block.component';
import HourRow from './hour-row/hour-row.component';
import LunchIndicator from './lunch-indicator/lunch-indicator.component';
import './day-calendar.css';

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
  isToday?: boolean;
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
  snapBlockToValid,
  isToday = true
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

  // Scroll to current time (or start of day) on mount
  useEffect(() => {
    if (!calendarRef.current) return;
    const currentMinutes = getCurrentTimeMinutes(new Date(), HOURS_START);
    const targetMinutes = isToday && currentMinutes >= 0 ? currentMinutes : 0;
    const targetY = timeToY(targetMinutes) + CALENDAR_PADDING_TOP;
    const viewportHeight = calendarRef.current.clientHeight;
    calendarRef.current.scrollTop = Math.max(0, targetY - viewportHeight / 2);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentTimeMinutes = getCurrentTimeMinutes(currentTime, HOURS_START);
  const showCurrentTimeLine =
    isToday && currentTimeMinutes >= 0 && currentTimeMinutes <= TOTAL_HOURS * 60;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOURS_START + i);

  return (
    <div className="calendar-container" data-testid="calendar-container">
      <div className="calendar-header" data-testid="calendar-header">
        <div className="calendar-header-top">
          <h2 data-testid="calendar-title">{isToday ? "Today's Schedule" : "Day's Schedule"}</h2>
          <button 
            className="clear-all-button"
            onClick={onClearAll}
            disabled={timeBlocks.length === 0}
            data-testid="calendar-clear-all"
          >
            Clear All
          </button>
        </div>
        <p className="calendar-hint" data-testid="calendar-hint">Drag to create a time block</p>
      </div>

      <div
        ref={calendarRef}
        className="calendar"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        data-testid="calendar-grid"
      >
        {hours.map((hour) => (
          <HourRow key={hour} hour={hour} />
        ))}

        {timeBlocks.map((block) => (
          <TimeBlockComponent
            key={block.id}
            block={block}
            onRemove={onRemoveBlock}
            onStartMove={startMovingBlock}
            onStartResize={startResizingBlock}
          />
        ))}

        {lunchEnabled && (
          <LunchIndicator
            startTime={lunchStartTime}
            duration={lunchDuration}
            onStartMove={startMovingLunch}
          />
        )}

        {previewBlock && previewBlock.duration >= MIN_BLOCK_DURATION && (
          <div
            className="time-block preview"
            style={{
              top: `${timeToY(previewBlock.startTime) + CALENDAR_PADDING_TOP}px`,
              height: `${timeToY(previewBlock.duration)}px`,
            }}
            data-testid="calendar-preview-block"
          >
            <div className="time-block-content">
              <span className="time-block-duration">{formatDuration(previewBlock.duration)}</span>
            </div>
          </div>
        )}

        {showCurrentTimeLine && (
          <div
            className="current-time-line"
            style={{ top: `${timeToY(currentTimeMinutes) + CALENDAR_PADDING_TOP}px` }}
            data-testid="calendar-current-time-line"
          >
            <div className="current-time-indicator" data-testid="calendar-current-time-indicator" />
          </div>
        )}
      </div>
    </div>
  );
}

export default DayCalendar;
