import { test, Page } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { CalendarPage } from '../pageobjects/calendar.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';
import { TimeStatsPage } from '../pageobjects/time-stats.page';

// ── Overlay helpers ───────────────────────────────────────────────────────────
// These are screencast presentation utilities, not app interactions.

/**
 * Draw a pulsing amber glow around the element identified by `testId`.
 * Scrolls the element into view first so bounding-box coordinates are valid.
 * Returns a dispose function that removes the overlay.
 */
async function highlightElement(page: Page, testId: string, label?: string): Promise<() => Promise<void>> {
    const el = page.getByTestId(testId);
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);

    const bb = await el.boundingBox();
    if (!bb) return async () => {};

    const pad = 6;
    const t = bb.y - pad;
    const l = bb.x - pad;
    const w = bb.width + pad * 2;
    const h = bb.height + pad * 2;

    const labelHtml = label
        ? `<div style="position:fixed;top:${t + h + 6}px;left:${l + w / 2}px;
               transform:translateX(-50%);background:rgba(15,15,15,0.88);color:#fff;
               padding:5px 14px;border-radius:6px;
               font:600 13px/1.4 system-ui,sans-serif;white-space:nowrap;
               letter-spacing:0.2px;z-index:10000;">${label}</div>`
        : '';

    const html = `
        <div style="position:fixed;top:${t}px;left:${l}px;width:${w}px;height:${h}px;
            border:2px solid #f59e0b;border-radius:10px;pointer-events:none;
            box-shadow:0 0 0 4px rgba(245,158,11,0.2),0 0 20px rgba(245,158,11,0.35);
            animation:hlPulse 1.2s ease-in-out infinite;z-index:9999;"></div>
        ${labelHtml}
        <style>@keyframes hlPulse{
            0%,100%{box-shadow:0 0 0 4px rgba(245,158,11,.2),0 0 20px rgba(245,158,11,.35)}
            50%{box-shadow:0 0 0 9px rgba(245,158,11,.07),0 0 32px rgba(245,158,11,.55)}
        }</style>`;

    const disposable = await page.screencast.showOverlay(html);
    return async () => {
        await disposable.dispose();
    };
}

/**
 * Show a bottom-centre pill callout that auto-removes after `duration` ms.
 */
async function showCallout(page: Page, text: string, duration = 1400): Promise<void> {
    await page.screencast.showOverlay(
        `<div style="position:fixed;bottom:28px;left:50%;transform:translateX(-50%);
            background:rgba(15,15,15,0.88);color:#fff;padding:10px 26px;
            border-radius:50px;font:600 15px/1.4 system-ui,sans-serif;
            letter-spacing:0.2px;border:1px solid rgba(255,255,255,0.12);
            white-space:nowrap;pointer-events:none;z-index:9998;">${text}</div>`,
        { duration },
    );
}

// ── Date helper ───────────────────────────────────────────────────────────────

/** Returns up to `count` recent weekday dates as YYYY-MM-DD strings, oldest first. */
function getRecentWeekdays(count: number): string[] {
    const days: string[] = [];
    const d = new Date();
    while (days.length < count) {
        if (d.getDay() !== 0 && d.getDay() !== 6) {
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            days.push(`${d.getFullYear()}-${mm}-${dd}`);
        }
        d.setDate(d.getDate() - 1);
    }
    return days.reverse();
}

// ── Test ──────────────────────────────────────────────────────────────────────
test.use({ viewport: { width: 1280, height: 800 }, video: 'off' });

test.describe('Product Demo', () => {
    let appPage: AppPage;
    let calendarPage: CalendarPage;
    let goalSetterPage: GoalSetterPage;

    test.beforeEach(async ({ page }) => {
        appPage = new AppPage(page);
        calendarPage = new CalendarPage(page);
        goalSetterPage = new GoalSetterPage(page);

        await appPage.navigate();
        await appPage.waitForAppToLoad();
    });

    test('should take a screencast of a product demo', { tag: ['@demo'] }, async ({ page }) => {
        test.setTimeout(120_000);

        // ── Start screencast ──────────────────────────────────────────────────
        await page.screencast.start({
            path: 'demo-recordings/product-demo.webm',
            size: { width: 1280, height: 800 },
        });

        // ── Intro ─────────────────────────────────────────────────────────────
        await page.screencast.showChapter('Time to Work', {
            description: 'Track your hours. Own your day.',
            duration: 3000,
        });
        await page.waitForTimeout(3200);

        // ── Set Daily Goal ────────────────────────────────────────────────────
        await page.screencast.showChapter('Set Your Daily Goal', {
            description: 'Choose how many hours you want to work today',
            duration: 2000,
        });
        await page.waitForTimeout(2200);

        // Highlight the goal-setter panel then set a 7h 30m (typical working day) goal.
        const removeGoalHighlight = await highlightElement(page, 'goal-setter-container', 'Daily Goal');
        await page.waitForTimeout(600);
        await goalSetterPage.setGoal(7, 30);
        await page.waitForTimeout(500);
        await removeGoalHighlight();

        // Enable the lunch indicator.
        const removeLunchHighlight = await highlightElement(page, 'goal-setter-lunch-checkbox', 'Include lunch break');
        await page.waitForTimeout(600);
        await goalSetterPage.enableLunch();
        await page.waitForTimeout(500);
        await removeLunchHighlight();

        // ── Add Work Sessions ─────────────────────────────────────────────────
        await page.screencast.showChapter('Add Your Work Sessions', {
            description: 'Drag on the calendar to log your time',
            duration: 2000,
        });
        await page.waitForTimeout(2200);

        // Highlight the calendar before the first drag.
        const removeCalHighlight = await highlightElement(page, 'calendar-grid', 'Drag to create time blocks');
        await page.waitForTimeout(800);
        await removeCalHighlight();

        // Block 1: 7 AM - 9 AM  (2 h)
        await showCallout(page, '☀️  Morning session  ·  5:30 AM - 7 AM');
        await calendarPage.createBlockAtPosition(50, 120);
        await page.waitForTimeout(1000);

        // Block 2: 9:30 AM - 11 AM  (1.5 h)
        await showCallout(page, '🌤  Morning session  ·  7:15 AM - 8:45 AM');
        await calendarPage.createBlockAtPosition(200, 120);
        await page.waitForTimeout(1000);

        // Scroll back to top so the stats panel is fully in view.
        await calendarPage.getCalendar().scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);

        // Spotlight the stats panel reacting live to the blocks.
        const removeStatsHighlight = await highlightElement(page, 'time-stats-container', 'Live progress tracking');
        await page.waitForTimeout(1000);
        await removeStatsHighlight();

        await page.screencast.showChapter('Work Logged! 🎉', {
            description: '3 hours tracked!',
            duration: 2500,
        });

        await page.waitForTimeout(2700);

        // ── Navigate to Days to Work ──────────────────────────────────────────
        const removeNavHighlight = await highlightElement(page, 'nav-days-to-work', 'Switch to attendance tracking');
        await page.waitForTimeout(700);
        await removeNavHighlight();
        await page.getByTestId('nav-days-to-work').click();
        await page.waitForTimeout(1000);

        // ── Track Office Attendance ───────────────────────────────────────────
        await page.screencast.showChapter('Track Your Office Attendance', {
            description: 'Log how you work each day of the month',
            duration: 2000,
        });
        await page.waitForTimeout(2200);

        const removeWeekGridHighlight = await highlightElement(page, 'week-grid', 'Click a day to set its type');
        await page.waitForTimeout(700);
        await removeWeekGridHighlight();

        // Mark the 6 most-recent weekdays with a variety of types.
        // Cycle: office(1 click), office(1), wfh(2), annual-leave(3), office(1), office(1)
        const weekdays = getRecentWeekdays(6);
        const clickCounts = [1, 1, 2, 3, 1, 1];

        for (let i = 0; i < weekdays.length; i++) {
            const cell = page.getByTestId(`day-cell-${weekdays[i]}`);
            await cell.scrollIntoViewIfNeeded();
            await page.waitForTimeout(100);
            for (let c = 0; c < clickCounts[i]; c++) {
                await cell.click();
                await page.waitForTimeout(150);
            }
            await page.waitForTimeout(350);
        }
        await page.waitForTimeout(600);

        // ── Configure Target ──────────────────────────────────────────────────
        await page.screencast.showChapter('Configure Your Target', {
            description: "Set how many days per week you're in the office",
            duration: 2000,
        });
        await page.waitForTimeout(2200);

        const removeSettingsHighlight = await highlightElement(
            page,
            'attendance-settings-container',
            'Attendance settings',
        );
        await page.waitForTimeout(500);
        await page.getByTestId('attendance-settings-header').click();
        await page.waitForTimeout(500);
        await removeSettingsHighlight();

        const removeDaysHighlight = await highlightElement(page, 'days-per-week-selector', 'Days per week');
        await page.waitForTimeout(300);
        await page.getByTestId('days-button-5').click();
        await page.waitForTimeout(400);
        await removeDaysHighlight();

        const removeOfficeDaysHighlight = await highlightElement(page, 'office-days-selector', 'Days in office target');
        await page.waitForTimeout(300);
        await page.getByTestId('office-days-button-3').click();
        await page.waitForTimeout(500);
        await removeOfficeDaysHighlight();

        // ── Attendance Stats Overview ─────────────────────────────────────────
        await page.screencast.showChapter('Your Attendance at a Glance', {
            description: 'Track your YTD, monthly, and weekly stats',
            duration: 2000,
        });
        await page.waitForTimeout(2200);

        const removeAttStatsHighlight = await highlightElement(
            page,
            'attendance-stats-container',
            'Live attendance stats',
        );
        await page.waitForTimeout(600);
        await removeAttStatsHighlight();

        await page.getByTestId('stats-tab-month').scrollIntoViewIfNeeded();
        await page.getByTestId('stats-tab-month').click();
        await page.waitForTimeout(700);
        await page.getByTestId('stats-tab-ytd').click();
        await page.waitForTimeout(700);
        await page.getByTestId('stats-tab-week').click();
        await page.waitForTimeout(700);

        // ── Outro ─────────────────────────────────────────────────────────────
        await page.screencast.showChapter('Time to Work', {
            description: 'Track your hours. Own your day.',
            duration: 3500,
        });
        await page.waitForTimeout(3700);

        await page.screencast.stop();
    });
});
