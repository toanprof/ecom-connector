export interface IProduct {
  id: number;
  name: string;
  description?: string;
  price?: number; // in cents or smallest currency unit
  stock?: number;
  model_id?: number | null;
  raw?: any; // raw response for debugging
}

export interface IOrder {
  order_sn: string;
  create_time?: number;
  update_time?: number;
  total_amount?: number;
  status?: string;
  items?: Array<{ item_id: number; model_id?: number; name?: string; quantity?: number }>;
  raw?: any;
}

export interface IReturn {
  return_sn: string;
  order_sn?: string;
  reason?: string;
  status?: string;
  images?: string[];
  raw?: any;
}
