import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { CalendarPage } from '../pageobjects/calendar.page';

test.describe('Date Navigation', () => {
    let appPage: AppPage;
    let calendarPage: CalendarPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        calendarPage = new CalendarPage(page);

        await appPage.navigate();
        await appPage.waitForAppToLoad();
    });

    test('should disable next button on today and re-enable after going back', async () => {
        await expect(appPage.getNextDayButton()).toBeDisabled();
        await appPage.goToPreviousDay();
        await expect(appPage.getNextDayButton()).toBeEnabled();
    });

    test('should change date when navigating and return on forward', async () => {
        const today = await appPage.getCurrentDateText();
        await appPage.goToPreviousDay();
        const yesterday = await appPage.getCurrentDateText();
        expect(yesterday).not.toBe(today);

        await appPage.goToNextDay();
        expect(await appPage.getCurrentDateText()).toBe(today);
    });

    test('should show empty calendar on a day with no blocks', async () => {
        await calendarPage.createBlockAtPosition(100, 80);
        await expect(calendarPage.getTimeBlock()).toBeVisible();

        await appPage.goToPreviousDay();
        await expect(calendarPage.getTimeBlock()).not.toBeVisible();
    });

    test('should keep blocks isolated per day', async () => {
        await calendarPage.createBlockAtPosition(100, 80);

        await appPage.goToPreviousDay();
        await expect(calendarPage.getTimeBlock()).not.toBeVisible();

        await appPage.goToNextDay();
        await expect(calendarPage.getTimeBlock()).toBeVisible();
    });

    test('should change calendar title based on selected day', async () => {
        await expect(calendarPage.getCalendarTitle()).toContainText("Today's Schedule");

        await appPage.goToPreviousDay();
        await expect(calendarPage.getCalendarTitle()).toContainText("Day's Schedule");

        await appPage.goToNextDay();
        await expect(calendarPage.getCalendarTitle()).toContainText("Today's Schedule");
    });

    test('should show current time line only on today', async ({ page }) => {
        await page.clock.install({ time: new Date('2026-03-18T10:00:00') });
        await appPage.navigate();
        await appPage.waitForAppToLoad();
        await expect(calendarPage.getCurrentTimeLine()).toBeVisible();

        await appPage.goToPreviousDay();
        await expect(calendarPage.getCurrentTimeLine()).not.toBeVisible();

        await appPage.goToNextDay();
        await expect(calendarPage.getCurrentTimeLine()).toBeVisible();
    });
});
