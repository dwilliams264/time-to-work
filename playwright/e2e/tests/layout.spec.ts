import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';
import { TimeStatsPage } from '../pageobjects/time-stats.page';
import { CalendarPage } from '../pageobjects/calendar.page';

test.describe('Layout and Navigation', () => {
    let appPage: AppPage;
    let goalSetterPage: GoalSetterPage;
    let timeStatsPage: TimeStatsPage;
    let calendarPage: CalendarPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        goalSetterPage = new GoalSetterPage(page);
        timeStatsPage = new TimeStatsPage(page);
        calendarPage = new CalendarPage(page);

        await page.goto('/time-to-work');
        await appPage.waitForAppToLoad();
    });

    test('should display the main application layout', async () => {
        // Verify header
        await expect(appPage.getHeaderTitle()).toBeVisible();
        await expect(appPage.getHeaderTitle()).toContainText('Time to Work');

        // Verify date display
        await expect(appPage.getCurrentDate()).toBeVisible();

        // Verify main content area
        await expect(appPage.getMainContent()).toBeVisible();
    });

    test('should display all main components', async () => {
        // Verify sidebar components
        await expect(goalSetterPage.getGoalSetterContainer()).toBeVisible();
        await expect(timeStatsPage.getTimeStatsContainer()).toBeVisible();

        // Verify calendar
        await expect(calendarPage.getCalendarContainer()).toBeVisible();
        await expect(calendarPage.getCalendarTitle()).toBeVisible();
        await expect(calendarPage.getCalendarTitle()).toContainText("Today's Schedule");
    });

    test('should display calendar hint text', async () => {
        await expect(calendarPage.getCalendarHint()).toBeVisible();
        await expect(calendarPage.getCalendarHint()).toContainText('Drag to create');
    });

    test('should display hour rows on calendar', async () => {
        // Calendar should show multiple hour rows
        const hourRows = calendarPage.getHourRows();
        await expect(hourRows.first()).toBeVisible();

        // Should have multiple hours displayed (5 AM to 8 PM = 15 hours)
        const count = await hourRows.count();
        expect(count).toBeGreaterThan(10);
    });

    test('should display clear all button', async () => {
        await expect(calendarPage.getClearAllButton()).toBeVisible();
        await expect(calendarPage.getClearAllButton()).toBeDisabled();
    });

    test('should enable clear all button when blocks exist', async ({ page }) => {
        // Create a block
        await calendarPage.createBlockAtPosition(250, 80);

        // Clear button should now be enabled
        await expect(calendarPage.getClearAllButton()).toBeEnabled();
    });

    test('should display current date in correct format', async () => {
        const dateText = await appPage.getCurrentDate().textContent();

        // Should contain day name, day, month, and year
        expect(dateText).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);
    });

    test('should have responsive layout structure', async () => {
        // Verify main structural elements exist
        await expect(appPage.getAppContainer()).toBeVisible();
        await expect(appPage.getSidebar()).toBeVisible();
        await expect(appPage.getMainContent()).toBeVisible();
    });
});
