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
  LazadaCredentials,
} from "../../interfaces";
import { LazadaProduct, LazadaOrder } from "./types";
import { keysToCamel, keysToSnake } from "../../utils/transform";
import { LazadaApiPath, LAZADA_CONSTANTS } from "./constants";

export class LazadaPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: LazadaCredentials;
  private baseURL: string = LAZADA_CONSTANTS.ENDPOINT;

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as LazadaCredentials;

    if (config.sandbox) {
      this.baseURL = LAZADA_CONSTANTS.ENDPOINT_SG; // Sandbox endpoint
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
        const timestamp = Date.now().toString();
        const apiPath = config.url?.replace(this.baseURL, "") || "";

        const signParams: any = {
          app_key: this.credentials.appKey,
          timestamp,
          sign_method: "sha256",
        };

        if (this.credentials.accessToken) {
          signParams.access_token = this.credentials.accessToken;
        }

        // Add existing params
        if (config.params) {
          Object.assign(signParams, config.params);
        }

        const signature = this.generateSignature(apiPath, signParams);

        config.params = {
          ...signParams,
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
          error.response?.data?.code || "LAZADA_ERROR",
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(apiPath: string, params: any): string {
    // Sort parameters
    const sortedKeys = Object.keys(params).sort();
    let concatenated = apiPath;

    sortedKeys.forEach((key) => {
      concatenated += key + params[key];
    });

    const sign = crypto
      .createHmac("sha256", this.credentials.appSecret)
      .update(concatenated)
      .digest("hex")
      .toUpperCase();

    return sign;
  }

  private mapLazadaProductToProduct(lazadaProduct: LazadaProduct): Product {
    const attrs = lazadaProduct.attributes;
    const firstSku = lazadaProduct.skus[0];

    return {
      id: lazadaProduct.item_id.toString(),
      name: attrs.name,
      description: attrs.description,
      price: attrs.price || firstSku?.price || 0,
      currency: "SGD",
      stock: attrs.quantity || firstSku?.quantity || 0,
      sku: attrs.SellerSku,
      images: attrs.Images?.Image || [],
      status: attrs.status === "active" ? "active" : "inactive",
      createdAt: new Date(lazadaProduct.created_time),
      updatedAt: new Date(lazadaProduct.updated_time),
      platformSpecific: lazadaProduct,
    };
  }

  private mapLazadaOrderToOrder(lazadaOrder: LazadaOrder): Order {
    const billing = lazadaOrder.address_billing;

    return {
      id: lazadaOrder.order_id.toString(),
      orderNumber: lazadaOrder.order_number,
      status: lazadaOrder.statuses[0] || "UNKNOWN",
      totalAmount: parseFloat(lazadaOrder.price),
      currency: "SGD",
      items: lazadaOrder.items.map((item) => ({
        productId: item.order_item_id.toString(),
        productName: item.name,
        quantity: 1, // Lazada doesn't provide quantity in basic response
        price: item.paid_price,
        sku: item.shop_sku,
      })),
      customer: {
        id: lazadaOrder.order_id.toString(),
        name: `${lazadaOrder.customer_first_name} ${lazadaOrder.customer_last_name}`,
      },
      shippingAddress: {
        fullName: `${billing.first_name} ${billing.last_name}`,
        phone: billing.phone,
        addressLine1: billing.address1,
        addressLine2: billing.address2,
        city: billing.city,
        country: billing.country,
        postalCode: billing.post_code,
        state: "",
      },
      createdAt: new Date(lazadaOrder.created_at),
      updatedAt: new Date(lazadaOrder.updated_at),
      platformSpecific: lazadaOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get(LazadaApiPath.PRODUCT_GET, {
        params: {
          filter: "all",
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to fetch products",
          response.data.code,
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: LazadaProduct) =>
        this.mapLazadaProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch products from Lazada",
        "FETCH_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get(LazadaApiPath.PRODUCT_ITEM_GET, {
        params: {
          item_id: id,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to fetch product",
          response.data.code,
          400,
          response.data
        );
      }

      return this.mapLazadaProductToProduct(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Lazada`,
        "FETCH_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const payload = {
        Request: {
          Product: {
            PrimaryCategory: productData.categoryId || "0",
            Attributes: {
              name: productData.name,
              description: productData.description,
              price: productData.price,
              quantity: productData.stock,
              SellerSku: productData.sku,
              ...productData.platformSpecific,
            },
          },
        },
      };

      const response = await this.client.post(LazadaApiPath.CREATE_PRODUCT, payload);

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message,
          response.data.code,
          400,
          response.data
        );
      }

      // Response is already transformed to camelCase by interceptor
      return this.getProductById(response.data.data.itemId.toString());
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to create product on Lazada",
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
      const payload: any = {
        Request: {
          Product: {
            ItemId: parseInt(id),
            Attributes: {},
          },
        },
      };

      if (productData.name)
        payload.Request.Product.Attributes.name = productData.name;
      if (productData.description)
        payload.Request.Product.Attributes.description =
          productData.description;
      if (productData.price !== undefined)
        payload.Request.Product.Attributes.price = productData.price;
      if (productData.stock !== undefined)
        payload.Request.Product.Attributes.quantity = productData.stock;

      const response = await this.client.post(LazadaApiPath.UPDATE_PRODUCT, payload);

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to update product",
          response.data.code,
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Lazada`,
        "UPDATE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const createdAfter = options?.startDate
        ? options.startDate.toISOString()
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const createdBefore = options?.endDate
        ? options.endDate.toISOString()
        : new Date().toISOString();

      const response = await this.client.get(LazadaApiPath.ORDERS_GET, {
        params: {
          created_after: createdAfter,
          created_before: createdBefore,
          status: options?.status,
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to fetch orders",
          response.data.code,
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: LazadaOrder) =>
        this.mapLazadaOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch orders from Lazada",
        "FETCH_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get(LazadaApiPath.SINGLE_ORDER_GET, {
        params: {
          order_id: id,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to fetch order",
          response.data.code,
          400,
          response.data
        );
      }

      return this.mapLazadaOrderToOrder(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Lazada`,
        "FETCH_ORDER_ERROR",
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const response = await this.client.post(LazadaApiPath.SET_STATUS_TO_PACKED, {
        order_id: parseInt(id),
        status,
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to update order status",
          response.data.code,
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on Lazada`,
        "UPDATE_ORDER_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Generate authorization URL for shop authorization
   * @param redirectUrl - The redirect URL after authorization
   * @param uuid - Unique identifier for the authorization request
   * @returns Authorization URL
   */
  generateAuthUrl(redirectUrl: string, uuid: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      redirect_uri: redirectUrl,
      client_id: this.credentials.appKey,
      uuid,
    });

    return `https://auth.lazada.com/oauth/authorize?${params.toString()}`;
  }

  /**
   * Get access token using authorization code
   * @param authCode - Authorization code from callback
   * @param uuid - UUID used during authorization
   * @returns Access token and related information
   */
  async getAccessToken(authCode: string, uuid: string): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const apiPath = LazadaApiPath.FETCH_TOKEN;

      const signParams: any = {
        app_key: this.credentials.appKey,
        sign_method: "sha256",
        timestamp,
        code: authCode,
        uuid,
      };

      const signature = this.generateSignature(apiPath, signParams);

      const response = await axios.get(`${this.baseURL}${apiPath}`, {
        params: {
          ...signParams,
          sign: signature,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to get access token",
          response.data.code,
          400,
          response.data
        );
      }

      return keysToCamel(response.data);
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
   * Refresh access token using refresh token
   * @param refreshToken - Refresh token
   * @returns New access token and related information
   */
  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      const timestamp = Date.now().toString();
      const apiPath = LazadaApiPath.REFRESH_TOKEN;

      const signParams: any = {
        app_key: this.credentials.appKey,
        sign_method: "sha256",
        timestamp,
        refresh_token: refreshToken,
      };

      const signature = this.generateSignature(apiPath, signParams);

      const response = await axios.get(`${this.baseURL}${apiPath}`, {
        params: {
          ...signParams,
          sign: signature,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to refresh access token",
          response.data.code,
          400,
          response.data
        );
      }

      return keysToCamel(response.data);
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
   * Get product categories
   * @returns List of categories
   */
  async getCategories(): Promise<any> {
    try {
      const response = await this.client.get(LazadaApiPath.CATEGORY_TREE);

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to get categories",
          response.data.code,
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
   * Get category attributes
   * @param categoryId - Category ID
   * @returns Category attributes
   */
  async getCategoryAttributes(categoryId: number): Promise<any> {
    try {
      const response = await this.client.get(LazadaApiPath.CATEGORY_ATTRIBUTES, {
        params: {
          primary_category_id: categoryId,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to get category attributes",
          response.data.code,
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
   * Get brands
   * @param startRow - Start row (default: 0)
   * @param pageSize - Page size (default: 100)
   * @returns List of brands
   */
  async getBrands(startRow: number = 0, pageSize: number = 100): Promise<any> {
    try {
      const response = await this.client.get(LazadaApiPath.BRANDS_GET, {
        params: {
          startRow,
          pageSize,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to get brands",
          response.data.code,
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
   * Update product sellable quantity (stock)
   * @param itemId - Item ID
   * @param updates - List of stock updates for SKUs
   * @returns Update result
   */
  async updateSellableQuantity(
    itemId: number,
    updates: Array<{ skuId: string; sellerSku?: string; quantity: number }>
  ): Promise<any> {
    try {
      // Convert to XML format as required by Lazada API
      const products = updates
        .map((u) => {
          return `<Product><ItemId>${itemId}</ItemId><SkuId>${u.skuId}</SkuId>${
            u.sellerSku ? `<SellerSku>${u.sellerSku}</SellerSku>` : ""
          }<Quantity>${u.quantity}</Quantity></Product>`;
        })
        .join("");

      const payload = `<?xml version="1.0" encoding="UTF-8" ?><Request>${products}</Request>`;

      const response = await this.client.post(
        LazadaApiPath.UPDATE_SELLABLE_QUANTITY,
        null,
        {
          params: {
            payload,
          },
        }
      );

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to update sellable quantity",
          response.data.code,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to update sellable quantity",
        "UPDATE_QUANTITY_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Update product price
   * @param itemId - Item ID
   * @param updates - List of price updates for SKUs
   * @returns Update result
   */
  async updateProductPrice(
    itemId: number,
    updates: Array<{
      skuId: string;
      sellerSku?: string;
      price: number;
      salePrice?: number;
    }>
  ): Promise<any> {
    try {
      // Convert to XML format as required by Lazada API
      const products = updates
        .map((u) => {
          return `<Product><ItemId>${itemId}</ItemId><Skus><Sku><SkuId>${
            u.skuId
          }</SkuId>${
            u.sellerSku ? `<SellerSku>${u.sellerSku}</SellerSku>` : ""
          }<price>${u.price}</price>${
            u.salePrice ? `<sale_price>${u.salePrice}</sale_price>` : ""
          }</Sku></Skus></Product>`;
        })
        .join("");

      const payload = `<?xml version="1.0" encoding="UTF-8" ?><Request>${products}</Request>`;

      const response = await this.client.post(
        LazadaApiPath.UPDATE_PRICE,
        null,
        {
          params: {
            payload,
          },
        }
      );

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to update product price",
          response.data.code,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to update product price",
        "UPDATE_PRICE_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Update product status (activate/deactivate)
   * @param itemId - Item ID
   * @param updates - List of status updates for SKUs
   * @returns Update result
   */
  async updateProductStatus(
    itemId: number,
    updates: Array<{
      skuId: string;
      sellerSku?: string;
      status: "active" | "inactive";
    }>
  ): Promise<any> {
    try {
      // Convert to XML format as required by Lazada API
      const products = updates
        .map((u) => {
          return `<Product><ItemId>${itemId}</ItemId><Skus><Sku><SkuId>${
            u.skuId
          }</SkuId>${
            u.sellerSku ? `<SellerSku>${u.sellerSku}</SellerSku>` : ""
          }<Status>${u.status}</Status></Sku></Skus></Product>`;
        })
        .join("");

      const payload = `<?xml version="1.0" encoding="UTF-8" ?><Request>${products}</Request>`;

      const response = await this.client.post(LazadaApiPath.UPDATE_PRODUCT, null, {
        params: {
          payload,
        },
      });

      if (response.data.code !== "0") {
        throw new EcomConnectorError(
          response.data.message || "Failed to update product status",
          response.data.code,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to update product status",
        "UPDATE_STATUS_ERROR",
        500,
        error
      );
    }
  }
}
