require('dotenv').config();
const { createEcomConnector } = require('./dist');

/**
 * Simple helper to generate Shopee authorization URL
 * 
 * Usage:
 *   node shopee-auth-helper.js
 * 
 * This will generate an authorization URL that you can:
 * 1. Open in browser
 * 2. Authorize your shop
 * 3. Copy the code from the redirect URL
 * 4. Use the code with shopee-get-token.js to get access token
 */

function generateAuthUrl() {
  console.log('\n========================================');
  console.log('  Shopee Auth URL Generator');
  console.log('========================================\n');

  // Check credentials
  if (!process.env.SHOPEE_PARTNER_ID || !process.env.SHOPEE_PARTNER_KEY) {
    console.error('❌ Missing Shopee credentials in .env!');
    console.log('\nPlease set in .env:');
    console.log('  SHOPEE_PARTNER_ID=...');
    console.log('  SHOPEE_PARTNER_KEY=...\n');
    process.exit(1);
  }

  console.log('✓ Found credentials');
  console.log('  Partner ID:', process.env.SHOPEE_PARTNER_ID);
  console.log();

  try {
    // Create connector
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: '0', // Temporary
      },
      sandbox: true,
    });

    // Generate auth URL with different redirect URLs
    console.log('📝 Authorization URLs:\n');
    
    // Option 1: Use localhost callback (for automated flow)
    const localRedirect = 'http://localhost:3000/callback';
    const authUrl1 = connector.generateAuthUrl(localRedirect);
    
    console.log('1. With localhost callback (use with shopee-auth-demo.js):');
    console.log('   Redirect URL:', localRedirect);
    console.log('   Auth URL:');
    console.log('   ' + authUrl1);
    console.log();

    // Option 2: Use a simple URL to copy code manually
    const simpleRedirect = 'https://www.google.com';
    const authUrl2 = connector.generateAuthUrl(simpleRedirect);
    
    console.log('2. With Google redirect (manual copy code):');
    console.log('   Redirect URL:', simpleRedirect);
    console.log('   Auth URL:');
    console.log('   ' + authUrl2);
    console.log();
    
    // Option 3: Custom redirect URL from env
    if (process.env.SHOPEE_REDIRECT_URL) {
      const customRedirect = process.env.SHOPEE_REDIRECT_URL;
      const authUrl3 = connector.generateAuthUrl(customRedirect);
      
      console.log('3. With custom redirect URL (from .env):');
      console.log('   Redirect URL:', customRedirect);
      console.log('   Auth URL:');
      console.log('   ' + authUrl3);
      console.log();
    }

    console.log('═'.repeat(60));
    console.log('\n⚠️  IMPORTANT: Redirect URL Configuration');
    console.log('─'.repeat(60));
    console.log();
    console.log('The redirect URL MUST be configured in Shopee Partner Console!');
    console.log();
    console.log('Steps to configure:');
    console.log('  1. Go to: https://open.shopee.com/account/api');
    console.log('  2. Find "Redirect URL Domain" setting');
    console.log('  3. Add allowed domains:');
    console.log('     - For testing: http://localhost:3000');
    console.log('     - For production: https://yourdomain.com');
    console.log('  4. Save changes');
    console.log();
    console.log('Error "error_param" + redirect message = URL not configured!');
    console.log();

    console.log('═'.repeat(60));
    console.log('\n📋 Instructions:\n');
    
    console.log('OPTION A - Automated Flow (Recommended):');
    console.log('  1. Run: node shopee-auth-demo.js');
    console.log('  2. Open the generated URL in browser');
    console.log('  3. Authorize your shop');
    console.log('  4. Access token will be obtained automatically');
    console.log();

    console.log('OPTION B - Manual Flow:');
    console.log('  1. Copy the auth URL above (option 2)');
    console.log('  2. Open it in browser and authorize');
    console.log('  3. You will be redirected to Google');
    console.log('  4. Copy the "code" and "shop_id" from the URL parameters');
    console.log('  5. Run: node shopee-get-token.js <code> <shop_id>');
    console.log();

    console.log('═'.repeat(60));
    console.log();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateAuthUrl();
