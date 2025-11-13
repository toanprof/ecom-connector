# ecom-connector

A unified abstraction layer for integrating with multiple e-commerce platforms including Zalo OA, TikTok Shop, Shopee, and Lazada.

## Features

- 🔌 **Plugin-based Architecture**: Easily switch between platforms by changing configuration
- 🔒 **Type-Safe**: Built with TypeScript for maximum type safety
- 🎯 **Unified Interface**: Common API across all platforms
- ⚡ **Easy Configuration**: Simple, environment-based configuration
- 🛡️ **Error Handling**: Consistent error handling across all platforms

## Installation

```bash
npm install ecom-connector
```

> **📖 Hướng dẫn chi tiết**: Xem [USER_GUIDE.md](./USER_GUIDE.md) để biết cách lấy API credentials và sử dụng package

## Quick Start

### 0. Prerequisites

Before using this package, you need to:

1. **Get API credentials** from the e-commerce platform(s) you want to connect:
   - **TikTok Shop**: Register at [partner.tiktokshop.com](https://partner.tiktokshop.com/) → Get App Key, App Secret, Shop ID
   - **Shopee**: Register at [open.shopee.com](https://open.shopee.com/) → Get Partner ID, Partner Key, Shop ID
   - **Lazada**: Register at [open.lazada.com](https://open.lazada.com/) → Get App Key, App Secret, Access Token
   - **Zalo OA**: Register at [developers.zalo.me](https://developers.zalo.me/) → Get App ID, Secret Key, Access Token

2. **Install dotenv** (recommended):
   ```bash
   npm install dotenv
   ```

### 1. Setup Environment Variables

Create a `.env` file in your project root:

```env
# Shopee Configuration
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_PARTNER_KEY=your_partner_key
SHOPEE_SHOP_ID=your_shop_id

# TikTok Shop Configuration
TIKTOK_APP_KEY=your_app_key
TIKTOK_APP_SECRET=your_app_secret
TIKTOK_SHOP_ID=your_shop_id

# Zalo OA Configuration
ZALO_APP_ID=your_app_id
ZALO_SECRET_KEY=your_secret_key
ZALO_ACCESS_TOKEN=your_access_token

# Lazada Configuration
LAZADA_APP_KEY=your_app_key
LAZADA_APP_SECRET=your_app_secret
LAZADA_ACCESS_TOKEN=your_access_token
```

### 2. Basic Usage

```typescript
import { createEcomConnector } from 'ecom-connector';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Connect to Shopee
  const shopeeConnector = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID!,
      partnerKey: process.env.SHOPEE_PARTNER_KEY!,
      shopId: process.env.SHOPEE_SHOP_ID!
    }
  });

  // Get products
  const products = await shopeeConnector.getProducts({ limit: 10 });
  console.log('Shopee Products:', products);

  // Get orders
  const orders = await shopeeConnector.getOrders({ status: 'READY_TO_SHIP' });
  console.log('Shopee Orders:', orders);

  // Switch to TikTok Shop
  const tiktokConnector = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {
      appKey: process.env.TIKTOK_APP_KEY!,
      appSecret: process.env.TIKTOK_APP_SECRET!,
      shopId: process.env.TIKTOK_SHOP_ID!
    }
  });

  // Same interface, different platform
  const tiktokProducts = await tiktokConnector.getProducts({ limit: 10 });
  console.log('TikTok Shop Products:', tiktokProducts);
}

main().catch(console.error);
```

## Platform Configuration

### Shopee

```typescript
const connector = createEcomConnector({
  platform: 'shopee',
  credentials: {
    partnerId: 'YOUR_PARTNER_ID',
    partnerKey: 'YOUR_PARTNER_KEY',
    shopId: 'YOUR_SHOP_ID'
  },
  sandbox: true // Optional: use sandbox environment
});
```

**How to get credentials:**
1. Register at [Shopee Open Platform](https://open.shopee.com/)
2. Create an app to get Partner ID and Partner Key
3. Authorize your shop to get Shop ID

### TikTok Shop

```typescript
const connector = createEcomConnector({
  platform: 'tiktok-shop',
  credentials: {
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET',
    shopId: 'YOUR_SHOP_ID'
  }
});
```

**How to get credentials:**
1. Register at [TikTok Shop Partner Center](https://partner.tiktokshop.com/)
2. Create an app to get App Key and App Secret
3. Authorize your shop to get Shop ID and Access Token

### Zalo OA

```typescript
const connector = createEcomConnector({
  platform: 'zalo-oa',
  credentials: {
    appId: 'YOUR_APP_ID',
    secretKey: 'YOUR_SECRET_KEY',
    accessToken: 'YOUR_ACCESS_TOKEN' // Optional
  }
});
```

**How to get credentials:**
1. Register at [Zalo for Developers](https://developers.zalo.me/)
2. Create an Official Account (OA)
3. Get App ID and Secret Key from OA settings

### Lazada

```typescript
const connector = createEcomConnector({
  platform: 'lazada',
  credentials: {
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET',
    accessToken: 'YOUR_ACCESS_TOKEN'
  }
});
```

**How to get credentials:**
1. Register at [Lazada Open Platform](https://open.lazada.com/)
2. Create an app to get App Key and App Secret
3. Complete authorization flow to get Access Token

## API Reference

All platforms implement the same `ECommercePlatform` interface:

### Products

#### `getProducts(options?: ProductQueryOptions): Promise<Product[]>`

Get a list of products.

```typescript
const products = await connector.getProducts({
  limit: 20,
  offset: 0,
  status: 'active'
});
```

**Options:**
- `limit?: number` - Maximum number of products to return
- `offset?: number` - Number of products to skip
- `page?: number` - Page number
- `status?: string` - Filter by status
- `categoryId?: string` - Filter by category
- `search?: string` - Search query

#### `getProductById(id: string): Promise<Product>`

Get a single product by ID.

```typescript
const product = await connector.getProductById('12345');
```

#### `createProduct(productData: ProductInput): Promise<Product>`

Create a new product.

```typescript
const newProduct = await connector.createProduct({
  name: 'New Product',
  description: 'Product description',
  price: 99.99,
  stock: 100,
  sku: 'SKU-001',
  images: ['https://example.com/image.jpg']
});
```

#### `updateProduct(id: string, productData: Partial<ProductInput>): Promise<Product>`

Update an existing product.

```typescript
const updatedProduct = await connector.updateProduct('12345', {
  price: 89.99,
  stock: 150
});
```

### Orders

#### `getOrders(options?: OrderQueryOptions): Promise<Order[]>`

Get a list of orders.

```typescript
const orders = await connector.getOrders({
  limit: 50,
  status: 'PENDING'
});
```

**Options:**
- `limit?: number` - Maximum number of orders to return
- `offset?: number` - Number of orders to skip
- `page?: number` - Page number
- `status?: string` - Filter by status
- `startDate?: Date` - Filter by start date
- `endDate?: Date` - Filter by end date

#### `getOrderById(id: string): Promise<Order>`

Get a single order by ID.

```typescript
const order = await connector.getOrderById('ORD-12345');
```

#### `updateOrderStatus(id: string, status: string): Promise<Order>`

Update order status.

```typescript
const order = await connector.updateOrderStatus('ORD-12345', 'SHIPPED');
```

## Data Models

### Product

```typescript
interface Product {
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
  platformSpecific?: any;
}
```

### Order

```typescript
interface Order {
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
```

## Error Handling

The package uses a custom `EcomConnectorError` class for all errors:

```typescript
try {
  const products = await connector.getProducts();
} catch (error) {
  if (error instanceof EcomConnectorError) {
    console.error('Error code:', error.code);
    console.error('Status code:', error.statusCode);
    console.error('Message:', error.message);
    console.error('Platform error:', error.platformError);
  }
}
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Run setup script to create directory structure
node setup.js

# Build the project
npm run build
```

### Project Structure

```
ecom-connector/
├── src/
│   ├── platforms/
│   │   ├── zalooa/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── tiktokshop/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   ├── shopee/
│   │   │   ├── index.ts
│   │   │   └── types.ts
│   │   └── lazada/
│   │       ├── index.ts
│   │       └── types.ts
│   ├── interfaces.ts
│   ├── factory.ts
│   └── index.ts
├── examples/
│   └── example.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

## Roadmap

- [ ] Add support for inventory management
- [ ] Add support for shipping providers
- [ ] Add webhook support
- [ ] Add rate limiting
- [ ] Add caching layer
- [ ] Add comprehensive test suite
- [ ] Add more e-commerce platforms (Tokopedia, Bukalapak, etc.)
