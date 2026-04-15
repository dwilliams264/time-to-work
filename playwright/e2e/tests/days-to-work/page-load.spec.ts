// spec: specs/days-to-work-plan.md
// seed: playwright/e2e/tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { DaysToWorkPage } from '../../pageobjects/days-to-work.page';

test.describe('Page Load and Calendar Display', () => {
    let daysToWorkPage: DaysToWorkPage;

    test.beforeEach(async ({ page }) => {
        daysToWorkPage = new DaysToWorkPage(page);
        await page.clock.install({ time: new Date('2026-04-15T10:00:00') });
        await daysToWorkPage.navigate();
        await daysToWorkPage.waitForLoad();
    });

    test('Default page load shows current month calendar', async ({ page }) => {
        // 1. Navigate to http://localhost:5173/
        // expect: Page title is 'Time to Work — Track your hours. Own your day.'
        await expect(page).toHaveTitle('Time to Work — Track your hours. Own your day.');

        // expect: Month navigation displays 'April 2026'
        await expect(daysToWorkPage.getMonthLabel()).toHaveText('April 2026');

        // expect: The 'Next month' button is disabled
        await expect(daysToWorkPage.getNextMonthButton()).toBeDisabled();

        // expect: The 'Previous month' button is enabled
        await expect(daysToWorkPage.getPreviousMonthButton()).toBeEnabled();

        // expect: The calendar grid shows only weekdays (Mon–Fri)
        const headers = daysToWorkPage.getWeekDayHeaders();
        await expect(headers).toHaveCount(5);
        await expect(headers.nth(0)).toHaveText('Mon');
        await expect(headers.nth(1)).toHaveText('Tue');
        await expect(headers.nth(2)).toHaveText('Wed');
        await expect(headers.nth(3)).toHaveText('Thu');
        await expect(headers.nth(4)).toHaveText('Fri');

        // expect: Working days Apr 1–15 are rendered as enabled clickable buttons showing '—'
        const wed1Apr = daysToWorkPage.getDayCell('2026-04-01');
        await expect(wed1Apr).toBeEnabled();
        await expect(wed1Apr).toContainText('—');

        const wed15Apr = daysToWorkPage.getDayCell('2026-04-15');
        await expect(wed15Apr).toBeEnabled();
        await expect(wed15Apr).toContainText('—');

        // expect: Working days Apr 16–30 are rendered as disabled buttons with no status label
        const thu16Apr = daysToWorkPage.getDayCell('2026-04-16');
        await expect(thu16Apr).toBeDisabled();
        await expect(daysToWorkPage.getDayTypeChip('2026-04-16')).not.toBeVisible();

        const thu30Apr = daysToWorkPage.getDayCell('2026-04-30');
        await expect(thu30Apr).toBeDisabled();
        await expect(daysToWorkPage.getDayTypeChip('2026-04-30')).not.toBeVisible();

        // expect: Work Schedule panel header reads '3 of 5 days in office — 60% target'
        await expect(daysToWorkPage.getSettingsHeaderSummary()).toHaveText('3 of 5 days in office \u2014 60% target');
    });
});
