require('dotenv').config();
const { createEcomConnector } = require('./dist');

console.log('\n========================================');
console.log('   TikTok Shop - Get Access Token');
console.log('========================================\n');

const appKey = process.env.TIKTOK_APP_KEY;
const appSecret = process.env.TIKTOK_APP_SECRET;

if (!appKey || !appSecret) {
  console.error('❌ Missing credentials in .env!');
  console.log('Required: TIKTOK_APP_KEY, TIKTOK_APP_SECRET');
  process.exit(1);
}

// Get auth_code from command line argument
const authCode = process.argv[2];

if (!authCode) {
  console.error('❌ Missing auth_code parameter!');
  console.log('\nUsage:');
  console.log('   node tiktok-get-token.js <auth_code>\n');
  console.log('Example:');
  console.log('   node tiktok-get-token.js ABC123XYZ789DEF456GHI\n');
  console.log('💡 First, run: node tiktok-get-auth-url.js to get authorization URL');
  process.exit(1);
}

console.log('📋 Configuration:');
console.log('   App Key:', appKey);
console.log('   App Secret:', appSecret ? '****' + appSecret.slice(-8) : 'Not set');
console.log('   Auth Code:', authCode.substring(0, 20) + '...');
console.log();

async function getAccessToken() {
  try {
    console.log('═══════════════════════════════════════');
    console.log('🔄 Fetching Access Token...');
    console.log('═══════════════════════════════════════\n');

    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey,
        appSecret,
        accessToken: '', // Not needed for getting token
      },
    });

    const tokenData = await connector.getAccessToken(authCode);

    console.log('✅ Success! Access token retrieved:\n');
    console.log('─────────────────────────────────────────');
    console.log('Access Token:', tokenData.access_token);
    console.log('Refresh Token:', tokenData.refresh_token);
    
    // Calculate expiration time
    const expireInSeconds = tokenData.access_token_expire_in 
      ? Math.floor(tokenData.access_token_expire_in - Date.now() / 1000)
      : 'Unknown';
    console.log('Expires In:', expireInSeconds, 'seconds (~' + 
      (typeof expireInSeconds === 'number' ? Math.floor(expireInSeconds / 3600) : 'N/A') + ' hours)');
    
    console.log('Open ID:', tokenData.open_id || 'N/A');
    console.log('Seller Name:', tokenData.seller_name || 'N/A');
    console.log('Seller Region:', tokenData.seller_base_region || 'N/A');
    console.log('─────────────────────────────────────────\n');

    // Now fetch shop information using the access token
    console.log('🔄 Fetching shop information...\n');
    
    try {
      // Create a new connector with the access token
      const shopConnector = createEcomConnector({
        platform: 'tiktok-shop',
        credentials: {
          appKey,
          appSecret,
          shopId: '', // Not needed for getAuthorizedShops
          accessToken: tokenData.access_token,
        },
      });
      
      const shopsData = await shopConnector.getAuthorizedShops();
      
      if (shopsData.shops && shopsData.shops.length > 0) {
        const shop = shopsData.shops[0];
        tokenData.shopId = shop.shop_id || shop.id;
        tokenData.shopCipher = shop.shop_cipher || shop.cipher;
        tokenData.shopName = shop.shop_name || shop.name;
        tokenData.shopRegion = shop.region;
        
        console.log('✅ Shop information retrieved:');
        console.log('   Shop ID:', tokenData.shop_id);
        console.log('   Shop Cipher:', tokenData.shop_cipher);
        console.log('   Shop Name:', tokenData.shop_name || 'N/A');
        console.log('   Shop Region:', tokenData.shop_region || 'N/A');
        console.log();
      } else {
        console.log('⚠️  No shops found for this authorization\n');
      }
    } catch (shopError) {
      console.log('⚠️  Could not fetch shop info:', shopError.message);
      console.log('   You can get shop info later using: connector.getAuthorizedShops()\n');
    }

    console.log('📝 Update your .env file with:\n');
    console.log('TIKTOK_ACCESS_TOKEN=' + tokenData.access_token);
    console.log('TIKTOK_REFRESH_TOKEN=' + tokenData.refresh_token);
    if (tokenData.shop_id) {
      console.log('TIKTOK_SHOP_ID=' + tokenData.shop_id);
    }
    if (tokenData.shop_cipher) {
      console.log('TIKTOK_SHOP_CIPHER=' + tokenData.shop_cipher);
    }
    console.log();

    console.log('═══════════════════════════════════════');
    console.log('✅ Token Retrieved Successfully!');
    console.log('═══════════════════════════════════════\n');

    console.log('📊 Token Details:\n');
    console.log(JSON.stringify(tokenData, null, 2));
    console.log();

    console.log('🎯 Next Steps:\n');
    console.log('1️⃣  Copy the access token to your .env file');
    console.log('2️⃣  Run: node tiktok-shop-demo.js to test API calls');
    const hoursRemaining = typeof expireInSeconds === 'number' ? Math.floor(expireInSeconds / 3600) : 'N/A';
    console.log('3️⃣  Token expires in ~' + hoursRemaining + ' hours');
    console.log('4️⃣  Use refresh token when access token expires\n');

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
    console.log('1. Invalid auth_code:');
    console.log('   - Auth code may have expired (valid ~10 minutes)');
    console.log('   - Get a new auth code: node tiktok-get-auth-url.js\n');

    console.log('2. Wrong app credentials:');
    console.log('   - Check TIKTOK_APP_KEY and TIKTOK_APP_SECRET in .env\n');

    console.log('3. Auth code already used:');
    console.log('   - Each auth code can only be used once');
    console.log('   - Get a new authorization\n');

    process.exit(1);
  }
}

getAccessToken();
