import { useState } from 'react';
import DayCalendar from '../../components/time-to-work/day-calendar/day-calendar.component';
import GoalSetter from '../../components/time-to-work/goal-setter/goal-setter.component';
import TimeStats from '../../components/time-to-work/time-stats/time-stats.component';
import NavigationHeader from '../../components/shared/navigation-header/navigation-header.component';
import type { TimeBlock } from '../../types';
import { formatDate } from '../../utils/timeFormatters';
import { snapBlockToValid, calculateTotalWorkTime } from '../../utils/blockOperations';
import { StorageService } from '../../utils/storage';
import { useDayData, useStorageCleanup } from '../../hooks/usePersistedState';

function TimeToWork() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const currentDate = formatDate(selectedDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDateNormalized = new Date(selectedDate);
  selectedDateNormalized.setHours(0, 0, 0, 0);

  const isToday = selectedDateNormalized.getTime() === today.getTime();

  const storageKey = StorageService.generateKey(selectedDate);

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

  useStorageCleanup(currentDate);

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

  const handleSnapBlockToValid = (startTime: number, duration: number, excludeId?: string) => {
    return snapBlockToValid(startTime, duration, timeBlocks, excludeId);
  };

  const handleClearAll = () => {
    setTimeBlocks([]);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    newDate.setHours(0, 0, 0, 0);
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  return (
    <>
      <NavigationHeader
        label={currentDate}
        onPrev={goToPreviousDay}
        onNext={goToNextDay}
        canGoForward={!isToday}
        testId="date-navigation"
        prevTestId="previous-day-button"
        nextTestId="next-day-button"
        labelTestId="app-current-date"
        prevAriaLabel="Previous day"
        nextAriaLabel="Next day"
      />

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
            isToday={isToday}
          />
        </main>
      </div>
    </>
  );
}

export default TimeToWork;
