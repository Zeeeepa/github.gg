#!/usr/bin/env node

/**
 * CI Database Setup Script
 * Sets up database for GitHub Actions CI/CD pipeline
 */

const { execSync } = require('child_process');

async function setupDatabase() {
  console.log('🔧 Setting up CI database...');
  
  try {
    // Check if drizzle-kit is available
    try {
      execSync('npx drizzle-kit --version', { stdio: 'pipe' });
      console.log('✅ drizzle-kit found');
    } catch (error) {
      console.log('📦 Installing drizzle-kit...');
      execSync('npm install drizzle-kit', { stdio: 'inherit' });
    }

    // Run database migrations
    console.log('🗄️ Running database migrations...');
    execSync('npx drizzle-kit push', { 
      stdio: 'inherit',
      env: { 
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/github_gg_test'
      }
    });

    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
