import { useState } from 'react';
import { useAttendanceData } from '../../hooks/useAttendanceData';
import AttendanceSettingsPanel from '../../components/days-to-work/attendance-settings/attendance-settings.component';
import AttendanceStats from '../../components/days-to-work/attendance-stats/attendance-stats.component';
import WeekGrid from '../../components/days-to-work/week-grid/week-grid.component';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MAX_MONTHS_BACK = 2;

function getMonthWeekdays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    const dow = date.getDay();
    if (dow >= 1 && dow <= 5) {
      days.push(new Date(date));
    }
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function DaysToWork() {
  const { settings, updateSettings, getDayType, setDayType, attendanceDays } = useAttendanceData();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [monthOffset, setMonthOffset] = useState(0);

  const displayDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const displayYear = displayDate.getFullYear();
  const displayMonth = displayDate.getMonth();
  const days = getMonthWeekdays(displayYear, displayMonth);
  const label = `${MONTH_NAMES[displayMonth]} ${displayYear}`;

  const canGoBack = monthOffset > -MAX_MONTHS_BACK;
  const canGoForward = monthOffset < 0;

  return (
    <>
      <div className="date-navigation" data-testid="week-navigation">
        <button
          className="nav-button"
          onClick={() => setMonthOffset((o) => o - 1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          data-testid="week-grid-prev"
        >
          ←
        </button>
        <p className="current-date" data-testid="week-grid-label">
          {label}
        </p>
        <button
          className="nav-button"
          onClick={() => setMonthOffset((o) => o + 1)}
          disabled={!canGoForward}
          aria-label="Next month"
          data-testid="week-grid-next"
        >
          →
        </button>
      </div>

      <div className="app-content" data-testid="days-to-work-content">
        <div className="sidebar" data-testid="days-to-work-sidebar">
          <AttendanceSettingsPanel settings={settings} onSettingsChange={updateSettings} />
          <AttendanceStats attendanceDays={attendanceDays} settings={settings} />
        </div>
        <main className="main-content" data-testid="days-to-work-main">
          <WeekGrid days={days} getDayType={getDayType} onDayTypeChange={setDayType} />
        </main>
      </div>
    </>
  );
}

export default DaysToWork;
