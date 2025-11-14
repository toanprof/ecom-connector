# 🏢 Multi-Tenant với ecom-connector

## Kiến trúc Multi-Tenant

Trong hệ thống multi-tenant, mỗi khách hàng (tenant) có:
- Credentials riêng cho từng platform
- Có thể kết nối nhiều platforms
- Cần isolate data giữa các tenants

---

## 📋 Cấu trúc Database

### Tenant Model
```sql
CREATE TABLE tenants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  slug VARCHAR(100) UNIQUE,
  status ENUM('active', 'inactive'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE platform_credentials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tenant_id INT,
  platform ENUM('shopee', 'tiktok-shop', 'lazada', 'zalo-oa'),
  credentials JSON,  -- Encrypted credentials
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);
```

### Example Data
```json
// Tenant 1 - Shop A
{
  "tenant_id": 1,
  "platform": "shopee",
  "credentials": {
    "partnerId": "1194848",
    "partnerKey": "encrypted_key_1",
    "shopId": "226159527",
    "accessToken": "encrypted_token_1"
  }
}

// Tenant 2 - Shop B
{
  "tenant_id": 2,
  "platform": "shopee",
  "credentials": {
    "partnerId": "9876543",
    "partnerKey": "encrypted_key_2",
    "shopId": "987654321",
    "accessToken": "encrypted_token_2"
  }
}
```

---

## 💻 Implementation

### 1. Tenant Manager Service

```javascript
// services/TenantManager.js
const crypto = require('crypto');
const { createEcomConnector } = require('ecom-connector');

class TenantManager {
  constructor(database, encryptionKey) {
    this.db = database;
    this.encryptionKey = encryptionKey;
    this.connectorCache = new Map(); // Cache connectors per tenant
  }

  /**
   * Lấy credentials từ database cho tenant và platform
   */
  async getCredentials(tenantId, platform) {
    const query = `
      SELECT credentials 
      FROM platform_credentials 
      WHERE tenant_id = ? AND platform = ? AND is_active = TRUE
    `;
    
    const [rows] = await this.db.query(query, [tenantId, platform]);
    
    if (!rows || rows.length === 0) {
      throw new Error(`No credentials found for tenant ${tenantId} and platform ${platform}`);
    }

    // Decrypt credentials
    const encryptedCreds = rows[0].credentials;
    const decryptedCreds = this.decrypt(encryptedCreds);
    
    return JSON.parse(decryptedCreds);
  }

  /**
   * Tạo connector cho tenant và platform
   */
  async getConnector(tenantId, platform, options = {}) {
    const cacheKey = `${tenantId}:${platform}`;
    
    // Check cache
    if (this.connectorCache.has(cacheKey)) {
      return this.connectorCache.get(cacheKey);
    }

    // Get credentials from DB
    const credentials = await this.getCredentials(tenantId, platform);
    
    // Create connector
    const connector = createEcomConnector({
      platform: platform,
      credentials: credentials,
      sandbox: options.sandbox || false,
      timeout: options.timeout || 30000
    });

    // Cache connector (với TTL nếu cần)
    this.connectorCache.set(cacheKey, connector);
    
    return connector;
  }

  /**
   * Lấy tất cả platforms của một tenant
   */
  async getTenantPlatforms(tenantId) {
    const query = `
      SELECT platform, credentials, is_active 
      FROM platform_credentials 
      WHERE tenant_id = ?
    `;
    
    const [rows] = await this.db.query(query, [tenantId]);
    
    return rows.map(row => ({
      platform: row.platform,
      isActive: row.is_active,
      credentials: JSON.parse(this.decrypt(row.credentials))
    }));
  }

  /**
   * Lưu credentials mới cho tenant
   */
  async saveCredentials(tenantId, platform, credentials) {
    const encryptedCreds = this.encrypt(JSON.stringify(credentials));
    
    const query = `
      INSERT INTO platform_credentials 
      (tenant_id, platform, credentials, is_active) 
      VALUES (?, ?, ?, TRUE)
      ON DUPLICATE KEY UPDATE 
        credentials = VALUES(credentials),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    await this.db.query(query, [tenantId, platform, encryptedCreds]);
    
    // Invalidate cache
    const cacheKey = `${tenantId}:${platform}`;
    this.connectorCache.delete(cacheKey);
  }

  /**
   * Xóa credentials
   */
  async deleteCredentials(tenantId, platform) {
    const query = `
      UPDATE platform_credentials 
      SET is_active = FALSE 
      WHERE tenant_id = ? AND platform = ?
    `;
    
    await this.db.query(query, [tenantId, platform]);
    
    // Invalidate cache
    const cacheKey = `${tenantId}:${platform}`;
    this.connectorCache.delete(cacheKey);
  }

  /**
   * Encryption helpers
   */
  encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.encryptionKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  /**
   * Clear cache (call periodically hoặc khi cần refresh)
   */
  clearCache(tenantId = null, platform = null) {
    if (tenantId && platform) {
      const cacheKey = `${tenantId}:${platform}`;
      this.connectorCache.delete(cacheKey);
    } else if (tenantId) {
      // Clear all for tenant
      for (const key of this.connectorCache.keys()) {
        if (key.startsWith(`${tenantId}:`)) {
          this.connectorCache.delete(key);
        }
      }
    } else {
      // Clear all
      this.connectorCache.clear();
    }
  }
}

module.exports = TenantManager;
```

---

## 🎯 Usage Examples

### Example 1: API Endpoint - Get Products cho Tenant

```javascript
// routes/products.js
const express = require('express');
const router = express.Router();
const TenantManager = require('../services/TenantManager');

// Middleware để lấy tenantId từ request
const tenantMiddleware = (req, res, next) => {
  // Có thể từ JWT token, subdomain, header, etc.
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
  
  if (!tenantId) {
    return res.status(401).json({ error: 'Tenant ID required' });
  }
  
  req.tenantId = tenantId;
  next();
};

router.get('/products/:platform', tenantMiddleware, async (req, res) => {
  try {
    const { tenantId } = req;
    const { platform } = req.params;
    const { limit, offset } = req.query;

    // Get connector cho tenant này
    const connector = await tenantManager.getConnector(tenantId, platform);

    // Lấy products
    const products = await connector.getProducts({
      limit: parseInt(limit) || 20,
      offset: parseInt(offset) || 0
    });

    res.json({
      tenantId,
      platform,
      products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      error: error.message,
      code: error.code 
    });
  }
});

module.exports = router;
```

### Example 2: Background Job - Sync Products từ tất cả platforms

```javascript
// jobs/syncProducts.js
const TenantManager = require('../services/TenantManager');
const cron = require('node-cron');

class ProductSyncJob {
  constructor(tenantManager, productService) {
    this.tenantManager = tenantManager;
    this.productService = productService;
  }

  /**
   * Sync products cho một tenant từ một platform
   */
  async syncTenantPlatform(tenantId, platform) {
    try {
      console.log(`[${tenantId}] Syncing ${platform}...`);

      const connector = await this.tenantManager.getConnector(tenantId, platform);
      
      // Lấy tất cả products
      let allProducts = [];
      let offset = 0;
      const limit = 100;

      while (true) {
        const products = await connector.getProducts({ limit, offset });
        
        if (products.length === 0) break;
        
        allProducts = allProducts.concat(products);
        
        if (products.length < limit) break;
        
        offset += limit;
      }

      // Lưu vào database
      await this.productService.bulkUpsert(tenantId, platform, allProducts);

      console.log(`[${tenantId}] Synced ${allProducts.length} products from ${platform}`);

      return {
        tenantId,
        platform,
        count: allProducts.length,
        success: true
      };

    } catch (error) {
      console.error(`[${tenantId}] Error syncing ${platform}:`, error.message);
      
      return {
        tenantId,
        platform,
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sync tất cả platforms cho một tenant
   */
  async syncTenant(tenantId) {
    const platforms = await this.tenantManager.getTenantPlatforms(tenantId);
    
    const results = await Promise.allSettled(
      platforms
        .filter(p => p.isActive)
        .map(p => this.syncTenantPlatform(tenantId, p.platform))
    );

    return results.map((r, i) => ({
      platform: platforms[i].platform,
      status: r.status,
      result: r.value || r.reason
    }));
  }

  /**
   * Sync tất cả tenants
   */
  async syncAll() {
    const tenants = await this.getTenants();
    
    for (const tenant of tenants) {
      await this.syncTenant(tenant.id);
    }
  }

  /**
   * Start cron job
   */
  startSchedule() {
    // Chạy mỗi 1 giờ
    cron.schedule('0 * * * *', async () => {
      console.log('Starting product sync for all tenants...');
      await this.syncAll();
    });
  }

  async getTenants() {
    // Query from database
    const [rows] = await this.tenantManager.db.query(
      'SELECT id, name FROM tenants WHERE status = ?',
      ['active']
    );
    return rows;
  }
}

module.exports = ProductSyncJob;
```

### Example 3: Webhook Handler cho từng Tenant

```javascript
// routes/webhooks.js
const express = require('express');
const router = express.Router();

/**
 * Shopee webhook cho tenant cụ thể
 * URL: /webhooks/shopee/:tenantId
 */
router.post('/shopee/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const webhookData = req.body;

  try {
    // Verify webhook signature
    const isValid = verifyShopeeSignature(webhookData, req.headers);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Process webhook based on type
    switch (webhookData.code) {
      case 1: // Order created
        await handleOrderCreated(tenantId, webhookData.data);
        break;
      
      case 2: // Order updated
        await handleOrderUpdated(tenantId, webhookData.data);
        break;
      
      case 3: // Product updated
        await handleProductUpdated(tenantId, webhookData.data);
        break;
    }

    res.json({ success: true });

  } catch (error) {
    console.error(`Webhook error for tenant ${tenantId}:`, error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## 🔒 Security Best Practices

### 1. Encrypt Credentials

```javascript
// config/encryption.js
const crypto = require('crypto');

// Generate key từ environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32);

// Luôn dùng strong encryption
const algorithm = 'aes-256-cbc';

// Rotate keys định kỳ
```

### 2. Tenant Isolation

```javascript
// middleware/tenantIsolation.js
function tenantIsolation(req, res, next) {
  const requestedTenantId = req.params.tenantId || req.query.tenantId;
  const userTenantId = req.user.tenantId;

  // Đảm bảo user chỉ access được data của tenant mình
  if (requestedTenantId && requestedTenantId !== userTenantId) {
    return res.status(403).json({ 
      error: 'Access denied: Tenant isolation violation' 
    });
  }

  next();
}
```

### 3. Rate Limiting per Tenant

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const createTenantRateLimiter = () => {
  return rateLimit({
    store: new RedisStore({
      client: redisClient,
      prefix: 'rate-limit:',
    }),
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per tenant
    keyGenerator: (req) => {
      return `tenant:${req.tenantId}`;
    },
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        tenantId: req.tenantId
      });
    }
  });
};
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       API Gateway / Load Balancer            │
└───────────────────────────┬─────────────────────────────────┘
                            │
                ┌───────────┴──────────┐
                │                      │
        ┌───────▼───────┐      ┌──────▼──────┐
        │   Tenant 1    │      │  Tenant 2   │
        │   Routing     │      │  Routing    │
        └───────┬───────┘      └──────┬──────┘
                │                      │
        ┌───────▼───────────────────────▼──────┐
        │      TenantManager Service            │
        │  - Get Credentials from DB            │
        │  - Create ecom-connector per tenant   │
        │  - Cache connectors                   │
        └───────┬───────────────────────┬───────┘
                │                       │
        ┌───────▼───────┐       ┌──────▼──────┐
        │  Shopee API   │       │ TikTok API  │
        │  (Tenant 1)   │       │ (Tenant 2)  │
        └───────────────┘       └─────────────┘
```

---

## 🚀 Complete Example App

```javascript
// app.js - Express App với Multi-Tenant
const express = require('express');
const mysql = require('mysql2/promise');
const TenantManager = require('./services/TenantManager');

const app = express();
app.use(express.json());

// Initialize services
const db = await mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

const tenantManager = new TenantManager(db, process.env.ENCRYPTION_KEY);

// Middleware
app.use((req, res, next) => {
  req.tenantManager = tenantManager;
  next();
});

// Routes
app.get('/api/:tenantId/products/:platform', async (req, res) => {
  try {
    const { tenantId, platform } = req.params;
    
    const connector = await tenantManager.getConnector(
      parseInt(tenantId), 
      platform
    );
    
    const products = await connector.getProducts({ limit: 20 });
    
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/:tenantId/orders/:platform', async (req, res) => {
  try {
    const { tenantId, platform } = req.params;
    
    const connector = await tenantManager.getConnector(
      parseInt(tenantId), 
      platform
    );
    
    const orders = await connector.getOrders({ limit: 50 });
    
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Multi-tenant ecom-connector API running on port 3000');
});
```

---

## 💡 Tips & Recommendations

### 1. Connection Pooling
- Cache connectors per tenant
- Set TTL để refresh credentials
- Clear cache khi credentials update

### 2. Error Handling
- Log errors với tenantId
- Isolate errors giữa tenants
- Retry logic per tenant

### 3. Monitoring
```javascript
// Prometheus metrics per tenant
const prometheus = require('prom-client');

const requestCounter = new prometheus.Counter({
  name: 'api_requests_total',
  help: 'Total API requests',
  labelNames: ['tenant_id', 'platform', 'method']
});

// Track per tenant
requestCounter.inc({ 
  tenant_id: tenantId, 
  platform: 'shopee', 
  method: 'getProducts' 
});
```

### 4. Background Jobs
- Queue-based processing per tenant
- Prioritize based on tenant tier
- Parallel processing với rate limits

---

**Đây là kiến trúc hoàn chỉnh cho multi-tenant system với ecom-connector!** 🎉
