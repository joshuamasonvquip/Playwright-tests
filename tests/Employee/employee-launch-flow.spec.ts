import { test, expect } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';
import { EmployeeDashboardPage } from '../../pages/employee/EmployeeDashboardPage';

test.describe('Pendo employee launch flow', () => {
  test('should complete check-in and reach Ready To Start', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const dashboardPage = new EmployeeDashboardPage(page);

    await authHelper.login('employee');
    await expect(page).toHaveURL(/\/app\/tabs\/schedule/);

    await dashboardPage.openFirstReadyToCheckInReservation();
    await dashboardPage.startCheckInFromModal();

    await page.waitForURL(/\/check-in\/\d+\/guest-list/);
    await dashboardPage.assignFirstEmployeeAndConfirm();
    await dashboardPage.verifyGuestListLoaded();

    await dashboardPage.openCheckInDashboard();
    await dashboardPage.completeCheckIn();
    await dashboardPage.returnToSchedule();

    await expect(page).toHaveURL(/\/app\/tabs\/schedule/);
    await expect(page.getByText('Ready To Start')).toBeVisible();
  });
});
