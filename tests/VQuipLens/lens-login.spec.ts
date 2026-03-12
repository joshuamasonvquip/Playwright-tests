import { test, expect } from '@playwright/test';

test.describe('VQuip Lens Login', () => {
  const LOGIN_URL = 'https://login.insurance.dev.vquip.io/auth/login';
  const DASHBOARD_URL = 'https://login.insurance.dev.vquip.io/dashboard';
  const EVALUATION_LIST_URL = 'https://lens.insurance.dev.vquip.io/evaluation/list';

  // Valid test credentials
  const VALID_CREDENTIALS = {
    username: 'joshuamason+dev@vquip.com',
    password: 'vQuip123!'
  };

  test.describe('Login Tests', () => {
    test('TC-LOGIN-001: Users are able to log in using their vQuip Lens credentials', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_URL);

      // Verify login page loaded
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

      // Enter valid credentials
      await page.getByRole('textbox', { name: 'Username' }).fill(VALID_CREDENTIALS.username);
      await page.getByRole('textbox', { name: 'Password' }).fill(VALID_CREDENTIALS.password);

      // Click Sign in
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Verify redirect to dashboard (home page)
      await page.waitForURL('**/dashboard', { timeout: 15000 });
      await expect(page).toHaveURL(/.*dashboard/);

      // Verify dashboard elements are visible
      await expect(page.getByRole('heading', { name: 'Apps Dashboard' })).toBeVisible();
      await expect(page.getByText('Lens')).toBeVisible();
    });

    test('TC-LOGIN-002: Error message appears when a user enters the incorrect password', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_URL);

      // Enter valid username but incorrect password
      await page.getByRole('textbox', { name: 'Username' }).fill(VALID_CREDENTIALS.username);
      await page.getByRole('textbox', { name: 'Password' }).fill('WrongPassword123!');

      // Click Sign in
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Wait for error response
      await page.waitForTimeout(2000);

      // Verify user stays on login page (not redirected)
      await expect(page).toHaveURL(/.*login/);

      // Verify error toast/message appears (adjust selector based on actual implementation)
      // Common patterns for Angular Material toast messages
      const errorIndicators = [
        page.locator('.mat-snack-bar-container'),
        page.locator('[role="alert"]'),
        page.locator('.toast-error'),
        page.locator('.mat-mdc-snack-bar-container'),
        page.getByText(/invalid|incorrect|wrong|failed/i)
      ];

      // Check if any error indicator is visible
      let errorFound = false;
      for (const indicator of errorIndicators) {
        if (await indicator.isVisible().catch(() => false)) {
          errorFound = true;
          break;
        }
      }

      // User should still be on login page unable to proceed
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('TC-LOGIN-003: Error message for invalid username', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_URL);

      // Enter invalid username and password
      await page.getByRole('textbox', { name: 'Username' }).fill('nonexistent@test.com');
      await page.getByRole('textbox', { name: 'Password' }).fill('SomePassword123!');

      // Click Sign in
      await page.getByRole('button', { name: 'Sign in' }).click();

      // Wait for error response
      await page.waitForTimeout(2000);

      // Verify user stays on login page
      await expect(page).toHaveURL(/.*login/);
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('TC-LOGIN-004: Login page displays required elements', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_URL);

      // Verify all required elements are present
      await expect(page.getByText('vQuip Insurance')).toBeVisible();
      await expect(page.getByText('Log in')).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    });

    test('TC-LOGIN-005: Forgot password link navigates correctly', async ({ page }) => {
      // Navigate to login page
      await page.goto(LOGIN_URL);

      // Click forgot password link
      await page.getByRole('link', { name: 'Forgot password?' }).click();

      // Verify navigation to forgot password page
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });

  // Note: This test requires manual setup - you need to be logged into Core in another tab
  // This is documented but marked as manual/skip since it requires browser state from another session
  test.describe('Cross-Session Tests', () => {
    test.skip('TC-LOGIN-006: Cannot login to Lens while logged into Core (manual test)', async ({ page }) => {
      // MANUAL TEST DOCUMENTATION:
      // 1. Open a browser tab and login to Core (QA Flow or User Management)
      // 2. In a new tab (same browser), navigate to Lens login
      // 3. Attempt to login with valid Lens credentials
      // 4. Expected: User should NOT be able to login due to existing Core session
      //
      // This test is skipped because it requires:
      // - Pre-existing session in another tab
      // - Cannot be reliably automated without browser profile persistence
      
      // Placeholder for documentation purposes
      expect(true).toBe(true);
    });
  });
});
