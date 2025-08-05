import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';

test.describe('VQuip Admin Login Flow', () => {
  test('should successfully login and navigate to scheduler', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    // Login using the reusable auth helper
    await authHelper.login('admin');
    
    // Additional verification that we're on the admin dashboard page
    const companyListPage = page.locator('text=Company List');
    await expect(companyListPage).toBeVisible();
  });
});