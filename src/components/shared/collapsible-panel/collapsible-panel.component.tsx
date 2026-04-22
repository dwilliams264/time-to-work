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
        onClick={() => setIsExpanded(!isExpanded)}
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
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
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
