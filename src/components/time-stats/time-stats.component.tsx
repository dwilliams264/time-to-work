import { formatDuration } from '../../utils/timeFormatters';
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
      <div className="stat-card">
        <h3>Time Worked</h3>
        <div className="stat-value primary">{formatDuration(totalMinutes)}</div>
      </div>

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

      <div className="progress-bar">
        <div
          className={`progress-fill ${isComplete ? 'complete' : ''}`}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {!isComplete && (
        <div className="stat-card">
          <h3>Remaining</h3>
          <div className="stat-value secondary">{formatDuration(remainingMinutes)}</div>
        </div>
      )}

      {isOverGoal && (
        <div className="stat-card">
          <h3>Over Goal</h3>
          <div className="stat-value success">+{formatDuration(-remainingMinutes)}</div>
        </div>
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
