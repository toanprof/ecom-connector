import dotenv from 'dotenv';
import { shopeeOrderService } from './src/index.js';

dotenv.config();

async function testGetOrders() {
  try {
    console.log('=== Test Get Orders with Filters ===\n');

    // Time range: 2 giờ trước đến 2 giờ sau
    const now = Math.floor(Date.now() / 1000);
    const twoHoursAgo = now - 2 * 60 * 60;
    const twoHoursLater = now + 2 * 60 * 60;

    console.log('Time range:');
    console.log('  From:', new Date(twoHoursAgo * 1000).toISOString());
    console.log('  To:', new Date(twoHoursLater * 1000).toISOString());
    console.log();

    // Test 1: Get all orders
    console.log('Test 1: Get all orders (no filter)');
    const allOrders = await shopeeOrderService.getOrders({
      time_range_field: 'create_time',
      from: twoHoursAgo,
      to: twoHoursLater,
      page_size: 20,
    });
    console.log('Total orders:', allOrders.length);
    console.log();

    // Test 2: Get READY_TO_SHIP orders
    console.log('Test 2: Get READY_TO_SHIP orders');
    const readyOrders = await shopeeOrderService.getOrders({
      time_range_field: 'create_time',
      from: twoHoursAgo,
      to: twoHoursLater,
      page_size: 20,
      order_status: 'READY_TO_SHIP',
      response_optional_fields: 'order_status',
      request_order_status_pending: true,
    });
    console.log('Total READY_TO_SHIP orders:', readyOrders.length);
    if (readyOrders.length > 0) {
      console.log('First order SN:', readyOrders[0].order_sn);
    }
    console.log();

    // Test 3: Get order details
    if (readyOrders.length > 0) {
      console.log('Test 3: Get Order Details');
      const orderSns = readyOrders.slice(0, 2).map(o => o.order_sn);
      console.log('Getting details for orders:', orderSns);
      
      const orderDetails = await shopeeOrderService.getOrderDetail(orderSns, {
        response_optional_fields: 'buyer_user_id,buyer_username,estimated_shipping_fee,recipient_address,actual_shipping_fee,goods_to_declare,note,note_update_time,item_list,pay_time,dropshipper,dropshipper_phone,split_up,buyer_cancel_reason,cancel_by,cancel_reason,actual_shipping_fee_confirmed,buyer_cpf_id,fulfillment_flag,pickup_done_time,package_list,shipping_carrier,payment_method,total_amount,buyer_username,invoice_data,order_chargeable_weight_gram,return_request_due_date,edt,payment_info',
        request_order_status_pending: true,
      });
      
      console.log('Total order details:', orderDetails.length);
      if (orderDetails.length > 0) {
        console.log('\nFirst order detail:');
        console.log(JSON.stringify(orderDetails[0], null, 2));
      }
    }

  } catch (error: any) {
    console.error('\n❌ Error occurred:');
    console.error('Message:', error.message);
    if (error.error_code) console.error('Error Code:', error.error_code);
    if (error.request_id) console.error('Request ID:', error.request_id);
  }
}

testGetOrders();
