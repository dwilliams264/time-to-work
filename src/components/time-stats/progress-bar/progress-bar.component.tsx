import './progress-bar.css';

interface ProgressBarProps {
  percentage: number;
  isComplete: boolean;
}

/**
 * Progress bar component showing completion percentage
 */
function ProgressBar({ percentage, isComplete }: ProgressBarProps) {
  return (
    <div className="progress-bar" data-testid="time-stats-progress-bar">
      <div
        className={`progress-fill ${isComplete ? 'complete' : ''}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        data-testid="time-stats-progress-fill"
      />
    </div>
  );
}

export default ProgressBar;
