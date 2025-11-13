import { createEcomConnector } from '../src';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function shopeeExample() {
  console.log('\n=== Shopee Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'shopee',
      credentials: {
        partnerId: process.env.SHOPEE_PARTNER_ID!,
        partnerKey: process.env.SHOPEE_PARTNER_KEY!,
        shopId: process.env.SHOPEE_SHOP_ID!,
        accessToken: process.env.SHOPEE_ACCESS_TOKEN,
      },
      sandbox: true,
    });

    // Get products
    console.log('Fetching products...');
    const products = await connector.getProducts({ limit: 5 });
    console.log(`Found ${products.length} products`);
    console.log('First product:', JSON.stringify(products[0], null, 2));

    // Get orders
    console.log('\nFetching orders...');
    const orders = await connector.getOrders({ limit: 5 });
    console.log(`Found ${orders.length} orders`);
    if (orders.length > 0) {
      console.log('First order:', JSON.stringify(orders[0], null, 2));
    }
  } catch (error: any) {
    console.error('Shopee Error:', error.message);
  }
}

async function tiktokExample() {
  console.log('\n=== TikTok Shop Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'tiktok-shop',
      credentials: {
        appKey: process.env.TIKTOK_APP_KEY!,
        appSecret: process.env.TIKTOK_APP_SECRET!,
        shopId: process.env.TIKTOK_SHOP_ID!,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN,
      },
    });

    // Get products
    console.log('Fetching products...');
    const products = await connector.getProducts({ limit: 5 });
    console.log(`Found ${products.length} products`);
    
    // Get specific product
    if (products.length > 0) {
      const productId = products[0].id;
      console.log(`\nFetching product ${productId}...`);
      const product = await connector.getProductById(productId);
      console.log('Product details:', JSON.stringify(product, null, 2));
    }
  } catch (error: any) {
    console.error('TikTok Shop Error:', error.message);
  }
}

async function zaloExample() {
  console.log('\n=== Zalo OA Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'zalo-oa',
      credentials: {
        appId: process.env.ZALO_APP_ID!,
        secretKey: process.env.ZALO_SECRET_KEY!,
        accessToken: process.env.ZALO_ACCESS_TOKEN,
      },
    });

    // Create a new product
    console.log('Creating a new product...');
    const newProduct = await connector.createProduct({
      name: 'Test Product',
      description: 'This is a test product',
      price: 99.99,
      stock: 100,
      sku: 'TEST-SKU-001',
      images: ['https://example.com/image.jpg'],
    });
    console.log('Created product:', JSON.stringify(newProduct, null, 2));

    // Update the product
    console.log('\nUpdating product...');
    const updatedProduct = await connector.updateProduct(newProduct.id, {
      price: 89.99,
      stock: 150,
    });
    console.log('Updated product:', JSON.stringify(updatedProduct, null, 2));
  } catch (error: any) {
    console.error('Zalo OA Error:', error.message);
  }
}

async function lazadaExample() {
  console.log('\n=== Lazada Example ===\n');
  
  try {
    const connector = createEcomConnector({
      platform: 'lazada',
      credentials: {
        appKey: process.env.LAZADA_APP_KEY!,
        appSecret: process.env.LAZADA_APP_SECRET!,
        accessToken: process.env.LAZADA_ACCESS_TOKEN!,
      },
    });

    // Get orders
    console.log('Fetching orders...');
    const orders = await connector.getOrders({ 
      limit: 10,
      status: 'pending'
    });
    console.log(`Found ${orders.length} orders`);
    
    // Get specific order
    if (orders.length > 0) {
      const orderId = orders[0].id;
      console.log(`\nFetching order ${orderId}...`);
      const order = await connector.getOrderById(orderId);
      console.log('Order details:', JSON.stringify(order, null, 2));
    }
  } catch (error: any) {
    console.error('Lazada Error:', error.message);
  }
}

async function switchPlatformExample() {
  console.log('\n=== Platform Switching Example ===\n');
  
  // Easy switching between platforms with the same interface
  const platforms = [
    {
      name: 'Shopee',
      config: {
        platform: 'shopee' as const,
        credentials: {
          partnerId: process.env.SHOPEE_PARTNER_ID!,
          partnerKey: process.env.SHOPEE_PARTNER_KEY!,
          shopId: process.env.SHOPEE_SHOP_ID!,
        },
      },
    },
    {
      name: 'TikTok Shop',
      config: {
        platform: 'tiktok-shop' as const,
        credentials: {
          appKey: process.env.TIKTOK_APP_KEY!,
          appSecret: process.env.TIKTOK_APP_SECRET!,
          shopId: process.env.TIKTOK_SHOP_ID!,
        },
      },
    },
  ];

  for (const platform of platforms) {
    try {
      console.log(`\nConnecting to ${platform.name}...`);
      const connector = createEcomConnector(platform.config);
      
      const products = await connector.getProducts({ limit: 3 });
      console.log(`${platform.name}: Found ${products.length} products`);
    } catch (error: any) {
      console.error(`${platform.name} Error:`, error.message);
    }
  }
}

// Main execution
async function main() {
  console.log('='.repeat(60));
  console.log('E-Commerce Connector Examples');
  console.log('='.repeat(60));

  // Run examples based on available environment variables
  if (process.env.SHOPEE_PARTNER_ID) {
    await shopeeExample();
  }

  if (process.env.TIKTOK_APP_KEY) {
    await tiktokExample();
  }

  if (process.env.ZALO_APP_ID) {
    await zaloExample();
  }

  if (process.env.LAZADA_APP_KEY) {
    await lazadaExample();
  }

  // Always run the switching example
  await switchPlatformExample();

  console.log('\n' + '='.repeat(60));
  console.log('Examples completed!');
  console.log('='.repeat(60) + '\n');
}

// Run the examples
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
