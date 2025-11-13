export interface ZaloOAProductResponse {
  error: number;
  message: string;
  data: {
    products: ZaloOAProduct[];
    total: number;
  };
}

export interface ZaloOAProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  status: number;
  created_time: number;
  updated_time: number;
}

export interface ZaloOAOrderResponse {
  error: number;
  message: string;
  data: {
    orders: ZaloOAOrder[];
    total: number;
  };
}

export interface ZaloOAOrder {
  id: string;
  order_code: string;
  status: number;
  total_amount: number;
  items: ZaloOAOrderItem[];
  customer: {
    user_id: string;
    name: string;
    phone: string;
  };
  created_time: number;
}

export interface ZaloOAOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}
