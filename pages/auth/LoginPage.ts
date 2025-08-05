import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class LoginPage extends BasePage {
  // Common elements
  private readonly companyIdInput: Locator;
  private readonly continueButton: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly forgotPasswordLink: Locator;

  // Admin specific elements
  private readonly controlPanelTitle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.companyIdInput = page.locator('#companyId');
    this.continueButton = page.locator('button:has-text("Continue")');
    this.usernameInput = page.locator('#username');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.locator('button:has-text("Sign in")');
    this.forgotPasswordLink = page.locator('text=Forgot password?');
    this.controlPanelTitle = page.locator('text=Control Panel');
  }

  /**
   * Navigate to welcome page for business/employee login
   */
  async navigateToWelcomePage() {
    await this.navigateTo('/auth/v2/welcome');
  }

  /**
   * Navigate to admin login page
   */
  async navigateToAdminLogin() {
    await this.navigateTo('/auth/v2/vquipadmin/login');
  }

  /**
   * Enter company ID
   */
  async enterCompanyId(companyId: string) {
    await this.fillWithRetry(this.companyIdInput, companyId);
  }

  /**
   * Click continue button
   */
  async clickContinue() {
    await this.clickWithRetry(this.continueButton);
  }

  /**
   * Enter username
   */
  async enterUsername(username: string) {
    await this.fillWithRetry(this.usernameInput, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string) {
    await this.fillWithRetry(this.passwordInput, password);
  }

  /**
   * Click sign in button
   */
  async clickSignIn() {
    await this.clickWithRetry(this.signInButton);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.clickWithRetry(this.forgotPasswordLink);
  }

  /**
   * Complete business/employee login flow
   */
  async loginAsBusinessOrEmployee(companyId: string, username: string, password: string) {
    await this.navigateToWelcomePage();
    await this.enterCompanyId(companyId);
    await this.clickContinue();
    await this.waitForUrl(/.*\/login$/);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
    await this.waitForUrl('**/secure/scheduler', 10000);
  }

  /**
   * Complete admin login flow
   */
  async loginAsAdmin(username: string, password: string) {
    await this.navigateToAdminLogin();
    await this.verifyElementVisible(this.controlPanelTitle);
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickSignIn();
    await this.waitForUrl('**/management/dashboard**', 10000);
  }

  /**
   * Navigate to forgot password page for business/employee
   */
  async navigateToForgotPassword(companyId: string) {
    await this.navigateTo(`/auth/v2/${companyId}/forgot-password`);
  }

  /**
   * Navigate to admin forgot password page
   */
  async navigateToAdminForgotPassword() {
    await this.navigateTo('/auth/v2/vquipadmin/forgot-password');
  }

  /**
   * Verify login page elements are visible
   */
  async verifyLoginPageElements() {
    await this.verifyElementVisible(this.usernameInput);
    await this.verifyElementVisible(this.passwordInput);
    await this.verifyElementVisible(this.signInButton);
  }

  /**
   * Verify welcome page elements are visible
   */
  async verifyWelcomePageElements() {
    await this.verifyElementVisible(this.companyIdInput);
    await this.verifyElementVisible(this.continueButton);
  }

  /**
   * Verify admin login page elements are visible
   */
  async verifyAdminLoginPageElements() {
    await this.verifyElementVisible(this.controlPanelTitle);
    await this.verifyLoginPageElements();
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    const errorLocator = this.page.locator('[data-testid="error-message"], .error-message, .alert-error');
    const isVisible = await errorLocator.isVisible();
    return isVisible ? await errorLocator.textContent() : null;
  }
} 