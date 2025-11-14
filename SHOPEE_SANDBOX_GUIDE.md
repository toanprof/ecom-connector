# 🧪 Test với Shopee Sandbox - Hướng dẫn đầy đủ

## Shopee Sandbox là gì?

Shopee cung cấp **test environment (sandbox)** để developers test integration mà không ảnh hưởng dữ liệu thật:

- **Sandbox URL**: `https://partner.test-stable.shopeemobile.com`
- **Production URL**: `https://partner.shopeemobile.com`

---

## ✅ Cấu hình đang dùng Sandbox

Code của bạn **đã được cấu hình đúng** để dùng sandbox:

```javascript
// shopee-demo.js
const connector = createEcomConnector({
  platform: 'shopee',
  credentials: {
    partnerId: process.env.SHOPEE_PARTNER_ID,
    partnerKey: process.env.SHOPEE_PARTNER_KEY,
    shopId: process.env.SHOPEE_SHOP_ID,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN
  },
  sandbox: true,  // ✅ Đây là sandbox mode
  timeout: 30000
});
```

Khi `sandbox: true`, package sẽ tự động dùng URL:
```
https://partner.test-stable.shopeemobile.com
```

---

## 📋 Các bước test với Sandbox

### Bước 1: Đăng ký Shopee Partner (Test Environment)

1. Truy cập: **https://partner.test-stable.shopeemobile.com/**
2. Click **"Register"** và tạo tài khoản test
3. Verify email
4. Login vào Partner Portal

### Bước 2: Tạo Test App

1. Vào **"My Apps"** → **"Create New App"**
2. Điền thông tin:
   - **App Name**: "Ecom Connector Test"
   - **Callback URL**: `http://localhost:3000/callback`
   - **Description**: "Testing integration"
3. Submit và chờ approve (thường instant cho test app)
4. Sau khi approve, vào app details để lấy:
   - ✅ **Partner ID** (ví dụ: `1194848`)
   - ✅ **Partner Key** (ví dụ: `shpk5a575048...`)

### Bước 3: Tạo Test Shop

**Quan trọng**: Bạn cần **test shop account**, không dùng shop thật!

#### Option 1: Tạo test shop mới
1. Trong Partner Portal, vào **"Test Account"** section
2. Click **"Create Test Shop"**
3. Điền thông tin test shop
4. Lưu **Shop ID** (ví dụ: `226159527`)

#### Option 2: Authorize shop có sẵn
1. Nếu bạn đã có test shop account
2. Dùng authorization flow (xem bước 4)

### Bước 4: Authorize Test Shop với App

**Cách 1: Dùng script tự động (Khuyến nghị)**

```bash
# Generate auth URL
node shopee-auth-url.js
```

Output:
```
🔗 https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner?partner_id=1194848&redirect=http%3A%2F%2Flocalhost%3A3000%2Fcallback
```

**Các bước:**
1. Copy URL trên
2. Paste vào browser
3. **Login bằng test shop account** (không phải partner account!)
4. Click "Authorize"
5. Browser redirect về: `http://localhost:3000/callback?code=XXXXX&shop_id=226159527`
6. Copy phần `code=XXXXX`

**Cách 2: Dùng Shopee Partner Portal**

1. Vào app details
2. Tìm **"Authorized Shops"** section
3. Click **"Authorize"**
4. Chọn test shop
5. Copy **Test Access Token** (nếu có)

### Bước 5: Lấy Access Token

```bash
# Dùng code từ bước 4
node shopee-get-token.js YOUR_CODE_HERE
```

Output:
```
✅ SUCCESS!
========================================
Access Token: abc123xyz789...
Refresh Token: def456uvw012...
Expires in: 14400 seconds
Shop ID: 226159527
========================================
```

Copy access token vào `.env`:
```env
SHOPEE_ACCESS_TOKEN=abc123xyz789...
```

### Bước 6: Test Integration

```bash
# Rebuild (nếu có thay đổi code)
npm run build

# Run test
node shopee-demo.js
```

Expected output:
```
✅ Connector created
📦 [1] Fetching products...
✓ Found 5 products

#1 - 12345 - Test Product 1 - 99.99 SGD - active
#2 - 12346 - Test Product 2 - 149.99 SGD - active
...
```

---

## 🔍 Troubleshooting

### Lỗi: "Wrong sign"

**Nguyên nhân**: Access token không hợp lệ hoặc chưa có

**Giải pháp**:
1. Kiểm tra `.env` có `SHOPEE_ACCESS_TOKEN` đúng chưa
2. Token có thể đã hết hạn (4 giờ), lấy token mới
3. Đảm bảo dùng đúng Partner Key

```bash
# Lấy token mới
node shopee-auth-url.js
# Authorize lại
node shopee-get-token.js NEW_CODE
```

### Lỗi: "shop_id is invalid"

**Nguyên nhân**: Shop ID không phải số nguyên

**Giải pháp**:
```env
# ❌ Sai
SHOPEE_SHOP_ID=shpk5a575048...

# ✅ Đúng
SHOPEE_SHOP_ID=226159527
```

### Lỗi: "Invalid access_token"

**Nguyên nhân**: Token đã hết hạn (expire sau 4 giờ)

**Giải pháp**: Refresh token

```javascript
// TODO: Implement refresh token logic
// Shopee API: /api/v2/auth/access_token/get
```

### Không có sản phẩm/đơn hàng trong test

**Giải pháp**: Tạo test data

1. Login vào test shop (seller center sandbox)
2. Tạo test products
3. Tạo test orders

Hoặc dùng Shopee test data generator (nếu có)

---

## 📊 So sánh Sandbox vs Production

| Feature | Sandbox | Production |
|---------|---------|------------|
| **URL** | `partner.test-stable.shopeemobile.com` | `partner.shopeemobile.com` |
| **Data** | Test data, không ảnh hưởng thật | Dữ liệu thật, ảnh hưởng business |
| **Shop** | Test shop | Shop thật |
| **Access Token** | Test token | Production token |
| **Rate Limit** | Lỏng hơn | Strict (100 req/min) |
| **Credentials** | Test Partner ID/Key | Production Partner ID/Key |

---

## 🚀 Chuyển từ Sandbox sang Production

### Bước 1: Thay đổi code

```javascript
// Đổi từ sandbox: true → false
const connector = createEcomConnector({
  platform: 'shopee',
  credentials: {
    partnerId: process.env.SHOPEE_PARTNER_ID_PROD,
    partnerKey: process.env.SHOPEE_PARTNER_KEY_PROD,
    shopId: process.env.SHOPEE_SHOP_ID_PROD,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN_PROD
  },
  sandbox: false,  // ✅ Production mode
  timeout: 30000
});
```

### Bước 2: Setup Production Credentials

1. Đăng ký production app tại: **https://partner.shopeemobile.com/**
2. Lấy production Partner ID/Key
3. Authorize **shop thật**
4. Lấy production access token
5. Update `.env.production`:

```env
SHOPEE_PARTNER_ID_PROD=your_prod_partner_id
SHOPEE_PARTNER_KEY_PROD=your_prod_key
SHOPEE_SHOP_ID_PROD=your_real_shop_id
SHOPEE_ACCESS_TOKEN_PROD=your_prod_token
```

### Bước 3: Test cẩn thận

```bash
# Test với limit nhỏ trước
node shopee-demo.js
```

⚠️ **CẢNH BÁO**: Production operations ảnh hưởng dữ liệu thật!

---

## 💡 Tips & Best Practices

### 1. Environment Variables Management

Tạo 2 files `.env`:

```bash
# .env.test (sandbox)
SHOPEE_PARTNER_ID=1194848
SHOPEE_PARTNER_KEY=shpk5a575048...
SHOPEE_SHOP_ID=226159527
SHOPEE_ACCESS_TOKEN=test_token...

# .env.production
SHOPEE_PARTNER_ID_PROD=9876543
SHOPEE_PARTNER_KEY_PROD=prod_key...
SHOPEE_SHOP_ID_PROD=987654321
SHOPEE_ACCESS_TOKEN_PROD=prod_token...
```

Switch bằng:
```bash
# Test
cp .env.test .env

# Production
cp .env.production .env
```

### 2. Token Refresh

Access token hết hạn sau 4 giờ. Implement auto-refresh:

```javascript
// Pseudo-code
async function refreshToken(refreshToken) {
  const response = await axios.post(
    'https://partner.test-stable.shopeemobile.com/api/v2/auth/access_token/get',
    {
      refresh_token: refreshToken,
      partner_id: partnerId,
      shop_id: shopId
    },
    { params: { partner_id, timestamp, sign } }
  );
  return response.data.access_token;
}
```

### 3. Rate Limiting

Shopee có rate limit:
- **100 requests/minute** per shop
- Implement retry với exponential backoff

### 4. Error Handling

```javascript
try {
  const products = await connector.getProducts();
} catch (error) {
  if (error.statusCode === 429) {
    // Rate limit - wait and retry
    await sleep(60000);
    return retry();
  }
  if (error.code === 'INVALID_ACCESS_TOKEN') {
    // Refresh token
    await refreshAccessToken();
    return retry();
  }
  throw error;
}
```

---

## 🎯 Quick Reference

### Test với Sandbox (Full Flow)

```bash
# 1. Setup credentials trong .env
SHOPEE_PARTNER_ID=1194848
SHOPEE_PARTNER_KEY=shpk5a575048...
SHOPEE_SHOP_ID=226159527

# 2. Get auth URL
node shopee-auth-url.js

# 3. Open URL in browser, authorize, copy code

# 4. Get access token
node shopee-get-token.js YOUR_CODE

# 5. Add token to .env
SHOPEE_ACCESS_TOKEN=your_token_here

# 6. Build and test
npm run build
node shopee-demo.js
```

### URLs quan trọng

- **Sandbox Portal**: https://partner.test-stable.shopeemobile.com/
- **Production Portal**: https://partner.shopeemobile.com/
- **API Docs**: https://open.shopee.com/documents
- **Developer Forum**: https://developer.shopee.com/

---

**Bạn đã sẵn sàng test với sandbox!** 🚀

Nếu gặp lỗi, paste error message tôi sẽ giúp debug ngay!
