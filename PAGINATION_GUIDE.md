# Hướng Dẫn Sử Dụng Phân Trang (Pagination Guide)

## Tổng Quan

Khi làm việc với các sàn thương mại điện tử có hơn 1000 sản phẩm hoặc đơn hàng, việc phân trang là rất quan trọng để:
- Tránh timeout khi lấy quá nhiều dữ liệu
- Tối ưu hiệu suất
- Tuân thủ giới hạn API của từng platform

Package `ecom-connector` cung cấp 4 phương thức mới để xử lý phân trang tự động.

## 📦 Phân Trang Sản Phẩm (Products)

### 1. `getProductsWithPagination(options)`

Lấy sản phẩm theo trang với thông tin phân trang đầy đủ.

#### Tham số:
```typescript
{
  offset?: number;      // Vị trí bắt đầu (mặc định: 0)
  limit?: number;       // Số lượng sản phẩm mỗi trang (mặc định: 20, tối đa: 100)
  status?: string;      // Trạng thái sản phẩm (NORMAL, BANNED, DELETED, UNLIST)
}
```

#### Kết quả trả về:
```typescript
{
  products: Product[];    // Danh sách sản phẩm
  totalCount: number;     // Tổng số sản phẩm
  hasNextPage: boolean;   // Còn trang tiếp theo không?
  nextOffset: number;     // Offset cho trang tiếp theo
}
```

#### Ví dụ:
```javascript
const connector = createEcomConnector({
  platform: 'shopee',
  credentials: { /* ... */ },
  sandbox: true,
});

// Lấy trang 1
const page1 = await connector.getProductsWithPagination({
  offset: 0,
  limit: 50,
  status: 'NORMAL'
});

console.log('Tổng sản phẩm:', page1.totalCount);
console.log('Sản phẩm trang 1:', page1.products.length);
console.log('Còn trang tiếp theo:', page1.hasNextPage);

// Lấy trang 2 (nếu có)
if (page1.hasNextPage) {
  const page2 = await connector.getProductsWithPagination({
    offset: page1.nextOffset,
    limit: 50,
  });
  
  console.log('Sản phẩm trang 2:', page2.products.length);
}
```

### 2. `getAllProducts(options, maxItems)`

Tự động lấy TẤT CẢ sản phẩm với phân trang tự động.

#### Tham số:
```typescript
options?: {
  status?: string;      // Lọc theo trạng thái
}
maxItems?: number;      // Giới hạn số lượng (mặc định: không giới hạn)
```

#### Giới hạn an toàn:
- **10,000 sản phẩm**: Dừng tự động để tránh quá tải
- Có thể tùy chỉnh bằng `maxItems`

#### Ví dụ:
```javascript
// Lấy TẤT CẢ sản phẩm NORMAL
const allProducts = await connector.getAllProducts({
  status: 'NORMAL'
});

console.log('Đã lấy', allProducts.length, 'sản phẩm');

// Lấy tối đa 500 sản phẩm
const limitedProducts = await connector.getAllProducts(
  { status: 'NORMAL' },
  500  // maxItems
);

console.log('Đã lấy', limitedProducts.length, 'sản phẩm (tối đa 500)');
```

## 📋 Phân Trang Đơn Hàng (Orders)

### 3. `getOrdersWithPagination(options)`

Lấy đơn hàng theo trang với thông tin phân trang đầy đủ.

#### Tham số:
```typescript
{
  limit?: number;         // Số lượng đơn mỗi trang (mặc định: 100, tối đa: 100)
  status?: string;        // Lọc theo trạng thái đơn hàng
  startDate?: Date;       // Ngày bắt đầu
  endDate?: Date;         // Ngày kết thúc
  cursor?: string;        // Cursor cho trang tiếp theo (tự động)
}
```

#### ⚠️ Lưu ý Shopee:
- Time range **TỐI ĐA 15 NGÀY**
- `startDate` phải trước `endDate`
- Sử dụng `cursor` để phân trang (không phải offset)

#### Kết quả trả về:
```typescript
{
  orders: Order[];        // Danh sách đơn hàng
  more: boolean;          // Còn đơn tiếp theo không?
  nextCursor?: string;    // Cursor cho trang tiếp theo
}
```

#### Ví dụ:
```javascript
// Lấy đơn hàng 7 ngày gần nhất
const page1 = await connector.getOrdersWithPagination({
  limit: 100,
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 ngày trước
  endDate: new Date(), // Hôm nay
  status: 'READY_TO_SHIP'
});

console.log('Đơn hàng trang 1:', page1.orders.length);
console.log('Còn trang tiếp theo:', page1.more);

// Lấy trang 2 (nếu có)
if (page1.more) {
  const page2 = await connector.getOrdersWithPagination({
    limit: 100,
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    cursor: page1.nextCursor  // Sử dụng cursor từ trang 1
  });
  
  console.log('Đơn hàng trang 2:', page2.orders.length);
}
```

### 4. `getAllOrders(options, maxItems)`

Tự động lấy TẤT CẢ đơn hàng với phân trang tự động.

#### Tham số:
```typescript
options?: {
  status?: string;      // Lọc theo trạng thái
  startDate?: Date;     // Ngày bắt đầu (TỐI ĐA 15 ngày)
  endDate?: Date;       // Ngày kết thúc
}
maxItems?: number;      // Giới hạn số lượng (mặc định: không giới hạn)
```

#### Giới hạn an toàn:
- **50,000 đơn hàng**: Dừng tự động để tránh quá tải
- Có thể tùy chỉnh bằng `maxItems`

#### Ví dụ:
```javascript
// Lấy TẤT CẢ đơn hàng 7 ngày gần nhất
const allOrders = await connector.getAllOrders({
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date(),
  status: 'READY_TO_SHIP'
});

console.log('Đã lấy', allOrders.length, 'đơn hàng');

// Lấy tối đa 1000 đơn
const limitedOrders = await connector.getAllOrders(
  {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  },
  1000  // maxItems
);

console.log('Đã lấy', limitedOrders.length, 'đơn hàng (tối đa 1000)');
```

## 🔄 Use Cases Thực Tế

### Case 1: Đồng Bộ Sản Phẩm Định Kỳ

```javascript
async function syncAllProducts() {
  const connector = createEcomConnector({ /* ... */ });
  
  console.log('Bắt đầu đồng bộ sản phẩm...');
  
  const products = await connector.getAllProducts({
    status: 'NORMAL'
  });
  
  console.log(`Đã lấy ${products.length} sản phẩm`);
  
  // Lưu vào database
  for (const product of products) {
    await saveToDatabase(product);
  }
  
  console.log('Hoàn thành đồng bộ!');
}

// Chạy mỗi 6 giờ
setInterval(syncAllProducts, 6 * 60 * 60 * 1000);
```

### Case 2: Đồng Bộ Đơn Hàng Theo Batch

```javascript
async function syncOrdersInBatches() {
  const connector = createEcomConnector({ /* ... */ });
  
  // Đồng bộ từng tuần (do giới hạn 15 ngày của Shopee)
  const weeks = [
    { start: new Date('2025-11-01'), end: new Date('2025-11-07') },
    { start: new Date('2025-11-08'), end: new Date('2025-11-14') },
    { start: new Date('2025-11-15'), end: new Date('2025-11-20') },
  ];
  
  let totalOrders = 0;
  
  for (const week of weeks) {
    console.log(`Đồng bộ từ ${week.start.toLocaleDateString()} đến ${week.end.toLocaleDateString()}`);
    
    const orders = await connector.getAllOrders({
      startDate: week.start,
      endDate: week.end,
    });
    
    console.log(`  - Đã lấy ${orders.length} đơn hàng`);
    totalOrders += orders.length;
    
    // Lưu vào database
    for (const order of orders) {
      await saveOrderToDatabase(order);
    }
  }
  
  console.log(`Tổng cộng: ${totalOrders} đơn hàng`);
}
```

### Case 3: Export Dữ Liệu với Progress Bar

```javascript
async function exportProducts() {
  const connector = createEcomConnector({ /* ... */ });
  
  let allProducts = [];
  let offset = 0;
  const pageSize = 50;
  
  // Lấy tổng số sản phẩm
  const firstPage = await connector.getProductsWithPagination({
    offset: 0,
    limit: pageSize
  });
  
  const totalCount = firstPage.totalCount;
  console.log(`Tổng số sản phẩm: ${totalCount}`);
  
  allProducts.push(...firstPage.products);
  offset = firstPage.nextOffset;
  
  // Lấy các trang còn lại
  while (firstPage.hasNextPage && allProducts.length < totalCount) {
    const page = await connector.getProductsWithPagination({
      offset,
      limit: pageSize
    });
    
    allProducts.push(...page.products);
    offset = page.nextOffset;
    
    // Hiển thị progress
    const progress = (allProducts.length / totalCount * 100).toFixed(2);
    console.log(`Đã lấy ${allProducts.length}/${totalCount} sản phẩm (${progress}%)`);
    
    if (!page.hasNextPage) break;
  }
  
  // Export to CSV/Excel
  await exportToCSV(allProducts);
  console.log('Hoàn thành export!');
}
```

## ⚡ Performance Tips

### 1. Sử dụng Batch Size Phù Hợp

```javascript
// ❌ Quá nhỏ - nhiều API calls
await connector.getProductsWithPagination({ limit: 10 });

// ✅ Tối ưu - cân bằng giữa tốc độ và memory
await connector.getProductsWithPagination({ limit: 50 });

// ⚠️ Quá lớn - có thể timeout
await connector.getProductsWithPagination({ limit: 100 });
```

### 2. Xử Lý Error và Retry

```javascript
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      console.error(`Lần thử ${i + 1} thất bại:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      
      // Đợi trước khi thử lại (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
}

// Sử dụng
const products = await fetchWithRetry(() => 
  connector.getAllProducts({ status: 'NORMAL' })
);
```

### 3. Rate Limiting

```javascript
async function fetchWithRateLimit(connector, options) {
  const RATE_LIMIT = 10; // 10 requests/second
  const DELAY = 1000 / RATE_LIMIT;
  
  let allProducts = [];
  let offset = 0;
  let hasMore = true;
  
  while (hasMore) {
    const page = await connector.getProductsWithPagination({
      ...options,
      offset,
    });
    
    allProducts.push(...page.products);
    hasMore = page.hasNextPage;
    offset = page.nextOffset;
    
    // Đợi để không vượt rate limit
    await new Promise(resolve => setTimeout(resolve, DELAY));
  }
  
  return allProducts;
}
```

## 📊 So Sánh Methods

| Method | Use Case | Tự động phân trang | Giới hạn | Performance |
|--------|----------|-------------------|----------|-------------|
| `getProducts()` | Lấy 1 trang đơn giản | ❌ | User định | ⚡⚡⚡ |
| `getProductsWithPagination()` | Phân trang thủ công | ❌ | User định | ⚡⚡⚡ |
| `getAllProducts()` | Đồng bộ toàn bộ | ✅ | 10,000 | ⚡⚡ |
| `getOrders()` | Lấy 1 trang đơn hàng | ❌ | User định | ⚡⚡⚡ |
| `getOrdersWithPagination()` | Phân trang thủ công | ❌ | User định | ⚡⚡⚡ |
| `getAllOrders()` | Đồng bộ toàn bộ đơn | ✅ | 50,000 | ⚡⚡ |

## 🚨 Lưu Ý Quan Trọng

### Shopee API Limits:
- **Products**: Max 100 items/request
- **Orders**: Max 100 orders/request
- **Time Range**: Tối đa 15 ngày cho orders
- **Rate Limit**: ~1000 requests/phút

### Best Practices:
1. ✅ Sử dụng `maxItems` để kiểm soát lượng dữ liệu
2. ✅ Implement retry logic cho network errors
3. ✅ Log progress cho long-running operations
4. ✅ Xử lý time range hợp lệ (≤15 ngày)
5. ✅ Cache kết quả khi có thể
6. ❌ Không gọi `getAllProducts()` quá thường xuyên
7. ❌ Không fetch quá 50,000 đơn hàng trong 1 lần

## 📖 Tài Liệu Tham Khảo

- [Shopee API Documentation](https://open.shopee.com/documents)
- [API Rate Limits](https://open.shopee.com/documents?module=63&type=2&id=54)
- [Product APIs](https://open.shopee.com/documents?module=89&type=1&id=696)
- [Order APIs](https://open.shopee.com/documents?module=4&type=1&id=397)

## 🆘 Troubleshooting

### Lỗi: "Start time must be earlier than end time and diff in 15days"
**Nguyên nhân**: Time range quá 15 ngày

**Giải pháp**:
```javascript
// ❌ Sai - 30 ngày
const orders = await connector.getAllOrders({
  startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});

// ✅ Đúng - 7 ngày
const orders = await connector.getAllOrders({
  startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  endDate: new Date()
});
```

### Lỗi: "Rate limit exceeded"
**Nguyên nhân**: Quá nhiều requests trong thời gian ngắn

**Giải pháp**: Thêm delay giữa các requests (xem phần Rate Limiting ở trên)

---

**Version**: 1.3.0  
**Last Updated**: November 20, 2025
