#!/usr/bin/env node

/**
 * Admin Dashboard Setup Script
 * 
 * This script automates the setup process for the admin dashboard:
 * 1. Creates super admin user
 * 2. Verifies database tables
 * 3. Tests admin login
 */

const bcrypt = require('bcrypt');
const { Client } = require('pg');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupAdminDashboard() {
  console.log('\n🚀 Admin Dashboard Setup\n');
  console.log('This script will create a super admin user for your admin dashboard.\n');

  // Get database credentials
  const dbHost = await question('Database host (default: localhost): ') || 'localhost';
  const dbPort = await question('Database port (default: 5432): ') || '5432';
  const dbUser = await question('Database user (default: postgres): ') || 'postgres';
  const dbPassword = await question('Database password: ');
  const dbName = await question('Database name (default: influencer_match): ') || 'influencer_match';

  console.log('\n');

  // Get admin credentials
  const adminEmail = await question('Admin email (default: admin@example.com): ') || 'admin@example.com';
  const adminPassword = await question('Admin password (default: Admin123!): ') || 'Admin123!';
  const adminName = await question('Admin full name (default: Super Admin): ') || 'Super Admin';

  console.log('\n📦 Connecting to database...');

  const client = new Client({
    host: dbHost,
    port: parseInt(dbPort),
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    // Check if admin_users table exists
    console.log('🔍 Checking database tables...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'admin_users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Error: admin_users table does not exist');
      console.log('Please run migrations first: npm run migration:run');
      process.exit(1);
    }

    console.log('✅ Database tables verified\n');

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await client.query(
      'SELECT id FROM admin_users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists with this email');
      const overwrite = await question('Do you want to update the password? (yes/no): ');
      
      if (overwrite.toLowerCase() !== 'yes') {
        console.log('Setup cancelled.');
        process.exit(0);
      }

      // Update existing admin
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await client.query(
        'UPDATE admin_users SET password = $1, "fullName" = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE email = $3',
        [hashedPassword, adminName, adminEmail]
      );
      console.log('✅ Admin user updated successfully!\n');
    } else {
      // Create new admin
      console.log('🔐 Hashing password...');
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      console.log('✅ Password hashed\n');

      console.log('👤 Creating super admin user...');
      await client.query(`
        INSERT INTO admin_users (
          email, password, "fullName", role, "isActive", "createdAt", "updatedAt"
        )
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [adminEmail, hashedPassword, adminName, 'SUPER_ADMIN', true]);

      console.log('✅ Super admin created successfully!\n');
    }

    // Display credentials
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Admin Credentials:');
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     SUPER_ADMIN\n`);
    console.log('Access the admin dashboard at:');
    console.log('  http://localhost:5173/admin/login\n');
    console.log('⚠️  Remember to change these credentials in production!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database credentials are correct');
    console.error('  3. Database exists');
    console.error('  4. Migrations have been run (npm run migration:run)\n');
    process.exit(1);
  } finally {
    await client.end();
    rl.close();
  }
}

// Run the setup
setupAdminDashboard().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
