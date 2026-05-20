interface DaysSelectorProps {
  options: number[];
  value: number;
  onChange: (days: number) => void;
  testId?: string;
  buttonTestIdPrefix?: string;
}

function DaysSelector({ options, value, onChange, testId, buttonTestIdPrefix }: DaysSelectorProps) {
  return (
    <div className="days-selector" data-testid={testId}>
      {options.map((days) => (
        <button
          key={days}
          className={`days-button${value === days ? ' active' : ''}`}
          data-testid={buttonTestIdPrefix ? `${buttonTestIdPrefix}-${days}` : undefined}
          onClick={() => onChange(days)}
        >
          {days}
        </button>
      ))}
    </div>
  );
}

export default DaysSelector;
