# VQuip Page Object Model (POM) Testing Guide

## Overview

This guide explains the Page Object Model (POM) structure implemented for the VQuip Playwright test suite. The POM pattern provides better maintainability, reusability, and organization of test code.

## Architecture

```
├── pages/
│   ├── BasePage.ts                    # Base page with common functionality
│   ├── auth/
│   │   └── LoginPage.ts              # Authentication page object
│   └── employee/
│       ├── EmployeeDashboardPage.ts  # Employee dashboard page object
│       └── EmployeeReservationPage.ts # Employee reservation page object
├── utils/
│   ├── auth-helper.ts                # Legacy auth helper (still used)
│   ├── employee-test-helper.ts       # High-level test operations
│   └── test-data-factory.ts          # Test data generation
└── tests/
    └── Employee/
        └── employee-pom-tests.spec.ts # Example POM-based tests
```

## Key Components

### 1. BasePage.ts
The foundation class that all page objects extend. Provides common functionality:

- **Element interaction methods**: `clickWithRetry()`, `fillWithRetry()`, `selectOption()`
- **Wait utilities**: `waitForElement()`, `waitForPageLoad()`, `waitForUrl()`
- **Verification methods**: `verifyElementVisible()`, `verifyElementText()`, `verifyElementValue()`
- **Navigation helpers**: `navigateTo()`, `getCurrentUrl()`
- **Screenshot utilities**: `takeScreenshot()`

### 2. Page Objects
Each page object represents a specific page or component:

#### LoginPage.ts
Handles all authentication-related functionality:
- Login flows for different user types (admin, business, employee)
- Forgot password navigation
- Form validation
- Error message handling

#### EmployeeDashboardPage.ts
Manages employee dashboard functionality:
- Navigation to different sections
- Dashboard statistics retrieval
- User menu operations
- Session management

#### EmployeeReservationPage.ts
Handles reservation creation and management:
- Form filling and submission
- Availability checking
- Validation testing
- Success/error message handling

### 3. Test Data Factory
Generates consistent test data:
- Customer information
- Reservation data
- Inventory combinations
- Date ranges
- Validation test data

### 4. Employee Test Helper
Provides high-level test operations that combine multiple page objects:
- Complete login flows
- Reservation creation workflows
- Dashboard verification
- Navigation testing

## Usage Examples

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { EmployeeTestHelper } from '../../utils/employee-test-helper';

test.describe('Employee Tests', () => {
  let testHelper: EmployeeTestHelper;

  test.beforeEach(async ({ page }) => {
    testHelper = new EmployeeTestHelper(page);
  });

  test('should create a reservation', async ({ page }) => {
    // Login
    await testHelper.loginAsEmployee();
    
    // Create reservation
    const reservationData = await testHelper.createTestReservation();
    
    // Verify
    expect(reservationData).toBeDefined();
  });
});
```

### Using Page Objects Directly

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import { EmployeeDashboardPage } from '../../pages/employee/EmployeeDashboardPage';

test('should login and navigate dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new EmployeeDashboardPage(page);
  
  // Login
  await loginPage.loginAsBusinessOrEmployee('318', 'username', 'password');
  
  // Verify dashboard
  await dashboardPage.verifyDashboardLoaded();
});
```

### Using Test Data Factory

```typescript
import { TestDataFactory } from '../../utils/test-data-factory';

test('should create reservation with test data', async ({ page }) => {
  const reservationData = TestDataFactory.getTestReservationData();
  const customer = TestDataFactory.getTestCustomer();
  
  // Use the generated data
  console.log('Reservation:', reservationData);
  console.log('Customer:', customer);
});
```

## Best Practices

### 1. Page Object Design
- **Single Responsibility**: Each page object handles one page/component
- **Encapsulation**: Hide implementation details behind clean interfaces
- **Reusability**: Methods should be reusable across different tests
- **Maintainability**: Centralize locators and business logic

### 2. Test Organization
- **Group related tests**: Use `test.describe()` to organize tests by functionality
- **Use beforeEach/afterEach**: Set up and clean up test state
- **Keep tests focused**: Each test should verify one specific behavior
- **Use descriptive names**: Test names should clearly describe what they verify

### 3. Data Management
- **Use TestDataFactory**: Generate consistent, realistic test data
- **Avoid hardcoded values**: Use factory methods for all test data
- **Clean up test data**: Implement proper cleanup in afterEach hooks
- **Use unique identifiers**: Include timestamps or random values to avoid conflicts

### 4. Error Handling
- **Implement retry logic**: Use `clickWithRetry()` and `fillWithRetry()` for flaky elements
- **Add proper waits**: Wait for elements to be ready before interacting
- **Handle async operations**: Use proper async/await patterns
- **Add meaningful error messages**: Include context in error messages

## Adding New Page Objects

### 1. Create the Page Object
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';

export class NewFeaturePage extends BasePage {
  private readonly someButton: Locator;
  private readonly someInput: Locator;

  constructor(page: Page) {
    super(page);
    this.someButton = page.locator('button:has-text("Some Button")');
    this.someInput = page.locator('#someInput');
  }

  async clickSomeButton() {
    await this.clickWithRetry(this.someButton);
  }

  async fillSomeInput(value: string) {
    await this.fillWithRetry(this.someInput, value);
  }
}
```

### 2. Add to Test Helper
```typescript
export class EmployeeTestHelper {
  private newFeaturePage: NewFeaturePage;

  constructor(page: Page) {
    // ... existing code ...
    this.newFeaturePage = new NewFeaturePage(page);
  }

  async performNewFeatureAction() {
    await this.newFeaturePage.clickSomeButton();
    await this.newFeaturePage.fillSomeInput('test value');
  }
}
```

### 3. Create Tests
```typescript
test('should perform new feature action', async ({ page }) => {
  await testHelper.loginAsEmployee();
  await testHelper.performNewFeatureAction();
  
  // Add assertions
});
```

## Benefits of This Structure

1. **Maintainability**: Changes to UI elements only require updates in page objects
2. **Reusability**: Page object methods can be used across multiple tests
3. **Readability**: Tests are more readable and focus on business logic
4. **Reliability**: Built-in retry logic and proper waits reduce flaky tests
5. **Scalability**: Easy to add new pages and functionality
6. **Consistency**: Standardized patterns across all tests

## Migration from Legacy Tests

To migrate existing tests to use POM:

1. **Identify page interactions**: Extract page-specific logic into page objects
2. **Create page objects**: Implement page objects for each page
3. **Update test helpers**: Add high-level operations to test helpers
4. **Refactor tests**: Update tests to use the new structure
5. **Remove duplication**: Eliminate duplicate code across tests

## Running Tests

```bash
# Run all employee POM tests
npm test -- tests/Employee/employee-pom-tests.spec.ts

# Run specific test
npm test -- tests/Employee/employee-pom-tests.spec.ts -g "should create a test reservation"

# Run with specific browser
npm test -- tests/Employee/employee-pom-tests.spec.ts --project=chromium
```

## Troubleshooting

### Common Issues

1. **Element not found**: Check locators and add proper waits
2. **Test flakiness**: Use retry methods and increase timeouts
3. **Data conflicts**: Use unique identifiers in test data
4. **Navigation issues**: Verify URLs and add proper navigation waits

### Debugging Tips

1. **Add screenshots**: Use `takeScreenshot()` for debugging
2. **Log element states**: Add console.log statements to track element visibility
3. **Use Playwright Inspector**: Run tests with `--headed` flag for visual debugging
4. **Check network requests**: Monitor network activity for API issues

## Future Enhancements

1. **API Testing**: Add API page objects for backend testing
2. **Visual Testing**: Integrate visual regression testing
3. **Performance Testing**: Add performance monitoring capabilities
4. **Mobile Testing**: Extend page objects for mobile testing
5. **Accessibility Testing**: Add accessibility testing utilities 