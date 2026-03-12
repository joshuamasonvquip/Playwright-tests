import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';
import { EmployeeDashboardPage } from '../../pages/employee/EmployeeDashboardPage';

const LICENSE_PHOTO_PATH = 'C:/Users/jmason/Desktop/Playwright-tests/tests/photos/agentWorkforce.jpg';

const acceptConsentIfPresent = async (page: Page) => {
    const consentDialog = page.getByRole('dialog').filter({ hasText: 'Consent' });
    if (await consentDialog.count()) {
        const englishCheckbox = page.locator('ion-checkbox').filter({ hasText: 'I can read and understand' });
        const signatureCheckbox = page.locator('ion-checkbox').filter({ hasText: 'I consent to electronic' });
        await englishCheckbox.click();
        await signatureCheckbox.click();
        await page.getByRole('button', { name: 'I Agree' }).click();
    }
};

const signOnCanvas = async (page: Page) => {
    const canvas = page.locator('canvas').first();
    if (await canvas.count()) {
        const box = await canvas.boundingBox();
        if (box) {
            await page.mouse.move(box.x + 10, box.y + 10);
            await page.mouse.down();
            await page.mouse.move(box.x + box.width - 10, box.y + box.height - 10, { steps: 5 });
            await page.mouse.up();
            return;
        }
    }
};

test.describe('Mobile App - End Rental Flow', () => {
    test('End-to-end: Check-in, Launch, and End Rental with Rate Us + Customer Review', async ({ page }) => {
        test.setTimeout(180000);

        const authHelper = new AuthHelper(page);
        const dashboardPage = new EmployeeDashboardPage(page);

        // Step 1: Login as employee
        await authHelper.login('employee');
        await expect(page).toHaveURL(/\/app\/tabs\/schedule/);

        // Step 2: Find and open a "Ready To Check-In" reservation (using proven POM pattern)
        await dashboardPage.openFirstReadyToCheckInReservation();
        await dashboardPage.startCheckInFromModal();

        // Step 3: Assign employee and confirm
        await page.waitForURL(/\/check-in\/\d+\/guest-list/);
        await dashboardPage.assignFirstEmployeeAndConfirm();
        await dashboardPage.verifyGuestListLoaded();

        // Step 4: Navigate to check-in dashboard and complete check-in
        await dashboardPage.openCheckInDashboard();
        await dashboardPage.completeCheckIn();

        // Step 5: Launch phase
        await page.waitForURL(/\/launch\//, { timeout: 30000 });

        // Attestation & Signature
        await page.getByText('Attestation').first().click();
        await page.getByRole('button', { name: 'Sign' }).click();
        await acceptConsentIfPresent(page);
        await signOnCanvas(page);
        await page.getByRole('button', { name: 'Sign' }).click();

        // Employee signature if needed
        if (await page.getByRole('combobox', { name: /Select Employee/i }).count()) {
            await page.getByRole('combobox', { name: /Select Employee/i }).click();
            await page.getByRole('option').first().click();
            await acceptConsentIfPresent(page);
            await signOnCanvas(page);
            await page.getByRole('button', { name: 'Sign' }).click();
        }

        // Equipment Checklist
        await page.getByRole('button', { name: /Equipment Checklist/i }).click();
        await page.getByRole('button', { name: 'Accept All' }).click();

        // Pre-Rental Photos (upload programmatically via filechooser)
        const preRentalPhotos = page.getByText('Pre-Rental Photos').first();
        if (await preRentalPhotos.isVisible({ timeout: 3000 })) {
            await preRentalPhotos.click();
            const fileChooserPromise = page.waitForEvent('filechooser');
            await page.locator('ion-icon[name="camera"]').first().click();
            const fileChooser = await fileChooserPromise;
            await fileChooser.setFiles(LICENSE_PHOTO_PATH);
            await page.waitForTimeout(2000);
        }

        // Apply signature and launch
        await page.getByRole('button', { name: /Apply Signature and Launch/i }).click();

        // Step 6: Back on schedule - find the now-started reservation
        await page.waitForURL(/\/app\/tabs\/schedule/, { timeout: 30000 });
        await page.waitForTimeout(3000);

        // Click on the started reservation
        const startedReservation = page.getByText('Started').first();
        await startedReservation.waitFor({ state: 'visible', timeout: 15000 });
        await startedReservation.click();

        // Step 7: Initiate End Rental
        const endRentalBtn = page.getByRole('button', { name: /End Rental/i });
        await endRentalBtn.waitFor({ state: 'visible', timeout: 10000 });
        await endRentalBtn.click();

        // Confirm End Rental in modal
        const confirmEndRental = page.getByRole('button', { name: 'End Rental', exact: true });
        if (await confirmEndRental.isVisible({ timeout: 3000 })) {
            await confirmEndRental.click();
        }

        // Step 8: End Rental Flow - Injuries/Damages
        const noInjuries = page.getByText('No', { exact: true }).first();
        if (await noInjuries.isVisible({ timeout: 5000 })) {
            await noInjuries.click();
        }
        const confirmEnd = page.getByRole('button', { name: /Confirm End Rental/i });
        if (await confirmEnd.isVisible({ timeout: 3000 })) {
            await confirmEnd.click();
        }

        // Renter Signoff
        const signButton = page.getByRole('button', { name: 'Sign' });
        if (await signButton.isVisible({ timeout: 5000 })) {
            await signButton.click();
            await signOnCanvas(page);
            const agreeBtn = page.getByRole('button', { name: /I Agree/i });
            if (await agreeBtn.isVisible({ timeout: 3000 })) {
                await agreeBtn.click();
            }
        }

        // Tip Screen -> Select No Tip
        const noTipBtn = page.getByRole('button', { name: /No Tip/i });
        if (await noTipBtn.isVisible({ timeout: 5000 })) {
            await noTipBtn.click();
        }
        await page.getByRole('button', { name: 'Next' }).click();

        // Photos Screen -> Next
        await page.getByRole('button', { name: 'Next' }).click();

        // Step 9: Rate Us Screen Verification (QA Flow Test Case)
        await expect(page.getByText('Rate Us')).toBeVisible({ timeout: 10000 });

        // Click the 3rd star to give a 3-star rating
        const thirdStar = page.locator('ngx-stars .star-icon').nth(2);
        await thirdStar.waitFor({ state: 'visible' });
        await thirdStar.click();

        // Proceed
        await page.getByRole('button', { name: 'Next' }).click();

        // Step 10: Customer Review Screen Verification (QA Flow Test Case)
        await expect(page.getByText('Customer Review')).toBeVisible({ timeout: 10000 });

        // Locate the textarea based on the placeholder
        const reviewTextArea = page.locator('textarea[placeholder="Enter your review."]')
            .or(page.locator('textarea.native-textarea'));
        await reviewTextArea.waitFor({ state: 'visible' });

        // Input the test notes
        const testReview = 'Automated test review: Customer was punctual and returned equipment in good condition.';
        await reviewTextArea.fill(testReview);
        await expect(reviewTextArea).toHaveValue(testReview);

        // Save and Proceed
        await page.getByRole('button', { name: 'Next' }).click();

        // Step 11: Finalize End Rental
        const endButton = page.getByRole('button', { name: 'End', exact: true });
        await endButton.waitFor({ state: 'visible', timeout: 10000 });
        await endButton.click();

        // Final confirmation modal
        const finalEndRentalBtn = page.getByRole('button', { name: 'End Rental', exact: true });
        await finalEndRentalBtn.waitFor({ state: 'visible' });
        await finalEndRentalBtn.click();

        // Step 12: Verification - Returns back to dashboard/schedule
        await expect(page).toHaveURL(/.*\/app\/tabs\/schedule/, { timeout: 30000 });
        console.log('✅ End-to-end rental flow completed successfully with Rate Us and Customer Review');
    });
});
