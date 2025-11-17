import ShopeeClient, { ShopeeApiError } from '../../api/shopee-client.js';
import { IOrder } from '../../types/common.types.js';

export class OrderService {
  private client: ShopeeClient;

  constructor(client: ShopeeClient) {
    this.client = client;
  }

  private mapToOrder(raw: any): IOrder {
    return {
      order_sn: raw.order_sn || raw.ordersn || raw.order_id,
      create_time: raw.create_time,
      update_time: raw.update_time,
      total_amount: raw.total_amount || raw.total_price || undefined,
      status: raw.order_status || raw.status || undefined,
      items: raw.items || raw.order_detail || undefined,
      raw,
    } as IOrder;
  }

  public async getOrders(params: { 
    time_range_field: 'create_time' | 'update_time'; 
    from: number; 
    to: number;
    page_size?: number;
    cursor?: string;
    order_status?: 'UNPAID' | 'READY_TO_SHIP' | 'PROCESSED' | 'SHIPPED' | 'TO_CONFIRM_RECEIVE' | 'IN_CANCEL' | 'CANCELLED' | 'TO_RETURN' | 'COMPLETED' | 'INVOICE_PENDING';
    response_optional_fields?: string;
    request_order_status_pending?: boolean;
    logistics_channel_id?: number;
  }): Promise<IOrder[]> {
    try {
      const queryParams: any = {
        time_range_field: params.time_range_field,
        time_from: params.from,
        time_to: params.to,
        page_size: params.page_size || 100,
      };

      if (params.cursor) queryParams.cursor = params.cursor;
      if (params.order_status) queryParams.order_status = params.order_status;
      if (params.response_optional_fields) queryParams.response_optional_fields = params.response_optional_fields;
      if (typeof params.request_order_status_pending !== 'undefined') queryParams.request_order_status_pending = params.request_order_status_pending;
      if (params.logistics_channel_id) queryParams.logistics_channel_id = params.logistics_channel_id;

      const resp = await this.client.request('get', 'order/get_order_list', undefined, queryParams);
      const orders = resp?.response?.order_list || [];
      return orders.map((o: any) => this.mapToOrder(o));
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async getOrderDetail(
    orderSnList: string[],
    options?: {
      response_optional_fields?: string;
      request_order_status_pending?: boolean;
    }
  ): Promise<IOrder[]> {
    try {
      const queryParams: any = { 
        order_sn_list: orderSnList.join(',')
      };
      
      if (options?.response_optional_fields) {
        queryParams.response_optional_fields = options.response_optional_fields;
      }
      if (typeof options?.request_order_status_pending !== 'undefined') {
        queryParams.request_order_status_pending = options.request_order_status_pending;
      }

      const resp = await this.client.request('get', 'order/get_order_detail', undefined, queryParams);
      const orders = resp?.response?.order_list || [];
      return orders.map((o: any) => this.mapToOrder(o));
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async initiateShipping(orderSn: string, packageNumber?: string): Promise<any> {
    try {
      const queryParams: any = { order_sn: orderSn };
      if (packageNumber) queryParams.package_number = packageNumber;

      const resp = await this.client.request('post', 'logistics/ship_order', undefined, queryParams);
      return resp;
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }
}

export default OrderService;
