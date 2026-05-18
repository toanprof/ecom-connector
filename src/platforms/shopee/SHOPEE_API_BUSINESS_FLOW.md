# Shopee API Business Flow va Source Guide

Tai lieu nay tong hop tu:

- `D:/ecom-connector/shopee-sdk-1.6.1/docs/README.md`
- Toan bo file `.md` trong `D:/ecom-connector/shopee-sdk-1.6.1/docs/managers`
- Source thuc te trong `D:/ecom-connector/src/platforms/shopee`: `index.ts`, `sdk-api.ts`, `constants.ts`, `types.ts`

Muc tieu cua file nay la lam tai lieu doc hieu source cho AI: khi can sua Shopee connector, hay doc file nay truoc de nam kien truc, luong nghiep vu, quy tac ky request va danh sach API dang expose.

Ngay tao/cap nhat: 2026-05-18

## 1. Tong quan kien truc

Shopee connector trong repo nay co hai lop API song song:

1. **Common connector API** trong `ShopeePlatform implements ECommercePlatform`: tra ve model chuan cua repo nhu `Product`, `Order`; phu hop cho code muon dung chung nhieu san thuong mai dien tu.
2. **Shopee SDK API groups** trong `sdk-api.ts`: expose gan nhu toan bo surface cua `shopee-sdk-1.6.1/src/managers` bang cac group nhu `product`, `order`, `logistics`, `payment`, `voucher`. Cac method nay tra ve payload Shopee da chuyen key sang camelCase.

Entry point chinh:

- `src/factory.ts`: `createEcomConnector({ platform: "shopee", ... })` tra ve `new ShopeePlatform(config)`.
- `src/platforms/shopee/index.ts`: chua request signing, axios interceptors, mapper sang interface chung, pagination helper va alias auth.
- `src/platforms/shopee/sdk-api.ts`: data-only catalog gom 431 API definitions tren 29 group.
- `src/platforms/shopee/constants.ts`: endpoint base, enum status, API path cho wrapper common, optional fields cua order.
- `src/platforms/shopee/types.ts`: type thuan Shopee response cho product/order.

## 2. Khoi tao va credentials

Config Shopee dung chung interface `EcomConnectorConfig`:

```ts
const shopee = createEcomConnector({
  platform: "shopee",
  sandbox: true,
  timeout: 30000,
  credentials: {
    partnerId: process.env.SHOPEE_PARTNER_ID!,
    partnerKey: process.env.SHOPEE_PARTNER_KEY!,
    shopId: process.env.SHOPEE_SHOP_ID!,
    accessToken: process.env.SHOPEE_ACCESS_TOKEN,
  },
});
```

Base URL:

- Production: `https://partner.shopeemobile.com`
- Sandbox: `https://openplatform.sandbox.test-stable.shopee.sg`

Luu y source hien tai khai bao `ShopeeCredentials.shopId` la required trong `interfaces.ts`, nhung auth flow `getAccessToken` van ho tro shop-level hoac main-account-level bang tham so `shopId`/`mainAccountId`. Cac SDK API co `auth: true` bat buoc phai co `accessToken` va `shopId` trong credentials.

## 3. Quy tac request, sign va transform data

### 3.1 Common API qua axios instance

Cac method common trong `index.ts` dung `this.client` va interceptor:

- Moi request them query: `partner_id`, `timestamp`, `sign`, `shop_id`; neu co token thi them `access_token`.
- Input `params` duoc chuyen camelCase -> snake_case bang `keysToSnake`.
- Response JSON duoc chuyen snake_case -> camelCase bang `keysToCamel`.
- Loi Shopee duoc boc thanh `EcomConnectorError(message, code, statusCode, platformError)`.

Chuoi ky common:

```txt
partnerId + apiPath + timestamp + accessToken + shopId
```

Neu chua co `accessToken` hoac `shopId`, chuoi ky chi gom `partnerId + apiPath + timestamp`. `apiPath` bao gom prefix path cua baseURL neu base URL co path.

### 3.2 SDK API data-driven

Cac group trong `sdkApi` duoc tao bang `createShopeeSdkApiGroups(requestSdkApi)`. Moi definition co:

```ts
{
  group: "product",
  method: "getItemList",
  path: "/product/get_item_list",
  httpMethod: "GET",
  auth: true,
  commaParams?: ["item_id_list"],
}
```

`requestSdkApi` xu ly chung:

- Tu dong prefix `/api/v2` neu path chua co.
- GET dua params len query string; POST/PUT/PATCH/DELETE dua params vao JSON body.
- Params nhan vao nen viet camelCase; ham se chuyen sang snake_case.
- Cac param trong `commaParams` neu la array se duoc join thanh chuoi dau phay, vi Shopee yeu cau mot so field nhu `order_sn_list`, `item_id_list`.
- Response dung `arraybuffer` de ho tro ca binary document. Neu `content-type` khong phai JSON thi tra ve `Buffer`.
- Neu HTTP status >= 400 hoac payload co `error`, nem `EcomConnectorError`.

Chuoi ky SDK API:

```txt
partnerId + /api/v2/... + timestamp              // public endpoint
partnerId + /api/v2/... + timestamp + accessToken + shopId  // auth endpoint
```

### 3.3 Cach goi SDK API group

Tat ca group duoc expose truc tiep tren instance:

```ts
const platform = createEcomConnector(config) as ShopeePlatform;

const list = await platform.product.getItemList({
  offset: 0,
  pageSize: 50,
  itemStatus: "NORMAL",
});

const detail = await platform.order.getOrdersDetail({
  orderSnList: ["230101ABCDEF"],
  responseOptionalFields: "item_list,total_amount,recipient_address",
});
```

Cung co `platform.sdkApi.product.getItemList(...)`. Hai cach nay tro ve cung mot requester.

## 4. Common connector API va luong xu ly

Day la lop API dung chung cho app muon abstract nhieu san.

### 4.1 Product sync

Method common:

| Method | Endpoint Shopee | Luong xu ly |
| --- | --- | --- |
| `getProducts(options)` | `GET /api/v2/product/get_item_list` + `GET /api/v2/product/get_item_base_info` | Lay danh sach item id, fetch detail theo batch, neu item co model thi fetch `get_model_list`, map sang `Product[]`. |
| `getProductsWithPagination(options)` | Nhu tren | Tra `products`, `totalCount`, `hasNextPage`, `nextOffset`. |
| `getAllProducts(options, maxItems)` | Lap `getProductsWithPagination` | Auto paginate voi `pageSize=50`, dung khi het `hasNextPage`, cham `maxItems`, hoac safety limit 10,000 product. |
| `getProductById(id)` | `GET /product/get_item_base_info` | Fetch detail 1 item, map sang `Product`, throw `PRODUCT_NOT_FOUND` neu rong. |
| `createProduct(productData)` | `POST /product/add_item` | Map `ProductInput` sang Shopee field, tao item, sau do fetch lai bang `getProductById`. |
| `updateProduct(id, productData)` | Dang goi `POST /product/add_item` | Source co comment `UPDATE_ITEM may not exist`. Thuc te SDK API co `product.updateItem`; can can than neu sua behavior nay. |
| `updateStock(itemId, stockList)` | `POST /product/update_stock` | Body snake_case gom `item_id`, `stock_list`. |
| `updatePrice(itemId, priceList)` | `POST /product/update_price` | Body snake_case gom `item_id`, `price_list`. |
| `unlistItem(itemList)` | `POST /product/unlist_item` | Bat/tat listing cho nhieu item. |
| `deleteProduct(itemId)` | `POST /product/delete_item` | Xoa item tren Shopee. |
| `getCategories(language)` | `GET /product/get_category` | Lay category tree. |
| `getCategoryAttributes(categoryId, language)` | `GET /product/get_attributes` | Lay attribute theo category. |
| `getBrandList(categoryId, status, pageSize, offset)` | `GET /product/get_brand_list` | Lay brand theo category. |

Mapping product:

- `id` = `itemId.toString()`
- `name` = `itemName`
- `price` = min model current/original price neu co model, fallback `priceInfo[0]`, fallback `price`.
- `stock` = tong model available stock neu co model, fallback item `stockInfoV2.summaryInfo.totalAvailableStock`, fallback `stock`.
- `images` = `image.imageUrlList` hoac `images`.
- `status` = `NORMAL` -> `active`, con lai -> `inactive`.
- Payload Shopee goc luu trong `platformSpecific`.

### 4.2 Order sync va fulfillment co ban

Method common:

| Method | Endpoint Shopee | Luong xu ly |
| --- | --- | --- |
| `getOrders(options)` | `GET /order/get_order_list` + `GET /order/get_order_detail` | Lay order SN trong khoang thoi gian, fetch detail voi `SHOPEE_ORDER_OPTIONAL_FIELDS`, map sang `Order[]`. |
| `getOrdersWithPagination(options)` | Nhu tren | Ho tro cursor pagination, tra `orders`, `more`, `nextCursor`. |
| `getAllOrders(options, maxItems)` | Lap `getOrdersWithPagination` | Auto paginate voi `pageSize=100`, dung khi `more=false`, cham `maxItems`, hoac safety limit 50,000 order. |
| `getOrderById(id)` | `GET /order/get_order_detail` | Fetch detail theo `order_sn`, throw `ORDER_NOT_FOUND` neu rong. |
| `updateOrderStatus(id, status)` | Khong co | Throw `NOT_SUPPORTED`; Shopee khong cho update order status truc tiep. |
| `getLogisticsChannelList()` | `GET /logistics/get_channel_list` | Lay kenh van chuyen. |
| `getShippingParameter(orderSn)` | `GET /logistics/get_shipping_parameter` | Lay pickup/dropoff/shipping params truoc khi ship. |
| `shipOrder(orderSn, pickup)` | `POST /logistics/ship_order` | Tao shipment/pickup cho order. |

Default order window neu khong truyen date: 15 ngay gan nhat theo `create_time`. Neu can dong bo lich su dai hon, app phai chia khoang thoi gian theo gioi han Shopee.

Mapping order:

- `id`, `orderNumber` = `orderSn`
- `status` = `orderStatus`
- `items[]` map tu `itemList`, gia = `modelDiscountedPrice || modelOriginalPrice`
- `customer.id` = `buyerUserId`, `customer.name` = `buyerUsername`
- `shippingAddress` map tu `recipientAddress`
- Payload Shopee goc luu trong `platformSpecific`.

## 5. Luong nghiep vu khuyen nghi

### 5.1 Onboard shop va token lifecycle

1. Goi `generateAuthUrl(redirectUrl)` de tao URL authorize shop.
2. Seller mo URL va Shopee redirect ve app voi `code` va `shop_id` hoac main-account id.
3. Goi `getAccessToken(code, shopId)` hoac `auth.getAccessToken({ code, shopId })`.
4. Luu `accessToken`, `refreshToken`, `expireIn`, `shopId`, `partnerId` vao token storage cua app.
5. Truoc khi token het han, goi `refreshAccessToken(refreshToken, shopId)` hoac `auth.getRefreshToken({ refreshToken, shopId })`.

Luu y: auth methods trong `this.auth` co alias dac biet cho phep goi ca dang object hoac dang positional:

```ts
await shopee.auth.getAccessToken("code", "shopId");
await shopee.auth.getRefreshToken("refreshToken", "shopId");
```

### 5.2 Dong bo catalog

1. Lay danh sach item: `product.getItemList` hoac common `getProductsWithPagination`.
2. Lay base info: `product.getItemBaseInfo({ itemIdList: [...] })`.
3. Neu item `hasModel`, lay variation/model: `product.getModelList({ itemId })`.
4. Lay metadata khi can tao/sua item: `product.getCategory`, `product.getAttributeTree`, `product.getBrandList`, `product.categoryRecommend`.
5. Cap nhat nhanh ton/gia bang `product.updateStock`, `product.updatePrice` hoac common `updateStock`, `updatePrice`.
6. Kiem tra promotion/violation/content diagnosis neu can dong bo chat luong listing.

### 5.3 Tao hoac sua san pham

1. Lay category/attribute/brand bat buoc.
2. Upload anh qua `media.uploadImage`, `media.uploadMediaImage` hoac `mediaSpace.uploadImage` tuy business scene.
3. Goi `product.addItem` de tao item. Neu dung common `createProduct`, can truyen them Shopee-specific field trong `platformSpecific`.
4. Neu san pham co variation, dung `product.initTierVariation`, `product.addModel`, `product.updateModel`.
5. Cap nhat gia/ton sau khi tao model bang `product.updatePrice`, `product.updateStock`.
6. Publish/unlist/delete bang `product.unlistItem`, `product.deleteItem`.

### 5.4 Dong bo va xu ly don hang

1. Poll order list theo `create_time` hoac `update_time`: `order.getOrderList` hoac common `getOrdersWithPagination`.
2. Lay detail theo batch: `order.getOrdersDetail({ orderSnList, responseOptionalFields })`.
3. Neu order can ship, lay shipment list/package detail neu can: `order.getShipmentList`, `order.getPackageDetail`.
4. Lay shipping parameter: `logistics.getShippingParameter`.
5. Ship order: `logistics.shipOrder`, `logistics.batchShipOrder` hoac `logistics.massShipOrder`.
6. Tao va download shipping document: `logistics.createShippingDocument`, `logistics.getShippingDocumentResult`, `logistics.downloadShippingDocument`.
7. Theo doi tracking: `logistics.getTrackingNumber`, `logistics.getTrackingInfo`.
8. Doi soat tien: `payment.getEscrowDetail`, `payment.getEscrowList`, `payment.getPayoutInfo`.

### 5.5 Return/refund

1. Poll `returns.getReturnList`.
2. Lay detail bang `returns.getReturnDetail`.
3. Lay solution hop le: `returns.getAvailableSolutions`.
4. Chap nhan/thuong luong/tranh chap bang `confirm`, `offer`, `acceptOffer`, `dispute`, `cancelDispute`.
5. Upload bang chung neu can: `convertImage`, `uploadProof`, `queryProof`.
6. Theo doi van chuyen nguoc: `getShippingCarrier`, `uploadShippingProof`, `getReverseTrackingInfo`.

### 5.6 Marketing va growth

- Voucher: `voucher.addVoucher` -> `getVoucherList`/`getVoucher` -> `updateVoucher` -> `endVoucher`/`deleteVoucher`.
- Discount: `discount.addDiscount` -> `addDiscountItem` -> `updateDiscountItem` -> `endDiscount`.
- Bundle deal: `bundleDeal.addBundleDeal` -> `addBundleDealItem` -> `updateBundleDeal` -> `endBundleDeal`.
- Add-on deal: `addOnDeal.addAddOnDeal` -> `addAddOnDealMainItem` -> `addAddOnDealSubItem`.
- Flash sale: `shopFlashSale.getTimeSlotId` -> `createShopFlashSale` -> `addShopFlashSaleItems` -> monitor/update/delete.
- Ads/AMS: dung cac group `ads` va `ams` de tao campaign, cap nhat budget/bid/commission va doc performance.
- Video/Livestream/Top Picks/Follow Prize: dung cho content commerce va shop engagement.

### 5.7 Webhook/push va lost message recovery

1. Set URL webhook bang `push.setAppPushConfig`.
2. Doc config bang `push.getAppPushConfig`.
3. Handler webhook cua app nen verify signature, tra response nhanh, xu ly idempotent.
4. Dinh ky recovery lost message bang `push.getLostPushMessage`.
5. Sau khi xu ly thanh cong, goi `push.confirmConsumedLostPushMessage`.

## 6. Danh muc API theo manager

Tong so API dang expose tu `sdk-api.ts`: **431**. Trong do **389** API can shop auth va **42** API public/partner.

| Group | So API | Auth/Public | Y nghia nghiep vu |
| --- | ---: | --- | --- |
| `accountHealth` | 7 | 7/0 | Theo doi suc khoe shop: diem phat, hieu suat van hanh, lich su vi pham, listing co van de va don hang tre. |
| `addOnDeal` | 14 | 14/0 | Quan ly uu dai mua kem/gift with minimum spend: tao campaign, gan main item, gan sub item, cap nhat, ket thuc va xoa. |
| `ads` | 25 | 25/0 | Quan ly quang cao Shopee: so du, goi y keyword/item, Auto Product Ads, Manual Product Ads, GMS campaign va bao cao hieu suat. |
| `ams` | 36 | 36/0 | Quan ly affiliate marketing: open campaign, targeted campaign, commission, affiliate list, validation va bao cao chuyen doi. |
| `auth` | 3 | 0/3 | Lay access token bang authorization code/resend code va refresh access token. Nhom nay la public auth, khong can access token hien tai. |
| `bundleDeal` | 10 | 10/0 | Quan ly bundle deal: tao bundle, them/xoa item, doc danh sach, cap nhat va ket thuc campaign. |
| `discount` | 12 | 12/0 | Quan ly chuong trinh giam gia cua shop va SIP discount: tao, them item, cap nhat, ket thuc, xoa va doc danh sach. |
| `fbs` | 4 | 4/0 | Nhom dac thu Brazil FBS: kiem tra enrollment, block status, invoice error va SKU block. |
| `firstMile` | 16 | 16/0 | Quan ly first-mile logistics: tao/bind tracking number, courier delivery, waybill va danh sach don chua bind. |
| `followPrize` | 6 | 6/0 | Quan ly follow prize de thuong voucher/coin cho nguoi follow shop. |
| `globalProduct` | 34 | 34/0 | Quan ly global item cho shop cross-border: global catalog, model, stock/price, publish task, sync field va size chart. |
| `livestream` | 25 | 0/25 | Quan ly livestream session, shopping bag item, item set, comment, show item, metric va upload anh cho livestream. |
| `logistics` | 46 | 46/0 | Quan ly giao van: kenh van chuyen, pickup/dropoff, ship order, tracking, shipping document, booking, mass shipping, address va gio hoat dong. |
| `mediaSpace` | 6 | 3/3 | Upload anh san pham va video theo multipart session: init, upload part, complete, poll result, cancel. |
| `media` | 7 | 4/3 | Upload anh/video dung chung cho media va media_space. Mot so endpoint la public multipart upload, mot so endpoint can shop auth. |
| `merchant` | 6 | 6/0 | Quan ly merchant-level info: thong tin merchant, prepaid account, warehouse, shop list va shop eligible theo warehouse. |
| `order` | 21 | 21/0 | Dong bo va xu ly don: list/detail, shipment, split/unsplit, cancel, package, invoice, buyer cancellation, booking va FBS invoice. |
| `payment` | 16 | 15/1 | Doi soat tai chinh: escrow, wallet transaction, installment, income report/statement, billing va payout. |
| `product` | 58 | 58/0 | Quan ly catalog shop: item, model/variation, stock/price, category/attribute/brand, comment, boost, violation, kit, SSP, size chart va mart mapping. |
| `public` | 3 | 0/3 | Endpoint public cua partner: shop da authorize, merchant da authorize va Shopee IP ranges. |
| `push` | 4 | 0/4 | Cau hinh webhook/push, doc push config, lay lost messages va confirm da consume. |
| `returns` | 15 | 15/0 | Xu ly return/refund: danh sach/detail, confirm, dispute, offer, bang chung, shipping proof va reverse tracking. |
| `sbs` | 5 | 5/0 | Quan ly ton kho SBS warehouse: bound warehouse, current inventory, expiry, aging va stock movement. |
| `shopCategory` | 7 | 7/0 | Quan ly danh muc/collection trong shop va gan/xoa item vao category. |
| `shopFlashSale` | 11 | 11/0 | Quan ly flash sale cua shop: time slot, campaign, item, criteria, status va lifecycle. |
| `shop` | 9 | 9/0 | Quan ly thong tin shop: profile, shop info, warehouse detail, notification, authorized brand, BR onboarding va holiday mode. |
| `topPicks` | 4 | 4/0 | Quan ly bo suu tap Top Picks/featured collections cua shop. |
| `video` | 15 | 15/0 | Quan ly video va analytics: post/edit/delete/list/detail, cover, metric trend, performance, demographics. |
| `voucher` | 6 | 6/0 | Quan ly voucher cua shop: tao, cap nhat, lay detail/list, ket thuc va xoa. |

## 7. API catalog day du tu sdk-api.ts

### Account Health - `accountHealth` (7 APIs)

Theo doi suc khoe shop: diem phat, hieu suat van hanh, lich su vi pham, listing co van de va don hang tre.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getShopPenalty` | `GET` | `/account_health/shop_penalty` | Shop auth |  |
| `getShopPerformance` | `GET` | `/account_health/get_shop_performance` | Shop auth |  |
| `getMetricSourceDetail` | `GET` | `/account_health/get_metric_source_detail` | Shop auth |  |
| `getPenaltyPointHistory` | `GET` | `/account_health/get_penalty_point_history` | Shop auth |  |
| `getPunishmentHistory` | `GET` | `/account_health/get_punishment_history` | Shop auth |  |
| `getListingsWithIssues` | `GET` | `/account_health/get_listings_with_issues` | Shop auth |  |
| `getLateOrders` | `GET` | `/account_health/get_late_orders` | Shop auth |  |

### Add-on Deal - `addOnDeal` (14 APIs)

Quan ly uu dai mua kem/gift with minimum spend: tao campaign, gan main item, gan sub item, cap nhat, ket thuc va xoa.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addAddOnDeal` | `POST` | `/add_on_deal/add_add_on_deal` | Shop auth |  |
| `addAddOnDealMainItem` | `POST` | `/add_on_deal/add_add_on_deal_main_item` | Shop auth |  |
| `addAddOnDealSubItem` | `POST` | `/add_on_deal/add_add_on_deal_sub_item` | Shop auth |  |
| `deleteAddOnDeal` | `POST` | `/add_on_deal/delete_add_on_deal` | Shop auth |  |
| `deleteAddOnDealMainItem` | `POST` | `/add_on_deal/delete_add_on_deal_main_item` | Shop auth |  |
| `deleteAddOnDealSubItem` | `POST` | `/add_on_deal/delete_add_on_deal_sub_item` | Shop auth |  |
| `endAddOnDeal` | `POST` | `/add_on_deal/end_add_on_deal` | Shop auth |  |
| `getAddOnDeal` | `GET` | `/add_on_deal/get_add_on_deal` | Shop auth |  |
| `getAddOnDealList` | `GET` | `/add_on_deal/get_add_on_deal_list` | Shop auth |  |
| `getAddOnDealMainItem` | `GET` | `/add_on_deal/get_add_on_deal_main_item` | Shop auth |  |
| `getAddOnDealSubItem` | `GET` | `/add_on_deal/get_add_on_deal_sub_item` | Shop auth |  |
| `updateAddOnDeal` | `POST` | `/add_on_deal/update_add_on_deal` | Shop auth |  |
| `updateAddOnDealMainItem` | `POST` | `/add_on_deal/update_add_on_deal_main_item` | Shop auth |  |
| `updateAddOnDealSubItem` | `POST` | `/add_on_deal/update_add_on_deal_sub_item` | Shop auth |  |

### Ads - `ads` (25 APIs)

Quan ly quang cao Shopee: so du, goi y keyword/item, Auto Product Ads, Manual Product Ads, GMS campaign va bao cao hieu suat.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getTotalBalance` | `GET` | `/ads/get_total_balance` | Shop auth |  |
| `getShopToggleInfo` | `GET` | `/ads/get_shop_toggle_info` | Shop auth |  |
| `getRecommendedKeywordList` | `GET` | `/ads/get_recommended_keyword_list` | Shop auth |  |
| `getRecommendedItemList` | `GET` | `/ads/get_recommended_item_list` | Shop auth |  |
| `getAllCpcAdsHourlyPerformance` | `GET` | `/ads/get_all_cpc_ads_hourly_performance` | Shop auth |  |
| `getAllCpcAdsDailyPerformance` | `GET` | `/ads/get_all_cpc_ads_daily_performance` | Shop auth |  |
| `getProductCampaignDailyPerformance` | `GET` | `/ads/get_product_campaign_daily_performance` | Shop auth |  |
| `getProductCampaignHourlyPerformance` | `GET` | `/ads/get_product_campaign_hourly_performance` | Shop auth |  |
| `getProductLevelCampaignIdList` | `GET` | `/ads/get_product_level_campaign_id_list` | Shop auth |  |
| `getProductLevelCampaignSettingInfo` | `GET` | `/ads/get_product_level_campaign_setting_info` | Shop auth |  |
| `getProductRecommendedRoiTarget` | `GET` | `/ads/get_product_recommended_roi_target` | Shop auth |  |
| `checkCreateGmsProductCampaignEligibility` | `GET` | `/ads/check_create_gms_product_campaign_eligibility` | Shop auth |  |
| `createAutoProductAds` | `POST` | `/ads/create_auto_product_ads` | Shop auth |  |
| `createGmsProductCampaign` | `POST` | `/ads/create_gms_product_campaign` | Shop auth |  |
| `createManualProductAds` | `POST` | `/ads/create_manual_product_ads` | Shop auth |  |
| `editAutoProductAds` | `POST` | `/ads/edit_auto_product_ads` | Shop auth |  |
| `editGmsItemProductCampaign` | `POST` | `/ads/edit_gms_item_product_campaign` | Shop auth |  |
| `editGmsProductCampaign` | `POST` | `/ads/edit_gms_product_campaign` | Shop auth |  |
| `editManualProductAdKeywords` | `POST` | `/ads/edit_manual_product_ad_keywords` | Shop auth |  |
| `editManualProductAds` | `POST` | `/ads/edit_manual_product_ads` | Shop auth |  |
| `getAdsFacilShopRate` | `GET` | `/ads/get_ads_facil_shop_rate` | Shop auth |  |
| `getCreateProductAdBudgetSuggestion` | `GET` | `/ads/get_create_product_ad_budget_suggestion` | Shop auth |  |
| `getGmsCampaignPerformance` | `POST` | `/ads/get_gms_campaign_performance` | Shop auth |  |
| `getGmsItemPerformance` | `POST` | `/ads/get_gms_item_performance` | Shop auth |  |
| `listGmsUserDeletedItem` | `POST` | `/ads/list_gms_user_deleted_item` | Shop auth |  |

### Affiliate Marketing (AMS) - `ams` (36 APIs)

Quan ly affiliate marketing: open campaign, targeted campaign, commission, affiliate list, validation va bao cao chuyen doi.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addAllProductsToOpenCampaign` | `POST` | `/ams/add_all_products_to_open_campaign` | Shop auth |  |
| `batchAddProductsToOpenCampaign` | `POST` | `/ams/batch_add_products_to_open_campaign` | Shop auth |  |
| `batchEditProductsOpenCampaignSetting` | `POST` | `/ams/batch_edit_products_open_campaign_setting` | Shop auth |  |
| `batchGetProductsSuggestedRate` | `GET` | `/ams/batch_get_products_suggested_rate` | Shop auth |  |
| `batchRemoveProductsOpenCampaignSetting` | `POST` | `/ams/batch_remove_products_open_campaign_setting` | Shop auth |  |
| `editAllProductsOpenCampaignSetting` | `POST` | `/ams/edit_all_products_open_campaign_setting` | Shop auth |  |
| `getOpenCampaignAddedProduct` | `GET` | `/ams/get_open_campaign_added_product` | Shop auth |  |
| `getOpenCampaignBatchTaskResult` | `GET` | `/ams/get_open_campaign_batch_task_result` | Shop auth |  |
| `getOpenCampaignNotAddedProduct` | `GET` | `/ams/get_open_campaign_not_added_product` | Shop auth |  |
| `getOpenCampaignPerformance` | `GET` | `/ams/get_open_campaign_performance` | Shop auth |  |
| `removeAllProductsOpenCampaignSetting` | `POST` | `/ams/remove_all_products_open_campaign_setting` | Shop auth |  |
| `createNewTargetedCampaign` | `POST` | `/ams/create_new_targeted_campaign` | Shop auth |  |
| `editAffiliateListOfTargetedCampaign` | `POST` | `/ams/edit_affiliate_list_of_targeted_campaign` | Shop auth |  |
| `editProductListOfTargetedCampaign` | `POST` | `/ams/edit_product_list_of_targeted_campaign` | Shop auth |  |
| `getTargetedCampaignAddableProductList` | `GET` | `/ams/get_targeted_campaign_addable_product_list` | Shop auth |  |
| `getTargetedCampaignList` | `GET` | `/ams/get_targeted_campaign_list` | Shop auth |  |
| `getTargetedCampaignPerformance` | `GET` | `/ams/get_targeted_campaign_performance` | Shop auth |  |
| `getTargetedCampaignSettings` | `GET` | `/ams/get_targeted_campaign_settings` | Shop auth |  |
| `terminateTargetedCampaign` | `POST` | `/ams/terminate_targeted_campaign` | Shop auth |  |
| `updateBasicInfoOfTargetedCampaign` | `POST` | `/ams/update_basic_info_of_targeted_campaign` | Shop auth |  |
| `getAffiliatePerformance` | `GET` | `/ams/get_affiliate_performance` | Shop auth |  |
| `getAutoAddNewProductToggleStatus` | `GET` | `/ams/get_auto_add_new_product_toggle_status` | Shop auth |  |
| `getCampaignKeyMetricsPerformance` | `GET` | `/ams/get_campaign_key_metrics_performance` | Shop auth |  |
| `getContentPerformance` | `GET` | `/ams/get_content_performance` | Shop auth |  |
| `getConversionReport` | `GET` | `/ams/get_conversion_report` | Shop auth |  |
| `getManagedAffiliateList` | `GET` | `/ams/get_managed_affiliate_list` | Shop auth |  |
| `getOptimizationSuggestionProduct` | `GET` | `/ams/get_optimization_suggestion_product` | Shop auth |  |
| `getPerformanceDataUpdateTime` | `GET` | `/ams/get_performance_data_update_time` | Shop auth |  |
| `getProductPerformance` | `GET` | `/ams/get_product_performance` | Shop auth |  |
| `getRecommendedAffiliateList` | `GET` | `/ams/get_recommended_affiliate_list` | Shop auth |  |
| `getShopPerformance` | `GET` | `/ams/get_shop_performance` | Shop auth |  |
| `getShopSuggestedRate` | `GET` | `/ams/get_shop_suggested_rate` | Shop auth |  |
| `getValidationList` | `GET` | `/ams/get_validation_list` | Shop auth |  |
| `getValidationReport` | `GET` | `/ams/get_validation_report` | Shop auth |  |
| `queryAffiliateList` | `GET` | `/ams/query_affiliate_list` | Shop auth |  |
| `updateAutoAddNewProductSetting` | `POST` | `/ams/update_auto_add_new_product_setting` | Shop auth |  |

### Auth - `auth` (3 APIs)

Lay access token bang authorization code/resend code va refresh access token. Nhom nay la public auth, khong can access token hien tai.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getAccessToken` | `POST` | `/auth/token/get` | Public/partner |  |
| `getAccessTokenByResendCode` | `POST` | `/public/get_token_by_resend_code` | Public/partner |  |
| `getRefreshToken` | `POST` | `/auth/access_token/get` | Public/partner |  |

### Bundle Deal - `bundleDeal` (10 APIs)

Quan ly bundle deal: tao bundle, them/xoa item, doc danh sach, cap nhat va ket thuc campaign.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addBundleDeal` | `POST` | `/bundle_deal/add_bundle_deal` | Shop auth |  |
| `addBundleDealItem` | `POST` | `/bundle_deal/add_bundle_deal_item` | Shop auth |  |
| `deleteBundleDeal` | `POST` | `/bundle_deal/delete_bundle_deal` | Shop auth |  |
| `deleteBundleDealItem` | `POST` | `/bundle_deal/delete_bundle_deal_item` | Shop auth |  |
| `endBundleDeal` | `POST` | `/bundle_deal/end_bundle_deal` | Shop auth |  |
| `getBundleDeal` | `POST` | `/bundle_deal/get_bundle_deal` | Shop auth |  |
| `getBundleDealItem` | `POST` | `/bundle_deal/get_bundle_deal_item` | Shop auth |  |
| `getBundleDealList` | `POST` | `/bundle_deal/get_bundle_deal_list` | Shop auth |  |
| `updateBundleDeal` | `POST` | `/bundle_deal/update_bundle_deal` | Shop auth |  |
| `updateBundleDealItem` | `POST` | `/bundle_deal/update_bundle_deal_item` | Shop auth |  |

### Discount - `discount` (12 APIs)

Quan ly chuong trinh giam gia cua shop va SIP discount: tao, them item, cap nhat, ket thuc, xoa va doc danh sach.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addDiscount` | `POST` | `/discount/add_discount` | Shop auth |  |
| `addDiscountItem` | `POST` | `/discount/add_discount_item` | Shop auth |  |
| `deleteDiscount` | `POST` | `/discount/delete_discount` | Shop auth |  |
| `deleteDiscountItem` | `POST` | `/discount/delete_discount_item` | Shop auth |  |
| `endDiscount` | `POST` | `/discount/end_discount` | Shop auth |  |
| `getDiscount` | `GET` | `/discount/get_discount` | Shop auth |  |
| `getDiscountList` | `GET` | `/discount/get_discount_list` | Shop auth |  |
| `updateDiscount` | `POST` | `/discount/update_discount` | Shop auth |  |
| `updateDiscountItem` | `POST` | `/discount/update_discount_item` | Shop auth |  |
| `getSipDiscounts` | `GET` | `/discount/get_sip_discounts` | Shop auth |  |
| `setSipDiscount` | `POST` | `/discount/set_sip_discount` | Shop auth |  |
| `deleteSipDiscount` | `POST` | `/discount/delete_sip_discount` | Shop auth |  |

### Fulfillment by Shopee Brazil (FBS) - `fbs` (4 APIs)

Nhom dac thu Brazil FBS: kiem tra enrollment, block status, invoice error va SKU block.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `queryBrShopEnrollmentStatus` | `GET` | `/fbs/query_br_shop_enrollment_status` | Shop auth |  |
| `queryBrShopBlockStatus` | `GET` | `/fbs/query_br_shop_block_status` | Shop auth |  |
| `queryBrShopInvoiceError` | `GET` | `/fbs/query_br_shop_invoice_error` | Shop auth |  |
| `queryBrSkuBlockStatus` | `GET` | `/fbs/query_br_sku_block_status` | Shop auth |  |

### First Mile - `firstMile` (16 APIs)

Quan ly first-mile logistics: tao/bind tracking number, courier delivery, waybill va danh sach don chua bind.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `bindCourierDeliveryFirstMileTrackingNumber` | `POST` | `/first_mile/bind_courier_delivery_first_mile_tracking_number` | Shop auth |  |
| `bindFirstMileTrackingNumber` | `POST` | `/first_mile/bind_first_mile_tracking_number` | Shop auth |  |
| `generateAndBindFirstMileTrackingNumber` | `POST` | `/first_mile/generate_and_bind_first_mile_tracking_number` | Shop auth |  |
| `generateFirstMileTrackingNumber` | `POST` | `/first_mile/generate_first_mile_tracking_number` | Shop auth |  |
| `getChannelList` | `GET` | `/first_mile/get_channel_list` | Shop auth |  |
| `getCourierDeliveryChannelList` | `GET` | `/first_mile/get_courier_delivery_channel_list` | Shop auth |  |
| `getCourierDeliveryDetail` | `GET` | `/first_mile/get_courier_delivery_detail` | Shop auth |  |
| `getCourierDeliveryTrackingNumberList` | `POST` | `/first_mile/get_courier_delivery_tracking_number_list` | Shop auth |  |
| `getCourierDeliveryWaybill` | `POST` | `/first_mile/get_courier_delivery_waybill` | Shop auth |  |
| `getDetail` | `GET` | `/first_mile/get_detail` | Shop auth |  |
| `getTrackingNumberList` | `GET` | `/first_mile/get_tracking_number_list` | Shop auth |  |
| `getTransitWarehouseList` | `GET` | `/first_mile/get_transit_warehouse_list` | Shop auth |  |
| `getUnbindOrderList` | `GET` | `/first_mile/get_unbind_order_list` | Shop auth |  |
| `getWaybill` | `POST` | `/first_mile/get_waybill` | Shop auth |  |
| `unbindFirstMileTrackingNumber` | `POST` | `/first_mile/unbind_first_mile_tracking_number` | Shop auth |  |
| `unbindFirstMileTrackingNumberAll` | `POST` | `/first_mile/unbind_first_mile_tracking_number_all` | Shop auth |  |

### Follow Prize - `followPrize` (6 APIs)

Quan ly follow prize de thuong voucher/coin cho nguoi follow shop.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addFollowPrize` | `POST` | `/follow_prize/add_follow_prize` | Shop auth |  |
| `deleteFollowPrize` | `POST` | `/follow_prize/delete_follow_prize` | Shop auth |  |
| `endFollowPrize` | `POST` | `/follow_prize/end_follow_prize` | Shop auth |  |
| `getFollowPrizeDetail` | `GET` | `/follow_prize/get_follow_prize_detail` | Shop auth |  |
| `getFollowPrizeList` | `GET` | `/follow_prize/get_follow_prize_list` | Shop auth |  |
| `updateFollowPrize` | `POST` | `/follow_prize/update_follow_prize` | Shop auth |  |

### Global Product - `globalProduct` (34 APIs)

Quan ly global item cho shop cross-border: global catalog, model, stock/price, publish task, sync field va size chart.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getCategory` | `GET` | `/global_product/get_category` | Shop auth |  |
| `getGlobalItemList` | `GET` | `/global_product/get_global_item_list` | Shop auth |  |
| `getGlobalItemInfo` | `GET` | `/global_product/get_global_item_info` | Shop auth |  |
| `getGlobalModelList` | `GET` | `/global_product/get_global_model_list` | Shop auth |  |
| `addGlobalItem` | `POST` | `/global_product/add_global_item` | Shop auth |  |
| `updateGlobalItem` | `POST` | `/global_product/update_global_item` | Shop auth |  |
| `deleteGlobalItem` | `POST` | `/global_product/delete_global_item` | Shop auth |  |
| `addGlobalModel` | `POST` | `/global_product/add_global_model` | Shop auth |  |
| `updateGlobalModel` | `POST` | `/global_product/update_global_model` | Shop auth |  |
| `deleteGlobalModel` | `POST` | `/global_product/delete_global_model` | Shop auth |  |
| `initTierVariation` | `POST` | `/global_product/init_tier_variation` | Shop auth |  |
| `updateTierVariation` | `POST` | `/global_product/update_tier_variation` | Shop auth |  |
| `updateStock` | `POST` | `/global_product/update_stock` | Shop auth |  |
| `updatePrice` | `POST` | `/global_product/update_price` | Shop auth |  |
| `getAttributeTree` | `GET` | `/global_product/get_attribute_tree` | Shop auth |  |
| `getBrandList` | `GET` | `/global_product/get_brand_list` | Shop auth |  |
| `categoryRecommend` | `POST` | `/global_product/category_recommend` | Shop auth |  |
| `getGlobalItemLimit` | `GET` | `/global_product/get_global_item_limit` | Shop auth |  |
| `getPublishableShop` | `GET` | `/global_product/get_publishable_shop` | Shop auth |  |
| `getShopPublishableStatus` | `GET` | `/global_product/get_shop_publishable_status` | Shop auth |  |
| `createPublishTask` | `POST` | `/global_product/create_publish_task` | Shop auth |  |
| `getPublishTaskResult` | `GET` | `/global_product/get_publish_task_result` | Shop auth |  |
| `getPublishedList` | `GET` | `/global_product/get_published_list` | Shop auth |  |
| `getGlobalItemId` | `GET` | `/global_product/get_global_item_id` | Shop auth |  |
| `getRecommendAttribute` | `GET` | `/global_product/get_recommend_attribute` | Shop auth |  |
| `searchGlobalAttributeValueList` | `POST` | `/global_product/search_global_attribute_value_list` | Shop auth |  |
| `getVariations` | `GET` | `/global_product/get_variations` | Shop auth |  |
| `setSyncField` | `POST` | `/global_product/set_sync_field` | Shop auth |  |
| `getLocalAdjustmentRate` | `GET` | `/global_product/get_local_adjustment_rate` | Shop auth |  |
| `updateLocalAdjustmentRate` | `POST` | `/global_product/update_local_adjustment_rate` | Shop auth |  |
| `getSizeChartList` | `GET` | `/global_product/get_size_chart_list` | Shop auth |  |
| `getSizeChartDetail` | `GET` | `/global_product/get_size_chart_detail` | Shop auth |  |
| `updateSizeChart` | `POST` | `/global_product/update_size_chart` | Shop auth |  |
| `supportSizeChart` | `GET` | `/global_product/support_size_chart` | Shop auth |  |

### Livestream - `livestream` (25 APIs)

Quan ly livestream session, shopping bag item, item set, comment, show item, metric va upload anh cho livestream.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `createSession` | `POST` | `/livestream/create_session` | Public/partner |  |
| `startSession` | `POST` | `/livestream/start_session` | Public/partner |  |
| `endSession` | `POST` | `/livestream/end_session` | Public/partner |  |
| `updateSession` | `POST` | `/livestream/update_session` | Public/partner |  |
| `getSessionDetail` | `GET` | `/livestream/get_session_detail` | Public/partner |  |
| `getSessionMetric` | `GET` | `/livestream/get_session_metric` | Public/partner |  |
| `getSessionItemMetric` | `GET` | `/livestream/get_session_item_metric` | Public/partner |  |
| `addItemList` | `POST` | `/livestream/add_item_list` | Public/partner |  |
| `updateItemList` | `POST` | `/livestream/update_item_list` | Public/partner |  |
| `deleteItemList` | `POST` | `/livestream/delete_item_list` | Public/partner |  |
| `getItemList` | `GET` | `/livestream/get_item_list` | Public/partner |  |
| `getItemCount` | `GET` | `/livestream/get_item_count` | Public/partner |  |
| `getRecentItemList` | `GET` | `/livestream/get_recent_item_list` | Public/partner |  |
| `getLikeItemList` | `GET` | `/livestream/get_like_item_list` | Public/partner |  |
| `applyItemSet` | `POST` | `/livestream/apply_item_set` | Public/partner |  |
| `getItemSetList` | `GET` | `/livestream/get_item_set_list` | Public/partner |  |
| `getItemSetItemList` | `GET` | `/livestream/get_item_set_item_list` | Public/partner |  |
| `getShowItem` | `GET` | `/livestream/get_show_item` | Public/partner |  |
| `updateShowItem` | `POST` | `/livestream/update_show_item` | Public/partner |  |
| `deleteShowItem` | `POST` | `/livestream/delete_show_item` | Public/partner |  |
| `postComment` | `POST` | `/livestream/post_comment` | Public/partner |  |
| `getLatestCommentList` | `GET` | `/livestream/get_latest_comment_list` | Public/partner |  |
| `banUserComment` | `POST` | `/livestream/ban_user_comment` | Public/partner |  |
| `unbanUserComment` | `POST` | `/livestream/unban_user_comment` | Public/partner |  |
| `uploadImage` | `POST` | `/livestream/upload_image` | Public/partner |  |

### Logistics - `logistics` (46 APIs)

Quan ly giao van: kenh van chuyen, pickup/dropoff, ship order, tracking, shipping document, booking, mass shipping, address va gio hoat dong.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getChannelList` | `GET` | `/logistics/get_channel_list` | Shop auth |  |
| `getPauseStatus` | `GET` | `/logistics/get_pause_status` | Shop auth |  |
| `setPauseStatus` | `POST` | `/logistics/set_pause_status` | Shop auth |  |
| `getShippingParameter` | `GET` | `/logistics/get_shipping_parameter` | Shop auth |  |
| `getTrackingNumber` | `GET` | `/logistics/get_tracking_number` | Shop auth |  |
| `shipOrder` | `POST` | `/logistics/ship_order` | Shop auth |  |
| `getAddressList` | `GET` | `/logistics/get_address_list` | Shop auth |  |
| `getTrackingInfo` | `GET` | `/logistics/get_tracking_info` | Shop auth |  |
| `batchShipOrder` | `POST` | `/logistics/batch_ship_order` | Shop auth |  |
| `massShipOrder` | `POST` | `/logistics/mass_ship_order` | Shop auth |  |
| `shipBooking` | `POST` | `/logistics/ship_booking` | Shop auth |  |
| `getBookingShippingParameter` | `GET` | `/logistics/get_booking_shipping_parameter` | Shop auth |  |
| `getBookingTrackingInfo` | `GET` | `/logistics/get_booking_tracking_info` | Shop auth |  |
| `getBookingTrackingNumber` | `GET` | `/logistics/get_booking_tracking_number` | Shop auth |  |
| `getMassShippingParameter` | `POST` | `/logistics/get_mass_shipping_parameter` | Shop auth |  |
| `getMassTrackingNumber` | `POST` | `/logistics/get_mass_tracking_number` | Shop auth |  |
| `setAddressConfig` | `POST` | `/logistics/set_address_config` | Shop auth |  |
| `deleteAddress` | `POST` | `/logistics/delete_address` | Shop auth |  |
| `createShippingDocument` | `POST` | `/logistics/create_shipping_document` | Shop auth |  |
| `downloadShippingDocument` | `POST` | `/logistics/download_shipping_document` | Shop auth |  |
| `getShippingDocumentParameter` | `POST` | `/logistics/get_shipping_document_parameter` | Shop auth |  |
| `getShippingDocumentResult` | `POST` | `/logistics/get_shipping_document_result` | Shop auth |  |
| `getShippingDocumentDataInfo` | `POST` | `/logistics/get_shipping_document_data_info` | Shop auth |  |
| `createBookingShippingDocument` | `POST` | `/logistics/create_booking_shipping_document` | Shop auth |  |
| `downloadBookingShippingDocument` | `POST` | `/logistics/download_booking_shipping_document` | Shop auth |  |
| `getBookingShippingDocumentParameter` | `POST` | `/logistics/get_booking_shipping_document_parameter` | Shop auth |  |
| `getBookingShippingDocumentResult` | `POST` | `/logistics/get_booking_shipping_document_result` | Shop auth |  |
| `getBookingShippingDocumentDataInfo` | `POST` | `/logistics/get_booking_shipping_document_data_info` | Shop auth |  |
| `createShippingDocumentJob` | `POST` | `/logistics/create_shipping_document_job` | Shop auth |  |
| `downloadShippingDocumentJob` | `POST` | `/logistics/download_shipping_document_job` | Shop auth |  |
| `getShippingDocumentJobStatus` | `POST` | `/logistics/get_shipping_document_job_status` | Shop auth |  |
| `downloadToLabel` | `POST` | `/logistics/download_to_label` | Shop auth |  |
| `updateChannel` | `POST` | `/logistics/update_channel` | Shop auth |  |
| `updateShippingOrder` | `POST` | `/logistics/update_shipping_order` | Shop auth |  |
| `updateTrackingStatus` | `POST` | `/logistics/update_tracking_status` | Shop auth |  |
| `updateSelfCollectionOrderLogistics` | `POST` | `/logistics/update_self_collection_order_logistics` | Shop auth |  |
| `getOperatingHours` | `GET` | `/logistics/get_operating_hours` | Shop auth |  |
| `updateOperatingHours` | `POST` | `/logistics/update_operating_hours` | Shop auth |  |
| `getOperatingHourRestrictions` | `GET` | `/logistics/get_operating_hour_restrictions` | Shop auth |  |
| `deleteSpecialOperatingHour` | `POST` | `/logistics/delete_special_operating_hour` | Shop auth |  |
| `getMartPackagingInfo` | `GET` | `/logistics/get_mart_packaging_info` | Shop auth |  |
| `setMartPackagingInfo` | `POST` | `/logistics/set_mart_packaging_info` | Shop auth |  |
| `batchUpdateTPFWarehouseTrackingStatus` | `POST` | `/logistics/batch_update_tpf_warehouse_tracking_status` | Shop auth |  |
| `checkPolygonUpdateStatus` | `POST` | `/logistics/check_polygon_update_status` | Shop auth |  |
| `updateAddress` | `POST` | `/logistics/update_address` | Shop auth |  |
| `uploadServiceablePolygon` | `POST` | `/logistics/upload_serviceable_polygon` | Shop auth |  |

### Media Space - `mediaSpace` (6 APIs)

Upload anh san pham va video theo multipart session: init, upload part, complete, poll result, cancel.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `uploadImage` | `POST` | `/media_space/upload_image` | Public/partner |  |
| `initVideoUpload` | `POST` | `/media_space/init_video_upload` | Shop auth |  |
| `uploadVideoPart` | `POST` | `/media_space/upload_video_part` | Public/partner |  |
| `completeVideoUpload` | `POST` | `/media_space/complete_video_upload` | Public/partner |  |
| `getVideoUploadResult` | `GET` | `/media_space/get_video_upload_result` | Shop auth |  |
| `cancelVideoUpload` | `POST` | `/media_space/cancel_video_upload` | Shop auth |  |

### Media - `media` (7 APIs)

Upload anh/video dung chung cho media va media_space. Mot so endpoint la public multipart upload, mot so endpoint can shop auth.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `uploadMediaImage` | `POST` | `/media/upload_image` | Public/partner |  |
| `uploadImage` | `POST` | `/media_space/upload_image` | Shop auth |  |
| `initVideoUpload` | `POST` | `/media_space/init_video_upload` | Shop auth |  |
| `uploadVideoPart` | `POST` | `/media_space/upload_video_part` | Public/partner |  |
| `completeVideoUpload` | `POST` | `/media_space/complete_video_upload` | Public/partner |  |
| `getVideoUploadResult` | `GET` | `/media_space/get_video_upload_result` | Shop auth |  |
| `cancelVideoUpload` | `POST` | `/media_space/cancel_video_upload` | Shop auth |  |

### Merchant - `merchant` (6 APIs)

Quan ly merchant-level info: thong tin merchant, prepaid account, warehouse, shop list va shop eligible theo warehouse.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getMerchantInfo` | `GET` | `/merchant/get_merchant_info` | Shop auth |  |
| `getMerchantPrepaidAccountList` | `GET` | `/merchant/get_merchant_prepaid_account_list` | Shop auth |  |
| `getMerchantWarehouseList` | `POST` | `/merchant/get_merchant_warehouse_list` | Shop auth |  |
| `getMerchantWarehouseLocationList` | `GET` | `/merchant/get_merchant_warehouse_location_list` | Shop auth |  |
| `getShopListByMerchant` | `GET` | `/merchant/get_shop_list_by_merchant` | Shop auth |  |
| `getWarehouseEligibleShopList` | `POST` | `/merchant/get_warehouse_eligible_shop_list` | Shop auth |  |

### Order - `order` (21 APIs)

Dong bo va xu ly don: list/detail, shipment, split/unsplit, cancel, package, invoice, buyer cancellation, booking va FBS invoice.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getOrderList` | `GET` | `/order/get_order_list` | Shop auth |  |
| `getOrdersDetail` | `GET` | `/order/get_order_detail` | Shop auth | Mang duoc join bang dau phay: `order_sn_list` |
| `getShipmentList` | `GET` | `/order/get_shipment_list` | Shop auth |  |
| `splitOrder` | `POST` | `/order/split_order` | Shop auth |  |
| `unsplitOrder` | `POST` | `/order/unsplit_order` | Shop auth |  |
| `cancelOrder` | `POST` | `/order/cancel_order` | Shop auth |  |
| `getBuyerInvoiceInfo` | `POST` | `/order/get_buyer_invoice_info` | Shop auth |  |
| `setNote` | `POST` | `/order/set_note` | Shop auth |  |
| `getPackageDetail` | `GET` | `/order/get_package_detail` | Shop auth | Mang duoc join bang dau phay: `package_number_list` |
| `handleBuyerCancellation` | `POST` | `/order/handle_buyer_cancellation` | Shop auth |  |
| `searchPackageList` | `POST` | `/order/search_package_list` | Shop auth |  |
| `getPendingBuyerInvoiceOrderList` | `GET` | `/order/get_pending_buyer_invoice_order_list` | Shop auth |  |
| `handlePrescriptionCheck` | `POST` | `/order/handle_prescription_check` | Shop auth |  |
| `downloadInvoiceDoc` | `GET` | `/order/download_invoice_doc` | Shop auth |  |
| `uploadInvoiceDoc` | `POST` | `/order/upload_invoice_doc` | Shop auth |  |
| `getBookingDetail` | `GET` | `/order/get_booking_detail` | Shop auth | Mang duoc join bang dau phay: `booking_sn_list` |
| `getBookingList` | `GET` | `/order/get_booking_list` | Shop auth |  |
| `getWarehouseFilterConfig` | `GET` | `/order/get_warehouse_filter_config` | Shop auth |  |
| `downloadFbsInvoices` | `POST` | `/order/download_fbs_invoices` | Shop auth |  |
| `generateFbsInvoices` | `POST` | `/order/generate_fbs_invoices` | Shop auth |  |
| `getFbsInvoicesResult` | `POST` | `/order/get_fbs_invoices_result` | Shop auth |  |

### Payment - `payment` (16 APIs)

Doi soat tai chinh: escrow, wallet transaction, installment, income report/statement, billing va payout.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getEscrowDetail` | `GET` | `/payment/get_escrow_detail` | Shop auth |  |
| `getEscrowList` | `GET` | `/payment/get_escrow_list` | Shop auth |  |
| `getEscrowDetailBatch` | `POST` | `/payment/get_escrow_detail_batch` | Shop auth |  |
| `getWalletTransactionList` | `GET` | `/payment/get_wallet_transaction_list` | Shop auth |  |
| `getPaymentMethodList` | `GET` | `/payment/get_payment_method_list` | Public/partner |  |
| `getShopInstallmentStatus` | `GET` | `/payment/get_shop_installment_status` | Shop auth |  |
| `setShopInstallmentStatus` | `POST` | `/payment/set_shop_installment_status` | Shop auth |  |
| `getItemInstallmentStatus` | `POST` | `/payment/get_item_installment_status` | Shop auth |  |
| `setItemInstallmentStatus` | `POST` | `/payment/set_item_installment_status` | Shop auth |  |
| `generateIncomeReport` | `GET` | `/payment/generate_income_report` | Shop auth |  |
| `getIncomeReport` | `GET` | `/payment/get_income_report` | Shop auth |  |
| `generateIncomeStatement` | `GET` | `/payment/generate_income_statement` | Shop auth |  |
| `getIncomeStatement` | `GET` | `/payment/get_income_statement` | Shop auth |  |
| `getBillingTransactionInfo` | `POST` | `/payment/get_billing_transaction_info` | Shop auth |  |
| `getPayoutDetail` | `GET` | `/payment/get_payout_detail` | Shop auth |  |
| `getPayoutInfo` | `GET` | `/payment/get_payout_info` | Shop auth |  |

### Product - `product` (58 APIs)

Quan ly catalog shop: item, model/variation, stock/price, category/attribute/brand, comment, boost, violation, kit, SSP, size chart va mart mapping.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getComment` | `GET` | `/product/get_comment` | Shop auth |  |
| `replyComment` | `POST` | `/product/reply_comment` | Shop auth |  |
| `getItemList` | `GET` | `/product/get_item_list` | Shop auth |  |
| `getItemBaseInfo` | `GET` | `/product/get_item_base_info` | Shop auth | Mang duoc join bang dau phay: `item_id_list` |
| `getModelList` | `GET` | `/product/get_model_list` | Shop auth |  |
| `updatePrice` | `POST` | `/product/update_price` | Shop auth |  |
| `updateStock` | `POST` | `/product/update_stock` | Shop auth |  |
| `deleteItem` | `POST` | `/product/delete_item` | Shop auth |  |
| `unlistItem` | `POST` | `/product/unlist_item` | Shop auth |  |
| `getCategory` | `GET` | `/product/get_category` | Shop auth |  |
| `addItem` | `POST` | `/product/add_item` | Shop auth |  |
| `updateItem` | `POST` | `/product/update_item` | Shop auth |  |
| `addModel` | `POST` | `/product/add_model` | Shop auth |  |
| `updateModel` | `POST` | `/product/update_model` | Shop auth |  |
| `deleteModel` | `POST` | `/product/delete_model` | Shop auth |  |
| `initTierVariation` | `POST` | `/product/init_tier_variation` | Shop auth |  |
| `updateTierVariation` | `POST` | `/product/update_tier_variation` | Shop auth |  |
| `searchItem` | `GET` | `/product/search_item` | Shop auth |  |
| `getItemExtraInfo` | `GET` | `/product/get_item_extra_info` | Shop auth | Mang duoc join bang dau phay: `item_id_list` |
| `getAttributeTree` | `GET` | `/product/get_attribute_tree` | Shop auth |  |
| `getBrandList` | `GET` | `/product/get_brand_list` | Shop auth |  |
| `registerBrand` | `POST` | `/product/register_brand` | Shop auth |  |
| `categoryRecommend` | `GET` | `/product/category_recommend` | Shop auth |  |
| `getItemLimit` | `GET` | `/product/get_item_limit` | Shop auth |  |
| `getItemPromotion` | `GET` | `/product/get_item_promotion` | Shop auth | Mang duoc join bang dau phay: `item_id_list` |
| `boostItem` | `POST` | `/product/boost_item` | Shop auth |  |
| `getBoostedList` | `GET` | `/product/get_boosted_list` | Shop auth |  |
| `getVariations` | `GET` | `/product/get_variations` | Shop auth |  |
| `getRecommendAttribute` | `GET` | `/product/get_recommend_attribute` | Shop auth |  |
| `searchAttributeValueList` | `POST` | `/product/search_attribute_value_list` | Shop auth |  |
| `getMainItemList` | `GET` | `/product/get_main_item_list` | Shop auth |  |
| `getItemViolationInfo` | `GET` | `/product/get_item_violation_info` | Shop auth | Mang duoc join bang dau phay: `item_id_list` |
| `getWeightRecommendation` | `POST` | `/product/get_weight_recommendation` | Shop auth |  |
| `getDirectItemList` | `GET` | `/product/get_direct_item_list` | Shop auth |  |
| `getItemContentDiagnosisResult` | `POST` | `/product/get_item_content_diagnosis_result` | Shop auth |  |
| `getItemListByContentDiagnosis` | `POST` | `/product/get_item_list_by_content_diagnosis` | Shop auth |  |
| `addKitItem` | `POST` | `/product/add_kit_item` | Shop auth |  |
| `updateKitItem` | `POST` | `/product/update_kit_item` | Shop auth |  |
| `getKitItemInfo` | `GET` | `/product/get_kit_item_info` | Shop auth | Mang duoc join bang dau phay: `item_id_list` |
| `getKitItemLimit` | `GET` | `/product/get_kit_item_limit` | Shop auth |  |
| `generateKitImage` | `POST` | `/product/generate_kit_image` | Shop auth |  |
| `addSspItem` | `POST` | `/product/add_ssp_item` | Shop auth |  |
| `getSspInfo` | `GET` | `/product/get_ssp_info` | Shop auth |  |
| `getSspList` | `GET` | `/product/get_ssp_list` | Shop auth |  |
| `linkSsp` | `POST` | `/product/link_ssp` | Shop auth |  |
| `unlinkSsp` | `POST` | `/product/unlink_ssp` | Shop auth |  |
| `updateSipItemPrice` | `POST` | `/product/update_sip_item_price` | Shop auth |  |
| `getSizeChartList` | `GET` | `/product/get_size_chart_list` | Shop auth |  |
| `getSizeChartDetail` | `GET` | `/product/get_size_chart_detail` | Shop auth |  |
| `getAllVehicleList` | `GET` | `/product/get_all_vehicle_list` | Shop auth |  |
| `getVehicleListByCompatibilityDetail` | `GET` | `/product/get_vehicle_list_by_compatibility_detail` | Shop auth |  |
| `getAitemByPitemId` | `GET` | `/product/get_aitem_by_pitem_id` | Shop auth | Mang duoc join bang dau phay: `pitem_id_list` |
| `getDirectShopRecommendedPrice` | `GET` | `/product/get_direct_shop_recommended_price` | Shop auth |  |
| `getProductCertificationRule` | `POST` | `/product/get_product_certification_rule` | Shop auth |  |
| `searchUnpackagedModelList` | `POST` | `/product/search_unpackaged_model_list` | Shop auth |  |
| `getMartItemMappingById` | `POST` | `/product/get_mart_item_mapping_by_id` | Shop auth |  |
| `getMartItemByOutletItemId` | `POST` | `/product/get_mart_item_by_outlet_item_id` | Shop auth |  |
| `publishItemToOutletShop` | `POST` | `/product/publish_item_to_outlet_shop` | Shop auth |  |

### Public - `public` (3 APIs)

Endpoint public cua partner: shop da authorize, merchant da authorize va Shopee IP ranges.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getShopsByPartner` | `GET` | `/public/get_shops_by_partner` | Public/partner |  |
| `getMerchantsByPartner` | `GET` | `/public/get_merchants_by_partner` | Public/partner |  |
| `getShopeeIpRange` | `GET` | `/public/get_shopee_ip_ranges` | Public/partner |  |

### Push/Webhook - `push` (4 APIs)

Cau hinh webhook/push, doc push config, lay lost messages va confirm da consume.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `setAppPushConfig` | `POST` | `/push/set_app_push_config` | Public/partner |  |
| `getAppPushConfig` | `GET` | `/push/get_app_push_config` | Public/partner |  |
| `getLostPushMessage` | `GET` | `/push/get_lost_push_message` | Public/partner |  |
| `confirmConsumedLostPushMessage` | `POST` | `/push/confirm_consumed_lost_push_message` | Public/partner |  |

### Returns - `returns` (15 APIs)

Xu ly return/refund: danh sach/detail, confirm, dispute, offer, bang chung, shipping proof va reverse tracking.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getReturnList` | `GET` | `/returns/get_return_list` | Shop auth |  |
| `getReturnDetail` | `GET` | `/returns/get_return_detail` | Shop auth |  |
| `confirm` | `POST` | `/returns/confirm` | Shop auth |  |
| `dispute` | `POST` | `/returns/dispute` | Shop auth |  |
| `offer` | `POST` | `/returns/offer` | Shop auth |  |
| `acceptOffer` | `POST` | `/returns/accept_offer` | Shop auth |  |
| `getAvailableSolutions` | `GET` | `/returns/get_available_solutions` | Shop auth |  |
| `cancelDispute` | `POST` | `/returns/cancel_dispute` | Shop auth |  |
| `getReturnDisputeReason` | `GET` | `/returns/get_return_dispute_reason` | Shop auth |  |
| `convertImage` | `POST` | `/returns/convert_image` | Shop auth |  |
| `uploadProof` | `POST` | `/returns/upload_proof` | Shop auth |  |
| `queryProof` | `GET` | `/returns/query_proof` | Shop auth |  |
| `getShippingCarrier` | `GET` | `/returns/get_shipping_carrier` | Shop auth |  |
| `uploadShippingProof` | `POST` | `/returns/upload_shipping_proof` | Shop auth |  |
| `getReverseTrackingInfo` | `GET` | `/returns/get_reverse_tracking_info` | Shop auth |  |

### Shopee Business Services (SBS) - `sbs` (5 APIs)

Quan ly ton kho SBS warehouse: bound warehouse, current inventory, expiry, aging va stock movement.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getBoundWhsInfo` | `GET` | `/sbs/get_bound_whs_info` | Shop auth |  |
| `getCurrentInventory` | `GET` | `/sbs/get_current_inventory` | Shop auth |  |
| `getExpiryReport` | `GET` | `/sbs/get_expiry_report` | Shop auth |  |
| `getStockAging` | `GET` | `/sbs/get_stock_aging` | Shop auth |  |
| `getStockMovement` | `GET` | `/sbs/get_stock_movement` | Shop auth |  |

### Shop Category - `shopCategory` (7 APIs)

Quan ly danh muc/collection trong shop va gan/xoa item vao category.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getShopCategoryList` | `GET` | `/shop_category/get_shop_category_list` | Shop auth |  |
| `addShopCategory` | `POST` | `/shop_category/add_shop_category` | Shop auth |  |
| `updateShopCategory` | `POST` | `/shop_category/update_shop_category` | Shop auth |  |
| `deleteShopCategory` | `POST` | `/shop_category/delete_shop_category` | Shop auth |  |
| `addItemList` | `POST` | `/shop_category/add_item_list` | Shop auth |  |
| `deleteItemList` | `POST` | `/shop_category/delete_item_list` | Shop auth |  |
| `getItemList` | `GET` | `/shop_category/get_item_list` | Shop auth |  |

### Shop Flash Sale - `shopFlashSale` (11 APIs)

Quan ly flash sale cua shop: time slot, campaign, item, criteria, status va lifecycle.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getTimeSlotId` | `GET` | `/shop_flash_sale/get_time_slot_id` | Shop auth |  |
| `createShopFlashSale` | `POST` | `/shop_flash_sale/create_shop_flash_sale` | Shop auth |  |
| `getShopFlashSale` | `GET` | `/shop_flash_sale/get_shop_flash_sale` | Shop auth |  |
| `getShopFlashSaleList` | `GET` | `/shop_flash_sale/get_shop_flash_sale_list` | Shop auth |  |
| `updateShopFlashSale` | `POST` | `/shop_flash_sale/update_shop_flash_sale` | Shop auth |  |
| `deleteShopFlashSale` | `POST` | `/shop_flash_sale/delete_shop_flash_sale` | Shop auth |  |
| `addShopFlashSaleItems` | `POST` | `/shop_flash_sale/add_shop_flash_sale_items` | Shop auth |  |
| `getShopFlashSaleItems` | `GET` | `/shop_flash_sale/get_shop_flash_sale_items` | Shop auth |  |
| `updateShopFlashSaleItems` | `POST` | `/shop_flash_sale/update_shop_flash_sale_items` | Shop auth |  |
| `deleteShopFlashSaleItems` | `POST` | `/shop_flash_sale/delete_shop_flash_sale_items` | Shop auth |  |
| `getItemCriteria` | `GET` | `/shop_flash_sale/get_item_criteria` | Shop auth |  |

### Shop - `shop` (9 APIs)

Quan ly thong tin shop: profile, shop info, warehouse detail, notification, authorized brand, BR onboarding va holiday mode.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `getProfile` | `GET` | `/shop/get_profile` | Shop auth |  |
| `getShopInfo` | `GET` | `/shop/get_shop_info` | Shop auth |  |
| `updateProfile` | `POST` | `/shop/update_profile` | Shop auth |  |
| `getWarehouseDetail` | `GET` | `/shop/get_warehouse_detail` | Shop auth |  |
| `getShopNotification` | `GET` | `/shop/get_shop_notification` | Shop auth |  |
| `getAuthorisedResellerBrand` | `GET` | `/shop/get_authorised_reseller_brand` | Shop auth |  |
| `getBRShopOnboardingInfo` | `GET` | `/shop/get_br_shop_onboarding_info` | Shop auth |  |
| `getShopHolidayMode` | `GET` | `/shop/get_shop_holiday_mode` | Shop auth |  |
| `setShopHolidayMode` | `POST` | `/shop/set_shop_holiday_mode` | Shop auth |  |

### Top Picks - `topPicks` (4 APIs)

Quan ly bo suu tap Top Picks/featured collections cua shop.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addTopPicks` | `POST` | `/top_picks/add_top_picks` | Shop auth |  |
| `deleteTopPicks` | `POST` | `/top_picks/delete_top_picks` | Shop auth |  |
| `getTopPicksList` | `GET` | `/top_picks/get_top_picks_list` | Shop auth |  |
| `updateTopPicks` | `POST` | `/top_picks/update_top_picks` | Shop auth |  |

### Video - `video` (15 APIs)

Quan ly video va analytics: post/edit/delete/list/detail, cover, metric trend, performance, demographics.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `deleteVideo` | `POST` | `/video/delete_video` | Shop auth |  |
| `editVideoInfo` | `POST` | `/video/edit_video_info` | Shop auth |  |
| `getCoverList` | `GET` | `/video/get_cover_list` | Shop auth |  |
| `getMetricTrend` | `GET` | `/video/get_metric_trend` | Shop auth |  |
| `getOverviewPerformance` | `GET` | `/video/get_overview_performance` | Shop auth |  |
| `getProductPerformanceList` | `GET` | `/video/get_prodcut_performance_list` | Shop auth |  |
| `getUserDemographics` | `GET` | `/video/get_user_demographics` | Shop auth |  |
| `getVideoDetail` | `GET` | `/video/get_video_detail` | Shop auth |  |
| `getVideoDetailAudienceDistribution` | `GET` | `/video/get_video_detail_audience_distribution` | Shop auth |  |
| `getVideoDetailMetricTrend` | `GET` | `/video/get_video_detail_metric_trend` | Shop auth |  |
| `getVideoDetailPerformance` | `GET` | `/video/get_video_detail_performance` | Shop auth |  |
| `getVideoDetailProductPerformance` | `GET` | `/video/get_video_detail_product_performance` | Shop auth |  |
| `getVideoList` | `GET` | `/video/get_video_list` | Shop auth |  |
| `getVideoPerformanceList` | `GET` | `/video/get_video_performance_list` | Shop auth |  |
| `postVideo` | `POST` | `/video/post_video` | Shop auth |  |

### Voucher - `voucher` (6 APIs)

Quan ly voucher cua shop: tao, cap nhat, lay detail/list, ket thuc va xoa.

| Method | HTTP | Path | Auth | Ghi chu |
| --- | --- | --- | --- | --- |
| `addVoucher` | `POST` | `/voucher/add_voucher` | Shop auth |  |
| `deleteVoucher` | `POST` | `/voucher/delete_voucher` | Shop auth |  |
| `endVoucher` | `POST` | `/voucher/end_voucher` | Shop auth |  |
| `updateVoucher` | `POST` | `/voucher/update_voucher` | Shop auth |  |
| `getVoucher` | `GET` | `/voucher/get_voucher` | Shop auth |  |
| `getVoucherList` | `GET` | `/voucher/get_voucher_list` | Shop auth |  |


## 8. Enum va constant quan trong

- `ShopeeOrderStatus`: `UNPAID`, `PENDING`, `READY_TO_SHIP`, `PROCESSED`, `SHIPPED`, `TO_CONFIRM_RECEIVE`, `COMPLETED`, `IN_CANCEL`, `CANCELLED`, `INVOICE_PENDING`, `RETRY_SHIP`.
- `ShopeeLogisticsStatus`: cac trang thai pickup/delivery nhu `LOGISTICS_NOT_STARTED`, `LOGISTICS_REQUEST_CREATED`, `LOGISTICS_PICKUP_DONE`, `LOGISTICS_DELIVERY_DONE`, `LOGISTICS_READY`, `LOGISTICS_PENDING_ARRANGE`.
- `ShopeeReturnStatus`: `REQUESTED`, `ACCEPTED`, `CANCELLED`, `JUDGING`, `REFUND_PAID`, `CLOSED`, `PROCESSING`, `SELLER_DISPUTE`.
- `ShopeeProductStatus`: `NORMAL`, `BANNED`, `DELETED`, `UNLIST`.
- `SHOPEE_ORDER_OPTIONAL_FIELDS`: source dang request nhieu field detail order, gom buyer, shipping, cancellation, package, payment, invoice va EDT info.
- Rate limit constant trong source: `RATE_LIMIT_PER_MINUTE=1000`, `RATE_LIMIT_PER_DAY=100000`; source chua implement limiter, app goi ben ngoai can tu quan ly retry/backoff.

## 9. Quy tac khi AI sua source Shopee

1. Neu them API manager moi, uu tien them definition vao `sdk-api.ts` thay vi viet method request rieng trong `index.ts`, tru khi can mapping sang interface chung.
2. Params public cho SDK API nen nhan camelCase; de `requestSdkApi` tu chuyen snake_case.
3. Neu Shopee yeu cau list dang `a,b,c`, them field snake_case vao `commaParams` trong definition.
4. Neu endpoint tra binary document, giu `responseType: "arraybuffer"`; `requestSdkApi` da tra `Buffer` khi content type khong phai JSON.
5. Khong bo qua `EcomConnectorError`; code ben ngoai dang ky vong loi co `code`, `statusCode`, `platformError`.
6. Common API phai tra model repo chung `Product`/`Order`; Shopee payload goc nen dat trong `platformSpecific`.
7. Can can than voi `updateProduct`: source hien goi `ADD_ITEM`; neu sua sang `/product/update_item`, can test regression voi du lieu Shopee thuc/sandbox.
8. Cac auth endpoint public khong duoc yeu cau `accessToken`; cac endpoint `auth: true` phai fail som neu thieu `accessToken` hoac `shopId`.
9. Khi dung docs SDK, nho rang wrapper nay khong instantiate SDK manager class; no chi mirror endpoint/method vao data definitions.
10. Sau khi thay doi `sdk-api.ts`, chay typecheck/build va neu co the goi smoke test voi sandbox credentials.

## 10. Quick examples

### Dung common API de lay product/order

```ts
const shopee = createEcomConnector(config);
const products = await shopee.getProducts({ limit: 20, status: "NORMAL" });
const orders = await shopee.getOrders({
  limit: 50,
  startDate: new Date("2026-05-01T00:00:00Z"),
  endDate: new Date("2026-05-18T00:00:00Z"),
});
```

### Dung SDK API group de goi endpoint Shopee thap hon

```ts
const shopee = createEcomConnector(config) as ShopeePlatform;

const rawItems = await shopee.product.getItemList({
  offset: 0,
  pageSize: 50,
  itemStatus: "NORMAL",
});

const escrow = await shopee.payment.getEscrowDetail({
  orderSn: "ORDER_SN",
});
```

### Ship order co pickup

```ts
const params = await shopee.logistics.getShippingParameter({ orderSn: "ORDER_SN" });
await shopee.logistics.shipOrder({
  orderSn: "ORDER_SN",
  pickup: {
    addressId: params.response?.pickup?.addressList?.[0]?.addressId,
    pickupTimeId: params.response?.pickup?.timeSlotList?.[0]?.pickupTimeId,
  },
});
```
