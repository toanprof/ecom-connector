require('dotenv').config();
const axios = require('axios');
const crypto = require('crypto');

const authCode = process.argv[2];

if (!authCode) {
  console.error('\n❌ Missing authorization code!');
  console.log('\nUsage:');
  console.log('  node shopee-get-token.js YOUR_AUTH_CODE');
  console.log('\nĐể lấy auth code, chạy:');
  console.log('  node shopee-auth-url.js');
  console.log('\n');
  process.exit(1);
}

const partnerId = process.env.SHOPEE_PARTNER_ID;
const partnerKey = process.env.SHOPEE_PARTNER_KEY;
const shopId = process.env.SHOPEE_SHOP_ID;

if (!partnerId || !partnerKey || !shopId) {
  console.error('❌ Missing credentials in .env!');
  console.log('Cần có: SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY, SHOPEE_SHOP_ID');
  process.exit(1);
}

console.log('\n========================================');
console.log('   Shopee Get Access Token');
console.log('========================================\n');
console.log('Partner ID:', partnerId);
console.log('Shop ID:', shopId);
console.log('Auth Code:', authCode);
console.log('\n🔄 Đang lấy access token...\n');

async function getAccessToken() {
  try {
    const path = '/api/v2/auth/token/get';
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Generate signature
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', partnerKey)
      .update(baseString)
      .digest('hex');

    console.log('Debug info:');
    console.log('  Path:', path);
    console.log('  Timestamp:', timestamp);
    console.log('  Base string:', baseString);
    console.log('  Signature:', sign);
    console.log('\n');

    const response = await axios.post(
      `https://partner.test-stable.shopeemobile.com${path}`,
      {
        code: authCode,
        shop_id: parseInt(shopId),
        partner_id: parseInt(partnerId)
      },
      {
        params: {
          partner_id: parseInt(partnerId),
          timestamp,
          sign
        },
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ SUCCESS!\n');
    console.log('========================================');
    console.log('Access Token:', response.data.access_token);
    console.log('Refresh Token:', response.data.refresh_token);
    console.log('Expires in:', response.data.expire_in, 'seconds');
    console.log('Shop ID:', response.data.shop_id);
    console.log('========================================\n');
    
    console.log('📝 Copy dòng sau vào file .env:\n');
    console.log(`SHOPEE_ACCESS_TOKEN=${response.data.access_token}`);
    console.log('\n');
    console.log('Sau đó chạy:');
    console.log('  npm run build');
    console.log('  node shopee-demo.js');
    console.log('\n');

  } catch (error) {
    console.error('❌ ERROR!\n');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data?.message || error.response.data?.error);
      console.error('Full response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.log('\n');
    console.log('Có thể do:');
    console.log('  1. Auth code đã hết hạn (chỉ dùng được 1 lần)');
    console.log('  2. Auth code không đúng');
    console.log('  3. Partner credentials không hợp lệ');
    console.log('\nThử lại từ đầu:');
    console.log('  node shopee-auth-url.js');
    console.log('\n');
    process.exit(1);
  }
}

getAccessToken();
