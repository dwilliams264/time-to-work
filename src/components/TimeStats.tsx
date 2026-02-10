import { formatDuration } from '../utils/timeFormatters';
import './TimeStats.css';

interface TimeStatsProps {
  totalMinutes: number;
  goalMinutes: number;
}

/**
 * Component displaying time worked statistics and progress towards daily goal
 */
function TimeStats({ totalMinutes, goalMinutes }: TimeStatsProps) {
  const remainingMinutes = goalMinutes - totalMinutes;
  const progressPercentage = Math.min(100, (totalMinutes / goalMinutes) * 100);
  const isComplete = totalMinutes >= goalMinutes;
  const isOverGoal = totalMinutes > goalMinutes;

  return (
    <div className="time-stats">
      <div className="stat-card">
        <h3>Time Worked</h3>
        <div className="stat-value primary">{formatDuration(totalMinutes)}</div>
      </div>

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
