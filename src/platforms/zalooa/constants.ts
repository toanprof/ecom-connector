/**
 * Zalo OA Platform Constants
 * All constants, enums, and API endpoints for Zalo OA integration
 */

// ============================================================================
// ENUMS - Message Types
// ============================================================================

export enum ZaloMessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  STICKER = 'sticker',
  GIF = 'gif',
  LOCATION = 'location',
  LINKS = 'links',
  LIST = 'list',
  REQUEST_LOCATION = 'request_location',
  REQUEST_PHONE = 'request_phone',
}

// ============================================================================
// ENUMS - User Status
// ============================================================================

export enum ZaloUserStatus {
  FOLLOWING = 'following',
  UNFOLLOWING = 'unfollowing',
  BLOCKED = 'blocked',
}

// ============================================================================
// ENUMS - Article Status
// ============================================================================

export enum ZaloArticleStatus {
  SHOW = 'show',
  HIDE = 'hide',
}

export enum ZaloArticleType {
  NORMAL = 'normal',
  VIDEO = 'video',
}

// ============================================================================
// ENUMS - Order Status (E-commerce)
// ============================================================================

export enum ZaloOrderStatus {
  NEW = 'new',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum ZaloProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

export enum ZaloApiPath {
  // Authentication
  GET_ACCESS_TOKEN = '/v2.0/oauth/access_token',
  REFRESH_TOKEN = '/v2.0/oauth/access_token',

  // User Management
  GET_USER_PROFILE = '/v2.0/oa/getprofile',
  GET_FOLLOWER_LIST = '/v2.0/oa/getfollowers',
  TAG_FOLLOWER = '/v2.0/oa/tag/tagfollower',
  REMOVE_TAG = '/v2.0/oa/tag/rmfollowerfromtag',
  
  // Message APIs
  SEND_TEXT_MESSAGE = '/v2.0/oa/message',
  SEND_IMAGE_MESSAGE = '/v2.0/oa/message/image',
  SEND_FILE_MESSAGE = '/v2.0/oa/message/file',
  SEND_STICKER_MESSAGE = '/v2.0/oa/message/sticker',
  SEND_LIST_MESSAGE = '/v2.0/oa/message/list',
  SEND_GIF_MESSAGE = '/v2.0/oa/message/gif',
  SEND_LOCATION_MESSAGE = '/v2.0/oa/message/location',
  REQUEST_LOCATION = '/v2.0/oa/message/request_location',
  REQUEST_PHONE = '/v2.0/oa/message/request_phone',

  // Article/News APIs
  CREATE_ARTICLE = '/v2.0/oa/article/create',
  UPDATE_ARTICLE = '/v2.0/oa/article/update',
  REMOVE_ARTICLE = '/v2.0/oa/article/remove',
  GET_ARTICLE_DETAIL = '/v2.0/oa/article/getdetail',
  GET_ARTICLE_LIST = '/v2.0/oa/article/getslice',

  // Product APIs (E-commerce)
  CREATE_PRODUCT = '/v2.0/oa/product/create',
  UPDATE_PRODUCT = '/v2.0/oa/product/update',
  REMOVE_PRODUCT = '/v2.0/oa/product/remove',
  GET_PRODUCT_DETAIL = '/v2.0/oa/product/getdetail',
  GET_PRODUCT_LIST = '/v2.0/oa/product/getslice',

  // Order APIs (E-commerce)
  CREATE_ORDER = '/v2.0/oa/order/create',
  UPDATE_ORDER_STATUS = '/v2.0/oa/order/updatestatus',
  GET_ORDER_DETAIL = '/v2.0/oa/order/getdetail',
  GET_ORDER_LIST = '/v2.0/oa/order/getslice',

  // Broadcast APIs
  SEND_BROADCAST_MESSAGE = '/v2.0/oa/message/broadcast',
  GET_BROADCAST_STATUS = '/v2.0/oa/message/broadcast/status',

  // Upload APIs
  UPLOAD_IMAGE = '/v2.0/oa/upload/image',
  UPLOAD_FILE = '/v2.0/oa/upload/file',
  UPLOAD_GIF = '/v2.0/oa/upload/gif',

  // OA Info APIs
  GET_OA_INFO = '/v2.0/oa/getoa',
  UPDATE_OA_INFO = '/v2.0/oa/updateoa',

  // Template APIs
  GET_TEMPLATE_LIST = '/v2.0/oa/template/all',
  GET_TEMPLATE_DETAIL = '/v2.0/oa/template/info',
  SEND_TEMPLATE_MESSAGE = '/v2.0/oa/message/template',

  // Webhook APIs
  GET_CONVERSATION_LIST = '/v2.0/oa/listrecentchat',
  GET_CONVERSATION_DETAIL = '/v2.0/oa/conversation',
}

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

export const ZALO_CONSTANTS = {
  // Endpoints
  ENDPOINT: 'https://openapi.zalo.me',
  ENDPOINT_GRAPH: 'https://graph.zalo.me',
  OAUTH_ENDPOINT: 'https://oauth.zaloapp.com',
  
  // Timeouts
  DEFAULT_TIMEOUT: 30000,
  
  // Rate Limits
  RATE_LIMIT_PER_MINUTE: 100,
  RATE_LIMIT_PER_DAY: 10000,
  
  // Message Limits
  MAX_MESSAGE_LENGTH: 2000,
  MAX_BROADCAST_USERS: 100,
  
  // File Upload Limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  
  // Response Codes
  SUCCESS_CODE: 0,
  ERROR_CODE_INVALID_TOKEN: -216,
  ERROR_CODE_EXPIRED_TOKEN: -14005,
} as const;

// ============================================================================
// ERROR CODES
// ============================================================================

export enum ZaloErrorCode {
  SUCCESS = 0,
  INVALID_PARAMETER = -201,
  INVALID_ACCESS_TOKEN = -216,
  EXPIRED_ACCESS_TOKEN = -14005,
  PERMISSION_DENIED = -14001,
  USER_NOT_FOUND = -217,
  OA_NOT_FOUND = -14002,
  RATE_LIMIT_EXCEEDED = -14003,
  SYSTEM_ERROR = -1,
}

// ============================================================================
// WEBHOOK EVENT TYPES
// ============================================================================

export enum ZaloWebhookEvent {
  USER_SEND_TEXT = 'user_send_text',
  USER_SEND_IMAGE = 'user_send_image',
  USER_SEND_FILE = 'user_send_file',
  USER_SEND_STICKER = 'user_send_sticker',
  USER_SEND_GIF = 'user_send_gif',
  USER_SEND_LOCATION = 'user_send_location',
  USER_SEND_AUDIO = 'user_send_audio',
  USER_SEND_VIDEO = 'user_send_video',
  USER_SEND_LINK = 'user_send_link',
  USER_RECEIVED = 'user_received',
  USER_SEEN = 'user_seen',
  FOLLOW_OA = 'follow',
  UNFOLLOW_OA = 'unfollow',
  USER_SUBMIT_INFO = 'user_submit_info',
  SHOP_ORDER_UPDATE = 'shop_order_update',
}

// ============================================================================
// BUTTON TYPES
// ============================================================================

export enum ZaloButtonType {
  CALLBACK = 'oa.callback',
  OPEN_URL = 'oa.open.url',
  QUERY_SHOW = 'oa.query.show',
  QUERY_HIDE = 'oa.query.hide',
  OPEN_SMS = 'oa.open.sms',
  OPEN_PHONE = 'oa.open.phone',
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ZaloEndpoint = 
  | typeof ZALO_CONSTANTS.ENDPOINT 
  | typeof ZALO_CONSTANTS.ENDPOINT_GRAPH;

export interface ZaloApiConfig {
  appId: string;
  secretKey: string;
  accessToken?: string;
  refreshToken?: string;
  timeout?: number;
}

// ============================================================================
// IMAGE QUALITY
// ============================================================================

export enum ZaloImageQuality {
  THUMBNAIL = 'thumbnail',
  MEDIUM = 'medium',
  LARGE = 'large',
  ORIGINAL = 'original',
}

// ============================================================================
// MESSAGE QUOTA TYPES
// ============================================================================

export enum ZaloQuotaType {
  PROMOTION = 'promotion',
  TRANSACTION = 'transaction',
  FOLLOW_UP = 'follow_up',
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  MessageType: ZaloMessageType,
  UserStatus: ZaloUserStatus,
  ArticleStatus: ZaloArticleStatus,
  ArticleType: ZaloArticleType,
  OrderStatus: ZaloOrderStatus,
  ProductStatus: ZaloProductStatus,
  ApiPath: ZaloApiPath,
  ErrorCode: ZaloErrorCode,
  WebhookEvent: ZaloWebhookEvent,
  ButtonType: ZaloButtonType,
  ImageQuality: ZaloImageQuality,
  QuotaType: ZaloQuotaType,
  Constants: ZALO_CONSTANTS,
};
