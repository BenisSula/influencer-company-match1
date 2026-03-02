/**
 * Seed Tenants Data
 * Creates sample tenants for testing
 */

const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function seedTenants() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_DATABASE || 'influencer_matching',
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if tenants table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'tenants'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Tenants table does not exist. Run migrations first.');
      process.exit(1);
    }

    // Check if tenants already exist
    const existingTenants = await client.query('SELECT COUNT(*) FROM tenants');
    const count = parseInt(existingTenants.rows[0].count);

    if (count > 0) {
      console.log(`ℹ️  ${count} tenants already exist. Skipping seed.`);
      process.exit(0);
    }

    console.log('📝 Creating sample tenants...');

    // Create main platform tenant
    await client.query(`
      INSERT INTO tenants (
        subdomain, name, "subscriptionTier", status, 
        branding, features, "trialEndsAt", "createdAt", "updatedAt"
      ) VALUES (
        'main',
        'Main Platform',
        'ENTERPRISE',
        'ACTIVE',
        '{"primaryColor": "#6366f1", "secondaryColor": "#8b5cf6", "logoUrl": "", "faviconUrl": "", "customCss": ""}',
        '{"maxUsers": -1, "maxMatches": -1, "aiMatching": true, "analytics": true, "customBranding": true, "apiAccess": true}',
        NULL,
        NOW(),
        NOW()
      )
    `);

    // Create demo tenant
    await client.query(`
      INSERT INTO tenants (
        subdomain, name, "subscriptionTier", status, 
        branding, features, "trialEndsAt", "createdAt", "updatedAt"
      ) VALUES (
        'demo',
        'Demo Company',
        'PRO',
        'ACTIVE',
        '{"primaryColor": "#2196F3", "secondaryColor": "#FF9800", "logoUrl": "", "faviconUrl": "", "customCss": ""}',
        '{"maxUsers": 200, "maxMatches": 2000, "aiMatching": true, "analytics": true, "customBranding": true, "apiAccess": true}',
        NULL,
        NOW(),
        NOW()
      )
    `);

    // Create trial tenant
    await client.query(`
      INSERT INTO tenants (
        subdomain, name, "subscriptionTier", status, 
        branding, features, "trialEndsAt", "createdAt", "updatedAt"
      ) VALUES (
        'trial',
        'Trial Startup',
        'TRIAL',
        'TRIAL',
        '{"primaryColor": "#9C27B0", "secondaryColor": "#E91E63", "logoUrl": "", "faviconUrl": "", "customCss": ""}',
        '{"maxUsers": 10, "maxMatches": 50, "aiMatching": false, "analytics": false, "customBranding": false, "apiAccess": false}',
        NOW() + INTERVAL '14 days',
        NOW(),
        NOW()
      )
    `);

    console.log('✅ Created 3 sample tenants:');
    console.log('   1. Main Platform (Enterprise)');
    console.log('   2. Demo Company (Pro)');
    console.log('   3. Trial Startup (Trial)');

    // Verify
    const result = await client.query('SELECT id, name, subdomain, "subscriptionTier", status FROM tenants ORDER BY "createdAt"');
    console.log('\n📊 Tenants in database:');
    result.rows.forEach(tenant => {
      console.log(`   - ${tenant.name} (${tenant.subdomain}) - ${tenant.subscriptionTier} - ${tenant.status}`);
    });

  } catch (error) {
    console.error('❌ Error seeding tenants:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seedTenants();
