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

    test('Clicking a day cycles through all statuses and returns to unset', async () => {
        const dayCell = daysToWorkPage.getDayCell('2026-04-01');
        const dayTypeChip = daysToWorkPage.getDayTypeChip('2026-04-01');
        const aprYtdPct = daysToWorkPage.getYtdBarPct('apr');

        // 1. Navigate to http://localhost:5173/
        // expect: Page loads showing April 2026
        await expect(daysToWorkPage.getMonthLabel()).toHaveText('April 2026');

        // 2. Click the 'Wed 1 Apr' day button once
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Office'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Office');
        // expect: Day cell shows 'Office' status label
        await expect(dayTypeChip).toHaveText('Office');
        // expect: April attendance % in Year to Date chart updates to approximately 9%
        await expect(aprYtdPct).toHaveText('9%');

        // 3. Click the 'Wed 1 Apr' day button a second time
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Work From Home'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Work From Home');
        // expect: Day cell shows 'WFH' status label
        await expect(dayTypeChip).toHaveText('WFH');
        // expect: April attendance % resets to 0% (WFH does not count toward office attendance)
        await expect(aprYtdPct).toHaveText('0%');

        // 4. Click the 'Wed 1 Apr' day button a third time
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Annual Leave'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Annual Leave');
        // expect: Day cell shows 'Leave' status label
        await expect(dayTypeChip).toHaveText('Leave');

        // 5. Click the 'Wed 1 Apr' day button a fourth time
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Offsite / Conference'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Offsite / Conference');
        // expect: Day cell shows 'Offsite' status label
        await expect(dayTypeChip).toHaveText('Offsite');
        // expect: April attendance % updates (Offsite counts toward office attendance)
        await expect(aprYtdPct).toHaveText('9%');

        // 6. Click the 'Wed 1 Apr' day button a fifth time
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Sick Leave'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Sick Leave');
        // expect: Day cell shows 'Sick' status label
        await expect(dayTypeChip).toHaveText('Sick');
        // expect: April attendance % resets to 0%
        await expect(aprYtdPct).toHaveText('0%');

        // 7. Click the 'Wed 1 Apr' day button a sixth time
        await dayCell.click();
        // expect: Button label updates to 'Wed 1 Apr: Public Holiday'
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr: Public Holiday');
        // expect: Day cell shows 'Holiday' status label
        await expect(dayTypeChip).toHaveText('Holiday');

        // 8. Click the 'Wed 1 Apr' day button a seventh time
        await dayCell.click();
        // expect: Day cell returns to blank/unset state, showing '—'
        await expect(dayCell).toContainText('—');
        // expect: Button label has no status suffix
        await expect(dayCell).toHaveAttribute('aria-label', 'Wed 1 Apr');
        // expect: April attendance % is 0%
        await expect(aprYtdPct).toHaveText('0%');
    });
});
