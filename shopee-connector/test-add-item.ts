import dotenv from 'dotenv';
import { shopeeProductService } from './src/index.js';

dotenv.config();

async function testAddItem() {
  try {
    console.log('=== Step 1: Upload Image ===');
    
    // Upload ảnh từ URL (ảnh phải accessible publicly)
    const imageUrl = 'https://cf.shopee.vn/file/d659b9ec7c80fab4e5ad60f8ac0b75ab'; // Sample image
    console.log('Uploading image from URL:', imageUrl);
    
    const uploadResult = await shopeeProductService.uploadImage(imageUrl);
    console.log('✅ Image uploaded!');
    console.log('Image ID:', uploadResult.image_id);
    console.log('Image URL:', uploadResult.image_url);
    console.log();

    console.log('=== Step 2: Create Item ===');
    
    // Dữ liệu sản phẩm mẫu
    const newItem = {
      original_price: 150000,
      description: 'Đây là sản phẩm test được tạo từ API',
      item_name: 'Sản phẩm Test API ' + Date.now(),
      item_sku: 'SKU-TEST-' + Date.now(),
      category_id: 300047,
      image: {
        image_id_list: [uploadResult.image_id],
      },
      weight: 0.5,
      dimension: {
        package_length: 20,
        package_width: 15,
        package_height: 5,
      },
      logistic_info: [
        {
          logistic_id: 51022,
          enabled: true,
        },
      ],
      pre_order: {
        is_pre_order: false,
        days_to_ship: 2,
      },
      condition: 'NEW' as const,
    };

    console.log('Creating new item...');

    const result = await shopeeProductService.addItem(newItem);

    console.log('✅ Item created successfully!');
    console.log('New Item ID:', result.item_id);
    console.log('\nFull response:');
    console.log(JSON.stringify(result.raw, null, 2));

  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    console.error('Message:', error.message);
    if (error.error_code) console.error('Error Code:', error.error_code);
    if (error.request_id) console.error('Request ID:', error.request_id);
  }
}

testAddItem();
