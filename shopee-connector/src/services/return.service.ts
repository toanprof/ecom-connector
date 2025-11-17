import ShopeeClient, { ShopeeApiError } from '../../api/shopee-client.js';
import { IReturn } from '../../types/common.types.js';

export class ReturnService {
  private client: ShopeeClient;

  constructor(client: ShopeeClient) {
    this.client = client;
  }

  private mapToReturn(raw: any): IReturn {
    return {
      return_sn: raw.return_sn || raw.return_id,
      order_sn: raw.order_sn,
      reason: raw.reason,
      status: raw.status,
      images: raw.images || [],
      raw,
    } as IReturn;
  }

  public async getReturnList(params: { page_no: number; page_size: number }): Promise<IReturn[]> {
    try {
      const queryParams = {
        page_no: params.page_no,
        page_size: params.page_size,
      };
      const resp = await this.client.request('get', 'returns/get_return_list', undefined, queryParams);

      const returns = resp?.response?.return_list || [];
      return returns.map((r: any) => this.mapToReturn(r));
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async confirmReturn(returnSn: string): Promise<any> {
    try {
      const resp = await this.client.request('post', 'returns/confirm', undefined, { return_sn: returnSn });
      return resp;
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async disputeReturn(returnSn: string, reason: string, images?: string[]): Promise<any> {
    try {
      const queryParams: any = { return_sn: returnSn, reason };
      if (images) queryParams.images = images.join(',');
      const resp = await this.client.request('post', 'returns/dispute', undefined, queryParams);
      return resp;
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }
}

export default ReturnService;
