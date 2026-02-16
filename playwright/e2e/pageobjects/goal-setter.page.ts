import { Page } from '@playwright/test';

export class GoalSetterPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    getGoalSetterContainer() {
        return this.page.getByTestId('goal-setter-container');
    }

    getGoalSetterHeader() {
        return this.page.getByTestId('goal-setter-header');
    }

    getToggleButton() {
        return this.page.getByTestId('goal-setter-toggle');
    }

    getGoalInputs() {
        return this.page.getByTestId('goal-setter-inputs');
    }

    getHoursInput() {
        return this.page.getByTestId('hours');
    }

    getMinutesInput() {
        return this.page.getByTestId('minutes');
    }

    getQuickGoalLongButton() {
        return this.page.getByTestId('goal-setter-quick-long');
    }

    getQuickGoalMediumButton() {
        return this.page.getByTestId('goal-setter-quick-medium');
    }

    getQuickGoalShortButton() {
        return this.page.getByTestId('goal-setter-quick-short');
    }

    getLunchCheckbox() {
        return this.page.getByTestId('goal-setter-lunch-checkbox');
    }

    getLunchInputs() {
        return this.page.getByTestId('goal-setter-lunch-inputs');
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
