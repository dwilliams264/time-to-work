import { useState, useEffect } from 'react';
import { formatDuration } from '../../utils/timeFormatters';
import { QUICK_GOALS, MAX_GOAL_HOURS, MAX_LUNCH_HOURS } from '../../constants/calendar';
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
  const [hours, setHours] = useState(Math.floor(goalMinutes / 60));
  const [minutes, setMinutes] = useState(goalMinutes % 60);
  const [lunchHours, setLunchHours] = useState(Math.floor(lunchMinutes / 60));
  const [lunchMins, setLunchMins] = useState(lunchMinutes % 60);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync local state with prop changes
  useEffect(() => {
    setHours(Math.floor(goalMinutes / 60));
    setMinutes(goalMinutes % 60);
  }, [goalMinutes]);

  useEffect(() => {
    setLunchHours(Math.floor(lunchMinutes / 60));
    setLunchMins(lunchMinutes % 60);
  }, [lunchMinutes]);

  const handleHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(MAX_GOAL_HOURS, newHours));
    setHours(validHours);
    onGoalChange(validHours * 60 + minutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const validMinutes = Math.max(0, Math.min(59, newMinutes));
    setMinutes(validMinutes);
    onGoalChange(hours * 60 + validMinutes);
  };

  const handleLunchHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(MAX_LUNCH_HOURS, newHours));
    setLunchHours(validHours);
    onLunchMinutesChange(validHours * 60 + lunchMins);
  };

  const handleLunchMinsChange = (newMins: number) => {
    const validMins = Math.max(0, Math.min(59, newMins));
    setLunchMins(validMins);
    onLunchMinutesChange(lunchHours * 60 + validMins);
  };

  const setQuickGoal = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
    onGoalChange(totalMinutes);
  };

  return (
    <div className="goal-setter">
      <div className="goal-setter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Daily Goal: {formatDuration(goalMinutes)}</h3>
        <button className="toggle-button" aria-label={isExpanded ? "Collapse" : "Expand"}>
          {isExpanded ? '−' : '+'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="goal-inputs">
            <div className="input-group">
              <input
                id="hours"
                type="number"
                min="0"
                max={MAX_GOAL_HOURS}
                value={hours}
                onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
                className="time-input"
              />
              <label htmlFor="hours">Hours</label>
            </div>
            <span className="input-separator">:</span>
            <div className="input-group">
              <input
                id="minutes"  
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                className="time-input"
              />
              <label htmlFor="minutes">Mins</label>
            </div>
          </div>
          <div className="quick-goals">
            <button onClick={() => setQuickGoal(QUICK_GOALS.LONG)} aria-label="Set goal to 8.5 hours">
              8.5h
            </button>
            <button onClick={() => setQuickGoal(QUICK_GOALS.MEDIUM)} aria-label="Set goal to 7.5 hours">
              7.5h
            </button>
            <button onClick={() => setQuickGoal(QUICK_GOALS.SHORT)} aria-label="Set goal to 6.5 hours">
              6.5h
            </button>
          </div>

          <div className="lunch-break-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={lunchEnabled}
                onChange={(e) => onLunchEnabledChange(e.target.checked)}
                className="lunch-checkbox"
              />
              <span>Include lunch</span>
            </label>

            {lunchEnabled && (
              <div className="lunch-inputs">
                <div className="input-group small">
                  <input
                    type="number"
                    min="0"
                    max={MAX_LUNCH_HOURS}
                    value={lunchHours}
                    onChange={(e) => handleLunchHoursChange(parseInt(e.target.value) || 0)}
                    className="time-input small"
                  />
                  <label>Hours</label>
                </div>
                <span className="input-separator small">:</span>
                <div className="input-group small">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={lunchMins}
                    onChange={(e) => handleLunchMinsChange(parseInt(e.target.value) || 0)}
                    className="time-input small"
                  />
                  <label>Mins</label>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default GoalSetter;
