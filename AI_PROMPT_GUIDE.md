# 🤖 AI Assistant Prompt - Hiểu rõ ecom-connector

Sao chép và dán prompt này khi hỏi AI (ChatGPT, Claude, Gemini, v.v.) về codebase ecom-connector:

---

## 📋 PROMPT CHO AI ASSISTANT

```
Tôi đang làm việc với package npm "ecom-connector" - một abstraction layer thống nhất để tích hợp với 4 nền tảng e-commerce (TikTok Shop, Shopee, Lazada, Zalo OA).

Hãy giúp tôi hiểu rõ về codebase này theo các khía cạnh sau:

### 1. KIẾN TRÚC TỔNG QUAN
- Giải thích Factory Pattern được implement như thế nào
- Tại sao sử dụng Factory Pattern thay vì các pattern khác
- Luồng hoạt động từ khi user gọi createEcomConnector() cho đến khi nhận được data
- Cấu trúc thư mục và vai trò của từng file/folder

### 2. PLATFORM IMPLEMENTATIONS
Với mỗi platform (TikTok Shop, Shopee, Lazada, Zalo OA):
- Cách authentication được xử lý (HMAC signature, token-based, v.v.)
- Các điểm khác biệt quan trọng giữa các platforms
- Cách data normalization hoạt động (transform platform-specific → common format)
- Các gotchas và pitfalls cần lưu ý

### 3. KEY FILES & COMPONENTS
Giải thích chi tiết:
- `src/interfaces.ts` - Tất cả interfaces và error handling
- `src/factory.ts` - Factory implementation
- `src/platforms/{platform}/index.ts` - Platform class structure
- `src/platforms/{platform}/types.ts` - Platform-specific types
- Mapper functions pattern (mapXXXToProduct, mapXXXToOrder)

### 4. DATA MODELS & NORMALIZATION
- Cấu trúc của Product, Order, Customer interfaces
- Tại sao có field `platformSpecific`
- Cách xử lý các data types khác nhau giữa platforms:
  - Timestamps (seconds vs ISO strings)
  - Currencies (VND, SGD, platform-dependent)
  - Pagination (offset-based vs page-based)
  - Status mapping

### 5. ERROR HANDLING
- EcomConnectorError class và cách sử dụng
- Error codes phổ biến
- Best practices khi catch và throw errors
- Debugging tips

### 6. AUTHENTICATION & SECURITY
- HMAC-SHA256 signature generation (Shopee, TikTok, Lazada)
- Token-based auth (Zalo OA)
- Axios interceptors để auto-sign requests
- Timestamp synchronization

### 7. USE CASES & EXAMPLES
Hướng dẫn tôi implement:
- Lấy danh sách sản phẩm từ một platform
- Đồng bộ sản phẩm giữa 2 platforms
- Xử lý pagination để lấy toàn bộ data
- Error handling và retry logic
- Switch giữa sandbox và production

### 8. EXTENDING THE CODEBASE
Nếu tôi muốn:
- Thêm một platform mới (ví dụ: Tokopedia)
- Thêm method mới vào ECommercePlatform interface
- Implement webhook support
- Add caching layer
- Handle rate limiting

Hãy giải thích từng bước cụ thể và các file cần modify.

### 9. COMMON ISSUES & TROUBLESHOOTING
- Timestamp conversion errors
- HMAC signature không match
- Rate limiting
- Access token expired
- Null safety với nested objects
- Platform-specific limitations

### 10. BEST PRACTICES
- Cách structure code khi dùng package này
- Environment variables management
- Error handling patterns
- Testing strategies (mocking axios, testing mappers)
- Performance optimization

### THÔNG TIN CODEBASE:
- Language: TypeScript
- Dependencies: axios (only)
- Target: ES2020, CommonJS
- Platforms: TikTok Shop, Shopee, Lazada, Zalo OA
- Pattern: Factory Pattern + Data Normalization
- GitHub: https://github.com/toanprof/ecom-connector

Hãy giải thích một cách chi tiết, có ví dụ code cụ thể từ codebase, và highlight những điểm quan trọng mà developer cần lưu ý.
```

---

## 🎯 CÁC PROMPT CHUYÊN SÂU

### Prompt 1: Deep Dive vào một Platform cụ thể
```
Hãy phân tích chi tiết implementation của [TikTok Shop/Shopee/Lazada/Zalo OA] platform trong ecom-connector:

1. Authentication flow chi tiết
2. Cách HMAC signature được tạo (nếu có)
3. API endpoints được sử dụng
4. Request/response format
5. Data mapping logic
6. Error handling specific
7. Pagination strategy
8. Những hạn chế của platform API
9. Code walkthrough từng method trong platform class
10. Best practices khi làm việc với platform này

Giải thích với ví dụ code từ:
- src/platforms/{platform}/index.ts
- src/platforms/{platform}/types.ts
```

### Prompt 2: Implement Feature Mới
```
Tôi muốn thêm feature [tên feature] vào ecom-connector. Hướng dẫn tôi:

1. Files nào cần modify
2. Interfaces nào cần thêm/update
3. Logic implement trong từng platform
4. Handle trường hợp platform không support
5. Error handling
6. Testing approach
7. Documentation updates
8. Code example đầy đủ

Ví dụ features:
- Inventory sync giữa platforms
- Bulk product update
- Order tracking
- Webhook integration
- Rate limiting
- Caching layer
```

### Prompt 3: Debug Specific Issue
```
Tôi gặp lỗi khi sử dụng ecom-connector:

[Paste error message và code của bạn]

Hãy giúp tôi:
1. Phân tích nguyên nhân lỗi
2. Giải thích tại sao lỗi xảy ra
3. Các bước để debug
4. Solution cụ thể
5. Best practices để tránh lỗi này

Context: Tôi đang [mô tả tình huống: lấy products, create order, v.v.]
Platform: [TikTok Shop/Shopee/Lazada/Zalo OA]
```

### Prompt 4: Code Review & Optimization
```
Tôi đã viết code sử dụng ecom-connector như sau:

[Paste code của bạn]

Hãy review và:
1. Chỉ ra các vấn đề về performance
2. Suggest improvements
3. Best practices bị vi phạm
4. Security concerns
5. Error handling có đầy đủ không
6. Code có scale được không
7. Refactor suggestions với code mẫu
```

### Prompt 5: Migration & Integration
```
Tôi đang có hệ thống [mô tả hệ thống hiện tại] và muốn integrate ecom-connector.

Hệ thống hiện tại:
- Tech stack: [Node.js/Express/NestJS/v.v.]
- Database: [MongoDB/PostgreSQL/v.v.]
- Current integrations: [mô tả]

Hãy hướng dẫn:
1. Migration strategy
2. Architecture design
3. Database schema cho sync data
4. Background jobs setup
5. Error handling & logging
6. Monitoring & alerting
7. Deployment considerations
8. Code examples cụ thể
```

---

## 💡 TIPS KHI SỬ DỤNG PROMPT

### 1. Cung cấp Context đầy đủ
- Paste relevant code snippets
- Mô tả use case cụ thể
- Mention platform bạn đang làm việc
- Include error messages nếu có

### 2. Hỏi từng phần nhỏ
Thay vì hỏi "Giải thích toàn bộ codebase", hãy:
- "Giải thích Factory Pattern trong ecom-connector"
- "Cách TikTok Shop authentication hoạt động"
- "Data normalization flow từ Shopee API response"

### 3. Yêu cầu Code Examples
- "Cho tôi ví dụ code để..."
- "Walkthrough từng bước với code..."
- "Refactor code này thành..."

### 4. Specify Output Format
- "Giải thích dưới dạng bullet points"
- "Tạo flowchart bằng text"
- "So sánh dạng bảng"
- "Step-by-step tutorial"

---

## 📚 RECOMMENDED READING ORDER

Khi tìm hiểu codebase lần đầu:

1. **.github/copilot-instructions.md** - AI conventions và patterns
2. **PROJECT_SUMMARY.md** - Overview kiến trúc
3. **README.md** - API reference
4. **src/interfaces.ts** - Hiểu data models
5. **src/factory.ts** - Factory pattern
6. **src/platforms/[một-platform]/index.ts** - Implementation cụ thể
7. **USER_GUIDE.md** - Usage examples

---

## 🔍 EXAMPLE CONVERSATIONS

### Example 1: Beginner
```
Q: "Tôi mới biết đến ecom-connector, giải thích cho tôi cơ bản nhất có thể"

AI sẽ giải thích:
- Package là gì và giải quyết vấn đề gì
- 4 platforms được support
- Factory Pattern cơ bản
- Ví dụ sử dụng đơn giản nhất
```

### Example 2: Intermediate
```
Q: "Tại sao Shopee cần 2 API calls để lấy product details?"

AI sẽ giải thích:
- Shopee API architecture
- get_item_list chỉ trả về item IDs
- get_item_base_info cần để lấy details
- Code trong getProducts() method
- Performance implications
```

### Example 3: Advanced
```
Q: "Implement rate limiting với exponential backoff cho tất cả platforms"

AI sẽ:
- Design pattern cho rate limiting
- Code implementation chi tiết
- Integration với axios interceptors
- Platform-specific rate limits
- Testing strategy
- Full working code
```

---

## 🚀 QUICK START PROMPTS

### Hiểu nhanh một khái niệm:
```
"ELI5 (Explain Like I'm 5): Factory Pattern trong ecom-connector hoạt động như thế nào?"
```

### Debug nhanh:
```
"Tôi gặp lỗi [error message]. Platform: [name]. Code: [snippet]. Quick fix?"
```

### Implement nhanh:
```
"Quick example: Lấy 100 products từ TikTok Shop với pagination"
```

### So sánh:
```
"So sánh authentication flow giữa TikTok Shop và Shopee, highlight key differences"
```

---

**Sử dụng prompt này với bất kỳ AI nào để hiểu sâu về ecom-connector!** 🤖✨
