import { Page } from '@playwright/test';

export class TimeStatsPage {
    readonly page: Page;
    readonly timeStatsContainer: string;
    readonly statCards: string;
    readonly timeWorkedCard: string;
    readonly timeWorkedValue: string;
    readonly remainingCard: string;
    readonly remainingValue: string;
    readonly overGoalCard: string;
    readonly overGoalValue: string;
    readonly progressBar: string;
    readonly progressFill: string;
    readonly completionMessage: string;
    readonly goalBreakdown: string;

    constructor(page: Page) {
        this.page = page;
        this.timeStatsContainer = '.time-stats';
        this.statCards = '.stat-card';
        this.timeWorkedCard = '.stat-card:has-text("Time Worked")';
        this.timeWorkedValue = '.stat-card:has-text("Time Worked") .stat-value';
        this.remainingCard = '.stat-card:has-text("Remaining")';
        this.remainingValue = '.stat-card:has-text("Remaining") .stat-value';
        this.overGoalCard = '.stat-card:has-text("Over Goal")';
        this.overGoalValue = '.stat-card:has-text("Over Goal") .stat-value';
        this.progressBar = '.progress-bar';
        this.progressFill = '.progress-fill';
        this.completionMessage = '.completion-message';
        this.goalBreakdown = '.goal-breakdown';
    }

    getTimeStatsContainer() {
        return this.page.locator(this.timeStatsContainer);
    }

    getStatCards() {
        return this.page.locator(this.statCards);
    }

    getTimeWorkedCard() {
        return this.page.locator(this.timeWorkedCard);
    }

    getTimeWorkedValue() {
        return this.page.locator(this.timeWorkedValue);
    }

    getRemainingCard() {
        return this.page.locator(this.remainingCard);
    }

    getRemainingValue() {
        return this.page.locator(this.remainingValue);
    }

    getOverGoalCard() {
        return this.page.locator(this.overGoalCard);
    }

    getOverGoalValue() {
        return this.page.locator(this.overGoalValue);
    }

    getProgressBar() {
        return this.page.locator(this.progressBar);
    }

    getProgressFill() {
        return this.page.locator(this.progressFill);
    }

    getCompletionMessage() {
        return this.page.locator(this.completionMessage);
    }

    getGoalBreakdown() {
        return this.page.locator(this.goalBreakdown);
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
