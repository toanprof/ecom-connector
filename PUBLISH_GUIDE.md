# 📦 Checklist Publish lên NPM

## ✅ Trước khi publish

### 1. Cập nhật thông tin cá nhân
- [ ] Mở `package.json` và sửa:
  - `"author": "Your Name <your.email@example.com>"` → Tên và email của bạn
  - `"repository": "https://github.com/yourusername/ecom-connector.git"` → Link GitHub của bạn
  - `"bugs": "https://github.com/yourusername/ecom-connector/issues"` → Link issues
  - `"homepage": "https://github.com/yourusername/ecom-connector#readme"` → Link homepage

- [ ] Mở `LICENSE` và sửa:
  - `Copyright (c) 2025 [Your Name]` → Tên của bạn

### 2. Kiểm tra tên package
```bash
# Kiểm tra xem tên đã được dùng chưa
npm search ecom-connector
```

Nếu tên đã tồn tại, đổi tên trong `package.json`:
- `@yourscope/ecom-connector` (scoped package)
- `ecom-connector-pro`
- `multi-ecom-connector`

### 3. Build và kiểm tra
```bash
# Build project
npm run build

# Kiểm tra dist/ folder
ls dist/

# Test local
npm link
cd ../test-project
npm link ecom-connector
```

### 4. Tạo Git repository (nếu chưa có)
```bash
git init
git add .
git commit -m "Initial commit - v1.0.0"
git remote add origin https://github.com/yourusername/ecom-connector.git
git push -u origin main
```

### 5. Tạo tài khoản NPM (nếu chưa có)
- Đăng ký tại: https://www.npmjs.com/signup
- Xác thực email

### 6. Đăng nhập NPM
```bash
npm login
# Nhập: username, password, email, OTP (nếu có 2FA)
```

## 🚀 Publish lên NPM

### Lần đầu publish
```bash
# Kiểm tra những file sẽ được publish
npm pack --dry-run

# Publish lên NPM (public)
npm publish --access public

# Hoặc với scoped package
npm publish --access public
```

### Sau khi publish thành công
```bash
# Kiểm tra package
npm view ecom-connector

# Tạo git tag
git tag v1.0.0
git push origin v1.0.0
```

## 🔄 Publish phiên bản mới

### 1. Cập nhật code
```bash
# Sửa code...
npm run build
```

### 2. Tăng version
```bash
# Patch (1.0.0 → 1.0.1) - Bug fixes
npm version patch

# Minor (1.0.0 → 1.1.0) - New features
npm version minor

# Major (1.0.0 → 2.0.0) - Breaking changes
npm version major
```

### 3. Publish
```bash
git push origin main --tags
npm publish
```

## 📝 Sau khi publish

### 1. Kiểm tra package đã public
- Truy cập: https://www.npmjs.com/package/ecom-connector
- Kiểm tra README hiển thị đúng
- Kiểm tra version

### 2. Test install từ NPM
```bash
mkdir test-install
cd test-install
npm init -y
npm install ecom-connector
node -e "console.log(require('ecom-connector'))"
```

### 3. Cập nhật documentation
- [ ] Thêm NPM badge vào README.md:
```markdown
[![npm version](https://badge.fury.io/js/ecom-connector.svg)](https://www.npmjs.com/package/ecom-connector)
[![downloads](https://img.shields.io/npm/dm/ecom-connector.svg)](https://www.npmjs.com/package/ecom-connector)
```

### 4. Thông báo
- [ ] Đăng trên GitHub Releases
- [ ] Chia sẻ trên social media
- [ ] Thông báo cho cộng đồng developers

## 🛠️ Troubleshooting

### Lỗi: "You do not have permission to publish"
```bash
# Đảm bảo đã login
npm whoami

# Login lại
npm logout
npm login
```

### Lỗi: "Package name already exists"
- Đổi tên package trong `package.json`
- Hoặc dùng scoped package: `@yourname/ecom-connector`

### Lỗi: "402 Payment Required"
- Package name bị reserved
- Đổi tên khác

### Lỗi: "Need to provide authToken"
```bash
npm login
# Hoặc
npm adduser
```

## 📊 Monitoring

### Xem thống kê
```bash
# Downloads
npm info ecom-connector

# Chi tiết
npm view ecom-connector
```

### NPM dashboard
- https://www.npmjs.com/settings/YOUR_USERNAME/packages

## 🔐 Bảo mật

### Bật 2FA (Khuyến nghị)
1. Vào NPM Settings
2. Enable Two-Factor Authentication
3. Dùng Authy hoặc Google Authenticator

### Quản lý tokens
```bash
# Tạo token mới
npm token create

# Xem danh sách tokens
npm token list

# Xóa token
npm token revoke <token_id>
```

## 📦 Best Practices

1. ✅ Luôn test local trước khi publish
2. ✅ Dùng semantic versioning
3. ✅ Viết CHANGELOG.md
4. ✅ Tag Git cho mỗi release
5. ✅ Bật 2FA cho tài khoản NPM
6. ✅ Không commit `.env` file
7. ✅ Review `.npmignore` cẩn thận
8. ✅ Test package sau khi publish

## 🎯 Quick Commands

```bash
# Full workflow
npm run build
npm version patch
git push origin main --tags
npm publish

# Unpublish (trong 72h đầu)
npm unpublish ecom-connector@1.0.0

# Deprecate version cũ
npm deprecate ecom-connector@1.0.0 "Please upgrade to 1.0.1"
```

---

## ✅ Ready to publish?

1. Điền thông tin cá nhân ✓
2. Build thành công ✓
3. Test local ✓
4. Login NPM ✓
5. Run: `npm publish --access public` 🚀
