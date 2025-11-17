import crypto from 'crypto';

export function createSignature(
  partnerId: number | string,
  apiPath: string,
  timestamp: number | string,
  partnerKey: string,
  accessToken?: string,
  shopId?: number | string
): string {
  let baseString = `${partnerId}${apiPath}${timestamp}`;
  
  // Shop-level API: add access_token and shop_id to base string
  if (accessToken && shopId) {
    baseString += `${accessToken}${shopId}`;
  }
  
  return crypto.createHmac('sha256', partnerKey).update(baseString).digest('hex');
}

export default createSignature;
