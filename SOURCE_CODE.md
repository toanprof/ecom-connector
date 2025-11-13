# ecom-connector - Complete Source Code

This document contains all the source code files for the ecom-connector package. 
To set up the project, run `setup-dirs.bat` first to create the directory structure, then copy each file to its respective location.

## File Structure

```
src/
├── interfaces.ts
├── factory.ts
├── index.ts
└── platforms/
    ├── zalooa/
    │   ├── index.ts
    │   └── types.ts
    ├── tiktokshop/
    │   ├── index.ts
    │   └── types.ts
    ├── shopee/
    │   ├── index.ts
    │   └── types.ts
    └── lazada/
        ├── index.ts
        └── types.ts
examples/
└── example.ts
```

## src/interfaces.ts

```typescript
// Common data interfaces
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  sku?: string;
  images?: string[];
  categoryId?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt?: Date;
  updatedAt?: Date;
  platformSpecific?: any; // Platform-specific data
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  sku?: string;
  images?: string[];
  categoryId?: string;
  status?: 'active' | 'inactive';
  platformSpecific?: any;
}

export interface ProductQueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  categoryId?: string;
  search?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  customer: Customer;
  shippingAddress?: Address;
  createdAt: Date;
  updatedAt?: Date;
  platformSpecific?: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface OrderQueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  platformSpecific?: any;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

// Configuration interfaces
export type PlatformType = 'zalo-oa' | 'tiktok-shop' | 'shopee' | 'lazada';

export interface ZaloOACredentials {
  appId: string;
  secretKey: string;
  accessToken?: string;
}

export interface TikTokShopCredentials {
  appKey: string;
  appSecret: string;
  shopId: string;
  accessToken?: string;
}

export interface ShopeeCredentials {
  partnerId: string;
  partnerKey: string;
  shopId: string;
  accessToken?: string;
}

export interface LazadaCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
}

export type PlatformCredentials = 
  | ZaloOACredentials 
  | TikTokShopCredentials 
  | ShopeeCredentials 
  | LazadaCredentials;

export interface EcomConnectorConfig {
  platform: PlatformType;
  credentials: PlatformCredentials;
  sandbox?: boolean;
  timeout?: number;
}

// Main platform interface
export interface ECommercePlatform {
  /**
   * Get a list of products
   */
  getProducts(options?: ProductQueryOptions): Promise<Product[]>;

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Promise<Product>;

  /**
   * Create a new product
   */
  createProduct(productData: ProductInput): Promise<Product>;

  /**
   * Update an existing product
   */
  updateProduct(id: string, productData: Partial<ProductInput>): Promise<Product>;

  /**
   * Get a list of orders
   */
  getOrders(options?: OrderQueryOptions): Promise<Order[]>;

  /**
   * Get a single order by ID
   */
  getOrderById(id: string): Promise<Order>;

  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: string): Promise<Order>;
}

// Custom error class
export class EcomConnectorError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public platformError?: any
  ) {
    super(message);
    this.name = 'EcomConnectorError';
    Object.setPrototypeOf(this, EcomConnectorError.prototype);
  }
}
```

## src/factory.ts

```typescript
import { ECommercePlatform, EcomConnectorConfig, EcomConnectorError } from './interfaces';
import { ZaloOAPlatform } from './platforms/zalooa';
import { TikTokShopPlatform } from './platforms/tiktokshop';
import { ShopeePlatform } from './platforms/shopee';
import { LazadaPlatform } from './platforms/lazada';

/**
 * Factory function to create an e-commerce platform connector
 * @param config Configuration object containing platform type and credentials
 * @returns An instance of the appropriate platform connector
 */
export function createEcomConnector(config: EcomConnectorConfig): ECommercePlatform {
  if (!config.platform) {
    throw new EcomConnectorError(
      'Platform type is required',
      'MISSING_PLATFORM',
      400
    );
  }

  if (!config.credentials) {
    throw new EcomConnectorError(
      'Credentials are required',
      'MISSING_CREDENTIALS',
      400
    );
  }

  switch (config.platform) {
    case 'zalo-oa':
      return new ZaloOAPlatform(config);
    
    case 'tiktok-shop':
      return new TikTokShopPlatform(config);
    
    case 'shopee':
      return new ShopeePlatform(config);
    
    case 'lazada':
      return new LazadaPlatform(config);
    
    default:
      throw new EcomConnectorError(
        `Unsupported platform: ${config.platform}`,
        'UNSUPPORTED_PLATFORM',
        400
      );
  }
}
```

## src/index.ts

```typescript
// Main entry point
export { createEcomConnector } from './factory';

// Export types and interfaces
export * from './interfaces';

// Export platform implementations (optional, for advanced usage)
export { ZaloOAPlatform } from './platforms/zalooa';
export { TikTokShopPlatform } from './platforms/tiktokshop';
export { ShopeePlatform } from './platforms/shopee';
export { LazadaPlatform } from './platforms/lazada';
```

## src/platforms/zalooa/types.ts

```typescript
export interface ZaloOAProductResponse {
  error: number;
  message: string;
  data: {
    products: ZaloOAProduct[];
    total: number;
  };
}

export interface ZaloOAProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: number;
  created_time: number;
  updated_time: number;
}

export interface ZaloOAOrderResponse {
  error: number;
  message: string;
  data: {
    orders: ZaloOAOrder[];
    total: number;
  };
}

export interface ZaloOAOrder {
  id: string;
  order_code: string;
  status: number;
  total_amount: number;
  items: ZaloOAOrderItem[];
  customer: {
    user_id: string;
    name: string;
    phone: string;
  };
  created_time: number;
}

export interface ZaloOAOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}
```

## src/platforms/zalooa/index.ts

```typescript
import axios, { AxiosInstance } from 'axios';
import {
  ECommercePlatform,
  Product,
  ProductInput,
  ProductQueryOptions,
  Order,
  OrderQueryOptions,
  EcomConnectorConfig,
  EcomConnectorError,
  ZaloOACredentials,
} from '../../interfaces';
import { ZaloOAProduct, ZaloOAOrder } from './types';

export class ZaloOAPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: ZaloOACredentials;
  private baseURL: string = 'https://openapi.zalo.me/v2.0';

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as ZaloOACredentials;
    
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
        if (this.credentials.accessToken) {
          config.headers['access_token'] = this.credentials.accessToken;
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
          error.response?.data?.error?.toString() || 'ZALO_ERROR',
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private mapZaloOAProductToProduct(zaloProduct: ZaloOAProduct): Product {
    return {
      id: zaloProduct.id,
      name: zaloProduct.name,
      description: zaloProduct.description,
      price: zaloProduct.price,
      currency: 'VND',
      stock: 0, // Zalo OA doesn't provide stock info in basic response
      images: zaloProduct.images,
      status: zaloProduct.status === 1 ? 'active' : 'inactive',
      createdAt: new Date(zaloProduct.created_time * 1000),
      updatedAt: new Date(zaloProduct.updated_time * 1000),
      platformSpecific: zaloProduct,
    };
  }

  private mapZaloOAOrderToOrder(zaloOrder: ZaloOAOrder): Order {
    return {
      id: zaloOrder.id,
      orderNumber: zaloOrder.order_code,
      status: this.mapZaloOrderStatus(zaloOrder.status),
      totalAmount: zaloOrder.total_amount,
      currency: 'VND',
      items: zaloOrder.items.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: {
        id: zaloOrder.customer.user_id,
        name: zaloOrder.customer.name,
        phone: zaloOrder.customer.phone,
      },
      createdAt: new Date(zaloOrder.created_time * 1000),
      platformSpecific: zaloOrder,
    };
  }

  private mapZaloOrderStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: 'PENDING',
      1: 'CONFIRMED',
      2: 'SHIPPING',
      3: 'COMPLETED',
      4: 'CANCELLED',
    };
    return statusMap[status] || 'UNKNOWN';
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get('/oa/product/list', {
        params: {
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: ZaloOAProduct) =>
        this.mapZaloOAProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch products from Zalo OA',
        'FETCH_PRODUCTS_ERROR',
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get(`/oa/product/detail`, {
        params: { product_id: id },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return this.mapZaloOAProductToProduct(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Zalo OA`,
        'FETCH_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const response = await this.client.post('/oa/product/create', {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        ...productData.platformSpecific,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return this.getProductById(response.data.data.product_id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to create product on Zalo OA',
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
      const response = await this.client.post('/oa/product/update', {
        product_id: id,
        ...productData,
        ...productData.platformSpecific,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Zalo OA`,
        'UPDATE_PRODUCT_ERROR',
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const response = await this.client.get('/oa/order/list', {
        params: {
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: ZaloOAOrder) =>
        this.mapZaloOAOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        'Failed to fetch orders from Zalo OA',
        'FETCH_ORDERS_ERROR',
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get('/oa/order/detail', {
        params: { order_id: id },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return this.mapZaloOAOrderToOrder(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Zalo OA`,
        'FETCH_ORDER_ERROR',
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const statusCode = this.reverseMapOrderStatus(status);
      const response = await this.client.post('/oa/order/update', {
        order_id: id,
        status: statusCode,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          'ZALO_API_ERROR',
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on Zalo OA`,
        'UPDATE_ORDER_ERROR',
        500,
        error
      );
    }
  }

  private reverseMapOrderStatus(status: string): number {
    const statusMap: { [key: string]: number } = {
      PENDING: 0,
      CONFIRMED: 1,
      SHIPPING: 2,
      COMPLETED: 3,
      CANCELLED: 4,
    };
    return statusMap[status] || 0;
  }
}
```

## src/platforms/tiktokshop/types.ts

```typescript
export interface TikTokShopProductResponse {
  code: number;
  message: string;
  data: {
    products: TikTokShopProduct[];
    total: number;
  };
}

export interface TikTokShopProduct {
  id: string;
  title: string;
  description: string;
  price: {
    amount: string;
    currency: string;
  };
  skus: Array<{
    id: string;
    seller_sku: string;
    quantity: number;
  }>;
  images: Array<{
    url: string;
  }>;
  status: string;
  create_time: number;
  update_time: number;
}

export interface TikTokShopOrderResponse {
  code: number;
  message: string;
  data: {
    orders: TikTokShopOrder[];
    total: number;
  };
}

export interface TikTokShopOrder {
  id: string;
  order_status: string;
  payment_info: {
    total_amount: string;
    currency: string;
  };
  line_items: TikTokShopOrderItem[];
  recipient_address: {
    name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    region_code: string;
  };
  buyer_info: {
    id: string;
    name: string;
    email: string;
  };
  create_time: number;
  update_time: number;
}

export interface TikTokShopOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  sale_price: string;
  sku_id: string;
}
```

## src/platforms/tiktokshop/index.ts

```typescript
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
```

## src/platforms/shopee/types.ts

```typescript
export interface ShopeeProductResponse {
  error: string;
  message: string;
  response: {
    item_list: ShopeeProduct[];
    total_count: number;
  };
}

export interface ShopeeProduct {
  item_id: number;
  item_name: string;
  description: string;
  price: number;
  stock: number;
  item_sku: string;
  images: string[];
  category_id: number;
  item_status: string;
  create_time: number;
  update_time: number;
}

export interface ShopeeOrderResponse {
  error: string;
  message: string;
  response: {
    order_list: ShopeeOrder[];
    more: boolean;
  };
}

export interface ShopeeOrder {
  order_sn: string;
  order_status: string;
  total_amount: number;
  currency: string;
  item_list: ShopeeOrderItem[];
  buyer_user_id: number;
  buyer_username: string;
  recipient_address: {
    name: string;
    phone: string;
    full_address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  create_time: number;
  update_time: number;
}

export interface ShopeeOrderItem {
  item_id: number;
  item_name: string;
  model_quantity_purchased: number;
  model_original_price: number;
  item_sku: string;
}
```

## src/platforms/shopee/index.ts

```typescript
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
```

Due to character limits, I'll continue with the remaining files in the next section...

Would you like me to continue with the Lazada platform implementation and example files?
