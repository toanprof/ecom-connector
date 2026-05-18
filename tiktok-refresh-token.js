require('dotenv').config();
const { createEcomConnector } = require('./dist');

console.log('\n========================================');
console.log('   TikTok Shop - Refresh Access Token');
console.log('========================================\n');

const appKey = process.env.TIKTOK_APP_KEY;
const appSecret = process.env.TIKTOK_APP_SECRET;
const refreshToken = process.env.TIKTOK_REFRESH_TOKEN || process.argv[2];

if (!appKey || !appSecret) {
  console.error('❌ Missing credentials in .env!');
  console.log('Required: TIKTOK_APP_KEY, TIKTOK_APP_SECRET');
  process.exit(1);
}

if (!refreshToken || refreshToken === 'your_refresh_token_here') {
  console.error('❌ Missing refresh token!');
  console.log('\nUsage:');
  console.log('   node tiktok-refresh-token.js <refresh_token>\n');
  console.log('Or set in .env:');
  console.log('   TIKTOK_REFRESH_TOKEN=<your_refresh_token>\n');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log('   App Key:', appKey);
console.log('   App Secret:', appSecret ? '****' + appSecret.slice(-8) : 'Not set');
console.log('   Refresh Token:', refreshToken.substring(0, 20) + '...');
console.log();

async function refreshAccessToken() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('🔄 Refreshing Access Token...');
    console.log('═══════════════════════════════════════\n');

    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey,
        appSecret,
        accessToken: '', // Not needed for refresh
      },
    });

    const newTokenData = await connector.refreshAccessToken(refreshToken);
    console.log("🚀 ~ newTokenData:", newTokenData)

    console.log('✅ Success! New access token retrieved:\n');
    console.log('─────────────────────────────────────────');
    console.log('Access Token:', newTokenData.access_token);
    console.log('Refresh Token:', newTokenData.refresh_token);
    console.log('Expires In:', newTokenData.expire_in, 'seconds');
    console.log('Shop ID:', newTokenData.shop_id || 'N/A');
    console.log('─────────────────────────────────────────\n');

    console.log('📝 Update your .env file with:\n');
    console.log('TIKTOK_ACCESS_TOKEN=' + newTokenData.access_token);
    console.log('TIKTOK_REFRESH_TOKEN=' + newTokenData.refresh_token);
    if (newTokenData.shop_id) {
      console.log('TIKTOK_SHOP_ID=' + newTokenData.shop_id);
    }
    console.log();

    console.log('═══════════════════════════════════════');
    console.log('✅ Token Refreshed Successfully!');
    console.log('═══════════════════════════════════════\n');

    console.log('📊 New Token Details:\n');
    console.log(JSON.stringify(newTokenData, null, 2));
    console.log();

    console.log('🎯 Next Steps:\n');
    console.log('1️⃣  Copy the new access token to your .env file');
    console.log('2️⃣  Copy the new refresh token (it also changes!)');
    console.log('3️⃣  New token expires in ~' + Math.floor(newTokenData.expire_in / 3600) + ' hours');
    console.log('4️⃣  Run: node tiktok-shop-demo.js to test API calls\n');

  } catch (error) {
    console.error('\n❌ ERROR!\n');
    console.error('Message:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.platformError) {
      console.error('\nPlatform Error:');
      console.error(JSON.stringify(error.platformError, null, 2));
    }

    console.log('\n💡 Common Issues:\n');
    console.log('1. Invalid refresh token:');
    console.log('   - Refresh token may have expired');
    console.log('   - Need to re-authorize: node tiktok-get-auth-url.js\n');

    console.log('2. Refresh token already used:');
    console.log('   - Each refresh token can only be used once');
    console.log('   - Use the new refresh token from last refresh\n');

    console.log('3. Wrong app credentials:');
    console.log('   - Check TIKTOK_APP_KEY and TIKTOK_APP_SECRET in .env\n');

    process.exit(1);
  }
}

refreshAccessToken();
