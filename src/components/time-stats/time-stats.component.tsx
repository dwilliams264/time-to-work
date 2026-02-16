import { formatDuration } from '../../utils/timeFormatters';
import StatCard from './stat-card/stat-card.component';
import ProgressBar from './progress-bar/progress-bar.component';
import './time-stats.css';

interface TimeStatsProps {
  totalMinutes: number;
  goalMinutes: number;
  lunchEnabled: boolean;
  lunchMinutes: number;
}

/**
 * Component displaying time worked statistics and progress towards daily goal
 */
function TimeStats({ totalMinutes, goalMinutes, lunchEnabled, lunchMinutes }: TimeStatsProps) {
  // Calculate remaining work time based on work goal (not including lunch)
  const remainingMinutes = goalMinutes - totalMinutes;
  const progressPercentage = Math.min(100, (totalMinutes / goalMinutes) * 100);
  const isComplete = totalMinutes >= goalMinutes;
  const isOverGoal = totalMinutes > goalMinutes;
  
  // Total time at work (for display purposes when lunch is enabled)
  const totalTimeAtWork = lunchEnabled ? goalMinutes + lunchMinutes : goalMinutes;

  return (
    <div className="time-stats">
      <StatCard title="Time Worked" value={formatDuration(totalMinutes)} variant="primary" />

      {lunchEnabled && (
        <div className="goal-breakdown">
          <div className="breakdown-item">
            <span className="breakdown-label">Work Goal:</span>
            <span className="breakdown-value">{formatDuration(goalMinutes)}</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-label">Lunch:</span>
            <span className="breakdown-value">{formatDuration(lunchMinutes)}</span>
          </div>
          <div className="breakdown-item total">
            <span className="breakdown-label">Total:</span>
            <span className="breakdown-value">{formatDuration(totalTimeAtWork)}</span>
          </div>
        </div>
      )}

      <ProgressBar percentage={progressPercentage} isComplete={isComplete} />

      {!isComplete && (
        <StatCard title="Remaining" value={formatDuration(remainingMinutes)} variant="secondary" />
      )}

      {isOverGoal && (
        <StatCard title="Over Goal" value={`+${formatDuration(-remainingMinutes)}`} variant="success" />
      )}

      {isComplete && (
        <div className="completion-message" role="status" aria-live="polite">
          🎉 Goal achieved!
        </div>
      )}
    </div>
  );
}

export default TimeStats;
