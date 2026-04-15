import { test, expect } from '@playwright/test';
import { AppPage } from '../../pageobjects/app.page';
import { GoalSetterPage } from '../../pageobjects/goal-setter.page';
import { TimeStatsPage } from '../../pageobjects/time-stats.page';
import { CalendarPage } from '../../pageobjects/calendar.page';

test.describe('Layout', () => {
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

    test('should display main layout with header and date', { tag: ['@layout', '@header'] }, async () => {
        await expect(appPage.getHeaderTitle()).toContainText('Time to Work');
        await expect(appPage.getCurrentDate()).toBeVisible();
        await expect(appPage.getMainContent()).toBeVisible();
    });

    test('should display all core components', { tag: ['@layout', '@components'] }, async () => {
        await expect(goalSetterPage.getGoalSetterContainer()).toBeVisible();
        await expect(timeStatsPage.getTimeStatsContainer()).toBeVisible();
        await expect(calendarPage.getCalendarContainer()).toBeVisible();
        await expect(calendarPage.getCalendarTitle()).toContainText("Today's Schedule");
    });

    test('should display hour grid from 5 AM to 8 PM', { tag: ['@layout', '@calendar', '@hours'] }, async () => {
        const hourRows = calendarPage.getHourRows();
        await expect(hourRows.first()).toBeVisible();
        const count = await hourRows.count();
        expect(count).toBeGreaterThanOrEqual(15);
    });

    test('should display current date in correct format', async () => {
        const dateText = await appPage.getCurrentDate().textContent();
        expect(dateText).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);
    });

    test('should start with clear all disabled and enable after block creation', async () => {
        await expect(calendarPage.getClearAllButton()).toBeDisabled();
        await calendarPage.createBlockAtPosition(100, 80);
        await expect(calendarPage.getClearAllButton()).toBeEnabled();
    });
});
