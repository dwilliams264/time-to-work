import type { MonthlyAttendancePoint } from '../../../utils/attendanceCalculations';
import './ytd-chart.css';

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// SVG coordinate space — taller to give value labels room above bars
const W = 280;
const H = 175;
const PL = 28;  // left  – y-axis labels
const PR = 8;   // right
const PT = 18;  // top   – room for value labels above bars
const PB = 22;  // bottom – x-axis labels
const CW = W - PL - PR;   // chart width  = 244
const CH = H - PT - PB;   // chart height = 135

function yForPct(pct: number): number {
  return PT + CH * (1 - pct / 100);
}

export interface YtdChartProps {
  /** 12-element array (index 0=Jan). null = no data (future / current month). */
  monthData: Array<MonthlyAttendancePoint | null>;
  targetPct: number;
}

const Y_TICKS = [0, 20, 40, 60, 80, 100];

function YtdChart({ monthData, targetPct }: YtdChartProps) {
  const slotW = CW / 12;
  const barW = Math.max(11, slotW * 0.68);
  const targetY = yForPct(targetPct);

  return (
    <div className="ytd-chart-wrapper">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="ytd-chart"
        aria-label="Monthly attendance chart"
        role="img"
      >
        <defs>
          <linearGradient id="ytd-grad-met" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
          <linearGradient id="ytd-grad-missed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="ytd-grad-progress" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c7d2fe" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        {/* Horizontal grid lines + Y-axis labels */}
        {Y_TICKS.map((pct) => {
          const y = yForPct(pct);
          return (
            <g key={pct}>
              <line
                x1={PL}
                y1={y}
                x2={PL + CW}
                y2={y}
                className={`ytd-grid-line${pct === 0 ? ' ytd-grid-line--axis' : ''}`}
              />
              <text
                x={PL - 4}
                y={y}
                className="ytd-label ytd-label--y"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {pct}%
              </text>
            </g>
          );
        })}

        {/* Month bars */}
        {monthData.map((data, i) => {
          const cx = PL + i * slotW + slotW / 2;
          const barX = cx - barW / 2;
          const hasData = data !== null;

          return (
            <g key={i}>
              {/* Background track */}
              <rect
                x={barX}
                y={PT}
                width={barW}
                height={CH}
                className={`ytd-bar-track${hasData ? '' : ' ytd-bar-track--future'}`}
                rx={4}
              />
              {/* Filled bar */}
              {hasData && data.attendancePct > 0 && (
                <rect
                  x={barX}
                  y={yForPct(data.attendancePct)}
                  width={barW}
                  height={(data.attendancePct / 100) * CH}
                  className={`ytd-bar${data.inProgress ? ' ytd-bar--in-progress' : data.metTarget ? ' ytd-bar--met' : ' ytd-bar--missed'}`}
                  rx={4}
                  style={{ fill: data.inProgress ? 'url(#ytd-grad-progress)' : data.metTarget ? 'url(#ytd-grad-met)' : 'url(#ytd-grad-missed)' }}
                  data-testid={`ytd-bar-${MONTHS_SHORT[i].toLowerCase()}`}
                />
              )}
              {/* Value label above/inside the bar */}
              {hasData && data.attendancePct > 0 && (
                <text
                  x={cx}
                  y={Math.max(PT + 9, yForPct(data.attendancePct) - 3)}
                  className={`ytd-bar-value${data.inProgress ? ' ytd-bar-value--in-progress' : data.metTarget ? ' ytd-bar-value--met' : ' ytd-bar-value--missed'}`}
                  textAnchor="middle"
                  dominantBaseline="auto"
                >
                  {data.attendancePct}%
                </text>
              )}
              {/* Month label */}
              <text
                x={cx}
                y={H - 5}
                className={`ytd-label ytd-label--x${!hasData ? ' ytd-label--future' : data.inProgress ? ' ytd-label--in-progress' : ''}`}
                textAnchor="middle"
              >
                {MONTHS_SHORT[i]}
              </text>
            </g>
          );
        })}

        {/* Target line — rendered above bars */}
        <line
          x1={PL}
          y1={targetY}
          x2={PL + CW}
          y2={targetY}
          className="ytd-target-line"
          strokeDasharray="5 3"
        />

        {/* Target label at the right end of the line */}
        <text
          x={PL + CW + PR - 1}
          y={targetY - 4}
          className="ytd-target-label"
          textAnchor="end"
        >
          {targetPct}%
        </text>
      </svg>

      {/* Legend */}
      <div className="ytd-legend">
        <span className="ytd-legend-item ytd-legend-item--target">
          <span className="ytd-legend-dash" />
          Target
        </span>
        <span className="ytd-legend-item ytd-legend-item--met">
          <span className="ytd-legend-swatch" />
          Met
        </span>
        <span className="ytd-legend-item ytd-legend-item--missed">
          <span className="ytd-legend-swatch" />
          Missed
        </span>
        <span className="ytd-legend-item ytd-legend-item--in-progress">
          <span className="ytd-legend-swatch" />
          In progress
        </span>
      </div>
    </div>
  );
}

export default YtdChart;
