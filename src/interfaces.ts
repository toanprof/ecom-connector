// Common data interfaces
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  stock: number;
  sku?: string;
  images?: string[];
  categoryId?: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt?: Date;
  updatedAt?: Date;
  platformSpecific?: any; // Platform-specific data
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  sku?: string;
  images?: string[];
  categoryId?: string;
  status?: 'active' | 'inactive';
  platformSpecific?: any;
}

export interface ProductQueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  categoryId?: string;
  search?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  currency: string;
  items: OrderItem[];
  customer: Customer;
  shippingAddress?: Address;
  createdAt: Date;
  updatedAt?: Date;
  platformSpecific?: any;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  sku?: string;
}

export interface OrderQueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  platformSpecific?: any;
}

export interface Address {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
}

// Configuration interfaces
export type PlatformType = 'zalo-oa' | 'tiktok-shop' | 'shopee' | 'lazada';

export interface ZaloOACredentials {
  appId: string;
  secretKey: string;
  accessToken?: string;
}

export interface TikTokShopCredentials {
  appKey: string;
  appSecret: string;
  shopId: string;
  accessToken?: string;
}

export interface ShopeeCredentials {
  partnerId: string;
  partnerKey: string;
  shopId: string;
  accessToken?: string;
}

export interface LazadaCredentials {
  appKey: string;
  appSecret: string;
  accessToken?: string;
}

export type PlatformCredentials = 
  | ZaloOACredentials 
  | TikTokShopCredentials 
  | ShopeeCredentials 
  | LazadaCredentials;

export interface EcomConnectorConfig {
  platform: PlatformType;
  credentials: PlatformCredentials;
  sandbox?: boolean;
  timeout?: number;
}

// Main platform interface
export interface ECommercePlatform {
  /**
   * Get a list of products
   */
  getProducts(options?: ProductQueryOptions): Promise<Product[]>;

  /**
   * Get a single product by ID
   */
  getProductById(id: string): Promise<Product>;

  /**
   * Create a new product
   */
  createProduct(productData: ProductInput): Promise<Product>;

  /**
   * Update an existing product
   */
  updateProduct(id: string, productData: Partial<ProductInput>): Promise<Product>;

  /**
   * Get a list of orders
   */
  getOrders(options?: OrderQueryOptions): Promise<Order[]>;

  /**
   * Get a single order by ID
   */
  getOrderById(id: string): Promise<Order>;

  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: string): Promise<Order>;

  /**
   * Generate authorization URL (Shopee only)
   */
  generateAuthUrl?(redirectUrl: string): string;

  /**
   * Get access token using authorization code (Shopee only)
   * @param code - Authorization code
   * @param shopId - Shop ID (use either shopId or mainAccountId)
   * @param mainAccountId - Main Account ID (use either shopId or mainAccountId)
   */
  getAccessToken?(
    code: string,
    shopId?: string,
    mainAccountId?: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expire_in: number;
    shop_id?: number;
    main_account_id?: number;
    partner_id: number;
  }>;

  /**
   * Refresh access token (Shopee only)
   * @param refreshToken - Refresh token
   * @param shopId - Shop ID (use either shopId or mainAccountId)
   * @param mainAccountId - Main Account ID (use either shopId or mainAccountId)
   */
  refreshAccessToken?(
    refreshToken: string,
    shopId?: string,
    mainAccountId?: string
  ): Promise<{
    access_token: string;
    refresh_token: string;
    expire_in: number;
    shop_id?: number;
    main_account_id?: number;
    partner_id: number;
  }>;
}

// Custom error class
export class EcomConnectorError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public platformError?: any
  ) {
    super(message);
    this.name = 'EcomConnectorError';
    Object.setPrototypeOf(this, EcomConnectorError.prototype);
  }
}
