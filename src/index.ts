// Main entry point
export { createEcomConnector } from "./factory";

// Export types and interfaces
export * from "./interfaces";

// Export platform implementations (optional, for advanced usage)
export { ZaloOAPlatform } from "./platforms/zalooa";
export { TikTokShopPlatform } from "./platforms/tiktokshop";
export { ShopeePlatform } from "./platforms/shopee";
export { LazadaPlatform } from "./platforms/lazada";

// Export utility functions for data transformation
export {
  keysToCamel,
  keysToSnake,
  snakeToCamel,
  camelToSnake,
  transformResponse,
} from "./utils/transform";

// Export platform constants
export * from "./platforms/shopee/constants";
export * from "./platforms/tiktokshop/constants";
export * from "./platforms/lazada/constants";
export * from "./platforms/zalooa/constants";
