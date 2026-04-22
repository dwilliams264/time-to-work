import { useState } from 'react';
import { useAttendanceData } from '../../hooks/useAttendanceData';
import NavigationHeader from '../../components/shared/navigation-header/navigation-header.component';
import { MONTH_NAMES_FULL } from '../../constants/dates';
import AttendanceSettingsPanel from '../../components/days-to-work/attendance-settings/attendance-settings.component';
import AttendanceStats from '../../components/days-to-work/attendance-stats/attendance-stats.component';
import WeekGrid from '../../components/days-to-work/week-grid/week-grid.component';

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
  const label = `${MONTH_NAMES_FULL[displayMonth]} ${displayYear}`;

  const canGoBack = monthOffset > -MAX_MONTHS_BACK;
  const canGoForward = monthOffset < 0;

  return (
    <>
      <NavigationHeader
        label={label}
        onPrev={() => setMonthOffset((o) => o - 1)}
        onNext={() => setMonthOffset((o) => o + 1)}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        testId="week-navigation"
        prevTestId="week-grid-prev"
        nextTestId="week-grid-next"
        labelTestId="week-grid-label"
        prevAriaLabel="Previous month"
        nextAriaLabel="Next month"
      />

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
