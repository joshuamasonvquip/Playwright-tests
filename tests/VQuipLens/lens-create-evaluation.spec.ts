/**
 * VQuip Lens - Create Evaluation Tests
 * 
 * Tests for the evaluation creation page with conditional dropdown logic
 * based on dock system type and berthing/layout selections.
 * 
 * FIELD DOCUMENTATION (verified via browser inspection):
 * 
 * 1. INLAND - FLOATING DOCK
 *    Base: Type of Construction Material, Decking Material, Type of Mooring,
 *          Quantity of Slips, Utilities, Type of Berthing
 *    + Finger Berthing: Length of Slip Finger, Is Slip Covered, Slip Loading, Dock Geometry
 *    + Side Tie: Length of Slip Finger, Side Tie Width, Side Tie Length (NO Dock Geometry)
 * 
 * 2. COASTAL - FLOATING DOCK
 *    Base: Type of Construction Material, Piling Type, Dock System Construction,
 *          Number of Slips, Utilities, Type of Berthing
 *    + Finger Berthing: Vessel Length, Finger Type, Slip Loading, Dock Geometry
 *    + Side Tie: Vessel Length, Side Tie Width, Side Tie Length (NO Dock Geometry)
 * 
 * 3. FIXED PIER
 *    Base: Construction, Type of Decking, Type of Hardware, Layout,
 *          Quantity of Slips, Electrical Service, Potable Water
 *    + Pier with Fingers: Width/Length of Walkway, Number of Fingers, Avg Width/Length of Fingers, Mooring Piles
 *    + Pier without Fingers: Width of Pier, Length of Pier, Handrail Configuration
 * 
 * 4. BULKHEAD / SEAWALL
 *    Section-based (no berthing): Panel Construction, Length of Section,
 *    Height of Panel, Cap Construction, Toe Present
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Constants
const LOGIN_URL = 'https://login.insurance.dev.vquip.io/auth/login';
const EVALUATION_CREATE_URL = '**/evaluation/create';

const VALID_CREDENTIALS = {
  username: 'joshuamason+dev@vquip.com',
  password: 'vQuip123!'
};

/**
 * Helper function to login and navigate to Lens create evaluation page
 */
async function loginAndNavigateToCreate(page: Page, context: BrowserContext): Promise<Page> {
  await page.goto(LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(VALID_CREDENTIALS.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(VALID_CREDENTIALS.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  
  // Click Lens app card - opens in new tab
  const [lensPage] = await Promise.all([
    context.waitForEvent('page'),
    page.locator('text=Lens').first().click()
  ]);
  
  await lensPage.waitForURL('**/evaluation/list', { timeout: 15000 });
  
  // Navigate to create page
  await lensPage.getByRole('button', { name: 'New Evaluation' }).click();
  await lensPage.waitForURL(EVALUATION_CREATE_URL, { timeout: 10000 });
  await expect(lensPage.getByRole('heading', { name: 'New Dock Evaluation' })).toBeVisible();
  
  return lensPage;
}

test.describe('VQuip Lens - Create Evaluation Page', () => {
  
  test.describe('Navigation', () => {
    
    test('TC-CREATE-001: Lens logo returns to Evaluations page', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('img', { name: 'Lens Logo' }).click();
      await lensPage.waitForURL('**/evaluation/list', { timeout: 10000 });
      await expect(lensPage.getByRole('heading', { name: 'Evaluations' })).toBeVisible();
    });
    
    test('TC-CREATE-002: Back button returns to Evaluations page', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      await lensPage.getByRole('button', { name: 'Back' }).click();
      await lensPage.waitForURL('**/evaluation/list', { timeout: 10000 });
      await expect(lensPage.getByRole('heading', { name: 'Evaluations' })).toBeVisible();
    });
  });
  
  test.describe('Inland - Floating Dock', () => {
    
    test('TC-INLAND-001: Base fields appear when selecting Inland Floating Dock', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select dock type
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      
      // Verify base fields appear
      await expect(lensPage.getByRole('combobox', { name: 'Type of Construction Material' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Decking Material' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Type of Mooring' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Quantity of Slips with the Same Size and Configuration' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Utilities' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Type of Berthing' })).toBeVisible();
    });
    
    test('TC-INLAND-002: Finger Berthing shows Dock Geometry, Is Slip Covered, Slip Loading', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Inland Floating Dock
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      
      // Select Finger Berthing
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      
      // Verify Finger Berthing specific fields
      await expect(lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Is Slip Covered' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Slip Loading' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Dock Geometry' })).toBeVisible();
    });
    
    test('TC-INLAND-003: Side Tie shows Side Tie Width/Length but NO Dock Geometry', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Inland Floating Dock
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      
      // Select Side Tie
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      
      // Verify Side Tie specific fields
      await expect(lensPage.getByRole('spinbutton', { name: /Length of Slip Finger/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Side Tie Width (ft)' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Side Tie Length (ft)' })).toBeVisible();
      
      // Verify Dock Geometry is NOT visible (specific to Finger Berthing only)
      await expect(lensPage.getByRole('combobox', { name: 'Dock Geometry' })).not.toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Is Slip Covered' })).not.toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Slip Loading' })).not.toBeVisible();
    });
  });
  
  test.describe('Coastal - Floating Dock', () => {
    
    test('TC-COASTAL-001: Base fields appear when selecting Coastal Floating Dock', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select dock type
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Coastal - Floating Dock' }).click();
      
      // Verify base fields (different from Inland)
      await expect(lensPage.getByRole('combobox', { name: 'Type of Construction Material' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Piling Type' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Dock System Construction' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Number of Slips' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Utilities' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Type of Berthing' })).toBeVisible();
    });
    
    test('TC-COASTAL-002: Finger Berthing shows Finger Type and Dock Geometry', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Coastal Floating Dock
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Coastal - Floating Dock' }).click();
      
      // Select Finger Berthing
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Finger Berthing' }).click();
      
      // Verify Coastal Finger Berthing specific fields
      await expect(lensPage.getByRole('spinbutton', { name: 'Vessel Length (ft)' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Finger Type' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Slip Loading' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Dock Geometry' })).toBeVisible();
    });
    
    test('TC-COASTAL-003: Side Tie shows Side Tie dimensions but NO Dock Geometry', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Coastal Floating Dock
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Coastal - Floating Dock' }).click();
      
      // Select Side Tie
      await lensPage.getByRole('combobox', { name: 'Type of Berthing' }).click();
      await lensPage.getByRole('option', { name: 'Side Tie' }).click();
      
      // Verify Coastal Side Tie specific fields
      await expect(lensPage.getByRole('spinbutton', { name: 'Vessel Length (ft)' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Side Tie Width (ft)' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Side Tie Length (ft)' })).toBeVisible();
      
      // Verify Dock Geometry is NOT visible for Side Tie
      await expect(lensPage.getByRole('combobox', { name: 'Dock Geometry' })).not.toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Finger Type' })).not.toBeVisible();
    });
  });
  
  test.describe('Fixed Pier', () => {
    
    test('TC-FIXED-001: Base fields appear when selecting Fixed Pier', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select dock type
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Fixed Pier' }).click();
      
      // Verify Fixed Pier base fields (completely different structure)
      await expect(lensPage.getByRole('combobox', { name: 'Construction' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Type of Decking' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Type of Hardware' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Layout' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Quantity of Slips' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Electrical Service' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Potable Water' })).toBeVisible();
      
      // Verify NO Type of Berthing (Fixed Pier uses Layout instead)
      await expect(lensPage.getByRole('combobox', { name: 'Type of Berthing' })).not.toBeVisible();
    });
    
    test('TC-FIXED-002: Pier with Fingers shows walkway and finger dimensions', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Fixed Pier
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Fixed Pier' }).click();
      
      // Select Pier with Fingers
      await lensPage.getByRole('combobox', { name: 'Layout' }).click();
      await lensPage.getByRole('option', { name: 'Pier with Fingers' }).click();
      
      // Verify Pier with Fingers specific fields
      await expect(lensPage.getByRole('spinbutton', { name: /Width of Walkway/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Length of Walkway/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Number of Fingers/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Average Width of Fingers/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Average Length of Fingers/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Quantity of Mooring Piles/i })).toBeVisible();
    });
    
    test('TC-FIXED-003: Pier without Fingers shows pier dimensions and handrail', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Fixed Pier
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Fixed Pier' }).click();
      
      // Select Pier without Fingers
      await lensPage.getByRole('combobox', { name: 'Layout' }).click();
      await lensPage.getByRole('option', { name: 'Pier without Fingers' }).click();
      
      // Verify Pier without Fingers specific fields
      await expect(lensPage.getByRole('spinbutton', { name: /Width of Pier/i })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Length of Pier/i })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: /Handrail Configuration/i })).toBeVisible();
      
      // Verify walkway/finger fields are NOT visible
      await expect(lensPage.getByRole('spinbutton', { name: /Width of Walkway/i })).not.toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: /Number of Fingers/i })).not.toBeVisible();
    });
  });
  
  test.describe('Bulkhead / Seawall', () => {
    
    test('TC-BULKHEAD-001: Section fields appear when selecting Bulkhead/Seawall', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select dock type
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Bulkhead / Seawall' }).click();
      
      // Verify Bulkhead/Seawall section fields (completely different structure)
      await expect(lensPage.getByRole('combobox', { name: 'Panel Construction' })).toBeVisible();
      await expect(lensPage.getByRole('spinbutton', { name: 'Length of Section' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Height of Panel' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Cap Construction' })).toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Toe Present' })).toBeVisible();
      
      // Verify NO Type of Berthing or Layout (Bulkhead uses sections)
      await expect(lensPage.getByRole('combobox', { name: 'Type of Berthing' })).not.toBeVisible();
      await expect(lensPage.getByRole('combobox', { name: 'Layout' })).not.toBeVisible();
    });
    
    test('TC-BULKHEAD-002: Add Another Section button is available', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Bulkhead/Seawall
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Bulkhead / Seawall' }).click();
      
      // Verify Add Another Section button exists
      await expect(lensPage.getByRole('button', { name: 'Add Another Section' })).toBeVisible();
    });
  });
  
  test.describe('Form Validation', () => {
    
    test('TC-FORM-001: Create Assessment button is disabled initially', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Button should be disabled without required fields
      await expect(lensPage.getByRole('button', { name: 'Create Assessment' })).toBeDisabled();
    });
    
    test('TC-FORM-002: Add Another Configuration is available for floating docks', async ({ page, context }) => {
      const lensPage = await loginAndNavigateToCreate(page, context);
      
      // Select Inland Floating Dock
      await lensPage.getByRole('combobox', { name: 'Dock System Type' }).click();
      await lensPage.getByRole('option', { name: 'Inland - Floating Dock' }).click();
      
      // Verify Add Another Configuration button exists
      await expect(lensPage.getByRole('button', { name: 'Add Another Configuration' })).toBeVisible();
    });
  });
});
