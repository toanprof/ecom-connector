# 🛒 Hướng dẫn lấy Shopee Access Token

## Vấn đề hiện tại
Lỗi **"Wrong sign"** xảy ra vì:
1. ✅ Partner ID đúng: `1194848`
2. ✅ Partner Key có (đang dùng để sign)
3. ✅ Shop ID đúng: `226159527`
4. ❌ **Access Token không hợp lệ**: `your_access_token_here` (placeholder)

Shopee API V2 **bắt buộc phải có access_token** hợp lệ cho shop-level operations (get products, orders).

---

## Cách lấy Shopee Access Token

### Bước 1: Authorization Flow

Shopee sử dụng OAuth 2.0 flow. Bạn cần:

1. **Tạo authorization link:**
```
https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner
?partner_id=1194848
&redirect=YOUR_REDIRECT_URL
```

2. **Shop owner click vào link** → Đăng nhập Shopee → Authorize
3. **Shopee redirect về** với `code` và `shop_id`
4. **Exchange code → access_token**

### Bước 2: Get Auth URL

Tôi sẽ tạo script để generate auth URL cho bạn:

```javascript
// shopee-auth.js
const partnerId = '1194848';
const redirectUrl = 'https://yourapp.com/callback'; // Thay bằng URL của bạn

const authUrl = `https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner?partner_id=${partnerId}&redirect=${encodeURIComponent(redirectUrl)}`;

console.log('Auth URL:');
console.log(authUrl);
console.log('\n1. Copy URL trên');
console.log('2. Paste vào browser');
console.log('3. Đăng nhập với Shopee shop account');
console.log('4. Authorize app');
console.log('5. Copy "code" và "shop_id" từ redirect URL');
```

Chạy:
```bash
node shopee-auth.js
```

### Bước 3: Exchange Code for Token

Sau khi có `code`, dùng API:

```bash
POST https://partner.test-stable.shopeemobile.com/api/v2/auth/token/get
```

Body:
```json
{
  "code": "YOUR_AUTH_CODE",
  "partner_id": 1194848,
  "shop_id": 226159527
}
```

Headers cần signature!

### Bước 4: Script tự động Get Token

```javascript
// shopee-get-token.js
const axios = require('axios');
const crypto = require('crypto');

const partnerId = '1194848';
const partnerKey = 'shpk5a575048596c507649416f4f757a764b787171726963495a614f5a716279';
const shopId = '226159527';
const authCode = 'CODE_FROM_STEP_2'; // Thay bằng code thật

const path = '/api/v2/auth/token/get';
const timestamp = Math.floor(Date.now() / 1000);
const baseString = `${partnerId}${path}${timestamp}`;
const sign = crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');

axios.post('https://partner.test-stable.shopeemobile.com/api/v2/auth/token/get', {
  code: authCode,
  shop_id: parseInt(shopId),
  partner_id: parseInt(partnerId)
}, {
  params: {
    partner_id: parseInt(partnerId),
    timestamp,
    sign
  }
}).then(response => {
  console.log('✅ Success!');
  console.log('Access Token:', response.data.access_token);
  console.log('Refresh Token:', response.data.refresh_token);
  console.log('Expires in:', response.data.expire_in, 'seconds');
  console.log('\nCopy access_token vào .env:');
  console.log(`SHOPEE_ACCESS_TOKEN=${response.data.access_token}`);
}).catch(error => {
  console.error('❌ Error:', error.response?.data || error.message);
});
```

---

## QUICK SOLUTION (Recommend)

Nếu đã có Shopee Partner account và đã authorize shop:

### Option 1: Dùng Postman hoặc curl

1. Get Auth Code:
```bash
# Mở trong browser:
https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner?partner_id=1194848&redirect=http://localhost:3000/callback
```

2. Sau khi authorize, copy `code` từ URL redirect

3. Get Token:
```bash
curl -X POST 'https://partner.test-stable.shopeemobile.com/api/v2/auth/token/get?partner_id=1194848&timestamp=CURRENT_TIMESTAMP&sign=YOUR_SIGNATURE' \
  -H 'Content-Type: application/json' \
  -d '{
    "code": "YOUR_CODE",
    "shop_id": 226159527,
    "partner_id": 1194848
  }'
```

### Option 2: Dùng Shopee Partner Portal

1. Login vào https://partner.test-stable.shopeemobile.com/
2. Vào **App Management** → Your App
3. Trong **Test Account** section, authorize shop
4. Copy **Test Access Token**

---

## LƯU Ý QUAN TRỌNG

### Sandbox vs Production

Bạn đang dùng **test-stable** (sandbox):
- URL: `https://partner.test-stable.shopeemobile.com`
- Cần **test shop** và **test credentials**
- Token khác với production

Nếu muốn dùng **production**:
- URL: `https://partner.shopeemobile.com`
- Set `sandbox: false` trong code
- Dùng production credentials

### Access Token Expiry

- Access token hết hạn sau **4 hours** (14,400 seconds)
- Cần **refresh token** để renew
- Nên implement auto-refresh trong production

---

## TÓM TẮT - NEXT STEPS

1. **Get Auth Code:**
   - Mở: `https://partner.test-stable.shopeemobile.com/api/v2/shop/auth_partner?partner_id=1194848&redirect=http://localhost:3000`
   - Login shop và authorize
   - Copy `code` từ redirect URL

2. **Get Access Token:**
   - Tôi sẽ tạo script để bạn chạy với `code` đó
   - Script sẽ tự động generate signature và call API
   - Output sẽ là `access_token`

3. **Update .env:**
   ```env
   SHOPEE_ACCESS_TOKEN=the_real_token_here
   ```

4. **Re-run demo:**
   ```bash
   npm run build
   node shopee-demo.js
   ```

---

Bạn muốn tôi:
1. ✅ Tạo script `shopee-get-token.js` để tự động lấy token (bạn chỉ cần paste code từ step 1)?
2. ✅ Hướng dẫn chi tiết từng bước với screenshots?
3. ✅ Kiểm tra xem có cách nào bypass để test nhanh không?

Cho tôi biết bạn chọn cách nào!
