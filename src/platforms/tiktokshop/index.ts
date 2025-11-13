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
  TikTokShopCredentials,
} from '../../interfaces';
import { TikTokShopProduct, TikTokShopOrder } from './types';

export class TikTokShopPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: TikTokShopCredentials;
  private baseURL: string = 'https://open-api.tiktokglobalshop.com';

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as TikTokShopCredentials;
    
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
        const signature = this.generateSignature(config.url || '', timestamp);
        
        config.headers['x-tts-access-token'] = this.credentials.accessToken || '';
        config.params = {
          ...config.params,
          app_key: this.credentials.appKey,
          timestamp,
          sign: signature,
        };
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw new EcomConnectorError(
          error.response?.data?.message || error.message,
          error.response?.data?.code?.toString() || 'TIKTOK_ERROR',
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(path: string, timestamp: number): string {
    const sign = crypto
      .createHmac('sha256', this.credentials.appSecret)
      .update(`${this.credentials.appKey}${path}${timestamp}`)
      .digest('hex');
    return sign;
  }

  private mapTikTokProductToProduct(tiktokProduct: TikTokShopProduct): Product {
    const firstSku = tiktokProduct.skus[0];
    return {
      id: tiktokProduct.id,
      name: tiktokProduct.title,
      description: tiktokProduct.description,
      price: parseFloat(tiktokProduct.price.amount),
      currency: tiktokProduct.price.currency,
      stock: firstSku?.quantity || 0,
      sku: firstSku?.seller_sku,
      images: tiktokProduct.images.map(img => img.url),
      status: tiktokProduct.status === 'ACTIVE' ? 'active' : 'inactive',
      createdAt: new Date(tiktokProduct.create_time * 1000),
      updatedAt: new Date(tiktokProduct.update_time * 1000),
      platformSpecific: tiktokProduct,
    };
  }

  private mapTikTokOrderToOrder(tiktokOrder: TikTokShopOrder): Order {
    return {
      id: tiktokOrder.id,
      orderNumber: tiktokOrder.id,
      status: tiktokOrder.order_status,
      totalAmount: parseFloat(tiktokOrder.payment_info.total_amount),
      currency: tiktokOrder.payment_info.currency,
      items: tiktokOrder.line_items.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.sale_price),
        sku: item.sku_id,
      })),
      customer: {
        id: tiktokOrder.buyer_info.id,
        name: tiktokOrder.buyer_info.name,
        email: tiktokOrder.buyer_info.email,
      },
      shippingAddress: {
        fullName: tiktokOrder.recipient_address.name,
        phone: tiktokOrder.recipient_address.phone,
        addressLine1: tiktokOrder.recipient_address.address_line1,
        addressLine2: tiktokOrder.recipient_address.address_line2,
        city: tiktokOrder.recipient_address.city,
        state: tiktokOrder.recipient_address.state,
        country: tiktokOrder.recipient_address.region_code,
        postalCode: tiktokOrder.recipient_address.postal_code,
      },
      createdAt: new Date(tiktokOrder.create_time * 1000),
      updatedAt: new Date(tiktokOrder.update_time * 1000),
      platformSpecific: tiktokOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get('/api/products/search', {
        params: {
          page_number: options?.page || 1,
          page_size: options?.limit || 20,
        },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: TikTokShopProduct) =>
        this.mapTikTokProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch products from TikTok Shop',
        'FETCH_PRODUCTS_ERROR',
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get(`/api/products/details`, {
        params: { product_id: id },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return this.mapTikTokProductToProduct(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from TikTok Shop`,
        'FETCH_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const response = await this.client.post('/api/products', {
        title: productData.name,
        description: productData.description,
        category_id: productData.categoryId,
        price: productData.price.toString(),
        images: productData.images?.map(url => ({ url })),
        skus: [
          {
            seller_sku: productData.sku,
            quantity: productData.stock,
          },
        ],
        ...productData.platformSpecific,
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return this.getProductById(response.data.data.product_id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to create product on TikTok Shop',
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
        product_id: id,
      };

      if (productData.name) updateData.title = productData.name;
      if (productData.description) updateData.description = productData.description;
      if (productData.price) updateData.price = productData.price.toString();
      
      const response = await this.client.put('/api/products', updateData);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on TikTok Shop`,
        'UPDATE_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const response = await this.client.get('/api/orders/search', {
        params: {
          page_number: options?.page || 1,
          page_size: options?.limit || 20,
          order_status: options?.status,
        },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: TikTokShopOrder) =>
        this.mapTikTokOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch orders from TikTok Shop',
        'FETCH_ORDERS_ERROR',
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get('/api/orders/detail', {
        params: { order_id: id },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return this.mapTikTokOrderToOrder(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from TikTok Shop`,
        'FETCH_ORDER_ERROR',
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await this.client.post('/api/orders/status', {
        order_id: id,
        status,
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'TIKTOK_API_ERROR',
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on TikTok Shop`,
        'UPDATE_ORDER_ERROR',
        500,
        error
      );
    }
  }
}
