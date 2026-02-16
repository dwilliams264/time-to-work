import { Page } from '@playwright/test';

export class CalendarPage {
    readonly page: Page;
    readonly calendarContainer: string;
    readonly calendarHeader: string;
    readonly calendarTitle: string;
    readonly clearAllButton: string;
    readonly calendarHint: string;
    readonly calendar: string;
    readonly hourRows: string;
    readonly timeBlocks: string;
    readonly timeBlock: string;
    readonly timeBlockContent: string;
    readonly timeBlockDeleteButton: string;
    readonly lunchIndicator: string;
    readonly currentTimeLine: string;
    readonly currentTimeIndicator: string;
    readonly previewBlock: string;

    constructor(page: Page) {
        this.page = page;
        this.calendarContainer = '.calendar-container';
        this.calendarHeader = '.calendar-header';
        this.calendarTitle = '.calendar-header h2';
        this.clearAllButton = '.clear-all-button';
        this.calendarHint = '.calendar-hint';
        this.calendar = '.calendar';
        this.hourRows = '.hour-row';
        this.timeBlocks = '.time-block';
        this.timeBlock = '.time-block';
        this.timeBlockContent = '.time-block-content';
        this.timeBlockDeleteButton = '.time-block .delete-button';
        this.lunchIndicator = '.lunch-indicator';
        this.currentTimeLine = '.current-time-line';
        this.currentTimeIndicator = '.current-time-indicator';
        this.previewBlock = '.time-block.preview';
    }

    getCalendarContainer() {
        return this.page.locator(this.calendarContainer);
    }

    getCalendarHeader() {
        return this.page.locator(this.calendarHeader);
    }

    getCalendarTitle() {
        return this.page.locator(this.calendarTitle);
    }

    getClearAllButton() {
        return this.page.locator(this.clearAllButton);
    }

    getCalendarHint() {
        return this.page.locator(this.calendarHint);
    }

    getCalendar() {
        return this.page.locator(this.calendar);
    }

    getHourRows() {
        return this.page.locator(this.hourRows);
    }

    getTimeBlocks() {
        return this.page.locator(this.timeBlocks);
    }

    getTimeBlock() {
        return this.page.locator(this.timeBlock);
    }

    getTimeBlockContent() {
        return this.page.locator(this.timeBlockContent);
    }

    getTimeBlockDeleteButton() {
        return this.page.locator(this.timeBlockDeleteButton);
    }

    getLunchIndicator() {
        return this.page.locator(this.lunchIndicator);
    }

    getCurrentTimeLine() {
        return this.page.locator(this.currentTimeLine);
    }

    getCurrentTimeIndicator() {
        return this.page.locator(this.currentTimeIndicator);
    }

    getPreviewBlock() {
        return this.page.locator(this.previewBlock);
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
