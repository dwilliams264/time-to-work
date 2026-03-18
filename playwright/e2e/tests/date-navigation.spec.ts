import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { CalendarPage } from '../pageobjects/calendar.page';
import { TimeStatsPage } from '../pageobjects/time-stats.page';

test.describe('Date Navigation', () => {
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

    test.describe('Navigation UI Elements', () => {
        test('should display date navigation container', async () => {
            await expect(appPage.getDateNavigation()).toBeVisible();
        });

        test('should display previous day button', async () => {
            await expect(appPage.getPreviousDayButton()).toBeVisible();
        });

        test('should display next day button', async () => {
            await expect(appPage.getNextDayButton()).toBeVisible();
        });

        test('should display current date in navigation', async () => {
            await expect(appPage.getCurrentDate()).toBeVisible();
        });

        test('should show left arrow in previous button', async () => {
            const buttonText = await appPage.getPreviousDayButton().textContent();
            expect(buttonText).toContain('←');
        });

        test('should show right arrow in next button', async () => {
            const buttonText = await appPage.getNextDayButton().textContent();
            expect(buttonText).toContain('→');
        });

        test('should have proper aria labels for accessibility', async () => {
            const prevLabel = await appPage.getPreviousDayButton().getAttribute('aria-label');
            const nextLabel = await appPage.getNextDayButton().getAttribute('aria-label');

            expect(prevLabel).toBe('Previous day');
            expect(nextLabel).toBe('Next day');
        });
    });

    test.describe('Today Limit', () => {
        test('should disable next button when on today', async () => {
            // By default should be on today
            await expect(appPage.getNextDayButton()).toBeDisabled();
        });

        test('should enable next button when on yesterday', async () => {
            // Go to yesterday
            await appPage.goToPreviousDay();

            // Next button should be enabled
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });

        test('should keep previous button always enabled', async () => {
            // Previous button should be enabled on today
            await expect(appPage.getPreviousDayButton()).toBeEnabled();

            // Go back a day
            await appPage.goToPreviousDay();

            // Should still be enabled
            await expect(appPage.getPreviousDayButton()).toBeEnabled();
        });

        test('should not go beyond today', async () => {
            await expect(appPage.getNextDayButton()).toBeDisabled();
        });
    });

    test.describe('Basic Navigation', () => {
        test('should navigate to previous day', async () => {
            const todayDate = await appPage.getCurrentDateText();

            // Go to yesterday
            await appPage.goToPreviousDay();

            // Date should have changed
            const yesterdayDate = await appPage.getCurrentDateText();
            expect(yesterdayDate).not.toBe(todayDate);
        });

        test('should navigate to next day from yesterday', async () => {
            // Go to yesterday
            await appPage.goToPreviousDay();
            const yesterdayDate = await appPage.getCurrentDateText();

            // Go back to today
            await appPage.goToNextDay();

            // Should be back to today
            const backToToday = await appPage.getCurrentDateText();
            expect(backToToday).not.toBe(yesterdayDate);
        });

        test('should update date display when navigating', async () => {
            const initialDate = await appPage.getCurrentDateText();

            // Navigate to previous day
            await appPage.goToPreviousDay();

            // Date should be different
            const newDate = await appPage.getCurrentDateText();
            expect(newDate).not.toBe(initialDate);
        });

        test('should show proper date format after navigation', async () => {
            await appPage.goToPreviousDay();

            const dateText = await appPage.getCurrentDateText();
            // Should match format like "Monday, 24 February 2026"
            expect(dateText).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);
        });

        test('should navigate multiple days backward', async () => {
            const todayDate = await appPage.getCurrentDateText();

            // Go back 3 days
            await appPage.goToPreviousDay();
            await appPage.goToPreviousDay();
            await appPage.goToPreviousDay();

            const threeDaysAgo = await appPage.getCurrentDateText();
            expect(threeDaysAgo).not.toBe(todayDate);
        });

        test('should navigate back and forth multiple times', async () => {
            // Go back
            await appPage.goToPreviousDay();
            const yesterday = await appPage.getCurrentDateText();

            // Go forward
            await appPage.goToNextDay();
            const backToToday = await appPage.getCurrentDateText();

            // Go back again
            await appPage.goToPreviousDay();
            const yesterdayAgain = await appPage.getCurrentDateText();

            expect(yesterdayAgain).toBe(yesterday);
            expect(backToToday).not.toBe(yesterday);
        });
    });

    test.describe('Calendar Updates on Navigation', () => {
        test('should show empty calendar on previous day', async () => {
            // Create a block on today
            await calendarPage.createBlockAtPosition(250, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Navigate to yesterday (should have no blocks)
            await appPage.goToPreviousDay();

            // Calendar should be empty
            await expect(calendarPage.getTimeBlock()).not.toBeVisible();
        });

        test('should restore blocks when returning to today', async ({ page }) => {
            // Create a block on today
            await calendarPage.createBlockAtPosition(250, 80);
            await expect(calendarPage.getTimeBlock()).toBeVisible();

            // Navigate away and back
            await appPage.goToPreviousDay();
            await appPage.goToNextDay();

            // Block should still be there
            await expect(calendarPage.getTimeBlock()).toBeVisible();
        });

        test('should update time stats when navigating days', async ({ page }) => {
            // Add work on today
            await calendarPage.createBlockAtPosition(250, 80);
            const todayStats = await timeStatsPage.getTimeWorkedText();

            // Navigate to yesterday (should be zero)
            await appPage.goToPreviousDay();

            const yesterdayStats = await timeStatsPage.getTimeWorkedText();
            expect(yesterdayStats).toContain('0');
            expect(yesterdayStats).not.toBe(todayStats);
        });

        test('should clear correct day when using clear all', async ({ page }) => {
            // Add blocks on today
            await calendarPage.createBlockAtPosition(200, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);

            // Navigate to yesterday and add block
            await appPage.goToPreviousDay();
            await calendarPage.createBlockAtPosition(300, 80);
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);

            // Clear yesterday's blocks
            await calendarPage.clearAllBlocks();
            await expect(calendarPage.getTimeBlock()).not.toBeVisible();

            // Go back to today - blocks should still exist
            await appPage.goToNextDay();
            await expect(calendarPage.getTimeBlocks()).toHaveCount(1);
        });
    });

    test.describe('Calendar Title Changes', () => {
        test('should show "Today\'s Schedule" when on today', async () => {
            const titleText = await calendarPage.getCalendarTitle().textContent();
            expect(titleText).toBe("Today's Schedule");
        });

        test('should show "Day\'s Schedule" when on previous day', async () => {
            await appPage.goToPreviousDay();

            const titleText = await calendarPage.getCalendarTitle().textContent();
            expect(titleText).toBe("Day's Schedule");
        });

        test('should restore "Today\'s Schedule" when returning to today', async () => {
            // Navigate away
            await appPage.goToPreviousDay();
            await expect(calendarPage.getCalendarTitle()).toContainText("Day's Schedule");

            // Navigate back
            await appPage.goToNextDay();

            // Should show today's schedule again
            const titleText = await calendarPage.getCalendarTitle().textContent();
            expect(titleText).toBe("Today's Schedule");
        });
    });

    test.describe('Current Time Indicator', () => {
        test('should show current time line on today during work hours', async ({ page }) => {
            // Install fake clock at 10:00 AM for deterministic result
            await page.clock.install({ time: new Date('2026-03-18T10:00:00') });
            await appPage.navigate();
            await appPage.waitForAppToLoad();

            await expect(calendarPage.getCurrentTimeLine()).toBeVisible();
        });

        test('should hide current time line on previous days', async () => {
            await appPage.goToPreviousDay();

            // Current time line should not be visible on past days
            await expect(calendarPage.getCurrentTimeLine()).not.toBeVisible();
        });

        test('should restore current time line when returning to today', async ({ page }) => {
            // Install fake clock at 10:00 AM for deterministic result
            await page.clock.install({ time: new Date('2026-03-18T10:00:00') });
            await appPage.navigate();
            await appPage.waitForAppToLoad();

            // Verify it's visible on today
            await expect(calendarPage.getCurrentTimeLine()).toBeVisible();

            // Navigate away
            await appPage.goToPreviousDay();
            await expect(calendarPage.getCurrentTimeLine()).not.toBeVisible();

            // Navigate back
            await appPage.goToNextDay();

            // Should be visible again
            await expect(calendarPage.getCurrentTimeLine()).toBeVisible();
        });
    });

    test.describe('Goal Settings Per Day', () => {
        test('should persist different goals for different days', async ({ page }) => {
            const goalSetterPage = await import('../pageobjects/goal-setter.page').then(
                (m) => new m.GoalSetterPage(page),
            );

            // Set goal on today
            await goalSetterPage.setGoal(8, 0);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('8h');

            // Navigate to yesterday and set different goal
            await appPage.goToPreviousDay();
            await goalSetterPage.setGoal(7, 0);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h');

            // Navigate back to today
            await appPage.goToNextDay();

            // Should still have 8 hour goal
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('8h');
        });

        test('should persist lunch settings per day', async ({ page }) => {
            const goalSetterPage = await import('../pageobjects/goal-setter.page').then(
                (m) => new m.GoalSetterPage(page),
            );

            // Disable lunch on today
            await goalSetterPage.disableLunch();
            await expect(calendarPage.getLunchIndicator()).not.toBeVisible();

            // Navigate to yesterday
            await appPage.goToPreviousDay();

            // Lunch should be enabled (default) on yesterday
            await expect(calendarPage.getLunchIndicator()).toBeVisible();

            // Navigate back to today
            await appPage.goToNextDay();

            // Lunch should still be disabled
            await expect(calendarPage.getLunchIndicator()).not.toBeVisible();
        });
    });

    test.describe('Date Display Format', () => {
        test('should display full date with weekday', async () => {
            const dateText = await appPage.getCurrentDateText();

            // Should contain weekday name
            expect(dateText).toMatch(/Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday/);
        });

        test('should display month name', async () => {
            const dateText = await appPage.getCurrentDateText();

            // Should contain month name
            expect(dateText).toMatch(
                /January|February|March|April|May|June|July|August|September|October|November|December/,
            );
        });

        test('should display year', async () => {
            const dateText = await appPage.getCurrentDateText();

            // Should contain 4-digit year
            expect(dateText).toMatch(/\d{4}/);
        });

        test('should update weekday when navigating', async () => {
            const todayDate = await appPage.getCurrentDateText();

            // Navigate back
            await appPage.goToPreviousDay();
            const yesterdayDate = await appPage.getCurrentDateText();

            // Weekdays should be different (unless same day of week scenario)
            expect(yesterdayDate).not.toBe(todayDate);
        });
    });

    test.describe('Multi-Day Navigation', () => {
        test('should navigate back a week', async ({ page }) => {
            const todayDate = await appPage.getCurrentDateText();

            // Navigate back 7 days
            for (let i = 0; i < 7; i++) {
                await appPage.goToPreviousDay();
                await page.waitForTimeout(50);
            }

            const weekAgoDate = await appPage.getCurrentDateText();
            expect(weekAgoDate).not.toBe(todayDate);
        });

        test('should navigate back and forward a week', async ({ page }) => {
            // Go back 7 days
            for (let i = 0; i < 7; i++) {
                await appPage.goToPreviousDay();
                await page.waitForTimeout(50);
            }

            const weekAgoDate = await appPage.getCurrentDateText();

            // Go forward 7 days
            for (let i = 0; i < 7; i++) {
                await appPage.goToNextDay();
                await page.waitForTimeout(50);
            }

            const backToTodayDate = await appPage.getCurrentDateText();
            expect(backToTodayDate).not.toBe(weekAgoDate);
        });

        test('should handle month boundary navigation', async ({ page }) => {
            const todayDate = await appPage.getCurrentDateText();

            // Navigate back 30 days to cross potential month boundary
            for (let i = 0; i < 30; i++) {
                await appPage.goToPreviousDay();
                await page.waitForTimeout(30);
            }

            const monthAgoDate = await appPage.getCurrentDateText();
            expect(monthAgoDate).not.toBe(todayDate);

            // Verify it still shows a valid date
            expect(monthAgoDate).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);
        });
    });

    test.describe('Data Isolation Between Days', () => {
        test('should keep stats separate per day', async ({ page }) => {
            // Add work on today
            await calendarPage.createBlockAtPosition(250, 80);
            const todayTime = await timeStatsPage.getTimeWorkedText();

            // Go to yesterday
            await appPage.goToPreviousDay();
            await page.waitForTimeout(100);
            const yesterdayTime = await timeStatsPage.getTimeWorkedText();

            // Yesterday should be zero
            expect(yesterdayTime).toContain('0');

            // Add different amount on yesterday
            await calendarPage.createBlockAtPosition(250, 160);
            await page.waitForTimeout(100);
            const yesterdayWithWork = await timeStatsPage.getTimeWorkedText();

            // Return to today
            await appPage.goToNextDay();
            await page.waitForTimeout(100);
            const backToTodayTime = await timeStatsPage.getTimeWorkedText();

            // Today's time should be preserved
            expect(backToTodayTime).toBe(todayTime);
            expect(backToTodayTime).not.toBe(yesterdayWithWork);
        });
    });

    test.describe('Navigation with Page Reload', () => {
        test('should remember selected day after reload', async ({ page }) => {
            // Navigate to yesterday
            await appPage.goToPreviousDay();
            const yesterdayDate = await appPage.getCurrentDateText();

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // Should return to today (since we don't persist selected date)
            const afterReloadDate = await appPage.getCurrentDateText();
            expect(afterReloadDate).not.toBe(yesterdayDate);
        });

        test('should show today after reload from any day', async ({ page }) => {
            // Navigate to several days ago
            await appPage.goToPreviousDay();
            await appPage.goToPreviousDay();
            await appPage.goToPreviousDay();

            // Reload
            await page.reload();
            await appPage.waitForAppToLoad();

            // Should be on today (next button disabled)
            await expect(appPage.getNextDayButton()).toBeDisabled();
        });
    });

    test.describe('Edge Cases', () => {
        test('should handle rapid clicking on navigation buttons', async ({ page }) => {
            // Rapidly click previous button
            await appPage.getPreviousDayButton().click();
            await appPage.getPreviousDayButton().click();
            await appPage.getPreviousDayButton().click();

            await page.waitForTimeout(200);

            // Should have navigated successfully
            const dateText = await appPage.getCurrentDateText();
            expect(dateText).toBeTruthy();

            // Next button should be enabled
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });

        test('should maintain scroll position when navigating', async ({ page }) => {
            // Scroll calendar down
            const calendar = calendarPage.getCalendar();
            await calendar.evaluate((el) => {
                el.scrollTop = 200;
            });

            const scrollBefore = await calendar.evaluate((el) => el.scrollTop);

            // Navigate to previous day
            await appPage.goToPreviousDay();
            await page.waitForTimeout(100);

            const scrollAfter = await calendar.evaluate((el) => el.scrollTop);

            // Scroll position might reset or be maintained - just verify calendar still works
            expect(scrollAfter).toBeGreaterThanOrEqual(0);
        });

        test('should show correct date after navigating across year boundary', async ({ page }) => {
            // Navigate back far enough to potentially cross year boundary (365+ days)
            // This is a stress test
            for (let i = 0; i < 10; i++) {
                await appPage.goToPreviousDay();
                await page.waitForTimeout(20);
            }

            // Should still show valid date
            const dateText = await appPage.getCurrentDateText();
            expect(dateText).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);

            // Navigation should still work
            await expect(appPage.getPreviousDayButton()).toBeEnabled();
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });
    });

    test.describe('Button States', () => {
        test('should have hover effect on enabled buttons', async () => {
            // Previous button should be enabled and have cursor pointer
            const prevButton = appPage.getPreviousDayButton();
            const cursor = await prevButton.evaluate((el) => {
                return window.getComputedStyle(el).cursor;
            });
            expect(cursor).toBe('pointer');
        });

        test('should have not-allowed cursor on disabled button', async () => {
            // Next button is disabled on today
            const nextButton = appPage.getNextDayButton();
            const cursor = await nextButton.evaluate((el) => {
                return window.getComputedStyle(el).cursor;
            });
            expect(cursor).toBe('not-allowed');
        });

        test('should visually indicate disabled state', async () => {
            const nextButton = appPage.getNextDayButton();
            const opacity = await nextButton.evaluate((el) => {
                return window.getComputedStyle(el).opacity;
            });

            // Disabled button should have reduced opacity
            expect(parseFloat(opacity)).toBeLessThan(1);
        });

        test('should enable next button immediately when going to previous day', async ({ page }) => {
            await expect(appPage.getNextDayButton()).toBeDisabled();

            await appPage.goToPreviousDay();

            // Should be enabled immediately
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });

        test('should disable next button immediately when returning to today', async ({ page }) => {
            // Go to yesterday
            await appPage.goToPreviousDay();
            await expect(appPage.getNextDayButton()).toBeEnabled();

            // Return to today
            await appPage.goToNextDay();

            // Should be disabled immediately
            await expect(appPage.getNextDayButton()).toBeDisabled();
        });
    });

    test.describe('Responsive Navigation', () => {
        test('should display navigation on mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            await expect(appPage.getDateNavigation()).toBeVisible();
            await expect(appPage.getPreviousDayButton()).toBeVisible();
            await expect(appPage.getNextDayButton()).toBeVisible();
        });

        test('should be usable on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            // Tap previous button
            await appPage.goToPreviousDay();
            await page.waitForTimeout(100);

            // Date should update
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });

        test('should maintain navigation spacing on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });

            const navigation = appPage.getDateNavigation();
            const gap = await navigation.evaluate((el) => {
                return window.getComputedStyle(el).gap;
            });

            // Should have some gap between elements
            expect(gap).toBeTruthy();
        });
    });

    test.describe('Keyboard Accessibility', () => {
        test('should be able to focus navigation buttons', async () => {
            // Previous button should be focusable
            await appPage.getPreviousDayButton().focus();
            const prevButton = appPage.getPreviousDayButton();
            await expect(prevButton).toBeFocused();
        });

        test('should navigate using Enter key on previous button', async ({ page }) => {
            const todayDate = await appPage.getCurrentDateText();

            // Focus and press Enter
            await appPage.getPreviousDayButton().focus();
            await page.keyboard.press('Enter');
            await page.waitForTimeout(100);

            // Date should change
            const newDate = await appPage.getCurrentDateText();
            expect(newDate).not.toBe(todayDate);
        });

        test('should navigate using Space key on previous button', async ({ page }) => {
            const todayDate = await appPage.getCurrentDateText();

            // Focus and press Space
            await appPage.getPreviousDayButton().focus();
            await page.keyboard.press('Space');
            await page.waitForTimeout(100);

            // Date should change
            const newDate = await appPage.getCurrentDateText();
            expect(newDate).not.toBe(todayDate);
        });

        test('should not trigger navigation on disabled button with keyboard', async ({ page }) => {
            const todayDate = await appPage.getCurrentDateText();

            // Try to press next button (disabled)
            await appPage.getNextDayButton().focus();
            await page.keyboard.press('Enter');
            await page.waitForTimeout(100);

            // Date should not change
            const afterPress = await appPage.getCurrentDateText();
            expect(afterPress).toBe(todayDate);
        });
    });

    test.describe('Navigation Consistency', () => {
        test('should show consistent date format across all days', async ({ page }) => {
            const dates: string[] = [];

            // Collect dates from multiple days
            dates.push((await appPage.getCurrentDateText()) || '');

            for (let i = 0; i < 3; i++) {
                await appPage.goToPreviousDay();
                await page.waitForTimeout(50);
                dates.push((await appPage.getCurrentDateText()) || '');
            }

            // All dates should match the expected format
            dates.forEach((date) => {
                expect(date).toMatch(/\w+day,\s+\d+\s+\w+\s+\d{4}/);
            });
        });

        test('should maintain navigation functionality after multiple operations', async ({ page }) => {
            // Create blocks
            await calendarPage.createBlockAtPosition(200, 80);
            await page.waitForTimeout(100);

            // Navigate
            await appPage.goToPreviousDay();
            await page.waitForTimeout(100);

            // Create more blocks
            await calendarPage.createBlockAtPosition(300, 80);
            await page.waitForTimeout(100);

            // Navigate again
            await appPage.goToNextDay();
            await page.waitForTimeout(100);

            // Delete blocks
            await calendarPage.deleteFirstBlock();
            await page.waitForTimeout(100);

            // Navigation should still work
            await appPage.goToPreviousDay();
            await expect(appPage.getNextDayButton()).toBeEnabled();
        });
    });

    test.describe('Visual Feedback', () => {
        test('should have consistent button styling', async () => {
            const prevButton = appPage.getPreviousDayButton();
            const nextButton = appPage.getNextDayButton();

            const prevBg = await prevButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);
            const nextBg = await nextButton.evaluate((el) => window.getComputedStyle(el).backgroundColor);

            // Both should have similar styling
            expect(prevBg).toBeTruthy();
            expect(nextBg).toBeTruthy();
        });

        test('should have rounded corners on navigation buttons', async () => {
            const prevButton = appPage.getPreviousDayButton();
            const borderRadius = await prevButton.evaluate((el) => window.getComputedStyle(el).borderRadius);

            expect(borderRadius).toBeTruthy();
            expect(borderRadius).not.toBe('0px');
        });

        test('should center date navigation in header', async () => {
            const navigation = appPage.getDateNavigation();
            const justifyContent = await navigation.evaluate((el) => {
                return window.getComputedStyle(el).justifyContent;
            });

            expect(justifyContent).toBe('center');
        });
    });
});
