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

    async navigate() {
        await this.page.goto('/');
    }

    async waitForAppToLoad() {
        await this.getHeaderTitle().waitFor({ state: 'visible' });
    }
}
