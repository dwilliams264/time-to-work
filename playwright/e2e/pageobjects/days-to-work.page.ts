import { Page } from '@playwright/test';

export class DaysToWorkPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigate() {
        await this.page.goto('/');
    }

    async waitForLoad() {
        await this.page.getByTestId('week-grid').waitFor({ state: 'visible' });
    }

    getContent() {
        return this.page.getByTestId('days-to-work-content');
    }

    getWeekGrid() {
        return this.page.getByTestId('week-grid');
    }

    getWeekLabel() {
        return this.page.getByTestId('week-grid-label');
    }

    getPrevWeekButton() {
        return this.page.getByTestId('week-grid-prev');
    }

    getNextWeekButton() {
        return this.page.getByTestId('week-grid-next');
    }

    getAttendanceSettings() {
        return this.page.getByTestId('attendance-settings-container');
    }

    getAttendanceStats() {
        return this.page.getByTestId('attendance-stats-container');
    }

    getDayCell(dateStr: string) {
        return this.page.getByTestId(`day-cell-${dateStr}`);
    }

    getDayTypeChip(dateStr: string) {
        return this.page.getByTestId(`day-type-chip-${dateStr}`);
    }

    getStatPct() {
        return this.page.getByTestId('attendance-stat-pct');
    }

    getTargetBadge() {
        return this.page.getByTestId('attendance-target-badge');
    }

    getSidebarNav() {
        return this.page.getByTestId('days-to-work-sidebar');
    }

    getNavLink(testId: string) {
        return this.page.getByTestId(testId);
    }

    async clickDayCell(dateStr: string) {
        await this.getDayCell(dateStr).click();
    }

    async getStatTabButton(period: 'week' | 'month' | 'ytd') {
        return this.page.getByTestId(`stats-tab-${period}`);
    }
}
