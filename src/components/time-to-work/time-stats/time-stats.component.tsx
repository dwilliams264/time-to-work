import { formatDuration } from '../../../utils/timeFormatters';
import { useIsMobile } from '../../../hooks/useIsMobile';
import StatCard from '../../shared/stat-card/stat-card.component';
import ProgressBar from '../../shared/progress-bar/progress-bar.component';
import MobileSummaryBar from '../../shared/mobile-summary-bar/mobile-summary-bar.component';
import TargetBadge from '../../shared/target-badge/target-badge.component';
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
  const isMobile = useIsMobile();
  
  // Total time at work (for display purposes when lunch is enabled)
  const totalTimeAtWork = lunchEnabled ? goalMinutes + lunchMinutes : goalMinutes;

  return (
    <>
    {!isMobile && (
    <div className="time-stats" data-testid="time-stats-container">
      <StatCard title="Time Worked" value={formatDuration(totalMinutes)} variant="primary" testId="time-stats-time-worked" />

      {lunchEnabled && (
        <div className="goal-breakdown" data-testid="time-stats-goal-breakdown">
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
        <StatCard title="Remaining" value={formatDuration(remainingMinutes)} variant="secondary" testId="time-stats-remaining" />
      )}

      {isOverGoal && (
        <StatCard title="Over Goal" value={`+${formatDuration(-remainingMinutes)}`} variant="success" testId="time-stats-over-goal" />
      )}

      {isComplete && (
        <div className="completion-message" data-testid="time-stats-completion-message" role="status" aria-live="polite">
          🎉 Goal achieved!
        </div>
      )}
    </div>
    )}

    {isMobile && (
    <MobileSummaryBar
      title="Time Worked"
      value={formatDuration(totalMinutes)}
      progressPercentage={progressPercentage}
      isComplete={isComplete}
      testId="time-stats-mobile-bar"
      badge={
        isComplete ? (
          <TargetBadge met={true} ariaLive="polite" testId="time-stats-completion-message">
            ✓ Goal met
          </TargetBadge>
        ) : (
          <TargetBadge met={isOverGoal} testId="time-stats-remaining">
            {isOverGoal
              ? `+${formatDuration(-remainingMinutes)} over`
              : `−${formatDuration(remainingMinutes)} left`}
          </TargetBadge>
        )
      }
    />
    )}
  </>
  );
}

export default TimeStats;
