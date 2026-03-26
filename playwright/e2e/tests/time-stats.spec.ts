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

    test('should show 0 initially and update when block is added', async () => {
        const initial = await timeStatsPage.getTimeWorkedValue().textContent();
        expect(initial).toContain('0');

        await calendarPage.createBlockAtPosition(100, 80);
        const updated = await timeStatsPage.getTimeWorkedValue().textContent();
        expect(updated).not.toContain('0m');
        expect(updated).toMatch(/\d+[hm]/);
    });

    test('should fill progress bar as work approaches goal', async () => {
        await goalSetterPage.setGoal(2, 0);

        const progressFill = timeStatsPage.getProgressFill();
        const before = await progressFill.getAttribute('aria-valuenow');
        expect(before).toBe('0');

        await calendarPage.createBlockAtPosition(100, 80);
        await expect(calendarPage.getTimeBlock()).toBeVisible();

        const after = await progressFill.getAttribute('aria-valuenow');
        expect(Number(after)).toBeGreaterThan(0);
    });

    test('should show completion message and hide remaining when goal is met', async () => {
        await goalSetterPage.setGoal(0, 30);
        await calendarPage.createBlockAtPosition(100, 50);

        await expect(timeStatsPage.getCompletionMessage()).toBeAttached();
        const message = await timeStatsPage.getCompletionMessage().textContent();
        expect(message).toContain('Goal achieved');
        await expect(timeStatsPage.getRemainingCard()).not.toBeAttached();
    });

    test('should show remaining time when under goal', async () => {
        await goalSetterPage.setGoal(2, 0);
        await calendarPage.createBlockAtPosition(100, 80);
        await expect(timeStatsPage.getRemainingCard()).toBeAttached();
    });

    test('should show goal breakdown when lunch is enabled', async () => {
        await goalSetterPage.enableLunch();
        await expect(timeStatsPage.getGoalBreakdown()).toBeAttached();
        const text = await timeStatsPage.getGoalBreakdown().textContent();
        expect(text).toContain('Lunch');
    });

    test('should persist stats after page reload', async ({ page }) => {
        await calendarPage.createBlockAtPosition(100, 80);
        const before = await timeStatsPage.getTimeWorkedValue().textContent();

        await page.reload();
        await appPage.waitForAppToLoad();

        const after = await timeStatsPage.getTimeWorkedValue().textContent();
        expect(after).toBe(before);
    });
});
