import { useState } from 'react';
import { formatDuration } from '../../utils/timeFormatters';
import { QUICK_GOALS, MAX_GOAL_HOURS, MAX_LUNCH_HOURS } from '../../constants/calendar';
import TimeInputGroup from './time-input-group/time-input-group.component';
import './goal-setter.css';

interface GoalSetterProps {
  goalMinutes: number;
  onGoalChange: (minutes: number) => void;
  lunchEnabled: boolean;
  lunchMinutes: number;
  onLunchEnabledChange: (enabled: boolean) => void;
  onLunchMinutesChange: (minutes: number) => void;
}

/**
 * Component for setting daily work hour goals
 * Allows input via hours/minutes fields or quick preset buttons
 */
function GoalSetter({ 
  goalMinutes, 
  onGoalChange,
  lunchEnabled,
  lunchMinutes,
  onLunchEnabledChange,
  onLunchMinutesChange
}: GoalSetterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hours = Math.floor(goalMinutes / 60);
  const minutes = goalMinutes % 60;
  const lunchHours = Math.floor(lunchMinutes / 60);
  const lunchMins = lunchMinutes % 60;

  const handleHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(MAX_GOAL_HOURS, newHours));
    onGoalChange(validHours * 60 + minutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const validMinutes = Math.max(0, Math.min(59, newMinutes));
    onGoalChange(hours * 60 + validMinutes);
  };

  const handleLunchHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(MAX_LUNCH_HOURS, newHours));
    onLunchMinutesChange(validHours * 60 + lunchMins);
  };

  const handleLunchMinsChange = (newMins: number) => {
    const validMins = Math.max(0, Math.min(59, newMins));
    onLunchMinutesChange(lunchHours * 60 + validMins);
  };

  const setQuickGoal = (totalMinutes: number) => {
    onGoalChange(totalMinutes);
  };

  return (
    <div className={`goal-setter${isExpanded ? ' is-expanded' : ''}`} data-testid="goal-setter-container">
      <div className="goal-setter-header" data-testid="goal-setter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Daily Goal: {formatDuration(goalMinutes)}</h3>
        <button className="toggle-button" data-testid="goal-setter-toggle" aria-label={isExpanded ? "Collapse" : "Expand"} onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="goal-inputs" data-testid="goal-setter-inputs">
            <TimeInputGroup
              hours={hours}
              minutes={minutes}
              onHoursChange={handleHoursChange}
              onMinutesChange={handleMinutesChange}
              maxHours={MAX_GOAL_HOURS}
              hoursId="hours"
              minutesId="minutes"
            />
          </div>
          <div className="quick-goals">
            <button onClick={() => setQuickGoal(QUICK_GOALS.LONG)} data-testid="goal-setter-quick-long" aria-label="Set goal to 8.5 hours">
              8.5h
            </button>
            <button onClick={() => setQuickGoal(QUICK_GOALS.MEDIUM)} data-testid="goal-setter-quick-medium" aria-label="Set goal to 7.5 hours">
              7.5h
            </button>
            <button onClick={() => setQuickGoal(QUICK_GOALS.SHORT)} data-testid="goal-setter-quick-short" aria-label="Set goal to 6.5 hours">
              6.5h
            </button>
          </div>

          <div className="lunch-break-section" data-testid="goal-setter-lunch-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={lunchEnabled}
                onChange={(e) => onLunchEnabledChange(e.target.checked)}
                className="lunch-checkbox"
                data-testid="goal-setter-lunch-checkbox"
              />
              <span>Include lunch</span>
            </label>

            {lunchEnabled && (
              <div className="lunch-inputs" data-testid="goal-setter-lunch-inputs">
                <TimeInputGroup
                  hours={lunchHours}
                  minutes={lunchMins}
                  onHoursChange={handleLunchHoursChange}
                  onMinutesChange={handleLunchMinsChange}
                  maxHours={MAX_LUNCH_HOURS}
                  size="small"
                  hoursId="lunch-hours"
                  minutesId="lunch-minutes"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GoalSetter;
