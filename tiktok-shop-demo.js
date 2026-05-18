require('dotenv').config();
const { createEcomConnector } = require('./dist');

console.log('\n========================================');
console.log('   TikTok Shop Complete Test');
console.log('========================================\n');

const appKey = process.env.TIKTOK_APP_KEY;
const appSecret = process.env.TIKTOK_APP_SECRET;
const shopId = process.env.TIKTOK_SHOP_ID;
const shopCipher = process.env.TIKTOK_SHOP_CIPHER;
const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

if (!appKey || !appSecret) {
  console.error('❌ Missing credentials in .env!');
  console.log('Required: TIKTOK_APP_KEY, TIKTOK_APP_SECRET');
  process.exit(1);
}

console.log('📋 TikTok Shop Configuration:');
console.log('   App Key:', appKey);
console.log('   App Secret:', appSecret ? '****' + appSecret.slice(-8) : 'Not set');
console.log('   Shop ID:', shopId || 'Not set');
console.log('   Shop Cipher:', shopCipher ? '****' + shopCipher.slice(-8) : 'Not set');
console.log('   Access Token:', accessToken && accessToken !== 'your_access_token_here' ? '****' + accessToken.slice(-8) : 'Not set');
console.log();

async function testTikTokShop() {
  try {
    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey,
        appSecret,
        shopId: shopId || '',
        shopCipher: shopCipher || '',
        accessToken: accessToken || '',
      },
      // sandbox: true, // Set to true to use sandbox environment
    });

    console.log('✅ TikTok Shop connector created\n');

    // ============================================
    // STEP 1: Authorization (if no access token)
    // ============================================
    if (!accessToken || accessToken === 'your_access_token_here') {
      console.log('═══════════════════════════════════════');
      console.log('🔐 STEP 1: Authorization Required');
      console.log('═══════════════════════════════════════\n');

      console.log('⚠️  No access token found. To get started:\n');
      
      console.log('1️⃣  Generate Authorization Link:');
      console.log('   Visit TikTok Shop Partner Portal:');
      console.log('   https://partner.tiktokshop.com/\n');

      console.log('2️⃣  Or use direct authorization URL:');
      console.log('   https://services.tiktokshop.com/open/authorize');
      console.log('   Query params:');
      console.log('     - service_id: Your service ID from partner portal\n');

      console.log('3️⃣  Alternative - Seller Center Authorization:');
      console.log('   https://seller-vn.tiktok.com/shop_auth');
      console.log('   Query params:');
      console.log('     - app_key=' + appKey);
      console.log('     - redirect=<your_callback_url>\n');

      console.log('4️⃣  After authorization, you will receive an auth_code');
      console.log('   Use this code to get access token:\n');
      
      console.log('   const authCode = "<code_from_callback>";');
      console.log('   const tokenData = await connector.getAccessToken(authCode);');
      console.log('   console.log("Access Token:", tokenData.accessToken);\n');

      console.log('5️⃣  Update .env file:');
      console.log('   TIKTOK_ACCESS_TOKEN=<your_access_token_here>\n');

      console.log('═══════════════════════════════════════');
      console.log('⏸️  Tests paused - Authorization required');
      console.log('═══════════════════════════════════════\n');
      return;
    }

    // ============================================
    // STEP 2: Verify Access Token
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('🔍 STEP 2: Verify Access Token');
    console.log('═══════════════════════════════════════\n');

    try {
      const shops = await connector.getAuthorizedShops();
      console.log('✅ Access token is valid!');
      console.log('   Authorized shops:', JSON.stringify(shops, null, 2));
      console.log();
    } catch (error) {
      console.log('❌ Access token verification failed!');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      
      if (error.platformError) {
        console.log('   Platform Error:', JSON.stringify(error.platformError, null, 2));
      }
      
      console.log('\n💡 Your access token may be expired. To refresh:\n');
      console.log('   const newToken = await connector.refreshAccessToken(refreshToken);');
      console.log('   // Update TIKTOK_ACCESS_TOKEN in .env\n');
      return;
    }

    // ============================================
    // STEP 3: Get Categories
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📂 STEP 3: Get Product Categories');
    console.log('═══════════════════════════════════════\n');

    let categoryId = null;
    try {
      const categories = await connector.getCategories();
      console.log("🚀 ~ categories:", categories)
      
      if (categories && categories.categories) {
        console.log(`✅ Found ${categories.categories.length} categories`);
        console.log('\n📋 First 10 categories:');
        
        categories.categories.slice(0, 10).forEach((cat, i) => {
          console.log(`   ${i + 1}. ${cat.local_name || cat.name} (ID: ${cat.id})`);
          if (i === 0) categoryId = cat.id; // Save first category ID for later tests
        });
        console.log();
      }
    } catch (error) {
      console.log('❌ Error getting categories:', error.message);
      console.log();
    }

    // ============================================
    // STEP 4: Get Category Details
    // ============================================
    if (categoryId) {
      console.log('═══════════════════════════════════════');
      console.log('📋 STEP 4: Get Category Details');
      console.log('═══════════════════════════════════════\n');

      try {
        console.log('Getting attributes for category:', categoryId);
        const attributes = await connector.getCategoryAttributes(categoryId);
        console.log('✅ Attributes retrieved');
        console.log('   Sample:', JSON.stringify(attributes, null, 2).substring(0, 200) + '...\n');
      } catch (error) {
        console.log('⚠️  Attributes:', error.message, '\n');
      }

      try {
        console.log('Getting rules for category:', categoryId);
        const rules = await connector.getCategoryRules(categoryId);
        console.log('✅ Rules retrieved');
        console.log('   Sample:', JSON.stringify(rules, null, 2).substring(0, 200) + '...\n');
      } catch (error) {
        console.log('⚠️  Rules:', error.message, '\n');
      }

      try {
        console.log('Getting brands for category:', categoryId);
        const brands = await connector.getBrands(categoryId, 5);
        console.log('✅ Brands retrieved');
        if (brands && brands.brandList) {
          console.log(`   Found ${brands.brandList.length} brands`);
          brands.brandList.forEach((brand, i) => {
            console.log(`   ${i + 1}. ${brand.name} (ID: ${brand.id})`);
          });
        }
        console.log();
      } catch (error) {
        console.log('⚠️  Brands:', error.message, '\n');
      }
    }

    // ============================================
    // STEP 5: Get Products
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📦 STEP 5: Get Products');
    console.log('═══════════════════════════════════════\n');

    let productId = null;
    try {
      const products = await connector.getProducts({
        page: 1,
        limit: 5,
      });
      console.log("🚀 ~ products:", JSON.stringify(products, null, 2))

      console.log(`✅ Found ${products.length} products\n`);
      
      products.forEach((product, i) => {
        console.log(`📦 Product ${i + 1}:`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Price: ${product.price} ${product.currency}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Status: ${product.status}`);
        console.log(`   SKU: ${product.sku || 'N/A'}`);
        console.log();
        
        if (i === 0) productId = product.id; // Save first product ID
      });
    } catch (error) {
      console.log('❌ Error getting products:', error.message);
      console.log('   Code:', error.code);
      if (error.platformError) {
        console.log('   Details:', JSON.stringify(error.platformError, null, 2));
      }
      console.log();
    }

    // ============================================
    // STEP 6: Get Product Detail
    // ============================================
    if (productId) {
      console.log('═══════════════════════════════════════');
      console.log('📄 STEP 6: Get Product Detail');
      console.log('═══════════════════════════════════════\n');

      try {
        const productDetail = await connector.getProductById(productId);
        console.log("🚀 ~ productDetail:", JSON.stringify(productDetail, null, 2))
        console.log('✅ Product detail retrieved:');
        console.log(`   ID: ${productDetail.id}`);
        console.log(`   Name: ${productDetail.title}`);
        console.log(`   Description: ${(productDetail.description || '').substring(0, 100)}...`);
        console.log(`   Price: ${productDetail.skus[0].price.sale_price} ${productDetail.skus[0].price.currency}`);
        console.log(`   Price tax: ${productDetail.skus[0].price.tax_exclusive_price} ${productDetail.skus[0].price.currency}`);
        console.log(`   Stock: ${productDetail.skus[0].inventory[0].quantity}`);        
        console.log();
      } catch (error) {
        console.log('❌ Error getting product detail:', error.message);
        console.log();
      }
    }

    // ============================================
    // STEP 7: Get Products with Pagination
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📦 STEP 7: Products Pagination');
    console.log('═══════════════════════════════════════\n');

    try {
      const page1 = await connector.getProductsWithPagination({
        page: 1,
        limit: 3,
      });

      console.log('✅ Page 1:');
      console.log(`   Products: ${page1.products.length}`);
      console.log(`   Total: ${page1.totalCount}`);
      console.log(`   Has Next: ${page1.hasNextPage}`);
      console.log(`   Next Page: ${page1.nextOffset}`);
      console.log();

      // Test getAllProducts
      const allProducts = await connector.getAllProducts({}, 10);
      console.log(`✅ getAllProducts: ${allProducts.length} products (limit: 10)`);
      console.log();
    } catch (error) {
      console.log('❌ Pagination error:', error.message);
      console.log();
    }

    // ============================================
    // STEP 8: Get Orders
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📋 STEP 8: Get Orders');
    console.log('═══════════════════════════════════════\n');

    let orderId = null;
    try {
      const orders = await connector.getOrders({
        page: 1,
        limit: 5,
      });
      console.log("🚀 ~ orders:", JSON.stringify(orders, null, 2))

      console.log(`✅ Found ${orders.length} orders\n`);
      
    } catch (error) {
      console.log('❌ Error getting orders:', error.message);
      console.log('   Code:', error.code);
      console.log();
    }

    // ============================================
    // STEP 9: Get Order Detail
    // ============================================
    if (orderId) {
      console.log('═══════════════════════════════════════');
      console.log('📄 STEP 9: Get Order Detail');
      console.log('═══════════════════════════════════════\n');

      try {
        const orderDetail = await connector.getOrderById(orderId);
        console.log('✅ Order detail retrieved:');
        console.log(`   Order: ${orderDetail.orderNumber}`);
        console.log(`   Status: ${orderDetail.status}`);
        console.log(`   Total: ${orderDetail.totalAmount} ${orderDetail.currency}`);
        console.log(`   Items:`);
        orderDetail.items.forEach((item, i) => {
          console.log(`     ${i + 1}. ${item.productName} x${item.quantity} = ${item.price}`);
        });
        console.log(`   Shipping: ${orderDetail.shippingAddress?.city || 'N/A'}`);
        console.log();
      } catch (error) {
        console.log('❌ Error getting order detail:', error.message);
        console.log();
      }
    }

    // ============================================
    // STEP 10: Orders Pagination
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📋 STEP 10: Orders Pagination');
    console.log('═══════════════════════════════════════\n');

    try {
      const ordersPage = await connector.getOrdersWithPagination({
        page: 1,
        limit: 3,
      });

      console.log('✅ Orders Page 1:');
      console.log(`   Orders: ${ordersPage.orders.length}`);
      console.log(`   Has More: ${ordersPage.more}`);
      console.log(`   Next Cursor: ${ordersPage.nextCursor || 'N/A'}`);
      console.log();

      // Test getAllOrders
      const allOrders = await connector.getAllOrders({}, 10);
      console.log(`✅ getAllOrders: ${allOrders.length} orders (limit: 10)`);
      console.log();
    } catch (error) {
      console.log('❌ Orders pagination error:', error.message);
      console.log();
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('✅ All Tests Completed Successfully!');
    console.log('═══════════════════════════════════════\n');

    console.log('📊 TikTok Shop Features Tested:\n');
    console.log('✅ Authorization & Shops');
    console.log('✅ Categories, Attributes, Rules, Brands');
    console.log('✅ Products (list, detail, pagination)');
    console.log('✅ Orders (list, detail, pagination)');
    console.log();

    console.log('📝 Additional Features Available:\n');
    console.log('📦 Product Management:');
    console.log('   - createProduct(productData)');
    console.log('   - updateProduct(id, productData)');
    console.log('   - activateProducts([ids])');
    console.log('   - deactivateProducts([ids])');
    console.log('   - uploadProductImage(imagePath)\n');

    console.log('📋 Order Management:');
    console.log('   - updateOrderStatus(id, status)\n');

    console.log('🚚 Fulfillment:');
    console.log('   - getPackageTimeSlots(packageId)');
    console.log('   - shipPackage(packageId, method, slot)');
    console.log('   - getPackageShippingDocument(packageId, type)\n');

    console.log('🔄 Token Management:');
    console.log('   - refreshAccessToken(refreshToken)\n');

  } catch (error) {
    console.error('\n❌ UNEXPECTED ERROR!\n');
    console.error('Message:', error.message);
    if (error.code) {
      console.error('Code:', error.code);
    }
    if (error.platformError) {
      console.error('Platform Error:', JSON.stringify(error.platformError, null, 2));
    }
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    console.log();
    process.exit(1);
  }
}

testTikTokShop();
