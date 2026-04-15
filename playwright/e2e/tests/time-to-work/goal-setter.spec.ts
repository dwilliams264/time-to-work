import { test, expect } from '@playwright/test';
import { AppPage } from '../../pageobjects/app.page';
import { GoalSetterPage } from '../../pageobjects/goal-setter.page';
import { CalendarPage } from '../../pageobjects/calendar.page';

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

    test('should toggle expand and collapse', { tag: ['@goal', '@ui'] }, async () => {
        await goalSetterPage.expandIfCollapsed();
        await expect(goalSetterPage.getGoalInputs()).toBeVisible();

        await goalSetterPage.getToggleButton().click();
        await expect(goalSetterPage.getGoalInputs()).not.toBeVisible();
    });

    test('should set goal with hours and minutes manually', { tag: ['@goal', '@input'] }, async () => {
        await goalSetterPage.setGoal(7, 30);
        await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h 30m');
    });

    test('should apply quick goal preset and override manual goal', { tag: ['@goal', '@preset'] }, async () => {
        await goalSetterPage.setGoal(5, 0);
        await goalSetterPage.selectQuickGoalMedium();
        await expect(goalSetterPage.getGoalSetterHeader()).toContainText('7h 30m');
    });

    test(
        'should show lunch indicator on calendar when enabled, hide when disabled',
        { tag: ['@goal', '@lunch', '@calendar'] },
        async () => {
            await goalSetterPage.enableLunch();
            await expect(calendarPage.getLunchIndicator()).toBeVisible();

            await goalSetterPage.disableLunch();
            await expect(calendarPage.getLunchIndicator()).not.toBeVisible();
        },
    );

    test('should persist goal after page reload', { tag: ['@goal', '@persistence'] }, async ({ page }) => {
        await goalSetterPage.setGoal(9, 15);
        await page.reload();

        await appPage.waitForAppToLoad();
        await expect(goalSetterPage.getGoalSetterHeader()).toContainText('9h 15m');
    });

    test('should persist lunch break state after page reload', async ({ page }) => {
        await goalSetterPage.enableLunch();
        await page.reload();

        await appPage.waitForAppToLoad();
        await goalSetterPage.expandIfCollapsed();
        await expect(goalSetterPage.getLunchCheckbox()).toBeChecked();
    });
});
