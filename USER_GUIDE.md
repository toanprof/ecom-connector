# Hướng dẫn sử dụng ecom-connector (Dành cho người dùng)

## Cài đặt

```bash
npm install ecom-connector
```

Hoặc với yarn:
```bash
yarn add ecom-connector
```

## Chuẩn bị trước khi sử dụng

### 1. Cài đặt thêm dependencies cần thiết

```bash
npm install dotenv
```

### 2. Lấy thông tin API từ các nền tảng

Bạn cần đăng ký và lấy thông tin API từ nền tảng bạn muốn kết nối:

#### 🛒 **TikTok Shop**
1. Truy cập: https://partner.tiktokshop.com/
2. Tạo app trong Developer Portal
3. Lấy: `App Key`, `App Secret`, `Shop ID`, `Access Token`
4. Chi tiết: Xem file `TIKTOK_SHOP_SETUP.md`

#### 🟠 **Shopee**
1. Truy cập: https://open.shopee.com/
2. Đăng ký tài khoản Partner
3. Tạo app và authorize shop
4. Lấy: `Partner ID`, `Partner Key`, `Shop ID`

#### 💙 **Lazada**
1. Truy cập: https://open.lazada.com/
2. Tạo app trong Developer Center
3. Complete authorization flow
4. Lấy: `App Key`, `App Secret`, `Access Token`

#### 💬 **Zalo OA**
1. Truy cập: https://developers.zalo.me/
2. Tạo Official Account (OA)
3. Lấy thông tin từ OA settings
4. Lấy: `App ID`, `Secret Key`, `Access Token`

### 3. Tạo file cấu hình `.env`

Tạo file `.env` trong thư mục gốc của project:

```env
# TikTok Shop
TIKTOK_APP_KEY=your_app_key
TIKTOK_APP_SECRET=your_app_secret
TIKTOK_SHOP_ID=your_shop_id
TIKTOK_ACCESS_TOKEN=your_access_token

# Shopee
SHOPEE_PARTNER_ID=your_partner_id
SHOPEE_PARTNER_KEY=your_partner_key
SHOPEE_SHOP_ID=your_shop_id

# Lazada
LAZADA_APP_KEY=your_app_key
LAZADA_APP_SECRET=your_app_secret
LAZADA_ACCESS_TOKEN=your_access_token

# Zalo OA
ZALO_APP_ID=your_app_id
ZALO_SECRET_KEY=your_secret_key
ZALO_ACCESS_TOKEN=your_access_token
```

## Sử dụng cơ bản

### Ví dụ 1: Kết nối TikTok Shop

```javascript
// Với JavaScript/CommonJS
require('dotenv').config();
const { createEcomConnector } = require('ecom-connector');

async function main() {
  // Tạo connector
  const tiktok = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {
      appKey: process.env.TIKTOK_APP_KEY,
      appSecret: process.env.TIKTOK_APP_SECRET,
      shopId: process.env.TIKTOK_SHOP_ID,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    }
  });

  // Lấy danh sách sản phẩm
  const products = await tiktok.getProducts({ limit: 10 });
  console.log('Sản phẩm:', products);

  // Lấy danh sách đơn hàng
  const orders = await tiktok.getOrders({ limit: 10 });
  console.log('Đơn hàng:', orders);
}

main();
```

### Ví dụ 2: Kết nối Shopee

```javascript
require('dotenv').config();
const { createEcomConnector } = require('ecom-connector');

async function main() {
  const shopee = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: process.env.SHOPEE_SHOP_ID
    },
    sandbox: false // true = test environment, false = production
  });

  // Lấy sản phẩm
  const products = await shopee.getProducts({ limit: 20 });
  
  // Lấy chi tiết 1 sản phẩm
  const product = await shopee.getProductById('123456');
  
  // Lấy đơn hàng theo trạng thái
  const orders = await shopee.getOrders({ 
    status: 'READY_TO_SHIP',
    limit: 50 
  });
}

main();
```

### Ví dụ 3: Sử dụng với TypeScript

```typescript
import dotenv from 'dotenv';
import { createEcomConnector, Product, Order } from 'ecom-connector';

dotenv.config();

async function main() {
  const connector = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {
      appKey: process.env.TIKTOK_APP_KEY!,
      appSecret: process.env.TIKTOK_APP_SECRET!,
      shopId: process.env.TIKTOK_SHOP_ID!,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    }
  });

  // TypeScript sẽ tự động gợi ý kiểu dữ liệu
  const products: Product[] = await connector.getProducts({ limit: 10 });
  const orders: Order[] = await connector.getOrders({ limit: 10 });
}

main();
```

### Ví dụ 4: Chuyển đổi giữa các nền tảng

```javascript
require('dotenv').config();
const { createEcomConnector } = require('ecom-connector');

async function syncProducts() {
  // Kết nối nhiều nền tảng
  const tiktok = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {
      appKey: process.env.TIKTOK_APP_KEY,
      appSecret: process.env.TIKTOK_APP_SECRET,
      shopId: process.env.TIKTOK_SHOP_ID,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    }
  });

  const shopee = createEcomConnector({
    platform: 'shopee',
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: process.env.SHOPEE_SHOP_ID
    }
  });

  // Lấy sản phẩm từ TikTok
  const tiktokProducts = await tiktok.getProducts();
  console.log(`TikTok: ${tiktokProducts.length} sản phẩm`);

  // Lấy sản phẩm từ Shopee
  const shopeeProducts = await shopee.getProducts();
  console.log(`Shopee: ${shopeeProducts.length} sản phẩm`);

  // Dữ liệu có cấu trúc giống nhau, dễ dàng xử lý chung
  const allProducts = [...tiktokProducts, ...shopeeProducts];
  console.log(`Tổng cộng: ${allProducts.length} sản phẩm`);
}

syncProducts();
```

## API Reference

### Khởi tạo Connector

```javascript
const connector = createEcomConnector(config);
```

**Config object:**
```typescript
{
  platform: 'tiktok-shop' | 'shopee' | 'lazada' | 'zalo-oa',
  credentials: {
    // Credentials tùy theo platform
  },
  sandbox?: boolean,      // Mặc định: false (production)
  timeout?: number        // Mặc định: 30000ms (30 giây)
}
```

### Methods (Tất cả platforms)

#### 1. `getProducts(options?)`
Lấy danh sách sản phẩm

```javascript
const products = await connector.getProducts({
  limit: 20,           // Số lượng sản phẩm (mặc định: 20)
  offset: 0,           // Offset cho pagination (Shopee, Lazada)
  page: 1,             // Page số cho pagination (TikTok)
  status: 'active',    // Lọc theo trạng thái
  categoryId: '123',   // Lọc theo danh mục
  search: 'keyword'    // Tìm kiếm theo từ khóa
});
```

**Response:** Array of `Product` objects

#### 2. `getProductById(id)`
Lấy chi tiết 1 sản phẩm

```javascript
const product = await connector.getProductById('12345');
```

**Response:** `Product` object

#### 3. `createProduct(productData)`
Tạo sản phẩm mới

```javascript
const newProduct = await connector.createProduct({
  name: 'Sản phẩm mới',
  description: 'Mô tả sản phẩm',
  price: 99000,
  stock: 100,
  sku: 'SKU-001',
  images: ['https://example.com/image.jpg'],
  categoryId: '123'
});
```

**Response:** `Product` object

#### 4. `updateProduct(id, productData)`
Cập nhật sản phẩm

```javascript
const updated = await connector.updateProduct('12345', {
  price: 89000,
  stock: 150
});
```

**Response:** `Product` object

#### 5. `getOrders(options?)`
Lấy danh sách đơn hàng

```javascript
const orders = await connector.getOrders({
  limit: 50,
  offset: 0,
  page: 1,
  status: 'PENDING',
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31')
});
```

**Response:** Array of `Order` objects

#### 6. `getOrderById(id)`
Lấy chi tiết đơn hàng

```javascript
const order = await connector.getOrderById('ORD-12345');
```

**Response:** `Order` object

#### 7. `updateOrderStatus(id, status)`
Cập nhật trạng thái đơn hàng

```javascript
const updated = await connector.updateOrderStatus('ORD-12345', 'SHIPPED');
```

**Response:** `Order` object

⚠️ **Lưu ý:** Shopee không hỗ trợ API này, sẽ throw error `NOT_SUPPORTED`

## Data Models

### Product
```typescript
{
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
  platformSpecific?: any; // Dữ liệu gốc từ platform
}
```

### Order
```typescript
{
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
  platformSpecific?: any; // Dữ liệu gốc từ platform
}
```

## Error Handling

```javascript
const { createEcomConnector, EcomConnectorError } = require('ecom-connector');

async function main() {
  try {
    const connector = createEcomConnector({...});
    const products = await connector.getProducts();
  } catch (error) {
    if (error instanceof EcomConnectorError) {
      console.error('Mã lỗi:', error.code);
      console.error('HTTP Status:', error.statusCode);
      console.error('Message:', error.message);
      console.error('Platform Error:', error.platformError);
    } else {
      console.error('Lỗi không xác định:', error);
    }
  }
}
```

### Các mã lỗi thường gặp

| Mã lỗi | Ý nghĩa | Giải pháp |
|--------|---------|-----------|
| `MISSING_PLATFORM` | Thiếu thông tin platform | Kiểm tra config |
| `MISSING_CREDENTIALS` | Thiếu thông tin đăng nhập | Kiểm tra credentials |
| `UNSUPPORTED_PLATFORM` | Platform không được hỗ trợ | Chỉ dùng: tiktok-shop, shopee, lazada, zalo-oa |
| `FETCH_PRODUCTS_ERROR` | Lỗi khi lấy sản phẩm | Kiểm tra credentials và quyền API |
| `FETCH_ORDERS_ERROR` | Lỗi khi lấy đơn hàng | Kiểm tra credentials và quyền API |
| `NOT_SUPPORTED` | Chức năng không được platform hỗ trợ | Không thể dùng method này với platform hiện tại |

## Best Practices

### 1. Bảo mật thông tin
```javascript
// ✅ Đúng - Dùng biến môi trường
require('dotenv').config();
const connector = createEcomConnector({
  platform: 'tiktok-shop',
  credentials: {
    appKey: process.env.TIKTOK_APP_KEY,
    // ...
  }
});

// ❌ Sai - Hard-code credentials
const connector = createEcomConnector({
  platform: 'tiktok-shop',
  credentials: {
    appKey: 'abc123xyz', // KHÔNG BAO GIỜ làm thế này!
    // ...
  }
});
```

### 2. Xử lý lỗi đầy đủ
```javascript
async function getProducts() {
  try {
    const products = await connector.getProducts();
    return products;
  } catch (error) {
    // Log lỗi
    console.error('Error:', error.message);
    
    // Xử lý riêng từng loại lỗi
    if (error.statusCode === 401) {
      console.error('Token hết hạn, cần refresh');
    } else if (error.statusCode === 429) {
      console.error('Rate limit, cần đợi một chút');
    }
    
    // Re-throw hoặc return giá trị mặc định
    return [];
  }
}
```

### 3. Pagination khi lấy dữ liệu lớn
```javascript
async function getAllProducts() {
  const allProducts = [];
  let page = 1;
  const limit = 100;
  
  while (true) {
    const products = await connector.getProducts({ page, limit });
    
    if (products.length === 0) break;
    
    allProducts.push(...products);
    
    if (products.length < limit) break; // Hết data
    
    page++;
  }
  
  return allProducts;
}
```

### 4. Retry logic cho API calls
```javascript
async function getProductsWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await connector.getProducts();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Đợi trước khi retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Ví dụ thực tế

### Đồng bộ tồn kho giữa các sàn
```javascript
const { createEcomConnector } = require('ecom-connector');

async function syncInventory() {
  const tiktok = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {...}
  });
  
  const shopee = createEcomConnector({
    platform: 'shopee',
    credentials: {...}
  });

  // Lấy sản phẩm từ TikTok
  const tiktokProducts = await tiktok.getProducts();
  
  // Với mỗi sản phẩm, cập nhật tồn kho trên Shopee
  for (const product of tiktokProducts) {
    // Tìm sản phẩm tương ứng trên Shopee (dựa vào SKU)
    const shopeeProducts = await shopee.getProducts({ search: product.sku });
    
    if (shopeeProducts.length > 0) {
      const shopeeProduct = shopeeProducts[0];
      
      // Cập nhật tồn kho
      await shopee.updateProduct(shopeeProduct.id, {
        stock: product.stock
      });
      
      console.log(`Đã sync ${product.name}: ${product.stock} items`);
    }
  }
}
```

## Hỗ trợ

- 📖 Documentation: https://github.com/your-repo/ecom-connector
- 🐛 Issues: https://github.com/your-repo/ecom-connector/issues
- 📧 Email: support@example.com

## License

MIT
