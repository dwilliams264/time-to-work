import { test, expect } from '@playwright/test';
import { DaysToWorkPage } from '../pageobjects/days-to-work.page';
import { AppPage } from '../pageobjects/app.page';

function getTodayDateStr(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getMondayDateStr(): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dow = now.getDay();
    const diff = dow === 0 ? -6 : 1 - dow;
    now.setDate(now.getDate() + diff);
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

test.describe('Days to Work', () => {
    let daysToWorkPage: DaysToWorkPage;
    let appPage: AppPage;

    test.beforeEach(async ({ page }) => {
        daysToWorkPage = new DaysToWorkPage(page);
        appPage = new AppPage(page);

        // Clear localStorage before each test
        await page.goto('/');
        await page.evaluate(() => {
            Object.keys(localStorage)
                .filter((k) => k.startsWith('daysToWork_'))
                .forEach((k) => localStorage.removeItem(k));
        });

        await daysToWorkPage.navigate();
        await daysToWorkPage.waitForLoad();
    });

    test('should navigate to Days to Work via header tab', async ({ page }) => {
        await page.goto('/time-to-work');
        await page.getByTestId('nav-days-to-work').click();
        await daysToWorkPage.waitForLoad();
        await expect(daysToWorkPage.getWeekGrid()).toBeVisible();
    });

    test('should display all main components', async () => {
        await expect(daysToWorkPage.getWeekGrid()).toBeVisible();
        await expect(daysToWorkPage.getAttendanceSettings()).toBeVisible();
        await expect(daysToWorkPage.getAttendanceStats()).toBeVisible();
    });

    test('should display the current week label', async () => {
        await expect(daysToWorkPage.getWeekLabel()).toBeVisible();
        const label = await daysToWorkPage.getWeekLabel().textContent();
        expect(label).toMatch(/\d{1,2}\s+\w+\s*[–-]\s*\d{1,2}\s+\w+\s+\d{4}/);
    });

    test('should cycle day type on click and persist after reload', async ({ page }) => {
        const today = getTodayDateStr();
        const cell = daysToWorkPage.getDayCell(today);
        await expect(cell).toBeVisible();

        // Click once: should become office
        await cell.click();
        await expect(daysToWorkPage.getDayTypeChip(today)).toBeVisible();
        await expect(daysToWorkPage.getDayTypeChip(today)).toContainText('Office');

        // Reload and verify persistence
        await page.reload();
        await daysToWorkPage.waitForLoad();
        await expect(daysToWorkPage.getDayTypeChip(today)).toContainText('Office');
    });

    test('should update attendance stats when day type changes', async () => {
        const today = getTodayDateStr();
        const statPct = daysToWorkPage.getStatPct();

        // Click stats tab to week view for immediate feedback
        await (await daysToWorkPage.getStatTabButton('week')).click();

        const initialPct = await statPct.textContent();

        // Mark today as office
        await daysToWorkPage.clickDayCell(today);
        await expect(daysToWorkPage.getDayTypeChip(today)).toContainText('Office');

        // Stats should update (percentage may change)
        // Just verify the stat card is still rendered
        await expect(statPct).toBeVisible();
        const updatedPct = await statPct.textContent();
        // If today is a weekday, the percentage should have increased
        const todayDow = new Date().getDay();
        if (todayDow >= 1 && todayDow <= 5) {
            expect(updatedPct).not.toBe(initialPct);
        }
    });

    test('should disable future day cells', async ({ page }) => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        // Tomorrow is only visible if it's in the same week (Mon–Fri)
        if (tomorrow.getDay() >= 1 && tomorrow.getDay() <= 5) {
            const yyyy = tomorrow.getFullYear();
            const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const dd = String(tomorrow.getDate()).padStart(2, '0');
            const tomorrowStr = `${yyyy}-${mm}-${dd}`;
            const cell = daysToWorkPage.getDayCell(tomorrowStr);
            if (await cell.isVisible()) {
                await expect(cell).toHaveClass(/day-cell-disabled/);
            }
        }
    });

    test('should navigate to previous week', async () => {
        const initialLabel = await daysToWorkPage.getWeekLabel().textContent();
        await daysToWorkPage.getPrevWeekButton().click();
        const newLabel = await daysToWorkPage.getWeekLabel().textContent();
        expect(newLabel).not.toBe(initialLabel);
    });

    test('should not navigate forward from current week', async () => {
        await expect(daysToWorkPage.getNextWeekButton()).toBeDisabled();
    });

    test('should persist settings change', async ({ page }) => {
        const toggle = page.getByTestId('attendance-settings-toggle');
        await toggle.click();

        const btn4 = page.getByTestId('days-button-4');
        await btn4.click();
        await expect(btn4).toHaveClass(/active/);

        // Reload and verify
        await page.reload();
        await daysToWorkPage.waitForLoad();
        await page.getByTestId('attendance-settings-toggle').click();
        await expect(page.getByTestId('days-button-4')).toHaveClass(/active/);
    });

    test('regression: Days to Work page renders at /', async ({ page }) => {
        await page.goto('/');
        await daysToWorkPage.waitForLoad();
        await expect(appPage.getHeaderTitle()).toBeVisible();
        await expect(appPage.getHeaderTitle()).toContainText('Days to Work');
        await expect(daysToWorkPage.getWeekGrid()).toBeVisible();
    });

    test('regression: switching between pages works', async ({ page }) => {
        await page.goto('/');
        await daysToWorkPage.waitForLoad();
        await expect(daysToWorkPage.getWeekGrid()).toBeVisible();

        // Navigate to Time to Work
        await page.getByTestId('nav-time-to-work').click();
        await expect(page.getByTestId('date-navigation')).toBeVisible();

        // Navigate back to Days to Work
        await page.getByTestId('nav-days-to-work').click();
        await daysToWorkPage.waitForLoad();
        await expect(daysToWorkPage.getWeekGrid()).toBeVisible();
    });
});
