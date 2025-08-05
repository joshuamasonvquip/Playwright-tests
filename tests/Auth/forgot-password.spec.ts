import { test, expect } from '@playwright/test';

test.describe('VQuip Forgot Password', () => {
  test('should navigate to forgot password page for business user', async ({ page }) => {
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
    
    // Step 5: Click Forgot password link
    const forgotPasswordLink = page.locator('text=Forgot password?');
    await forgotPasswordLink.click();
    
    // Step 6: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 7: Verify the page title and content
    await expect(page.locator('text=Forgot Password')).toBeVisible();
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('button:has-text("Send reset email")')).toBeVisible();
    await expect(page.locator('text=Back to login page')).toBeVisible();
    
    console.log('Business forgot password navigation test completed successfully!');
  });

  test('should navigate to forgot password page for admin user', async ({ page }) => {
    // Step 1: Navigate to the admin login page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/login');
    
    // Step 2: Verify we're on the admin login page
    await expect(page).toHaveURL(/.*\/vquipadmin\/login/);
    
    // Step 3: Click Forgot password link
    const forgotPasswordLink = page.locator('text=Forgot password?');
    await forgotPasswordLink.click();
    
    // Step 4: Verify we're on the admin forgot password page
    await expect(page).toHaveURL(/.*\/vquipadmin\/forgot-password/);
    
    // Step 5: Verify the page title and content
    await expect(page.locator('text=Control Panel')).toBeVisible();
    await expect(page.locator('text=Forgot Password')).toBeVisible();
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('button:has-text("Send reset email")')).toBeVisible();
    await expect(page.locator('text=Back to login page')).toBeVisible();
    
    console.log('Admin forgot password navigation test completed successfully!');
  });

  test('should navigate to forgot password page for employee user', async ({ page }) => {
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
    
    // Step 5: Click Forgot password link
    const forgotPasswordLink = page.locator('text=Forgot password?');
    await forgotPasswordLink.click();
    
    // Step 6: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 7: Verify the page title and content
    await expect(page.locator('text=Forgot Password')).toBeVisible();
    await expect(page.locator('text=Username')).toBeVisible();
    await expect(page.locator('button:has-text("Send reset email")')).toBeVisible();
    await expect(page.locator('text=Back to login page')).toBeVisible();
    
    console.log('Employee forgot password navigation test completed successfully!');
  });

  test('should submit forgot password form for business user', async ({ page }) => {
    // Step 1: Navigate to business forgot password page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/318/forgot-password');
    
    // Step 2: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 3: Enter username
    const usernameInput = page.locator('#username');
    await usernameInput.fill('oscar+fp@vquip.com');
    
    // Step 4: Click Send reset email button
    const sendButton = page.locator('button:has-text("Send reset email")');
    await sendButton.click();
    
    // Step 5: Verify success message appears
    await expect(page.locator('text=If your information is valid, you should receive an email in your inbox!')).toBeVisible();
    
    // Step 6: Verify the retry button is disabled (the countdown may vary)
    await expect(page.locator('button:has-text("Retry in")')).toBeDisabled();
    
    console.log('Business forgot password form submission test completed successfully!');
  });

//   test('should submit forgot password form for admin user', async ({ page }) => {
//     // Step 1: Navigate to admin forgot password page
//     await page.goto('https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/forgot-password');
    
//     // Step 2: Verify we're on the admin forgot password page
//     await expect(page).toHaveURL(/.*\/vquipadmin\/forgot-password/);
    
//     // Step 3: Enter username
//     const usernameInput = page.locator('#username');
//     await usernameInput.fill('oscar+fp@vquip.com');
    
//     // Step 4: Click Send reset email button
//     const sendButton = page.locator('button:has-text("Send reset email")');
//     await sendButton.click();
    
//     // Step 5: Verify success message appears
//     await expect(page.locator('text=If your information is valid, you should receive an email in your inbox!')).toBeVisible();
    
//     // Step 6: Verify the retry button is disabled (the countdown may vary)
//     await expect(page.locator('button:has-text("Retry in")')).toBeDisabled();
    
//     console.log('Admin forgot password form submission test completed successfully!');
//   });

  test('should navigate back to login page from forgot password', async ({ page }) => {
    // Step 1: Navigate to business forgot password page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/318/forgot-password');
    
    // Step 2: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 3: Click Back to login page link
    const backToLoginLink = page.locator('text=Back to login page');
    await backToLoginLink.click();
    
    // Step 4: Verify we're back on the login page
    await expect(page).toHaveURL(/.*\/login$/);
    
    // Step 5: Verify login form elements are visible
    await expect(page.locator('text=Log in')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    
    console.log('Back to login navigation test completed successfully!');
  });

  test('should navigate back to admin login page from forgot password', async ({ page }) => {
    // Step 1: Navigate to admin forgot password page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/forgot-password');
    
    // Step 2: Verify we're on the admin forgot password page
    await expect(page).toHaveURL(/.*\/vquipadmin\/forgot-password/);
    
    // Step 3: Click Back to login page link
    const backToLoginLink = page.locator('text=Back to login page');
    await backToLoginLink.click();
    
    // Step 4: Verify we're back on the admin login page
    await expect(page).toHaveURL(/.*\/vquipadmin\/login/);
    
    // Step 5: Verify admin login form elements are visible
    await expect(page.locator('text=Control Panel')).toBeVisible();
    await expect(page.locator('text=Log in')).toBeVisible();
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button:has-text("Sign in")')).toBeVisible();
    
    console.log('Back to admin login navigation test completed successfully!');
  });

  test('should validate required username field on forgot password form', async ({ page }) => {
    // Step 1: Navigate to business forgot password page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/318/forgot-password');
    
    // Step 2: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 3: Try to submit without entering username
    const sendButton = page.locator('button:has-text("Send reset email")');
    await sendButton.click();
    
    // Step 4: Verify we're still on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 5: Verify the username field is still empty
    const usernameInput = page.locator('#username');
    await expect(usernameInput).toHaveValue('');
    
    console.log('Forgot password form validation test completed successfully!');
  });

  test('should handle invalid username on forgot password form', async ({ page }) => {
    // Step 1: Navigate to business forgot password page
    await page.goto('https://dev-admin.vquiprentals.com/auth/v2/318/forgot-password');
    
    // Step 2: Verify we're on the forgot password page
    await expect(page).toHaveURL(/.*\/forgot-password$/);
    
    // Step 3: Enter invalid username
    const usernameInput = page.locator('#username');
    await usernameInput.fill('nonexistentuser');
    
    // Step 4: Click Send reset email button
    const sendButton = page.locator('button:has-text("Send reset email")');
    await sendButton.click();
    
    // Step 5: Verify success message still appears (for security, don't reveal if user exists)
    await expect(page.locator('text=If your information is valid, you should receive an email in your inbox!')).toBeVisible();
    
    // Step 6: Verify the retry button is disabled (the countdown may vary)
    await expect(page.locator('button:has-text("Retry in")')).toBeDisabled();
    
    console.log('Invalid username forgot password test completed successfully!');
  });
}); 