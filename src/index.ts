// Main entry point
export { createEcomConnector } from './factory';

// Export types and interfaces
export * from './interfaces';

// Export platform implementations (optional, for advanced usage)
export { ZaloOAPlatform } from './platforms/zalooa';
export { TikTokShopPlatform } from './platforms/tiktokshop';
export { ShopeePlatform } from './platforms/shopee';
export { LazadaPlatform } from './platforms/lazada';
