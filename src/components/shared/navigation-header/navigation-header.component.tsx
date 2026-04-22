interface NavigationHeaderProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  testId?: string;
  prevTestId?: string;
  nextTestId?: string;
  labelTestId?: string;
  prevAriaLabel?: string;
  nextAriaLabel?: string;
}

function NavigationHeader({
  label,
  onPrev,
  onNext,
  canGoBack = true,
  canGoForward = true,
  testId,
  prevTestId,
  nextTestId,
  labelTestId,
  prevAriaLabel = 'Previous',
  nextAriaLabel = 'Next',
}: NavigationHeaderProps) {
  return (
    <div className="date-navigation" data-testid={testId}>
      <button
        className="nav-button"
        onClick={onPrev}
        disabled={!canGoBack}
        aria-label={prevAriaLabel}
        data-testid={prevTestId}
      >
        ←
      </button>
      <p className="current-date" data-testid={labelTestId}>
        {label}
      </p>
      <button
        className="nav-button"
        onClick={onNext}
        disabled={!canGoForward}
        aria-label={nextAriaLabel}
        data-testid={nextTestId}
      >
        →
      </button>
    </div>
  );
}

export default NavigationHeader;
