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

export class ShopeePlatform implements ECommercePlatform {
  private client: AxiosInstance;
  private credentials: ShopeeCredentials;
  private baseURL: string = "https://partner.shopeemobile.com";
  private pathPrefix: string = "";

  constructor(config: EcomConnectorConfig) {
    this.credentials = config.credentials as ShopeeCredentials;

    if (config.sandbox) {
      this.baseURL = "https://openplatform.sandbox.test-stable.shopee.sg";
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        "Content-Type": "application/json",
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

        config.params = {
          ...config.params,
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
      (response) => response,
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

  private mapShopeeProductToProduct(shopeeProduct: ShopeeProduct): Product {
    // Extract price info from nested structure
    const priceInfo = shopeeProduct.price_info?.[0];
    const price =
      priceInfo?.current_price ||
      priceInfo?.original_price ||
      shopeeProduct.price ||
      0;
    const currency = priceInfo?.currency || "VND";

    // Extract image URLs from nested structure
    const images =
      shopeeProduct.image?.image_url_list || shopeeProduct.images || [];

    // Extract stock from new stock_info_v2 structure
    const stock =
      shopeeProduct.stock_info_v2?.summary_info?.total_available_stock ||
      shopeeProduct.stock ||
      0;

    // Extract description from description_info if available
    const description =
      shopeeProduct.description ||
      shopeeProduct.description_info?.extended_description?.field_list?.[0]
        ?.text ||
      "";

    return {
      id: shopeeProduct.item_id.toString(),
      name: shopeeProduct.item_name,
      description,
      price,
      currency,
      stock,
      sku: shopeeProduct.item_sku || "",
      images,
      categoryId: shopeeProduct.category_id?.toString(),
      status: shopeeProduct.item_status === "NORMAL" ? "active" : "inactive",
      createdAt: new Date(shopeeProduct.create_time * 1000),
      updatedAt: new Date(shopeeProduct.update_time * 1000),
      platformSpecific: shopeeProduct,
    };
  }

  private mapShopeeOrderToOrder(shopeeOrder: ShopeeOrder): Order {
    return {
      id: shopeeOrder.order_sn,
      orderNumber: shopeeOrder.order_sn,
      status: shopeeOrder.order_status,
      totalAmount: shopeeOrder.total_amount,
      currency: shopeeOrder.currency,
      items: shopeeOrder.item_list.map((item) => ({
        productId: item.item_id.toString(),
        productName: item.item_name,
        quantity: item.model_quantity_purchased,
        price: item.model_discounted_price || item.model_original_price,
        sku: item.model_sku || item.item_sku,
      })),
      customer: {
        id: shopeeOrder.buyer_user_id.toString(),
        name: shopeeOrder.buyer_username || '',
      },
      shippingAddress: shopeeOrder.recipient_address ? {
        fullName: shopeeOrder.recipient_address.name,
        phone: shopeeOrder.recipient_address.phone,
        addressLine1: shopeeOrder.recipient_address.full_address,
        addressLine2: [shopeeOrder.recipient_address.district, shopeeOrder.recipient_address.town].filter(Boolean).join(', ') || undefined,
        city: shopeeOrder.recipient_address.city,
        state: shopeeOrder.recipient_address.state || shopeeOrder.recipient_address.region,
        country: shopeeOrder.recipient_address.country,
        postalCode: shopeeOrder.recipient_address.zipcode,
      } : undefined,
      createdAt: new Date(shopeeOrder.create_time * 1000),
      updatedAt: new Date(shopeeOrder.update_time * 1000),
      platformSpecific: shopeeOrder,
    };
  }

  async getProducts(options?: ProductQueryOptions): Promise<Product[]> {
    try {
      const response = await this.client.get("/api/v2/product/get_item_list", {
        params: {
          offset: options?.offset || 0,
          page_size: options?.limit || 20,
          item_status: options?.status || "NORMAL",
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

      const itemList =
        response.data.response?.item ||
        response.data.response?.item_id_list ||
        [];
      const itemIds: number[] = Array.isArray(itemList)
        ? itemList.map((item: any) =>
            typeof item === "number" ? item : item.item_id
          )
        : [];

      if (itemIds.length === 0) return [];

      const detailsResponse = await this.client.get(
        "/api/v2/product/get_item_base_info",
        {
          params: {
            item_id_list: itemIds.join(","),
            need_tax_info: true,
            need_complaint_policy: true,
          },
        }
      );

      if (detailsResponse.data.error) {
        throw new EcomConnectorError(
          detailsResponse.data.message,
          detailsResponse.data.error,
          400,
          detailsResponse.data
        );
      }

      return detailsResponse.data.response.item_list.map((p: ShopeeProduct) =>
        this.mapShopeeProductToProduct(p)
      );
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

  async getProductById(id: string): Promise<Product> {
    try {
      const response = await this.client.get(
        "/api/v2/product/get_item_base_info",
        {
          params: {
            item_id_list: id,
            need_tax_info: true,
            need_complaint_policy: true,
          },
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

      const product = response.data.response.item_list[0];
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
        "/api/v2/product/add_item",
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

      return this.getProductById(response.data.response.item_id.toString());
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
        "/api/v2/product/update_item",
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
        page_size: options?.limit || 100,
        time_range_field: "create_time",
        time_from: options?.startDate
          ? Math.floor(options.startDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000) - 86400 * 30,
        time_to: options?.endDate
          ? Math.floor(options.endDate.getTime() / 1000)
          : Math.floor(Date.now() / 1000),
      };

      // Add order_status filter if provided
      if (options?.status) {
        params.order_status = options.status;
      }

      const response = await this.client.get("/api/v2/order/get_order_list", {
        params: params,
      });

      if (response.data.error) {
        throw new EcomConnectorError(
          response.data.message,
          response.data.error,
          400,
          response.data
        );
      }

      const orderSns = response.data.response.order_list.map(
        (o: any) => o.order_sn
      );

      if (orderSns.length === 0) return [];

      // Get detailed order information with all optional fields
      const detailsResponse = await this.client.get(
        "/api/v2/order/get_order_detail",
        {
          params: {
            order_sn_list: orderSns.join(","),
            response_optional_fields: [
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
              'payment_info'
            ].join(','),
          },
        }
      );

      if (detailsResponse.data.error) {
        throw new EcomConnectorError(
          detailsResponse.data.message,
          detailsResponse.data.error,
          400,
          detailsResponse.data
        );
      }

      return detailsResponse.data.response.order_list.map((o: ShopeeOrder) =>
        this.mapShopeeOrderToOrder(o)
      );
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

  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await this.client.get("/api/v2/order/get_order_detail", {
        params: {
          order_sn_list: id,
          response_optional_fields: [
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
            'payment_info'
          ].join(','),
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

      const order = response.data.response.order_list[0];
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
}
