# Hướng dẫn cấu hình TikTok Shop API

## Bước 1: Đăng ký tài khoản TikTok Shop Partner

1. Truy cập: https://partner.tiktokshop.com/
2. Đăng ký tài khoản Partner (nếu chưa có)
3. Đăng nhập vào Partner Center

## Bước 2: Tạo ứng dụng (App)

1. Vào **Developer** → **My Apps** → **Create App**
2. Điền thông tin ứng dụng:
   - App Name: Tên ứng dụng của bạn
   - App Type: Chọn "Authorized App"
   - Description: Mô tả ngắn gọn
3. Nhấn **Submit** để tạo app

## Bước 3: Lấy App Key và App Secret

Sau khi tạo app thành công, bạn sẽ thấy:
- **App Key** (hoặc Client Key)
- **App Secret** (hoặc Client Secret)

⚠️ **Quan trọng**: Lưu App Secret ở nơi an toàn, không chia sẻ công khai!

## Bước 4: Cấu hình Permissions (Quyền truy cập)

1. Trong app của bạn, vào phần **Permissions**
2. Request các quyền cần thiết:
   - ✅ `product.list` - Xem danh sách sản phẩm
   - ✅ `product.detail` - Xem chi tiết sản phẩm
   - ✅ `order.list` - Xem danh sách đơn hàng
   - ✅ `order.detail` - Xem chi tiết đơn hàng

## Bước 5: Authorize (Ủy quyền) Shop

1. Vào **Test Shops** hoặc **Authorization**
2. Authorize shop của bạn với app
3. Sau khi authorize, bạn sẽ nhận được:
   - **Shop ID**
   - **Access Token** (hoặc Authorization Code để lấy Access Token)

## Bước 6: Lấy Access Token (nếu cần)

Nếu bạn có Authorization Code, gọi API để lấy Access Token:

```bash
POST https://auth.tiktok-shops.com/api/v2/token/get
```

Body:
```json
{
  "app_key": "YOUR_APP_KEY",
  "app_secret": "YOUR_APP_SECRET",
  "auth_code": "YOUR_AUTH_CODE",
  "grant_type": "authorized_code"
}
```

Response sẽ chứa `access_token`.

## Bước 7: Cấu hình trong file .env

Mở file `.env` trong dự án và điền thông tin:

```env
# TikTok Shop Configuration
TIKTOK_APP_KEY=your_app_key_here
TIKTOK_APP_SECRET=your_app_secret_here
TIKTOK_SHOP_ID=your_shop_id_here
TIKTOK_ACCESS_TOKEN=your_access_token_here
```

**Ví dụ thực tế**:
```env
TIKTOK_APP_KEY=6789abcdef123456
TIKTOK_APP_SECRET=a1b2c3d4e5f6g7h8i9j0
TIKTOK_SHOP_ID=7234567890
TIKTOK_ACCESS_TOKEN=act.xyz123abc456def789...
```

## Bước 8: Chạy demo

```bash
node tiktok-demo.js
```

## Lưu ý quan trọng

### 1. Môi trường Sandbox vs Production
- **Sandbox**: Dùng để test, không ảnh hưởng dữ liệu thật
- **Production**: Dữ liệu thật, cần cẩn thận

### 2. Access Token có thời hạn
- Access Token thường hết hạn sau vài giờ hoặc vài ngày
- Cần implement refresh token để gia hạn tự động
- Hoặc re-authorize khi token hết hạn

### 3. Rate Limiting
TikTok Shop có giới hạn số request:
- **Product API**: ~100 requests/phút
- **Order API**: ~100 requests/phút
- Nếu vượt giới hạn, sẽ bị rate limit error (429)

### 4. Webhook (Khuyến nghị)
Thay vì polling (gọi API liên tục), nên dùng webhook để nhận:
- Đơn hàng mới
- Cập nhật đơn hàng
- Cập nhật sản phẩm

## Troubleshooting (Xử lý lỗi thường gặp)

### Lỗi: "Invalid app_key"
- ✅ Kiểm tra lại App Key có đúng không
- ✅ Đảm bảo không có khoảng trắng thừa

### Lỗi: "Invalid signature"
- ✅ Kiểm tra App Secret có đúng không
- ✅ Đảm bảo timestamp đồng bộ (không lệch quá 5 phút)

### Lỗi: "Access token expired"
- ✅ Lấy Access Token mới
- ✅ Implement refresh token flow

### Lỗi: "Permission denied"
- ✅ Kiểm tra xem app có đủ quyền không
- ✅ Re-authorize shop với app

### Lỗi: "Shop not found"
- ✅ Kiểm tra Shop ID có đúng không
- ✅ Đảm bảo shop đã authorize app

## Tài liệu tham khảo

- TikTok Shop API Documentation: https://partner.tiktokshop.com/docv2
- Partner Center: https://partner.tiktokshop.com/
- Developer Portal: https://developers.tiktok-shops.com/

## Liên hệ hỗ trợ

Nếu gặp vấn đề, có thể:
1. Mở ticket trong Partner Center
2. Tham gia TikTok Shop Developer Community
3. Email: developer-support@tiktokshop.com
