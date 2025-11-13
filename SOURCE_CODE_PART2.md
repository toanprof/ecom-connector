# Lazada Platform Implementation and Example Files

## src/platforms/lazada/types.ts

```typescript
export interface LazadaProductResponse {
  code: string;
  data: {
    products: LazadaProduct[];
    total_products: number;
  };
}

export interface LazadaProduct {
  item_id: number;
  attributes: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    SellerSku: string;
    Images: {
      Image: string[];
    };
    status: string;
  };
  skus: LazadaSku[];
  created_time: string;
  updated_time: string;
}

export interface LazadaSku {
  SkuId: number;
  SellerSku: string;
  quantity: number;
  price: number;
  special_price: number;
  Status: string;
}

export interface LazadaOrderResponse {
  code: string;
  data: {
    orders: LazadaOrder[];
    count: number;
  };
}

export interface LazadaOrder {
  order_id: number;
  order_number: string;
  statuses: string[];
  price: string;
  items: LazadaOrderItem[];
  address_billing: {
    first_name: string;
    last_name: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    post_code: string;
    country: string;
  };
  customer_first_name: string;
  customer_last_name: string;
  created_at: string;
  updated_at: string;
}

export interface LazadaOrderItem {
  order_item_id: number;
  shop_sku: string;
  name: string;
  paid_price: number;
  sku: string;
  variation: string;
  purchase_order_id: string;
  purchase_order_number: string;
}
```

## src/platforms/lazada/index.ts

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
```

## examples/example.ts

```typescript
import { createEcomConnector } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function shopeeExample() {
  console.log('\n=== Shopee Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID!,
        partnerKey: process.env.SHOPEE_PARTNER_KEY!,
        shopId: process.env.SHOPEE_SHOP_ID!,
        accessToken: process.env.SHOPEE_ACCESS_TOKEN,
      },
      sandbox: true,
    });

    // Get products
    console.log('Fetching products...');
    const products = await connector.getProducts({ limit: 5 });
    console.log(`Found ${products.length} products`);
    console.log('First product:', JSON.stringify(products[0], null, 2));

    // Get orders
    console.log('\nFetching orders...');
    const orders = await connector.getOrders({ limit: 5 });
    console.log(`Found ${orders.length} orders`);
    if (orders.length > 0) {
      console.log('First order:', JSON.stringify(orders[0], null, 2));
    }
  } catch (error: any) {
    console.error('Shopee Error:', error.message);
  }
}

async function tiktokExample() {
  console.log('\n=== TikTok Shop Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey: process.env.TIKTOK_APP_KEY!,
        appSecret: process.env.TIKTOK_APP_SECRET!,
        shopId: process.env.TIKTOK_SHOP_ID!,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      },
    });

    // Get products
    console.log('Fetching products...');
    const products = await connector.getProducts({ limit: 5 });
    console.log(`Found ${products.length} products`);
    
    // Get specific product
    if (products.length > 0) {
      const productId = products[0].id;
      console.log(`\nFetching product ${productId}...`);
      const product = await connector.getProductById(productId);
      console.log('Product details:', JSON.stringify(product, null, 2));
    }
  } catch (error: any) {
    console.error('TikTok Shop Error:', error.message);
  }
}

async function zaloExample() {
  console.log('\n=== Zalo OA Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'zalo-oa',
      credentials: {
        appId: process.env.ZALO_APP_ID!,
        secretKey: process.env.ZALO_SECRET_KEY!,
        accessToken: process.env.ZALO_ACCESS_TOKEN,
      },
    });

    // Create a new product
    console.log('Creating a new product...');
    const newProduct = await connector.createProduct({
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      stock: 100,
      sku: 'TEST-SKU-001',
      images: ['https://example.com/image.jpg'],
    });
    console.log('Created product:', JSON.stringify(newProduct, null, 2));

    // Update the product
    console.log('\nUpdating product...');
    const updatedProduct = await connector.updateProduct(newProduct.id, {
      price: 89.99,
      stock: 150,
    });
    console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));
  } catch (error: any) {
    console.error('Zalo OA Error:', error.message);
  }
}

async function lazadaExample() {
  console.log('\n=== Lazada Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'lazada',
      credentials: {
        appKey: process.env.LAZADA_APP_KEY!,
        appSecret: process.env.LAZADA_APP_SECRET!,
        accessToken: process.env.LAZADA_ACCESS_TOKEN!,
      },
    });

    // Get orders
    console.log('Fetching orders...');
    const orders = await connector.getOrders({ 
      limit: 10,
      status: 'pending'
    });
    console.log(`Found ${orders.length} orders`);
    
    // Get specific order
    if (orders.length > 0) {
      const orderId = orders[0].id;
      console.log(`\nFetching order ${orderId}...`);
      const order = await connector.getOrderById(orderId);
      console.log('Order details:', JSON.stringify(order, null, 2));
    }
  } catch (error: any) {
    console.error('Lazada Error:', error.message);
  }
}

async function switchPlatformExample() {
  console.log('\n=== Platform Switching Example ===\n');
  
  // Easy switching between platforms with the same interface
  const platforms = [
    {
      name: 'Shopee',
      config: {
        platform: 'shopee' as const,
        credentials: {
          partnerId: process.env.SHOPEE_PARTNER_ID!,
          partnerKey: process.env.SHOPEE_PARTNER_KEY!,
          shopId: process.env.SHOPEE_SHOP_ID!,
        },
      },
    },
    {
      name: 'TikTok Shop',
      config: {
        platform: 'tiktok-shop' as const,
        credentials: {
          appKey: process.env.TIKTOK_APP_KEY!,
          appSecret: process.env.TIKTOK_APP_SECRET!,
          shopId: process.env.TIKTOK_SHOP_ID!,
        },
      },
    },
  ];

  for (const platform of platforms) {
    try {
      console.log(`\nConnecting to ${platform.name}...`);
      const connector = createEcomConnector(platform.config);
      
      const products = await connector.getProducts({ limit: 3 });
      console.log(`${platform.name}: Found ${products.length} products`);
    } catch (error: any) {
      console.error(`${platform.name} Error:`, error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('E-Commerce Connector Examples');
  console.log('='.repeat(60));

  // Run examples based on available environment variables
  if (process.env.SHOPEE_PARTNER_ID) {
    await shopeeExample();
  }

  if (process.env.TIKTOK_APP_KEY) {
    await tiktokExample();
  }

  if (process.env.ZALO_APP_ID) {
    await zaloExample();
  }

  if (process.env.LAZADA_APP_KEY) {
    await lazadaExample();
  }

  // Always run the switching example
  await switchPlatformExample();

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed!');
  console.log('='.repeat(60) + '\n');
}

// Run the examples
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

## .env.example

```env
# Shopee Configuration
SHOPEE_PARTNER_ID=your_partner_id_here
SHOPEE_PARTNER_KEY=your_partner_key_here
SHOPEE_SHOP_ID=your_shop_id_here
SHOPEE_ACCESS_TOKEN=your_access_token_here

# TikTok Shop Configuration
TIKTOK_APP_KEY=your_app_key_here
TIKTOK_APP_SECRET=your_app_secret_here
TIKTOK_SHOP_ID=your_shop_id_here
TIKTOK_ACCESS_TOKEN=your_access_token_here

# Zalo OA Configuration
ZALO_APP_ID=your_app_id_here
ZALO_SECRET_KEY=your_secret_key_here
ZALO_ACCESS_TOKEN=your_access_token_here

# Lazada Configuration
LAZADA_APP_KEY=your_app_key_here
LAZADA_APP_SECRET=your_app_secret_here
LAZADA_ACCESS_TOKEN=your_access_token_here
```

## Setup Instructions

1. Run `setup-dirs.bat` to create the directory structure
2. Copy each code section to its respective file location
3. Run `npm install` to install dependencies
4. Copy `.env.example` to `.env` and fill in your credentials
5. Run `npm run build` to compile TypeScript
6. Run the example: `node dist/examples/example.js`
