import { defineConfig, devices } from '@playwright/test';
import * as os from 'node:os';

/**
 * Playwright Test Configuration
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    // Test directory (will be overridden by projects)
    testDir: './playwright',

    /* Run tests in files in parallel */
    fullyParallel: true,

    /* Fail the build on CI if you accidentally left test.only in the source code */
    forbidOnly: !!process.env.CI,

    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,

    /* Limit the number of workers on CI */
    workers: process.env.CI ? 6 : undefined,

    /* Limit the number of failures on CI to save resources */
    maxFailures: process.env.CI ? 10 : undefined,

    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['list'],
        ['html', { outputFolder: 'playwright-report' }],
        [
            'allure-playwright',
            {
                resultsDir: 'allure-results',
                detail: true,
                suiteTitle: true,
                environmentInfo: {
                    os_platform: os.platform(),
                    os_release: os.release(),
                    os_version: os.version(),
                    node_version: process.version,
                },
            },
        ],
    ],

    /* Shared settings for all projects */
    use: {
        /* Base URL to use in actions like `await page.goto('/')` */
        baseURL: 'http://localhost:5173',

        /* Collect trace when retrying the failed test */
        trace: 'on-first-retry',

        /* Screenshot on failure */
        screenshot: 'only-on-failure',

        /* Video on failure */
        video: 'retain-on-failure',
    },

    /* Configure timeouts */
    timeout: 60_000,
    expect: {
        timeout: 30_000,
    },

    /* Configure projects for different test types */
    projects: [
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'mobile',
            use: { ...devices['Desktop Chrome'], viewport: { width: 393, height: 851 } },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
