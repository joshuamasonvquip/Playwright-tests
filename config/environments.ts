export interface EnvironmentConfig {
  name: string;
  baseUrl: string;
  authUrl: string;
  adminAuthUrl: string;
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
  }
};

export function getEnvironment(): EnvironmentConfig {
  const env = process.env.TEST_ENV || 'dev';
  const config = environments[env];
  
  if (!config) {
    throw new Error(`Environment '${env}' not found. Available environments: ${Object.keys(environments).join(', ')}`);
  }
  
  return config;
}

export function getCredentials(userType: 'business' | 'admin' | 'employee') {
  const env = getEnvironment();
  return env.credentials[userType];
} 