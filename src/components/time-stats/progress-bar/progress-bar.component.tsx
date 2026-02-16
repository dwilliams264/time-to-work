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
    <div className="progress-bar">
      <div
        className={`progress-fill ${isComplete ? 'complete' : ''}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}

export default ProgressBar;
