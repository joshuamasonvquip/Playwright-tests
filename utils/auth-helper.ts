import { Page, expect } from '@playwright/test';
import { getEnvironment, getCredentials } from '../config/environments';

export class AuthHelper {
  private page: Page;
  private env: ReturnType<typeof getEnvironment>;

  constructor(page: Page) {
    this.page = page;
    this.env = getEnvironment();
  }

  async login(userType: 'business' | 'admin' | 'employee') {
    const credentials = getCredentials(userType);
    
    if (userType === 'admin') {
      await this.loginAsAdmin(credentials);
    } else {
      await this.loginAsBusinessOrEmployee(userType, credentials);
    }
  }

  private async loginAsAdmin(credentials: { username: string; password: string }) {
    // Step 1: Navigate to the admin login page
    await this.page.goto(this.env.adminAuthUrl);
    await expect(this.page).toHaveURL(this.env.adminAuthUrl);
    
    // Step 2: Enter Username
    const usernameInput = this.page.locator('#username');
    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(credentials.username);
    
    // Step 3: Enter Password
    const passwordInput = this.page.locator('#password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(credentials.password);
    
    // Step 4: Click Sign In
    const signInButton = this.page.locator('button:has-text("Sign in")');
    await signInButton.waitFor({ state: 'visible' });
    await signInButton.click();
    
    // Step 5: Verify Redirection to dashboard (admin goes to management dashboard)
    await this.page.waitForURL('**/management/dashboard**', { timeout: 10000 });
    
    console.log(`Successfully logged in as admin user in ${this.env.name} environment`);
  }

  private async loginAsBusinessOrEmployee(userType: 'business' | 'employee', credentials: { companyId: string; username: string; password: string }) {
    // Step 1: Navigate to the welcome page
    await this.page.goto(this.env.authUrl);
    await expect(this.page).toHaveURL(this.env.authUrl);
    
    // Step 2: Enter Company ID
    const companyIdInput = this.page.locator('#companyId');
    await companyIdInput.waitFor({ state: 'visible' });
    await companyIdInput.fill(credentials.companyId);
    
    // Step 3: Click Continue
    const continueButton = this.page.locator('button:has-text("Continue")');
    await continueButton.waitFor({ state: 'visible' });
    await continueButton.click();
    
    // Step 4: Enter Username
    const usernameInput = this.page.locator('#username');
    await usernameInput.waitFor({ state: 'visible' });
    await usernameInput.fill(credentials.username);
    
    // Step 5: Enter Password
    const passwordInput = this.page.locator('#password');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(credentials.password);
    
    // Step 6: Click Sign In
    const signInButton = this.page.locator('button:has-text("Sign in")');
    await signInButton.waitFor({ state: 'visible' });
    await signInButton.click();
    
    // Step 7: Verify Redirection to scheduler
    await this.page.waitForURL('**/secure/scheduler', { timeout: 10000 });
    await expect(this.page).toHaveURL(`${this.env.baseUrl}/secure/scheduler`);
    
    console.log(`Successfully logged in as ${userType} user in ${this.env.name} environment`);
  }

  getEnvironmentInfo() {
    return {
      name: this.env.name,
      baseUrl: this.env.baseUrl,
      authUrl: this.env.authUrl,
      adminAuthUrl: this.env.adminAuthUrl
    };
  }
} 