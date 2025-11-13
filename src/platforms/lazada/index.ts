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
  LazadaCredentials,
} from '../../interfaces';
import { LazadaProduct, LazadaOrder } from './types';

export class LazadaPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: LazadaCredentials;
  private baseURL: string = 'https://api.lazada.com/rest';

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as LazadaCredentials;
    
    if (config.sandbox) {
      this.baseURL = 'https://api.lazada.sg/rest'; // Sandbox endpoint
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
        const timestamp = Date.now().toString();
        const apiPath = config.url?.replace(this.baseURL, '') || '';
        
        const signParams: any = {
          app_key: this.credentials.appKey,
          timestamp,
          sign_method: 'sha256',
        };

        if (this.credentials.accessToken) {
          signParams.access_token = this.credentials.accessToken;
        }

        // Add existing params
        if (config.params) {
          Object.assign(signParams, config.params);
        }

        const signature = this.generateSignature(apiPath, signParams);
        
        config.params = {
          ...signParams,
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
          error.response?.data?.code || 'LAZADA_ERROR',
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(apiPath: string, params: any): string {
    // Sort parameters
    const sortedKeys = Object.keys(params).sort();
    let concatenated = apiPath;
    
    sortedKeys.forEach(key => {
      concatenated += key + params[key];
    });

    const sign = crypto
      .createHmac('sha256', this.credentials.appSecret)
      .update(concatenated)
      .digest('hex')
      .toUpperCase();
    
    return sign;
  }

  private mapLazadaProductToProduct(lazadaProduct: LazadaProduct): Product {
    const attrs = lazadaProduct.attributes;
    const firstSku = lazadaProduct.skus[0];
    
    return {
      id: lazadaProduct.item_id.toString(),
      name: attrs.name,
      description: attrs.description,
      price: attrs.price || firstSku?.price || 0,
      currency: 'SGD',
      stock: attrs.quantity || firstSku?.quantity || 0,
      sku: attrs.SellerSku,
      images: attrs.Images?.Image || [],
      status: attrs.status === 'active' ? 'active' : 'inactive',
      createdAt: new Date(lazadaProduct.created_time),
      updatedAt: new Date(lazadaProduct.updated_time),
      platformSpecific: lazadaProduct,
    };
  }

  private mapLazadaOrderToOrder(lazadaOrder: LazadaOrder): Order {
    const billing = lazadaOrder.address_billing;
    
    return {
      id: lazadaOrder.order_id.toString(),
      orderNumber: lazadaOrder.order_number,
      status: lazadaOrder.statuses[0] || 'UNKNOWN',
      totalAmount: parseFloat(lazadaOrder.price),
      currency: 'SGD',
      items: lazadaOrder.items.map(item => ({
        productId: item.order_item_id.toString(),
        productName: item.name,
        quantity: 1, // Lazada doesn't provide quantity in basic response
        price: item.paid_price,
        sku: item.shop_sku,
      })),
      customer: {
        id: lazadaOrder.order_id.toString(),
        name: `${lazadaOrder.customer_first_name} ${lazadaOrder.customer_last_name}`,
      },
      shippingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`,
        phone: billing.phone,
        addressLine1: billing.address1,
        addressLine2: billing.address2,
        city: billing.city,
        country: billing.country,
        postalCode: billing.post_code,
        state: '',
      },
      createdAt: new Date(lazadaOrder.created_at),
      updatedAt: new Date(lazadaOrder.updated_at),
      platformSpecific: lazadaOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get('/products/get', {
        params: {
          filter: 'all',
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to fetch products',
          response.data.code,
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: LazadaProduct) =>
        this.mapLazadaProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch products from Lazada',
        'FETCH_PRODUCTS_ERROR',
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get('/product/item/get', {
        params: {
          item_id: id,
        },
      });

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to fetch product',
          response.data.code,
          400,
          response.data
        );
      }

      return this.mapLazadaProductToProduct(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Lazada`,
        'FETCH_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const payload = {
        Request: {
          Product: {
            PrimaryCategory: productData.categoryId || '0',
            Attributes: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              quantity: productData.stock,
              SellerSku: productData.sku,
              ...productData.platformSpecific,
            },
          },
        },
      };

      const response = await this.client.post('/product/create', payload);

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to create product',
          response.data.code,
          400,
          response.data
        );
      }

      return this.getProductById(response.data.data.item_id.toString());
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to create product on Lazada',
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
      const payload: any = {
        Request: {
          Product: {
            ItemId: parseInt(id),
            Attributes: {},
          },
        },
      };

      if (productData.name) payload.Request.Product.Attributes.name = productData.name;
      if (productData.description) payload.Request.Product.Attributes.description = productData.description;
      if (productData.price !== undefined) payload.Request.Product.Attributes.price = productData.price;
      if (productData.stock !== undefined) payload.Request.Product.Attributes.quantity = productData.stock;

      const response = await this.client.post('/product/update', payload);

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to update product',
          response.data.code,
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Lazada`,
        'UPDATE_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const createdAfter = options?.startDate 
        ? options.startDate.toISOString() 
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const createdBefore = options?.endDate
        ? options.endDate.toISOString()
        : new Date().toISOString();

      const response = await this.client.get('/orders/get', {
        params: {
          created_after: createdAfter,
          created_before: createdBefore,
          status: options?.status,
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to fetch orders',
          response.data.code,
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: LazadaOrder) =>
        this.mapLazadaOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch orders from Lazada',
        'FETCH_ORDERS_ERROR',
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get('/order/get', {
        params: {
          order_id: id,
        },
      });

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to fetch order',
          response.data.code,
          400,
          response.data
        );
      }

      return this.mapLazadaOrderToOrder(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Lazada`,
        'FETCH_ORDER_ERROR',
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await this.client.post('/order/status/update', {
        order_id: parseInt(id),
        status,
      });

      if (response.data.code !== '0') {
        throw new EcomConnectorError(
          response.data.message || 'Failed to update order status',
          response.data.code,
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on Lazada`,
        'UPDATE_ORDER_ERROR',
        500,
        error
      );
    }
  }
}
