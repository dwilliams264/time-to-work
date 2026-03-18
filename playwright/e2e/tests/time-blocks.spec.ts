import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { CalendarPage } from '../pageobjects/calendar.page';
import { TimeStatsPage } from '../pageobjects/time-stats.page';

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

    test.describe('Creating Time Blocks', () => {
        test('should create a time block by dragging', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            // Verify block was created
            await expect(calendarPage.getTimeBlock()).toBeVisible();
        });

        test('should create multiple time blocks', async () => {
            // Create first block
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);

            // Create second block
            await calendarPage.createBlockAtPosition(350, 80);

            // Verify both blocks exist
            await expect(calendarPage.getTimeBlocks()).toHaveCount(2);
        });

        test('should create a short time block', async () => {
            // Create a 15-minute block
            await calendarPage.createBlockAtPosition(200, 20);

            await expect(calendarPage.getTimeBlock()).toBeVisible();
        });

        test('should create a long time block', async () => {
            // Create a longer block
            await calendarPage.createBlockAtPosition(200, 160);

            await expect(calendarPage.getTimeBlock()).toBeVisible();
        });

        test('should display work icon on time block', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const blockContent = await calendarPage.getTimeBlockContent().first().textContent();
            expect(blockContent).toContain('💻');
        });

        test('should display time range on time block', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const blockContent = await calendarPage.getTimeBlockContent().first().textContent();
            // Should contain time range like "09:00 - 10:00"
            expect(blockContent).toMatch(/\d{2}:\d{2}\s*-\s*\d{2}:\d{2}/);
        });

        test('should show preview while dragging', async ({ page }) => {
            const calendar = calendarPage.getCalendar();
            const calendarBox = await calendar.boundingBox();
            if (!calendarBox) throw new Error('Calendar not found');

            const startY = calendarBox.y + 250;
            const centerX = calendarBox.x + calendarBox.width / 2;

            // Start drag
            await page.mouse.move(centerX, startY);
            await page.mouse.down();
            await page.mouse.move(centerX, startY + 50);

            // Preview should be visible while dragging
            await expect(calendarPage.getPreviewBlock()).toBeVisible();

            // Complete the drag
            await page.mouse.up();
        });
    });

    test.describe('Deleting Time Blocks', () => {
        test('should delete a time block using delete button', async () => {
            // Create a block
            await calendarPage.createBlockAtPosition(250, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Delete it
            await calendarPage.deleteFirstBlock();

            // Verify block is removed
            await expect(calendarPage.getTimeBlock()).not.toBeVisible();
        });

        test('should show delete button on time block', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            await expect(calendarPage.getTimeBlockDeleteButton()).toBeVisible();
        });

        test('should delete first block when multiple exist', async () => {
            // Create two blocks
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            await expect(calendarPage.getTimeBlocks()).toHaveCount(2);

            // Delete first block
            await calendarPage.deleteFirstBlock();

            // Should have one block remaining
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
        });
    });

    test.describe('Clear All Functionality', () => {
        test('should clear all time blocks', async () => {
            // Create multiple blocks
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            await expect(calendarPage.getTimeBlocks()).toHaveCount(2);

            // Clear all
            await calendarPage.clearAllBlocks();

            // Verify all blocks removed
            await expect(calendarPage.getTimeBlock()).not.toBeVisible();
        });

        test('should disable clear button when no blocks exist', async () => {
            await expect(calendarPage.getClearAllButton()).toBeDisabled();
        });

        test('should enable clear button when blocks exist', async () => {
            await calendarPage.createBlockAtPosition(250, 80);
            await expect(calendarPage.getClearAllButton()).toBeEnabled();
        });

        test('should disable clear button after clearing all', async ({ page }) => {
            // Create and clear
            await calendarPage.createBlockAtPosition(250, 80);
            await calendarPage.clearAllBlocks();

            // Button should be disabled again
            await expect(calendarPage.getClearAllButton()).toBeDisabled();
        });
    });

    test.describe('Time Block Updates Stats', () => {
        test('should update time worked when block is created', async () => {
            // Initially should show 0
            const initialValue = await timeStatsPage.getTimeWorkedValue().textContent();

            // Create a block
            await calendarPage.createBlockAtPosition(250, 80);

            // Time worked should update
            const newValue = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(newValue).not.toBe(initialValue);
        });

        test('should update stats when block is deleted', async () => {
            // Create a block
            await calendarPage.createBlockAtPosition(250, 80);
            const withBlock = await timeStatsPage.getTimeWorkedValue().textContent();

            // Delete the block
            await calendarPage.deleteFirstBlock();

            // Time should decrease
            const afterDelete = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(afterDelete).not.toBe(withBlock);
        });

        test('should reset stats when all blocks cleared', async () => {
            // Create blocks
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            // Clear all
            await calendarPage.clearAllBlocks();

            // Stats should show minimal time
            const timeWorked = await timeStatsPage.getTimeWorkedValue().textContent();
            expect(timeWorked).toContain('0');
        });
    });

    test.describe('Block Persistence', () => {
        test('should persist time blocks after page reload', async ({ page }) => {
            // Create a block
            await calendarPage.createBlockAtPosition(250, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // Block should still exist
            await expect(calendarPage.getTimeBlock()).toBeVisible();
        });

        test('should persist multiple blocks after page reload', async ({ page }) => {
            // Create two blocks
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
            await calendarPage.createBlockAtPosition(350, 80);

            await expect(calendarPage.getTimeBlocks()).toHaveCount(2);

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // Both blocks should still exist
            await expect(calendarPage.getTimeBlocks()).toHaveCount(2);
        });

        test('should not persist blocks after clearing and reloading', async ({ page }) => {
            // Create and clear blocks
            await calendarPage.createBlockAtPosition(250, 80);
            await calendarPage.clearAllBlocks();

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // No blocks should exist
            await expect(calendarPage.getTimeBlock()).not.toBeVisible();
        });
    });

    test.describe('Block Interactions', () => {
        test('should display duration on time block', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const blockContent = await calendarPage.getTimeBlockContent().first().textContent();
            // Should contain duration like "1h" or "30m"
            expect(blockContent).toMatch(/\d+[hm]/);
        });

        test('should show delete button with × symbol', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const deleteButton = calendarPage.getTimeBlockDeleteButton().first();
            const buttonText = await deleteButton.textContent();
            expect(buttonText).toContain('×');
        });
    });
});
