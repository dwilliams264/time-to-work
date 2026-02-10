import { useState } from 'react';
import './App.css';
import DayCalendar from './components/DayCalendar';
import GoalSetter from './components/GoalSetter';
import TimeStats from './components/TimeStats';
import type { TimeBlock } from './types';
import { DEFAULT_GOAL_MINUTES } from './constants/calendar';
import { formatDate } from './utils/timeFormatters';

/**
 * Main application component for the Time to Work daily time tracker
 */
function App() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [goalMinutes, setGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);

  const currentDate = formatDate(new Date());
  const totalMinutesWorked = timeBlocks.reduce((sum, block) => sum + block.duration, 0);

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

  const handleClearAll = () => {
    setTimeBlocks([]);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Time to Work</h1>
        <p className="current-date">{currentDate}</p>
      </header>

      <div className="app-content">
        <div className="sidebar">
          <GoalSetter goalMinutes={goalMinutes} onGoalChange={setGoalMinutes} />
          <TimeStats
            totalMinutes={totalMinutesWorked}
            goalMinutes={goalMinutes}
          />
        </div>

        <main className="main-content">
          <DayCalendar
            timeBlocks={timeBlocks}
            onAddBlock={handleAddBlock}
            onRemoveBlock={handleRemoveBlock}
            onUpdateBlock={handleUpdateBlock}
            onClearAll={handleClearAll}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
