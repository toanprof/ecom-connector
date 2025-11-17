import dotenv from 'dotenv';
import { shopeeOrderService, shopeeProductService } from './src/index.js';

dotenv.config();

async function main() {
  try {
    console.log('Fetching products...');
    const products = await shopeeProductService.getProducts({ page: 1, pageSize: 10 });
    console.log('Products:', products);

    console.log('Fetching orders...');
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;
    const orders = await shopeeOrderService.getOrders({
      time_range_field: 'create_time',
      from: sevenDaysAgo,
      to: now,
    });
    console.log('Orders:', orders);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();
