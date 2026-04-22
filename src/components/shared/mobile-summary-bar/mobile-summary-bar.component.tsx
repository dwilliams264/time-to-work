import type { ReactNode } from 'react';
import ProgressBar from '../../time-stats/progress-bar/progress-bar.component';
import './mobile-summary-bar.css';

interface MobileSummaryBarProps {
  title: string;
  value: string;
  progressPercentage: number;
  isComplete: boolean;
  badge: ReactNode;
  testId?: string;
}

function MobileSummaryBar({ title, value, progressPercentage, isComplete, badge, testId }: MobileSummaryBarProps) {
  return (
    <div className="mobile-summary-bar" data-testid={testId}>
      <span className="mobile-summary-label">{title}</span>
      <span className="mobile-summary-value">{value}</span>
      <ProgressBar percentage={progressPercentage} isComplete={isComplete} />
      {badge}
    </div>
  );
}

export default MobileSummaryBar;
