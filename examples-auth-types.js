/**
 * Quick Reference: Shopee Authentication with Shop ID or Main Account ID
 * 
 * Key Points:
 * 1. Use EITHER shop_id OR main_account_id (not both)
 * 2. shop_id: For shop-level authorization
 * 3. main_account_id: For account-level authorization
 */

require('dotenv').config();
const { createEcomConnector } = require('./dist');

// ============================================================================
// EXAMPLE 1: Using Shop ID (Most Common)
// ============================================================================

async function exampleWithShopId() {
  const connector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: process.env.SHOPEE_SHOP_ID,
    },
    sandbox: true,
  });

  // Get access token with shop_id
  const tokenResult = await connector.getAccessToken(
    authorizationCode,
    shopId  // Pass shop_id as second parameter
  );

  console.log('Response includes shop_id:', tokenResult.shop_id);

  // Refresh token with shop_id
  const refreshResult = await connector.refreshAccessToken(
    refreshToken,
    shopId  // Pass shop_id as second parameter
  );
}

// ============================================================================
// EXAMPLE 2: Using Main Account ID (Multi-Shop Accounts)
// ============================================================================

async function exampleWithMainAccountId() {
  const connector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: '0', // Dummy value, not used
    },
    sandbox: true,
  });

  // Get access token with main_account_id
  const tokenResult = await connector.getAccessToken(
    authorizationCode,
    undefined,        // Pass undefined for shop_id
    mainAccountId     // Pass main_account_id as third parameter
  );

  console.log('Response includes main_account_id:', tokenResult.main_account_id);

  // Refresh token with main_account_id
  const refreshResult = await connector.refreshAccessToken(
    refreshToken,
    undefined,        // Pass undefined for shop_id
    mainAccountId     // Pass main_account_id as third parameter
  );
}

// ============================================================================
// EXAMPLE 3: Error Cases
// ============================================================================

async function errorExamples() {
  const connector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: process.env.SHOPEE_SHOP_ID,
    },
    sandbox: true,
  });

  try {
    // ❌ ERROR: Neither shop_id nor main_account_id provided
    await connector.getAccessToken(code);
    // Throws: "Either shopId or mainAccountId must be provided"
  } catch (error) {
    console.error(error.message);
  }

  try {
    // ❌ ERROR: Both shop_id and main_account_id provided
    await connector.getAccessToken(code, shopId, mainAccountId);
    // Throws: "Cannot provide both shopId and mainAccountId, use only one"
  } catch (error) {
    console.error(error.message);
  }
}

// ============================================================================
// EXAMPLE 4: Complete Flow with Shop ID
// ============================================================================

async function completeFlowWithShopId() {
  const shopId = '226159527';
  const authCode = 'your_authorization_code_here';

  const connector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: shopId,
    },
    sandbox: true,
  });

  // Step 1: Generate authorization URL
  const authUrl = connector.generateAuthUrl('http://localhost:3000/callback');
  console.log('1. Visit this URL to authorize:', authUrl);

  // Step 2: Exchange code for tokens (after user authorizes)
  console.log('\n2. Exchange authorization code for tokens...');
  const tokenResult = await connector.getAccessToken(authCode, shopId);
  console.log('✅ Tokens obtained');
  console.log('   Access Token:', tokenResult.access_token.substring(0, 30) + '...');
  console.log('   Refresh Token:', tokenResult.refresh_token.substring(0, 30) + '...');
  console.log('   Expires in:', tokenResult.expire_in, 'seconds');
  console.log('   Shop ID:', tokenResult.shop_id);

  // Step 3: Use access token for API calls
  console.log('\n3. Use access token for API calls...');
  const authenticatedConnector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: shopId,
      accessToken: tokenResult.access_token,
    },
    sandbox: true,
  });

  const products = await authenticatedConnector.getProducts({ limit: 5 });
  console.log('✅ Retrieved', products.length, 'products');

  // Step 4: Refresh token when it expires
  console.log('\n4. Refresh token (when access token expires)...');
  const refreshResult = await connector.refreshAccessToken(
    tokenResult.refresh_token,
    shopId
  );
  console.log('✅ Token refreshed');
  console.log('   New Access Token:', refreshResult.access_token.substring(0, 30) + '...');
  console.log('   New Refresh Token:', refreshResult.refresh_token.substring(0, 30) + '...');
}

// ============================================================================
// Method Signatures
// ============================================================================

/*
// Get Access Token - Method Signature
async getAccessToken(
  code: string,              // Required: Authorization code
  shopId?: string,           // Optional: Shop ID (use this OR main_account_id)
  mainAccountId?: string     // Optional: Main Account ID (use this OR shop_id)
): Promise<{
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;          // Present when shop_id was used
  main_account_id?: number;  // Present when main_account_id was used
  partner_id: number;
}>

// Refresh Access Token - Method Signature
async refreshAccessToken(
  refreshToken: string,      // Required: Refresh token
  shopId?: string,           // Optional: Shop ID (use this OR main_account_id)
  mainAccountId?: string     // Optional: Main Account ID (use this OR shop_id)
): Promise<{
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id?: number;
  main_account_id?: number;
  partner_id: number;
}>
*/

console.log('📖 See SHOPEE_AUTH_TYPES.md for complete documentation');
console.log('🧪 Run test-auth-both-types.js to test both authentication types');
console.log('🔄 Run test-refresh-token.js to test token refresh');
