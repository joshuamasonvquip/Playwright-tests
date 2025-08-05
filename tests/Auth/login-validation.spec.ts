import { test, expect } from '@playwright/test';

test.describe('VQuip Login Validation', () => {
  test('should stay on login page after invalid business credentials', async ({ page }) => {
    // Step 1: Navigate to the welcome page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Step 2: Enter valid Company ID
    const companyIdInput = page.locator('#companyId');
    await companyIdInput.fill('318');
    
    // Step 3: Click Continue
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    
    // Step 4: Verify we're on the login page
    await expect(page).toHaveURL(/.*\/login$/);
    
    // Step 5: Enter invalid username
    const usernameInput = page.locator('#username');
    await usernameInput.fill('invaliduser');
    
    // Step 6: Enter invalid password
    const passwordInput = page.locator('#password');
    await passwordInput.fill('wrongpassword');
    
    // Step 7: Click Sign In
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Step 8: Verify we're still on the login page (failed login)
    await expect(page).toHaveURL(/.*\/login$/);
    
    // Step 9: Verify the form fields still contain the entered values
    await expect(usernameInput).toHaveValue('invaliduser');
    await expect(passwordInput).toHaveValue('wrongpassword');
    
    console.log('Business login validation test completed successfully!');
  });

  test('should stay on login page after invalid admin credentials', async ({ page }) => {
    // Step 1: Navigate to the admin login page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/login');
    
    // Step 2: Enter invalid username
    const usernameInput = page.locator('#username');
    await usernameInput.fill('invalidadmin');
    
    // Step 3: Enter invalid password
    const passwordInput = page.locator('#password');
    await passwordInput.fill('wrongpassword');
    
    // Step 4: Click Sign In
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Step 5: Verify we're still on the admin login page (failed login)
    await expect(page).toHaveURL(/.*\/vquipadmin\/login/);
    
    // Step 6: Verify the form fields still contain the entered values
    await expect(usernameInput).toHaveValue('invalidadmin');
    await expect(passwordInput).toHaveValue('wrongpassword');
    
    console.log('Admin login validation test completed successfully!');
  });

  test('should stay on login page after invalid employee credentials', async ({ page }) => {
    // Step 1: Navigate to the welcome page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Step 2: Enter valid Company ID
    const companyIdInput = page.locator('#companyId');
    await companyIdInput.fill('318');
    
    // Step 3: Click Continue
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    
    // Step 4: Verify we're on the login page
    await expect(page).toHaveURL(/.*\/login$/);
    
    // Step 5: Enter invalid username
    const usernameInput = page.locator('#username');
    await usernameInput.fill('invalidemployee');
    
    // Step 6: Enter invalid password
    const passwordInput = page.locator('#password');
    await passwordInput.fill('wrongpassword');
    
    // Step 7: Click Sign In
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Step 8: Verify we're still on the login page (failed login)
    await expect(page).toHaveURL(/.*\/login$/);
    
    // Step 9: Verify the form fields still contain the entered values
    await expect(usernameInput).toHaveValue('invalidemployee');
    await expect(passwordInput).toHaveValue('wrongpassword');
    
    console.log('Employee login validation test completed successfully!');
  });

  test('should handle invalid company ID gracefully', async ({ page }) => {
    // Step 1: Navigate to the welcome page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Step 2: Enter invalid Company ID
    const companyIdInput = page.locator('#companyId');
    await companyIdInput.fill('999999');
    
    // Step 3: Click Continue
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    
    // Step 4: Verify we're still on the welcome page (failed company lookup)
    await expect(page).toHaveURL(/.*\/welcome$/);
    
    // Step 5: Verify the company ID field still contains the entered value
    await expect(companyIdInput).toHaveValue('999999');
    
    console.log('Invalid company ID validation test completed successfully!');
  });

  test('should validate required fields for business login', async ({ page }) => {
    // Step 1: Navigate to the welcome page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/welcome');
    
    // Step 2: Try to continue without entering Company ID
    const continueButton = page.locator('button:has-text("Continue")');
    await continueButton.click();
    
    // Step 3: Verify we're still on the welcome page
    await expect(page).toHaveURL(/.*\/welcome$/);
    
    // Step 4: Verify the company ID field is still empty
    const companyIdInput = page.locator('#companyId');
    await expect(companyIdInput).toHaveValue('');
    
    console.log('Required fields validation test completed successfully!');
  });

  test('should validate required fields for admin login', async ({ page }) => {
    // Step 1: Navigate to the admin login page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/login');
    
    // Step 2: Try to sign in without entering credentials
    const signInButton = page.locator('button:has-text("Sign in")');
    await signInButton.click();
    
    // Step 3: Verify we're still on the admin login page
    await expect(page).toHaveURL(/.*\/vquipadmin\/login/);
    
    // Step 4: Verify the form fields are still empty
    const usernameInput = page.locator('#username');
    const passwordInput = page.locator('#password');
    await expect(usernameInput).toHaveValue('');
    await expect(passwordInput).toHaveValue('');
    
    console.log('Admin required fields validation test completed successfully!');
  });
}); 