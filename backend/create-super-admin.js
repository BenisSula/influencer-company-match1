const { Client } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createSuperAdmin() {
  console.log('🚀 Creating Super Admin User\n');

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'influencer_matching',
  });

  try {
    console.log('📦 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Admin user details
    const email = 'admin@example.com';
    const password = 'Admin123!';
    const fullName = 'Super Admin';
    const role = 'SUPER_ADMIN';

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin user already exists
    const checkQuery = 'SELECT * FROM admin_users WHERE email = $1';
    const checkResult = await client.query(checkQuery, [email]);

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      const updateQuery = `
        UPDATE admin_users 
        SET password = $1, "fullName" = $2, role = $3, "isActive" = true, "updatedAt" = CURRENT_TIMESTAMP
        WHERE email = $4
        RETURNING id, email, "fullName", role
      `;
      
      const result = await client.query(updateQuery, [hashedPassword, fullName, role, email]);
      const admin = result.rows[0];

      console.log('\n✅ Admin user updated successfully!\n');
      console.log('📋 Admin Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID:        ${admin.id}`);
      console.log(`Email:     ${email}`);
      console.log(`Password:  ${password}`);
      console.log(`Name:      ${admin.fullName}`);
      console.log(`Role:      ${admin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('👤 Creating new admin user...');
      
      const insertQuery = `
        INSERT INTO admin_users (email, password, "fullName", role, "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, email, "fullName", role
      `;
      
      const result = await client.query(insertQuery, [email, hashedPassword, fullName, role]);
      const admin = result.rows[0];

      console.log('\n✅ Admin user created successfully!\n');
      console.log('📋 Admin Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`ID:        ${admin.id}`);
      console.log(`Email:     ${email}`);
      console.log(`Password:  ${password}`);
      console.log(`Name:      ${admin.fullName}`);
      console.log(`Role:      ${admin.role}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    console.log('🎯 Next Steps:');
    console.log('1. Access admin dashboard at: http://localhost:5173/admin/login');
    console.log('2. Login with the credentials above');
    console.log('3. Change your password after first login\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nPlease check:');
    console.error('  1. PostgreSQL is running');
    console.error('  2. Database credentials in .env are correct');
    console.error('  3. Database exists');
    console.error('  4. Migrations have been run (npm run migration:run)\n');
    process.exit(1);
  } finally {
    await client.end();
  }
}

createSuperAdmin();
