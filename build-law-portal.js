#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
try {
  // Build shared-lib first
execSync('npm run build:shared-lib', { stdio: 'inherit', cwd: __dirname });
  
  // Build law-portal with netlify configuration
execSync('ng build law-portal --configuration=netlify', { stdio: 'inherit', cwd: __dirname });
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 