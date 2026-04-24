import { timeToY } from '../../../../utils/timeCalculations';
import { formatTime } from '../../../../utils/timeFormatters';
import './lunch-indicator.css';

interface LunchIndicatorProps {
  startTime: number;
  duration: number;
  onStartMove: () => void;
  onTimeChange: (startTime: number) => void;
}

/**
 * Lunch break indicator on the calendar
 * Supports keyboard navigation: Arrow Up/Down to adjust time by 15-minute increments
 */
function LunchIndicator({ startTime, duration, onStartMove, onTimeChange }: LunchIndicatorProps) {
  const MOVE_STEP_MINUTES = 15; // Move by 15-minute increments

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        // Move lunch earlier
        onTimeChange(Math.max(0, startTime - MOVE_STEP_MINUTES));
        break;
      case 'ArrowDown':
        e.preventDefault();
        // Move lunch later
        onTimeChange(startTime + MOVE_STEP_MINUTES);
        break;
    }
  };

  return (
    <div
      className="lunch-indicator"
      style={{
        top: `${timeToY(startTime) + 12}px`,
        height: `${timeToY(duration)}px`
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onStartMove();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onStartMove();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Lunch break at ${formatTime(startTime)}. Press Arrow Up or Down to adjust time.`}
      data-testid="calendar-lunch-indicator"
    >
      <div className="lunch-content">
        <span className="lunch-title">🍽️ Lunch</span>
        <span className="lunch-time">{formatTime(startTime)}</span>
      </div>
    </div>
  );
}

export default LunchIndicator;
