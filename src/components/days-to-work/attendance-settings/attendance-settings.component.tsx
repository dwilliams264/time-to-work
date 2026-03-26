import { useState } from 'react';
import type { AttendanceSettings } from '../../../types/attendance';
import './attendance-settings.css';

interface AttendanceSettingsProps {
  settings: AttendanceSettings;
  onSettingsChange: (settings: AttendanceSettings) => void;
}

function AttendanceSettingsPanel({ settings, onSettingsChange }: AttendanceSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalDaysOptions: Array<3 | 4 | 5> = [3, 4, 5];
  const officeOptions = Array.from({ length: settings.daysWorkedPerWeek }, (_, i) => i + 1);
  const targetPct = Math.round((settings.daysInOffice / settings.daysWorkedPerWeek) * 100);

  function handleTotalDaysChange(days: 3 | 4 | 5) {
    const clampedOffice = Math.min(settings.daysInOffice, days);
    onSettingsChange({ ...settings, daysWorkedPerWeek: days, daysInOffice: clampedOffice });
  }

  function handleOfficeDaysChange(days: number) {
    onSettingsChange({ ...settings, daysInOffice: days });
  }

  return (
    <div className={`attendance-settings${isExpanded ? ' is-expanded' : ''}`} data-testid="attendance-settings-container">
      <div
        className="attendance-settings-header"
        data-testid="attendance-settings-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="settings-header-text">
          <h3>Work Schedule</h3>
          <span className="settings-header-summary">
            {settings.daysInOffice} of {settings.daysWorkedPerWeek} days in office &mdash; {targetPct}% target
          </span>
        </div>
        <button
          className="toggle-button"
          data-testid="attendance-settings-toggle"
          aria-label={isExpanded ? 'Collapse settings' : 'Expand settings'}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '-' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="attendance-settings-body" data-testid="attendance-settings-body">
          <div className="settings-row">
            <p className="settings-label">Days worked per week</p>
            <div className="days-selector" data-testid="days-per-week-selector">
              {totalDaysOptions.map((days) => (
                <button
                  key={days}
                  className={`days-button${settings.daysWorkedPerWeek === days ? ' active' : ''}`}
                  data-testid={`days-button-${days}`}
                  onClick={() => handleTotalDaysChange(days)}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          <div className="settings-divider" />

          <div className="settings-row">
            <p className="settings-label">
              Office days per week
              <span className="settings-label-hint">Sets your attendance target</span>
            </p>
            <div className="days-selector" data-testid="office-days-selector">
              {officeOptions.map((days) => (
                <button
                  key={days}
                  className={`days-button${settings.daysInOffice === days ? ' active' : ''}`}
                  data-testid={`office-days-button-${days}`}
                  onClick={() => handleOfficeDaysChange(days)}
                >
                  {days}
                </button>
              ))}
            </div>
          </div>

          <p className="settings-target-note" data-testid="settings-target-note">
            Target: <strong>{settings.daysInOffice}/{settings.daysWorkedPerWeek} days = {targetPct}%</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default AttendanceSettingsPanel;
