/**
 * TikTok Shop Platform Constants
 * All constants, enums, and API endpoints for TikTok Shop integration
 */

// ============================================================================
// ENUMS - Order Status
// ============================================================================

export enum TikTokOrderStatus {
  UNPAID = 100,
  ON_HOLD = 105,
  AWAITING_SHIPMENT = 111,
  AWAITING_COLLECTION = 112,
  PARTIALLY_SHIPPING = 114,
  IN_TRANSIT = 121,
  DELIVERED = 122,
  COMPLETED = 130,
  CANCELLED = 140,
}

export enum TikTokProductStatus {
  DRAFT = 1,
  PENDING = 2,
  FAILED = 3,
  LIVE = 4,
  SELLER_DEACTIVATED = 5,
  PLATFORM_DEACTIVATED = 6,
  FREEZE = 7,
  DELETED = 8,
}

export enum TikTokProductStatusString {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

// ============================================================================
// ENUMS - Return/Reverse Status
// ============================================================================

export enum TikTokReverseOrderStatus {
  AFTERSALE_APPLYING = 1,
  AFTERSALE_REJECT_APPLICATION = 2,
  AFTERSALE_RETURNING = 3,
  AFTERSALE_BUYER_SHIPPED = 4,
  AFTERSALE_SELLER_REJECT_RECEIVE = 5,
  AFTERSALE_SUCCESS = 50,
  CANCEL_SUCCESS = 51,
  CLOSED = 99,
  COMPLETE = 100,
}

export enum TikTokReverseType {
  CANCEL = 1,
  REFUND_ONLY = 2,
  RETURN_AND_REFUND = 3,
  REQUEST_CANCEL = 4,
}

export enum TikTokReverseEventType {
  ORDER_REQUEST_CANCEL = 'ORDER_REQUEST_CANCEL',
  ORDER_RETURN = 'ORDER_RETURN',
  ORDER_REFUND = 'ORDER_REFUND',
}

export enum TikTokReverseUser {
  BUYER = 1,
  SELLER = 2,
  OPERATOR = 3,
  SYSTEM = 4,
}

export enum TikTokUser {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  SYSTEM = 'SYSTEM',
}

// ============================================================================
// ENUMS - Webhook Types
// ============================================================================

export enum TikTokWebhookType {
  ORDER_STATUS = 1,
  RETURN_STATUS = 2,
  CANCEL_STATUS = 3,
  ADDRESS_UPDATE = 4,
  PACKAGE_UPDATE = 5,
  PRODUCT_STATUS = 6,
  SELLER_DEAUTHORIZE = 7,
  AUTH_EXPIRE = 8,
}

// ============================================================================
// ENUMS - Document Types
// ============================================================================

export enum TikTokDocumentType {
  PACKING_SLIP = 'PACKING_SLIP',
  SHIPPING_LABEL = 'SHIPPING_LABEL',
  SHIPPING_LABEL_PICTURE = 'SHIPPING_LABEL_PICTURE',
  SHIPPING_LABEL_AND_PACKING_SLIP = 'SHIPPING_LABEL_AND_PACKING_SLIP',
}

// ============================================================================
// API ENDPOINTS - Legacy (v1)
// ============================================================================

export enum TikTokApiPath {
  // Authentication
  GENERATE_AUTH_LINK = '/oauth/authorize',
  FETCH_TOKEN_AUTH = '/api/token/getAccessToken',
  REFRESH_TOKEN = '/api/token/refreshToken',
  GET_AUTHORIZED = '/api/shop/get_authorized_shop',

  // Orders
  ORDER_LIST = '/api/orders/search',
  ORDER_DETAIL = '/api/orders/detail/query',

  // Products
  PRODUCT_LIST = '/api/products/search',
  PRODUCT_DETAIL = '/api/products/details',
  UPDATE_STOCK = '/api/products/stocks',
  UPDATE_PRICE = '/api/products/prices',
  ACTIVE_PRODUCT = '/api/products/activate',
  DEACTIVE_PRODUCT = '/api/products/inactivated_products',

  // Fulfillment
  SHIP_ORDER = '/api/order/rts',
  FULFILLMENT_DETAIL = '/api/fulfillment/detail',
  SHIPPING_DOCUMENT = '/api/logistics/shipping_document',
  SHIPPING_INFO = '/api/logistics/ship/get',

  // Returns
  REVERSE_LIST = '/api/reverse/reverse_order/list',
}

// ============================================================================
// API ENDPOINTS - v2 (202309)
// ============================================================================

export enum TikTokApiPathV2 {
  // Authentication
  GENERATE_AUTH_LINK = '/open',
  FETCH_TOKEN = '/api/v2/token/get',
  REFRESH_TOKEN = '/api/v2/token/refresh',
  AUTHORIZED_SHOP = '/authorization/202309/shops',

  // Orders
  ORDER_LIST = '/order/202309/orders/search',
  ORDER_DETAIL = '/order/202309/orders/{order_id}',

  // Products
  PRODUCT_LIST = '/product/202309/products/search',
  PRODUCT_DETAIL = '/product/202309/products/{product_id}',
  CATEGORIES = '/product/202309/categories',
  CATEGORY_RULE = '/product/202309/categories/{category_id}/rules',
  BRANDS = '/product/202309/brands',
  ATTRIBUTES = '/product/202309/categories/{category_id}/attributes',
  PRODUCT_IMAGE = '/product/202309/images/upload',
  CREATE_PRODUCT = '/product/202309/products',
  UPDATE_PRODUCT = '/product/202309/products/{product_id}',
  ACTIVE_PRODUCT = '/product/202309/products/activate',
  DEACTIVE_PRODUCT = '/product/202309/products/deactivate',

  // Fulfillment
  PACKAGE_TIME_SLOT = '/fulfillment/202309/packages/{package_id}/handover_time_slots',
  SHIP_PACKAGE = '/fulfillment/202309/packages/{package_id}/ship',
  PACKAGE_SHIPPING_DOCUMENT = '/fulfillment/202309/packages/{package_id}/shipping_documents',
}

// ============================================================================
// PATH PLACEHOLDERS
// ============================================================================

export enum TikTokPathPlaceholder {
  CATEGORY = '{category_id}',
  PACKAGE = '{package_id}',
  PRODUCT = '{product_id}',
  ORDER = '{order_id}',
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const TIKTOK_CONSTANTS = {
  ALGORITHM: 'sha256' as const,
  DIGEST: 'hex' as const,
  
  // Endpoints
  ENDPOINT: 'https://open-api.tiktokglobalshop.com',
  ENDPOINT_SANDBOX: 'https://open-api-sandbox.tiktokglobalshop.com',
  ENDPOINT_AUTH: 'https://auth.tiktok-shops.com',
  ENDPOINT_AUTH_SANDBOX: 'https://auth-sandbox.tiktok-shops.com',
  ENDPOINT_AUTH_V2: 'https://services.tiktokshop.com/open/authorize',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  
  // Rate Limits
  RATE_LIMIT_PER_SECOND: 10,
  RATE_LIMIT_PER_DAY: 10000,
  
  // Response Codes
  SUCCESS_CODE: 0,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum TikTokErrorCode {
  SUCCESS = 0,
  INVALID_SIGNATURE = 10001,
  INVALID_TOKEN = 10002,
  TOKEN_EXPIRED = 10003,
  PERMISSION_DENIED = 10004,
  INVALID_PARAMETER = 10005,
  ITEM_NOT_FOUND = 10006,
  RATE_LIMIT_EXCEEDED = 10007,
  SYSTEM_ERROR = 99999,
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type TikTokEndpoint = 
  | typeof TIKTOK_CONSTANTS.ENDPOINT 
  | typeof TIKTOK_CONSTANTS.ENDPOINT_SANDBOX;

export type TikTokAuthEndpoint = 
  | typeof TIKTOK_CONSTANTS.ENDPOINT_AUTH 
  | typeof TIKTOK_CONSTANTS.ENDPOINT_AUTH_SANDBOX;

export interface TikTokApiConfig {
  appKey: string;
  appSecret: string;
  accessToken?: string;
  shopId?: string;
  sandbox?: boolean;
  timeout?: number;
}

// ============================================================================
// HANDOVER METHODS
// ============================================================================

export enum TikTokHandoverMethod {
  PICKUP = 'PICKUP',
  DROP_OFF = 'DROP_OFF',
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  OrderStatus: TikTokOrderStatus,
  ProductStatus: TikTokProductStatus,
  ProductStatusString: TikTokProductStatusString,
  ReverseOrderStatus: TikTokReverseOrderStatus,
  ReverseType: TikTokReverseType,
  ReverseEventType: TikTokReverseEventType,
  ReverseUser: TikTokReverseUser,
  User: TikTokUser,
  WebhookType: TikTokWebhookType,
  DocumentType: TikTokDocumentType,
  ApiPath: TikTokApiPath,
  ApiPathV2: TikTokApiPathV2,
  PathPlaceholder: TikTokPathPlaceholder,
  ErrorCode: TikTokErrorCode,
  HandoverMethod: TikTokHandoverMethod,
  Constants: TIKTOK_CONSTANTS,
};
