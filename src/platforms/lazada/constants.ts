/**
 * Lazada Platform Constants
 * All constants, enums, and API endpoints for Lazada integration
 */

// ============================================================================
// ENUMS - Order Status
// ============================================================================

export enum LazadaOrderStatus {
  UNPAID = 'unpaid',
  PENDING = 'pending',
  PACKED = 'packed',
  READY_TO_SHIP = 'ready_to_ship',
  READY_TO_SHIP_PENDING = 'ready_to_ship_pending',
  SHIPPED = 'shipped',
  FAILED_DELIVERY = 'failed_delivery',
  DELIVERED = 'delivered',
  CONFIRMED = 'confirmed',
  LOST_BY_3PL = 'lost_by_3pl',
  DAMAGED_BY_3PL = 'damaged_by_3pl',
  RETURNED = 'returned',
  CANCELED = 'canceled',
  SHIPPED_BACK = 'shipped_back',
  SHIPPED_BACK_SUCCESS = 'shipped_back_success',
  SHIPPED_BACK_FAILED = 'shipped_back_failed',
  PACKED_SCRAPPED = 'packed_scrapped',
}

export enum LazadaProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DELETED = 'deleted',
}

// ============================================================================
// ENUMS - Return/Reverse Status
// ============================================================================

export enum LazadaReverseStatus {
  REQUEST_INITIATE = 'REQUEST_INITIATE',
  REQUEST_REJECT = 'REQUEST_REJECT',
  REQUEST_CANCEL = 'REQUEST_CANCEL',
  CANCEL_SUCCESS = 'CANCEL_SUCCESS',
  REFUND_PENDING = 'REFUND_PENDING',
  REFUND_AUTHORIZED = 'REFUND_AUTHORIZED',
  REFUND_SUCCESS = 'REFUND_SUCCESS',
  REFUND_REJECT = 'REFUND_REJECT',
  REQUEST_COMPLETE = 'REQUEST_COMPLETE',
  SELLER_AGREE_RETURN = 'SELLER_AGREE_RETURN',
  SELLER_REJECT_RETURN = 'SELLER_REJECT_RETURN',
  BUYER_RETURN_ITEM = 'BUYER_RETURN_ITEM',
  SELLER_AGREE_REFUND = 'SELLER_AGREE_REFUND',
  SELLER_REJECT_REFUND = 'SELLER_REJECT_REFUND',
  CS_APPROVING = 'CS_APPROVING',
  AGREE_CANCEL_ORDER = 'AGREE_CANCEL_ORDER',
  REJECT_CANCEL_ORDER = 'REJECT_CANCEL_ORDER',
}

// ============================================================================
// ENUMS - Webhook Types
// ============================================================================

export enum LazadaWebhookType {
  ORDER = 0,
  AUTH_EXPIRE = 8,
  REVERSE = 10,
  FULFILLMENT = 14,
  PRODUCT = 21,
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export enum LazadaApiPath {
  // Authentication
  FETCH_TOKEN = '/auth/token/create',
  REFRESH_TOKEN = '/auth/token/refresh',

  // Product Management
  PRODUCT_GET = '/products/get',
  PRODUCT_ITEM_GET = '/product/item/get',
  CREATE_PRODUCT = '/product/create',
  UPDATE_PRODUCT = '/product/update',
  UPDATE_SELLABLE_QUANTITY = '/product/stock/sellable/update',
  UPDATE_PRICE = '/product/price_quantity/update',

  // Category & Attributes
  CATEGORY_TREE = '/category/tree/get',
  CATEGORY_ATTRIBUTES = '/category/attributes/get',
  BRANDS_GET = '/brands/get',

  // Order Management
  ORDERS_GET = '/orders/get',
  SINGLE_ORDER_GET = '/order/get',
  SINGLE_ORDER_ITEM_GET = '/order/items/get',
  SET_STATUS_TO_PACKED = '/order/pack',
  FULFILL_PACK = '/order/fulfill/pack',
  READY_TO_SHIP = '/order/package/rts',
  TRACE_ORDER = '/logistic/order/trace',

  // Returns
  REVERSE_LIST = '/reverse/getreverseordersforseller',
  REVERSE_DETAIL = '/order/reverse/return/detail/list',

  // Logistics
  SHIPMENT_PROVIDERS = '/order/shipment/providers/get',
  SHIPPING_LABEL_GET = '/order/document/awb/pdf/get',
  SHIPPING_LABEL_V2 = '/order/package/document/get',

  // Reviews
  HISTORY_REVIEW = '/review/seller/history/list',
  REVIEW_LIST = '/review/seller/list/v2',

  // Utilities
  STREAM_S3 = '/stream-s3',
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const LAZADA_CONSTANTS = {
  ALGORITHM: 'sha256' as const,
  DIGEST: 'hex' as const,
  
  // Endpoints
  ENDPOINT: 'https://api.lazada.com/rest',
  ENDPOINT_VN: 'https://api.lazada.vn/rest',
  ENDPOINT_SG: 'https://api.lazada.sg/rest',
  ENDPOINT_MY: 'https://api.lazada.com.my/rest',
  ENDPOINT_TH: 'https://api.lazada.co.th/rest',
  ENDPOINT_PH: 'https://api.lazada.com.ph/rest',
  ENDPOINT_ID: 'https://api.lazada.co.id/rest',
  ENDPOINT_AUTH: 'https://auth.lazada.com/oauth/authorize',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  
  // Rate Limits
  RATE_LIMIT_PER_SECOND: 10,
  RATE_LIMIT_PER_DAY: 10000,
  
  // Response Codes
  SUCCESS_CODE: '0',
  
  // Review Settings
  BUYER_USERNAME: 'Khách hàng đánh giá',
  MAX_RANGE_CAN_BE_REVIEW: 12, // weeks
  TIME_RANGE_EXCEED: 7, // days
  
  // Order Settings
  DROP_SHIP: 'dropship',
} as const;

// ============================================================================
// COUNTRY CODES
// ============================================================================

export enum LazadaCountryCode {
  VIETNAM = 'vn',
  SINGAPORE = 'sg',
  MALAYSIA = 'my',
  THAILAND = 'th',
  PHILIPPINES = 'ph',
  INDONESIA = 'id',
}

// ============================================================================
// ERROR CODES
// ============================================================================

export enum LazadaErrorCode {
  SUCCESS = '0',
  INVALID_SIGNATURE = 'E001',
  INVALID_TOKEN = 'E002',
  TOKEN_EXPIRED = 'E003',
  PERMISSION_DENIED = 'E004',
  INVALID_PARAMETER = 'E005',
  ITEM_NOT_FOUND = 'E006',
  RATE_LIMIT_EXCEEDED = 'E007',
  SYSTEM_ERROR = 'E999',
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type LazadaEndpoint = 
  | typeof LAZADA_CONSTANTS.ENDPOINT
  | typeof LAZADA_CONSTANTS.ENDPOINT_VN
  | typeof LAZADA_CONSTANTS.ENDPOINT_SG
  | typeof LAZADA_CONSTANTS.ENDPOINT_MY
  | typeof LAZADA_CONSTANTS.ENDPOINT_TH
  | typeof LAZADA_CONSTANTS.ENDPOINT_PH
  | typeof LAZADA_CONSTANTS.ENDPOINT_ID;

export interface LazadaApiConfig {
  appKey: string;
  appSecret: string;
  accessToken?: string;
  refreshToken?: string;
  countryCode?: LazadaCountryCode;
  sandbox?: boolean;
  timeout?: number;
}

// ============================================================================
// QUALITY CONTROL STATUSES
// ============================================================================

export enum LazadaQualityControlStatus {
  SELLER_QC = 'seller_qc',
  PLATFORM_QC = 'platform_qc',
  LIVE = 'live',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

// ============================================================================
// SHIPMENT TYPES
// ============================================================================

export enum LazadaShipmentType {
  STANDARD = 'standard',
  BULKY = 'bulky',
  DROPSHIP = 'dropship',
  PICKUP = 'pickup',
}

// ============================================================================
// IMAGE QUALITY
// ============================================================================

export enum LazadaImageQuality {
  CATALOG = 'catalog',
  DETAIL = 'detail',
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  OrderStatus: LazadaOrderStatus,
  ProductStatus: LazadaProductStatus,
  ReverseStatus: LazadaReverseStatus,
  WebhookType: LazadaWebhookType,
  ApiPath: LazadaApiPath,
  CountryCode: LazadaCountryCode,
  ErrorCode: LazadaErrorCode,
  QualityControlStatus: LazadaQualityControlStatus,
  ShipmentType: LazadaShipmentType,
  ImageQuality: LazadaImageQuality,
  Constants: LAZADA_CONSTANTS,
};
