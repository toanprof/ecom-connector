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
  console.log('  Shop ID:', process.env.SHOPEE_SHOP_ID);
  
  // Check if access token is available
  if (!process.env.SHOPEE_ACCESS_TOKEN) {
    console.log('\n⚠️  No access token found!');
    console.log('\nTo get access token, run:');
    console.log('  node shopee-auth-demo.js   (Automated flow - Recommended)');
    console.log('  OR');
    console.log('  node shopee-auth-helper.js  (Manual flow)');
    console.log();
    process.exit(1);
  }
  
  console.log('  ✓ Access Token: ' + process.env.SHOPEE_ACCESS_TOKEN.substring(0, 20) + '...');
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

    console.log('✅ Connector created successfully\n');
    console.log('═'.repeat(60));

    // ==================== AUTHENTICATION ====================
    console.log('\n🔐 AUTHENTICATION FEATURES');
    console.log('═'.repeat(60));
    
    console.log('\n[Info] Authentication Methods Available:\n');
    console.log('  1. generateAuthUrl(redirectUrl)');
    console.log('     - Generate authorization URL for shop authorization');
    console.log('     - User must visit URL and authorize the app');
    console.log();
    
    console.log('  2. getAccessToken(code, shopId)');
    console.log('     - Exchange authorization code for access token');
    console.log('     - Code is obtained from authorization callback');
    console.log();
    
    console.log('  3. refreshAccessToken(refreshToken, shopId)');
    console.log('     - Refresh expired access token');
    console.log('     - Returns new access token and refresh token');
    console.log();
    
    // Demo: Generate auth URL
    console.log('─'.repeat(60));
    console.log('\n[Demo] Generating Authorization URL...\n');
    
    const demoRedirectUrl = 'https://www.example.com/callback';
    const demoAuthUrl = connector.generateAuthUrl(demoRedirectUrl);
    
    console.log('  Redirect URL:', demoRedirectUrl);
    console.log('  Authorization URL:');
    console.log('  ' + demoAuthUrl);
    console.log();
    console.log('  ℹ️  To actually authorize, run: node shopee-auth-demo.js');
    console.log();
    
    // Check if refresh token is available
    if (process.env.SHOPEE_REFRESH_TOKEN) {
      console.log('─'.repeat(60));
      console.log('\n[Demo] Token Refresh Available\n');
      console.log('  ✓ Refresh token found');
      console.log('  ℹ️  To test refresh: node shopee-get-token.js <code> <shop_id>');
      console.log();
    } else {
      console.log('─'.repeat(60));
      console.log('\n[Info] No refresh token in .env');
      console.log('  Run shopee-auth-demo.js to get refresh token');
      console.log();
    }

    // ==================== PRODUCTS ====================
    console.log('\n═'.repeat(60));
    console.log('📦 PRODUCT OPERATIONS');
    console.log('═'.repeat(60));

    // 1. Get products list
    console.log('\n[1] Fetching products list (limit: 5)...');
    try {
      const products = await connector.getProducts({ limit: 5 });
      console.log(`✓ Found ${products.length} products\n`);

      products.forEach((p, i) => {
        console.log(`  #${i + 1}`);
        console.log(`    ID: ${p.id}`);
        console.log(`    Name: ${p.name}`);
        console.log(`    Price: ${p.price} ${p.currency}`);
        console.log(`    Stock: ${p.stock}`);
        console.log(`    Status: ${p.status}`);
        if (p.sku) console.log(`    SKU: ${p.sku}`);
        console.log();
      });

      // 2. Get product detail
      if (products.length > 0) {
        const pid = products[0].id;
        console.log('─'.repeat(60));
        console.log(`\n[2] Fetching product detail for ID: ${pid}...`);
        try {
          const product = await connector.getProductById(pid);
          console.log('✓ Product detail retrieved\n');
          console.log('  Basic Info:');
          console.log(`    ID: ${product.id}`);
          console.log(`    Name: ${product.name}`);
          console.log(`    Description: ${product.description?.substring(0, 100)}...`);
          console.log(`    Price: ${product.price} ${product.currency}`);
          console.log(`    Stock: ${product.stock}`);
          console.log(`    Status: ${product.status}`);
          console.log(`    Category ID: ${product.categoryId || 'N/A'}`);
          console.log(`    Created: ${product.createdAt?.toISOString()}`);
          console.log(`    Updated: ${product.updatedAt?.toISOString()}`);

          if (product.images && product.images.length > 0) {
            console.log(`\n  Images: ${product.images.length} image(s)`);
          }

          if (product.platformSpecific) {
            console.log('\n  Platform-Specific Data Available:');
            if (product.platformSpecific.weight) {
              console.log(`    Weight: ${product.platformSpecific.weight}g`);
            }
            if (product.platformSpecific.dimension) {
              const d = product.platformSpecific.dimension;
              console.log(`    Dimensions: ${d.packageLength}x${d.packageWidth}x${d.packageHeight}cm`);
            }
            if (product.platformSpecific.brand) {
              console.log(`    Brand: ${product.platformSpecific.brand.originalBrandName}`);
            }
          }
          console.log();
        } catch (err) {
          console.error('  ❌ Error fetching product detail:', err.message);
        }
      }
    } catch (err) {
      console.error('❌ Error fetching products:', err.message);
      if (err.platformError) {
        console.error('Platform error:', JSON.stringify(err.platformError, null, 2));
      }
    }

    // ==================== ORDERS ====================
    console.log('\n═'.repeat(60));
    console.log('📋 ORDER OPERATIONS');
    console.log('═'.repeat(60));

    // 3. Get all orders (last 7 days)
    console.log('\n[3] Fetching all orders (last 7 days, limit: 10)...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const orders = await connector.getOrders({
        startDate: sevenDaysAgo,
        endDate: new Date(),
        limit: 10
      });

      console.log(`✓ Found ${orders.length} orders\n`);

      // Group orders by status
      const ordersByStatus = {};
      orders.forEach(o => {
        if (!ordersByStatus[o.status]) {
          ordersByStatus[o.status] = [];
        }
        ordersByStatus[o.status].push(o);
      });

      console.log('  Orders by Status:');
      Object.keys(ordersByStatus).forEach(status => {
        console.log(`    ${status}: ${ordersByStatus[status].length}`);
      });
      console.log();

      // Show order summary
      orders.slice(0, 5).forEach((o, i) => {
        console.log(`  #${i + 1}`);
        console.log(`    Order ID: ${o.id}`);
        console.log(`    Status: ${o.status}`);
        console.log(`    Total: ${o.totalAmount} ${o.currency}`);
        console.log(`    Items: ${o.items.length}`);
        console.log(`    Customer: ${o.customer.name}`);
        if (o.shippingAddress) {
          console.log(`    City: ${o.shippingAddress.city}`);
        }
        console.log(`    Created: ${o.createdAt.toISOString()}`);
        console.log();
      });

      // 4. Get orders by status
      console.log('─'.repeat(60));
      console.log('\n[4] Fetching READY_TO_SHIP orders...');
      try {
        const readyOrders = await connector.getOrders({
          startDate: sevenDaysAgo,
          endDate: new Date(),
          status: 'READY_TO_SHIP',
          limit: 10
        });
        console.log(`✓ Found ${readyOrders.length} ready to ship orders\n`);

        readyOrders.forEach((o, i) => {
          console.log(`  #${i + 1} ${o.orderNumber} - ${o.totalAmount} ${o.currency} - ${o.items.length} item(s)`);
        });
        console.log();
      } catch (err) {
        console.error('  ❌ Error fetching READY_TO_SHIP orders:', err.message);
      }

      // 5. Get detailed order
      if (orders.length > 0) {
        console.log('─'.repeat(60));
        const oid = orders[0].id;
        console.log(`\n[5] Fetching detailed order info for: ${oid}...`);
        try {
          const order = await connector.getOrderById(oid);
          console.log('✓ Order detail retrieved\n');

          console.log('  Order Information:');
          console.log(`    Order Number: ${order.orderNumber}`);
          console.log(`    Status: ${order.status}`);
          console.log(`    Total Amount: ${order.totalAmount} ${order.currency}`);
          console.log(`    Created: ${order.createdAt.toISOString()}`);
          console.log(`    Updated: ${order.updatedAt?.toISOString()}`);

          console.log('\n  Customer:');
          console.log(`    ID: ${order.customer.id}`);
          console.log(`    Name: ${order.customer.name}`);

          if (order.shippingAddress) {
            console.log('\n  Shipping Address:');
            console.log(`    Name: ${order.shippingAddress.fullName}`);
            console.log(`    Phone: ${order.shippingAddress.phone}`);
            console.log(`    Address: ${order.shippingAddress.addressLine1}`);
            if (order.shippingAddress.addressLine2) {
              console.log(`             ${order.shippingAddress.addressLine2}`);
            }
            console.log(`    City: ${order.shippingAddress.city}`);
            if (order.shippingAddress.state) {
              console.log(`    State: ${order.shippingAddress.state}`);
            }
            console.log(`    Postal Code: ${order.shippingAddress.postalCode || 'N/A'}`);
            console.log(`    Country: ${order.shippingAddress.country || 'N/A'}`);
          }

          console.log(`\n  Order Items (${order.items.length}):`);
          order.items.forEach((item, idx) => {
            console.log(`    ${idx + 1}. ${item.productName}`);
            console.log(`       Product ID: ${item.productId}`);
            console.log(`       SKU: ${item.sku || 'N/A'}`);
            console.log(`       Quantity: ${item.quantity}`);
            console.log(`       Price: ${item.price}`);
          });

          // Platform-specific data
          if (order.platformSpecific) {
            const ps = order.platformSpecific;
            console.log('\n  Extended Information:');

            if (ps.paymentMethod) {
              console.log(`    Payment Method: ${ps.paymentMethod}`);
            }

            if (ps.shippingCarrier) {
              console.log(`    Shipping Carrier: ${ps.shippingCarrier}`);
            }

            if (ps.estimatedShippingFee !== undefined) {
              console.log(`    Estimated Shipping Fee: ${ps.estimatedShippingFee}`);
            }

            if (ps.actualShippingFee !== undefined) {
              console.log(`    Actual Shipping Fee: ${ps.actualShippingFee}`);
            }

            if (ps.note) {
              console.log(`    Note: ${ps.note}`);
            }

            if (ps.dropshipper) {
              console.log(`    Dropshipper: ${ps.dropshipper}`);
              if (ps.dropshipperPhone) {
                console.log(`    Dropshipper Phone: ${ps.dropshipperPhone}`);
              }
            }

            // Payment breakdown
            if (ps.paymentInfo) {
              console.log('\n  Payment Breakdown:');
              const pi = ps.paymentInfo;
              if (pi.originalPrice) console.log(`    Original Price: ${pi.originalPrice}`);
              if (pi.sellerDiscount) console.log(`    Seller Discount: -${pi.sellerDiscount}`);
              if (pi.platformDiscount) console.log(`    Platform Discount: -${pi.platformDiscount}`);
              if (pi.voucherFromSeller) console.log(`    Voucher (Seller): -${pi.voucherFromSeller}`);
              if (pi.voucherFromShopee) console.log(`    Voucher (Shopee): -${pi.voucherFromShopee}`);
              if (pi.shippingFee) console.log(`    Shipping Fee: ${pi.shippingFee}`);
              if (pi.buyerPaidAmount) console.log(`    Buyer Paid Amount: ${pi.buyerPaidAmount}`);
            }

            // Package tracking
            if (ps.packageList && ps.packageList.length > 0) {
              console.log(`\n  Package Tracking (${ps.packageList.length}):`);
              ps.packageList.forEach((pkg, idx) => {
                console.log(`    Package #${idx + 1}:`);
                console.log(`      Tracking Number: ${pkg.packageNumber}`);
                console.log(`      Status: ${pkg.logisticsStatus}`);
                console.log(`      Carrier: ${pkg.shippingCarrier}`);
                if (pkg.itemList) {
                  console.log(`      Items: ${pkg.itemList.length}`);
                }
              });
            }

            // Cancellation info
            if (ps.cancelReason) {
              console.log('\n  Cancellation Info:');
              console.log(`    Cancelled By: ${ps.cancelBy || 'N/A'}`);
              console.log(`    Reason: ${ps.cancelReason}`);
              if (ps.buyerCancelReason) {
                console.log(`    Buyer Reason: ${ps.buyerCancelReason}`);
              }
            }
          }
          console.log();
        } catch (err) {
          console.error('  ❌ Error fetching order detail:', err.message);
          if (err.platformError) {
            console.error('  Platform error:', JSON.stringify(err.platformError, null, 2));
          }
        }
      }
    } catch (err) {
      console.error('❌ Error fetching orders:', err.message);
      if (err.platformError) {
        console.error('Platform error:', JSON.stringify(err.platformError, null, 2));
      }
    }

    console.log('\n═'.repeat(60));
    console.log('✅ Shopee demo completed successfully!');
    console.log('═'.repeat(60));
    console.log('\nAll features tested:');
    console.log('  ✓ Get products list');
    console.log('  ✓ Get product detail');
    console.log('  ✓ Get all orders');
    console.log('  ✓ Get orders by status');
    console.log('  ✓ Get detailed order information');
    console.log('  ✓ Access platform-specific data');
    console.log('  ✓ Payment breakdown');
    console.log('  ✓ Package tracking\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message || error);
    if (error.code) console.error('Error code:', error.code);
    if (error.statusCode) console.error('Status code:', error.statusCode);
    if (error.platformError) {
      console.error('\nPlatform error details:');
      console.error(JSON.stringify(error.platformError, null, 2));
    }
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  }
}

shopeeDemo().catch(err => {
  console.error('\n❌ Unhandled error:', err);
  console.error(err.stack);
  process.exit(1);
});
