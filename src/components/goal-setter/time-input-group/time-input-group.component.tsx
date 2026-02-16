import './time-input-group.css';

interface TimeInputGroupProps {
  hours: number;
  minutes: number;
  onHoursChange: (hours: number) => void;
  onMinutesChange: (minutes: number) => void;
  maxHours: number;
  size?: 'normal' | 'small';
  hoursId?: string;
  minutesId?: string;
}

/**
 * Reusable time input group for hours and minutes
 */
function TimeInputGroup({
  hours,
  minutes,
  onHoursChange,
  onMinutesChange,
  maxHours,
  size = 'normal',
  hoursId,
  minutesId
}: TimeInputGroupProps) {
  const sizeClass = size === 'small' ? 'small' : '';

  return (
    <>
      <div className={`input-group ${sizeClass}`}>
        <input
          id={hoursId}
          type="number"
          min="0"
          max={maxHours}
          value={hours}
          onChange={(e) => onHoursChange(parseInt(e.target.value) || 0)}
          className={`time-input ${sizeClass}`}
        />
        <label htmlFor={hoursId}>Hours</label>
      </div>
      <span className={`input-separator ${sizeClass}`}>:</span>
      <div className={`input-group ${sizeClass}`}>
        <input
          id={minutesId}
          type="number"
          min="0"
          max="59"
          value={minutes}
          onChange={(e) => onMinutesChange(parseInt(e.target.value) || 0)}
          className={`time-input ${sizeClass}`}
        />
        <label htmlFor={minutesId}>Mins</label>
      </div>
    </>
  );
}

export default TimeInputGroup;
