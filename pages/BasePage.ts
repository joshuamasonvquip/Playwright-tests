import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for page to be loaded
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be enabled
   */
  async waitForElementEnabled(locator: Locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
    await expect(locator).toBeEnabled();
  }

  /**
   * Click element with retry logic
   */
  async clickWithRetry(locator: Locator, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input with retry logic
   */
  async fillWithRetry(locator: Locator, value: string, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.fill(value);
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(dropdownLocator: Locator, optionText: string) {
    await this.waitForElement(dropdownLocator);
    await dropdownLocator.click();
    await this.page.waitForTimeout(1000);
    
    const option = this.page.locator(`[role="option"]:has-text("${optionText}")`);
    await this.waitForElement(option);
    await option.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get current URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Navigate to URL
   */
  async navigateTo(url: string) {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `screenshots/${name}-${Date.now()}.png` });
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(pattern: string | RegExp, timeout = 10000) {
    await this.page.waitForURL(pattern, { timeout });
  }

  /**
   * Verify element is visible
   */
  async verifyElementVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  /**
   * Verify element has text
   */
  async verifyElementText(locator: Locator, expectedText: string) {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Verify element has value
   */
  async verifyElementValue(locator: Locator, expectedValue: string) {
    await expect(locator).toHaveValue(expectedValue);
  }
} 