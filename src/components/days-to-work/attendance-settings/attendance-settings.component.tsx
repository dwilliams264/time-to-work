import { useState } from 'react';
import type { AttendanceSettings } from '../../../types/attendance';
import { AUTO_TARGET_MAP } from '../../../constants/attendance';
import './attendance-settings.css';

interface AttendanceSettingsProps {
  settings: AttendanceSettings;
  onSettingsChange: (settings: AttendanceSettings) => void;
}

function AttendanceSettingsPanel({ settings, onSettingsChange }: AttendanceSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const targetPct = AUTO_TARGET_MAP[settings.daysWorkedPerWeek];

  const daysOptions: Array<3 | 4 | 5> = [3, 4, 5];

  return (
    <div className="attendance-settings" data-testid="attendance-settings-container">
      <div
        className="attendance-settings-header"
        data-testid="attendance-settings-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>
          Attendance Target: {targetPct}% ({Math.round((targetPct / 100) * settings.daysWorkedPerWeek)} of{' '}
          {settings.daysWorkedPerWeek} days)
        </h3>
        <button
          className="toggle-button"
          data-testid="attendance-settings-toggle"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="attendance-settings-body" data-testid="attendance-settings-body">
          <p className="settings-label">Days worked per week:</p>
          <div className="days-selector" data-testid="days-per-week-selector">
            {daysOptions.map((days) => (
              <button
                key={days}
                className={`days-button${settings.daysWorkedPerWeek === days ? ' active' : ''}`}
                data-testid={`days-button-${days}`}
                onClick={() =>
                  onSettingsChange({ ...settings, daysWorkedPerWeek: days })
                }
              >
                {days} days
              </button>
            ))}
          </div>
          <p className="settings-target-note" data-testid="settings-target-note">
            Auto target: <strong>{AUTO_TARGET_MAP[settings.daysWorkedPerWeek]}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default AttendanceSettingsPanel;
