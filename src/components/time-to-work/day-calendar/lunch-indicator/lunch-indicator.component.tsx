import { timeToY } from '../../../../utils/timeCalculations';
import { formatTime } from '../../../../utils/timeFormatters';
import './lunch-indicator.css';

interface LunchIndicatorProps {
  startTime: number;
  duration: number;
  onStartMove: () => void;
}

/**
 * Lunch break indicator on the calendar
 */
function LunchIndicator({ startTime, duration, onStartMove }: LunchIndicatorProps) {
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
