import { test, expect } from '@playwright/test';

test.describe('VQuip Login Flow', () => {
  test('should successfully login and navigate to scheduler', async ({ page }) => {
    // Step 1: Navigate to the welcome page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Wait for the page to load and verify we're on the correct page
    await expect(page).toHaveURL('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Step 2: Enter Company ID
    const companyIdInput = page.locator('#companyId');
    await companyIdInput.waitFor({ state: 'visible' });
    await companyIdInput.fill('244');
    
    // Step 3: Click Continue
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.waitFor({ state: 'visible' });
    await continueButton.click();
    
    // Step 4: Enter Username
    const usernameInput = page.locator('#username');
    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill('oscaremp');
    
    // Step 5: Enter Password
    const passwordInput = page.locator('#password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill('Password1!');
    
    // Step 6: Click Sign In
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.waitFor({ state: 'visible' });
    await signInButton.click();
    
    // Step 7: Verify Redirection
    // Wait for navigation to complete
    await page.waitForLoadState('networkidle');
    
    // Assert that the browser's current URL is the expected scheduler URL
    await expect(page).toHaveURL('https://dev-admin.vquiprentals.com/secure/scheduler');
  });
}); 