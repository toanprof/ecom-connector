# 🚀 Quick AI Prompt - ecom-connector

## COPY & PASTE VÀO AI (ChatGPT/Claude/Gemini)

```
Tôi cần hiểu về package "ecom-connector" - một TypeScript npm package để tích hợp với TikTok Shop, Shopee, Lazada, và Zalo OA.

Repository: https://github.com/toanprof/ecom-connector

Codebase sử dụng:
- Factory Pattern để switch giữa các platforms
- Data normalization (platform-specific → common format)
- Axios interceptors cho authentication
- HMAC-SHA256 signatures (Shopee, TikTok, Lazada)
- Token-based auth (Zalo OA)

Key files:
- src/interfaces.ts - Common interfaces
- src/factory.ts - Factory implementation
- src/platforms/*/index.ts - Platform implementations

Hãy giải thích [TOPIC BẠN MUỐN HỎI] với:
1. Giải thích chi tiết
2. Code examples từ codebase
3. Best practices
4. Common pitfalls
5. Step-by-step nếu cần implement

[THÊM QUESTIONS CỤ THỂ CỦA BẠN Ở ĐÂY]
```

---

## 🎯 TOPICS BẠN CÓ THỂ HỎI:

### Kiến trúc:
- "Factory Pattern implementation"
- "Data flow từ user code → platform API → normalized response"
- "Authentication strategies cho từng platform"

### Platform-specific:
- "TikTok Shop HMAC signature generation"
- "Shopee batch operations (2-step product fetch)"
- "Lazada pagination với offset/limit"
- "Zalo OA token management"

### Implementation:
- "Mapper functions pattern (mapXXXToProduct)"
- "Error handling với EcomConnectorError"
- "Timestamp conversion (seconds vs ISO strings)"
- "Currency handling per platform"

### Extend codebase:
- "Thêm platform mới (Tokopedia)"
- "Implement rate limiting"
- "Add webhook support"
- "Caching strategy"

### Troubleshooting:
- "HMAC signature không match"
- "Access token expired handling"
- "Null safety với nested objects"
- "Rate limit errors (429)"

---

## 📋 PROMPT TEMPLATES

### 1. Học một feature:
```
Giải thích [FEATURE] trong ecom-connector:
- Architecture
- Code walkthrough
- Use cases
- Examples
```

### 2. Debug issue:
```
Tôi gặp lỗi: [ERROR MESSAGE]

Code:
[PASTE CODE]

Platform: [TIKTOK/SHOPEE/LAZADA/ZALO]

Giúp tôi fix?
```

### 3. Implement feature mới:
```
Hướng dẫn implement [FEATURE]:
- Files cần modify
- Code changes
- Testing approach
- Full example
```

### 4. So sánh platforms:
```
So sánh [ASPECT] giữa TikTok Shop, Shopee, Lazada, Zalo OA:
- Key differences
- Implementation differences
- Best practices per platform
```

---

**Save file này và dùng làm template khi hỏi AI!** 🤖
