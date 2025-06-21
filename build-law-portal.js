#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🏗️  Building ASLAW Law Portal for Netlify...');

try {
  // Build shared-lib first
  console.log('📦 Building shared-lib...');
  execSync('npm run build:shared-lib', { stdio: 'inherit', cwd: __dirname });
  
  // Build law-portal with netlify configuration
  console.log('🚀 Building law-portal...');
  execSync('ng build law-portal --configuration=netlify', { stdio: 'inherit', cwd: __dirname });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Output: dist/law-portal/browser/');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 