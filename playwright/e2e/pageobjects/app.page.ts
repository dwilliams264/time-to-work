import { Page } from '@playwright/test';

export class AppPage {
    readonly page: Page;
    readonly headerTitle: string;
    readonly currentDate: string;
    readonly appContainer: string;
    readonly sidebar: string;
    readonly mainContent: string;

    constructor(page: Page) {
        this.page = page;
        this.headerTitle = 'h1';
        this.currentDate = '.current-date';
        this.appContainer = '.app';
        this.sidebar = '.sidebar';
        this.mainContent = '.main-content';
    }

    getHeaderTitle() {
        return this.page.locator(this.headerTitle);
    }

    getCurrentDate() {
        return this.page.locator(this.currentDate);
    }

    getAppContainer() {
        return this.page.locator(this.appContainer);
    }

    getSidebar() {
        return this.page.locator(this.sidebar);
    }

    getMainContent() {
        return this.page.locator(this.mainContent);
    }

    async navigate() {
        await this.page.goto('/');
    }

    async waitForAppToLoad() {
        await this.getHeaderTitle().waitFor({ state: 'visible' });
    }
}
