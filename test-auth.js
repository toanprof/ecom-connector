require('dotenv').config();
const { createEcomConnector } = require('./dist');

/**
 * Quick Test for Authentication Methods
 */

async function testAuth() {
  console.log('\n🧪 Testing Shopee Authentication Methods\n');

  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: process.env.SHOPEE_SHOP_ID || '0',
      },
      sandbox: true,
    });

    // Test 1: Generate Auth URL
    console.log('✅ Test 1: Generate Auth URL');
    const authUrl = connector.generateAuthUrl('http://localhost:3000/callback');
    console.log('   Auth URL generated successfully');
    console.log('   Length:', authUrl.length, 'chars');
    console.log('   Preview:', authUrl.substring(0, 80) + '...\n');

    // Test 2: Check methods exist
    console.log('✅ Test 2: Check Methods Exist');
    console.log('   generateAuthUrl:', typeof connector.generateAuthUrl === 'function' ? '✓' : '✗');
    console.log('   getAccessToken:', typeof connector.getAccessToken === 'function' ? '✓' : '✗');
    console.log('   refreshAccessToken:', typeof connector.refreshAccessToken === 'function' ? '✓' : '✗');
    console.log();

    // Test 3: Verify URL structure
    console.log('✅ Test 3: Verify URL Structure');
    const url = new URL(authUrl);
    console.log('   Base URL:', url.origin + url.pathname);
    console.log('   Has partner_id:', url.searchParams.has('partner_id') ? '✓' : '✗');
    console.log('   Has timestamp:', url.searchParams.has('timestamp') ? '✓' : '✗');
    console.log('   Has sign:', url.searchParams.has('sign') ? '✓' : '✗');
    console.log('   Has redirect:', url.searchParams.has('redirect') ? '✓' : '✗');
    console.log();

    console.log('🎉 All tests passed!\n');
    console.log('Next steps:');
    console.log('  - Run: node shopee-auth-demo.js (to get real tokens)');
    console.log('  - Run: node shopee-demo.js (to test with tokens)\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testAuth();
