import ShopeeClient from '../api/shopee-client.js';
import ProductService from './services/product.service.js';
import OrderService from './services/order.service.js';
import ReturnService from './services/return.service.js';
import config from '../config.js';

const client = new ShopeeClient({
  partnerId: config.partnerId,
  partnerKey: config.partnerKey,
  shopId: config.shopId,
  accessToken: config.accessToken,
  apiUrl: config.apiUrl,
});

export const shopeeProductService = new ProductService(client);
export const shopeeOrderService = new OrderService(client);
export const shopeeReturnService = new ReturnService(client);

export default {
  client,
  shopeeProductService,
  shopeeOrderService,
  shopeeReturnService,
};
