import type { TimeBlock } from '../../../types';
import { timeToY } from '../../../utils/timeCalculations';
import { formatTime, formatDuration } from '../../../utils/timeFormatters';
import './time-block.css';

interface TimeBlockProps {
  block: TimeBlock;
  onRemove: (id: string) => void;
  onStartMove: (id: string) => void;
  onStartResize: (id: string, edge: 'top' | 'bottom') => void;
}

/**
 * Individual time block component with drag and resize functionality
 */
function TimeBlockComponent({ block, onRemove, onStartMove, onStartResize }: TimeBlockProps) {
  return (
    <div
      className="time-block"
      style={{
        top: `${timeToY(block.startTime) + 12}px`,
        height: `${timeToY(block.duration)}px`
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onStartMove(block.id);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onStartMove(block.id);
      }}
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
            onRemove(block.id);
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
