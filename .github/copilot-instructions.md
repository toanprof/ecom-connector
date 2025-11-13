# ecom-connector AI Agent Instructions

## Project Overview
A TypeScript npm package providing a **unified abstraction layer** for multiple e-commerce platforms (Zalo OA, TikTok Shop, Shopee, Lazada). Uses **factory pattern** to enable platform switching without code changes.

## Architecture Principles

### Factory Pattern Implementation
- Entry point: `createEcomConnector(config)` in `src/factory.ts`
- All platforms implement `ECommercePlatform` interface from `src/interfaces.ts`
- Platform selection via `config.platform` string (`'zalo-oa'`, `'tiktok-shop'`, `'shopee'`, `'lazada'`)
- Each platform lives in `src/platforms/{platformname}/` with `index.ts` (implementation) and `types.ts` (platform-specific types)

### Data Normalization Pattern
All platforms transform vendor-specific responses into common models:
- `Product` - Unified product model with `platformSpecific` field for vendor data
- `Order` - Unified order model with nested `OrderItem[]` and `Customer`
- Platform-specific fields preserved in `platformSpecific: any` escape hatch

Example from `src/platforms/zalooa/index.ts`:
```typescript
private mapZaloOAProductToProduct(zaloProduct: ZaloOAProduct): Product {
  return {
    id: zaloProduct.id,
    name: zaloProduct.name,
    price: zaloProduct.price,
    currency: 'VND', // Platform-specific default
    status: zaloProduct.status === 1 ? 'active' : 'inactive', // Status mapping
    platformSpecific: zaloProduct, // Original data preserved
  };
}
```

### Authentication Strategies (Platform-Specific)
1. **Shopee**: HMAC-SHA256 signature on every request with `partner_id`, `partner_key`, `timestamp`
2. **TikTok Shop**: Similar HMAC with `app_key`, `app_secret`, sorted params
3. **Zalo OA**: Simple `access_token` header authentication
4. **Lazada**: HMAC-SHA256 with `app_key`, concatenated sorted params

Auth logic lives in `setupInterceptors()` private method for each platform. Uses axios request interceptors to automatically sign requests.

## Key Development Workflows

### Adding a New Platform
1. Create `src/platforms/{newplatform}/types.ts` with vendor response types
2. Create `src/platforms/{newplatform}/index.ts` implementing `ECommercePlatform`
3. Add credential interface to `src/interfaces.ts` (e.g., `NewPlatformCredentials`)
4. Update `PlatformType` union in `src/interfaces.ts`
5. Add case to switch statement in `src/factory.ts`
6. Export platform class in `src/index.ts`

### Building and Testing
```bash
npm run build          # Compiles TS to dist/
node setup.js          # Creates directory structure (one-time)
python extract-source.py  # Auto-extracts source from markdown (if sources missing)
```

**Important**: Source code may need extraction from `SOURCE_CODE.md` and `SOURCE_CODE_PART2.md` if `src/` directory is empty. This is a bootstrap mechanism for initial setup.

### Error Handling Convention
Always use `EcomConnectorError` from `src/interfaces.ts`:
```typescript
throw new EcomConnectorError(
  'User-friendly message',
  'ERROR_CODE',
  httpStatusCode,
  platformRawError  // Original error for debugging
);
```

Catch and re-throw in platform methods:
```typescript
try {
  const response = await this.client.get('/api/products');
  return response.data.map(mapToProduct);
} catch (error) {
  if (error instanceof EcomConnectorError) throw error;
  throw new EcomConnectorError('Failed to fetch products', 'FETCH_ERROR', 500, error);
}
```

## Critical Implementation Details

### Timestamp Handling
- Shopee/TikTok: Unix timestamps in **seconds** (e.g., `create_time * 1000` for JS Date)
- Zalo OA: Unix timestamps in **seconds**
- Lazada: ISO 8601 strings (`new Date(iso_string)`)

### Currency Defaults
Each platform has implicit currency:
- Zalo OA: `VND`
- Shopee: Varies by region (implementation uses `currency` field from API)
- TikTok Shop: From API response
- Lazada: `SGD` (Singapore-based, can vary)

### Pagination Patterns
- **Offset-based**: Shopee, Lazada (`offset`, `limit`)
- **Page-based**: TikTok Shop (`page`, `page_size`)
- Handle both in `ProductQueryOptions`/`OrderQueryOptions` with `offset?`, `page?`, `limit?`

### HMAC Signature Generation (Shopee/TikTok/Lazada)
1. Concatenate API path + sorted param keys/values
2. HMAC-SHA256 with app secret
3. Uppercase hex (Shopee/Lazada) or hex (TikTok)
4. Add as `sign` parameter

See `generateSignature()` in each platform for exact implementation.

## Code Organization Rules

### File Structure
```
src/
├── interfaces.ts        # All common interfaces, error class
├── factory.ts          # Platform instantiation logic
├── index.ts            # Public API exports
└── platforms/
    └── {platform}/
        ├── index.ts    # {Platform}Platform class
        └── types.ts    # Vendor-specific response types
```

### Naming Conventions
- Platform classes: `{Platform}Platform` (e.g., `ZaloOAPlatform`)
- Mapper methods: `map{Platform}{Entity}To{Entity}` (e.g., `mapShopeeProductToProduct`)
- Private methods: Prefix with `private`
- Interfaces: PascalCase, no `I` prefix

### Dependency Management
**Only one external dependency**: `axios` for HTTP. No date libraries, no lodash, keep bundle minimal.

## Configuration Patterns

### Environment Variables (Convention)
```env
{PLATFORM}_{CREDENTIAL}={value}
# Examples:
SHOPEE_PARTNER_ID=...
TIKTOK_APP_KEY=...
```

### Config Object Structure
```typescript
const connector = createEcomConnector({
  platform: 'shopee',  // Must be exact string from PlatformType union
  credentials: {        // Type-checked based on platform
    partnerId: '...',
    partnerKey: '...',
    shopId: '...'
  },
  sandbox: true,       // Optional: use test endpoints
  timeout: 30000       // Optional: axios timeout (default 30s)
});
```

## Testing Approach (Not Yet Implemented)
- Mock axios responses in platform tests
- Test mapper functions with real API response samples
- Integration tests use factory with different configs
- Credential validation tests (missing/invalid credentials)

## Common Pitfalls

1. **Timestamp conversion**: Always multiply by 1000 for JavaScript Date if platform uses seconds
2. **HMAC casing**: Shopee/Lazada need uppercase hex, TikTok lowercase
3. **Null safety**: Use optional chaining for nested platform responses (e.g., `attrs?.Images?.Image || []`)
4. **Batch operations**: Shopee requires separate calls for product list → product details
5. **Status mapping**: Each platform has different status enums, map to common strings in transformers

## When Extending APIs

### Adding New Methods to ECommercePlatform
1. Update interface in `src/interfaces.ts`
2. Implement in all 4 platform classes
3. May throw `NOT_SUPPORTED` error if platform lacks capability:
   ```typescript
   throw new EcomConnectorError('Feature not supported', 'NOT_SUPPORTED', 501);
   ```

### Adding Query Parameters
1. Add optional field to `ProductQueryOptions` or `OrderQueryOptions`
2. Map to platform-specific param names in each platform's implementation
3. Document platform compatibility differences

## Documentation Sources
- `README.md` - Full API reference and usage examples
- `PROJECT_SUMMARY.md` - Architecture overview, 3500+ LOC summary
- `INSTALLATION_GUIDE.md` - Setup workflows, credential acquisition
- `SOURCE_CODE.md` / `SOURCE_CODE_PART2.md` - Complete source code (bootstrap mechanism)
