import { IProduct } from "../../types/common.types.js";
import ShopeeClient, { ShopeeApiError } from "../../api/shopee-client.js";

export class ProductService {
  private client: ShopeeClient;

  constructor(client: ShopeeClient) {
    this.client = client;
  }

  private mapItemToProduct(item: any): IProduct {
    return {
      id: item.item_id || item.id,
      name: item.name || item.item_name || "",
      description: item.description || item.detail || "",
      price: item.price || item.price_before_discount || undefined,
      stock:
        item.stock ||
        (item.models && item.models[0] && item.models[0].stock) ||
        undefined,
      model_id:
        item.model_id ||
        (item.models && item.models[0] && item.models[0].model_id) ||
        null,
      raw: item,
    };
  }

  public async getProducts(params: {
    page: number;
    pageSize: number;
    item_status?: "NORMAL" | "DELETED" | "UNLIST" | "BANNED";
  }): Promise<IProduct[]> {
    try {
      const queryParams: any = {
        offset: (params.page - 1) * params.pageSize,
        page_size: params.pageSize,
        item_status: params.item_status || "NORMAL",
      };
      console.log("🚀 ~ queryParams:", queryParams);
      const listResp = await this.client.request(
        "get",
        "product/get_item_list",
        undefined,
        queryParams
      );
      console.log("🚀 ~ listResp:", listResp);

      const itemList = listResp?.response?.item || listResp?.response?.item_id_list || [];
      const itemIds: number[] = Array.isArray(itemList) 
        ? itemList.map((item: any) => typeof item === 'number' ? item : item.item_id)
        : [];
      console.log("🚀 ~ itemIds:", itemIds);

      if (!Array.isArray(itemIds) || itemIds.length === 0) return [];

      const infoParams = {
        item_id_list: itemIds.join(","),
        need_tax_info: true,
        need_complaint_policy: true,
      };
      const infoResp = await this.client.request(
        "get",
        "product/get_item_base_info",
        undefined,
        infoParams
      );
      const items = infoResp?.response?.item_list || [];

      return items.map((it: any) => this.mapItemToProduct(it));
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async getProductById(productId: number): Promise<IProduct | null> {
    try {
      const queryParams = {
        item_id_list: productId.toString(),
        need_tax_info: true,
        need_complaint_policy: true,
      };
      const resp = await this.client.request(
        "get",
        "product/get_item_base_info",
        undefined,
        queryParams
      );
      const item = resp?.response?.item_list?.[0];
      if (!item) return null;
      return this.mapItemToProduct(item);
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async updateStock(
    productId: number,
    modelId: number | undefined,
    newStock: number
  ): Promise<any> {
    try {
      const payload: any = { item_id: productId };
      if (typeof modelId !== "undefined") payload.model_id = modelId;
      payload.stock = newStock;

      const resp = await this.client.request(
        "post",
        "product/update_stock",
        payload
      );
      return resp;
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async addItem(itemData: {
    original_price: number;
    description: string;
    item_name: string;
    item_sku?: string;
    category_id: number;
    image: {
      image_id_list: string[];
    };
    weight?: number;
    dimension?: {
      package_length: number;
      package_width: number;
      package_height: number;
    };
    logistic_info?: Array<{
      logistic_id: number;
      enabled: boolean;
    }>;
    pre_order?: {
      is_pre_order: boolean;
      days_to_ship: number;
    };
    condition?: "NEW" | "USED";
    brand?: {
      brand_id: number;
    };
  }): Promise<{ item_id: number; raw: any }> {
    try {
      const resp = await this.client.request(
        "post",
        "product/add_item",
        undefined,
        itemData
      );
      return {
        item_id: resp?.response?.item_id,
        raw: resp,
      };
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }

  public async uploadImage(
    imageUrl: string
  ): Promise<{ image_id: string; image_url: string }> {
    try {
      const resp = await this.client.request(
        "post",
        "media_space/upload_image",
        undefined,
        {
          image_url: imageUrl,
        }
      );
      return {
        image_id: resp?.response?.image_info?.image_id || "",
        image_url: resp?.response?.image_info?.image_url || "",
      };
    } catch (err) {
      if (err instanceof ShopeeApiError) throw err;
      throw new ShopeeApiError((err as Error).message);
    }
  }
}

export default ProductService;
