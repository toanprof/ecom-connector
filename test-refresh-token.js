require('dotenv').config();
const { createEcomConnector } = require('./dist');

async function testRefreshToken() {
  console.log('=== Test Refresh Access Token ===\n');

  // Check if required credentials are available
  const refreshToken = process.env.SHOPEE_REFRESH_TOKEN;
  const shopId = process.env.SHOPEE_SHOP_ID;
  const mainAccountId = process.env.SHOPEE_MAIN_ACCOUNT_ID;

  if (!refreshToken) {
    console.error('❌ SHOPEE_REFRESH_TOKEN not found in .env file');
    console.log('Please run shopee-get-token.js first to obtain tokens');
    return;
  }

  if (!shopId && !mainAccountId) {
    console.error('❌ Neither SHOPEE_SHOP_ID nor SHOPEE_MAIN_ACCOUNT_ID found in .env file');
    console.log('Please provide either SHOPEE_SHOP_ID or SHOPEE_MAIN_ACCOUNT_ID');
    return;
  }

  console.log('📋 Current Credentials:');
  if (shopId) {
    console.log(`  Shop ID: ${shopId}`);
  }
  if (mainAccountId) {
    console.log(`  Main Account ID: ${mainAccountId}`);
  }
  console.log(`  Refresh Token: ${refreshToken.substring(0, 20)}...`);
  console.log();

  try {
    // Create connector instance
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: shopId,
      },
      sandbox: true,
    });

    console.log('🔄 Refreshing access token...');
    const result = await connector.refreshAccessToken(refreshToken, shopId, mainAccountId);

    console.log('✅ Token refreshed successfully!\n');
    console.log('📦 Response Data:');
    console.log(`  Partner ID: ${result.partner_id}`);
    if (result.shop_id) {
      console.log(`  Shop ID: ${result.shop_id}`);
    }
    if (result.main_account_id) {
      console.log(`  Main Account ID: ${result.main_account_id}`);
    }
    console.log(`  Access Token: ${result.access_token.substring(0, 30)}...`);
    console.log(`  Refresh Token: ${result.refresh_token.substring(0, 30)}...`);
    console.log(`  Expires In: ${result.expire_in} seconds (${result.expire_in / 3600} hours)`);
    
    const expiryDate = new Date(Date.now() + result.expire_in * 1000);
    console.log(`  Expiry Time: ${expiryDate.toLocaleString()}`);
    console.log();

    // Test the new access token by fetching products
    console.log('🧪 Testing new access token with API call...');
    const testConnector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: shopId,
        accessToken: result.access_token,
      },
      sandbox: true,
    });

    const products = await testConnector.getProducts({ limit: 1 });
    console.log(`✅ New token works! Retrieved ${products.length} product(s)`);
    if (products.length > 0) {
      console.log(`  Product: ${products[0].name} (ID: ${products[0].id})`);
    }
    console.log();

    console.log('💾 Update your .env file with these new tokens:');
    console.log(`SHOPEE_ACCESS_TOKEN=${result.access_token}`);
    console.log(`SHOPEE_REFRESH_TOKEN=${result.refresh_token}`);
    console.log();

    console.log('✨ All tests passed!');

  } catch (error) {
    console.error('❌ Error refreshing token:', error.message);
    if (error.originalError) {
      console.error('Original error:', error.originalError);
    }
    console.log();
    console.log('💡 Common issues:');
    console.log('  - Refresh token may have expired (valid for 30 days)');
    console.log('  - Shop ID might be incorrect');
    console.log('  - Partner credentials might be invalid');
    console.log('  - Network connectivity issues');
    console.log();
    console.log('If refresh token expired, run shopee-auth-demo.js to get new tokens');
  }
}

// Run the test
testRefreshToken();
