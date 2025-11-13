export interface ShopeeProductResponse {
  error: string;
  message: string;
  response: {
    item_list: ShopeeProduct[];
    total_count: number;
  };
}

export interface ShopeeProduct {
  item_id: number;
  item_name: string;
  description: string;
  price: number;
  stock: number;
  item_sku: string;
  images: string[];
  category_id: number;
  item_status: string;
  create_time: number;
  update_time: number;
}

export interface ShopeeOrderResponse {
  error: string;
  message: string;
  response: {
    order_list: ShopeeOrder[];
    more: boolean;
  };
}

export interface ShopeeOrder {
  order_sn: string;
  order_status: string;
  total_amount: number;
  currency: string;
  item_list: ShopeeOrderItem[];
  buyer_user_id: number;
  buyer_username: string;
  recipient_address: {
    name: string;
    phone: string;
    full_address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
  };
  create_time: number;
  update_time: number;
}

export interface ShopeeOrderItem {
  item_id: number;
  item_name: string;
  model_quantity_purchased: number;
  model_original_price: number;
  item_sku: string;
}
