import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';

test.describe('VQuip Business Login Flow', () => {
  test('should successfully login and navigate to scheduler', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    
    // Login using the reusable auth helper
    await authHelper.login('business');
    
    // Additional verification that we're on the scheduler page
    const bookingsPage = page.locator('h3:has-text("Bookings")');
    await expect(bookingsPage).toBeVisible();
  });
}); 