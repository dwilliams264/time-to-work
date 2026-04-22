import { useState } from 'react';
import { useIsMobile } from '../../../hooks/useIsMobile';
import type { AttendanceDay, AttendanceSettings } from '../../../types/attendance';
import {
  calculateAttendance,
  getMonthlyAttendance,
  getThisWeekRange,
  getThisMonthRange,
} from '../../../utils/attendanceCalculations';
import type { MonthlyAttendancePoint } from '../../../utils/attendanceCalculations';
import StatCard from '../../time-stats/stat-card/stat-card.component';
import ProgressBar from '../../time-stats/progress-bar/progress-bar.component';
import MobileSummaryBar from '../../shared/mobile-summary-bar/mobile-summary-bar.component';
import YtdChart from '../ytd-chart/ytd-chart.component';
import './attendance-stats.css';

type Period = 'ytd' | 'month' | 'week';

const PERIOD_LABELS: Record<Period, string> = {
  ytd: 'Year to Date',
  month: 'This Month',
  week: 'This Week',
};

interface AttendanceStatsProps {
  attendanceDays: AttendanceDay[];
  settings: AttendanceSettings;
}

function AttendanceStats({ attendanceDays, settings }: AttendanceStatsProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('ytd');
  const isMobile = useIsMobile();

  const now = new Date();
  const targetPct = Math.round((settings.daysInOffice / settings.daysWorkedPerWeek) * 100);

  const rangeMap: Record<Exclude<Period, 'ytd'>, [Date, Date]> = {
    month: getThisMonthRange(now),
    week: getThisWeekRange(now),
  };

  // Result is only needed for week/month tabs
  const currentRange = activePeriod !== 'ytd' ? rangeMap[activePeriod] : null;
  const result = currentRange
    ? calculateAttendance(attendanceDays, currentRange[0], currentRange[1], settings)
    : null;

  // YTD chart — completed months get full-month data; current month is capped at today
  const completedMonthCount = now.getMonth(); // 0-based: March=2 means Jan+Feb completed
  const monthlyPoints = getMonthlyAttendance(
    attendanceDays,
    now.getFullYear(),
    completedMonthCount,
    settings,
  );

  // Current (in-progress) month — range capped at today
  const [currentMonthStart, currentMonthEnd] = getThisMonthRange(now);
  const currentMonthResult = calculateAttendance(attendanceDays, currentMonthStart, currentMonthEnd, settings);
  const currentMonthPoint: MonthlyAttendancePoint = {
    month: now.getMonth(),
    attendancePct: currentMonthResult.attendancePct,
    metTarget: currentMonthResult.metTarget,
    inProgress: true,
  };

  const monthData = Array.from({ length: 12 }, (_, i): MonthlyAttendancePoint | null => {
    if (i < completedMonthCount) return monthlyPoints.find((p) => p.month === i) ?? null;
    if (i === now.getMonth()) return currentMonthPoint;
    return null;
  });

  // Always compute this-month result for the mobile summary bar
  const [mobileMonthStart, mobileMonthEnd] = getThisMonthRange(now);
  const mobileMonthResult = calculateAttendance(attendanceDays, mobileMonthStart, mobileMonthEnd, settings);

  const periods: Period[] = ['ytd', 'month', 'week'];

  return (
    <>
      <div className="attendance-stats" data-testid="attendance-stats-container">
        {/* Full tabbed interface — visible on tablet/desktop, hidden on mobile */}
        <div className="attendance-stats-tabs" data-testid="attendance-stats-tabs" role="tablist">
        {periods.map((p) => (
          <button
            key={p}
            role="tab"
            aria-selected={activePeriod === p}
            className={`stats-tab${activePeriod === p ? ' active' : ''}`}
            data-testid={`stats-tab-${p}`}
            onClick={() => setActivePeriod(p)}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
        </div>

        <div className="attendance-stats-body" data-testid="attendance-stats-body">
          {activePeriod === 'ytd' ? (
            <YtdChart monthData={monthData} targetPct={targetPct} />
          ) : (
            <>
              <StatCard
                title="Attendance"
                value={`${result!.attendancePct}%`}
                variant="primary"
                testId="attendance-stat-pct"
              />

              <ProgressBar
                percentage={Math.min(100, (result!.attendancePct / result!.targetPct) * 100)}
                isComplete={result!.metTarget}
              />

              <div
                className={`target-badge${result!.metTarget ? ' met' : ' not-met'}`}
                data-testid="attendance-target-badge"
                role="status"
              >
                {result!.metTarget ? '✓ Target met' : '✗ Target not met'} ({result!.targetPct}%)
              </div>

              <div className="attendance-breakdown" data-testid="attendance-breakdown">
                <div className="breakdown-row">
                  <span>Attendance days</span>
                  <span data-testid="stat-attendance-days">{result!.attendanceDays}</span>
                </div>
                <div className="breakdown-row">
                  <span>Available work days</span>
                  <span data-testid="stat-available-days">{result!.availableWorkDays}</span>
                </div>
                <div className="breakdown-row">
                  <span>WFH days</span>
                  <span data-testid="stat-wfh-days">{result!.wfhDays}</span>
                </div>
                <div className="breakdown-row">
                  <span>Leave days</span>
                  <span data-testid="stat-leave-days">{result!.leaveDays}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isMobile && (
      <MobileSummaryBar
        title="This Month"
        value={`${mobileMonthResult.attendancePct}%`}
        progressPercentage={Math.min(100, (mobileMonthResult.attendancePct / mobileMonthResult.targetPct) * 100)}
        isComplete={mobileMonthResult.metTarget}
        testId="attendance-stats-mobile-bar"
        badge={
          <div
            className={`target-badge${mobileMonthResult.metTarget ? ' met' : ' not-met'}`}
            role="status"
          >
            {mobileMonthResult.metTarget ? '✓ Target met' : '✗ Target not met'}
          </div>
        }
      />
      )}
    </>
  );
}

export default AttendanceStats;
