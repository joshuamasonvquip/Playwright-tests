import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../../utils/auth-helper';

const LICENSE_PHOTO_PATH = 'C:/Users/jmason/Desktop/Playwright-tests/tests/photos/agentWorkforce.jpg';

const getTimestamp = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${yyyy}${mm}${dd}-${hh}${min}`;
};

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
  await page.evaluate(() => {
    const canvasEl = document.querySelector('canvas');
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(200, 60);
    ctx.lineTo(300, 20);
    ctx.stroke();
  });
};

const fillStripeCard = async (page: Page) => {
  const cardFrame = page.frameLocator('iframe').locator('input[name="cardnumber"]').first();
  if (await cardFrame.count()) {
    await cardFrame.fill('4019000098765439');
    await page.frameLocator('iframe').locator('input[name="exp-date"]').first().fill('1234');
    await page.frameLocator('iframe').locator('input[name="cvc"]').first().fill('999');
    const postalInput = page.frameLocator('iframe').locator('input[name="postal"]').first();
    if (await postalInput.count()) {
      await postalInput.fill('90210');
    }
    return;
  }

  const fallbackCard = page.locator('input[name="cardnumber"]').first();
  if (await fallbackCard.count()) {
    await fallbackCard.fill('4019000098765439');
    await page.locator('input[name="exp-date"]').first().fill('1234');
    await page.locator('input[name="cvc"]').first().fill('999');
    const postalInput = page.locator('input[name="postal"]').first();
    if (await postalInput.count()) {
      await postalInput.fill('90210');
    }
  }
};

const refreshScheduleIfNeeded = async (page: Page) => {
  // Clear search and nudge the date to refresh results.
  const searchBox = page.getByRole('textbox', { name: 'Search' });
  if (await searchBox.count()) {
    await searchBox.fill('');
  }

  const dayButtons = page.getByRole('button').filter({ hasText: /^\d{2}$/ });
  if (await dayButtons.count()) {
    await dayButtons.first().click({ force: true });
    await page.waitForTimeout(2000);
    if ((await dayButtons.count()) > 1) {
      await dayButtons.nth(1).click({ force: true });
      await page.waitForTimeout(2000);
    }
  }

  const todayButton = page.locator('button').filter({
    has: page.locator('img[alt="today"], img[aria-label="today"]'),
  }).first();
  if (await todayButton.count()) {
    await todayButton.click({ force: true });
  }

  await page.waitForTimeout(5000);
};

const closeBlockingDialogIfPresent = async (page: Page) => {
  const dialog = page.getByRole('dialog').first();
  if (await dialog.count()) {
    const dialogButton = dialog.getByRole('button', { name: /Yes|OK|Confirm|Continue|Close/i }).first();
    if (await dialogButton.count()) {
      await dialogButton.click({ force: true });
    }
  }
};

/** Wait for ion-loading and consent/fraud modals to close so Next/other buttons are clickable. */
const waitForIonicIdle = async (page: Page, timeoutMs = 15000) => {
  await page.locator('ion-loading').waitFor({ state: 'hidden', timeout: timeoutMs }).catch(() => {});
  const consentModal = page.locator('ion-modal').filter({ has: page.getByRole('button', { name: /I Agree & Understand/i }) });
  await consentModal.waitFor({ state: 'hidden', timeout: timeoutMs }).catch(() => {});
  await page.waitForTimeout(500);
};

const clickCenter = async (page: Page, locator: ReturnType<Page['locator']>) => {
  const handle = await locator.elementHandle();
  if (!handle) return;
  const box = await handle.boundingBox();
  if (!box) return;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
};

const fillLabeledInput = async (page: Page, label: string | RegExp, value: string) => {
  const labelLocator = page.getByText(label).first();
  if (await labelLocator.count()) {
    const input = labelLocator.locator('..').locator('input, textarea').first();
    if (await input.count()) {
      await input.click({ force: true });
      await input.fill(value);
      return;
    }
  }
  const fallback = page.getByRole('textbox', { name: label }).first();
  if (await fallback.count()) {
    await fallback.click({ force: true });
    await fallback.fill(value);
  }
};

const setDateOfBirth = async (page: Page, dateLabel = 'Date of Birth', dateValue = '01/01/1990') => {
  const dateInput = page.getByText(dateLabel).locator('..').locator('input, textarea').first();
  if (await dateInput.count()) {
    await dateInput.click({ force: true });
    await dateInput.fill(dateValue);
    return;
  }

  const calendarButton = page.getByRole('button', { name: /Open calendar/i }).first();
  if (await calendarButton.count()) {
    await calendarButton.click({ force: true });
    const yearCombo = page.getByRole('combobox', { name: /Year/i }).first();
    if (await yearCombo.count()) {
      await yearCombo.click({ force: true });
      await page.getByText('1990').click({ force: true });
    }
    const dayButton = page.getByRole('button', { name: /January 1, 1990|Jan 1, 1990|January 1,/i }).first();
    if (await dayButton.count()) {
      await dayButton.click({ force: true });
    }
    const applyButton = page.getByRole('button', { name: /Apply/i }).first();
    if (await applyButton.count()) {
      await applyButton.click({ force: true });
    }
  }
};

const answerDrivingPromptYes = async (page: Page) => {
  const prompt = page.getByText('Will you be driving at all?').locator('visible=true').first();
  console.log('Waiting for driving prompt...');
  await expect(prompt).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(5000); // 5s sleep for Ionic modal stability

  // Wait for any active backdrop to hide before attempting clicks
  await page.locator('ion-backdrop').waitFor({ state: 'hidden', timeout: 3000 }).catch(() => { });

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    if (!(await prompt.isVisible())) {
      console.log('Driving prompt is gone.');
      return true;
    }
    console.log(`Answering "Yes" to driving prompt, attempt ${attempt}...`);

    // Strict visible locator for the duplicate hidden DOM issue
    const yesSelectors = [
      page.locator('button.teal-button[matripple]').filter({ hasText: /^Yes$/i }).locator('visible=true').first(),
      page.getByRole('button', { name: 'Yes', exact: true }).locator('visible=true').first(),
      page.getByText('Yes', { exact: true }).locator('visible=true').first()
    ];

    for (const selector of yesSelectors) {
      if (await selector.count()) {
        try {
          await selector.click({ timeout: 2000, force: true }).catch(() => { });
          await page.waitForTimeout(500);
          if (!(await prompt.isVisible({ timeout: 500 }))) return true;

          // Coordinate fallback on strictly visible button
          const box = await selector.boundingBox();
          if (box && box.width > 0 && box.height > 0) {
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
            await page.waitForTimeout(500);
          }
          if (!(await prompt.isVisible({ timeout: 500 }))) return true;
        } catch (e: any) {
          // ignore
        }
      }
    }

    // Modal center click (absolute viewport center)
    const size = page.viewportSize();
    if (size) {
      await page.mouse.click(size.width / 2, size.height / 2 - 50); // Slightly above center
    }
    await page.waitForTimeout(2000);
  }
  return !(await prompt.isVisible());
};

const findReservationCard = (page: Page, reservationName: string) =>
  page.getByText(reservationName, { exact: true }).first()
    .or(page.getByRole('heading', { name: reservationName }).first());

test.describe('Pendo reservation creation and launch', () => {
  test('should create reservation, check in, and complete launch', async ({ page }) => {
    test.setTimeout(180000);

    const authHelper = new AuthHelper(page);
    await authHelper.login('employee');

    const timestamp = getTimestamp();
    const firstName = 'Playwright';
    const lastName = timestamp;
    const email = `joshuamason+${timestamp}@vquip.com`;

    // Create reservation
    const createUrl = '/reservation/create/product?launchType=create';
    await page.goto(createUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const createReservationHeader = page.getByText('Create Reservation');
    if (!(await createReservationHeader.isVisible({ timeout: 8000 }))) {
      const createTab = page.getByRole('tab', { name: 'Create' });
      await createTab.scrollIntoViewIfNeeded();
      try {
        await createTab.click({ force: true });
      } catch {
        await page.evaluate(() => {
          const tab = Array.from(document.querySelectorAll('[role="tab"]'))
            .find((el) => el.textContent?.trim().includes('Create'));
          tab?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
      }
    }

    await page.waitForURL(/\/reservation\/create\/product/, { timeout: 30000 });
    await createReservationHeader.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const getFieldButton = (label: string) => page.getByText(label).locator('..').locator('button').first();

    const inventoryTypeLabel = page.getByText('Inventory Type');
    await inventoryTypeLabel.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);
    const inventoryTypeButton = page.locator('ion-select[formcontrolname="inventoryType"]')
      .or(page.locator('#ion-sel-0'))
      .or(getFieldButton('Inventory Type'))
      .first();
    await expect(inventoryTypeButton).toBeEnabled({ timeout: 30000 });
    await inventoryTypeButton.click({ force: true });
    await page.getByRole('radio', { name: 'UFO' }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);

    const loadingDialog = page.getByRole('dialog', { name: /Loading Products/i });
    if (await loadingDialog.count()) {
      await loadingDialog.waitFor({ state: 'hidden', timeout: 30000 });
    }
    await page.waitForTimeout(1000);

    const productLabel = page.getByText('Product');
    if (await productLabel.count()) {
      const productButton = getFieldButton('Product');
      if (await productButton.isEnabled()) {
        await productButton.click({ force: true });
        await page.getByRole('radio').first().click();
        await page.getByRole('button', { name: 'OK' }).click();
        await page.waitForTimeout(1000);
      }
    }

    const timeLabel = page.getByText('Choose Time');
    await timeLabel.waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);
    const timeSelect = page.locator('ion-select[formcontrolname="timeSlot"], ion-select[formcontrolname="startTime"], ion-select[formcontrolname="time"]').first();
    const timeButton = (await timeSelect.count())
      ? timeSelect
      : getFieldButton('Choose Time');
    await expect(timeButton).toBeEnabled({ timeout: 30000 });
    await timeButton.click({ force: true });
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);

    const quantitySelect = page.locator('ion-select[formcontrolname="quantity"]').first();
    const quantityButton = (await quantitySelect.count())
      ? quantitySelect
      : getFieldButton('Quantity');
    await expect(quantityButton).toBeEnabled({ timeout: 30000 });
    await quantityButton.click({ force: true });
    await page.getByRole('radio', { name: '1', exact: true }).click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.waitForTimeout(1000);

    const nextButton = page.getByRole('button', { name: 'Next' });
    await nextButton.scrollIntoViewIfNeeded();
    await expect(nextButton).toBeEnabled({ timeout: 30000 });
    await nextButton.click({ force: true });
    if (!(await page.getByText('Customer Information').isVisible({ timeout: 8000 }))) {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find((el) => el.textContent?.trim() === 'Next');
        if (btn) btn.click();
      });
    }
    await page.getByText('Customer Information').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const firstNameInput = page.getByText(/First Name/i).locator('..').getByRole('textbox')
      .or(page.getByRole('textbox').nth(0));
    const lastNameInput = page.getByText(/Last Name/i).locator('..').getByRole('textbox')
      .or(page.getByRole('textbox').nth(1));
    const emailInput = page.getByText(/Email/i).locator('..').getByRole('textbox')
      .or(page.getByRole('textbox').nth(2));

    await firstNameInput.fill(firstName);
    await lastNameInput.fill(lastName);
    await emailInput.fill(email);
    const infoNext = page.getByRole('button', { name: 'Next' });
    await infoNext.scrollIntoViewIfNeeded();
    await expect(infoNext).toBeEnabled({ timeout: 30000 });
    await infoNext.click({ force: true });
    if (!(await page.getByText('Payment').isVisible({ timeout: 8000 }))) {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find((el) => el.textContent?.trim() === 'Next');
        if (btn) btn.click();
      });
    }
    await page.getByText('Payment').waitFor({ state: 'visible', timeout: 30000 });
    await page.waitForTimeout(1000);

    const confirmReservation = page.getByRole('button', { name: 'Confirm Reservation' });
    await confirmReservation.scrollIntoViewIfNeeded();
    await expect(confirmReservation).toBeEnabled({ timeout: 30000 });
    await confirmReservation.click({ force: true });
    if (!(await page.getByRole('tab', { name: /Schedule/i }).isVisible({ timeout: 8000 }))) {
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button'))
          .find((el) => el.textContent?.trim() === 'Confirm Reservation');
        if (btn) btn.click();
      });
    }
    await page.waitForURL(/\/app\/tabs\/schedule/);
    await page.waitForTimeout(2000);

    // Find reservation on home page
    const reservationName = `${firstName} ${lastName}`;
    const searchBox = page.getByRole('textbox', { name: 'Search' });
    await searchBox.fill(reservationName);
    let reservationCard = findReservationCard(page, reservationName);
    if (!(await reservationCard.isVisible({ timeout: 10000 }))) {
      await refreshScheduleIfNeeded(page);
      await searchBox.fill(reservationName);
      reservationCard = findReservationCard(page, reservationName);
    }
    if (!(await reservationCard.isVisible({ timeout: 10000 }))) {
      await page.goto('/app/tabs/schedule', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      await searchBox.fill(reservationName);
      reservationCard = findReservationCard(page, reservationName);
    }
    await reservationCard.waitFor({ state: 'visible', timeout: 30000 });
    await reservationCard.click({ force: true });

    // Start check-in
    await page.getByRole('button', { name: /Check-In Rental/i }).click();
    await page.waitForURL(/\/check-in\/\d+\/guest-list/);

    // Click the assigned employee row
    const employeeRow = page.locator('ion-item').filter({ hasText: 'Assigned Employee' }).first();
    await expect(employeeRow).toBeVisible({ timeout: 10000 });
    await employeeRow.click({ force: true });

    // Wait for the popover/alert to appear and click an option
    await page.waitForTimeout(1000);
    const firstEmployeeOption = page.locator('ion-popover ion-item, ion-select-popover ion-item, ion-radio, .alert-radio-button')
      .filter({ hasText: /[a-zA-Z]/ }).first();
    await firstEmployeeOption.click({ force: true });
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Open individual guest form - using codegen discovered 'Form' text
    const guestItem = page.locator('ion-item, .item').filter({ hasText: new RegExp(`${firstName}|${lastName}`, 'i') });
    const formButton = guestItem.getByText('Form').first()
      .or(guestItem.getByRole('button', { name: /Form|Incomplete/i }).first())
      .or(guestItem.locator('button').first())
      .or(page.getByRole('heading', { name: `${firstName} ${lastName}` }));

    await formButton.scrollIntoViewIfNeeded();
    await formButton.click({ force: true });

    // 1. Wait for the modal conditionally so we don't crash if it's skipped
    const drivingPrompt = page.getByText('Will you be driving at all?').first();
    const isDrivingPromptVisible = await drivingPrompt.waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);

    if (isDrivingPromptVisible) {
      // 2. The Golden Rule for Ionic: Wait for the slide-up animation to finish
      await page.waitForTimeout(1000);

      // 3. Find the Yes button and force a native browser click
      const yesButton = page.locator('button').filter({ hasText: 'Yes' }).first();
      await yesButton.dispatchEvent('click');

      // 4. Do not take another step until the modal is completely gone
      await drivingPrompt.waitFor({ state: 'hidden', timeout: 15000 });

      // 5. Wait for the slide-down animation to finish
      await page.waitForTimeout(1000);
    }

    // Fill inputs (phone number filled once only)
    await fillLabeledInput(page, 'Phone Number', '9105551234');

    await closeBlockingDialogIfPresent(page);
    await page.waitForTimeout(2000);

    await fillLabeledInput(page, /Valid U\.S\. or Foreign Driver's License|Driver's\/Operator's License/i, 'none');
    await fillLabeledInput(page, 'Address', '1 main st');
    await fillLabeledInput(page, 'City', 'mobile');

    // --- NO HACKS NEEDED. GO STRAIGHT TO STATE ---

    // 1. State below the fold. Use combobox name "State" in form container; fallback to last mat-select (State is last of 3).
    const formWithCityAndState = page.locator('*').filter({ has: page.getByRole('textbox', { name: 'City' }) }).filter({ has: page.getByText('State', { exact: true }) }).first();
    const stateLabel = formWithCityAndState.getByText('State', { exact: true }).first();
    await stateLabel.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    const stateByRole = formWithCityAndState.getByRole('combobox', { name: 'State', exact: true }).first();
    const stateSelect = (await stateByRole.count()) > 0 ? stateByRole : formWithCityAndState.locator('mat-select').last();
    await stateSelect.scrollIntoViewIfNeeded();
    await stateSelect.waitFor({ state: 'visible', timeout: 15000 });
    // Open the state dropdown (only click it once)
    await stateSelect.click({ force: true });
    await page.waitForTimeout(1000); // Wait for animation

    // Find "Alabama" inside any possible Ionic container or just generally visible on screen
    const alabamaOption = page.locator('ion-popover, ion-select-popover, ion-alert, .alert-wrapper')
      .getByText('Alabama', { exact: true }).first()
      .or(page.getByRole('radio', { name: 'Alabama', exact: true }).first())
      .or(page.getByText('Alabama', { exact: true }).locator('visible=true').first());

    await alabamaOption.waitFor({ state: 'visible', timeout: 5000 });
    await alabamaOption.click({ force: true });

    // Click OK if it's an ion-alert style dropdown
    const okBtn = page.locator('.alert-button-group button').filter({ hasText: /OK|Done|Confirm/i }).first();
    if (await okBtn.isVisible({ timeout: 2000 })) {
      await okBtn.click({ force: true });
    }
    await page.waitForTimeout(1000); // Let the popover close 

    await fillLabeledInput(page, 'Postal Code', '36601');

    // Date of Birth - type directly instead of using calendar
    const dobInput = page.getByText('Date of Birth').locator('..').locator('input, textarea').first()
      .or(page.getByRole('textbox', { name: /Date of Birth/i }).first());
    await dobInput.click({ force: true });
    await dobInput.fill('01/01/1990');

    await page.getByRole('button', { name: 'Next' }).click();

    // Documents — wait for loading, then dismiss FRAUD WARNING (and any other doc modals) before Next
    await page.getByText('Loading documents').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {});
    
    // 2. Use a while loop to dismiss ANY number of sequential auto-opening document modals
    let moreDocuments = true;
    let docAttempts = 0;
    while (moreDocuments && docAttempts < 5) {
      docAttempts++;
      // Give Ionic time to fully animate the modal into view
      await page.waitForTimeout(2000); 
      
      const allAgreeBtns = page.locator('button, ion-button').filter({ hasText: /I AGREE & UNDERSTAND/i })
        .or(page.getByRole('button', { name: /I Agree & Understand/i }));

      const count = await allAgreeBtns.count();
      let clicked = false;
      
      // Iterate through all matches, find the one that is currently visible, and click it
      for (let i = 0; i < count; i++) {
        const btn = allAgreeBtns.nth(i);
        if (await btn.isVisible()) {
          await btn.click({ force: true });
          clicked = true;
          break; // Only click one per loop iteration
        }
      }

      if (!clicked) {
        moreDocuments = false; // No more active modals
      }
    }
    
    // 3. Do not use force: true so Playwright verifies the screen is clear
    await page.locator('documents-page').getByRole('button', { name: 'Next' }).first().click();
    // License photo
    await page.getByRole('button', { name: /Upload Driver's License/i }).click({ force: true });
    await page.locator('input[type="file"]').first().setInputFiles(LICENSE_PHOTO_PATH);
    await page.getByRole('button', { name: 'Next' }).click();

    // Registration complete -> Back to Guest List
    await page.getByRole('heading', { name: /Your registration is complete/i }).waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000); // Wait for Ionic transition
    
    // Per codegen, "Back to Guest List" works directly.
    await page.getByRole('button', { name: 'Back to Guest List' }).click();
    
    // Check In page -> Insurance
    await page.getByRole('button', { name: 'Insurance' }).click();
    
    // Select Insurance matching codegen click
    const insuranceOption = page.getByText(/UFO Incomplete|Standard/i).first();
    await insuranceOption.waitFor({ state: 'visible' });
    await insuranceOption.click();
    
    await page.getByRole('button', { name: 'Choose', exact: true }).click({ force: true });
    await page.getByRole('button', { name: 'Choose Payment' }).click({ force: true });
    
    // Adding Card Details directly 
    await page.getByRole('button', { name: 'Add Card Details' }).click({ force: true });
    await page.getByRole('textbox', { name: 'Card Number' }).click();
    await page.getByRole('textbox', { name: 'Card Number' }).fill('4012000098765439');
    
    await page.getByRole('textbox', { name: 'Cardholder Name' }).click();
    await page.getByRole('textbox', { name: 'Cardholder Name' }).fill(`${firstName} ${lastName}`);
    await page.waitForTimeout(500);
    
    // Open Expiry Month
    const monthSelect = page.getByRole('button', { name: 'MM, Month' }).first()
      .or(page.locator('ion-select[formcontrolname="expirationMonth"]').first());
    await monthSelect.click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: /^12$/ }).first().click({ force: true });
    await page.waitForTimeout(1000); // Wait for month dropdown action-sheet to close
    
    // Open Expiry Year
    const yearSelect = page.getByRole('button', { name: 'YY, Year' }).first()
      .or(page.locator('ion-select[formcontrolname="expirationYear"]').first());
    await yearSelect.click({ force: true });
    await page.waitForTimeout(500);
    await page.locator('button').filter({ hasText: '2032' }).first().click({ force: true });
    await page.waitForTimeout(1000); // Wait for year dropdown to close
    
    // CVV
    const cvvInput = page.getByRole('textbox', { name: 'CVV' }).first()
      .or(page.locator('input[formcontrolname="cvv"]').first());
    await cvvInput.click({ force: true });
    await cvvInput.fill('999');
    await page.waitForTimeout(500);
    
    // Save Payment
    await page.getByRole('button', { name: /Save Payment/i }).click({ force: true });
    await page.waitForTimeout(1000);

    // Click all consent checkboxes for payment (there are multiple!)
    const paymentCheckboxes = page.locator('ion-checkbox');
    const checkboxCount = await paymentCheckboxes.count();
    for (let i = 0; i < checkboxCount; i++) {
      if (await paymentCheckboxes.nth(i).isVisible()) {
        await paymentCheckboxes.nth(i).click({ force: true });
        await page.waitForTimeout(200);
      }
    }
    
    // Complete Purchase
    await page.getByRole('button', { name: 'Complete Purchase' }).click({ force: true });
    await page.getByRole('button', { name: 'Back to Product Insurance List' }).click();
    
    // Complete check-in
    await page.getByRole('button', { name: 'Check In' }).click();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    // Launch Steps form codegen
    await page.getByRole('img').nth(1).first().click(); // This corresponds to the user clicking the first launch step / Attestation
    await page.getByText('Accept All').click();
    await page.getByRole('button', { name: 'Sign' }).click();
    
    // Consents
    await page.locator('ion-checkbox').filter({ hasText: 'I consent to electronic' }).click();
    await page.locator('ion-checkbox').filter({ hasText: 'I can read and understand' }).click();
    await page.getByRole('button', { name: 'I Agree' }).click();
    
    await signOnCanvas(page); // Use our helper
    await page.getByRole('button', { name: 'Sign' }).click();

    // Secondary sign for employee as caught by codegen
    if (await page.locator('div').filter({ hasText: 'Select Employee' }).count() > 0) {
      await page.locator('div').filter({ hasText: 'Select Employee' }).last().click();
      await page.getByText('. .').first().click();
      await page.locator('ion-checkbox').filter({ hasText: 'I consent to electronic' }).click();
      await page.locator('ion-checkbox').filter({ hasText: 'I can read and understand' }).click();
      await page.getByRole('button', { name: 'I Agree' }).click();
      
      await signOnCanvas(page); // Use our helper
      await page.getByRole('button', { name: 'Sign' }).click();
    }

    await page.getByRole('button', { name: 'Apply Signature and Launch' }).click();
    
    await page.waitForURL(/\/app\/tabs\/schedule/, { timeout: 30000 });
    await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible({ timeout: 30000 });

    // --- End Rental Flow ---
    const reservationCardAfterLaunch = findReservationCard(page, reservationName);
    await reservationCardAfterLaunch.click({ force: true });

    // Initiate End Rental
    const endRentalBtn = page.getByRole('button', { name: /End Rental/i });
    await endRentalBtn.waitFor({ state: 'visible', timeout: 10000 });
    await endRentalBtn.click();

    // Confirm End Rental in modal
    const confirmEndRental = page.getByRole('button', { name: 'End Rental', exact: true });
    if (await confirmEndRental.isVisible({ timeout: 5000 })) {
      await confirmEndRental.click();
    }

    // End Rental Flow - Injuries/Damages
    const noInjuries = page.getByText('No', { exact: true }).first();
    if (await noInjuries.isVisible({ timeout: 10000 })) {
      await noInjuries.click();
    }
    const confirmEnd = page.getByRole('button', { name: /Confirm End Rental/i });
    if (await confirmEnd.isVisible({ timeout: 5000 })) {
      await confirmEnd.click();
    }

    // Renter Signoff
    const signButton = page.getByRole('button', { name: 'Sign' });
    if (await signButton.isVisible({ timeout: 10000 })) {
      await signButton.click();
      await signOnCanvas(page);
      const agreeBtn = page.getByRole('button', { name: /I Agree/i });
      if (await agreeBtn.isVisible({ timeout: 5000 })) {
        await agreeBtn.click();
      }
    }

    // Tip Screen -> Select No Tip
    const noTipBtn = page.getByRole('button', { name: /No Tip/i });
    if (await noTipBtn.isVisible({ timeout: 10000 })) {
      await noTipBtn.click();
    }
    await page.getByRole('button', { name: 'Next' }).click();

    // Photos Screen -> Next
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 9: Rate Us Screen Verification (QA Flow Test Case)
    await expect(page.getByText('Rate Us')).toBeVisible({ timeout: 15000 });

    // Click the 3rd star to give a 3-star rating
    const thirdStar = page.locator('ngx-stars .star-icon').nth(2);
    await thirdStar.waitFor({ state: 'visible' });
    await thirdStar.click();

    // Proceed
    await page.getByRole('button', { name: 'Next' }).click();

    // Step 10: Customer Review Screen Verification (QA Flow Test Case)
    await expect(page.getByText('Customer Review')).toBeVisible({ timeout: 15000 });

    // Locate the textarea
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

    // Step 12: Verification - Returns back to schedule
    await page.waitForURL(/.*\/app\/tabs\/schedule/, { timeout: 30000 });
    console.log('✅ Full End-to-end rental flow completed successfully!');
  });
});
