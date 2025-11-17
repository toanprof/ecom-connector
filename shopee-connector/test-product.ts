import dotenv from 'dotenv';
import { shopeeProductService } from './src/index.js';

dotenv.config();

async function testGetProductById() {
  try {
    console.log('=== Testing Shopee API ===');
    console.log('Config:');
    console.log('  Partner ID:', process.env.SHOPEE_PARTNER_ID);
    console.log('  Shop ID:', process.env.SHOPEE_SHOP_ID);
    console.log('  API URL:', process.env.SHOPEE_API_URL);
    console.log('  Access Token:', process.env.SHOPEE_ACCESS_TOKEN ? '***' + process.env.SHOPEE_ACCESS_TOKEN.slice(-8) : 'NOT SET');
    console.log();

    // Test với product ID từ URL mẫu của bạn
    const productId = 844110063;
    console.log(`Fetching product ID: ${productId}...`);
    
    const product = await shopeeProductService.getProductById(productId);
    
    console.log('\n=== Product Details ===');
    console.log(JSON.stringify(product, null, 2));
    
  } catch (error: any) {
    console.error('\n=== Error occurred ===');
    console.error('Message:', error.message);
    if (error.error_code) console.error('Error Code:', error.error_code);
    if (error.request_id) console.error('Request ID:', error.request_id);
    console.error('\nFull Error:', error);
  }
}

testGetProductById();
