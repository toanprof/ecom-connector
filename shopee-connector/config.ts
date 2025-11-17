import dotenv from 'dotenv';

dotenv.config();

export const config = {
  partnerId: process.env.SHOPEE_PARTNER_ID || '',
  partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
  shopId: process.env.SHOPEE_SHOP_ID || '',
  accessToken: process.env.SHOPEE_ACCESS_TOKEN || '',
  apiUrl: process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com/api/v2',
};

export default config;
