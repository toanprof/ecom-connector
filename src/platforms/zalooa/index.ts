import axios, { AxiosInstance } from "axios";
import {
  ECommercePlatform,
  Product,
  ProductInput,
  ProductQueryOptions,
  Order,
  OrderQueryOptions,
  EcomConnectorConfig,
  EcomConnectorError,
  ZaloOACredentials,
} from "../../interfaces";
import { ZaloOAProduct, ZaloOAOrder } from "./types";
import { ZALO_CONSTANTS } from "./constants";
import { keysToCamel } from "../../utils/transform";

export class ZaloOAPlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: ZaloOACredentials;
  private baseURL: string = ZALO_CONSTANTS.ENDPOINT;

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as ZaloOACredentials;

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
        if (this.credentials.accessToken) {
          config.headers["access_token"] = this.credentials.accessToken;
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
          error.response?.data?.error?.toString() || "ZALO_ERROR",
          error.response?.status,
          error.response?.data
        );
      }
    );
  }

  private mapZaloOAProductToProduct(zaloProduct: ZaloOAProduct): Product {
    return {
      id: zaloProduct.id,
      name: zaloProduct.name,
      description: zaloProduct.description,
      price: zaloProduct.price,
      currency: "VND",
      stock: 0, // Zalo OA doesn't provide stock info in basic response
      images: zaloProduct.images,
      status: zaloProduct.status === 1 ? "active" : "inactive",
      createdAt: new Date(zaloProduct.created_time * 1000),
      updatedAt: new Date(zaloProduct.updated_time * 1000),
      platformSpecific: zaloProduct,
    };
  }

  private mapZaloOAOrderToOrder(zaloOrder: ZaloOAOrder): Order {
    return {
      id: zaloOrder.id,
      orderNumber: zaloOrder.order_code,
      status: this.mapZaloOrderStatus(zaloOrder.status),
      totalAmount: zaloOrder.total_amount,
      currency: "VND",
      items: zaloOrder.items.map((item) => ({
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
      customer: {
        id: zaloOrder.customer.user_id,
        name: zaloOrder.customer.name,
        phone: zaloOrder.customer.phone,
      },
      createdAt: new Date(zaloOrder.created_time * 1000),
      platformSpecific: zaloOrder,
    };
  }

  private mapZaloOrderStatus(status: number): string {
    const statusMap: { [key: number]: string } = {
      0: "PENDING",
      1: "CONFIRMED",
      2: "SHIPPING",
      3: "COMPLETED",
      4: "CANCELLED",
    };
    return statusMap[status] || "UNKNOWN";
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get("/oa/product/list", {
        params: {
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data.products.map((p: ZaloOAProduct) =>
        this.mapZaloOAProductToProduct(p)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch products from Zalo OA",
        "FETCH_PRODUCTS_ERROR",
        500,
        error
      );
    }
  }

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get(`/oa/product/detail`, {
        params: { product_id: id },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return this.mapZaloOAProductToProduct(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch product ${id} from Zalo OA`,
        "FETCH_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async createProduct(productData: ProductInput): Promise<Product> {
    try {
      const response = await this.client.post("/oa/product/create", {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        images: productData.images,
        ...productData.platformSpecific,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      // Response is already transformed to camelCase by interceptor
      return this.getProductById(response.data.data.productId);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to create product on Zalo OA",
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
      const response = await this.client.post("/oa/product/update", {
        product_id: id,
        ...productData,
        ...productData.platformSpecific,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return this.getProductById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update product ${id} on Zalo OA`,
        "UPDATE_PRODUCT_ERROR",
        500,
        error
      );
    }
  }

  async getOrders(options?: OrderQueryOptions): Promise<Order[]> {
    try {
      const response = await this.client.get("/oa/order/list", {
        params: {
          offset: options?.offset || 0,
          limit: options?.limit || 20,
        },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return response.data.data.orders.map((o: ZaloOAOrder) =>
        this.mapZaloOAOrderToOrder(o)
      );
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        "Failed to fetch orders from Zalo OA",
        "FETCH_ORDERS_ERROR",
        500,
        error
      );
    }
  }

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get("/oa/order/detail", {
        params: { order_id: id },
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return this.mapZaloOAOrderToOrder(response.data.data);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to fetch order ${id} from Zalo OA`,
        "FETCH_ORDER_ERROR",
        500,
        error
      );
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    try {
      const statusCode = this.reverseMapOrderStatus(status);
      const response = await this.client.post("/oa/order/update", {
        order_id: id,
        status: statusCode,
      });

      if (response.data.error !== 0) {
        throw new EcomConnectorError(
          response.data.message,
          "ZALO_API_ERROR",
          400,
          response.data
        );
      }

      return this.getOrderById(id);
    } catch (error) {
      if (error instanceof EcomConnectorError) throw error;
      throw new EcomConnectorError(
        `Failed to update order ${id} status on Zalo OA`,
        "UPDATE_ORDER_ERROR",
        500,
        error
      );
    }
  }

  private reverseMapOrderStatus(status: string): number {
    const statusMap: { [key: string]: number } = {
      PENDING: 0,
      CONFIRMED: 1,
      SHIPPING: 2,
      COMPLETED: 3,
      CANCELLED: 4,
    };
    return statusMap[status] || 0;
  }
}
