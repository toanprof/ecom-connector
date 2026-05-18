# Shopee AI Guide - ecom-connector (Function Reference)

Huong dan nay tap trung vao toan bo ham chuc nang khi lam viec voi Shopee trong ecom-connector. Dung noi dung nay lam "AI guide" de tra loi nhanh, dung va day du.

Nguon implement: [src/platforms/shopee/index.ts](src/platforms/shopee/index.ts)
Common types: [src/interfaces.ts](src/interfaces.ts)

## 1) Cach khoi tao

```ts
import { createEcomConnector, ShopeePlatform } from "ecom-connector";

const shopee = createEcomConnector({
  platform: "shopee",
  credentials: {
    partnerId: process.env.SHOPEE_PARTNER_ID!,
    partnerKey: process.env.SHOPEE_PARTNER_KEY!,
    shopId: process.env.SHOPEE_SHOP_ID!,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN, // optional, nhung can cho nhieu API
  },
  sandbox: true, // optional
  timeout: 30000, // optional
}) as ShopeePlatform;
```

Ghi chu:
- `createEcomConnector()` tra ve `ECommercePlatform`. De dung ham Shopee mo rong, ep kieu sang `ShopeePlatform`.
- Response tu Shopee duoc tu dong doi sang camelCase; request params/body duoc tu dong doi sang snake_case.

## 2) Kieu du lieu chinh

```ts
// ProductQueryOptions
{
  limit?: number;
  offset?: number;
  page?: number; // Shopee khong dung
  status?: string | string[]; // item_status
  categoryId?: string; // Shopee khong dung o getProducts
  search?: string; // Shopee khong dung o getProducts
}

// OrderQueryOptions
{
  limit?: number;
  offset?: number; // Shopee khong dung
  page?: number; // Shopee khong dung
  status?: string; // order_status
  startDate?: Date; // default: now - 15 days
  endDate?: Date; // default: now
  // cursor?: string (Shopee only, dung cho getOrdersWithPagination)
}
```

## 3) Danh sach ham - ECommercePlatform (Shopee)

### 3.1 getProducts(options?)
Lay danh sach san pham. Shopee thuc te dung `offset`, `limit`, `status`.
- Params: `ProductQueryOptions`
- Returns: `Promise<Product[]>`
- Example:

```ts
const products = await shopee.getProducts({ limit: 20, offset: 0, status: "NORMAL" });
```

### 3.2 getProductsWithPagination(options?)
Lay san pham kem thong tin pagination.
- Params: `ProductQueryOptions`
- Returns:
  ```ts
  Promise<{ products: Product[]; totalCount: number; hasNextPage: boolean; nextOffset: number; }>
  ```
- Example:

```ts
const page1 = await shopee.getProductsWithPagination({ limit: 50, offset: 0 });
```

### 3.3 getAllProducts(options?, maxItems?)
Tu dong phan trang toan bo san pham (Shopee ho tro day du).
- Params:
  - `options?: { status?: string | string[] }`
  - `maxItems?: number`
- Returns: `Promise<Product[]>`
- Example:

```ts
const all = await shopee.getAllProducts({ status: ["NORMAL", "UNLIST"] }, 500);
```

### 3.4 getProductById(id)
Lay chi tiet san pham theo id.
- Params: `id: string`
- Returns: `Promise<Product>`
- Example:

```ts
const product = await shopee.getProductById("12345");
```

### 3.5 createProduct(productData)
Tao san pham moi.
- Params: `productData: ProductInput`
- Returns: `Promise<Product>`
- Example:

```ts
const created = await shopee.createProduct({
  name: "Sample",
  description: "Demo",
  price: 100000,
  stock: 10,
  sku: "SKU-001",
  images: ["image_id_1"],
  categoryId: "123",
});
```

### 3.6 updateProduct(id, productData)
Cap nhat san pham. (Hien dang goi endpoint add_item; ghi chu trong code)
- Params:
  - `id: string`
  - `productData: Partial<ProductInput>`
- Returns: `Promise<Product>`
- Example:

```ts
const updated = await shopee.updateProduct("12345", { price: 99000, stock: 15 });
```

### 3.7 getOrders(options?)
Lay danh sach don hang theo khoang thoi gian.
- Params: `OrderQueryOptions`
- Returns: `Promise<Order[]>`
- Example:

```ts
const orders = await shopee.getOrders({ status: "READY_TO_SHIP", limit: 50 });
```

### 3.8 getOrdersWithPagination(options?)
Lay don hang kem thong tin pagination (cursor).
- Params: `OrderQueryOptions` (co the truyen them `cursor`)
- Returns:
  ```ts
  Promise<{ orders: Order[]; more: boolean; nextCursor?: string; }>
  ```
- Example:

```ts
const page1 = await shopee.getOrdersWithPagination({ limit: 100 });
const page2 = await shopee.getOrdersWithPagination({ limit: 100, cursor: page1.nextCursor } as any);
```

### 3.9 getAllOrders(options?, maxItems?)
Tu dong phan trang lay toan bo don hang.
- Params:
  - `options?: OrderQueryOptions`
  - `maxItems?: number`
- Returns: `Promise<Order[]>`
- Example:

```ts
const allOrders = await shopee.getAllOrders({ status: "COMPLETED" }, 1000);
```

### 3.10 getOrderById(id)
Lay chi tiet don hang theo order_sn.
- Params: `id: string`
- Returns: `Promise<Order>`
- Example:

```ts
const order = await shopee.getOrderById("230101ABCDEF");
```

### 3.11 updateOrderStatus(id, status)
Shopee khong ho tro cap nhat trang thai don hang qua API.
- Throws: `EcomConnectorError` with code `NOT_SUPPORTED`
- Example:

```ts
await shopee.updateOrderStatus("230101ABCDEF", "SHIPPED"); // throws NOT_SUPPORTED
```

## 4) Danh sach ham - Shopee Auth

### 4.1 generateAuthUrl(redirectUrl)
Tao URL de authorize shop.
- Params: `redirectUrl: string`
- Returns: `string`
- Example:

```ts
const url = shopee.generateAuthUrl("http://localhost:3000/callback");
```

### 4.2 getAccessToken(code, shopId?, mainAccountId?)
Doi authorization code lay access token.
- Params:
  - `code: string`
  - `shopId?: string` (shop-level)
  - `mainAccountId?: string` (account-level)
- Luu y: chi dung 1 trong 2, khong duoc dung ca hai.
- Returns:
  ```ts
  Promise<{ accessToken: string; refreshToken: string; expireIn: number; shopId?: number; mainAccountId?: number; partnerId: number; }>
  ```
- Example:

```ts
const token = await shopee.getAccessToken(code, shopId);
```

### 4.3 refreshAccessToken(refreshToken, shopId?, mainAccountId?)
Refresh access token khi het han.
- Params:
  - `refreshToken: string`
  - `shopId?: string`
  - `mainAccountId?: string`
- Returns: same shape as `getAccessToken()`
- Example:

```ts
const newToken = await shopee.refreshAccessToken(refreshToken, shopId);
```

## 5) Danh sach ham - Shopee Catalog va Product Utilities

### 5.1 getCategories(language?)
Lay danh sach category.
- Params: `language?: string` (default: "en")
- Returns: `Promise<any>`
- Example:

```ts
const categories = await shopee.getCategories("en");
```

### 5.2 getCategoryAttributes(categoryId, language?)
Lay attribute theo category.
- Params:
  - `categoryId: number`
  - `language?: string` (default: "en")
- Returns: `Promise<any>`
- Example:

```ts
const attrs = await shopee.getCategoryAttributes(123, "en");
```

### 5.3 getBrandList(categoryId, status?, pageSize?, offset?)
Lay danh sach brand theo category.
- Params:
  - `categoryId: number`
  - `status?: number` (default: 1)
  - `pageSize?: number` (default: 100, max 100)
  - `offset?: number` (default: 0)
- Returns: `Promise<any>`
- Example:

```ts
const brands = await shopee.getBrandList(123, 1, 100, 0);
```

## 6) Danh sach ham - Shopee Inventory va Pricing

### 6.1 updateStock(itemId, stockList)
Cap nhat ton kho.
- Params:
  - `itemId: number`
  - `stockList: Array<{ modelId: number; sellerStock: Array<{ stock: number }> }>`
- Returns: `Promise<any>`
- Example:

```ts
await shopee.updateStock(123, [
  { modelId: 0, sellerStock: [{ stock: 20 }] },
]);
```

### 6.2 updatePrice(itemId, priceList)
Cap nhat gia.
- Params:
  - `itemId: number`
  - `priceList: Array<{ modelId: number; originalPrice: number }>`
- Returns: `Promise<any>`
- Example:

```ts
await shopee.updatePrice(123, [
  { modelId: 0, originalPrice: 99000 },
]);
```

### 6.3 unlistItem(itemList)
Unlist/List item.
- Params:
  - `itemList: Array<{ itemId: number; unlist: boolean }>`
- Returns: `Promise<any>`
- Example:

```ts
await shopee.unlistItem([{ itemId: 123, unlist: true }]);
```

### 6.4 deleteProduct(itemId)
Xoa san pham.
- Params: `itemId: number`
- Returns: `Promise<any>`
- Example:

```ts
await shopee.deleteProduct(123);
```

## 7) Danh sach ham - Shopee Logistics

### 7.1 getLogisticsChannelList()
Lay danh sach logistics channel.
- Params: none
- Returns: `Promise<any>`
- Example:

```ts
const channels = await shopee.getLogisticsChannelList();
```

### 7.2 getShippingParameter(orderSn)
Lay thong so ship theo order.
- Params: `orderSn: string`
- Returns: `Promise<any>`
- Example:

```ts
const params = await shopee.getShippingParameter("230101ABCDEF");
```

### 7.3 shipOrder(orderSn, pickup)
Ship don hang.
- Params:
  - `orderSn: string`
  - `pickup: { addressId: number; pickupTimeId: string }`
- Returns: `Promise<any>`
- Example:

```ts
await shopee.shipOrder("230101ABCDEF", { addressId: 1001, pickupTimeId: "12345" });
```

## 8) Luu y quan trong (Shopee)

- `getOrders()` va `getOrdersWithPagination()` tu dong lay order_detail de map du lieu day du.
- `getOrders()` default time range: 15 ngay gan nhat neu khong truyen `startDate` / `endDate`.
- `getAllProducts()` gioi han an toan 10,000 items; `getAllOrders()` gioi han an toan 50,000 orders.
- `generateAuthUrl()` / `getAccessToken()` / `refreshAccessToken()` yeu cau dung dung 1 trong `shopId` hoac `mainAccountId`.

## 9) Danh sach status tham khao (Shopee)

Tham khao cac enum co san trong [src/platforms/shopee/constants.ts](src/platforms/shopee/constants.ts):
- `ShopeeOrderStatus`
- `ShopeeProductStatus`
- `ShopeeLogisticsStatus`
- `ShopeeReturnStatus`
- `ShopeeReturnSolution`
- `ShopeeShippingDocumentType`
- `ShopeeShippingDocumentStatus`
