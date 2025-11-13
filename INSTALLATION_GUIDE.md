# Installation and Setup Guide for ecom-connector

## Quick Start

Follow these steps to set up the ecom-connector package:

### Step 1: Create Directory Structure

Run the setup batch file:
```bash
setup-dirs.bat
```

Or manually create the directories:
```bash
mkdir src src\platforms src\platforms\zalooa src\platforms\tiktokshop src\platforms\shopee src\platforms\lazada examples dist
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- axios (^1.6.0)
- typescript (^5.3.0)
- @types/node (^20.0.0)

### Step 3: Copy Source Files

Copy all code from `SOURCE_CODE.md` and `SOURCE_CODE_PART2.md` to their respective locations:

**Core Files:**
- `src/interfaces.ts` - Common interfaces and types
- `src/factory.ts` - Factory pattern implementation
- `src/index.ts` - Main entry point

**Platform Implementations:**
- `src/platforms/zalooa/types.ts` - Zalo OA type definitions
- `src/platforms/zalooa/index.ts` - Zalo OA implementation
- `src/platforms/tiktokshop/types.ts` - TikTok Shop type definitions
- `src/platforms/tiktokshop/index.ts` - TikTok Shop implementation
- `src/platforms/shopee/types.ts` - Shopee type definitions
- `src/platforms/shopee/index.ts` - Shopee implementation
- `src/platforms/lazada/types.ts` - Lazada type definitions
- `src/platforms/lazada/index.ts` - Lazada implementation

**Examples:**
- `examples/example.ts` - Usage examples

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory:
```bash
copy .env.example .env
```

Then edit `.env` with your actual credentials.

### Step 5: Build the Project

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` folder.

### Step 6: Run Examples

```bash
node dist/examples/example.js
```

Or with ts-node (install first: `npm install -D ts-node`):
```bash
npx ts-node examples/example.ts
```

## Project Structure

```
ecom-connector/
│
├── src/                          # Source code
│   ├── interfaces.ts            # Common interfaces
│   ├── factory.ts               # Factory pattern
│   ├── index.ts                 # Main entry point
│   └── platforms/               # Platform implementations
│       ├── zalooa/
│       │   ├── index.ts
│       │   └── types.ts
│       ├── tiktokshop/
│       │   ├── index.ts
│       │   └── types.ts
│       ├── shopee/
│       │   ├── index.ts
│       │   └── types.ts
│       └── lazada/
│           ├── index.ts
│           └── types.ts
│
├── examples/                    # Usage examples
│   └── example.ts
│
├── dist/                        # Compiled JavaScript (generated)
│
├── package.json                 # Package configuration
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  # Git ignore rules
├── .env                        # Environment variables (create this)
├── .env.example                # Environment template
├── README.md                   # Documentation
├── setup-dirs.bat              # Directory setup script
├── setup.js                    # Node.js setup script
├── SOURCE_CODE.md              # Complete source code part 1
└── SOURCE_CODE_PART2.md        # Complete source code part 2
```

## Testing Individual Platforms

### Test Shopee Integration

```typescript
import { createEcomConnector } from 'ecom-connector';

const connector = createEcomConnector({
  platform: 'shopee',
  credentials: {
    partnerId: 'YOUR_PARTNER_ID',
    partnerKey: 'YOUR_PARTNER_KEY',
    shopId: 'YOUR_SHOP_ID',
  },
  sandbox: true,
});

const products = await connector.getProducts({ limit: 10 });
console.log(products);
```

### Test TikTok Shop Integration

```typescript
const connector = createEcomConnector({
  platform: 'tiktok-shop',
  credentials: {
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET',
    shopId: 'YOUR_SHOP_ID',
  },
});

const orders = await connector.getOrders({ status: 'UNPAID' });
console.log(orders);
```

### Test Zalo OA Integration

```typescript
const connector = createEcomConnector({
  platform: 'zalo-oa',
  credentials: {
    appId: 'YOUR_APP_ID',
    secretKey: 'YOUR_SECRET_KEY',
    accessToken: 'YOUR_ACCESS_TOKEN',
  },
});

const products = await connector.getProducts();
console.log(products);
```

### Test Lazada Integration

```typescript
const connector = createEcomConnector({
  platform: 'lazada',
  credentials: {
    appKey: 'YOUR_APP_KEY',
    appSecret: 'YOUR_APP_SECRET',
    accessToken: 'YOUR_ACCESS_TOKEN',
  },
});

const products = await connector.getProducts();
console.log(products);
```

## Common Issues and Solutions

### Issue 1: TypeScript Compilation Errors

**Solution:** Make sure all dependencies are installed:
```bash
npm install --save-dev typescript @types/node
```

### Issue 2: Missing Credentials

**Solution:** Verify your `.env` file contains all required credentials for the platform you're using.

### Issue 3: API Authentication Errors

**Solution:** 
- Check if credentials are correct
- Verify access tokens haven't expired
- Ensure proper API permissions are granted

### Issue 4: Network/Timeout Errors

**Solution:** Increase timeout in configuration:
```typescript
const connector = createEcomConnector({
  platform: 'shopee',
  credentials: { /* ... */ },
  timeout: 60000, // 60 seconds
});
```

## Development Workflow

### 1. Make Changes to Source Code

Edit files in `src/` directory

### 2. Rebuild

```bash
npm run build
```

### 3. Test

```bash
node dist/examples/example.js
```

### 4. Add Tests (Optional)

Install Jest:
```bash
npm install --save-dev jest @types/jest ts-jest
```

Create test files:
```typescript
// src/__tests__/factory.test.ts
import { createEcomConnector } from '../factory';

describe('Factory', () => {
  it('should create Shopee connector', () => {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: 'test',
        partnerKey: 'test',
        shopId: 'test',
      },
    });
    expect(connector).toBeDefined();
  });
});
```

## Publishing to npm (Optional)

### 1. Update package.json

```json
{
  "name": "@your-org/ecom-connector",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/ecom-connector"
  }
}
```

### 2. Build and Test

```bash
npm run build
npm test
```

### 3. Publish

```bash
npm login
npm publish --access public
```

## Advanced Configuration

### Using with TypeScript Projects

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "types": ["node"],
    "esModuleInterop": true
  }
}
```

### Using with JavaScript Projects

```javascript
// JavaScript (CommonJS)
const { createEcomConnector } = require('ecom-connector');

const connector = createEcomConnector({
  platform: 'shopee',
  credentials: {
    partnerId: process.env.SHOPEE_PARTNER_ID,
    partnerKey: process.env.SHOPEE_PARTNER_KEY,
    shopId: process.env.SHOPEE_SHOP_ID,
  },
});
```

### Environment-based Configuration

```typescript
// config.ts
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  platform: process.env.PLATFORM || 'shopee',
  credentials: {
    // Load based on platform
  },
};
```

## Next Steps

1. ✅ Set up the project structure
2. ✅ Install dependencies
3. ✅ Configure credentials
4. ✅ Build the project
5. ✅ Test with examples
6. 🔲 Add unit tests
7. 🔲 Add integration tests
8. 🔲 Add CI/CD pipeline
9. 🔲 Publish to npm

## Support

For issues, questions, or contributions, please refer to:
- README.md for general documentation
- SOURCE_CODE.md for implementation details
- examples/ folder for usage examples

## License

MIT License - See LICENSE file for details
