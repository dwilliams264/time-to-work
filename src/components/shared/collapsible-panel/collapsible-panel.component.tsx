import { useState } from 'react';
import type { ReactNode } from 'react';
import './collapsible-panel.css';

interface CollapsiblePanelProps {
  header: ReactNode;
  children: ReactNode;
  className: string;
  headerClassName: string;
  bodyClassName?: string;
  testId?: string;
  headerTestId?: string;
  toggleTestId?: string;
  toggleAriaLabel?: string;
}

function CollapsiblePanel({
  header,
  children,
  className,
  headerClassName,
  bodyClassName,
  testId,
  headerTestId,
  toggleTestId,
  toggleAriaLabel,
}: CollapsiblePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded();
    }
  };

  const body = bodyClassName ? (
    <div className={bodyClassName}>{children}</div>
  ) : (
    <>{children}</>
  );

  return (
    <div className={`${className}${isExpanded ? ' is-expanded' : ''}`} data-testid={testId}>
      <div
        className={headerClassName}
        data-testid={headerTestId}
        onClick={toggleExpanded}
        onKeyDown={handleHeaderKeyDown}
        role="button"
        aria-expanded={isExpanded}
        tabIndex={0}
      >
        {header}
        <button
          className="collapsible-toggle-button"
          data-testid={toggleTestId}
          aria-label={
            isExpanded
              ? `Collapse${toggleAriaLabel ? ` ${toggleAriaLabel}` : ''}`
              : `Expand${toggleAriaLabel ? ` ${toggleAriaLabel}` : ''}`
          }
          aria-hidden="true"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            toggleExpanded();
          }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      {isExpanded && body}
    </div>
  );
}

export default CollapsiblePanel;
