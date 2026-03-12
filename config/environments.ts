import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  name: string;
  baseUrl: string;
  authUrl: string;
  adminAuthUrl: string;
  employeeLandingPath?: string;
  credentials: {
    business: {
      companyId: string;
      username: string;
      password: string;
    };
    admin: {
      username: string;
      password: string;
    };
    employee: {
      companyId: string;
      username: string;
      password: string;
    };
  };
}

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
  stage: {
    name: 'Staging',
    baseUrl: 'https://stage-admin.vquiprentals.com',
    authUrl: 'https://stage-admin.vquiprentals.com/auth/v2/welcome',
    adminAuthUrl: 'https://stage-admin.vquiprentals.com/auth/v2/vquipadmin/login',
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
  mobile: {
    name: 'pendo',
    baseUrl: 'https://pendo.vquiprentals.com',
    authUrl: 'https://pendo.vquiprentals.com/auth/login',
    adminAuthUrl: 'https://pendo.vquiprentals.com/auth/login',
    employeeLandingPath: '/app/tabs/schedule',
    credentials: {
      business: {
        companyId: process.env.COMPANY_ID || '',
        username: process.env.BA_USERNAME || '',
        password: process.env.BA_PASSWORD || ''
      },
      employee: {
        companyId: process.env.COMPANY_ID || '',
        username: process.env.E_USERNAME || '',
        password: process.env.E_PASSWORD || ''
      },
      admin: {
        username: process.env.VA_USERNAME || '',
        password: process.env.VA_PASSWORD || ''
      }
    }
  }

};

export function getEnvironment(): EnvironmentConfig {
  const env = process.env.TEST_ENV || 'dev';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }

  if (env === 'mobile') {
    const requiredKeys = ['COMPANY_ID', 'E_USERNAME', 'E_PASSWORD'];
    const missingKeys = requiredKeys.filter((key) => !process.env[key]);
    if (missingKeys.length > 0) {
      throw new Error(`Missing required environment variables for mobile: ${missingKeys.join(', ')}`);
    }
  }
  
  return config;
}

export function getCredentials(userType: 'business' | 'admin' | 'employee') {
  const env = getEnvironment();
  return env.credentials[userType];
} 