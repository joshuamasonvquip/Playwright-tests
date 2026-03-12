/**
 * VQuip Lens - Input Validation Tests
 * 
 * Tests for numeric field validation based on PDF specification.
 * 
 * VALIDATION RANGES FROM PDF:
 * - Quantity of Slips: 1-999
 * - Length of Slip Finger (Inland Finger): 9-140
 * - Vessel Length (Inland Side Tie): 13-150
 * - Vessel Length (Coastal): 16-110
 * - Side Tie Width: 1+
 * - Side Tie Length: 1+
 * - Length of Section (Bulkhead): 1+
 * 
 * MISSING FIELDS IDENTIFIED:
 * - Fixed Pier + Pier with Fingers: T-Head Width, T-Head Length
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

const LOGIN_URL = 'https://login.insurance.dev.vquip.io/auth/login';
const EVALUATION_CREATE_URL = '**/evaluation/create';

const VALID_CREDENTIALS = {
  username: 'joshuamason+dev@vquip.com',
  password: 'vQuip123!'
};

// Expected validation ranges from PDF
const VALIDATION_RANGES = {
  quantityOfSlips: { min: 1, max: 999 },
  lengthOfSlipFinger: { min: 9, max: 140 },
  vesselLengthInland: { min: 13, max: 150 },
  vesselLengthCoastal: { min: 16, max: 110 },
  sideTieWidth: { min: 1, max: null },
  sideTieLength: { min: 1, max: null },
  lengthOfSection: { min: 1, max: null }
};

/**
 * Helper function to login and navigate to create evaluation page
 */
async function loginAndNavigateToCreate(page: Page, context: BrowserContext): Promise<Page> {
  await page.goto(LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(VALID_CREDENTIALS.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(VALID_CREDENTIALS.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  const [lensPage] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('text=Lens').first().click()
  ]);
  
  await lensPage.waitForURL('**/evaluation/list', { timeout: 15000 });
  await lensPage.getByRole('button', { name: 'New Evaluation' }).click();
  await lensPage.waitForURL(EVALUATION_CREATE_URL, { timeout: 10000 });
  
  return lensPage;
}

test.describe('VQuip Lens - Missing Fields Detection', () => {
  
  test('TC-MISSING-001: Fixed Pier with Fingers should have T-Head Width field', async ({ page, context }) => {
    const lensPage = await loginAndNavigateToCreate(page, context);
    
    // Select Fixed Pier
    await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
    await lensPage.getByRole('option', { name: 'Fixed Pier' }).click();
    await lensPage.waitForTimeout(500);
    
    // Select Pier with Fingers
    await lensPage.getByRole('combobox', { name: 'Layout' }).click();
    await lensPage.getByRole('option', { name: 'Pier with Fingers' }).click();
    await lensPage.waitForTimeout(500);
    
    // Check for T-Head Width field (per PDF specification)
    // This test will FAIL if the field is missing (which it currently is)
    await expect(lensPage.getByText('T-Head Width')).toBeVisible({ timeout: 5000 });
  });
  
  test('TC-MISSING-002: Fixed Pier with Fingers should have T-Head Length field', async ({ page, context }) => {
    const lensPage = await loginAndNavigateToCreate(page, context);
    
    // Select Fixed Pier
    await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
    await lensPage.getByRole('option', { name: 'Fixed Pier' }).click();
    await lensPage.waitForTimeout(500);
    
    // Select Pier with Fingers
    await lensPage.getByRole('combobox', { name: 'Layout' }).click();
    await lensPage.getByRole('option', { name: 'Pier with Fingers' }).click();
    await lensPage.waitForTimeout(500);
    
    // Check for T-Head Length field (per PDF specification)
    // This test will FAIL if the field is missing (which it currently is)
    await expect(lensPage.getByText('T-Head Length')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('VQuip Lens - Input Validation Tests', () => {
  
  test.describe('Quantity of Slips Validation (1-999)', () => {
    
    test('TC-VAL-001: Quantity of Slips should have min/max attributes', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Quantity of Slips/i });
      const minAttr = await input.getAttribute('min');
      const maxAttr = await input.getAttribute('max');
      
      // These should have validation attributes per PDF
      expect(minAttr).toBe('1');
      expect(maxAttr).toBe('999');
    });
    
    test('TC-VAL-002: Quantity of Slips should reject 0', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Quantity of Slips/i });
      await input.fill('0');
      await lensPage.waitForTimeout(200);
      
      // Check for validation error or that value is corrected
      // Option 1: Input should show error state
      // Option 2: Value should be auto-corrected to minimum
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.quantityOfSlips.min);
    });
    
    test('TC-VAL-003: Quantity of Slips should reject 1000', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Quantity of Slips/i });
      await input.fill('1000');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(VALIDATION_RANGES.quantityOfSlips.max);
    });
    
    test('TC-VAL-004: Quantity of Slips should reject negative numbers', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Quantity of Slips/i });
      await input.fill('-5');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.quantityOfSlips.min);
    });
  });
  
  test.describe('Length of Slip Finger Validation (9-140)', () => {
    
    test('TC-VAL-005: Length of Slip Finger should have min/max attributes', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i });
      const minAttr = await input.getAttribute('min');
      const maxAttr = await input.getAttribute('max');
      
      expect(minAttr).toBe('9');
      expect(maxAttr).toBe('140');
    });
    
    test('TC-VAL-006: Length of Slip Finger should reject 5 (below min 9)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i });
      await input.fill('5');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.lengthOfSlipFinger.min);
    });
    
    test('TC-VAL-007: Length of Slip Finger should reject 150 (above max 140)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i });
      await input.fill('150');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(VALIDATION_RANGES.lengthOfSlipFinger.max);
    });
  });
  
  test.describe('Vessel Length Validation - Inland Side Tie (13-150)', () => {
    
    test('TC-VAL-008: Vessel Length (Inland) should reject 10 (below min 13)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i });
      await input.fill('10');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.vesselLengthInland.min);
    });
    
    test('TC-VAL-009: Vessel Length (Inland) should reject 160 (above max 150)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i });
      await input.fill('160');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(VALIDATION_RANGES.vesselLengthInland.max);
    });
  });
  
  test.describe('Vessel Length Validation - Coastal (16-110)', () => {
    
    test('TC-VAL-010: Vessel Length (Coastal) should reject 10 (below min 16)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Coastal - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Vessel Length (ft)' });
      await input.fill('10');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.vesselLengthCoastal.min);
    });
    
    test('TC-VAL-011: Vessel Length (Coastal) should reject 120 (above max 110)', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Coastal - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Vessel Length (ft)' });
      await input.fill('120');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeLessThanOrEqual(VALIDATION_RANGES.vesselLengthCoastal.max);
    });
  });
  
  test.describe('Side Tie Dimensions Validation (min 1)', () => {
    
    test('TC-VAL-012: Side Tie Width should reject 0', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Side Tie Width (ft)' });
      await input.fill('0');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.sideTieWidth.min);
    });
    
    test('TC-VAL-013: Side Tie Length should reject negative numbers', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      await lensPage.waitForTimeout(500);
      
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Side Tie Length (ft)' });
      await input.fill('-10');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.sideTieLength.min);
    });
  });
  
  test.describe('Bulkhead Length of Section Validation (min 1)', () => {
    
    test('TC-VAL-014: Length of Section should reject 0', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Bulkhead / Seawall' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Length of Section' });
      await input.fill('0');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.lengthOfSection.min);
    });
    
    test('TC-VAL-015: Length of Section should reject negative numbers', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Bulkhead / Seawall' }).click();
      await lensPage.waitForTimeout(500);
      
      const input = lensPage.getByRole('spinbutton', { name: 'Length of Section' });
      await input.fill('-5');
      await lensPage.waitForTimeout(200);
      
      const value = await input.inputValue();
      expect(parseInt(value)).toBeGreaterThanOrEqual(VALIDATION_RANGES.lengthOfSection.min);
    });
  });
});
