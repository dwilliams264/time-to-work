import { Page } from '@playwright/test';

export class GoalSetterPage {
    readonly page: Page;
    readonly goalSetterContainer: string;
    readonly goalSetterHeader: string;
    readonly toggleButton: string;
    readonly goalInputs: string;
    readonly hoursInput: string;
    readonly minutesInput: string;
    readonly quickGoalLongButton: string;
    readonly quickGoalMediumButton: string;
    readonly quickGoalShortButton: string;
    readonly lunchBreakSection: string;
    readonly lunchCheckbox: string;
    readonly lunchInputs: string;

    constructor(page: Page) {
        this.page = page;
        this.goalSetterContainer = '.goal-setter';
        this.goalSetterHeader = '.goal-setter h3';
        this.toggleButton = '.toggle-button';
        this.goalInputs = '.goal-inputs';
        this.hoursInput = '#hours';
        this.minutesInput = '#minutes';
        this.quickGoalLongButton = 'button:has-text("8.5h")';
        this.quickGoalMediumButton = 'button:has-text("7.5h")';
        this.quickGoalShortButton = 'button:has-text("6.5h")';
        this.lunchBreakSection = '.lunch-break-section';
        this.lunchCheckbox = '.lunch-checkbox';
        this.lunchInputs = '.lunch-inputs';
    }

    getGoalSetterContainer() {
        return this.page.locator(this.goalSetterContainer);
    }

    getGoalSetterHeader() {
        return this.page.locator(this.goalSetterHeader);
    }

    getToggleButton() {
        return this.page.locator(this.toggleButton);
    }

    getGoalInputs() {
        return this.page.locator(this.goalInputs);
    }

    getHoursInput() {
        return this.page.locator(this.hoursInput);
    }

    getMinutesInput() {
        return this.page.locator(this.minutesInput);
    }

    getQuickGoalLongButton() {
        return this.page.locator(this.quickGoalLongButton);
    }

    getQuickGoalMediumButton() {
        return this.page.locator(this.quickGoalMediumButton);
    }

    getQuickGoalShortButton() {
        return this.page.locator(this.quickGoalShortButton);
    }

    getLunchCheckbox() {
        return this.page.locator(this.lunchCheckbox);
    }

    getLunchInputs() {
        return this.page.locator(this.lunchInputs);
    }

    async expandIfCollapsed() {
        const isExpanded = await this.getGoalInputs()
            .isVisible()
            .catch(() => false);
        if (!isExpanded) {
            await this.getToggleButton().click();
        }
    }

    async setGoal(hours: number, minutes: number) {
        await this.expandIfCollapsed();
        await this.getHoursInput().fill(hours.toString());
        await this.getMinutesInput().fill(minutes.toString());
    }

    async selectQuickGoalLong() {
        await this.expandIfCollapsed();
        await this.getQuickGoalLongButton().click();
    }

    async selectQuickGoalMedium() {
        await this.expandIfCollapsed();
        await this.getQuickGoalMediumButton().click();
    }

    async selectQuickGoalShort() {
        await this.expandIfCollapsed();
        await this.getQuickGoalShortButton().click();
    }

    async enableLunch() {
        await this.expandIfCollapsed();
        const isChecked = await this.getLunchCheckbox().isChecked();
        if (!isChecked) {
            await this.getLunchCheckbox().check();
        }
    }

    async disableLunch() {
        await this.expandIfCollapsed();
        const isChecked = await this.getLunchCheckbox().isChecked();
        if (isChecked) {
            await this.getLunchCheckbox().uncheck();
        }
    }
}
