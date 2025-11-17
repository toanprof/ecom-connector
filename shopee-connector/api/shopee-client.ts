import axios, { AxiosInstance, Method } from 'axios';
import { createSignature } from '../utils/signature.js';

export class ShopeeApiError extends Error {
  public error_code?: number | string;
  public request_id?: string;

  constructor(message: string, error_code?: number | string, request_id?: string) {
    super(message);
    this.name = 'ShopeeApiError';
    this.error_code = error_code;
    this.request_id = request_id;
  }
}

export interface ShopeeClientOptions {
  partnerId: number | string;
  partnerKey: string;
  shopId: number | string;
  accessToken: string;
  apiUrl: string;
}

export class ShopeeClient {
  private axios: AxiosInstance;
  private partnerId: number | string;
  private partnerKey: string;
  private shopId: number | string;
  private accessToken: string;
  private apiUrl: string;
  private pathPrefix: string; // pathname of apiUrl

  constructor(opts: ShopeeClientOptions) {
    this.partnerId = opts.partnerId;
    this.partnerKey = opts.partnerKey;
    this.shopId = opts.shopId;
    this.accessToken = opts.accessToken;
    this.apiUrl = opts.apiUrl.replace(/\/$/, '');
    this.axios = axios.create({ baseURL: this.apiUrl, timeout: 15000 });

    try {
      const u = new URL(this.apiUrl);
      this.pathPrefix = u.pathname.replace(/\/$/, '');
    } catch (e) {
      this.pathPrefix = '';
    }
  }

  private buildFullApiPath(apiPath: string) {
    const p = apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
    return `${this.pathPrefix}${p}`; // includes any /api/v2 prefix from base URL
  }

  public async request<T = any>(method: Method, apiPath: string, data?: any, params?: Record<string, any>): Promise<T> {
    const timestamp = Math.floor(Date.now() / 1000);
    const fullApiPath = this.buildFullApiPath(apiPath);
    const signature = createSignature(
      this.partnerId,
      fullApiPath,
      timestamp,
      this.partnerKey,
      this.accessToken,
      this.shopId
    );

    const headers = {
      'Content-Type': 'application/json',
    };

    // Merge query params with partner_id, timestamp, shop_id, access_token, and sign
    const query = Object.assign({}, params || {}, {
      partner_id: this.partnerId,
      timestamp,
      sign: signature,
      shop_id: this.shopId,
      access_token: this.accessToken,
    });

    // Build full URL for logging
    const queryString = new URLSearchParams(query as any).toString();
    const fullUrl = `${this.apiUrl}/${apiPath}?${queryString}`;
    console.log('\n🌐 Request URL:', fullUrl);
    console.log('📦 Method:', method.toUpperCase());
    console.log('🔑 Signature:', signature);

    try {
      const response = await this.axios.request({
        method,
        url: apiPath, // axios will combine with baseURL
        headers,
        params: query,
        data,
      });

      return response.data;
    } catch (err: any) {
      // Normalize and throw ShopeeApiError
      const resp = err?.response?.data;
      const status = err?.response?.status;
      const message = resp?.msg || resp?.message || err.message || 'Shopee API request failed';
      const error_code = resp?.error || resp?.error_code || status;
      const request_id = resp?.request_id || err?.response?.headers?.['x-request-id'];

      throw new ShopeeApiError(message, error_code, request_id);
    }
  }
}

export default ShopeeClient;
