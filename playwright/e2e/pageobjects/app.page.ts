import { Page } from '@playwright/test';

export class AppPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getHeaderTitle() {
        return this.page.getByTestId('app-header-title');
    }

    getCurrentDate() {
        return this.page.getByTestId('app-current-date');
    }

    getAppContainer() {
        return this.page.getByTestId('app-container');
    }

    getSidebar() {
        return this.page.getByTestId('app-sidebar');
    }

    getMainContent() {
        return this.page.getByTestId('app-main-content');
    }

    getDateNavigation() {
        return this.page.getByTestId('date-navigation');
    }

    getPreviousDayButton() {
        return this.page.getByTestId('previous-day-button');
    }

    getNextDayButton() {
        return this.page.getByTestId('next-day-button');
    }

    async navigate() {
        await this.page.goto('/');
    }

    async waitForAppToLoad() {
        await this.getHeaderTitle().waitFor({ state: 'visible' });
    }

    async goToPreviousDay() {
        const currentDate = await this.getCurrentDateText();
        await this.getPreviousDayButton().click();
        // Wait for date to change
        await this.page.waitForFunction(
            (oldDate) => {
                const dateElement = document.querySelector('[data-testid="app-current-date"]');
                return dateElement?.textContent !== oldDate;
            },
            currentDate,
            { timeout: 5000 },
        );
        // Give React time to update the calendar state
        await this.page.waitForTimeout(200);
    }

    async goToNextDay() {
        const currentDate = await this.getCurrentDateText();
        await this.getNextDayButton().click();
        // Wait for date to change
        await this.page.waitForFunction(
            (oldDate) => {
                const dateElement = document.querySelector('[data-testid="app-current-date"]');
                return dateElement?.textContent !== oldDate;
            },
            currentDate,
            { timeout: 5000 },
        );
        // Give React time to update the calendar state
        await this.page.waitForTimeout(200);
    }

    async getCurrentDateText() {
        return await this.getCurrentDate().textContent();
    }
}
