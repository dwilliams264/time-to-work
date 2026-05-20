import type { AttendanceSettings } from '../../../types/attendance';
import CollapsiblePanel from '../../shared/collapsible-panel/collapsible-panel.component';
import DaysSelector from './days-selector.component';
import './attendance-settings.css';

interface AttendanceSettingsProps {
  settings: AttendanceSettings;
  onSettingsChange: (settings: AttendanceSettings) => void;
}

function AttendanceSettingsPanel({ settings, onSettingsChange }: AttendanceSettingsProps) {
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
    <CollapsiblePanel
      className="attendance-settings"
      headerClassName="attendance-settings-header"
      bodyClassName="attendance-settings-body"
      testId="attendance-settings-container"
      headerTestId="attendance-settings-header"
      toggleTestId="attendance-settings-toggle"
      toggleAriaLabel="settings"
      header={
        <div className="settings-header-text">
          <h3>Work Schedule</h3>
          <span className="settings-header-summary">
            {settings.daysInOffice} of {settings.daysWorkedPerWeek} days in office &mdash; {targetPct}% target
          </span>
        </div>
      }
    >
      <div className="settings-row">
        <p className="settings-label">Days worked per week</p>
        <DaysSelector
          options={totalDaysOptions}
          value={settings.daysWorkedPerWeek}
          onChange={(days) => handleTotalDaysChange(days as 3 | 4 | 5)}
          testId="days-per-week-selector"
          buttonTestIdPrefix="days-button"
        />
      </div>

      <div className="settings-divider" />

      <div className="settings-row">
        <p className="settings-label">
          Office days per week
          <span className="settings-label-hint">Sets your attendance target</span>
        </p>
        <DaysSelector
          options={officeOptions}
          value={settings.daysInOffice}
          onChange={handleOfficeDaysChange}
          testId="office-days-selector"
          buttonTestIdPrefix="office-days-button"
        />
      </div>

      <p className="settings-target-note" data-testid="settings-target-note">
        Target: <strong>{settings.daysInOffice}/{settings.daysWorkedPerWeek} days = {targetPct}%</strong>
      </p>
    </CollapsiblePanel>
  );
}

export default AttendanceSettingsPanel;
