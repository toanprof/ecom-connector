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
  ShopeeCredentials,
} from "../../interfaces";
import { ShopeeProduct, ShopeeOrder } from "./types";
import { keysToCamel, keysToSnake } from "../../utils/transform";
import {
  ShopeeApiPath,
  SHOPEE_CONSTANTS,
  SHOPEE_ORDER_OPTIONAL_FIELDS,
} from "./constants";

export class ShopeePlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: ShopeeCredentials;
  private baseURL: string = SHOPEE_CONSTANTS.ENDPOINT;
  private pathPrefix: string = "";

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as ShopeeCredentials;

    if (config.sandbox) {
      this.baseURL = SHOPEE_CONSTANTS.ENDPOINT_SANDBOX;
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
      },
      paramsSerializer: {
        indexes: null, // This ensures array params are serialized as param=val1&param=val2
      },
    });

    try {
      const u = new URL(this.baseURL);
      this.pathPrefix = u.pathname.replace(/\/$/, "");
    } catch (e) {
      this.pathPrefix = "";
    }

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      (config) => {
        const timestamp = Math.floor(Date.now() / 1000);
        const apiPath = config.url || "";
        const fullApiPath = `${this.pathPrefix}${
          apiPath.startsWith("/") ? apiPath : "/" + apiPath
        }`;
        const signature = this.generateSignature(fullApiPath, timestamp);

        // Transform params to snake_case for Shopee API
        const transformedParams = config.params
          ? keysToSnake(config.params)
          : {};

        config.params = {
          ...transformedParams,
          partner_id: this.credentials.partnerId,
          timestamp,
          sign: signature,
          shop_id: this.credentials.shopId,
        };

        if (this.credentials.accessToken) {
          config.params.access_token = this.credentials.accessToken;
        }

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
          error.response?.data?.error || "SHOPEE_ERROR",
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private generateSignature(path: string, timestamp: number): string {
    let baseString = `${this.credentials.partnerId}${path}${timestamp}`;
    // If shop-level (has access token and shop id), append them
    if (this.credentials.accessToken && this.credentials.shopId) {
      baseString += `${this.credentials.accessToken}${this.credentials.shopId}`;
    }

    const sign = crypto
      .createHmac("sha256", this.credentials.partnerKey)
      .update(baseString)
      .digest("hex");

    return sign;
  }

  /**
   * Common helper to handle API responses and check for errors
   */
  private handleApiResponse<T = any>(
    response: any,
    errorMessage: string,
    errorCode: string
  ): T {
    if (response.data.error) {
      throw new EcomConnectorError(
        response.data.message,
        response.data.error,
        400,
        response.data
      );
    }
    return response.data.response as T;
  }

  /**
   * Common helper to fetch order details with optional fields
   */
  private async fetchOrderDetails(orderSns: string[]): Promise<any[]> {
    if (orderSns.length === 0) {
      return [];
    }

    const response = await this.client.get(ShopeeApiPath.ORDER_DETAIL, {
      params: {
        orderSnList: orderSns.join(","),
        responseOptionalFields: SHOPEE_ORDER_OPTIONAL_FIELDS.join(","),
      },
    });

    const responseData: any = this.handleApiResponse(
      response,
      "Failed to fetch order details",
      "FETCH_ORDER_DETAILS_ERROR"
    );

    return responseData?.orderList || responseData?.order_list || [];
  }

  /**
   * Common helper to fetch product details
   */
  private async fetchProductDetails(itemIds: number[]): Promise<any[]> {
    if (itemIds.length === 0) {
      return [];
    }

    const response = await this.client.get(ShopeeApiPath.GET_ITEM_BASE, {
      params: {
        itemIdList: itemIds.join(","),
        needTaxInfo: true,
        needComplaintPolicy: true,
      },
    });

    const responseData: any = this.handleApiResponse(
      response,
      "Failed to fetch product details",
      "FETCH_PRODUCT_DETAILS_ERROR"
    );

    return responseData?.itemList || responseData?.item_list || [];
  }

  /**
   * Common helper to extract item IDs from list response
   */
  private extractItemIds(response: any): number[] {
    const itemList =
      response.data.response?.item ||
      response.data.response?.itemIdList ||
      response.data.response?.item_id_list ||
      [];

    return Array.isArray(itemList)
      ? itemList.map((item: any) =>
          typeof item === "number" ? item : item.itemId || item.item_id
        )
      : [];
  }

  private mapShopeeProductToProduct(shopeeProduct: any): Product {
    const priceInfo = shopeeProduct.priceInfo?.[0];
    const price =
      priceInfo?.currentPrice ||
      priceInfo?.originalPrice ||
      shopeeProduct.price ||
      0;
    const currency = priceInfo?.currency || "VND";

    const images =
      shopeeProduct.image?.imageUrlList || shopeeProduct.images || [];

    const stock =
      shopeeProduct.stockInfoV2?.summaryInfo?.totalAvailableStock ||
      shopeeProduct.stock ||
      0;

    const description =
      shopeeProduct.description ||
      shopeeProduct.descriptionInfo?.extendedDescription?.fieldList?.[0]
        ?.text ||
      "";

    return {
      id: shopeeProduct.itemId?.toString() || "",
      name: shopeeProduct.itemName || "",
      description,
      price,
      currency,
      stock,
      sku: shopeeProduct.itemSku || "",
      images,
      categoryId: shopeeProduct.categoryId?.toString(),
      status: shopeeProduct.itemStatus === "NORMAL" ? "active" : "inactive",
      createdAt: new Date(shopeeProduct.createTime * 1000),
      updatedAt: new Date(shopeeProduct.updateTime * 1000),
      platformSpecific: shopeeProduct,
    };
  }

  private mapShopeeOrderToOrder(shopeeOrder: any): Order {
    // Data is already in camelCase from interceptor
    return {
      id: shopeeOrder.orderSn,
      orderNumber: shopeeOrder.orderSn,
      status: shopeeOrder.orderStatus,
      totalAmount: shopeeOrder.totalAmount,
      currency: shopeeOrder.currency,
      items:
        shopeeOrder.itemList?.map((item: any) => ({
          productId: item.itemId?.toString() || "",
          productName: item.itemName || "",
          quantity: item.modelQuantityPurchased || 0,
          price: item.modelDiscountedPrice || item.modelOriginalPrice || 0,
          sku: item.modelSku || item.itemSku || "",
        })) || [],
      customer: {
        id: shopeeOrder.buyerUserId?.toString() || "",
        name: shopeeOrder.buyerUsername || "",
      },
      shippingAddress: shopeeOrder.recipientAddress
        ? {
            fullName: shopeeOrder.recipientAddress.name,
            phone: shopeeOrder.recipientAddress.phone,
            addressLine1: shopeeOrder.recipientAddress.fullAddress,
            addressLine2:
              [
                shopeeOrder.recipientAddress.district,
                shopeeOrder.recipientAddress.town,
              ]
                .filter(Boolean)
                .join(", ") || undefined,
            city: shopeeOrder.recipientAddress.city,
            state:
              shopeeOrder.recipientAddress.state ||
              shopeeOrder.recipientAddress.region,
            country: shopeeOrder.recipientAddress.country,
            postalCode: shopeeOrder.recipientAddress.zipcode,
          }
        : undefined,
      createdAt: new Date(shopeeOrder.createTime * 1000),
      updatedAt: new Date(shopeeOrder.updateTime * 1000),
      platformSpecific: shopeeOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const params: any = {
        offset: options?.offset || 0,
        page_size: options?.limit || 20,
      };

      // Support multiple status: item_status can be string or array
      if (options?.status) {
        params.item_status = options.status;
      } else {
        params.item_status = "NORMAL";
      }

      const response = await this.client.get(ShopeeApiPath.GET_ITEM_LIST, {
        params,
      });

      const itemIds = this.extractItemIds(response);
      const detailsList = await this.fetchProductDetails(itemIds);

      return detailsList.map((p: any) => this.mapShopeeProductToProduct(p));
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch products from Shopee",
        "FETCH_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get products with pagination info
   * @param options - Query options with offset and limit
   * @returns Products with pagination metadata
   */
  async getProductsWithPagination(options?: ProductQueryOptions): Promise<{
    products: Product[];
    totalCount: number;
    hasNextPage: boolean;
    nextOffset: number;
  }> {
    try {
      const params: any = {
        offset: options?.offset || 0,
        page_size: options?.limit || 20,
      };

      // Support multiple status: item_status can be string or array
      if (options?.status) {
        params.item_status = options.status;
      } else {
        params.item_status = "NORMAL";
      }

      const response = await this.client.get(ShopeeApiPath.GET_ITEM_LIST, {
        params,
      });

      const responseData: any = this.handleApiResponse(
        response,
        "Failed to fetch products",
        "FETCH_PRODUCTS_ERROR"
      );

      const itemIds = this.extractItemIds(response);
      const detailsList = await this.fetchProductDetails(itemIds);
      const products = detailsList.map((p: any) =>
        this.mapShopeeProductToProduct(p)
      );

      return {
        products,
        totalCount: responseData.totalCount || 0,
        hasNextPage: responseData.hasNextPage || false,
        nextOffset: responseData.nextOffset || 0,
      };
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch products from Shopee",
        "FETCH_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get all products with automatic pagination
   * @param options - Query options (status filter: string or array)
   * @param maxItems - Maximum items to fetch (default: no limit)
   * @returns All products
   * @example
   * // Single status
   * getAllProducts({ status: 'NORMAL' })
   * 
   * // Multiple statuses
   * getAllProducts({ status: ['NORMAL', 'BANNED'] })
   */
  async getAllProducts(
    options?: { status?: string | string[] },
    maxItems?: number
  ): Promise<Product[]> {
    try {
      const allProducts: Product[] = [];
      let offset = 0;
      const pageSize = 50; // Shopee max is 100, using 50 for safety
      let hasNextPage = true;

      while (hasNextPage) {
        const result = await this.getProductsWithPagination({
          offset,
          limit: pageSize,
          ...(options?.status && { status: options.status }),
        });

        allProducts.push(...result.products);

        hasNextPage = result.hasNextPage;
        offset = result.nextOffset;

        // Check if we've reached the max items limit
        if (maxItems && allProducts.length >= maxItems) {
          return allProducts.slice(0, maxItems);
        }

        // Safety check to prevent infinite loops
        if (allProducts.length >= 10000) {
          console.warn("Reached safety limit of 10,000 products");
          break;
        }
      }

      return allProducts;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch all products from Shopee",
        "FETCH_ALL_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const detailsList = await this.fetchProductDetails([parseInt(id)]);
      const product = detailsList[0];

      if (!product) {
        throw new EcomConnectorError(
          "Product not found",
          "PRODUCT_NOT_FOUND",
          404
        );
      }

      return this.mapShopeeProductToProduct(product);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Shopee`,
        "FETCH_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const params: any = {
        item_name: productData.name,
        description: productData.description,
        original_price: productData.price,
        stock: productData.stock,
        item_sku: productData.sku,
        category_id: productData.categoryId
          ? parseInt(productData.categoryId)
          : undefined,
        image: productData.images
          ? { image_id_list: productData.images }
          : undefined,
        ...productData.platformSpecific,
      };

      const response = await this.client.post(
        ShopeeApiPath.ADD_ITEM,
        undefined,
        {
          params,
        }
      );

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      // Response is already transformed to camelCase by interceptor
      return this.getProductById(response.data.response.itemId.toString());
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to create product on Shopee",
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
        item_id: parseInt(id),
      };

      if (productData.name) updateData.item_name = productData.name;
      if (productData.description)
        updateData.description = productData.description;
      if (productData.price !== undefined)
        updateData.original_price = productData.price;
      if (productData.stock !== undefined) updateData.stock = productData.stock;

      const response = await this.client.post(
        ShopeeApiPath.ADD_ITEM, // Note: Using ADD_ITEM as UPDATE_ITEM may not exist
        undefined,
        {
          params: updateData,
        }
      );

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Shopee`,
        "UPDATE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const params: any = {
        pageSize: options?.limit || 100,
        timeRangeField: "create_time",
        timeFrom: options?.startDate
          ? Math.floor(options.startDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000) - 86400 * 30,
        timeTo: options?.endDate
          ? Math.floor(options.endDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000),
      };

      if (options?.status) {
        params.orderStatus = options.status;
      }

      const response = await this.client.get(ShopeeApiPath.ORDER_LIST, {
        params: params,
      });

      const responseData: any = this.handleApiResponse(
        response,
        "Failed to fetch orders",
        "FETCH_ORDERS_ERROR"
      );

      const orderList =
        responseData?.orderList || responseData?.order_list || [];
      const orderSns = orderList.map((o: any) => o.orderSn || o.order_sn);

      const ordersList = await this.fetchOrderDetails(orderSns);
      return ordersList.map((o: any) => this.mapShopeeOrderToOrder(o));
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch orders from Shopee",
        "FETCH_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get orders with pagination info
   * @param options - Query options
   * @returns Orders with pagination metadata
   */
  async getOrdersWithPagination(options?: OrderQueryOptions): Promise<{
    orders: Order[];
    more: boolean;
    nextCursor?: string;
  }> {
    try {
      const params: any = {
        pageSize: options?.limit || 100,
        timeRangeField: "create_time",
        timeFrom: options?.startDate
          ? Math.floor(options.startDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000) - 86400 * 30,
        timeTo: options?.endDate
          ? Math.floor(options.endDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000),
      };

      if (options?.status) {
        params.orderStatus = options.status;
      }

      // Add cursor for pagination if provided
      if ((options as any)?.cursor) {
        params.cursor = (options as any).cursor;
      }

      const response = await this.client.get(ShopeeApiPath.ORDER_LIST, {
        params: params,
      });

      const responseData: any = this.handleApiResponse(
        response,
        "Failed to fetch orders",
        "FETCH_ORDERS_ERROR"
      );

      const orderList =
        responseData?.orderList || responseData?.order_list || [];
      const orderSns = orderList.map((o: any) => o.orderSn || o.order_sn);

      const ordersList = await this.fetchOrderDetails(orderSns);
      const orders = ordersList.map((o: any) => this.mapShopeeOrderToOrder(o));

      return {
        orders,
        more: responseData.more || false,
        nextCursor: responseData.nextCursor,
      };
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch orders from Shopee",
        "FETCH_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get all orders with automatic pagination
   * @param options - Query options (date range, status)
   * @param maxItems - Maximum items to fetch (default: no limit)
   * @returns All orders
   */
  async getAllOrders(
    options?: OrderQueryOptions,
    maxItems?: number
  ): Promise<Order[]> {
    try {
      const allOrders: Order[] = [];
      let cursor: string | undefined = undefined;
      let hasMore = true;
      const pageSize = 100; // Shopee max page size

      while (hasMore) {
        const result = await this.getOrdersWithPagination({
          ...options,
          limit: pageSize,
          cursor,
        } as any);

        allOrders.push(...result.orders);

        hasMore = result.more;
        cursor = result.nextCursor;

        // Check if we've reached the max items limit
        if (maxItems && allOrders.length >= maxItems) {
          return allOrders.slice(0, maxItems);
        }

        // Safety check to prevent infinite loops
        if (allOrders.length >= 50000) {
          console.warn("Reached safety limit of 50,000 orders");
          break;
        }
      }

      return allOrders;
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch all orders from Shopee",
        "FETCH_ALL_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const ordersList = await this.fetchOrderDetails([id]);
      const order = ordersList[0];

      if (!order) {
        throw new EcomConnectorError("Order not found", "ORDER_NOT_FOUND", 404);
      }

      return this.mapShopeeOrderToOrder(order);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Shopee`,
        "FETCH_ORDER_ERROR",
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    throw new EcomConnectorError(
      "Shopee does not support direct order status updates via API",
      "NOT_SUPPORTED",
      501
    );
  }

  /**
   * Generate authorization URL for shop authorization
   * @param redirectUrl - The redirect URL after authorization
   * @returns Authorization URL
   */
  generateAuthUrl(redirectUrl: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const path = ShopeeApiPath.GENERATE_AUTH_LINK;
    const baseString = `${this.credentials.partnerId}${path}${timestamp}`;

    const sign = crypto
      .createHmac("sha256", this.credentials.partnerKey)
      .update(baseString)
      .digest("hex");

    const params = new URLSearchParams({
      partner_id: this.credentials.partnerId.toString(),
      timestamp: timestamp.toString(),
      sign: sign,
      redirect: redirectUrl,
    });

    return `${this.baseURL}${path}?${params.toString()}`;
  }

  /**
   * Get access token using authorization code
   * @param code - Authorization code from callback
   * @param shopId - Shop ID (use either shopId or mainAccountId, not both)
   * @param mainAccountId - Main Account ID (use either shopId or mainAccountId, not both)
   * @returns Access token and related information
   */
  async getAccessToken(
    code: string,
    shopId?: string,
    mainAccountId?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expireIn: number;
    shopId?: number;
    mainAccountId?: number;
    partnerId: number;
  }> {
    try {
      if (!shopId && !mainAccountId) {
        throw new EcomConnectorError(
          "Either shopId or mainAccountId must be provided",
          "INVALID_PARAMS",
          400
        );
      }

      if (shopId && mainAccountId) {
        throw new EcomConnectorError(
          "Cannot provide both shopId and mainAccountId, use only one",
          "INVALID_PARAMS",
          400
        );
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const path = ShopeeApiPath.AUTH_TOKEN;
      const baseString = `${this.credentials.partnerId}${path}${timestamp}`;

      const sign = crypto
        .createHmac("sha256", this.credentials.partnerKey)
        .update(baseString)
        .digest("hex");

      const requestBody: any = {
        code,
        partner_id: parseInt(this.credentials.partnerId),
      };

      if (shopId) {
        requestBody.shop_id = parseInt(shopId);
      } else if (mainAccountId) {
        requestBody.main_account_id = parseInt(mainAccountId);
      }

      const response = await axios.post(`${this.baseURL}${path}`, requestBody, {
        params: {
          partner_id: this.credentials.partnerId,
          timestamp,
          sign,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message || "Failed to get access token",
          response.data.error,
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
   * @param shopId - Shop ID (use either shopId or mainAccountId, not both)
   * @param mainAccountId - Main Account ID (use either shopId or mainAccountId, not both)
   * @returns New access token and related information
   */
  async refreshAccessToken(
    refreshToken: string,
    shopId?: string,
    mainAccountId?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    expireIn: number;
    shopId?: number;
    mainAccountId?: number;
    partnerId: number;
  }> {
    try {
      if (!shopId && !mainAccountId) {
        throw new EcomConnectorError(
          "Either shopId or mainAccountId must be provided",
          "INVALID_PARAMS",
          400
        );
      }

      if (shopId && mainAccountId) {
        throw new EcomConnectorError(
          "Cannot provide both shopId and mainAccountId, use only one",
          "INVALID_PARAMS",
          400
        );
      }

      const timestamp = Math.floor(Date.now() / 1000);
      const path = ShopeeApiPath.REFRESH_TOKEN;
      const baseString = `${this.credentials.partnerId}${path}${timestamp}`;

      const sign = crypto
        .createHmac("sha256", this.credentials.partnerKey)
        .update(baseString)
        .digest("hex");

      const requestBody: any = {
        refresh_token: refreshToken,
        partner_id: parseInt(this.credentials.partnerId),
      };

      if (shopId) {
        requestBody.shop_id = parseInt(shopId);
      } else if (mainAccountId) {
        requestBody.main_account_id = parseInt(mainAccountId);
      }

      const response = await axios.post(`${this.baseURL}${path}`, requestBody, {
        params: {
          partner_id: this.credentials.partnerId,
          timestamp,
          sign,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message || "Failed to refresh access token",
          response.data.error,
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
   * @param language - Language code (default: 'en')
   * @returns List of categories
   */
  async getCategories(language: string = "en"): Promise<any> {
    try {
      const response = await this.client.get(ShopeeApiPath.GET_CATEGORY, {
        params: {
          language,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
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
   * @param language - Language code (default: 'en')
   * @returns Category attributes
   */
  async getCategoryAttributes(
    categoryId: number,
    language: string = "en"
  ): Promise<any> {
    try {
      const response = await this.client.get(ShopeeApiPath.GET_ATTRIBUTES, {
        params: {
          category_id: categoryId,
          language,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
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
   * Get brand list for a category
   * @param categoryId - Category ID
   * @param status - Brand status (1: normal, 2: pending, 3: banned)
   * @param pageSize - Page size (default: 100, max: 100)
   * @param offset - Offset (default: 0)
   * @returns Brand list
   */
  async getBrandList(
    categoryId: number,
    status: number = 1,
    pageSize: number = 100,
    offset: number = 0
  ): Promise<any> {
    try {
      const response = await this.client.get(ShopeeApiPath.GET_BRAND_LIST, {
        params: {
          category_id: categoryId,
          status,
          page_size: pageSize,
          offset,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get brand list",
        "GET_BRAND_LIST_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Update product stock
   * @param itemId - Item ID
   * @param stockList - List of stock updates
   * @returns Update result
   */
  async updateStock(
    itemId: number,
    stockList: Array<{ modelId: number; sellerStock: Array<{ stock: number }> }>
  ): Promise<any> {
    try {
      const body = keysToSnake({
        itemId,
        stockList,
      });

      const response = await this.client.post(ShopeeApiPath.UPDATE_STOCK, body);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to update stock",
        "UPDATE_STOCK_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Update product price
   * @param itemId - Item ID
   * @param priceList - List of price updates
   * @returns Update result
   */
  async updatePrice(
    itemId: number,
    priceList: Array<{ modelId: number; originalPrice: number }>
  ): Promise<any> {
    try {
      const body = keysToSnake({
        itemId,
        priceList,
      });

      const response = await this.client.post(ShopeeApiPath.UPDATE_PRICE, body);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to update price",
        "UPDATE_PRICE_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Unlist or list items
   * @param itemList - List of items to unlist/list
   * @returns Update result
   */
  async unlistItem(
    itemList: Array<{ itemId: number; unlist: boolean }>
  ): Promise<any> {
    try {
      const body = keysToSnake({
        itemList,
      });

      const response = await this.client.post(ShopeeApiPath.UNLIST_ITEM, body);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to unlist item",
        "UNLIST_ITEM_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Delete product
   * @param itemId - Item ID
   * @returns Delete result
   */
  async deleteProduct(itemId: number): Promise<any> {
    try {
      const body = {
        item_id: itemId,
      };

      const response = await this.client.post(ShopeeApiPath.DELETE_ITEM, body);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to delete product",
        "DELETE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get logistics channel list
   * @returns List of logistics channels
   */
  async getLogisticsChannelList(): Promise<any> {
    try {
      const response = await this.client.get(ShopeeApiPath.CHANNEL_LIST);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get logistics channel list",
        "GET_LOGISTICS_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Get shipping parameters for an order
   * @param orderSn - Order serial number
   * @returns Shipping parameters
   */
  async getShippingParameter(orderSn: string): Promise<any> {
    try {
      const response = await this.client.get(ShopeeApiPath.SHIPPING_PARAMS, {
        params: {
          order_sn: orderSn,
        },
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to get shipping parameter",
        "GET_SHIPPING_PARAMETER_ERROR",
        500,
        error
      );
    }
  }

  /**
   * Ship order
   * @param orderSn - Order serial number
   * @param pickup - Pickup information
   * @returns Ship order result
   */
  async shipOrder(
    orderSn: string,
    pickup: { addressId: number; pickupTimeId: string }
  ): Promise<any> {
    try {
      const body = keysToSnake({
        orderSn,
        pickup,
      });

      const response = await this.client.post(ShopeeApiPath.SHIP_ORDER, body);

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      return keysToCamel(response.data.response);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to ship order",
        "SHIP_ORDER_ERROR",
        500,
        error
      );
    }
  }
}
