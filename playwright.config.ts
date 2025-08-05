import { defineConfig, devices } from '@playwright/test';
import { getEnvironment } from './config/environments';

// Get the current environment
const env = process.env.TEST_ENV || 'dev';
const environment = getEnvironment();

console.log(`Running tests in ${environment.name} environment`);
console.log(`Base URL: ${environment.baseUrl}`);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 120000, // Increase timeout to 2 minutes for comprehensive testing
  use: {
    baseURL: environment.baseUrl,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
}); 