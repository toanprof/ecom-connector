export interface TikTokShopProductResponse {
  code: number;
  message: string;
  data: {
    products: TikTokShopProduct[];
    total: number;
  };
}

export interface TikTokShopProduct {
  id: string;
  title: string;
  description: string;
  price: {
    amount: string;
    currency: string;
  };
  skus: Array<{
    id: string;
    seller_sku: string;
    quantity: number;
  }>;
  images: Array<{
    url: string;
  }>;
  status: string;
  create_time: number;
  update_time: number;
}

export interface TikTokShopOrderResponse {
  code: number;
  message: string;
  data: {
    orders: TikTokShopOrder[];
    total: number;
  };
}

export interface TikTokShopOrder {
  id: string;
  order_status: string;
  payment_info: {
    total_amount: string;
    currency: string;
  };
  line_items: TikTokShopOrderItem[];
  recipient_address: {
    name: string;
    phone: string;
    address_line1: string;
    address_line2: string;
    city: string;
    state: string;
    postal_code: string;
    region_code: string;
  };
  buyer_info: {
    id: string;
    name: string;
    email: string;
  };
  create_time: number;
  update_time: number;
}

export interface TikTokShopOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  sale_price: string;
  sku_id: string;
}
