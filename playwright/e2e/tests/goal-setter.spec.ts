import { test, expect } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';
import { CalendarPage } from '../pageobjects/calendar.page';

test.describe('Goal Setter', () => {
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

    test.describe('Goal Display', () => {
        test('should display default goal in header', async () => {
            await expect(goalSetterPage.getGoalSetterHeader()).toBeVisible();
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('Daily Goal');
        });

        test('should display toggle button', async () => {
            await expect(goalSetterPage.getToggleButton()).toBeVisible();
        });

        test('should expand when toggle button is clicked', async () => {
            // Initially might be collapsed
            const isVisible = await goalSetterPage
                .getGoalInputs()
                .isVisible()
                .catch(() => false);

            if (!isVisible) {
                await goalSetterPage.getToggleButton().click();
                await expect(goalSetterPage.getGoalInputs()).toBeVisible();
            }
        });

        test('should collapse when toggle button is clicked twice', async () => {
            // Expand if collapsed
            await goalSetterPage.expandIfCollapsed();
            await expect(goalSetterPage.getGoalInputs()).toBeVisible();

            // Collapse
            await goalSetterPage.getToggleButton().click();
            await expect(goalSetterPage.getGoalInputs()).not.toBeVisible();
        });
    });

    test.describe('Manual Goal Setting', () => {
        test('should set goal to 8 hours', async () => {
            await goalSetterPage.setGoal(8, 0);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('8h');
        });

        test('should set goal with hours and minutes', async () => {
            await goalSetterPage.setGoal(7, 30);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h 30m');
        });

        test('should set goal with only minutes', async () => {
            await goalSetterPage.setGoal(0, 45);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('45m');
        });

        test('should update goal when hours input changes', async () => {
            await goalSetterPage.expandIfCollapsed();

            await goalSetterPage.getHoursInput().fill('6');
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('6h');
        });

        test('should update goal when minutes input changes', async () => {
            await goalSetterPage.expandIfCollapsed();

            await goalSetterPage.getMinutesInput().fill('15');
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('15m');
        });

        test('should handle maximum goal values', async () => {
            await goalSetterPage.setGoal(24, 0);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('24h');
        });
    });

    test.describe('Quick Goal Presets', () => {
        test('should set goal to 8.5 hours using preset', async () => {
            await goalSetterPage.selectQuickGoalLong();
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('8h 30m');
        });

        test('should set goal to 7.5 hours using preset', async () => {
            await goalSetterPage.selectQuickGoalMedium();
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h 30m');
        });

        test('should set goal to 6.5 hours using preset', async () => {
            await goalSetterPage.selectQuickGoalShort();
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('6h 30m');
        });

        test('should display all three quick goal buttons', async () => {
            await goalSetterPage.expandIfCollapsed();

            await expect(goalSetterPage.getQuickGoalLongButton()).toBeVisible();
            await expect(goalSetterPage.getQuickGoalMediumButton()).toBeVisible();
            await expect(goalSetterPage.getQuickGoalShortButton()).toBeVisible();
        });

        test('should override manual goal with preset', async () => {
            // Set manual goal first
            await goalSetterPage.setGoal(5, 0);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('5h');

            // Use preset
            await goalSetterPage.selectQuickGoalMedium();
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h 30m');
        });
    });

    test.describe('Lunch Break', () => {
        test('should display lunch break checkbox', async () => {
            await goalSetterPage.expandIfCollapsed();
            await expect(goalSetterPage.getLunchCheckbox()).toBeVisible();
        });

        test('should enable lunch break', async () => {
            await goalSetterPage.enableLunch();

            // Lunch inputs should be visible
            await expect(goalSetterPage.getLunchInputs()).toBeVisible();
        });

        test('should display lunch indicator on calendar when enabled', async () => {
            await goalSetterPage.enableLunch();

            // Lunch indicator should appear on calendar
            await expect(calendarPage.getLunchIndicator()).toBeVisible();
        });

        test('should hide lunch indicator when disabled', async () => {
            // Enable first
            await goalSetterPage.enableLunch();
            await expect(calendarPage.getLunchIndicator()).toBeVisible();

            // Disable
            await goalSetterPage.disableLunch();
            await expect(calendarPage.getLunchIndicator()).not.toBeVisible();
        });

        test('should hide lunch inputs when checkbox is unchecked', async () => {
            // Enable first
            await goalSetterPage.enableLunch();
            await expect(goalSetterPage.getLunchInputs()).toBeVisible();

            // Disable
            await goalSetterPage.disableLunch();
            await expect(goalSetterPage.getLunchInputs()).not.toBeVisible();
        });

        test('should remember lunch break state when collapsed and expanded', async () => {
            // Enable lunch
            await goalSetterPage.enableLunch();

            // Collapse goal setter
            await goalSetterPage.getToggleButton().click();

            // Expand again
            await goalSetterPage.getToggleButton().click();

            // Lunch should still be checked
            await expect(goalSetterPage.getLunchCheckbox()).toBeChecked();
        });
    });

    test.describe('Goal Persistence', () => {
        test('should persist goal after page reload', async ({ page }) => {
            // Set a goal
            await goalSetterPage.setGoal(9, 15);
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('9h 15m');

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // Goal should still be set
            await expect(goalSetterPage.getGoalSetterHeader()).toContainText('9h 15m');
        });

        test('should persist lunch break state after page reload', async ({ page }) => {
            // Enable lunch
            await goalSetterPage.enableLunch();

            // Reload page
            await page.reload();
            await appPage.waitForAppToLoad();

            // Lunch should still be enabled
            await goalSetterPage.expandIfCollapsed();
            await expect(goalSetterPage.getLunchCheckbox()).toBeChecked();
        });
    });
});
