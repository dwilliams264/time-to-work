import { Page } from '@playwright/test';

export class DaysToWorkPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Month navigation
    getMonthLabel() {
        return this.page.getByTestId('week-grid-label');
    }

    getPreviousMonthButton() {
        return this.page.getByRole('button', { name: 'Previous month' });
    }

    getNextMonthButton() {
        return this.page.getByRole('button', { name: 'Next month' });
    }

    // Calendar grid
    getWeekGrid() {
        return this.page.getByTestId('week-grid');
    }

    getWeekDayHeaders() {
        return this.page.locator('.week-grid-dow-header');
    }

    getDayCell(dateStr: string) {
        return this.page.getByTestId(`day-cell-${dateStr}`);
    }

    getDayTypeChip(dateStr: string) {
        return this.page.getByTestId(`day-type-chip-${dateStr}`);
    }

    // Work Schedule settings panel
    getSettingsContainer() {
        return this.page.getByTestId('attendance-settings-container');
    }

    getSettingsHeader() {
        return this.page.getByTestId('attendance-settings-header');
    }

    getSettingsHeaderSummary() {
        return this.page.getByTestId('attendance-settings-header').locator('.settings-header-summary');
    }

    getSettingsToggle() {
        return this.page.getByTestId('attendance-settings-toggle');
    }

    getSettingsBody() {
        return this.page.getByTestId('attendance-settings-body');
    }

    getDaysPerWeekButton(days: number) {
        return this.page.getByTestId(`days-button-${days}`);
    }

    getOfficeDaysButton(days: number) {
        return this.page.getByTestId(`office-days-button-${days}`);
    }

    getSettingsTargetNote() {
        return this.page.getByTestId('settings-target-note');
    }

    // Attendance stats
    getStatsContainer() {
        return this.page.getByTestId('attendance-stats-container');
    }

    getStatsTab(period: 'ytd' | 'month' | 'week') {
        return this.page.getByTestId(`stats-tab-${period}`);
    }

    getYtdBarPct(month: string) {
        return this.page.getByTestId(`ytd-bar-${month}`).locator('.ytd-pct');
    }

    getAttendanceTargetBadge() {
        return this.page.getByTestId('attendance-target-badge');
    }

    getStatAttendanceDays() {
        return this.page.getByTestId('stat-attendance-days');
    }

    getStatAvailableDays() {
        return this.page.getByTestId('stat-available-days');
    }

    getStatWfhDays() {
        return this.page.getByTestId('stat-wfh-days');
    }

    getStatLeaveDays() {
        return this.page.getByTestId('stat-leave-days');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async waitForLoad() {
        await this.getMonthLabel().waitFor({ state: 'visible' });
    }

    async expandSettings() {
        const isExpanded = await this.getSettingsBody().isVisible().catch(() => false);
        if (!isExpanded) {
            await this.getSettingsToggle().click();
        }
    }
}
