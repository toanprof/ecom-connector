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
  description?: string;
  price?: number;
  stock?: number;
  item_sku: string;
  images?: string[];
  category_id: number;
  item_status: string;
  create_time: number;
  update_time: number;
  
  // New nested structure from Shopee API v2
  price_info?: Array<{
    currency: string;
    original_price: number;
    current_price: number;
  }>;
  
  image?: {
    image_id_list: string[];
    image_url_list: string[];
    image_ratio?: string;
  };
  
  stock_info_v2?: {
    summary_info: {
      total_reserved_stock: number;
      total_available_stock: number;
    };
    seller_stock?: any[];
    shopee_stock?: any[];
    advance_stock?: {
      sellable_advance_stock: number;
      in_transit_advance_stock: number;
    };
  };
  
  description_info?: {
    extended_description?: {
      field_list: Array<{
        field_type?: string;
        text?: string;
      }>;
    };
  };
  
  weight?: string;
  dimension?: {
    package_length: number;
    package_width: number;
    package_height: number;
  };
  
  logistic_info?: Array<{
    logistic_id: number;
    logistic_name: string;
    enabled: boolean;
    size_id?: number;
    is_free?: boolean;
    estimated_shipping_fee?: number;
  }>;
  
  pre_order?: {
    is_pre_order: boolean;
    days_to_ship: number;
  };
  
  condition?: string;
  has_model?: boolean;
  brand?: {
    brand_id: number;
    original_brand_name: string;
  };
  
  complaint_policy?: any;
  description_type?: string;
  gtin_code?: string;
  has_promotion?: boolean;
  promotion_id?: number;
  item_dangerous?: number;
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
  buyer_username?: string;
  recipient_address?: {
    name: string;
    phone: string;
    full_address: string;
    city: string;
    state: string;
    zipcode: string;
    country: string;
    town?: string;
    district?: string;
    region?: string;
  };
  create_time: number;
  update_time: number;
  
  // Optional fields from response_optional_fields
  estimated_shipping_fee?: number;
  actual_shipping_fee?: number;
  actual_shipping_fee_confirmed?: boolean;
  goods_to_declare?: boolean;
  note?: string;
  note_update_time?: number;
  pay_time?: number;
  payment_method?: string;
  
  // Dropshipper info
  dropshipper?: string;
  dropshipper_phone?: string;
  
  // Shipping info
  split_up?: boolean;
  shipping_carrier?: string;
  pickup_done_time?: number;
  
  // Cancellation info
  buyer_cancel_reason?: string;
  cancel_by?: string;
  cancel_reason?: string;
  
  // Additional info
  buyer_cpf_id?: string;
  fulfillment_flag?: string;
  invoice_data?: any;
  order_chargeable_weight_gram?: number;
  return_request_due_date?: number;
  edt?: number; // Estimated delivery time
  
  // Package and logistics
  package_list?: Array<{
    package_number: string;
    logistics_status: string;
    shipping_carrier: string;
    item_list: Array<{
      item_id: number;
      model_id: number;
    }>;
  }>;
  
  // Payment info structure
  payment_info?: {
    buyer_paid_amount?: number;
    original_price?: number;
    total_amount?: number;
    shipping_fee?: number;
    tax?: number;
    seller_discount?: number;
    platform_discount?: number;
    coin_cashback?: number;
    voucher_from_seller?: number;
    voucher_from_shopee?: number;
    buyer_transaction_fee?: number;
    seller_loss_compensation?: number;
    actual_shipping_fee?: number;
    seller_coin_cashback?: number;
    escrow_amount?: number;
    buyer_service_fee?: number;
    seller_service_fee?: number;
    credit_card_promotion?: number;
  };
}

export interface ShopeeOrderItem {
  item_id: number;
  item_name: string;
  model_quantity_purchased: number;
  model_original_price: number;
  item_sku: string;
  model_id?: number;
  model_name?: string;
  model_sku?: string;
  model_discounted_price?: number;
  product_location_id?: string[];
  is_add_on_deal?: boolean;
  is_main_item?: boolean;
  add_on_deal_id?: number;
  promotion_type?: string;
  promotion_id?: number;
  weight?: number;
  image_info?: {
    image_url?: string;
  };
}
