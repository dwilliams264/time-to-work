// spec: specs/days-to-work-plan.md
// seed: playwright/e2e/tests/seed.spec.ts

import { test, expect } from '@playwright/test';
import { DaysToWorkPage } from '../../pageobjects/days-to-work.page';

test.describe('Day Status Cycling', () => {
    let daysToWorkPage: DaysToWorkPage;

    test.beforeEach(async ({ page }) => {
        daysToWorkPage = new DaysToWorkPage(page);
        await page.clock.install({ time: new Date('2026-04-15T10:00:00') });
        await daysToWorkPage.navigate();
        await daysToWorkPage.waitForLoad();
    });

    test('Future days in the current month cannot be clicked', async () => {
        // 1. Navigate to http://localhost:5173/
        // expect: Page loads showing April 2026
        await expect(daysToWorkPage.getMonthLabel()).toHaveText('April 2026');

        // 2. Observe the 'Thu 16 Apr' day button
        const thu16Apr = daysToWorkPage.getDayCell('2026-04-16');
        // expect: Button is rendered as disabled and shows no status label
        await expect(thu16Apr).toBeDisabled();
        await expect(daysToWorkPage.getDayTypeChip('2026-04-16')).not.toBeVisible();

        // 3. Attempt to click the disabled 'Thu 16 Apr' day button
        await thu16Apr.click({ force: true });
        // expect: No state change occurs
        await expect(thu16Apr).toHaveAttribute('aria-label', 'Thu 16 Apr');
        // expect: The button remains disabled
        await expect(thu16Apr).toBeDisabled();
        // expect: Stats and attendance percentage are unchanged
        await expect(daysToWorkPage.getYtdBarPct('apr')).toHaveText('0%');

        // 4. Attempt to click the disabled 'Thu 30 Apr' day button
        const thu30Apr = daysToWorkPage.getDayCell('2026-04-30');
        await expect(thu30Apr).toBeDisabled();
        await thu30Apr.click({ force: true });
        // expect: No state change occurs
        await expect(thu30Apr).toHaveAttribute('aria-label', 'Thu 30 Apr');
        // expect: The button remains disabled
        await expect(thu30Apr).toBeDisabled();
    });
});
