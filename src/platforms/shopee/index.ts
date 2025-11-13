import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import {
  ECommercePlatform,
  Product,
  ProductInput,
  ProductQueryOptions,
  Order,
  OrderQueryOptions,
  EcomConnectorConfig,
  EcomConnectorError,
  ShopeeCredentials,
} from '../../interfaces';
import { ShopeeProduct, ShopeeOrder } from './types';

export class ShopeePlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: ShopeeCredentials;
  private baseURL: string = 'https://partner.shopeemobile.com';

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as ShopeeCredentials;
    
    if (config.sandbox) {
      this.baseURL = 'https://partner.test-stable.shopeemobile.com';
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const path = config.url?.replace(this.baseURL, '') || '';
        const signature = this.generateSignature(path, timestamp);
        
        config.params = {
          ...config.params,
          partner_id: parseInt(this.credentials.partnerId),
          timestamp,
          sign: signature,
          shop_id: parseInt(this.credentials.shopId),
        };

        if (this.credentials.accessToken) {
          config.params.access_token = this.credentials.accessToken;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw new EcomConnectorError(
          error.response?.data?.message || error.message,
          error.response?.data?.error || 'SHOPEE_ERROR',
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(path: string, timestamp: number): string {
    const partnerId = parseInt(this.credentials.partnerId);
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', this.credentials.partnerKey)
      .update(baseString)
      .digest('hex');
    return sign;
  }

  private mapShopeeProductToProduct(shopeeProduct: ShopeeProduct): Product {
    return {
      id: shopeeProduct.item_id.toString(),
      name: shopeeProduct.item_name,
      description: shopeeProduct.description,
      price: shopeeProduct.price,
      currency: 'SGD',
      stock: shopeeProduct.stock,
      sku: shopeeProduct.item_sku,
      images: shopeeProduct.images,
      categoryId: shopeeProduct.category_id?.toString(),
      status: shopeeProduct.item_status === 'NORMAL' ? 'active' : 'inactive',
      createdAt: new Date(shopeeProduct.create_time * 1000),
      updatedAt: new Date(shopeeProduct.update_time * 1000),
      platformSpecific: shopeeProduct,
    };
  }

  private mapShopeeOrderToOrder(shopeeOrder: ShopeeOrder): Order {
    return {
      id: shopeeOrder.order_sn,
      orderNumber: shopeeOrder.order_sn,
      status: shopeeOrder.order_status,
      totalAmount: shopeeOrder.total_amount,
      currency: shopeeOrder.currency,
      items: shopeeOrder.item_list.map(item => ({
        productId: item.item_id.toString(),
        productName: item.item_name,
        quantity: item.model_quantity_purchased,
        price: item.model_original_price,
        sku: item.item_sku,
      })),
      customer: {
        id: shopeeOrder.buyer_user_id.toString(),
        name: shopeeOrder.buyer_username,
      },
      shippingAddress: {
        fullName: shopeeOrder.recipient_address.name,
        phone: shopeeOrder.recipient_address.phone,
        addressLine1: shopeeOrder.recipient_address.full_address,
        city: shopeeOrder.recipient_address.city,
        state: shopeeOrder.recipient_address.state,
        country: shopeeOrder.recipient_address.country,
        postalCode: shopeeOrder.recipient_address.zipcode,
      },
      createdAt: new Date(shopeeOrder.create_time * 1000),
      updatedAt: new Date(shopeeOrder.update_time * 1000),
      platformSpecific: shopeeOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get('/api/v2/product/get_item_list', {
        params: {
          offset: options?.offset || 0,
          page_size: options?.limit || 20,
          item_status: options?.status,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      const itemIds = response.data.response.item_list.map((item: any) => item.item_id);
      
      if (itemIds.length === 0) return [];

      const detailsResponse = await this.client.get('/api/v2/product/get_item_base_info', {
        params: {
          item_id_list: itemIds.join(','),
        },
      });

      if (detailsResponse.data.error) {
        throw new EcomConnectorError(
          detailsResponse.data.message,
          detailsResponse.data.error,
          400,
          detailsResponse.data
        );
      }

      return detailsResponse.data.response.item_list.map((p: ShopeeProduct) =>
        this.mapShopeeProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch products from Shopee',
        'FETCH_PRODUCTS_ERROR',
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get('/api/v2/product/get_item_base_info', {
        params: {
          item_id_list: id,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      const product = response.data.response.item_list[0];
      if (!product) {
        throw new EcomConnectorError(
          'Product not found',
          'PRODUCT_NOT_FOUND',
          404
        );
      }

      return this.mapShopeeProductToProduct(product);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Shopee`,
        'FETCH_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const response = await this.client.post('/api/v2/product/add_item', {
        item_name: productData.name,
        description: productData.description,
        price: productData.price,
        stock: productData.stock,
        item_sku: productData.sku,
        category_id: productData.categoryId ? parseInt(productData.categoryId) : undefined,
        image: {
          image_id_list: productData.images,
        },
        ...productData.platformSpecific,
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return this.getProductById(response.data.response.item_id.toString());
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to create product on Shopee',
        'CREATE_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async updateProduct(
    id: string,
    productData: Partial<ProductInput>
  ): Promise<Product> {
    try {
      const updateData: any = {
        item_id: parseInt(id),
      };

      if (productData.name) updateData.item_name = productData.name;
      if (productData.description) updateData.description = productData.description;
      if (productData.price !== undefined) updateData.price = productData.price;
      if (productData.stock !== undefined) updateData.stock = productData.stock;

      const response = await this.client.post('/api/v2/product/update_item', updateData);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Shopee`,
        'UPDATE_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const response = await this.client.get('/api/v2/order/get_order_list', {
        params: {
          page_size: options?.limit || 20,
          time_range_field: 'create_time',
          time_from: options?.startDate ? Math.floor(options.startDate.getTime() / 1000) : Math.floor(Date.now() / 1000) - 86400 * 30,
          time_to: options?.endDate ? Math.floor(options.endDate.getTime() / 1000) : Math.floor(Date.now() / 1000),
          order_status: options?.status,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      const orderSns = response.data.response.order_list.map((o: any) => o.order_sn);
      
      if (orderSns.length === 0) return [];

      const detailsResponse = await this.client.get('/api/v2/order/get_order_detail', {
        params: {
          order_sn_list: orderSns.join(','),
        },
      });

      if (detailsResponse.data.error) {
        throw new EcomConnectorError(
          detailsResponse.data.message,
          detailsResponse.data.error,
          400,
          detailsResponse.data
        );
      }

      return detailsResponse.data.response.order_list.map((o: ShopeeOrder) =>
        this.mapShopeeOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch orders from Shopee',
        'FETCH_ORDERS_ERROR',
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get('/api/v2/order/get_order_detail', {
        params: {
          order_sn_list: id,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      const order = response.data.response.order_list[0];
      if (!order) {
        throw new EcomConnectorError(
          'Order not found',
          'ORDER_NOT_FOUND',
          404
        );
      }

      return this.mapShopeeOrderToOrder(order);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Shopee`,
        'FETCH_ORDER_ERROR',
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    throw new EcomConnectorError(
      'Shopee does not support direct order status updates via API',
      'NOT_SUPPORTED',
      501
    );
  }
}
