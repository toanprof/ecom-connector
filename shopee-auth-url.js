require('dotenv').config();
const crypto = require('crypto');

const partnerId = process.env.SHOPEE_PARTNER_ID || '1194848';
const redirectUrl = process.env.SHOPEE_REDIRECT_URL || 'http://localhost:3000/callback';

console.log('\n========================================');
console.log('   Shopee Authorization URL Generator');
console.log('========================================\n');

const authUrl = `https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=${encodeURIComponent(redirectUrl)}`;

console.log('📋 BƯỚC 1: Lấy Authorization Code\n');
console.log('Copy URL sau và mở trong browser:\n');
console.log('🔗 ' + authUrl);
console.log('\n');
console.log('Sau đó:');
console.log('  1. Đăng nhập với Shopee shop account');
console.log('  2. Click "Authorize"');
console.log('  3. Bạn sẽ được redirect về URL có dạng:');
console.log('     http://localhost:3000/callback?code=XXXXX&shop_id=226159527');
console.log('  4. Copy phần "code=XXXXX" (chỉ phần XXXXX)');
console.log('\n');
console.log('📋 BƯỚC 2: Lấy Access Token\n');
console.log('Sau khi có code, chạy:');
console.log('  node shopee-get-token.js YOUR_CODE_HERE');
console.log('\n');
console.log('========================================\n');
