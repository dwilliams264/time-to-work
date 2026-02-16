import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

import DayCalendar from './components/day-calendar/day-calendar.component';
import GoalSetter from './components/goal-setter/goal-setter.component';
import TimeStats from './components/time-stats/time-stats.component';
import type { TimeBlock } from './types';
import { formatDate } from './utils/timeFormatters';
import { snapBlockToValid, calculateTotalWorkTime } from './utils/blockOperations';
import { StorageService } from './utils/storage';
import { useDayData, useStorageCleanup } from './hooks/usePersistedState';

/**
 * Main application component for the Time to Work daily time tracker
 */
function App() {
  const currentDate = formatDate(new Date());
  const today = new Date();
  const storageKey = StorageService.generateKey(today);

  // Use custom hook for persisted state
  const {
    timeBlocks,
    setTimeBlocks,
    goalMinutes,
    setGoalMinutes,
    lunchEnabled,
    setLunchEnabled,
    lunchMinutes,
    setLunchMinutes,
    lunchStartTime,
    setLunchStartTime,
  } = useDayData(storageKey);

  // Clean up old data
  useStorageCleanup(currentDate);

  // Calculate total minutes worked, excluding lunch time overlaps
  const totalMinutesWorked = calculateTotalWorkTime(
    timeBlocks,
    lunchEnabled,
    lunchStartTime,
    lunchMinutes
  );

  const handleAddBlock = (startTime: number, duration: number) => {
    const newBlock: TimeBlock = {
      id: crypto.randomUUID(),
      startTime,
      duration,
    };
    setTimeBlocks((prev) => [...prev, newBlock]);
  };

  const handleRemoveBlock = (id: string) => {
    setTimeBlocks((prev) => prev.filter((block) => block.id !== id));
  };

  const handleUpdateBlock = (id: string, startTime: number, duration: number) => {
    setTimeBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, startTime, duration } : block))
    );
  };

  const handleSnapBlockToValid = (
    startTime: number,
    duration: number,
    excludeId?: string
  ) => {
    return snapBlockToValid(startTime, duration, timeBlocks, excludeId);
  };

  const handleClearAll = () => {
    setTimeBlocks([]);
  };

  return (
    <div className="app" data-testid="app-container">
      <SpeedInsights />
      <header className="app-header" data-testid="app-header">
        <h1 data-testid="app-header-title">Time to Work</h1>
        <p className="current-date" data-testid="app-current-date">{currentDate}</p>
      </header>

      <div className="app-content">
        <div className="sidebar" data-testid="app-sidebar">
          <GoalSetter 
            goalMinutes={goalMinutes} 
            onGoalChange={setGoalMinutes}
            lunchEnabled={lunchEnabled}
            lunchMinutes={lunchMinutes}
            onLunchEnabledChange={setLunchEnabled}
            onLunchMinutesChange={setLunchMinutes}
          />
          <TimeStats
            totalMinutes={totalMinutesWorked}
            goalMinutes={goalMinutes}
            lunchEnabled={lunchEnabled}
            lunchMinutes={lunchMinutes}
          />
        </div>

        <main className="main-content" data-testid="app-main-content">
          <DayCalendar
            timeBlocks={timeBlocks}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onUpdateBlock={handleUpdateBlock}
            onClearAll={handleClearAll}
            lunchEnabled={lunchEnabled}
            lunchStartTime={lunchStartTime}
            lunchDuration={lunchMinutes}
            onLunchTimeChange={setLunchStartTime}
            snapBlockToValid={handleSnapBlockToValid}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
