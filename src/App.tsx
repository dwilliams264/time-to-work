import { useState } from 'react';
import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

import DayCalendar from './components/DayCalendar';
import GoalSetter from './components/GoalSetter';
import TimeStats from './components/TimeStats';
import type { TimeBlock } from './types';
import { DEFAULT_GOAL_MINUTES, DEFAULT_LUNCH_TIME, TOTAL_HOURS } from './constants/calendar';
import { formatDate } from './utils/timeFormatters';
import { calculateOverlap, hasOverlap } from './utils/timeCalculations';

/**
 * Main application component for the Time to Work daily time tracker
 */
function App() {
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [goalMinutes, setGoalMinutes] = useState(DEFAULT_GOAL_MINUTES);
  const [lunchEnabled, setLunchEnabled] = useState(true);
  const [lunchMinutes, setLunchMinutes] = useState(60);
  const [lunchStartTime, setLunchStartTime] = useState(DEFAULT_LUNCH_TIME);

  const currentDate = formatDate(new Date());
  
  // Calculate total minutes worked, excluding lunch time overlaps
  const totalMinutesWorked = timeBlocks.reduce((sum, block) => {
    let workTime = block.duration;
    
    // If lunch is enabled, subtract any overlap with lunch time
    if (lunchEnabled) {
      const lunchOverlap = calculateOverlap(
        block.startTime,
        block.duration,
        lunchStartTime,
        lunchMinutes
      );
      workTime -= lunchOverlap;
    }
    
    return sum + workTime;
  }, 0);

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

  // Find the nearest valid position for a block, snapping to existing blocks if needed
  const snapBlockToValid = (
    startTime: number, 
    duration: number, 
    excludeId?: string
  ): { startTime: number; duration: number } => {
    let adjustedStart = startTime;
    let adjustedDuration = duration;
    
    // Get all blocks that might conflict (excluding the current one if moving/resizing)
    const conflictingBlocks = timeBlocks
      .filter((block) => block.id !== excludeId)
      .sort((a, b) => a.startTime - b.startTime);
    
    // Check each conflicting block
    for (const block of conflictingBlocks) {
      const blockEnd = block.startTime + block.duration;
      const currentEnd = adjustedStart + adjustedDuration;
      
      // If there's overlap
      if (hasOverlap(adjustedStart, currentEnd, block.startTime, blockEnd)) {
        // Determine which snap point is closer
        const distanceToSnapBefore = Math.abs(currentEnd - block.startTime);
        const distanceToSnapAfter = Math.abs(adjustedStart - blockEnd);
        
        if (distanceToSnapBefore <= distanceToSnapAfter) {
          // Snap the end to the start of the blocking block
          adjustedDuration = Math.max(15, block.startTime - adjustedStart);
        } else {
          // Snap the start to the end of the blocking block
          adjustedStart = blockEnd;
        }
      }
    }
    
    // Ensure we're within calendar bounds
    adjustedStart = Math.max(0, Math.min(adjustedStart, TOTAL_HOURS * 60 - adjustedDuration));
    adjustedDuration = Math.min(adjustedDuration, TOTAL_HOURS * 60 - adjustedStart);
    
    return { startTime: adjustedStart, duration: adjustedDuration };
  };

  const handleClearAll = () => {
    setTimeBlocks([]);
  };

  return (
    <div className="app">
      <SpeedInsights />
      <header className="app-header">
        <h1>Time to Work</h1>
        <p className="current-date">{currentDate}</p>
      </header>

      <div className="app-content">
        <div className="sidebar">
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

        <main className="main-content">
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
            snapBlockToValid={snapBlockToValid}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
