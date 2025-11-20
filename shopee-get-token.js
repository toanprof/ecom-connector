require('dotenv').config();
const { createEcomConnector } = require('./dist');

const authCode = process.argv[2];
const shopId = process.argv[3];

if (!authCode) {
  console.error('\n❌ Missing authorization code!');
  console.log('\nUsage:');
  console.log('  node shopee-get-token.js <AUTH_CODE> <SHOP_ID>');
  console.log('\nTo get auth code and shop_id:');
  console.log('  Option 1: node shopee-auth-demo.js (automated)');
  console.log('  Option 2: node shopee-auth-helper.js (manual)');
  console.log('\n');
  process.exit(1);
}

const partnerId = process.env.SHOPEE_PARTNER_ID;
const partnerKey = process.env.SHOPEE_PARTNER_KEY;

if (!partnerId || !partnerKey) {
  console.error('❌ Missing credentials in .env!');
  console.log('Required: SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY');
  process.exit(1);
}

// Use SHOPEE_SHOP_ID from .env if not provided as argument
const targetShopId = shopId || process.env.SHOPEE_SHOP_ID;

if (!targetShopId) {
  console.error('❌ Missing shop ID!');
  console.log('\nProvide shop_id as argument or set SHOPEE_SHOP_ID in .env');
  console.log('Usage:');
  console.log('  node shopee-get-token.js <AUTH_CODE> <SHOP_ID>');
  console.log('\n');
  process.exit(1);
}

console.log('\n========================================');
console.log('   Shopee Get Access Token');
console.log('========================================\n');
console.log('Partner ID:', partnerId);
console.log('Shop ID:', targetShopId);
console.log('Auth Code:', authCode.substring(0, 20) + '...');
console.log('\n🔄 Getting access token...\n');

async function getAccessToken() {
  try {
    // Create connector
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: partnerId,
        partnerKey: partnerKey,
        shopId: targetShopId,
      },
      sandbox: true,
    });

    // Get access token
    const tokenData = await connector.getAccessToken(authCode, targetShopId);
    console.log("🚀 ~ tokenData:", tokenData)

    console.log('✅ SUCCESS!\n');
    console.log('════════════════════════════════════════');
    console.log('Token Information:');
    console.log('════════════════════════════════════════');
    console.log('Access Token:', tokenData.accessToken);
    console.log('Refresh Token:', tokenData.refreshToken);
    console.log('Expires In:', tokenData.expireIn, 'seconds');
    console.log('Shop ID:', tokenData.shopId);
    console.log('Partner ID:', tokenData.partnerId);
    console.log("════════════════════════════════════════\n");
    // Calculate expiration
    const expiresAt = new Date(Date.now() + tokenData.expireIn * 1000);
    console.log('Token expires at:', expiresAt.toISOString());
    console.log();

    console.log('📝 Copy these to your .env file:\n');
    console.log(`SHOPEE_PARTNER_ID=${tokenData.partnerId}`);
    console.log(`SHOPEE_SHOP_ID=${tokenData.shopId}`);
    console.log(`SHOPEE_ACCESS_TOKEN=${tokenData.accessToken}`);
    console.log(`SHOPEE_REFRESH_TOKEN=${tokenData.refreshToken}`);
    console.log('\n');

    console.log('Next steps:');
    console.log('  1. Save the tokens to .env');
    console.log('  2. Run: node shopee-demo.js');
    console.log('\n');

    // Test refresh token
    console.log('════════════════════════════════════════');
    console.log('🔄 Testing Refresh Token...');
    console.log('════════════════════════════════════════\n');

    try {
      const refreshedData = await connector.refreshAccessToken(
        tokenData.refreshToken,
        targetShopId
      );

      console.log('✅ Refresh successful!\n');
      console.log('New Access Token:', refreshedData.accessToken);
      console.log('New Refresh Token:', refreshedData.refreshToken);
      console.log('Expires In:', refreshedData.expireIn, 'seconds');
      console.log();

      const newExpiresAt = new Date(Date.now() + refreshedData.expireIn * 1000);
      console.log('New token expires at:', newExpiresAt.toISOString());
      console.log('\n');

      console.log('📝 Updated tokens for .env:\n');
      console.log(`SHOPEE_ACCESS_TOKEN=${refreshedData.accessToken}`);
      console.log(`SHOPEE_REFRESH_TOKEN=${refreshedData.refreshToken}`);
      console.log('\n');

    } catch (refreshError) {
      console.log('⚠️  Refresh token test failed (this is normal for some cases)');
      console.log('Error:', refreshError.message);
      console.log('\n');
    }

  } catch (error) {
    console.error('❌ ERROR!\n');
    console.error('Message:', error.message);

    if (error.code) {
      console.error('Error Code:', error.code);
    }

    if (error.platformError) {
      console.error('\nPlatform Error Details:');
      console.error(JSON.stringify(error.platformError, null, 2));
    }

    console.log('\n');
    console.log('Possible causes:');
    console.log('  1. Auth code has expired (can only be used once)');
    console.log('  2. Auth code is invalid');
    console.log('  3. Shop ID does not match');
    console.log('  4. Partner credentials are invalid');
    console.log('\nTry again from the beginning:');
    console.log('  node shopee-auth-helper.js');
    console.log('\n');
    process.exit(1);
  }
}

getAccessToken();
