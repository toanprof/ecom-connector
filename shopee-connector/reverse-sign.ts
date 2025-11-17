// Test trực tiếp với các giá trị từ URL của bạn
import crypto from 'crypto';

const partnerId = '1194848';
const timestamp = '1763344835';
const expectedSign = '597aa733a47e39384c00b88f37ec8367da81291d3a4f9ed3fedc8689433114dd';

// Partner key có thể cần decode từ shpk... format
// Thử với raw partner key (bạn cần lấy từ Shopee dashboard)

console.log('=== Reverse Engineering Signature ===');
console.log('Expected sign:', expectedSign);
console.log();

// Theo doc Shopee, base_string format có thể là:
// Option 1: {partner_id}{path}{timestamp}{access_token}{shop_id}
// Option 2: {partner_id}{path}{timestamp}

const testPaths = [
  '/api/v2/product/get_item_base_info',
  'product/get_item_base_info',
  '/product/get_item_base_info',
];

const partnerKeyHex = 'shpk5a575048596c507649416f4f757a764b787171726963495a614f5a716279';

// Thử decode partner key nếu nó là hex
console.log('Partner Key (as is):', partnerKeyHex);
console.log();

testPaths.forEach((path, i) => {
  const baseString = `${partnerId}${path}${timestamp}`;
  console.log(`Test ${i + 1}: ${path}`);
  console.log(`  Base string: ${baseString}`);
  
  // Test với partner key as-is
  const sig1 = crypto.createHmac('sha256', partnerKeyHex).update(baseString).digest('hex');
  console.log(`  Signature: ${sig1}`);
  console.log(`  Match: ${sig1 === expectedSign}`);
  console.log();
});
