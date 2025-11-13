export interface LazadaProductResponse {
  code: string;
  data: {
    products: LazadaProduct[];
    total_products: number;
  };
}

export interface LazadaProduct {
  item_id: number;
  attributes: {
    name: string;
    description: string;
    price: number;
    quantity: number;
    SellerSku: string;
    Images: {
      Image: string[];
    };
    status: string;
  };
  skus: LazadaSku[];
  created_time: string;
  updated_time: string;
}

export interface LazadaSku {
  SkuId: number;
  SellerSku: string;
  quantity: number;
  price: number;
  special_price: number;
  Status: string;
}

export interface LazadaOrderResponse {
  code: string;
  data: {
    orders: LazadaOrder[];
    count: number;
  };
}

export interface LazadaOrder {
  order_id: number;
  order_number: string;
  statuses: string[];
  price: string;
  items: LazadaOrderItem[];
  address_billing: {
    first_name: string;
    last_name: string;
    phone: string;
    address1: string;
    address2: string;
    city: string;
    post_code: string;
    country: string;
  };
  customer_first_name: string;
  customer_last_name: string;
  created_at: string;
  updated_at: string;
}

export interface LazadaOrderItem {
  order_item_id: number;
  shop_sku: string;
  name: string;
  paid_price: number;
  sku: string;
  variation: string;
  purchase_order_id: string;
  purchase_order_number: string;
}
