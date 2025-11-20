/**
 * Shopee Platform Constants
 * All constants, enums, and API endpoints for Shopee integration
 */

// ============================================================================
// ENUMS - Order and Logistics Status
// ============================================================================

export enum ShopeeLogisticsStatus {
  LOGISTICS_NOT_STARTED = 'LOGISTICS_NOT_STARTED',
  LOGISTICS_REQUEST_CREATED = 'LOGISTICS_REQUEST_CREATED',
  LOGISTICS_PICKUP_DONE = 'LOGISTICS_PICKUP_DONE',
  LOGISTICS_PICKUP_RETRY = 'LOGISTICS_PICKUP_RETRY',
  LOGISTICS_PICKUP_FAILED = 'LOGISTICS_PICKUP_FAILED',
  LOGISTICS_DELIVERY_DONE = 'LOGISTICS_DELIVERY_DONE',
  LOGISTICS_DELIVERY_FAILED = 'LOGISTICS_DELIVERY_FAILED',
  LOGISTICS_REQUEST_CANCELED = 'LOGISTICS_REQUEST_CANCELED',
  LOGISTICS_COD_REJECTED = 'LOGISTICS_COD_REJECTED',
  LOGISTICS_READY = 'LOGISTICS_READY',
  LOGISTICS_INVALID = 'LOGISTICS_INVALID',
  LOGISTICS_LOST = 'LOGISTICS_LOST',
  LOGISTICS_PENDING_ARRANGE = 'LOGISTICS_PENDING_ARRANGE',
}

export enum ShopeeOrderStatus {
  UNPAID = 'UNPAID',
  PENDING = 'PENDING',
  READY_TO_SHIP = 'READY_TO_SHIP',
  PROCESSED = 'PROCESSED',
  SHIPPED = 'SHIPPED',
  TO_CONFIRM_RECEIVE = 'TO_CONFIRM_RECEIVE',
  COMPLETED = 'COMPLETED',
  IN_CANCEL = 'IN_CANCEL',
  CANCELLED = 'CANCELLED',
  INVOICE_PENDING = 'INVOICE_PENDING',
  RETRY_SHIP = 'RETRY_SHIP',
}

export enum ShopeeReturnStatus {
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  CANCELLED = 'CANCELLED',
  JUDGING = 'JUDGING',
  REFUND_PAID = 'REFUND_PAID',
  CLOSED = 'CLOSED',
  PROCESSING = 'PROCESSING',
  SELLER_DISPUTE = 'SELLER_DISPUTE',
}

export enum ShopeeReturnSolution {
  RETURN_REFUND = 'RETURN_REFUND',
  REFUND = 'REFUND',
}

export enum ShopeeShippingDocumentType {
  THERMAL_AIR_WAYBILL = 'THERMAL_AIR_WAYBILL',
  NORMAL_AIR_WAYBILL = 'NORMAL_AIR_WAYBILL',
}

export enum ShopeeShippingDocumentStatus {
  FAILED = 'FAILED',
  READY = 'READY',
  PROCESSING = 'PROCESSING',
}

export enum ShopeeProductStatus {
  NORMAL = 'NORMAL',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
  UNLIST = 'UNLIST',
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export enum ShopeeApiPath {
  // Authentication
  GENERATE_AUTH_LINK = '/api/v2/shop/auth_partner',
  AUTH_TOKEN = '/api/v2/auth/token/get',
  REFRESH_TOKEN = '/api/v2/auth/access_token/get',

  // Product Management
  ADD_ITEM = '/api/v2/product/add_item',
  GET_ITEM_LIST = '/api/v2/product/get_item_list',
  GET_ITEM_BASE = '/api/v2/product/get_item_base_info',
  GET_MODEL_LIST = '/api/v2/product/get_model_list',
  UPDATE_STOCK = '/api/v2/product/update_stock',
  UPDATE_PRICE = '/api/v2/product/update_price',
  UNLIST_ITEM = '/api/v2/product/unlist_item',
  DELETE_ITEM = '/api/v2/product/delete_item',
  SEARCH_ITEM = '/api/v2/product/search_item',
  GET_CATEGORY = '/api/v2/product/get_category',
  GET_BRAND_LIST = '/api/v2/product/get_brand_list',
  GET_ATTRIBUTES = '/api/v2/product/get_attributes',
  GET_COMMENTS = '/api/v2/product/get_comment',

  // Order Management
  ORDER_LIST = '/api/v2/order/get_order_list',
  ORDER_DETAIL = '/api/v2/order/get_order_detail',

  // Logistics
  CHANNEL_LIST = '/api/v2/logistics/get_channel_list',
  SHIPPING_PARAMS = '/api/v2/logistics/get_shipping_parameter',
  SHIP_ORDER = '/api/v2/logistics/ship_order',
  ADDRESS_LIST = '/api/v2/logistics/get_address_list',
  TRACKING_NUMBER = '/api/v2/logistics/get_tracking_number',
  TRACKING_INFO = '/api/v2/logistics/get_tracking_info',
  CREATE_SHIPPING_DOCUMENTS = '/api/v2/logistics/create_shipping_document',
  GET_SHIPPING_DOCUMENTS = '/api/v2/logistics/get_shipping_document_result',
  DOWNLOAD_SHIPPING_DOCUMENT = '/api/v2/logistics/download_shipping_document',
  GET_SHIPPING_INFO = '/api/v2/logistics/get_shipping_document_data_info',

  // Returns
  RETURN_LIST = '/api/v2/returns/get_return_list',
  RETURN_DETAIL = '/api/v2/returns/get_return_detail',
  RETURN_SOLUTION = '/api/v2/returns/get_available_solutions',
  RETURN_CONFIRM = '/api/v2/returns/confirm',

  // Promotions
  GET_BUNDLE = '/api/v2/bundle_deal/get_bundle_deal',

  // Payment
  GET_ESCROW = '/api/v2/payment/get_escrow_detail',
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const SHOPEE_CONSTANTS = {
  ALGORITHM: 'sha256' as const,
  DIGEST: 'hex' as const,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE_SIZE: 50,
  
  // Endpoints
  ENDPOINT: 'https://partner.shopeemobile.com',
  ENDPOINT_SANDBOX: 'https://openplatform.sandbox.test-stable.shopee.sg',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  
  // Rate Limits
  RATE_LIMIT_PER_MINUTE: 1000,
  RATE_LIMIT_PER_DAY: 100000,
} as const;

// ============================================================================
// OPTIONAL FIELDS FOR ORDER API
// ============================================================================

export const SHOPEE_ORDER_OPTIONAL_FIELDS = [
  'buyer_user_id',
  'buyer_username',
  'estimated_shipping_fee',
  'recipient_address',
  'actual_shipping_fee',
  'goods_to_declare',
  'note',
  'note_update_time',
  'item_list',
  'pay_time',
  'dropshipper',
  'dropshipper_phone',
  'split_up',
  'buyer_cancel_reason',
  'cancel_by',
  'cancel_reason',
  'actual_shipping_fee_confirmed',
  'buyer_cpf_id',
  'fulfillment_flag',
  'pickup_done_time',
  'package_list',
  'shipping_carrier',
  'payment_method',
  'total_amount',
  'invoice_data',
  'order_chargeable_weight_gram',
  'return_request_due_date',
  'edt',
  'payment_info',
] as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ShopeeErrorCode {
  SUCCESS = '',
  INVALID_SIGNATURE = 'error_auth',
  INVALID_TOKEN = 'error_auth_token',
  TOKEN_EXPIRED = 'error_token_expired',
  PERMISSION_DENIED = 'error_permission_denied',
  INVALID_PARAMETER = 'error_param',
  ITEM_NOT_FOUND = 'error_item_not_found',
  RATE_LIMIT_EXCEEDED = 'error_rate_limit_exceeded',
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ShopeeEndpoint = typeof SHOPEE_CONSTANTS.ENDPOINT | typeof SHOPEE_CONSTANTS.ENDPOINT_SANDBOX;

export interface ShopeeApiConfig {
  partnerId: string;
  partnerKey: string;
  shopId?: string;
  accessToken?: string;
  sandbox?: boolean;
  timeout?: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  LogisticsStatus: ShopeeLogisticsStatus,
  OrderStatus: ShopeeOrderStatus,
  ReturnStatus: ShopeeReturnStatus,
  ReturnSolution: ShopeeReturnSolution,
  ShippingDocumentType: ShopeeShippingDocumentType,
  ShippingDocumentStatus: ShopeeShippingDocumentStatus,
  ProductStatus: ShopeeProductStatus,
  ApiPath: ShopeeApiPath,
  ErrorCode: ShopeeErrorCode,
  Constants: SHOPEE_CONSTANTS,
  OrderOptionalFields: SHOPEE_ORDER_OPTIONAL_FIELDS,
};
