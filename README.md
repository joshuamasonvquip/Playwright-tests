# VQuip Playwright Tests

This repository contains automated tests for the VQuip application using Playwright. The tests are designed to be reusable across different environments (dev, stage, etc.) with configurable URLs and login credentials.

## Environment Configuration

The tests support multiple environments with different URLs and login credentials. The environment configuration is centralized in `config/environments.ts`.

### Available Environments

- **Development (dev)**: `https://dev-admin.vquiprentals.com`
- **Staging (stage)**: `https://stage-admin.vquiprentals.com`

### User Types

The tests support three different user types:

1. **Business Users**: Regular business account users
2. **Admin Users**: Administrative users with elevated privileges
3. **Employee Users**: Employee account users

## Running Tests

### Default Environment (Development)

```bash
# Run all tests in development environment
npm test

# Run tests with headed browser
npm run test:headed

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug
```

### Specific Environment

```bash
# Run tests in development environment
npm run test:dev

# Run tests in staging environment
npm run test:stage

# Run tests with headed browser in specific environment
npm run test:dev:headed
npm run test:stage:headed

# Run tests with UI mode in specific environment
npm run test:dev:ui
npm run test:stage:ui

# Run tests in debug mode in specific environment
npm run test:dev:debug
npm run test:stage:debug
```

### Using Environment Variables

You can also set the environment using the `TEST_ENV` environment variable:

```bash
# Windows PowerShell
$env:TEST_ENV="stage"; npm test

# Windows Command Prompt
set TEST_ENV=stage && npm test

# Linux/Mac
TEST_ENV=stage npm test
```

## Test Structure

### Test Files

- `tests/Business/` - Business user tests
  - `business-login.spec.ts` - Business login flow
  - `business-reservation-flow.spec.ts` - Business reservation creation and registration
- `tests/Admin/` - Admin user tests
  - `admin-login.spec.ts` - Admin login flow
- `tests/Employee/` - Employee user tests
  - `employee-login.spec.ts` - Employee login flow
  - `employee-reservation-flow.spec.ts` - Employee reservation creation

### Configuration Files

- `config/environments.ts` - Environment configuration with URLs and credentials
- `utils/auth-helper.ts` - Reusable authentication helper class
- `playwright.config.ts` - Playwright configuration

## Authentication Helper

The `AuthHelper` class provides a reusable way to handle login flows for different user types:

```typescript
import { AuthHelper } from '../../utils/auth-helper';

const authHelper = new AuthHelper(page);

// Login as different user types
await authHelper.login('business');
await authHelper.login('admin');
await authHelper.login('employee');
```

## Adding New Environments

To add a new environment, update the `environments` object in `config/environments.ts`:

```typescript
export const environments: Record<string, EnvironmentConfig> = {
  dev: {
    name: 'Development',
    baseUrl: 'https://dev-admin.vquiprentals.com',
    authUrl: 'https://dev-admin.vquiprentals.com/auth/v2/welcome',
    adminAuthUrl: 'https://dev-admin.vquiprentals.com/auth/v2/vquipadmin/login',
    credentials: {
      business: {
        companyId: '318',
        username: 'business',
        password: 'Password1!'
      },
      admin: {
        username: 'pwtest',
        password: 'PWtest1!'
      },
      employee: {
        companyId: '318',
        username: 'employee',
        password: 'Password1!'
      }
    }
  },
  // Add your new environment here
  prod: {
    name: 'Production',
    baseUrl: 'https://admin.vquiprentals.com',
    authUrl: 'https://admin.vquiprentals.com/auth/v2/welcome',
    adminAuthUrl: 'https://admin.vquiprentals.com/auth/v2/vquipadmin/login',
    credentials: {
      // Add production credentials
    }
  }
};
```

Then add the corresponding npm scripts in `package.json`:

```json
{
  "scripts": {
    "test:prod": "TEST_ENV=prod playwright test",
    "test:prod:headed": "TEST_ENV=prod playwright test --headed"
  }
}
```

## Updating Credentials

To update credentials for an environment, modify the `credentials` object in `config/environments.ts`. The credentials are organized by user type:

- `business` - Company ID, username, and password for business users
- `admin` - Username and password for admin users (no company ID required)
- `employee` - Company ID, username, and password for employee users

## Test Reports

After running tests, you can view the HTML report:

```bash
npm run report
```

This will open the Playwright HTML report in your browser, showing test results, screenshots, and videos.

## Troubleshooting

### Environment Not Found Error

If you get an error like "Environment 'xyz' not found", make sure:

1. The environment name is correctly spelled in your npm script
2. The environment is defined in `config/environments.ts`
3. You're using the correct environment variable name (`TEST_ENV`)

### Login Failures

If login tests are failing:

1. Verify the credentials in `config/environments.ts` are correct
2. Check that the URLs are accessible
3. Ensure the login flow hasn't changed (check selectors in `utils/auth-helper.ts`)

### URL Issues

If tests are failing due to URL issues:

1. Verify the `baseUrl` and `authUrl` in your environment configuration
2. Check that the URLs are accessible from your network
3. Ensure the application is deployed and running in the target environment

## Contributing

When adding new tests:

1. Use the `AuthHelper` class for authentication
2. Use relative URLs (starting with `/`) instead of absolute URLs
3. Update the environment configuration if new credentials or URLs are needed
4. Add appropriate npm scripts for new environments if needed 