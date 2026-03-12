import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';

test('employee login lands on schedule', async ({ page }) => {
  const authHelper = new AuthHelper(page);

  await authHelper.login('employee');

  await expect(page).toHaveURL(/\/app\/tabs\/schedule/);
  await expect(page.getByRole('heading', { name: /Schedule|Bookings/i })).toBeVisible();
});
