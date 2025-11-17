import dotenv from 'dotenv';
import { shopeeProductService, shopeeOrderService } from './src/index.js';

dotenv.config();

async function testWithLogging() {
  try {
    console.log('=== Test 1: Get Products ===');
    const products = await shopeeProductService.getProducts({ page: 1, pageSize: 10 });
    console.log("🚀 ~ products:", products)
    console.log('Total products:', products.length);

    console.log('=== Test 2: Get Orders (last 30 days) ===');
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
    console.log(`Time range: ${new Date(thirtyDaysAgo * 1000).toISOString()} to ${new Date(now * 1000).toISOString()}`);
    const orders = await shopeeOrderService.getOrders({
      time_range_field: 'create_time',
      from: thirtyDaysAgo,
      to: now,
    });
    console.log('Total orders:', orders.length);
    if (orders.length > 0) {
      console.log('First order:', JSON.stringify(orders[0], null, 2));
    } else {
      console.log('No orders found. This might be normal if the shop has no orders in this period.');
    }

  } catch (error: any) {
    console.error('\n=== Error ===');
    console.error('Message:', error.message);
    if (error.error_code) console.error('Error Code:', error.error_code);
    if (error.request_id) console.error('Request ID:', error.request_id);
    console.error('\nFull error:', error);
  }
}

testWithLogging();
