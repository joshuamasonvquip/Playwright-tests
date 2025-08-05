#!/usr/bin/env node

const { spawn } = require('child_process');
const { getEnvironment } = require('../config/environments');

// Get command line arguments
const args = process.argv.slice(2);
const environment = args[0] || 'dev';
const testCommand = args[1] || 'test';

// Validate environment
try {
  const env = getEnvironment();
  console.log(`🚀 Running tests in ${env.name} environment`);
  console.log(`📍 Base URL: ${env.baseUrl}`);
  console.log(`🔐 Auth URL: ${env.authUrl}`);
  console.log(`👤 Admin Auth URL: ${env.adminAuthUrl}`);
  console.log('');
} catch (error) {
  console.error(`❌ Error: ${error.message}`);
  console.log('Available environments: dev, stage');
  process.exit(1);
}

// Set environment variable
process.env.TEST_ENV = environment;

// Run the test command
const child = spawn('npx', ['playwright', 'test'], {
  stdio: 'inherit',
  env: process.env
});

child.on('close', (code) => {
  console.log(`\n✅ Tests completed with exit code ${code}`);
  process.exit(code);
});

child.on('error', (error) => {
  console.error(`❌ Failed to start test process: ${error.message}`);
  process.exit(1);
}); 