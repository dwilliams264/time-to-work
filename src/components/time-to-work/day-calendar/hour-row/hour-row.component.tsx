import { HOUR_HEIGHT } from '../../../../constants/calendar';
import './hour-row.css';

interface HourRowProps {
  hour: number;
}

/**
 * Individual hour row in the calendar grid
 */
function HourRow({ hour }: HourRowProps) {
  return (
    <div className="hour-row" style={{ height: `${HOUR_HEIGHT}px` }}>
      <div className="hour-label">
        {hour.toString().padStart(2, '0')}:00
      </div>
      <div className="hour-line" />
    </div>
  );
}

export default HourRow;
