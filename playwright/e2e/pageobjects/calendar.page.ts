import { Page } from '@playwright/test';

export class CalendarPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getCalendarContainer() {
        return this.page.getByTestId('calendar-container');
    }

    getCalendarHeader() {
        return this.page.getByTestId('calendar-header');
    }

    getCalendarTitle() {
        return this.page.getByTestId('calendar-title');
    }

    getClearAllButton() {
        return this.page.getByTestId('calendar-clear-all');
    }

    getCalendarHint() {
        return this.page.getByTestId('calendar-hint');
    }

    getCalendar() {
        return this.page.getByTestId('calendar-grid');
    }

    getHourRows() {
        return this.page.locator('.hour-row');
    }

    getTimeBlocks() {
        return this.page.getByTestId('calendar-time-block');
    }

    getTimeBlock() {
        return this.page.getByTestId('calendar-time-block');
    }

    getTimeBlockContent() {
        return this.page.getByTestId('calendar-time-block-content');
    }

    getTimeBlockDeleteButton() {
        return this.page.getByTestId('calendar-time-block-delete');
    }

    getLunchIndicator() {
        return this.page.getByTestId('calendar-lunch-indicator');
    }

    getCurrentTimeLine() {
        return this.page.getByTestId('calendar-current-time-line');
    }

    getCurrentTimeIndicator() {
        return this.page.getByTestId('calendar-current-time-indicator');
    }

    getPreviewBlock() {
        return this.page.getByTestId('calendar-preview-block');
    }

    async clearAllBlocks() {
        await this.getClearAllButton().click();
    }

    async deleteFirstBlock() {
        await this.getTimeBlockDeleteButton().first().click();
    }

    async getTimeBlockCount() {
        return await this.getTimeBlocks().count();
    }

    async createBlockByDragging(startYOffset: number, endYOffset: number) {
        const calendar = this.getCalendar();

        // Ensure calendar is in viewport (important for mobile with page-level scroll)
        await calendar.scrollIntoViewIfNeeded();

        // Reset internal scroll so drag coordinates are time-independent.
        await calendar.evaluate((el) => {
            (el as HTMLElement).scrollTop = 0;
        });

        const calendarBox = await calendar.boundingBox();
        if (!calendarBox) throw new Error('Calendar not found');

        const startY = calendarBox.y + startYOffset;
        const endY = calendarBox.y + endYOffset;
        const centerX = calendarBox.x + calendarBox.width / 2;

        await this.page.mouse.move(centerX, startY);
        await this.page.mouse.down();
        await this.page.mouse.move(centerX, endY);
        await this.page.mouse.up();
    }

    async createBlockAtPosition(yOffset: number, height: number) {
        await this.createBlockByDragging(yOffset, yOffset + height);
    }

    async isLunchIndicatorVisible() {
        return await this.getLunchIndicator()
            .isVisible()
            .catch(() => false);
    }

    async isCurrentTimeLineVisible() {
        return await this.getCurrentTimeLine()
            .isVisible()
            .catch(() => false);
    }
}
