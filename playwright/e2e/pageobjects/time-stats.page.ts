import { Page } from '@playwright/test';

export class TimeStatsPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getTimeStatsContainer() {
        return this.page.getByTestId('time-stats-container');
    }

    getMobileSummaryBar() {
        return this.page.getByTestId('time-stats-mobile-bar');
    }

    getStatCards() {
        return this.page.locator('.stat-card');
    }

    getTimeWorkedCard() {
        return this.page.getByTestId('time-stats-time-worked');
    }

    getTimeWorkedValue() {
        return this.page
            .getByTestId('time-stats-time-worked')
            .locator('.stat-value')
            .or(this.page.getByTestId('time-stats-mobile-bar').locator('.mobile-summary-value'));
    }

    getRemainingCard() {
        return this.page.getByTestId('time-stats-remaining');
    }

    getRemainingValue() {
        return this.page.getByTestId('time-stats-remaining').locator('.stat-value');
    }

    getOverGoalCard() {
        return this.page.getByTestId('time-stats-over-goal');
    }

    getOverGoalValue() {
        return this.page.getByTestId('time-stats-over-goal').locator('.stat-value');
    }

    getProgressBar() {
        return this.page.getByTestId('time-stats-progress-bar');
    }

    getProgressFill() {
        return this.page.getByTestId('time-stats-progress-fill');
    }

    getCompletionMessage() {
        return this.page.getByTestId('time-stats-completion-message');
    }

    getGoalBreakdown() {
        return this.page.getByTestId('time-stats-goal-breakdown');
    }

    async getTimeWorkedText() {
        return await this.getTimeWorkedValue().textContent();
    }

    async getRemainingText() {
        return await this.getRemainingValue().textContent();
    }

    async isGoalComplete() {
        return await this.getCompletionMessage()
            .isVisible()
            .catch(() => false);
    }
}
