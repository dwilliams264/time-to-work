import { test, expect } from '@playwright/test';
import { AppPage } from '../../pageobjects/app.page';
import { CalendarPage } from '../../pageobjects/calendar.page';
import { TimeStatsPage } from '../../pageobjects/time-stats.page';

test.describe('Time Blocks', () => {
    let appPage: AppPage;
    let calendarPage: CalendarPage;
    let timeStatsPage: TimeStatsPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        calendarPage = new CalendarPage(page);
        timeStatsPage = new TimeStatsPage(page);

        await appPage.navigate();
        await appPage.waitForAppToLoad();
    });

    test('should create a time block by dragging', { tag: ['@blocks', '@create', '@drag'] }, async () => {
        await calendarPage.createBlockAtPosition(100, 80);
        await expect(calendarPage.getTimeBlock()).toBeVisible();
    });

    test(
        'should display time range and duration on created block',
        { tag: ['@blocks', '@display', '@duration'] },
        async () => {
            await calendarPage.createBlockAtPosition(100, 80);
            const content = await calendarPage.getTimeBlockContent().first().textContent();
            expect(content).toMatch(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/);
            expect(content).toMatch(/\d+[hm]/);
        },
    );

    test('should create multiple blocks', { tag: ['@blocks', '@multiple'] }, async () => {
        await calendarPage.createBlockAtPosition(50, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
        await calendarPage.createBlockAtPosition(200, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(2);
    });

    test('should delete a block', { tag: ['@blocks', '@delete'] }, async () => {
        await calendarPage.createBlockAtPosition(100, 80);
        await calendarPage.deleteFirstBlock();
        await expect(calendarPage.getTimeBlock()).not.toBeVisible();
    });

    test('should clear all blocks', { tag: ['@blocks', '@clear'] }, async () => {
        await calendarPage.createBlockAtPosition(50, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
        await calendarPage.createBlockAtPosition(200, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(2);
        await calendarPage.clearAllBlocks();
        await expect(calendarPage.getTimeBlock()).not.toBeVisible();
        await expect(calendarPage.getClearAllButton()).toBeDisabled();
    });

    test('should update time stats when block is added and removed', async () => {
        const initial = await timeStatsPage.getTimeWorkedValue().textContent();
        await calendarPage.createBlockAtPosition(100, 80);
        const withBlock = await timeStatsPage.getTimeWorkedValue().textContent();
        expect(withBlock).not.toBe(initial);

        await calendarPage.deleteFirstBlock();
        const afterDelete = await timeStatsPage.getTimeWorkedValue().textContent();
        expect(afterDelete).not.toBe(withBlock);
    });

    test('should persist blocks after page reload', async ({ page }) => {
        await calendarPage.createBlockAtPosition(50, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
        await calendarPage.createBlockAtPosition(200, 60);
        await expect(calendarPage.getTimeBlocks()).toHaveCount(2);

        await page.reload();
        await appPage.waitForAppToLoad();
        await expect(calendarPage.getTimeBlocks()).toHaveCount(2);
    });
});
