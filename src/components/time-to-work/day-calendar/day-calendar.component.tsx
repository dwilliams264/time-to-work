import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { TimeBlock } from '../../../types';
import {
  HOURS_START,
  TOTAL_HOURS,
  HOUR_HEIGHT,
  MIN_BLOCK_DURATION,
  TIME_UPDATE_INTERVAL,
  CALENDAR_PADDING_TOP,
} from '../../../constants/calendar';
import { timeToY, getCurrentTimeMinutes } from '../../../utils/timeCalculations';
import { formatDuration } from '../../../utils/timeFormatters';
import { useCalendarInteractions, useCurrentTime } from '../../../hooks/useCalendarInteractions';
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
  
  // State for keyboard time block creation modal
  const [showAddBlockModal, setShowAddBlockModal] = useState(false);
  const [newBlockStartHour, setNewBlockStartHour] = useState<string>('9'); // Default 9 AM
  const [newBlockStartMinute, setNewBlockStartMinute] = useState<string>('0');
  const [newBlockDurationHours, setNewBlockDurationHours] = useState<string>('1');
  const [newBlockDurationMinutes, setNewBlockDurationMinutes] = useState<string>('0');
  const [announcement, setAnnouncement] = useState('');

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

  const handleAddBlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const startHour = parseInt(newBlockStartHour) || HOURS_START;
    const startMin = parseInt(newBlockStartMinute) || 0;
    const durHours = parseInt(newBlockDurationHours) || 0;
    const durMins = parseInt(newBlockDurationMinutes) || 0;
    
    const startTimeMinutes = (startHour - HOURS_START) * 60 + startMin;
    const durationMinutes = durHours * 60 + durMins;
    
    if (durationMinutes >= MIN_BLOCK_DURATION) {
      onAddBlock(startTimeMinutes, durationMinutes);
      setAnnouncement(`Time block added: ${formatDuration(durationMinutes)} starting at ${startHour}:${String(startMin).padStart(2, '0')}`);
      setShowAddBlockModal(false);
      // Reset form to defaults
      setNewBlockStartHour('9');
      setNewBlockStartMinute('0');
      setNewBlockDurationHours('1');
      setNewBlockDurationMinutes('0');
    }
  };

  const handleRemoveBlock = (id: string) => {
    const block = timeBlocks.find(b => b.id === id);
    if (block) {
      setAnnouncement(`Time block removed: ${formatDuration(block.duration)}`);
    }
    onRemoveBlock(id);
  };

  const currentTimeMinutes = getCurrentTimeMinutes(currentTime, HOURS_START);
  const showCurrentTimeLine =
    isToday && currentTimeMinutes >= 0 && currentTimeMinutes <= TOTAL_HOURS * 60;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOURS_START + i);

  return (
    <>
      {/* Modal rendered via Portal at document root to be a true overlay */}
      {showAddBlockModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAddBlockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Time Block</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowAddBlockModal(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddBlockSubmit} className="add-block-form">
              <div className="form-section">
                <label className="form-label">Start Time</label>
                <div className="time-inputs-row">
                  <div className="input-group">
                    <input
                      type="number"
                      min={HOURS_START}
                      max={HOURS_START + TOTAL_HOURS - 1}
                      value={newBlockStartHour}
                      onChange={(e) => setNewBlockStartHour(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="time-input"
                      aria-label="Start hour"
                    />
                    <label>Hour</label>
                  </div>
                  <span className="input-separator">:</span>
                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newBlockStartMinute}
                      onChange={(e) => setNewBlockStartMinute(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="time-input"
                      aria-label="Start minute"
                    />
                    <label>Min</label>
                  </div>
                </div>
              </div>
              
              <div className="form-section">
                <label className="form-label">Duration</label>
                <div className="time-inputs-row">
                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      max="12"
                      value={newBlockDurationHours}
                      onChange={(e) => setNewBlockDurationHours(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="time-input"
                      aria-label="Duration hours"
                    />
                    <label>Hours</label>
                  </div>
                  <span className="input-separator">:</span>
                  <div className="input-group">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={newBlockDurationMinutes}
                      onChange={(e) => setNewBlockDurationMinutes(e.target.value)}
                      onFocus={(e) => e.target.select()}
                      className="time-input"
                      aria-label="Duration minutes"
                    />
                    <label>Min</label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="button-secondary"
                  onClick={() => setShowAddBlockModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="button-primary"
                  disabled={(parseInt(newBlockDurationHours) || 0) === 0 && (parseInt(newBlockDurationMinutes) || 0) < MIN_BLOCK_DURATION}
                >
                  Add Block
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      <div className="calendar-container" data-testid="calendar-container">
      {/* Screen reader announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcement}
      </div>

      <div className="calendar-header" data-testid="calendar-header">
        <div className="calendar-header-top">
          <h2 data-testid="calendar-title">{isToday ? "Today's Schedule" : "Day's Schedule"}</h2>
          <div className="calendar-header-actions">
            <button 
              className="add-block-button"
              onClick={() => setShowAddBlockModal(true)}
              data-testid="calendar-add-block"
              aria-label="Add time block"
            >
              + Add Block
            </button>
            <button 
              className="clear-all-button"
              onClick={onClearAll}
              disabled={timeBlocks.length === 0}
              data-testid="calendar-clear-all"
            >
              Clear All
            </button>
          </div>
        </div>
        <p className="calendar-hint" data-testid="calendar-hint">Drag to create a time block, or use "Add Block" button</p>
      </div>

      <div
        ref={calendarRef}
        className="calendar"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
        data-testid="calendar-grid"
      >
        <div className="calendar-content" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
        {hours.map((hour) => (
          <HourRow key={hour} hour={hour} />
        ))}

        {timeBlocks.map((block) => (
          <TimeBlockComponent
            key={block.id}
            block={block}
            onRemove={handleRemoveBlock}
            onUpdate={onUpdateBlock}
            onStartMove={startMovingBlock}
            onStartResize={startResizingBlock}
          />
        ))}

        {lunchEnabled && (
          <LunchIndicator
            startTime={lunchStartTime}
            duration={lunchDuration}
            onStartMove={startMovingLunch}
            onTimeChange={onLunchTimeChange}
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
    </div>
    </>
  );
}

export default DayCalendar;
