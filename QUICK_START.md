# ecom-connector - Quick Start cho người dùng NPM

## Cài đặt cực kỳ đơn giản

### Bước 1: Cài đặt package
```bash
npm install ecom-connector dotenv
```

### Bước 2: Lấy API credentials

Chọn nền tảng bạn muốn kết nối:

#### TikTok Shop
- Đăng ký: https://partner.tiktokshop.com/
- Cần: `App Key`, `App Secret`, `Shop ID`, `Access Token`
- Chi tiết: Xem file `TIKTOK_SHOP_SETUP.md`

#### Shopee
- Đăng ký: https://open.shopee.com/
- Cần: `Partner ID`, `Partner Key`, `Shop ID`

#### Lazada
- Đăng ký: https://open.lazada.com/
- Cần: `App Key`, `App Secret`, `Access Token`

#### Zalo OA
- Đăng ký: https://developers.zalo.me/
- Cần: `App ID`, `Secret Key`, `Access Token`

### Bước 3: Tạo file .env

```env
# TikTok Shop
TIKTOK_APP_KEY=your_app_key
TIKTOK_APP_SECRET=your_app_secret
TIKTOK_SHOP_ID=your_shop_id
TIKTOK_ACCESS_TOKEN=your_access_token
```

### Bước 4: Sử dụng

```javascript
require('dotenv').config();
const { createEcomConnector } = require('ecom-connector');

async function main() {
  // Tạo connector
  const connector = createEcomConnector({
    platform: 'tiktok-shop',
    credentials: {
      appKey: process.env.TIKTOK_APP_KEY,
      appSecret: process.env.TIKTOK_APP_SECRET,
      shopId: process.env.TIKTOK_SHOP_ID,
      accessToken: process.env.TIKTOK_ACCESS_TOKEN
    }
  });

  // Lấy sản phẩm
  const products = await connector.getProducts({ limit: 10 });
  console.log('Sản phẩm:', products);

  // Lấy đơn hàng
  const orders = await connector.getOrders({ limit: 10 });
  console.log('Đơn hàng:', orders);
}

main();
```

## Xong! 🎉

**4 platforms, 1 interface**

Chỉ cần thay đổi `platform: 'tiktok-shop'` thành:
- `'shopee'`
- `'lazada'`
- `'zalo-oa'`

Code khác giữ nguyên!

## Tài liệu đầy đủ

- 📖 **[USER_GUIDE.md](./USER_GUIDE.md)** - Hướng dẫn đầy đủ với ví dụ
- 📖 **[README.md](./README.md)** - API Reference chi tiết
- 📖 **[TIKTOK_SHOP_SETUP.md](./TIKTOK_SHOP_SETUP.md)** - Hướng dẫn setup TikTok Shop

## Các API method

Tất cả platforms đều hỗ trợ:

```javascript
// Sản phẩm
await connector.getProducts(options)
await connector.getProductById(id)
await connector.createProduct(data)
await connector.updateProduct(id, data)

// Đơn hàng
await connector.getOrders(options)
await connector.getOrderById(id)
await connector.updateOrderStatus(id, status) // Trừ Shopee
```

## Ví dụ nâng cao

### Đồng bộ nhiều sàn

```javascript
const tiktok = createEcomConnector({
  platform: 'tiktok-shop',
  credentials: {...}
});

const shopee = createEcomConnector({
  platform: 'shopee',
  credentials: {...}
});

// Lấy từ TikTok
const products = await tiktok.getProducts();

// Đồng bộ sang Shopee
for (const product of products) {
  await shopee.createProduct(product);
}
```

### TypeScript

```typescript
import { createEcomConnector, Product, Order } from 'ecom-connector';

const connector = createEcomConnector({...});
const products: Product[] = await connector.getProducts();
```

## Hỗ trợ

- GitHub Issues: [Report bug](https://github.com/your-repo/ecom-connector/issues)
- Email: support@example.com
- Documentation: [Full docs](./USER_GUIDE.md)
