import type { TimeBlock } from '../../../../types';
import { timeToY } from '../../../../utils/timeCalculations';
import { formatTime, formatDuration } from '../../../../utils/timeFormatters';
import { HOUR_HEIGHT, CALENDAR_PADDING_TOP } from '../../../../constants/calendar';
import './time-block.css';

interface TimeBlockProps {
  block: TimeBlock;
  onRemove: (id: string) => void;
  onUpdate: (id: string, startTime: number, duration: number) => void;
  onStartMove: (id: string, grabOffset: number) => void;
  onStartResize: (id: string, edge: 'top' | 'bottom') => void;
}

/**
 * Individual time block component with drag and resize functionality
 * Supports keyboard navigation: Arrow keys to move, Delete to remove
 */
function TimeBlockComponent({ block, onRemove, onUpdate, onStartMove, onStartResize }: TimeBlockProps) {
  const MOVE_STEP_MINUTES = 15; // Move by 15-minute increments

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        e.preventDefault();
        onRemove(block.id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Move block up (earlier in the day)
        onUpdate(block.id, Math.max(0, block.startTime - MOVE_STEP_MINUTES), block.duration);
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Move block down (later in the day)
        onUpdate(block.id, block.startTime + MOVE_STEP_MINUTES, block.duration);
        break;
    }
  };

  return (
    <div
      className="time-block"
      style={{
        top: `${timeToY(block.startTime) + CALENDAR_PADDING_TOP}px`,
        height: `${timeToY(block.duration)}px`
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        const grabOffset = (e.clientY - e.currentTarget.getBoundingClientRect().top) * 60 / HOUR_HEIGHT;
        onStartMove(block.id, grabOffset);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        const grabOffset = (e.touches[0].clientY - e.currentTarget.getBoundingClientRect().top) * 60 / HOUR_HEIGHT;
        onStartMove(block.id, grabOffset);
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Work block from ${formatTime(block.startTime)} to ${formatTime(block.startTime + block.duration)}, duration ${formatDuration(block.duration)}. Press Delete to remove, Arrow Up or Down to move.`}
      data-testid="calendar-time-block"
    >
      <div
        className="resize-handle resize-top"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(block.id, 'top');
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onStartResize(block.id, 'top');
        }}
      />
      <div className="time-block-content" data-testid="calendar-time-block-content">
        <span className="time-block-title">💻 Work</span>
        <span className="time-block-time">
          {formatTime(block.startTime)} - {formatTime(block.startTime + block.duration)}
        </span>
        <span className="time-block-duration">{formatDuration(block.duration)}</span>
        <button
          className="delete-button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(block.id);
          }}
          aria-label="Delete time block"
          data-testid="calendar-time-block-delete"
        >
          ×
        </button>
      </div>
      <div
        className="resize-handle resize-bottom"
        onMouseDown={(e) => {
          e.stopPropagation();
          onStartResize(block.id, 'bottom');
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
          onStartResize(block.id, 'bottom');
        }}
      />
    </div>
  );
}

export default TimeBlockComponent;
