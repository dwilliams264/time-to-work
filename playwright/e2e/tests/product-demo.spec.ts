import { test, Page } from '@playwright/test';
import { AppPage } from '../pageobjects/app.page';
import { CalendarPage } from '../pageobjects/calendar.page';
import { GoalSetterPage } from '../pageobjects/goal-setter.page';

// ── Calendar helpers ──────────────────────────────────────────────────────────
const HOURS_START = 5; // must match src/constants/time.ts
const HOUR_HEIGHT = 80; // px

function hourToOffset(hour: number): number {
    return (hour - HOURS_START) * HOUR_HEIGHT;
}

/** Scroll the page so that `offset` pixels from the calendar top sits at `targetY` in the viewport. */
async function scrollCalendarTo(page: Page, offset: number, targetY = 180): Promise<void> {
    const bb = await page.getByTestId('calendar-grid').boundingBox();
    if (!bb) return;
    const delta = bb.y + offset - targetY;
    if (Math.abs(delta) > 40) {
        await page.evaluate((d) => window.scrollBy(0, d), delta);
    }
}

/** Drag to create a time block between two clock hours (e.g. 9, 12 for 9 AM – 12 PM). */
async function createDemoBlock(page: Page, startHour: number, endHour: number): Promise<void> {
    const startOffset = hourToOffset(startHour);
    const endOffset = hourToOffset(endHour);

    await scrollCalendarTo(page, startOffset);

    const bb = await page.getByTestId('calendar-grid').boundingBox();
    if (!bb) throw new Error('calendar-grid bounding box not found');

    const cx = bb.x + bb.width / 2;
    await page.mouse.move(cx, bb.y + startOffset);
    await page.mouse.down();
    await page.mouse.move(cx, bb.y + endOffset, { steps: 10 });
    await page.mouse.up();
}

/** Returns up to `count` recent weekday dates as YYYY-MM-DD strings, newest first. */
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
    return days;
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
        await page.screencast.showActions({ duration: 800, fontSize: 20, position: 'bottom' });

        await page.screencast.showChapter('Time to Work', {
            description: 'Track your hours. Own your day.',
            duration: 3000,
        });
        await page.waitForTimeout(3200);

        // ── Time to Work: Set goal ────────────────────────────────────────────
        await page.screencast.showChapter('Set Your Daily Goal', {
            description: 'Choose how many hours you want to work today',
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        await goalSetterPage.selectQuickGoalLong(); // 8.5 h
        await page.waitForTimeout(800);
        await goalSetterPage.enableLunch();
        await page.waitForTimeout(800);

        // ── Time to Work: Add sessions ────────────────────────────────────────
        await page.screencast.showChapter('Add Your Work Sessions', {
            description: 'Drag on the calendar to log your time',
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        // Morning block:   8 AM – 12 PM  (4 h)
        await createDemoBlock(page, 8, 12);
        await page.waitForTimeout(1200);

        // Afternoon block: 1 PM –  5 PM  (4 h)
        await createDemoBlock(page, 13, 17);
        await page.waitForTimeout(1200);

        // Evening block:   6 PM –  7 PM  (1 h) → total 9 h, goal exceeded
        await createDemoBlock(page, 18, 19);
        await page.waitForTimeout(1500);

        await page.screencast.showChapter('Goal Achieved! 🎉', {
            description: '9 hours tracked — goal smashed!',
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        // ── Days to Work ──────────────────────────────────────────────────────
        await page.getByTestId('nav-days-to-work').click();
        await page.waitForTimeout(1000);

        await page.screencast.showChapter('Track Your Office Attendance', {
            description: 'Log how you work each day of the month',
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        // Click the 6 most-recent weekdays in chronological order.
        // Click counts cycle through: office(1) → wfh(2) → annual-leave(3)
        const weekdays = getRecentWeekdays(6).reverse();
        const clickCounts = [1, 1, 2, 3, 1, 1];

        for (let i = 0; i < weekdays.length; i++) {
            const cell = page.getByTestId(`day-cell-${weekdays[i]}`);
            for (let c = 0; c < clickCounts[i]; c++) {
                await cell.click();
                await page.waitForTimeout(200);
            }
            await page.waitForTimeout(500);
        }
        await page.waitForTimeout(800);

        // ── Days to Work: Configure target ────────────────────────────────────
        await page.screencast.showChapter('Configure Your Target', {
            description: "Set how many days per week you're in the office",
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        await page.getByTestId('attendance-settings-header').click();
        await page.waitForTimeout(600);
        await page.getByTestId('days-button-5').click();
        await page.waitForTimeout(500);
        await page.getByTestId('office-days-button-3').click();
        await page.waitForTimeout(800);

        // ── Days to Work: Stats overview ──────────────────────────────────────
        await page.screencast.showChapter('Your Attendance at a Glance', {
            description: 'Track your YTD, monthly, and weekly stats',
            duration: 2500,
        });
        await page.waitForTimeout(2700);

        await page.getByTestId('stats-tab-month').click();
        await page.waitForTimeout(800);
        await page.getByTestId('stats-tab-ytd').click();
        await page.waitForTimeout(800);
        await page.getByTestId('stats-tab-week').click();
        await page.waitForTimeout(800);

        // ── Outro ─────────────────────────────────────────────────────────────
        await page.screencast.showChapter('Time to Work', {
            description: 'Track your hours. Own your day.',
            duration: 3500,
        });
        await page.waitForTimeout(3700);

        await page.screencast.stop();
    });
});
