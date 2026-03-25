import type { DayType } from '../../../types/attendance';
import { AttendanceStorageService } from '../../../utils/attendanceStorage';
import DayCell from './day-cell/day-cell.component';
import './week-grid.css';

const DOW_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

interface WeekGridProps {
  days: Date[];
  getDayType: (date: string) => DayType | undefined;
  onDayTypeChange: (date: string, type: DayType | null) => void;
}

function WeekGrid({ days, getDayType, onDayTypeChange }: WeekGridProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="week-grid" data-testid="week-grid">
      <div className="week-grid-header">
        {DOW_HEADERS.map((h) => (
          <span key={h} className="week-grid-dow-header">{h}</span>
        ))}
      </div>
      <div className="week-grid-days" data-testid="week-grid-days">
        {days.map((date) => {
          const dateStr = AttendanceStorageService.formatDate(date);
          const isDisabled = date > today;
          // date.getDay(): Mon=1 … Fri=5, maps directly to CSS grid-column 1–5
          return (
            <div key={dateStr} style={{ gridColumn: date.getDay() }}>
              <DayCell
                date={date}
                type={getDayType(dateStr)}
                onTypeChange={(type) => onDayTypeChange(dateStr, type)}
                isDisabled={isDisabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekGrid;
