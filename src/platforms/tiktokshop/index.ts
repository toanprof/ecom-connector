import axios, { AxiosInstance } from "axios";
import crypto from "crypto";
import {
  ECommercePlatform,
  Product,
  ProductInput,
  ProductQueryOptions,
  Order,
  OrderQueryOptions,
  EcomConnectorConfig,
  EcomConnectorError,
  TikTokShopCredentials,
} from "../../interfaces";
import { TikTokShopProduct, TikTokShopOrder } from "./types";
import { keysToCamel, keysToSnake } from "../../utils/transform";
import { TikTokApiPath, TikTokApiPathV2, TIKTOK_CONSTANTS, TikTokPathPlaceholder } from "./constants";

export class TikTokShopPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: TikTokShopCredentials;
  private baseURL: string = TIKTOK_CONSTANTS.ENDPOINT;

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as TikTokShopCredentials;

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
        const signature = this.generateSignature(config.url || "", timestamp);

        config.headers["x-tts-access-token"] =
          this.credentials.accessToken || "";
        config.params = {
          ...config.params,
          app_key: this.credentials.appKey,
          timestamp,
          sign: signature,
        };

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => {
        // Transform response data to camelCase
        if (response.data) {
          response.data = keysToCamel(response.data);
        }
        return response;
      },
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

  private generateSignature(path: string, timestamp: number): string {
    const sign = crypto
      .createHmac("sha256", this.credentials.appSecret)
      .update(`${this.credentials.appKey}${path}${timestamp}`)
      .digest("hex");
    return sign;
  }

  private mapTikTokProductToProduct(tiktokProduct: TikTokShopProduct): Product {
    const firstSku = tiktokProduct.skus[0];
    return {
      id: tiktokProduct.id,
      name: tiktokProduct.title,
      description: tiktokProduct.description,
      price: parseFloat(tiktokProduct.price.amount),
      currency: tiktokProduct.price.currency,
      stock: firstSku?.quantity || 0,
      sku: firstSku?.seller_sku,
      images: tiktokProduct.images.map((img) => img.url),
      status: tiktokProduct.status === "ACTIVE" ? "active" : "inactive",
      createdAt: new Date(tiktokProduct.create_time * 1000),
      updatedAt: new Date(tiktokProduct.update_time * 1000),
      platformSpecific: tiktokProduct,
    };
  }

  private mapTikTokOrderToOrder(tiktokOrder: TikTokShopOrder): Order {
    return {
      id: tiktokOrder.id,
      orderNumber: tiktokOrder.id,
      status: tiktokOrder.order_status,
      totalAmount: parseFloat(tiktokOrder.payment_info.total_amount),
      currency: tiktokOrder.payment_info.currency,
      items: tiktokOrder.line_items.map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: parseFloat(item.sale_price),
        sku: item.sku_id,
      })),
      customer: {
        id: tiktokOrder.buyer_info.id,
        name: tiktokOrder.buyer_info.name,
        email: tiktokOrder.buyer_info.email,
      },
      shippingAddress: {
        fullName: tiktokOrder.recipient_address.name,
        phone: tiktokOrder.recipient_address.phone,
        addressLine1: tiktokOrder.recipient_address.address_line1,
        addressLine2: tiktokOrder.recipient_address.address_line2,
        city: tiktokOrder.recipient_address.city,
        state: tiktokOrder.recipient_address.state,
        country: tiktokOrder.recipient_address.region_code,
        postalCode: tiktokOrder.recipient_address.postal_code,
      },
      createdAt: new Date(tiktokOrder.create_time * 1000),
      updatedAt: new Date(tiktokOrder.update_time * 1000),
      platformSpecific: tiktokOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get(TikTokApiPath.PRODUCT_LIST, {
        params: {
          page_number: options?.page || 1,
          page_size: options?.limit || 20,
        },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: TikTokShopProduct) =>
        this.mapTikTokProductToProduct(p)
      );
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
      const response = await this.client.get(TikTokApiPath.PRODUCT_DETAIL, {
        params: { product_id: id },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return this.mapTikTokProductToProduct(response.data.data);
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

      return this.getProductById(response.data.data.product_id);
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

      const response = await this.client.put(TikTokApiPath.UPDATE_STOCK, updateData);

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
      const response = await this.client.get(TikTokApiPath.ORDER_LIST, {
        params: {
          page_number: options?.page || 1,
          page_size: options?.limit || 20,
          order_status: options?.status,
        },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: TikTokShopOrder) =>
        this.mapTikTokOrderToOrder(o)
      );
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
      const response = await this.client.get(TikTokApiPath.ORDER_DETAIL, {
        params: { order_id: id },
      });

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "TIKTOK_API_ERROR",
          400,
          response.data
        );
      }

      return this.mapTikTokOrderToOrder(response.data.data);
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

      return keysToCamel(response.data.data);
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
      const timestamp = Math.floor(Date.now() / 1000);
      const path = TikTokApiPath.REFRESH_TOKEN;
      const commonParam = `app_key=${this.credentials.appKey}&timestamp=${timestamp}`;
      const signature = this.generateSignature(path, timestamp);

      const url = `${this.baseURL}${path}?${commonParam}&sign=${signature}`;
      const response = await axios.get(url);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message || "Failed to refresh access token",
          response.data.code?.toString() || "AUTH_ERROR",
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
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
      const response = await this.client.get(
        TikTokApiPathV2.AUTHORIZED_SHOP
      );

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      const response = await this.client.post(TikTokApiPathV2.ACTIVE_PRODUCT, body);

      if (response.data.code !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code?.toString() || "TIKTOK_ERROR",
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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

      return keysToCamel(response.data.data);
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
