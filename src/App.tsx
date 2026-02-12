import { useState, useEffect } from 'react';
import './App.css';
import { SpeedInsights } from '@vercel/speed-insights/react';

import DayCalendar from './components/DayCalendar';
import GoalSetter from './components/GoalSetter';
import TimeStats from './components/TimeStats';
import type { TimeBlock } from './types';
import { DEFAULT_GOAL_MINUTES, DEFAULT_LUNCH_TIME, TOTAL_HOURS } from './constants/calendar';
import { formatDate } from './utils/timeFormatters';
import { calculateOverlap, hasOverlap } from './utils/timeCalculations';

interface DayData {
  timeBlocks: TimeBlock[];
  goalMinutes: number;
  lunchEnabled: boolean;
  lunchMinutes: number;
  lunchStartTime: number;
}

/**
 * Main application component for the Time to Work daily time tracker
 */
function App() {
  const currentDate = formatDate(new Date());
  const today = new Date();
  const storageKey = `timeToWork_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Initialize state from localStorage
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data: DayData = JSON.parse(savedData);
        return data.timeBlocks || [];
      }
    } catch (error) {
      console.error('Failed to load time blocks from localStorage:', error);
    }
    return [];
  });

  const [goalMinutes, setGoalMinutes] = useState(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data: DayData = JSON.parse(savedData);
        return data.goalMinutes ?? DEFAULT_GOAL_MINUTES;
      }
    } catch (error) {
      console.error('Failed to load goal minutes from localStorage:', error);
    }
    return DEFAULT_GOAL_MINUTES;
  });

  const [lunchEnabled, setLunchEnabled] = useState(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data: DayData = JSON.parse(savedData);
        return data.lunchEnabled ?? true;
      }
    } catch (error) {
      console.error('Failed to load lunch enabled from localStorage:', error);
    }
    return true;
  });

  const [lunchMinutes, setLunchMinutes] = useState(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data: DayData = JSON.parse(savedData);
        return data.lunchMinutes ?? 60;
      }
    } catch (error) {
      console.error('Failed to load lunch minutes from localStorage:', error);
    }
    return 60;
  });

  const [lunchStartTime, setLunchStartTime] = useState(() => {
    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const data: DayData = JSON.parse(savedData);
        return data.lunchStartTime ?? DEFAULT_LUNCH_TIME;
      }
    } catch (error) {
      console.error('Failed to load lunch start time from localStorage:', error);
    }
    return DEFAULT_LUNCH_TIME;
  });

  // Save data to localStorage whenever state changes
  useEffect(() => {
    try {
      const data: DayData = {
        timeBlocks,
        goalMinutes,
        lunchEnabled,
        lunchMinutes,
        lunchStartTime,
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save data to localStorage:', error);
    }
  }, [storageKey, timeBlocks, goalMinutes, lunchEnabled, lunchMinutes, lunchStartTime]);

  // Clean up old data (older than 7 days)
  useEffect(() => {
    try {
      const keys = Object.keys(localStorage);
      const timeToWorkKeys = keys.filter(key => key.startsWith('timeToWork_'));
      const today = new Date();
      
      timeToWorkKeys.forEach(key => {
        const dateStr = key.replace('timeToWork_', '');
        const itemDate = new Date(dateStr);
        const daysDiff = Math.floor((today.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 7) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Failed to clean up old localStorage data:', error);
    }
  }, [currentDate]);
  
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
