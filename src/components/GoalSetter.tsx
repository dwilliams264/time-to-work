import { useState, useEffect } from 'react';
import './GoalSetter.css';

interface GoalSetterProps {
  goalMinutes: number;
  onGoalChange: (minutes: number) => void;
}

/**
 * Component for setting daily work hour goals
 * Allows input via hours/minutes fields or quick preset buttons
 */
function GoalSetter({ goalMinutes, onGoalChange }: GoalSetterProps) {
  const [hours, setHours] = useState(Math.floor(goalMinutes / 60));
  const [minutes, setMinutes] = useState(goalMinutes % 60);

  // Sync local state with prop changes
  useEffect(() => {
    setHours(Math.floor(goalMinutes / 60));
    setMinutes(goalMinutes % 60);
  }, [goalMinutes]);

  const handleHoursChange = (newHours: number) => {
    const validHours = Math.max(0, Math.min(24, newHours));
    setHours(validHours);
    onGoalChange(validHours * 60 + minutes);
  };

  const handleMinutesChange = (newMinutes: number) => {
    const validMinutes = Math.max(0, Math.min(59, newMinutes));
    setMinutes(validMinutes);
    onGoalChange(hours * 60 + validMinutes);
  };

  const setQuickGoal = (totalMinutes: number) => {
    setHours(Math.floor(totalMinutes / 60));
    setMinutes(totalMinutes % 60);
    onGoalChange(totalMinutes);
  };

  return (
    <div className="goal-setter">
      <h3>Daily Goal</h3>
      <div className="goal-inputs">
        <div className="input-group">
          <input
            id="hours"
            type="number"
            min="0"
            max="24"
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
        <button onClick={() => setQuickGoal(510)} aria-label="Set goal to 8.5 hours">
          8.5h
        </button>
        <button onClick={() => setQuickGoal(450)} aria-label="Set goal to 7.5 hours">
          7.5h
        </button>
        <button onClick={() => setQuickGoal(390)} aria-label="Set goal to 6.5 hours">
          6.5h
        </button>
      </div>
    </div>
  );
}

export default GoalSetter;
