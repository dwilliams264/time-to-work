import type { DayType } from '../../../../types/attendance';
import { DAY_TYPE_CONFIG, DAY_TYPE_CYCLE } from '../../../../constants/attendance';
import { DAY_NAMES_SHORT, MONTH_NAMES_SHORT } from '../../../../constants/dates';
import './day-cell.css';

interface DayCellProps {
  date: Date;
  type: DayType | undefined;
  onTypeChange: (type: DayType | null) => void;
  isDisabled: boolean;
}

function DayCell({ date, type, onTypeChange, isDisabled }: DayCellProps) {
  const dayName = DAY_NAMES_SHORT[date.getDay()];
  const dateNum = date.getDate();
  const monthName = MONTH_NAMES_SHORT[date.getMonth()];

  const handleClick = () => {
    if (isDisabled) return;
    const currentIdx = DAY_TYPE_CYCLE.indexOf(type);
    const nextIdx = (currentIdx + 1) % DAY_TYPE_CYCLE.length;
    const nextType = DAY_TYPE_CYCLE[nextIdx];
    onTypeChange(nextType ?? null);
  };

  const config = type ? DAY_TYPE_CONFIG[type] : null;

  return (
    <div
      className={`day-cell${config ? ` ${config.colorClass}` : ''}${isDisabled ? ' day-cell-disabled' : ''}`}
      data-testid={`day-cell-${formatDateStr(date)}`}
      onClick={handleClick}
      role="button"
      aria-label={`${dayName} ${dateNum} ${monthName}${type ? `: ${config!.label}` : ''}`}
      aria-disabled={isDisabled}
    >
      <div className="day-cell-header">
        <span className="day-cell-name">{dayName}</span>
        <span className="day-cell-date">{dateNum}</span>
      </div>
      {config && (
        <span className={`day-type-chip ${config.colorClass}`} data-testid={`day-type-chip-${formatDateStr(date)}`}>
          {config.shortLabel}
        </span>
      )}
      {!config && !isDisabled && (
        <span className="day-type-empty">—</span>
      )}
    </div>
  );
}

function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default DayCell;
