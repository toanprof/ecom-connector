import {
  ECommercePlatform,
  EcomConnectorConfig,
  EcomConnectorError,
} from "./interfaces";
import { ZaloOAPlatform } from "./platforms/zalooa";
import { TikTokShopPlatform } from "./platforms/tiktokshop";
import { ShopeePlatform } from "./platforms/shopee";
import { LazadaPlatform } from "./platforms/lazada";

/**
 * Factory function to create an e-commerce platform connector
 * @param config Configuration object containing platform type and credentials
 * @returns An instance of the appropriate platform connector
 */
export function createEcomConnector(
  config: EcomConnectorConfig
): ECommercePlatform {
  if (!config.platform) {
    throw new EcomConnectorError(
      "Platform type is required",
      "MISSING_PLATFORM",
      400
    );
  }

  if (!config.credentials) {
    throw new EcomConnectorError(
      "Credentials are required",
      "MISSING_CREDENTIALS",
      400
    );
  }

  switch (config.platform) {
    case "zalo-oa":
      return new ZaloOAPlatform(config);

    case "tiktok-shop":
      return new TikTokShopPlatform(config);

    case "shopee":
      return new ShopeePlatform(config);

    case "lazada":
      return new LazadaPlatform(config);

    default:
      throw new EcomConnectorError(
        `Unsupported platform: ${config.platform}`,
        "UNSUPPORTED_PLATFORM",
        400
      );
  }
}
