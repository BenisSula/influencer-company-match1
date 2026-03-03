require('dotenv').config();

function verifyStripeConfig() {
  console.log('🔍 Verifying Stripe Configuration\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const config = {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID,
    platformFeePercent: process.env.STRIPE_PLATFORM_FEE_PERCENT || '10',
    currency: process.env.STRIPE_CURRENCY || 'usd',
  };

  const issues = [];
  const warnings = [];

  // Check Secret Key
  console.log('1. Stripe Secret Key:');
  if (!config.secretKey) {
    console.log('   ❌ MISSING - STRIPE_SECRET_KEY not set');
    issues.push('Secret Key missing');
  } else if (config.secretKey.startsWith('sk_test_')) {
    console.log('   ✅ Present (Test Mode)');
    console.log(`   Value: ${config.secretKey.substring(0, 20)}...`);
  } else if (config.secretKey.startsWith('sk_live_')) {
    console.log('   ✅ Present (Live Mode)');
    console.log(`   Value: ${config.secretKey.substring(0, 20)}...`);
    warnings.push('Using LIVE Stripe keys in development');
  } else {
    console.log('   ⚠️  Invalid format');
    issues.push('Secret Key has invalid format');
  }
  console.log('');

  // Check Publishable Key
  console.log('2. Stripe Publishable Key:');
  if (!config.publishableKey) {
    console.log('   ❌ MISSING - STRIPE_PUBLISHABLE_KEY not set');
    issues.push('Publishable Key missing');
  } else if (config.publishableKey.startsWith('pk_test_')) {
    console.log('   ✅ Present (Test Mode)');
    console.log(`   Value: ${config.publishableKey.substring(0, 20)}...`);
  } else if (config.publishableKey.startsWith('pk_live_')) {
    console.log('   ✅ Present (Live Mode)');
    console.log(`   Value: ${config.publishableKey.substring(0, 20)}...`);
    warnings.push('Using LIVE Stripe keys in development');
  } else {
    console.log('   ⚠️  Invalid format');
    issues.push('Publishable Key has invalid format');
  }
  console.log('');

  // Check Webhook Secret
  console.log('3. Stripe Webhook Secret:');
  if (!config.webhookSecret) {
    console.log('   ❌ MISSING - STRIPE_WEBHOOK_SECRET not set');
    issues.push('Webhook Secret missing');
  } else if (config.webhookSecret === 'whsec_...') {
    console.log('   ❌ PLACEHOLDER - Still using example value');
    console.log('   Action Required: Generate real webhook secret from Stripe Dashboard');
    issues.push('Webhook Secret is placeholder');
  } else if (config.webhookSecret.startsWith('whsec_')) {
    console.log('   ✅ Present');
    console.log(`   Value: ${config.webhookSecret.substring(0, 15)}...`);
  } else {
    console.log('   ⚠️  Invalid format (should start with whsec_)');
    issues.push('Webhook Secret has invalid format');
  }
  console.log('');

  // Check Connect Client ID
  console.log('4. Stripe Connect Client ID:');
  if (!config.connectClientId) {
    console.log('   ⚠️  MISSING - STRIPE_CONNECT_CLIENT_ID not set');
    console.log('   Impact: Stripe Connect onboarding will not work');
    warnings.push('Connect Client ID missing - payouts disabled');
  } else if (config.connectClientId.startsWith('ca_')) {
    console.log('   ✅ Present');
    console.log(`   Value: ${config.connectClientId.substring(0, 15)}...`);
  } else {
    console.log('   ⚠️  Invalid format (should start with ca_)');
    warnings.push('Connect Client ID has invalid format');
  }
  console.log('');

  // Check Platform Fee
  console.log('5. Platform Fee Percentage:');
  const feePercent = parseInt(config.platformFeePercent);
  if (isNaN(feePercent) || feePercent < 0 || feePercent > 100) {
    console.log(`   ⚠️  Invalid value: ${config.platformFeePercent}`);
    warnings.push('Platform fee should be between 0 and 100');
  } else {
    console.log(`   ✅ ${feePercent}%`);
  }
  console.log('');

  // Check Currency
  console.log('6. Currency:');
  console.log(`   ✅ ${config.currency.toUpperCase()}`);
  console.log('');

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Summary:\n');

  if (issues.length === 0 && warnings.length === 0) {
    console.log('✅ All Stripe configuration is correct!\n');
    console.log('🎉 Payment features are ready to use.\n');
    return true;
  }

  if (issues.length > 0) {
    console.log('❌ Critical Issues Found:\n');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue}`);
    });
    console.log('');
  }

  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. ${warning}`);
    });
    console.log('');
  }

  // Provide fix instructions
  if (issues.length > 0 || warnings.length > 0) {
    console.log('🔧 How to Fix:\n');
    
    if (issues.includes('Webhook Secret is placeholder') || issues.includes('Webhook Secret missing')) {
      console.log('   Webhook Secret:');
      console.log('   1. Login to Stripe Dashboard (https://dashboard.stripe.com)');
      console.log('   2. Go to Developers → Webhooks');
      console.log('   3. Click "Add endpoint"');
      console.log('   4. Enter URL: http://localhost:3000/api/payments/webhook');
      console.log('   5. Select events: payment_intent.*, customer.subscription.*');
      console.log('   6. Copy the webhook signing secret');
      console.log('   7. Update STRIPE_WEBHOOK_SECRET in backend/.env\n');
    }

    if (warnings.includes('Connect Client ID missing - payouts disabled')) {
      console.log('   Connect Client ID:');
      console.log('   1. Login to Stripe Dashboard');
      console.log('   2. Go to Settings → Connect');
      console.log('   3. Copy the Client ID');
      console.log('   4. Add STRIPE_CONNECT_CLIENT_ID to backend/.env\n');
    }

    if (issues.includes('Secret Key missing') || issues.includes('Publishable Key missing')) {
      console.log('   API Keys:');
      console.log('   1. Login to Stripe Dashboard');
      console.log('   2. Go to Developers → API keys');
      console.log('   3. Copy Secret key and Publishable key');
      console.log('   4. Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in backend/.env\n');
    }
  }

  return issues.length === 0;
}

// Run verification
const success = verifyStripeConfig();
process.exit(success ? 0 : 1);
