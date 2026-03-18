import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';
import { TimeStatsPage } from '../pageobjects/time-stats.page';
import { CalendarPage } from '../pageobjects/calendar.page';

test.describe('Time Stats and Progress', () => {
    let appPage: AppPage;
    let goalSetterPage: GoalSetterPage;
    let timeStatsPage: TimeStatsPage;
    let calendarPage: CalendarPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        goalSetterPage = new GoalSetterPage(page);
        timeStatsPage = new TimeStatsPage(page);
        calendarPage = new CalendarPage(page);

        await appPage.navigate();
        await appPage.waitForAppToLoad();
    });

    test.describe('Time Worked Display', () => {
        test('should display time worked stat', async () => {
            await expect(timeStatsPage.getTimeWorkedCard()).toBeVisible();
            await expect(timeStatsPage.getTimeWorkedValue()).toBeVisible();
        });

        test('should initially show 0 time worked', async () => {
            const timeWorked = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(timeWorked).toContain('0');
        });

        test('should update time worked when block is added', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const timeWorked = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(timeWorked).not.toContain('0m');
        });

        test('should show correct duration format', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const timeWorked = await timeStatsPage.getTimeWorkedValue().textContent();
            // Should be in format like "1h", "30m", or "1h 30m"
            expect(timeWorked).toMatch(/\d+[hm]/);
        });
    });

    test.describe('Progress Bar', () => {
        test('should display progress bar', async () => {
            await expect(timeStatsPage.getProgressBar()).toBeVisible();
        });

        test('should display progress fill element', async () => {
            // Progress fill exists but may be at 0% width (hidden) when no progress
            await expect(timeStatsPage.getProgressFill()).toBeAttached();
        });

        test('should show progress toward goal', async () => {
            // Set a 2-hour goal
            await goalSetterPage.setGoal(2, 0);

            // Create a 1-hour block
            await calendarPage.createBlockAtPosition(200, 80);

            // Progress bar should be visible
            await expect(timeStatsPage.getProgressBar()).toBeVisible();
        });

        test('should fill progress bar as work is added', async ({ page }) => {
            // Set goal
            await goalSetterPage.setGoal(2, 0);

            // Get initial progress width
            const progressBar = timeStatsPage.getProgressFill();
            const initialWidth = await progressBar.evaluate((el) => {
                return window.getComputedStyle(el).width;
            });

            // Add work
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Progress should increase
            const newWidth = await progressBar.evaluate((el) => {
                return window.getComputedStyle(el).width;
            });

            expect(newWidth).not.toBe(initialWidth);
        });

        test('should turn green when goal is reached', async () => {
            // Set a small goal
            await goalSetterPage.setGoal(0, 30);

            // Create a block that meets the goal
            await calendarPage.createBlockAtPosition(200, 50);

            // Progress fill should have complete class
            const progressFill = timeStatsPage.getProgressFill();
            const className = await progressFill.getAttribute('class');
            expect(className).toContain('complete');
        });
    });

    test.describe('Remaining Time', () => {
        test('should display remaining time when under goal', async () => {
            // Set goal
            await goalSetterPage.setGoal(2, 0);

            // Create partial work
            await calendarPage.createBlockAtPosition(200, 80);

            // Remaining should be visible
            await expect(timeStatsPage.getRemainingCard()).toBeVisible();
        });

        test('should calculate remaining time correctly', async () => {
            // Set 2-hour goal
            await goalSetterPage.setGoal(2, 0);

            // Add 1 hour of work
            await calendarPage.createBlockAtPosition(200, 80);

            const remainingText = await timeStatsPage.getRemainingValue().textContent();
            // Should show approximately 1 hour remaining
            expect(remainingText).toContain('1h');
        });

        test('should not display remaining when goal is met', async () => {
            // Set small goal
            await goalSetterPage.setGoal(0, 30);

            // Meet the goal
            await calendarPage.createBlockAtPosition(200, 50);

            // Remaining should not be visible
            await expect(timeStatsPage.getRemainingCard()).not.toBeVisible();
        });

        test('should update remaining time as work is added', async ({ page }) => {
            // Set goal
            await goalSetterPage.setGoal(3, 0);

            // Add first hour
            await calendarPage.createBlockAtPosition(200, 80);
            const firstRemaining = await timeStatsPage.getRemainingValue().textContent();

            // Add second hour
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);
            const secondRemaining = await timeStatsPage.getRemainingValue().textContent();

            // Remaining should decrease
            expect(secondRemaining).not.toBe(firstRemaining);
        });
    });

    test.describe('Goal Completion', () => {
        test('should show completion message when goal is reached', async () => {
            // Set small goal
            await goalSetterPage.setGoal(0, 30);

            // Meet the goal
            await calendarPage.createBlockAtPosition(200, 50);

            // Completion message should appear
            await expect(timeStatsPage.getCompletionMessage()).toBeVisible();
        });

        test('should display celebration emoji in completion message', async () => {
            // Set and meet goal
            await goalSetterPage.setGoal(0, 30);
            await calendarPage.createBlockAtPosition(200, 50);

            const message = await timeStatsPage.getCompletionMessage().textContent();
            expect(message).toContain('🎉');
        });

        test('should say "Goal achieved" in completion message', async () => {
            // Set and meet goal
            await goalSetterPage.setGoal(0, 30);
            await calendarPage.createBlockAtPosition(200, 50);

            const message = await timeStatsPage.getCompletionMessage().textContent();
            expect(message).toContain('Goal achieved');
        });

        test('should not show completion message when under goal', async () => {
            // Set goal higher than work added
            await goalSetterPage.setGoal(3, 0);
            await calendarPage.createBlockAtPosition(200, 80);

            await expect(timeStatsPage.getCompletionMessage()).not.toBeVisible();
        });
    });

    test.describe('Over Goal', () => {
        test('should show over goal stat when exceeding target', async () => {
            // Set small goal
            await goalSetterPage.setGoal(0, 30);

            // Exceed the goal
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            // Over goal should be visible
            await expect(timeStatsPage.getOverGoalCard()).toBeVisible();
        });

        test('should display positive over goal value', async () => {
            // Set and exceed goal
            await goalSetterPage.setGoal(1, 0);
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            const overGoalText = await timeStatsPage.getOverGoalValue().textContent();
            expect(overGoalText).toContain('+');
        });

        test('should not show over goal when under target', async () => {
            // Set high goal
            await goalSetterPage.setGoal(5, 0);
            await calendarPage.createBlockAtPosition(200, 80);

            await expect(timeStatsPage.getOverGoalCard()).not.toBeVisible();
        });
    });

    test.describe('Lunch Break Impact', () => {
        test('should show goal breakdown when lunch is enabled', async () => {
            await goalSetterPage.enableLunch();

            await expect(timeStatsPage.getGoalBreakdown()).toBeVisible();
        });

        test('should display work goal in breakdown', async () => {
            await goalSetterPage.enableLunch();

            const breakdown = await timeStatsPage.getGoalBreakdown().textContent();
            expect(breakdown).toContain('Work Goal');
        });

        test('should display lunch duration in breakdown', async () => {
            await goalSetterPage.enableLunch();

            const breakdown = await timeStatsPage.getGoalBreakdown().textContent();
            expect(breakdown).toContain('Lunch');
        });

        test('should display total time at work in breakdown', async () => {
            await goalSetterPage.enableLunch();

            const breakdown = await timeStatsPage.getGoalBreakdown().textContent();
            expect(breakdown).toContain('Total');
        });

        test('should not show breakdown when lunch is disabled', async () => {
            await goalSetterPage.disableLunch();

            await expect(timeStatsPage.getGoalBreakdown()).not.toBeVisible();
        });
    });

    test.describe('Stats Persistence', () => {
        test('should persist stats after page reload', async ({ page }) => {
            // Create work and check stats
            await calendarPage.createBlockAtPosition(200, 80);
            const initialStats = await timeStatsPage.getTimeWorkedValue().textContent();

            // Reload
            await page.reload();
            await appPage.waitForAppToLoad();

            // Stats should be the same
            const afterReload = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(afterReload).toBe(initialStats);
        });

        test('should persist goal completion after reload', async ({ page }) => {
            // Set and meet goal
            await goalSetterPage.setGoal(0, 30);
            await calendarPage.createBlockAtPosition(200, 50);
            await expect(timeStatsPage.getCompletionMessage()).toBeVisible();

            // Reload
            await page.reload();
            await appPage.waitForAppToLoad();

            // Completion message should still show
            await expect(timeStatsPage.getCompletionMessage()).toBeVisible();
        });
    });

    test.describe('Real-time Updates', () => {
        test('should update stats immediately when block is added', async () => {
            const initialValue = await timeStatsPage.getTimeWorkedValue().textContent();

            await calendarPage.createBlockAtPosition(200, 80);

            // Stats should update without manual refresh
            const newValue = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(newValue).not.toBe(initialValue);
        });

        test('should update stats immediately when block is deleted', async () => {
            await calendarPage.createBlockAtPosition(200, 80);
            const withBlock = await timeStatsPage.getTimeWorkedValue().textContent();

            await calendarPage.deleteFirstBlock();

            // Stats should update immediately
            const afterDelete = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(afterDelete).not.toBe(withBlock);
        });

        test('should update progress bar in real-time', async ({ page }) => {
            await goalSetterPage.setGoal(2, 0);

            // Create first block
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Progress should be visible and filling
            await expect(timeStatsPage.getProgressBar()).toBeVisible();
            const progressFill = timeStatsPage.getProgressFill();
            const width = await progressFill.evaluate((el) => el.style.width);
            expect(width).toBeTruthy();
        });
    });
});
