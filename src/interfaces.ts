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
  status: "active" | "inactive" | "out_of_stock";
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
  status?: "active" | "inactive";
  platformSpecific?: any;
}

export interface ProductQueryOptions {
  limit?: number;
  offset?: number;
  page?: number;
  status?: string | string[]; // Single status or multiple statuses (e.g., ['NORMAL', 'BANNED'])
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
export type PlatformType = "zalo-oa" | "tiktok-shop" | "shopee" | "lazada";

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
   * Get products with pagination info (Shopee only)
   * @returns Products with pagination metadata
   */
  getProductsWithPagination?(options?: ProductQueryOptions): Promise<{
    products: Product[];
    totalCount: number;
    hasNextPage: boolean;
    nextOffset: number;
  }>;

  /**
   * Get all products with automatic pagination (Shopee only)
   * @param options - Query options
   * @param maxItems - Maximum items to fetch (default: no limit)
   * @returns All products
   */
  getAllProducts?(
    options?: { status?: string },
    maxItems?: number
  ): Promise<Product[]>;

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
  updateProduct(
    id: string,
    productData: Partial<ProductInput>
  ): Promise<Product>;

  /**
   * Get a list of orders
   */
  getOrders(options?: OrderQueryOptions): Promise<Order[]>;

  /**
   * Get orders with pagination info (Shopee only)
   * @returns Orders with pagination metadata
   */
  getOrdersWithPagination?(options?: OrderQueryOptions): Promise<{
    orders: Order[];
    more: boolean;
    nextCursor?: string;
  }>;

  /**
   * Get all orders with automatic pagination (Shopee only)
   * @param options - Query options
   * @param maxItems - Maximum items to fetch (default: no limit)
   * @returns All orders
   */
  getAllOrders?(
    options?: OrderQueryOptions,
    maxItems?: number
  ): Promise<Order[]>;

  /**
   * Get a single order by ID
   */
  getOrderById(id: string): Promise<Order>;

  /**
   * Update order status
   */
  updateOrderStatus(id: string, status: string): Promise<Order>;

  /**
   * Generate authorization URL
   * @param redirectUrl - Redirect URL after authorization
   * @param uuid - UUID for Lazada (optional)
   */
  generateAuthUrl?(redirectUrl: string, uuid?: string): string;

  /**
   * Get access token using authorization code
   * @param code - Authorization code
   * @param shopIdOrUuid - Shop ID for Shopee/TikTok or UUID for Lazada
   * @param mainAccountId - Main Account ID for Shopee (optional)
   */
  getAccessToken?(
    code: string,
    shopIdOrUuid?: string,
    mainAccountId?: string
  ): Promise<any>;

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @param shopId - Shop ID (optional, for Shopee)
   * @param mainAccountId - Main Account ID (optional, for Shopee)
   */
  refreshAccessToken?(
    refreshToken: string,
    shopId?: string,
    mainAccountId?: string
  ): Promise<any>;
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
    this.name = "EcomConnectorError";
    Object.setPrototypeOf(this, EcomConnectorError.prototype);
  }
}
