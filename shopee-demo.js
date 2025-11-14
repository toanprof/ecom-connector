require('dotenv').config();
const { createEcomConnector } = require('./dist');

async function shopeeDemo() {
  console.log('\n========================================');
  console.log('    Shopee Demo - ecom-connector');
  console.log('========================================\n');

  // Check credentials
  if (!process.env.SHOPEE_PARTNER_ID || !process.env.SHOPEE_PARTNER_KEY || !process.env.SHOPEE_SHOP_ID) {
    console.error('❌ Missing Shopee credentials in .env!');
    console.log('\nPlease set in .env:');
    console.log('  SHOPEE_PARTNER_ID=...');
    console.log('  SHOPEE_PARTNER_KEY=...');
    console.log('  SHOPEE_SHOP_ID=...');
    console.log('  SHOPEE_ACCESS_TOKEN=... (optional)\n');
    process.exit(1);
  }

  console.log('✓ Found Shopee credentials');
  console.log('  Partner ID:', process.env.SHOPEE_PARTNER_ID);
  console.log();

  try {
    console.log('🔌 Creating Shopee connector...\n');
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID,
        partnerKey: process.env.SHOPEE_PARTNER_KEY,
        shopId: process.env.SHOPEE_SHOP_ID,
        accessToken: process.env.SHOPEE_ACCESS_TOKEN
      },
      sandbox: true,
      timeout: 30000
    });
    console.log("🚀 ~ connector:", connector)

    console.log('✅ Connector created\n');

    // 1. Get products
    console.log('📦 [1] Fetching products...');
    try {
      const products = await connector.getProducts({ limit: 5 });
      console.log(`✓ Found ${products.length} products\n`);
      products.forEach((p, i) => {
        console.log(`#${i+1} - ${p.id} - ${p.name} - ${p.price} ${p.currency} - ${p.status}`);
      });
      console.log();

      if (products.length > 0) {
        const pid = products[0].id;
        console.log(`🔍 [2] Fetching product by id: ${pid}`);
        try {
          const product = await connector.getProductById(pid);
          console.log('Product detail:', JSON.stringify(product, null, 2));
        } catch (err) {
          console.error('Error fetching product detail:', err.message || err);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err.message || err);
    }

    // 2. Get orders
    console.log('\n📋 [3] Fetching orders...');
    try {
      const orders = await connector.getOrders({ limit: 5 });
      console.log(`✓ Found ${orders.length} orders\n`);
      orders.forEach((o, i) => {
        console.log(`#${i+1} - ${o.id} - ${o.orderNumber} - ${o.status} - ${o.totalAmount} ${o.currency}`);
      });

      if (orders.length > 0) {
        const oid = orders[0].id;
        console.log(`\n🔍 [4] Fetching order by id: ${oid}`);
        try {
          const order = await connector.getOrderById(oid);
          console.log('Order detail:', JSON.stringify(order, null, 2));
        } catch (err) {
          console.error('Error fetching order detail:', err.message || err);
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err.message || err);
    }

    console.log('\n========================================');
    console.log('Shopee demo completed');
    console.log('========================================\n');
  } catch (error) {
    console.error('\nFatal error:', error.message || error);
    if (error.platformError) console.error('Platform error:', JSON.stringify(error.platformError, null, 2));
    process.exit(1);
  }
}

shopeeDemo().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
