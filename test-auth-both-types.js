require('dotenv').config();
const { createEcomConnector } = require('./dist');

async function testAuthWithShopId() {
  console.log('=== Test 1: Authentication with Shop ID ===\n');
  
  const code = process.argv[2];
  const shopId = process.argv[3] || process.env.SHOPEE_SHOP_ID;

  if (!code) {
    console.error('❌ Authorization code not provided');
    console.log('Usage: node test-auth-both-types.js <code> <shop_id>');
    return null;
  }

  if (!shopId) {
    console.error('❌ Shop ID not provided');
    return null;
  }

  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: shopId,
      },
      sandbox: true,
    });

    console.log('🔑 Getting access token with Shop ID...');
    console.log(`  Code: ${code}`);
    console.log(`  Shop ID: ${shopId}\n`);

    const result = await connector.getAccessToken(code, shopId);

    console.log('✅ Token obtained successfully!\n');
    console.log('📦 Response Data:');
    console.log(`  Partner ID: ${result.partner_id}`);
    console.log(`  Shop ID: ${result.shop_id}`);
    console.log(`  Access Token: ${result.access_token.substring(0, 30)}...`);
    console.log(`  Refresh Token: ${result.refresh_token.substring(0, 30)}...`);
    console.log(`  Expires In: ${result.expire_in} seconds (${result.expire_in / 3600} hours)`);
    console.log();

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.platformError) {
      console.error('Platform error:', JSON.stringify(error.platformError, null, 2));
    }
    return null;
  }
}

async function testAuthWithMainAccountId() {
  console.log('=== Test 2: Authentication with Main Account ID ===\n');
  
  const code = process.argv[2];
  const mainAccountId = process.argv[4] || process.env.SHOPEE_MAIN_ACCOUNT_ID;

  if (!code) {
    console.error('❌ Authorization code not provided');
    return null;
  }

  if (!mainAccountId) {
    console.log('⚠️  Main Account ID not provided, skipping this test');
    console.log('   To test with Main Account ID, provide it as 4th argument:');
    console.log('   node test-auth-both-types.js <code> <shop_id> <main_account_id>');
    return null;
  }

  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: '0', // Dummy value, not used when main_account_id is provided
      },
      sandbox: true,
    });

    console.log('🔑 Getting access token with Main Account ID...');
    console.log(`  Code: ${code}`);
    console.log(`  Main Account ID: ${mainAccountId}\n`);

    // Pass undefined for shopId, and mainAccountId as third parameter
    const result = await connector.getAccessToken(code, undefined, mainAccountId);

    console.log('✅ Token obtained successfully!\n');
    console.log('📦 Response Data:');
    console.log(`  Partner ID: ${result.partner_id}`);
    console.log(`  Main Account ID: ${result.main_account_id}`);
    console.log(`  Access Token: ${result.access_token.substring(0, 30)}...`);
    console.log(`  Refresh Token: ${result.refresh_token.substring(0, 30)}...`);
    console.log(`  Expires In: ${result.expire_in} seconds (${result.expire_in / 3600} hours)`);
    console.log();

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.platformError) {
      console.error('Platform error:', JSON.stringify(error.platformError, null, 2));
    }
    return null;
  }
}

async function testRefreshWithShopId(refreshToken, shopId) {
  console.log('=== Test 3: Refresh Token with Shop ID ===\n');

  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: shopId,
      },
      sandbox: true,
    });

    console.log('🔄 Refreshing token with Shop ID...');
    const result = await connector.refreshAccessToken(refreshToken, shopId);

    console.log('✅ Token refreshed successfully!\n');
    console.log('📦 Response Data:');
    console.log(`  Partner ID: ${result.partner_id}`);
    console.log(`  Shop ID: ${result.shop_id}`);
    console.log(`  New Access Token: ${result.access_token.substring(0, 30)}...`);
    console.log();

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function testRefreshWithMainAccountId(refreshToken, mainAccountId) {
  console.log('=== Test 4: Refresh Token with Main Account ID ===\n');

  if (!mainAccountId) {
    console.log('⚠️  Main Account ID not available, skipping this test\n');
    return null;
  }

  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: '0',
      },
      sandbox: true,
    });

    console.log('🔄 Refreshing token with Main Account ID...');
    const result = await connector.refreshAccessToken(refreshToken, undefined, mainAccountId);

    console.log('✅ Token refreshed successfully!\n');
    console.log('📦 Response Data:');
    console.log(`  Partner ID: ${result.partner_id}`);
    console.log(`  Main Account ID: ${result.main_account_id}`);
    console.log(`  New Access Token: ${result.access_token.substring(0, 30)}...`);
    console.log();

    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Shopee Authentication Test - Shop ID vs Main Account ID  ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (process.argv.length < 3) {
    console.log('📖 Usage:');
    console.log('  Test with Shop ID only:');
    console.log('    node test-auth-both-types.js <code> <shop_id>');
    console.log();
    console.log('  Test with both Shop ID and Main Account ID:');
    console.log('    node test-auth-both-types.js <code> <shop_id> <main_account_id>');
    console.log();
    console.log('📝 Notes:');
    console.log('  - Either shop_id OR main_account_id can be used, not both');
    console.log('  - Shop ID is for shop-level authorization');
    console.log('  - Main Account ID is for account-level authorization');
    console.log('  - The authorization code can only be used once');
    console.log();
    return;
  }

  // Test 1: Get token with Shop ID
  const result1 = await testAuthWithShopId();
  
  if (result1) {
    // Test 3: Refresh token with Shop ID
    await testRefreshWithShopId(result1.refresh_token, process.argv[3]);
  }

  // Test 2: Get token with Main Account ID (if provided)
  if (process.argv[4]) {
    console.log('\n' + '='.repeat(60) + '\n');
    const result2 = await testAuthWithMainAccountId();
    
    if (result2) {
      // Test 4: Refresh token with Main Account ID
      await testRefreshWithMainAccountId(result2.refresh_token, process.argv[4]);
    }
  }

  console.log('='.repeat(60));
  console.log('✨ All tests completed!');
  console.log();
  console.log('💡 Tips:');
  console.log('  - Save the tokens to your .env file');
  console.log('  - Shop ID tokens work for shop-level APIs');
  console.log('  - Main Account ID tokens work for account-level APIs');
  console.log('  - Tokens expire after 4 hours, use refresh token to get new ones');
}

main();
