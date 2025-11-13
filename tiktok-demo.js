require('dotenv').config();
const { createEcomConnector } = require('./dist');

async function tiktokShopDemo() {
  console.log('\n========================================');
  console.log('    TikTok Shop Demo - ecom-connector');
  console.log('========================================\n');

  // Kiểm tra credentials
  if (!process.env.TIKTOK_APP_KEY || !process.env.TIKTOK_APP_SECRET || !process.env.TIKTOK_SHOP_ID) {
    console.error('❌ Thiếu thông tin TikTok Shop trong file .env!');
    console.log('\nVui lòng cấu hình trong file .env:');
    console.log('  TIKTOK_APP_KEY=your_app_key');
    console.log('  TIKTOK_APP_SECRET=your_app_secret');
    console.log('  TIKTOK_SHOP_ID=your_shop_id');
    console.log('  TIKTOK_ACCESS_TOKEN=your_access_token (optional)\n');
    process.exit(1);
  }

  console.log('✓ Đã tìm thấy thông tin TikTok Shop credentials');
  console.log('✓ App Key:', process.env.TIKTOK_APP_KEY.substring(0, 10) + '...');
  console.log('✓ Shop ID:', process.env.TIKTOK_SHOP_ID);
  console.log();

  try {
    // Tạo connector
    console.log('🔌 Đang kết nối với TikTok Shop...\n');
    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey: process.env.TIKTOK_APP_KEY,
        appSecret: process.env.TIKTOK_APP_SECRET,
        shopId: process.env.TIKTOK_SHOP_ID,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      },
      timeout: 30000,
    });

    console.log('✅ Kết nối thành công!\n');

    // 1. Lấy danh sách sản phẩm
    console.log('📦 [1] Đang lấy danh sách sản phẩm...');
    console.log('-'.repeat(40));
    try {
      const products = await connector.getProducts({ 
        limit: 5,
        page: 1 
      });
      
      console.log(`✓ Tìm thấy ${products.length} sản phẩm\n`);
      
      if (products.length > 0) {
        products.forEach((product, index) => {
          console.log(`Sản phẩm ${index + 1}:`);
          console.log(`  • ID: ${product.id}`);
          console.log(`  • Tên: ${product.name}`);
          console.log(`  • Giá: ${product.price} ${product.currency}`);
          console.log(`  • Tồn kho: ${product.stock}`);
          console.log(`  • Trạng thái: ${product.status}`);
          console.log(`  • SKU: ${product.sku || 'N/A'}`);
          console.log();
        });

        // 2. Lấy chi tiết sản phẩm đầu tiên
        const firstProductId = products[0].id;
        console.log(`🔍 [2] Đang lấy chi tiết sản phẩm ID: ${firstProductId}...`);
        console.log('-'.repeat(40));
        
        try {
          const productDetail = await connector.getProductById(firstProductId);
          console.log('✓ Chi tiết sản phẩm:');
          console.log(JSON.stringify(productDetail, null, 2));
          console.log();
        } catch (error) {
          console.error(`✗ Lỗi khi lấy chi tiết sản phẩm: ${error.message}\n`);
        }
      } else {
        console.log('ℹ️  Không có sản phẩm nào trong shop\n');
      }
    } catch (error) {
      console.error(`✗ Lỗi khi lấy danh sách sản phẩm: ${error.message}\n`);
      if (error.code) console.error(`   Mã lỗi: ${error.code}`);
      if (error.statusCode) console.error(`   HTTP Status: ${error.statusCode}`);
    }

    // 3. Lấy danh sách đơn hàng
    console.log('📋 [3] Đang lấy danh sách đơn hàng...');
    console.log('-'.repeat(40));
    try {
      const orders = await connector.getOrders({ 
        limit: 5,
        page: 1 
      });
      
      console.log(`✓ Tìm thấy ${orders.length} đơn hàng\n`);
      
      if (orders.length > 0) {
        orders.forEach((order, index) => {
          console.log(`Đơn hàng ${index + 1}:`);
          console.log(`  • ID: ${order.id}`);
          console.log(`  • Mã đơn: ${order.orderNumber}`);
          console.log(`  • Trạng thái: ${order.status}`);
          console.log(`  • Tổng tiền: ${order.totalAmount} ${order.currency}`);
          console.log(`  • Khách hàng: ${order.customer.name}`);
          console.log(`  • Số lượng sản phẩm: ${order.items.length}`);
          console.log(`  • Ngày tạo: ${order.createdAt.toLocaleString('vi-VN')}`);
          console.log();
        });

        // 4. Lấy chi tiết đơn hàng đầu tiên
        const firstOrderId = orders[0].id;
        console.log(`🔍 [4] Đang lấy chi tiết đơn hàng ID: ${firstOrderId}...`);
        console.log('-'.repeat(40));
        
        try {
          const orderDetail = await connector.getOrderById(firstOrderId);
          console.log('✓ Chi tiết đơn hàng:');
          console.log(`  • Mã đơn: ${orderDetail.orderNumber}`);
          console.log(`  • Trạng thái: ${orderDetail.status}`);
          console.log(`  • Tổng tiền: ${orderDetail.totalAmount} ${orderDetail.currency}`);
          console.log(`  • Khách hàng: ${orderDetail.customer.name}`);
          if (orderDetail.customer.phone) {
            console.log(`  • Số điện thoại: ${orderDetail.customer.phone}`);
          }
          if (orderDetail.customer.email) {
            console.log(`  • Email: ${orderDetail.customer.email}`);
          }
          console.log(`  • Sản phẩm:`);
          orderDetail.items.forEach((item, idx) => {
            console.log(`    ${idx + 1}. ${item.productName}`);
            console.log(`       - Số lượng: ${item.quantity}`);
            console.log(`       - Giá: ${item.price}`);
          });
          console.log();
        } catch (error) {
          console.error(`✗ Lỗi khi lấy chi tiết đơn hàng: ${error.message}\n`);
        }
      } else {
        console.log('ℹ️  Không có đơn hàng nào\n');
      }
    } catch (error) {
      console.error(`✗ Lỗi khi lấy danh sách đơn hàng: ${error.message}\n`);
      if (error.code) console.error(`   Mã lỗi: ${error.code}`);
      if (error.statusCode) console.error(`   HTTP Status: ${error.statusCode}`);
    }

    console.log('========================================');
    console.log('✅ Demo hoàn tất!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ LỖI NGHIÊM TRỌNG:', error.message);
    if (error.code) {
      console.error('Mã lỗi:', error.code);
    }
    if (error.statusCode) {
      console.error('HTTP Status:', error.statusCode);
    }
    if (error.platformError) {
      console.error('Chi tiết lỗi từ platform:', JSON.stringify(error.platformError, null, 2));
    }
    console.log();
    process.exit(1);
  }
}

// Chạy demo
tiktokShopDemo().catch(error => {
  console.error('Lỗi không xác định:', error);
  process.exit(1);
});
