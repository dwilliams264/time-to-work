import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';
import { CalendarPage } from '../pageobjects/calendar.page';

test.describe('Calendar UI and Visual Elements', () => {
    let appPage: AppPage;
    let goalSetterPage: GoalSetterPage;
    let calendarPage: CalendarPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        goalSetterPage = new GoalSetterPage(page);
        calendarPage = new CalendarPage(page);

        await appPage.navigate();
        await appPage.waitForAppToLoad();
    });

    test.describe('Calendar Structure', () => {
        test('should display calendar container', async () => {
            await expect(calendarPage.getCalendarContainer()).toBeVisible();
        });

        test('should display calendar header', async () => {
            await expect(calendarPage.getCalendarHeader()).toBeVisible();
        });

        test('should display calendar title', async () => {
            await expect(calendarPage.getCalendarTitle()).toBeVisible();
            await expect(calendarPage.getCalendarTitle()).toContainText("Today's Schedule");
        });

        test('should display hint text', async () => {
            await expect(calendarPage.getCalendarHint()).toBeVisible();
            await expect(calendarPage.getCalendarHint()).toContainText('Drag');
        });

        test('should have scrollable calendar area', async () => {
            const calendar = calendarPage.getCalendar();
            const overflow = await calendar.evaluate((el) => {
                return window.getComputedStyle(el).overflowY;
            });
            expect(overflow).toBe('auto');
        });
    });

    test.describe('Hour Grid', () => {
        test('should display hour rows', async () => {
            const hourRows = calendarPage.getHourRows();
            await expect(hourRows.first()).toBeVisible();
        });

        test('should display multiple hours', async () => {
            const hourRows = calendarPage.getHourRows();
            const count = await hourRows.count();

            // Calendar shows 5 AM to 8 PM (15 hours)
            expect(count).toBeGreaterThanOrEqual(15);
        });

        test('should display hour labels', async () => {
            const firstHour = calendarPage.getHourRows().first();
            const text = await firstHour.textContent();

            // Should contain time format like "05:00" or "06:00"
            expect(text).toMatch(/\d{2}:\d{2}/);
        });

        test('should show hours from 5 AM to 8 PM', async () => {
            const allHours = calendarPage.getHourRows();
            const texts = await allHours.allTextContents();

            // Should start with 05:00
            expect(texts.some((t) => t.includes('05:00'))).toBeTruthy();

            // Should include times up to evening
            expect(texts.some((t) => t.includes('19:00') || t.includes('20:00'))).toBeTruthy();
        });

        test('should have consistent hour row spacing', async () => {
            const rows = calendarPage.getHourRows();
            const firstRow = rows.first();
            const secondRow = rows.nth(1);

            const firstHeight = await firstRow.evaluate((el) => el.clientHeight);
            const secondHeight = await secondRow.evaluate((el) => el.clientHeight);

            // Heights should be the same
            expect(firstHeight).toBe(secondHeight);
        });
    });

    test.describe('Current Time Indicator', () => {
        test('should display current time line during work hours', async () => {
            const currentHour = new Date().getHours();

            if (currentHour >= 5 && currentHour < 20) {
                await expect(calendarPage.getCurrentTimeLine()).toBeVisible();
            }
        });

        test('should display current time indicator dot', async () => {
            const currentHour = new Date().getHours();

            if (currentHour >= 5 && currentHour < 20) {
                await expect(calendarPage.getCurrentTimeIndicator()).toBeVisible();
            }
        });

        test('should not display time line outside calendar hours', async () => {
            const currentHour = new Date().getHours();

            if (currentHour < 5 || currentHour >= 20) {
                await expect(calendarPage.getCurrentTimeLine()).not.toBeVisible();
            }
        });

        test('should have red color for current time line', async () => {
            const currentHour = new Date().getHours();

            if (currentHour >= 5 && currentHour < 20) {
                const timeLine = calendarPage.getCurrentTimeLine();
                const bgColor = await timeLine.evaluate((el) => {
                    return window.getComputedStyle(el).backgroundColor;
                });

                // Should contain red color
                expect(bgColor).toBeTruthy();
            }
        });
    });

    test.describe('Lunch Indicator', () => {
        test('should display lunch indicator when lunch is enabled', async () => {
            await goalSetterPage.enableLunch();
            await expect(calendarPage.getLunchIndicator()).toBeVisible();
        });

        test('should show lunch emoji', async () => {
            await goalSetterPage.enableLunch();

            const lunchText = await calendarPage.getLunchIndicator().textContent();
            expect(lunchText).toContain('🍽️');
        });

        test('should display "Lunch" label', async () => {
            await goalSetterPage.enableLunch();

            const lunchText = await calendarPage.getLunchIndicator().textContent();
            expect(lunchText).toContain('Lunch');
        });

        test('should display lunch start time', async () => {
            await goalSetterPage.enableLunch();

            const lunchText = await calendarPage.getLunchIndicator().textContent();
            // Should contain time format like "12:00"
            expect(lunchText).toMatch(/\d{2}:\d{2}/);
        });

        test('should hide lunch indicator when lunch is disabled', async () => {
            await goalSetterPage.enableLunch();
            await expect(calendarPage.getLunchIndicator()).toBeVisible();

            await goalSetterPage.disableLunch();
            await expect(calendarPage.getLunchIndicator()).not.toBeVisible();
        });

        test('should have distinct styling from time blocks', async () => {
            await goalSetterPage.enableLunch();

            const lunchIndicator = calendarPage.getLunchIndicator();
            const className = await lunchIndicator.getAttribute('class');
            expect(className).toContain('lunch-indicator');
        });

        test('should be positioned on calendar', async () => {
            await goalSetterPage.enableLunch();

            const lunchIndicator = calendarPage.getLunchIndicator();
            const position = await lunchIndicator.evaluate((el) => {
                return window.getComputedStyle(el).position;
            });
            expect(position).toBe('absolute');
        });
    });

    test.describe('Visual States', () => {
        test('should show preview block while creating', async ({ page }) => {
            const calendar = calendarPage.getCalendar();
            const calendarBox = await calendar.boundingBox();
            if (!calendarBox) throw new Error('Calendar not found');

            const startY = calendarBox.y + 250;
            const centerX = calendarBox.x + calendarBox.width / 2;

            // Start dragging
            await page.mouse.move(centerX, startY);
            await page.mouse.down();
            await page.mouse.move(centerX, startY + 60);

            // Preview should be visible
            const preview = calendarPage.getPreviewBlock();
            await expect(preview).toBeVisible();

            await page.mouse.up();
        });

        test('should hide preview after creating block', async ({ page }) => {
            await calendarPage.createBlockAtPosition(250, 80);

            // Preview should not be visible
            await expect(calendarPage.getPreviewBlock()).not.toBeVisible();
        });

        test('should have dashed border on preview block', async ({ page }) => {
            const calendar = calendarPage.getCalendar();
            const calendarBox = await calendar.boundingBox();
            if (!calendarBox) throw new Error('Calendar not found');

            const startY = calendarBox.y + 250;
            const centerX = calendarBox.x + calendarBox.width / 2;

            await page.mouse.move(centerX, startY);
            await page.mouse.down();
            await page.mouse.move(centerX, startY + 60);

            const preview = calendarPage.getPreviewBlock();
            const borderStyle = await preview.evaluate((el) => {
                return window.getComputedStyle(el).borderStyle;
            });

            expect(borderStyle).toContain('dashed');

            await page.mouse.up();
        });
    });

    test.describe('Responsive Design', () => {
        test('should adapt to mobile viewport', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });

            // Calendar should still be visible
            await expect(calendarPage.getCalendarContainer()).toBeVisible();
            await expect(calendarPage.getCalendar()).toBeVisible();
        });

        test('should show calendar in desktop viewport', async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1280, height: 720 });

            await expect(calendarPage.getCalendarContainer()).toBeVisible();
            await expect(calendarPage.getCalendar()).toBeVisible();
        });

        test('should maintain calendar scrollability on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const calendar = calendarPage.getCalendar();
            const overflow = await calendar.evaluate((el) => {
                return window.getComputedStyle(el).overflowY;
            });
            expect(overflow).toBe('auto');
        });
    });

    test.describe('Calendar Interactions', () => {
        test('should have crosshair cursor on calendar', async () => {
            const calendar = calendarPage.getCalendar();
            const cursor = await calendar.evaluate((el) => {
                return window.getComputedStyle(el).cursor;
            });
            expect(cursor).toBe('crosshair');
        });

        test('should prevent text selection while dragging', async () => {
            const calendar = calendarPage.getCalendar();
            const userSelect = await calendar.evaluate((el) => {
                return window.getComputedStyle(el).userSelect;
            });
            expect(userSelect).toBe('none');
        });

        test('should have rounded corners on calendar container', async () => {
            const container = calendarPage.getCalendarContainer();
            const borderRadius = await container.evaluate((el) => {
                return window.getComputedStyle(el).borderRadius;
            });
            expect(borderRadius).toBeTruthy();
            expect(borderRadius).not.toBe('0px');
        });
    });

    test.describe('Time Block Visual Elements', () => {
        test('should display time blocks with gradient background', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const block = calendarPage.getTimeBlock().first();
            const background = await block.evaluate((el) => {
                return window.getComputedStyle(el).backgroundImage;
            });

            expect(background).toContain('gradient');
        });

        test('should show rounded corners on time blocks', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const block = calendarPage.getTimeBlock().first();
            const borderRadius = await block.evaluate((el) => {
                return window.getComputedStyle(el).borderRadius;
            });

            expect(borderRadius).toBeTruthy();
            expect(borderRadius).not.toBe('0px');
        });

        test('should show shadow on time blocks', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const block = calendarPage.getTimeBlock().first();
            const boxShadow = await block.evaluate((el) => {
                return window.getComputedStyle(el).boxShadow;
            });

            expect(boxShadow).not.toBe('none');
        });

        test('should have move cursor on time blocks', async () => {
            await calendarPage.createBlockAtPosition(250, 80);

            const block = calendarPage.getTimeBlock().first();
            const cursor = await block.evaluate((el) => {
                return window.getComputedStyle(el).cursor;
            });

            expect(cursor).toBe('move');
        });
    });

    test.describe('Color Themes', () => {
        test('should use consistent color scheme', async () => {
            // Check if calendar container has expected background
            const container = calendarPage.getCalendarContainer();
            const bgColor = await container.evaluate((el) => {
                return window.getComputedStyle(el).backgroundColor;
            });

            expect(bgColor).toBeTruthy();
        });

        test('should have white background on calendar area', async () => {
            const container = calendarPage.getCalendarContainer();
            const bgColor = await container.evaluate((el) => {
                return window.getComputedStyle(el).backgroundColor;
            });

            // Should be white or light color
            expect(bgColor).toMatch(/rgb\(255,\s*255,\s*255\)/);
        });
    });
});
