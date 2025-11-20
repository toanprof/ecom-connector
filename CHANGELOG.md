# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2024-11-19

### 🎉 Major Features

#### Automatic CamelCase Transformation
- **NEW**: All API responses now automatically transformed from `snake_case` to `camelCase`
- Added utility functions: `keysToCamel()`, `keysToSnake()`, `snakeToCamel()`, `camelToSnake()`, `transformResponse()`
- Response interceptors handle transformation automatically
- Maintains type safety while providing better JavaScript/TypeScript conventions

### 🚀 Shopee Platform Enhancements

#### Authorization APIs (NEW)
- `generateAuthUrl(redirectUrl: string): string` - Generate OAuth authorization URL
- `getAccessToken(code, shopId?, mainAccountId?): Promise<any>` - Get access token with auth code
- `refreshAccessToken(refreshToken, shopId?, mainAccountId?): Promise<any>` - Refresh access token

#### Product APIs (NEW)
- `getCategories(language?: string): Promise<any>` - Get product categories
- `getCategoryAttributes(categoryId, language?): Promise<any>` - Get category attributes
- `getBrandList(categoryId, status?, pageSize?, offset?): Promise<any>` - Get brand list
- `updateStock(itemId, stockList): Promise<any>` - Update product stock
- `updatePrice(itemId, priceList): Promise<any>` - Update product price
- `unlistItem(itemList): Promise<any>` - Unlist/list items
- `deleteProduct(itemId): Promise<any>` - Delete product

#### Logistics APIs (NEW)
- `getLogisticsChannelList(): Promise<any>` - Get logistics channel list
- `getShippingParameter(orderSn): Promise<any>` - Get shipping parameters for order
- `shipOrder(orderSn, pickup): Promise<any>` - Ship order with pickup info

### 🚀 TikTok Shop Platform Enhancements

#### Authorization APIs (NEW)
- `getAccessToken(authCode): Promise<any>` - Get access token with auth code
- `refreshAccessToken(refreshToken): Promise<any>` - Refresh access token
- `getAuthorizedShops(): Promise<any>` - Get list of authorized shops

#### Product APIs (NEW)
- `getCategories(): Promise<any>` - Get product categories
- `getCategoryRules(categoryId): Promise<any>` - Get category rules
- `getBrands(categoryId, pageSize?): Promise<any>` - Get brands for category
- `getCategoryAttributes(categoryId): Promise<any>` - Get category attributes
- `uploadProductImage(imagePath): Promise<any>` - Upload product image
- `activateProducts(productIds[]): Promise<any>` - Activate products
- `deactivateProducts(productIds[]): Promise<any>` - Deactivate products

#### Fulfillment APIs (NEW)
- `getPackageTimeSlots(packageId): Promise<any>` - Get available pickup time slots
- `shipPackage(packageId, handoverMethod, pickupSlot): Promise<any>` - Ship package
- `getPackageShippingDocument(packageId, documentType): Promise<any>` - Get shipping document

### 🚀 Lazada Platform Enhancements

#### Authorization APIs (NEW)
- `generateAuthUrl(redirectUrl, uuid): string` - Generate OAuth authorization URL
- `getAccessToken(authCode, uuid): Promise<any>` - Get access token with auth code
- `refreshAccessToken(refreshToken): Promise<any>` - Refresh access token

#### Product APIs (NEW)
- `getCategories(): Promise<any>` - Get product categories
- `getCategoryAttributes(categoryId): Promise<any>` - Get category attributes
- `getBrands(startRow?, pageSize?): Promise<any>` - Get brands
- `updateSellableQuantity(itemId, updates[]): Promise<any>` - Update product stock
- `updateProductPrice(itemId, updates[]): Promise<any>` - Update product price
- `updateProductStatus(itemId, updates[]): Promise<any>` - Update product status

### 🔧 Technical Improvements

#### Type System
- Updated `ECommercePlatform` interface to support optional parameters
- Added flexible method signatures for platform-specific requirements
- Improved type inference for response data

#### Error Handling
- Better error messages for authentication failures
- Consistent error handling across all new methods
- Platform-specific error codes maintained

#### Code Organization
- Created `src/utils/transform.ts` for transformation utilities
- Consistent use of interceptors for response transformation
- Updated mapper functions to work with camelCase data

### 📚 Documentation

- **NEW**: `API_EXTENSIONS.md` - Comprehensive guide for new APIs
- **NEW**: `example-new-features.ts` - Example code for all new features
- Updated `README.md` with v1.2.0 features
- Added migration guide for existing users

### ⚠️ Breaking Changes

**Response Format**: All API responses now return camelCase properties instead of snake_case. 

**Migration Path**:
```typescript
// Before v1.2.0
product.platformSpecific.item_name

// v1.2.0+
product.platformSpecific.itemName

// Or use utility to maintain backward compatibility
const snakeCaseData = keysToSnake(product.platformSpecific);
```

### 🐛 Bug Fixes

- Fixed signature generation for platform-specific parameters
- Improved handling of nested objects in mappers
- Fixed optional field handling in response data

---

## [1.1.0] - 2024-11-15

### Added
- Shopee OAuth Authentication with `generateAuthUrl()`, `getAccessToken()`, and `refreshAccessToken()`
- Shop ID & Main Account ID support for Shopee
- Enhanced Order API with 28+ optional fields
- Comprehensive TypeScript types for API responses
- Better error handling for authentication

### Changed
- Updated Shopee mapper functions to handle new response structures
- Improved documentation with detailed API references

---

## [1.0.0] - 2024-11-01

### Added
- Initial release
- Support for Shopee, TikTok Shop, Lazada, and Zalo OA platforms
- Unified interface for product and order management
- TypeScript support
- Basic error handling
- Environment-based configuration

### Features
- `getProducts()` - Fetch products from platforms
- `getProductById()` - Get single product details
- `createProduct()` - Create new products
- `updateProduct()` - Update existing products
- `getOrders()` - Fetch orders
- `getOrderById()` - Get single order details
- `updateOrderStatus()` - Update order status

---

## Legend

- 🎉 Major Features
- 🚀 Platform Enhancements
- 🔧 Technical Improvements
- 📚 Documentation
- ⚠️ Breaking Changes
- 🐛 Bug Fixes
