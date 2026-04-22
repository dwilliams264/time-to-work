import type { MonthlyAttendancePoint } from '../../../utils/attendanceCalculations';
import { MONTH_NAMES_SHORT } from '../../../constants/dates';
import './ytd-chart.css';

export interface YtdChartProps {
  /** 12-element array (index 0=Jan). null = no data (future month). */
  monthData: Array<MonthlyAttendancePoint | null>;
  targetPct: number;
}

function YtdChart({ monthData, targetPct }: YtdChartProps) {
  return (
    <div className="ytd-chart-wrapper">
      {monthData.map((data, i) => {
        const isFuture = data === null;
        const pct = data?.attendancePct ?? 0;
        const state = isFuture ? 'future' : data!.inProgress ? 'progress' : data!.metTarget ? 'met' : 'missed';

        return (
          <div key={i} className="ytd-row" data-testid={`ytd-bar-${MONTH_NAMES_SHORT[i].toLowerCase()}`}>
            <span className="ytd-month">{MONTH_NAMES_SHORT[i]}</span>
            <div className="ytd-track">
              {!isFuture && pct > 0 && (
                <div
                  className={`ytd-fill ytd-fill--${state}`}
                  style={{ width: `${pct}%` }}
                />
              )}
              {/* Target marker */}
              <div
                className="ytd-target-marker"
                style={{ left: `${targetPct}%` }}
                aria-hidden="true"
              />
            </div>
            <span className={`ytd-pct ytd-pct--${state}`}>
              {isFuture ? '—' : `${pct}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default YtdChart;
