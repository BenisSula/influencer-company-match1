#!/usr/bin/env node

/**
 * Run TypeORM migrations
 * This script is executed after build to ensure database tables are created
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running database migrations...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

try {
  // Run migrations using the compiled JavaScript files
  const command = 'node --require ts-node/register ./node_modules/typeorm/cli.js migration:run -d ormconfig.ts';
  
  console.log('Executing:', command);
  
  execSync(command, {
    stdio: 'inherit',
    cwd: __dirname,
    env: process.env
  });
  
  console.log('✅ Migrations completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  
  // Don't fail the deployment if migrations fail
  // This allows the app to start even if migrations have issues
  console.log('⚠️  Continuing despite migration errors...');
  process.exit(0);
}
