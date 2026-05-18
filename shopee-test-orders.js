require("dotenv").config();
const { createEcomConnector } = require("./dist");

/**
 * Test Shopee getAllOrders with multiple order statuses
 */
async function testShopeeOrders() {
  console.log("========================================");
  console.log("   Shopee Orders Test - Multiple Status");
  console.log("========================================\n");

  // Configuration
  const config = {
    platform: "shopee",
    credentials: {
      partnerId: process.env.SHOPEE_PARTNER_ID,
      partnerKey: process.env.SHOPEE_PARTNER_KEY,
      shopId: process.env.SHOPEE_SHOP_ID,
      accessToken: process.env.SHOPEE_ACCESS_TOKEN,
    },
    sandbox: true,
  };

  console.log("📋 Shopee Configuration:");
  console.log(`   Partner ID: ${config.credentials.partnerId}`);
  console.log(`   Shop ID: ${config.credentials.shopId}`);
  console.log(`   Sandbox Mode: ${config.sandbox}`);
  console.log(`   Access Token: ${config.credentials.accessToken ? "****" + config.credentials.accessToken.slice(-8) : "Not set"}\n`);

  try {
    const shopee = createEcomConnector(config);
    console.log("✅ Shopee connector created\n");

    // Test 1: Get orders with single status
    console.log("═══════════════════════════════════════");
    console.log("📋 TEST 1: Single Order Status");
    console.log("═══════════════════════════════════════\n");

    const singleStatusOptions = {
      status: "READY_TO_SHIP",
      limit: 10,
    };

    console.log("Options:", JSON.stringify(singleStatusOptions, null, 2));

    try {
      const singleStatusOrders = await shopee.getOrders(singleStatusOptions);
      console.log(`✅ Found ${singleStatusOrders.length} orders with status: READY_TO_SHIP`);
      
      if (singleStatusOrders.length > 0) {
        const sample = singleStatusOrders[0];
        console.log("\n📦 Sample Order:");
        console.log(`   Order ID: ${sample.id}`);
        console.log(`   Status: ${sample.status}`);
        console.log(`   Total: ${sample.totalAmount} ${sample.currency}`);
        console.log(`   Items: ${sample.items.length}`);
        console.log(`   Created: ${sample.createdAt.toISOString()}`);
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    // Test 2: Get orders with multiple statuses (array)
    console.log("\n═══════════════════════════════════════");
    console.log("📋 TEST 2: Multiple Order Statuses (Array)");
    console.log("═══════════════════════════════════════\n");

    const multiStatusOptions = {
      status: ["UNPAID", "READY_TO_SHIP", "PROCESSED"],
      limit: 20,
    };

    console.log("Options:", JSON.stringify(multiStatusOptions, null, 2));

    try {
      const multiStatusOrders = await shopee.getOrders(multiStatusOptions);
      console.log(`✅ Found ${multiStatusOrders.length} orders with multiple statuses`);
      
      // Group orders by status
      const ordersByStatus = multiStatusOrders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      console.log("\n📊 Orders by Status:");
      Object.entries(ordersByStatus).forEach(([status, count]) => {
        console.log(`   ${status}: ${count} orders`);
      });

      if (multiStatusOrders.length > 0) {
        console.log("\n📦 Sample Orders:");
        multiStatusOrders.slice(0, 3).forEach((order, index) => {
          console.log(`\n   Order ${index + 1}:`);
          console.log(`   - ID: ${order.id}`);
          console.log(`   - Status: ${order.status}`);
          console.log(`   - Total: ${order.totalAmount} ${order.currency}`);
          console.log(`   - Items: ${order.items.length}`);
        });
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    // Test 3: Get all orders with pagination (multiple statuses)
    console.log("\n═══════════════════════════════════════");
    console.log("📋 TEST 3: getAllOrders with Multiple Statuses");
    console.log("═══════════════════════════════════════\n");

    const getAllOptions = {
      status: ["UNPAID", "READY_TO_SHIP", "PROCESSED", "SHIPPED"],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      endDate: new Date(),
    };

    console.log("Options:", JSON.stringify({
      status: getAllOptions.status,
      startDate: getAllOptions.startDate.toISOString(),
      endDate: getAllOptions.endDate.toISOString(),
    }, null, 2));

    try {
      console.log("\n⏳ Fetching all orders (with automatic pagination)...");
      const allOrders = await shopee.getAllOrders(getAllOptions, 100); // Max 100 for demo
      
      console.log(`✅ Retrieved ${allOrders.length} total orders`);

      // Detailed statistics
      const stats = {
        totalOrders: allOrders.length,
        byStatus: {},
        totalAmount: 0,
        currencies: new Set(),
        dateRange: {
          earliest: null,
          latest: null,
        },
      };

      allOrders.forEach((order) => {
        // Count by status
        stats.byStatus[order.status] = (stats.byStatus[order.status] || 0) + 1;
        
        // Sum total amount
        stats.totalAmount += order.totalAmount || 0;
        
        // Track currencies
        stats.currencies.add(order.currency);
        
        // Track date range
        if (!stats.dateRange.earliest || order.createdAt < stats.dateRange.earliest) {
          stats.dateRange.earliest = order.createdAt;
        }
        if (!stats.dateRange.latest || order.createdAt > stats.dateRange.latest) {
          stats.dateRange.latest = order.createdAt;
        }
      });

      console.log("\n📊 Order Statistics:");
      console.log(`   Total Orders: ${stats.totalOrders}`);
      console.log(`   Total Amount: ${stats.totalAmount.toFixed(2)} ${[...stats.currencies][0] || 'N/A'}`);
      
      console.log("\n   Orders by Status:");
      Object.entries(stats.byStatus)
        .sort((a, b) => b[1] - a[1])
        .forEach(([status, count]) => {
          const percentage = ((count / stats.totalOrders) * 100).toFixed(1);
          console.log(`   - ${status}: ${count} (${percentage}%)`);
        });

      if (stats.dateRange.earliest && stats.dateRange.latest) {
        console.log("\n   Date Range:");
        console.log(`   - Earliest: ${stats.dateRange.earliest.toISOString()}`);
        console.log(`   - Latest: ${stats.dateRange.latest.toISOString()}`);
      }

      // Show recent orders
      if (allOrders.length > 0) {
        console.log("\n📦 Recent Orders (last 5):");
        allOrders
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 5)
          .forEach((order, index) => {
            console.log(`\n   ${index + 1}. Order ${order.orderNumber}`);
            console.log(`      Status: ${order.status}`);
            console.log(`      Total: ${order.totalAmount} ${order.currency}`);
            console.log(`      Items: ${order.items.length}`);
            console.log(`      Customer: ${order.customer?.name || 'N/A'}`);
            console.log(`      Created: ${order.createdAt.toISOString()}`);
          });
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      if (error.platformError) {
        console.error("   Platform Error:", JSON.stringify(error.platformError, null, 2));
      }
    }

    // Test 4: getOrdersWithPagination (manual pagination)
    console.log("\n═══════════════════════════════════════");
    console.log("📋 TEST 4: Manual Pagination with Multiple Statuses");
    console.log("═══════════════════════════════════════\n");

    try {
      const paginationOptions = {
        status: ["READY_TO_SHIP", "PROCESSED"],
        limit: 5,
      };

      console.log("Page 1 Options:", JSON.stringify(paginationOptions, null, 2));
      
      const page1 = await shopee.getOrdersWithPagination(paginationOptions);
      console.log(`✅ Page 1: ${page1.orders.length} orders`);
      console.log(`   Has More: ${page1.more}`);
      console.log(`   Next Cursor: ${page1.nextCursor || "N/A"}`);

      if (page1.orders.length > 0) {
        console.log("\n   Orders:");
        page1.orders.forEach((order, index) => {
          console.log(`   ${index + 1}. ${order.id} - ${order.status} - ${order.totalAmount} ${order.currency}`);
        });
      }

      // Fetch page 2 if available
      if (page1.more && page1.nextCursor) {
        console.log("\n⏳ Fetching page 2...");
        const page2 = await shopee.getOrdersWithPagination({
          ...paginationOptions,
          cursor: page1.nextCursor,
        });
        
        console.log(`✅ Page 2: ${page2.orders.length} orders`);
        console.log(`   Has More: ${page2.more}`);
        
        if (page2.orders.length > 0) {
          console.log("\n   Orders:");
          page2.orders.forEach((order, index) => {
            console.log(`   ${index + 1}. ${order.id} - ${order.status} - ${order.totalAmount} ${order.currency}`);
          });
        }
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    // Test 5: Date range filtering with statuses
    console.log("\n═══════════════════════════════════════");
    console.log("📋 TEST 5: Date Range + Multiple Statuses");
    console.log("═══════════════════════════════════════\n");

    try {
      const dateRangeOptions = {
        status: ["UNPAID", "READY_TO_SHIP"],
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        endDate: new Date(),
        limit: 15,
      };

      console.log("Options:", JSON.stringify({
        status: dateRangeOptions.status,
        startDate: dateRangeOptions.startDate.toISOString(),
        endDate: dateRangeOptions.endDate.toISOString(),
        limit: dateRangeOptions.limit,
      }, null, 2));

      const recentOrders = await shopee.getOrders(dateRangeOptions);
      console.log(`✅ Found ${recentOrders.length} orders in last 7 days`);

      if (recentOrders.length > 0) {
        const byStatus = recentOrders.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});

        console.log("\n📊 Distribution:");
        Object.entries(byStatus).forEach(([status, count]) => {
          console.log(`   ${status}: ${count} orders`);
        });

        console.log("\n📦 Orders:");
        recentOrders.slice(0, 5).forEach((order, index) => {
          const daysAgo = Math.floor((Date.now() - order.createdAt.getTime()) / (24 * 60 * 60 * 1000));
          console.log(`   ${index + 1}. ${order.id}`);
          console.log(`      Status: ${order.status}`);
          console.log(`      Created: ${daysAgo} day(s) ago`);
          console.log(`      Total: ${order.totalAmount} ${order.currency}`);
        });
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }

    console.log("\n═══════════════════════════════════════");
    console.log("✅ All Tests Completed!");
    console.log("═══════════════════════════════════════\n");

  } catch (error) {
    console.error("\n❌ Fatal Error:", error.message);
    if (error.stack) {
      console.error("\nStack Trace:");
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Shopee Order Status Reference
console.log("📚 Shopee Order Status Reference:");
console.log("   - UNPAID: Order created but not paid");
console.log("   - READY_TO_SHIP: Paid and ready for shipping");
console.log("   - PROCESSED: Arranged shipment");
console.log("   - SHIPPED: Package shipped");
console.log("   - TO_CONFIRM_RECEIVE: Delivered, waiting confirmation");
console.log("   - IN_CANCEL: Cancellation in progress");
console.log("   - CANCELLED: Order cancelled");
console.log("   - TO_RETURN: Return requested");
console.log("   - COMPLETED: Order completed");
console.log("");

// Run the test
testShopeeOrders();
