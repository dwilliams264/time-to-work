import type { ReactNode } from 'react';
import './target-badge.css';

interface TargetBadgeProps {
  met: boolean;
  children: ReactNode;
  testId?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
}

function TargetBadge({ met, children, testId, ariaLive }: TargetBadgeProps) {
  return (
    <div
      className={`target-badge${met ? ' met' : ' not-met'}`}
      data-testid={testId}
      role="status"
      aria-live={ariaLive}
    >
      {children}
    </div>
  );
}

export default TargetBadge;
