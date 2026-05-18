import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import {
  EcomConnectorConfig,
  EcomConnectorError,
  ECommercePlatform,
  Order,
  OrderQueryOptions,
  Product,
  ProductInput,
  ProductQueryOptions,
  TikTokShopCredentials,
} from "../../interfaces";
import { keysToSnake } from "../../utils/transform";
import {
  TIKTOK_CONSTANTS,
  TikTokApiPathV2,
  TikTokPathPlaceholder,
} from "./constants";

export class TikTokShopPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: TikTokShopCredentials;
  private readonly baseURL: string = TIKTOK_CONSTANTS.ENDPOINT;

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as TikTokShopCredentials;

    if (config.sandbox) {
      this.baseURL = TIKTOK_CONSTANTS.ENDPOINT_SANDBOX;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const path = config.url || "";

        // Merge existing params with our standard params
        const allParams: Record<string, any> = {
          ...config.params, // IMPORTANT: Include query params from the request
          access_token: this.credentials.accessToken || "", // TikTok requires access_token in params
          app_key: this.credentials.appKey,
          timestamp: timestamp.toString(),
        };

        // Some endpoints don't need shop_id and shop_cipher
        const isAuthEndpoint =
          path.includes("/authorization/") ||
          path.includes("/token/") ||
          path === TikTokApiPathV2.AUTHORIZED_SHOP;

        if (!isAuthEndpoint) {
          if (this.credentials.shopId) {
            allParams.shop_id = this.credentials.shopId;
          }
          if (this.credentials.shopCipher) {
            allParams.shop_cipher = this.credentials.shopCipher;
          }
          // Add version for v2 endpoints
          if (path.includes("/202309/")) {
            allParams.version = "202309";
          }
        }
        // Generate signature (with body if present)
        const signature = this.generateSignature(path, allParams, config.data);

        config.headers["x-tts-access-token"] =
          this.credentials.accessToken || "";
        config.params = {
          ...allParams,
          sign: signature,
        };

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        throw new EcomConnectorError(
          error.response?.data?.message || error.message,
          error.response?.data?.code?.toString() || "TIKTOK_ERROR",
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(
    path: string,
    params: Record<string, any>,
    body?: any
  ): string {
    // TikTok Shop signature algorithm (from official reference):
    // signString = appSecret + path + key1value1key2value2... + (body || appSecret)
    // signature = HmacSHA256(signString, appSecret)

    const signParams = { ...params };
    delete signParams.sign;
    delete signParams.access_token; // access_token excluded from signature but present in URL

    // Step 1: Sort params alphabetically
    const sortedKeys = Object.keys(signParams).sort();

    // Step 2: Build signString starting with appSecret + path
    let signString = this.credentials.appSecret + path;

    // Step 3: Append sorted params: key1value1key2value2...
    for (const key of sortedKeys) {
      signString += key + signParams[key];
    }

    // Step 4: Append body or appSecret
    // Reference: signstring + (!body ? appSecret : JSON.stringify(body) + appSecret)
    if (!body) {
      signString += this.credentials.appSecret;
    } else {
      signString += JSON.stringify(body) + this.credentials.appSecret;
    }

    // Step 5: HMAC-SHA256
    return crypto
      .createHmac("sha256", this.credentials.appSecret)
      .update(signString)
      .digest("hex");
  }

  // private mapTikTokProductToProduct(tiktokProduct: TikTokShopProduct): Product {
  //   console.log("🚀 ~ tiktokProduct:", tiktokProduct)
  //   const firstSku = tiktokProduct.skus[0];
  //   return {
  //     id: tiktokProduct.id,
  //     name: tiktokProduct.title,
  //     description: tiktokProduct.description,
  //     price: parseFloat(firstSku.price.tax_exclusive_price),
  //     currency: firstSku.price.currency,
  //     stock: firstSku?.quantity || 0,
  //     sku: firstSku?.seller_sku,
  //     images: tiktokProduct.images.map((img) => img.url),
  //     status: tiktokProduct.status === "ACTIVE" ? "active" : "inactive",
  //     createdAt: new Date(tiktokProduct.create_time * 1000),
  //     updatedAt: new Date(tiktokProduct.update_time * 1000),
  //     platformSpecific: tiktokProduct,
  //   };
  // }

  // private mapTikTokOrderToOrder(tiktokOrder: TikTokShopOrder): Order {
  //   return {
  //     id: tiktokOrder.id,
  //     orderNumber: tiktokOrder.id,
  //     status: tiktokOrder.order_status,
  //     totalAmount: parseFloat(tiktokOrder.payment_info.total_amount),
  //     currency: tiktokOrder.payment_info.currency,
  //     items: tiktokOrder.line_items.map((item) => ({
  //       productId: item.product_id,
  //       productName: item.product_name,
  //       quantity: item.quantity,
  //       price: parseFloat(item.sale_price),
  //       sku: item.sku_id,
  //     })),
  //     customer: {
  //       id: tiktokOrder.buyer_info.id,
  //       name: tiktokOrder.buyer_info.name,
  //       email: tiktokOrder.buyer_info.email,
  //     },
  //     shippingAddress: {
  //       fullName: tiktokOrder.recipient_address.name,
  //       phone: tiktokOrder.recipient_address.phone,
  //       addressLine1: tiktokOrder.recipient_address.address_line1,
  //       addressLine2: tiktokOrder.recipient_address.address_line2,
  //       city: tiktokOrder.recipient_address.city,
  //       state: tiktokOrder.recipient_address.state,
  //       country: tiktokOrder.recipient_address.region_code,
  //       postalCode: tiktokOrder.recipient_address.postal_code,
  //     },
  //     createdAt: new Date(tiktokOrder.create_time * 1000),
  //     updatedAt: new Date(tiktokOrder.update_time * 1000),
  //     platformSpecific: tiktokOrder,
  //   };
  // }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      // TikTok Shop: pagination goes in query params, body is empty {}
      const response = await this.client.post(
        TikTokApiPathV2.PRODUCT_LIST,
        {}, // Empty body
        {
          params: {
            page_size: options?.limit || 10,
          },
        }
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data?.products || [];
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch products from TikTok Shop",
        "FETCH_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const path = TikTokApiPathV2.PRODUCT_DETAIL.replace(
        TikTokPathPlaceholder.PRODUCT,
        id
      );
      const response = await this.client.get(path);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from TikTok Shop`,
        "FETCH_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const response = await this.client.post(TikTokApiPathV2.CREATE_PRODUCT, {
        title: productData.name,
        description: productData.description,
        category_id: productData.categoryId,
        price: productData.price.toString(),
        images: productData.images?.map((url) => ({ url })),
        skus: [
          {
            seller_sku: productData.sku,
            quantity: productData.stock,
          },
        ],
        ...productData.platformSpecific,
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      // Response is already transformed to camelCase by interceptor
      return this.getProductById(response.data.data.productId);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to create product on TikTok Shop",
        "CREATE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async updateProduct(
    id: string,
    productData: Partial<ProductInput>
  ): Promise<Product> {
    try {
      const updateData: any = {
        product_id: id,
      };

      if (productData.name) updateData.title = productData.name;
      if (productData.description)
        updateData.description = productData.description;
      if (productData.price) updateData.price = productData.price.toString();

      // TikTok Shop v2 uses UPDATE_PRODUCT endpoint
      const path = TikTokApiPathV2.UPDATE_PRODUCT.replace(
        TikTokPathPlaceholder.PRODUCT,
        id
      );
      const response = await this.client.put(path, updateData);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on TikTok Shop`,
        "UPDATE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      // TikTok Shop: pagination in query params, body is empty {}
      const queryParams: any = {
        page_size: options?.limit || 10,
      };

      // Add order_status to query params if provided
      if (options?.status) {
        queryParams.order_status = options.status;
      }

      const response = await this.client.post(
        TikTokApiPathV2.ORDER_LIST,
        {}, // Empty body
        {
          params: queryParams,
        }
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }
      return response.data.data?.orders || [];
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch orders from TikTok Shop",
        "FETCH_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const path = TikTokApiPathV2.ORDER_DETAIL.replace(
        TikTokPathPlaceholder.ORDER,
        id
      );
      const response = await this.client.get(path);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from TikTok Shop`,
        "FETCH_ORDER_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get products with pagination (TikTok Shop uses page-based pagination)
   */
  async getProductsWithPagination(options?: ProductQueryOptions): Promise<{
    products: Product[];
    totalCount: number;
    hasNextPage: boolean;
    nextOffset: number;
  }> {
    const products = await this.getProducts(options);
    const currentPage = options?.page || 1;
    const pageSize = options?.limit || 20;

    return {
      products,
      totalCount: products.length,
      hasNextPage: products.length === pageSize,
      nextOffset: currentPage + 1,
    };
  }

  /**
   * Get all products (TikTok Shop - fetches with current filters)
   */
  async getAllProducts(
    options?: { status?: string | string[] },
    maxItems?: number
  ): Promise<Product[]> {
    return this.getProducts({
      ...options,
      limit: maxItems || 100,
    });
  }

  /**
   * Get orders with pagination (TikTok Shop uses page-based pagination)
   */
  async getOrdersWithPagination(options?: OrderQueryOptions): Promise<{
    orders: Order[];
    more: boolean;
    nextCursor?: string;
  }> {
    const orders = await this.getOrders(options);
    const currentPage = options?.page || 1;
    const pageSize = options?.limit || 100;

    return {
      orders,
      more: orders.length === pageSize,
      nextCursor: (currentPage + 1).toString(),
    };
  }

  /**
   * Get all orders (TikTok Shop - fetches with current filters)
   */
  async getAllOrders(
    options?: OrderQueryOptions,
    maxItems?: number
  ): Promise<Order[]> {
    return this.getOrders({
      ...options,
      limit: maxItems || 100,
    });
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await this.client.post("/api/orders/status", {
        order_id: id,
        status,
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on TikTok Shop`,
        "UPDATE_ORDER_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get access token using authorization code
   * @param authCode - Authorization code from callback
   * @returns Access token and related information
   */
  async getAccessToken(authCode: string): Promise<any> {
    try {
      const grantType = "authorized_code";
      const params = new URLSearchParams({
        app_key: this.credentials.appKey,
        auth_code: authCode,
        app_secret: this.credentials.appSecret,
        grant_type: grantType,
      });

      const url = `https://auth.tiktok-shops.com/api/v2/token/get?${params.toString()}`;
      const response = await axios.get(url);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message || "Failed to get access token",
          response.data.code?.toString() || "AUTH_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get access token",
        "AUTH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Refresh access token
   * @param refreshToken - Refresh token
   * @returns New access token and related information
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      // TikTok uses same endpoint for both get and refresh, differentiated by grant_type
      const grantType = "refresh_token";
      const params = new URLSearchParams({
        app_key: this.credentials.appKey,
        refresh_token: refreshToken,
        app_secret: this.credentials.appSecret,
        grant_type: grantType,
      });

      const url = `https://auth.tiktok-shops.com${
        TikTokApiPathV2.REFRESH_TOKEN
      }?${params.toString()}`;
      const response = await axios.get(url);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message || "Failed to refresh access token",
          response.data.code?.toString() || "AUTH_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to refresh access token",
        "AUTH_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get authorized shops
   * @returns List of authorized shops
   */
  async getAuthorizedShops(): Promise<any> {
    try {
      const response = await this.client.get(TikTokApiPathV2.AUTHORIZED_SHOP);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get authorized shops",
        "GET_SHOPS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get product categories
   * @returns List of categories
   */
  async getCategories(): Promise<any> {
    try {
      const response = await this.client.get(TikTokApiPathV2.CATEGORIES);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get categories",
        "GET_CATEGORIES_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get category rules
   * @param categoryId - Category ID
   * @returns Category rules
   */
  async getCategoryRules(categoryId: string): Promise<any> {
    try {
      const path = TikTokApiPathV2.CATEGORY_RULE.replace(
        TikTokPathPlaceholder.CATEGORY,
        categoryId
      );
      const response = await this.client.get(path);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get category rules",
        "GET_CATEGORY_RULES_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get brands for a category
   * @param categoryId - Category ID
   * @param pageSize - Page size (default: 100)
   * @returns List of brands
   */
  async getBrands(categoryId: string, pageSize: number = 100): Promise<any> {
    try {
      const response = await this.client.get(TikTokApiPathV2.BRANDS, {
        params: {
          category_id: categoryId,
          page_size: pageSize,
        },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get brands",
        "GET_BRANDS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get category attributes
   * @param categoryId - Category ID
   * @returns Category attributes
   */
  async getCategoryAttributes(categoryId: string): Promise<any> {
    try {
      const path = TikTokApiPathV2.ATTRIBUTES.replace(
        TikTokPathPlaceholder.CATEGORY,
        categoryId
      );
      const response = await this.client.get(path);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get category attributes",
        "GET_ATTRIBUTES_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Upload product image
   * @param imagePath - Image file path or data
   * @returns Upload result with image ID
   */
  async uploadProductImage(imagePath: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append("data", imagePath);

      const response = await this.client.post(
        TikTokApiPathV2.PRODUCT_IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to upload product image",
        "UPLOAD_IMAGE_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Activate products
   * @param productIds - Array of product IDs to activate
   * @returns Activation result
   */
  async activateProducts(productIds: string[]): Promise<any> {
    try {
      const body = keysToSnake({
        productIds,
      });

      const response = await this.client.post(
        TikTokApiPathV2.ACTIVE_PRODUCT,
        body
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to activate products",
        "ACTIVATE_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Deactivate products
   * @param productIds - Array of product IDs to deactivate
   * @returns Deactivation result
   */
  async deactivateProducts(productIds: string[]): Promise<any> {
    try {
      const body = keysToSnake({
        productIds,
      });

      const response = await this.client.post(
        TikTokApiPathV2.DEACTIVE_PRODUCT,
        body
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to deactivate products",
        "DEACTIVATE_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get package time slots for pickup
   * @param packageId - Package ID
   * @returns Available time slots
   */
  async getPackageTimeSlots(packageId: string): Promise<any> {
    try {
      const path = TikTokApiPathV2.PACKAGE_TIME_SLOT.replace(
        TikTokPathPlaceholder.PACKAGE,
        packageId
      );
      const response = await this.client.get(path);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get package time slots",
        "GET_TIME_SLOTS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Ship package
   * @param packageId - Package ID
   * @param handoverMethod - Handover method (e.g., "PICKUP", "DROP_OFF")
   * @param pickupSlot - Pickup time slot
   * @returns Ship package result
   */
  async shipPackage(
    packageId: string,
    handoverMethod: string,
    pickupSlot: { startTime: number; endTime: number }
  ): Promise<any> {
    try {
      const body = keysToSnake({
        handoverMethod,
        pickupSlot,
      });

      const path = TikTokApiPathV2.SHIP_PACKAGE.replace(
        TikTokPathPlaceholder.PACKAGE,
        packageId
      );
      const response = await this.client.post(path, body);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to ship package",
        "SHIP_PACKAGE_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get package shipping document
   * @param packageId - Package ID
   * @param documentType - Document type (e.g., "SHIPPING_LABEL", "INVOICE")
   * @returns Shipping document
   */
  async getPackageShippingDocument(
    packageId: string,
    documentType: string
  ): Promise<any> {
    try {
      const response = await this.client.get(
        TikTokApiPathV2.PACKAGE_SHIPPING_DOCUMENT.replace(
          TikTokPathPlaceholder.PACKAGE,
          packageId
        ),
        {
          params: {
            document_type: documentType,
          },
        }
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return response.data.data;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get package shipping document",
        "GET_SHIPPING_DOCUMENT_ERROR",
        500,
        error
      );
    }
  }
}
