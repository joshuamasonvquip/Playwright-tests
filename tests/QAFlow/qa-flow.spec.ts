/**
 * QA Flow - Comprehensive Test Suite
 * 
 * This test file covers the complete QA Flow functionality by creating
 * its own test data. Each test is independent and reliable.
 */

import { test, expect, Page } from '@playwright/test';

// Configuration
const LOGIN_URL = 'https://login.dev.vquip.io/auth/login';
const QA_FLOW_URL = 'https://qa-flow.dev.vquip.io';
const CREDENTIALS = { username: 'joshua', password: 'vQuip123!' };

// Unique identifier for this test run to avoid conflicts
const TEST_ID = `AUTO_${Date.now()}`;

/**
 * Generate a unique name for test data
 */
function uniqueName(prefix: string): string {
  return `${prefix}_${TEST_ID}`;
}

/**
 * Login directly to QA Flow
 */
async function login(page: Page): Promise<void> {
  await page.goto(`${LOGIN_URL}?returnUrl=${encodeURIComponent(QA_FLOW_URL + '/test-runs')}`);
  await page.getByRole('textbox', { name: 'Username' }).fill(CREDENTIALS.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(CREDENTIALS.password);
  await page.getByRole('textbox', { name: 'Password' }).press('Enter');
  await expect(page.getByRole('button', { name: 'Create Test Run' })).toBeVisible({ timeout: 15000 });
}

/**
 * Navigate to Test Cases page
 */
async function goToTestCases(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Test Cases' }).click();
  await expect(page.getByRole('heading', { name: 'Test Areas', exact: true })).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to Test Runs page
 */
async function goToTestRuns(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Test Runs' }).click();
  await expect(page.getByRole('heading', { name: 'Test Run Dashboard' })).toBeVisible({ timeout: 10000 });
}

/**
 * Create a test area
 */
async function createTestArea(page: Page, name: string): Promise<void> {
  await page.locator('div').filter({ hasText: /^Test Areasadd$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('button', { name })).toBeVisible({ timeout: 10000 });
}

/**
 * Create a test case in the currently selected area
 */
async function createTestCase(page: Page, name: string, description?: string, notes?: string): Promise<void> {
  await page.locator('div').filter({ hasText: /^Test Casesadd$/ }).getByRole('button').click();
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  if (description) {
    await page.getByRole('textbox', { name: 'Description' }).fill(description);
  }
  if (notes) {
    await page.getByRole('textbox', { name: 'Notes' }).fill(notes);
  }
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('cell', { name })).toBeVisible({ timeout: 10000 });
}

/**
 * Select a test area by name
 */
async function selectTestArea(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name }).click();
  await expect(page.getByRole('heading', { name, level: 2 })).toBeVisible({ timeout: 10000 });
}

/**
 * Create a test run
 */
async function createTestRun(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Create Test Run' }).click();
  await page.getByRole('textbox', { name: 'Name' }).fill(name);
  await page.getByRole('button', { name: 'Create', exact: true }).click();
  await expect(page.getByRole('heading', { name })).toBeVisible({ timeout: 10000 });
}

// ============================================================================
// TEST SUITE
// ============================================================================

test.describe('QA Flow - Complete Test Suite', () => {

  test('TC-001: Complete QA Flow Workflow - Full Lifecycle', async ({ page }) => {
    const TEST_AREA_NAME = uniqueName('Area');
    const TEST_CASE_NAME = uniqueName('Case');
    const TEST_RUN_NAME = uniqueName('Run');
    
    await login(page);
    
    // STEP 1: Create Test Area
    await goToTestCases(page);
    await createTestArea(page, TEST_AREA_NAME);
    
    // STEP 2: Select the area and create a test case
    await selectTestArea(page, TEST_AREA_NAME);
    await createTestCase(page, TEST_CASE_NAME, 'Test case description', 'QA notes');
    
    // STEP 3: Create Test Run
    await goToTestRuns(page);
    await createTestRun(page, TEST_RUN_NAME);
    
    // STEP 4: Setup Test Run - select our test area
    await expect(page.getByRole('checkbox', { name: TEST_AREA_NAME })).toBeVisible({ timeout: 10000 });
    await page.getByRole('checkbox', { name: TEST_AREA_NAME }).check();
    
    // Begin Testing
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // STEP 5: Execute Test Case - wait for it to appear
    await expect(page.getByText(TEST_CASE_NAME)).toBeVisible({ timeout: 15000 });
    
    // Click the pass button (check icon) - use a more specific selector
    // The test case row contains: test name, info button, check, x, question mark buttons
    await page.locator(`text="${TEST_CASE_NAME}"`).locator('..').locator('button').filter({ hasText: 'check' }).first().click();
    
    // STEP 6: Complete Test Run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // STEP 7: Verify Results Page
    await expect(page.getByText(/Passed Total:/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC-002: Status Override - Approve Failed Test', async ({ page }) => {
    const areaName = uniqueName('ApproveArea');
    const caseName = uniqueName('ApproveCase');
    const runName = uniqueName('ApproveRun');
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test for approval');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case and mark as failed
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'close' }).first().click();
    
    // Complete test run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // On results page, verify failed section and approve it
    await expect(page.getByText(/Failed Total:/i)).toBeVisible({ timeout: 15000 });
    
    // Click the more_vert button in the Failed section
    await page.getByRole('region', { name: /Failed Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    
    // Verify "Approve" option is available and click it
    await expect(page.getByRole('menuitem', { name: 'Approve' })).toBeVisible();
    await page.getByRole('menuitem', { name: 'Approve' }).click();
    
    // Verify the test moved to Approved section
    await expect(page.getByText(/Approved Total:/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-003: Passed tests do NOT have Approve option', async ({ page }) => {
    const areaName = uniqueName('NoApproveArea');
    const caseName = uniqueName('NoApproveCase');
    const runName = uniqueName('NoApproveRun');
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test that passes');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case and mark as passed
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'check' }).first().click();
    
    // Complete test run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // On results page, expand Passed section
    await expect(page.getByText(/Passed Total:/i)).toBeVisible({ timeout: 15000 });
    
    // Expand if needed
    const passedSection = page.getByRole('button', { name: /Passed Total:/i });
    const isExpanded = await passedSection.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await passedSection.click();
    }
    
    // Click the more_vert button
    await page.getByRole('region', { name: /Passed Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    
    // Verify "Approve" is NOT available for passed tests
    await expect(page.getByRole('menuitem', { name: 'Approve' })).not.toBeVisible();
    
    // But "Mark as Retest" should be available
    await expect(page.getByRole('menuitem', { name: 'Mark as Retest' })).toBeVisible();
  });

  test('TC-004: Mark as Retest functionality', async ({ page }) => {
    const areaName = uniqueName('RetestArea');
    const caseName = uniqueName('RetestCase');
    const runName = uniqueName('RetestRun');
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test for retest');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case and mark as passed
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'check' }).first().click();
    
    // Complete test run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // On results page, expand Passed section and mark for retest
    await expect(page.getByText(/Passed Total:/i)).toBeVisible({ timeout: 15000 });
    
    const passedSection = page.getByRole('button', { name: /Passed Total:/i });
    const isExpanded = await passedSection.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await passedSection.click();
    }
    
    // Click the more_vert button and select Mark as Retest
    await page.getByRole('region', { name: /Passed Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    await page.getByRole('menuitem', { name: 'Mark as Retest' }).click();
    
    // Verify the test moved to Retest section
    await expect(page.getByText(/Retest Total:/i)).toBeVisible({ timeout: 10000 });
  });

  test('TC-005: Add comment to test result', async ({ page }) => {
    const areaName = uniqueName('CommentArea');
    const caseName = uniqueName('CommentCase');
    const runName = uniqueName('CommentRun');
    const commentText = 'Test comment from automation';
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test for comments');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case and mark as passed
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'check' }).first().click();
    
    // Complete test run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // On results page, add a comment
    await expect(page.getByText(/Passed Total:/i)).toBeVisible({ timeout: 15000 });
    
    const passedSection = page.getByRole('button', { name: /Passed Total:/i });
    const isExpanded = await passedSection.getAttribute('aria-expanded');
    if (isExpanded !== 'true') {
      await passedSection.click();
    }
    
    // Click more_vert and select Comments
    await page.getByRole('region', { name: /Passed Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    await page.getByRole('menuitem', { name: 'Comments' }).click();
    
    // Add a comment
    await page.getByRole('textbox', { name: /Add a comment/i }).fill(commentText);
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify - reopen comments to check
    await page.getByRole('region', { name: /Passed Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    await page.getByRole('menuitem', { name: 'Comments' }).click();
    await expect(page.getByText(commentText)).toBeVisible();
  });

  test('TC-006: Ad Hoc Results during execution', async ({ page }) => {
    const areaName = uniqueName('AdHocArea');
    const caseName = uniqueName('AdHocCase');
    const runName = uniqueName('AdHocRun');
    const adHocDesc = 'Ad hoc finding during test';
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test for ad hoc');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case to appear
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    
    // Add an ad hoc result
    await page.getByRole('button', { name: 'New Ad Hoc Result' }).click();
    await page.getByRole('textbox', { name: /Add a description/i }).fill(adHocDesc);
    await page.getByRole('button', { name: 'Save' }).click();
    
    // Verify ad hoc result appears
    await expect(page.getByText(adHocDesc)).toBeVisible();
    
    // Mark original test case as passed and complete
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'check' }).first().click();
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // Verify results page
    await expect(page.getByText(/Passed Total:/i)).toBeVisible({ timeout: 15000 });
  });

  test('TC-007: Test Run Dashboard displays correctly', async ({ page }) => {
    await login(page);
    
    // Verify dashboard columns
    await expect(page.getByRole('columnheader', { name: 'ID' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Name' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Assigned Product' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Assigned QA' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Assigned Dev' })).toBeVisible();
    
    // Verify pagination exists
    await expect(page.getByText('Items per page:')).toBeVisible();
    
    // Verify at least one test run exists
    const rows = page.getByRole('row');
    expect(await rows.count()).toBeGreaterThan(1);
  });

  test('TC-008: Search functionality works', async ({ page }) => {
    const searchableName = uniqueName('Search');
    
    await login(page);
    
    // Create a test run with a unique name
    await createTestRun(page, searchableName);
    
    // Go back to dashboard
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(page.getByRole('heading', { name: 'Test Run Dashboard' })).toBeVisible({ timeout: 10000 });
    
    // Navigate to the last page where the new test run will be
    // Click "Next page" until we reach the last page (button becomes disabled)
    while (await page.getByRole('button', { name: 'Next page' }).isEnabled()) {
      await page.getByRole('button', { name: 'Next page' }).click();
      await page.waitForTimeout(500);
    }
    
    // Verify we can see our test run on the last page
    await expect(page.getByRole('cell', { name: searchableName })).toBeVisible({ timeout: 10000 });
    
    // Now test search - it should filter the current page
    await page.getByRole('textbox', { name: 'Search test runs' }).fill(searchableName);
    await page.waitForTimeout(1000);
    
    // Verify the test run still appears after filtering
    await expect(page.getByRole('cell', { name: searchableName })).toBeVisible();
    
    // Clear search
    await page.getByRole('textbox', { name: 'Search test runs' }).clear();
  });

  test('TC-009: Test Cases page shows correct structure', async ({ page }) => {
    await login(page);
    await goToTestCases(page);
    
    // Verify the page structure
    await expect(page.getByRole('heading', { name: 'Test Areas', exact: true })).toBeVisible();
    
    // Verify there's at least one test area (Rentals is the main one)
    await expect(page.getByRole('button', { name: 'Rentals' })).toBeVisible();
    
    // Click on Rentals to see its structure
    await page.getByRole('button', { name: 'Rentals' }).click();
    
    // Verify child test areas section exists
    await expect(page.getByRole('heading', { name: 'Child Test Areas' })).toBeVisible();
    
    // Verify test cases section exists
    await expect(page.getByRole('heading', { name: 'Test Cases', level: 3 })).toBeVisible();
  });

  test('TC-010: Question status test cases can be approved', async ({ page }) => {
    const areaName = uniqueName('QuestionArea');
    const caseName = uniqueName('QuestionCase');
    const runName = uniqueName('QuestionRun');
    
    await login(page);
    
    // Create test area and case
    await goToTestCases(page);
    await createTestArea(page, areaName);
    await selectTestArea(page, areaName);
    await createTestCase(page, caseName, 'Test for question status');
    
    // Create and setup test run
    await goToTestRuns(page);
    await createTestRun(page, runName);
    await page.getByRole('checkbox', { name: areaName }).check();
    await page.getByRole('button', { name: 'Begin Testing' }).click();
    
    // Wait for test case and mark as question (help icon)
    await expect(page.getByText(caseName)).toBeVisible({ timeout: 15000 });
    await page.locator(`text="${caseName}"`).locator('..').locator('button').filter({ hasText: 'help' }).first().click();
    
    // Complete test run
    await page.getByRole('button', { name: 'Complete Test Run' }).click();
    
    // On results page, verify question section has approve option
    await expect(page.getByText(/Question Total:/i)).toBeVisible({ timeout: 15000 });
    
    // Click the more_vert button in the Question section
    await page.getByRole('region', { name: /Question Total:/i }).getByRole('button').filter({ hasText: 'more_vert' }).click();
    
    // Verify "Approve" option is available for question status
    await expect(page.getByRole('menuitem', { name: 'Approve' })).toBeVisible();
  });
});
