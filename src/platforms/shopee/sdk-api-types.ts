/**
 * Typed Shopee SDK API groups generated from shopee-sdk-1.6.1/src/managers
 * and shopee-sdk-1.6.1/src/schemas.
 *
 * The original SDK schemas use Shopee snake_case fields. Runtime responses from
 * ShopeePlatform.requestSdkApi are converted to camelCase, so response types are
 * wrapped in ShopeeSdkOutput<T>. Params accept either original snake_case schema
 * shapes or their camelCase equivalent.
 */
import type * as AccountHealthSchemas from "./schemas/account-health";
import type * as AddOnDealSchemas from "./schemas/add-on-deal";
import type * as AdsSchemas from "./schemas/ads";
import type * as AmsSchemas from "./schemas/ams";
import type * as AuthSchemas from "./schemas/access-token";
import type * as BundleDealSchemas from "./schemas/bundle-deal";
import type * as DiscountSchemas from "./schemas/discount";
import type * as FbsSchemas from "./schemas/fbs";
import type * as FirstMileSchemas from "./schemas/first-mile";
import type * as FollowPrizeSchemas from "./schemas/follow-prize";
import type * as GlobalProductSchemas from "./schemas/global-product";
import type * as LivestreamSchemas from "./schemas/livestream";
import type * as LogisticsSchemas from "./schemas/logistics";
import type * as MediaSpaceSchemas from "./schemas/media-space";
import type * as MediaSchemas from "./schemas/media";
import type * as MerchantSchemas from "./schemas/merchant";
import type * as OrderSchemas from "./schemas/order";
import type * as PaymentSchemas from "./schemas/payment";
import type * as ProductSchemas from "./schemas/product";
import type * as PublicSchemas from "./schemas/public";
import type * as PushSchemas from "./schemas/push";
import type * as ReturnsSchemas from "./schemas/returns";
import type * as SbsSchemas from "./schemas/sbs";
import type * as ShopCategorySchemas from "./schemas/shop-category";
import type * as ShopFlashSaleSchemas from "./schemas/shop-flash-sale";
import type * as ShopSchemas from "./schemas/shop";
import type * as TopPicksSchemas from "./schemas/top-picks";
import type * as VideoSchemas from "./schemas/video";
import type * as VoucherSchemas from "./schemas/voucher";

export type ShopeeSdkApiMethod = (...args: any[]) => Promise<any>;
export type ShopeeSdkApiGroup = Record<string, ShopeeSdkApiMethod>;

export type ShopeeSnakeToCamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<ShopeeSnakeToCamelCase<Tail>>}`
    : S;

export type ShopeeSdkCamelize<T> = T extends Buffer
  ? T
  : T extends Date
    ? T
    : T extends readonly (infer Item)[]
      ? ShopeeSdkCamelize<Item>[]
      : T extends object
        ? {
            [K in keyof T as K extends string ? ShopeeSnakeToCamelCase<K> : K]: ShopeeSdkCamelize<T[K]>;
          }
        : T;

export type ShopeeSdkInput<T> = T | ShopeeSdkCamelize<T>;
export type ShopeeSdkOutput<T> = T extends Buffer ? T : ShopeeSdkCamelize<T>;

export interface ShopeeGetAccessTokenInput {
  code: string;
  shopId?: number | string;
  shop_id?: number | string;
  mainAccountId?: number | string;
  main_account_id?: number | string;
}

export interface ShopeeGetAccessTokenByResendCodeInput {
  resendCode?: string;
  resend_code?: string;
}

export interface ShopeeRefreshTokenInput {
  refreshToken?: string;
  refresh_token?: string;
  shopId?: number | string;
  shop_id?: number | string;
  merchantId?: number | string;
  merchant_id?: number | string;
}
export interface ShopeeAccountHealthApiGroup extends ShopeeSdkApiGroup {
  getShopPenalty(): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetShopPenaltyResponse>>;
  getShopPerformance(): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetShopPerformanceResponse>>;
  getMetricSourceDetail(params: ShopeeSdkInput<AccountHealthSchemas.GetMetricSourceDetailParams>): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetMetricSourceDetailResponse>>;
  getPenaltyPointHistory(params?: ShopeeSdkInput<AccountHealthSchemas.GetPenaltyPointHistoryParams>): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetPenaltyPointHistoryResponse>>;
  getPunishmentHistory(params: ShopeeSdkInput<AccountHealthSchemas.GetPunishmentHistoryParams>): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetPunishmentHistoryResponse>>;
  getListingsWithIssues(params?: ShopeeSdkInput<AccountHealthSchemas.GetListingsWithIssuesParams>): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetListingsWithIssuesResponse>>;
  getLateOrders(params?: ShopeeSdkInput<AccountHealthSchemas.GetLateOrdersParams>): Promise<ShopeeSdkOutput<AccountHealthSchemas.GetLateOrdersResponse>>;
}

export interface ShopeeAddOnDealApiGroup extends ShopeeSdkApiGroup {
  addAddOnDeal(params: ShopeeSdkInput<AddOnDealSchemas.AddAddOnDealParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.AddAddOnDealResponse>>;
  addAddOnDealMainItem(params: ShopeeSdkInput<AddOnDealSchemas.AddAddOnDealMainItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.AddAddOnDealMainItemResponse>>;
  addAddOnDealSubItem(params: ShopeeSdkInput<AddOnDealSchemas.AddAddOnDealSubItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.AddAddOnDealSubItemResponse>>;
  deleteAddOnDeal(params: ShopeeSdkInput<AddOnDealSchemas.DeleteAddOnDealParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.DeleteAddOnDealResponse>>;
  deleteAddOnDealMainItem(params: ShopeeSdkInput<AddOnDealSchemas.DeleteAddOnDealMainItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.DeleteAddOnDealMainItemResponse>>;
  deleteAddOnDealSubItem(params: ShopeeSdkInput<AddOnDealSchemas.DeleteAddOnDealSubItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.DeleteAddOnDealSubItemResponse>>;
  endAddOnDeal(params: ShopeeSdkInput<AddOnDealSchemas.EndAddOnDealParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.EndAddOnDealResponse>>;
  getAddOnDeal(params: ShopeeSdkInput<AddOnDealSchemas.GetAddOnDealParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.GetAddOnDealResponse>>;
  getAddOnDealList(params: ShopeeSdkInput<AddOnDealSchemas.GetAddOnDealListParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.GetAddOnDealListResponse>>;
  getAddOnDealMainItem(params: ShopeeSdkInput<AddOnDealSchemas.GetAddOnDealMainItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.GetAddOnDealMainItemResponse>>;
  getAddOnDealSubItem(params: ShopeeSdkInput<AddOnDealSchemas.GetAddOnDealSubItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.GetAddOnDealSubItemResponse>>;
  updateAddOnDeal(params: ShopeeSdkInput<AddOnDealSchemas.UpdateAddOnDealParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.UpdateAddOnDealResponse>>;
  updateAddOnDealMainItem(params: ShopeeSdkInput<AddOnDealSchemas.UpdateAddOnDealMainItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.UpdateAddOnDealMainItemResponse>>;
  updateAddOnDealSubItem(params: ShopeeSdkInput<AddOnDealSchemas.UpdateAddOnDealSubItemParams>): Promise<ShopeeSdkOutput<AddOnDealSchemas.UpdateAddOnDealSubItemResponse>>;
}

export interface ShopeeAdsApiGroup extends ShopeeSdkApiGroup {
  getTotalBalance(): Promise<ShopeeSdkOutput<AdsSchemas.GetTotalBalanceResponse>>;
  getShopToggleInfo(): Promise<ShopeeSdkOutput<AdsSchemas.GetShopToggleInfoResponse>>;
  getRecommendedKeywordList(params: ShopeeSdkInput<AdsSchemas.GetRecommendedKeywordListParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetRecommendedKeywordListResponse>>;
  getRecommendedItemList(): Promise<ShopeeSdkOutput<AdsSchemas.GetRecommendedItemListResponse>>;
  getAllCpcAdsHourlyPerformance(params: ShopeeSdkInput<AdsSchemas.GetAllCpcAdsHourlyPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetAllCpcAdsHourlyPerformanceResponse>>;
  getAllCpcAdsDailyPerformance(params: ShopeeSdkInput<AdsSchemas.GetAllCpcAdsDailyPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetAllCpcAdsDailyPerformanceResponse>>;
  getProductCampaignDailyPerformance(params: ShopeeSdkInput<AdsSchemas.GetProductCampaignDailyPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetProductCampaignDailyPerformanceResponse>>;
  getProductCampaignHourlyPerformance(params: ShopeeSdkInput<AdsSchemas.GetProductCampaignHourlyPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetProductCampaignHourlyPerformanceResponse>>;
  getProductLevelCampaignIdList(params?: ShopeeSdkInput<AdsSchemas.GetProductLevelCampaignIdListParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetProductLevelCampaignIdListResponse>>;
  getProductLevelCampaignSettingInfo(params: ShopeeSdkInput<AdsSchemas.GetProductLevelCampaignSettingInfoParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetProductLevelCampaignSettingInfoResponse>>;
  getProductRecommendedRoiTarget(params: ShopeeSdkInput<AdsSchemas.GetProductRecommendedRoiTargetParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetProductRecommendedRoiTargetResponse>>;
  checkCreateGmsProductCampaignEligibility(): Promise<ShopeeSdkOutput<AdsSchemas.CheckCreateGmsProductCampaignEligibilityResponse>>;
  createAutoProductAds(params: ShopeeSdkInput<AdsSchemas.CreateAutoProductAdsParams>): Promise<ShopeeSdkOutput<AdsSchemas.CreateAutoProductAdsResponse>>;
  createGmsProductCampaign(params: ShopeeSdkInput<AdsSchemas.CreateGmsProductCampaignParams>): Promise<ShopeeSdkOutput<AdsSchemas.CreateGmsProductCampaignResponse>>;
  createManualProductAds(params: ShopeeSdkInput<AdsSchemas.CreateManualProductAdsParams>): Promise<ShopeeSdkOutput<AdsSchemas.CreateManualProductAdsResponse>>;
  editAutoProductAds(params: ShopeeSdkInput<AdsSchemas.EditAutoProductAdsParams>): Promise<ShopeeSdkOutput<AdsSchemas.EditAutoProductAdsResponse>>;
  editGmsItemProductCampaign(params: ShopeeSdkInput<AdsSchemas.EditGmsItemProductCampaignParams>): Promise<ShopeeSdkOutput<AdsSchemas.EditGmsItemProductCampaignResponse>>;
  editGmsProductCampaign(params: ShopeeSdkInput<AdsSchemas.EditGmsProductCampaignParams>): Promise<ShopeeSdkOutput<AdsSchemas.EditGmsProductCampaignResponse>>;
  editManualProductAdKeywords(params: ShopeeSdkInput<AdsSchemas.EditManualProductAdKeywordsParams>): Promise<ShopeeSdkOutput<AdsSchemas.EditManualProductAdKeywordsResponse>>;
  editManualProductAds(params: ShopeeSdkInput<AdsSchemas.EditManualProductAdsParams>): Promise<ShopeeSdkOutput<AdsSchemas.EditManualProductAdsResponse>>;
  getAdsFacilShopRate(): Promise<ShopeeSdkOutput<AdsSchemas.GetAdsFacilShopRateResponse>>;
  getCreateProductAdBudgetSuggestion(params: ShopeeSdkInput<AdsSchemas.GetCreateProductAdBudgetSuggestionParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetCreateProductAdBudgetSuggestionResponse>>;
  getGmsCampaignPerformance(params: ShopeeSdkInput<AdsSchemas.GetGmsCampaignPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetGmsCampaignPerformanceResponse>>;
  getGmsItemPerformance(params: ShopeeSdkInput<AdsSchemas.GetGmsItemPerformanceParams>): Promise<ShopeeSdkOutput<AdsSchemas.GetGmsItemPerformanceResponse>>;
  listGmsUserDeletedItem(params?: ShopeeSdkInput<AdsSchemas.ListGmsUserDeletedItemParams>): Promise<ShopeeSdkOutput<AdsSchemas.ListGmsUserDeletedItemResponse>>;
}

export interface ShopeeAmsApiGroup extends ShopeeSdkApiGroup {
  addAllProductsToOpenCampaign(params: ShopeeSdkInput<AmsSchemas.AddAllProductsToOpenCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.AddAllProductsToOpenCampaignResponse>>;
  batchAddProductsToOpenCampaign(params: ShopeeSdkInput<AmsSchemas.BatchAddProductsToOpenCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.BatchAddProductsToOpenCampaignResponse>>;
  batchEditProductsOpenCampaignSetting(params: ShopeeSdkInput<AmsSchemas.BatchEditProductsOpenCampaignSettingParams>): Promise<ShopeeSdkOutput<AmsSchemas.BatchEditProductsOpenCampaignSettingResponse>>;
  batchGetProductsSuggestedRate(params: ShopeeSdkInput<AmsSchemas.BatchGetProductsSuggestedRateParams>): Promise<ShopeeSdkOutput<AmsSchemas.BatchGetProductsSuggestedRateResponse>>;
  batchRemoveProductsOpenCampaignSetting(params: ShopeeSdkInput<AmsSchemas.BatchRemoveProductsOpenCampaignSettingParams>): Promise<ShopeeSdkOutput<AmsSchemas.BatchRemoveProductsOpenCampaignSettingResponse>>;
  editAllProductsOpenCampaignSetting(params: ShopeeSdkInput<AmsSchemas.EditAllProductsOpenCampaignSettingParams>): Promise<ShopeeSdkOutput<AmsSchemas.EditAllProductsOpenCampaignSettingResponse>>;
  getOpenCampaignAddedProduct(params: ShopeeSdkInput<AmsSchemas.GetOpenCampaignAddedProductParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetOpenCampaignAddedProductResponse>>;
  getOpenCampaignBatchTaskResult(params: ShopeeSdkInput<AmsSchemas.GetOpenCampaignBatchTaskResultParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetOpenCampaignBatchTaskResultResponse>>;
  getOpenCampaignNotAddedProduct(params: ShopeeSdkInput<AmsSchemas.GetOpenCampaignNotAddedProductParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetOpenCampaignNotAddedProductResponse>>;
  getOpenCampaignPerformance(params: ShopeeSdkInput<AmsSchemas.GetOpenCampaignPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetOpenCampaignPerformanceResponse>>;
  removeAllProductsOpenCampaignSetting(): Promise<ShopeeSdkOutput<AmsSchemas.RemoveAllProductsOpenCampaignSettingResponse>>;
  createNewTargetedCampaign(params: ShopeeSdkInput<AmsSchemas.CreateNewTargetedCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.CreateNewTargetedCampaignResponse>>;
  editAffiliateListOfTargetedCampaign(params: ShopeeSdkInput<AmsSchemas.EditAffiliateListOfTargetedCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.EditAffiliateListOfTargetedCampaignResponse>>;
  editProductListOfTargetedCampaign(params: ShopeeSdkInput<AmsSchemas.EditProductListOfTargetedCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.EditProductListOfTargetedCampaignResponse>>;
  getTargetedCampaignAddableProductList(params: ShopeeSdkInput<AmsSchemas.GetTargetedCampaignAddableProductListParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetTargetedCampaignAddableProductListResponse>>;
  getTargetedCampaignList(params?: ShopeeSdkInput<AmsSchemas.GetTargetedCampaignListParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetTargetedCampaignListResponse>>;
  getTargetedCampaignPerformance(params: ShopeeSdkInput<AmsSchemas.GetTargetedCampaignPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetTargetedCampaignPerformanceResponse>>;
  getTargetedCampaignSettings(params: ShopeeSdkInput<AmsSchemas.GetTargetedCampaignSettingsParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetTargetedCampaignSettingsResponse>>;
  terminateTargetedCampaign(params: ShopeeSdkInput<AmsSchemas.TerminateTargetedCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.TerminateTargetedCampaignResponse>>;
  updateBasicInfoOfTargetedCampaign(params: ShopeeSdkInput<AmsSchemas.UpdateBasicInfoOfTargetedCampaignParams>): Promise<ShopeeSdkOutput<AmsSchemas.UpdateBasicInfoOfTargetedCampaignResponse>>;
  getAffiliatePerformance(params: ShopeeSdkInput<AmsSchemas.GetAffiliatePerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetAffiliatePerformanceResponse>>;
  getAutoAddNewProductToggleStatus(): Promise<ShopeeSdkOutput<AmsSchemas.GetAutoAddNewProductToggleStatusResponse>>;
  getCampaignKeyMetricsPerformance(params: ShopeeSdkInput<AmsSchemas.GetCampaignKeyMetricsPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetCampaignKeyMetricsPerformanceResponse>>;
  getContentPerformance(params: ShopeeSdkInput<AmsSchemas.GetContentPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetContentPerformanceResponse>>;
  getConversionReport(params?: ShopeeSdkInput<AmsSchemas.GetConversionReportParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetConversionReportResponse>>;
  getManagedAffiliateList(params?: ShopeeSdkInput<AmsSchemas.GetManagedAffiliateListParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetManagedAffiliateListResponse>>;
  getOptimizationSuggestionProduct(params?: ShopeeSdkInput<AmsSchemas.GetOptimizationSuggestionProductParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetOptimizationSuggestionProductResponse>>;
  getPerformanceDataUpdateTime(params: ShopeeSdkInput<AmsSchemas.GetPerformanceDataUpdateTimeParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetPerformanceDataUpdateTimeResponse>>;
  getProductPerformance(params: ShopeeSdkInput<AmsSchemas.GetProductPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetProductPerformanceResponse>>;
  getRecommendedAffiliateList(params?: ShopeeSdkInput<AmsSchemas.GetRecommendedAffiliateListParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetRecommendedAffiliateListResponse>>;
  getShopPerformance(params: ShopeeSdkInput<AmsSchemas.AmsGetShopPerformanceParams>): Promise<ShopeeSdkOutput<AmsSchemas.AmsGetShopPerformanceResponse>>;
  getShopSuggestedRate(): Promise<ShopeeSdkOutput<AmsSchemas.GetShopSuggestedRateResponse>>;
  getValidationList(): Promise<ShopeeSdkOutput<AmsSchemas.GetValidationListResponse>>;
  getValidationReport(params?: ShopeeSdkInput<AmsSchemas.GetValidationReportParams>): Promise<ShopeeSdkOutput<AmsSchemas.GetValidationReportResponse>>;
  queryAffiliateList(params: ShopeeSdkInput<AmsSchemas.QueryAffiliateListParams>): Promise<ShopeeSdkOutput<AmsSchemas.QueryAffiliateListResponse>>;
  updateAutoAddNewProductSetting(params: ShopeeSdkInput<AmsSchemas.UpdateAutoAddNewProductSettingParams>): Promise<ShopeeSdkOutput<AmsSchemas.UpdateAutoAddNewProductSettingResponse>>;
}

export interface ShopeeAuthApiGroup extends ShopeeSdkApiGroup {
  getAccessToken(codeOrParams: string | ShopeeGetAccessTokenInput, shopId?: number | string, mainAccountId?: number | string): Promise<ShopeeSdkOutput<AuthSchemas.AccessToken>>;
  getAccessTokenByResendCode(codeOrParams: string | ShopeeGetAccessTokenByResendCodeInput): Promise<ShopeeSdkOutput<AuthSchemas.AccessToken>>;
  getRefreshToken(refreshTokenOrParams: string | ShopeeRefreshTokenInput, shopId?: number | string, merchantId?: number | string): Promise<ShopeeSdkOutput<AuthSchemas.AccessToken>>;
}

export interface ShopeeBundleDealApiGroup extends ShopeeSdkApiGroup {
  addBundleDeal(params: ShopeeSdkInput<BundleDealSchemas.AddBundleDealParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.AddBundleDealResponse>>;
  addBundleDealItem(params: ShopeeSdkInput<BundleDealSchemas.AddBundleDealItemParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.AddBundleDealItemResponse>>;
  deleteBundleDeal(params: ShopeeSdkInput<BundleDealSchemas.DeleteBundleDealParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.DeleteBundleDealResponse>>;
  deleteBundleDealItem(params: ShopeeSdkInput<BundleDealSchemas.DeleteBundleDealItemParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.DeleteBundleDealItemResponse>>;
  endBundleDeal(params: ShopeeSdkInput<BundleDealSchemas.EndBundleDealParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.EndBundleDealResponse>>;
  getBundleDeal(params: ShopeeSdkInput<BundleDealSchemas.GetBundleDealParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.GetBundleDealResponse>>;
  getBundleDealItem(params: ShopeeSdkInput<BundleDealSchemas.GetBundleDealItemParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.GetBundleDealItemResponse>>;
  getBundleDealList(params?: ShopeeSdkInput<BundleDealSchemas.GetBundleDealListParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.GetBundleDealListResponse>>;
  updateBundleDeal(params: ShopeeSdkInput<BundleDealSchemas.UpdateBundleDealParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.UpdateBundleDealResponse>>;
  updateBundleDealItem(params: ShopeeSdkInput<BundleDealSchemas.UpdateBundleDealItemParams>): Promise<ShopeeSdkOutput<BundleDealSchemas.UpdateBundleDealItemResponse>>;
}

export interface ShopeeDiscountApiGroup extends ShopeeSdkApiGroup {
  addDiscount(params: ShopeeSdkInput<DiscountSchemas.AddDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.AddDiscountResponse>>;
  addDiscountItem(params: ShopeeSdkInput<DiscountSchemas.AddDiscountItemParams>): Promise<ShopeeSdkOutput<DiscountSchemas.AddDiscountItemResponse>>;
  deleteDiscount(params: ShopeeSdkInput<DiscountSchemas.DeleteDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.DeleteDiscountResponse>>;
  deleteDiscountItem(params: ShopeeSdkInput<DiscountSchemas.DeleteDiscountItemParams>): Promise<ShopeeSdkOutput<DiscountSchemas.DeleteDiscountItemResponse>>;
  endDiscount(params: ShopeeSdkInput<DiscountSchemas.EndDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.EndDiscountResponse>>;
  getDiscount(params: ShopeeSdkInput<DiscountSchemas.GetDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.GetDiscountResponse>>;
  getDiscountList(params: ShopeeSdkInput<DiscountSchemas.GetDiscountListParams>): Promise<ShopeeSdkOutput<DiscountSchemas.GetDiscountListResponse>>;
  updateDiscount(params: ShopeeSdkInput<DiscountSchemas.UpdateDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.UpdateDiscountResponse>>;
  updateDiscountItem(params: ShopeeSdkInput<DiscountSchemas.UpdateDiscountItemParams>): Promise<ShopeeSdkOutput<DiscountSchemas.UpdateDiscountItemResponse>>;
  getSipDiscounts(params?: ShopeeSdkInput<DiscountSchemas.GetSipDiscountsParams>): Promise<ShopeeSdkOutput<DiscountSchemas.GetSipDiscountsResponse>>;
  setSipDiscount(params: ShopeeSdkInput<DiscountSchemas.SetSipDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.SetSipDiscountResponse>>;
  deleteSipDiscount(params: ShopeeSdkInput<DiscountSchemas.DeleteSipDiscountParams>): Promise<ShopeeSdkOutput<DiscountSchemas.DeleteSipDiscountResponse>>;
}

export interface ShopeeFbsApiGroup extends ShopeeSdkApiGroup {
  queryBrShopEnrollmentStatus(params?: ShopeeSdkInput<FbsSchemas.QueryBrShopEnrollmentStatusParams>): Promise<ShopeeSdkOutput<FbsSchemas.QueryBrShopEnrollmentStatusResponse>>;
  queryBrShopBlockStatus(params?: ShopeeSdkInput<FbsSchemas.QueryBrShopBlockStatusParams>): Promise<ShopeeSdkOutput<FbsSchemas.QueryBrShopBlockStatusResponse>>;
  queryBrShopInvoiceError(params?: ShopeeSdkInput<FbsSchemas.QueryBrShopInvoiceErrorParams>): Promise<ShopeeSdkOutput<FbsSchemas.QueryBrShopInvoiceErrorResponse>>;
  queryBrSkuBlockStatus(params: ShopeeSdkInput<FbsSchemas.QueryBrSkuBlockStatusParams>): Promise<ShopeeSdkOutput<FbsSchemas.QueryBrSkuBlockStatusResponse>>;
}

export interface ShopeeFirstMileApiGroup extends ShopeeSdkApiGroup {
  bindCourierDeliveryFirstMileTrackingNumber(params: ShopeeSdkInput<FirstMileSchemas.BindCourierDeliveryFirstMileTrackingNumberParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.BindCourierDeliveryFirstMileTrackingNumberResponse>>;
  bindFirstMileTrackingNumber(params: ShopeeSdkInput<FirstMileSchemas.BindFirstMileTrackingNumberParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.BindFirstMileTrackingNumberResponse>>;
  generateAndBindFirstMileTrackingNumber(params: ShopeeSdkInput<FirstMileSchemas.GenerateAndBindFirstMileTrackingNumberParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GenerateAndBindFirstMileTrackingNumberResponse>>;
  generateFirstMileTrackingNumber(params: ShopeeSdkInput<FirstMileSchemas.GenerateFirstMileTrackingNumberParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GenerateFirstMileTrackingNumberResponse>>;
  getChannelList(params?: ShopeeSdkInput<FirstMileSchemas.GetChannelListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetChannelListResponse>>;
  getCourierDeliveryChannelList(params?: ShopeeSdkInput<FirstMileSchemas.GetCourierDeliveryChannelListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetCourierDeliveryChannelListResponse>>;
  getCourierDeliveryDetail(params: ShopeeSdkInput<FirstMileSchemas.GetCourierDeliveryDetailParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetCourierDeliveryDetailResponse>>;
  getCourierDeliveryTrackingNumberList(params: ShopeeSdkInput<FirstMileSchemas.GetCourierDeliveryTrackingNumberListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetCourierDeliveryTrackingNumberListResponse>>;
  getCourierDeliveryWaybill(params: ShopeeSdkInput<FirstMileSchemas.GetCourierDeliveryWaybillParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetCourierDeliveryWaybillResponse>>;
  getDetail(params: ShopeeSdkInput<FirstMileSchemas.GetDetailParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetDetailResponse>>;
  getTrackingNumberList(params: ShopeeSdkInput<FirstMileSchemas.GetTrackingNumberListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetTrackingNumberListResponse>>;
  getTransitWarehouseList(params?: ShopeeSdkInput<FirstMileSchemas.GetTransitWarehouseListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetTransitWarehouseListResponse>>;
  getUnbindOrderList(params?: ShopeeSdkInput<FirstMileSchemas.GetUnbindOrderListParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetUnbindOrderListResponse>>;
  getWaybill(params: ShopeeSdkInput<FirstMileSchemas.GetWaybillParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.GetWaybillResponse>>;
  unbindFirstMileTrackingNumber(params: ShopeeSdkInput<FirstMileSchemas.UnbindFirstMileTrackingNumberParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.UnbindFirstMileTrackingNumberResponse>>;
  unbindFirstMileTrackingNumberAll(params: ShopeeSdkInput<FirstMileSchemas.UnbindFirstMileTrackingNumberAllParams>): Promise<ShopeeSdkOutput<FirstMileSchemas.UnbindFirstMileTrackingNumberAllResponse>>;
}

export interface ShopeeFollowPrizeApiGroup extends ShopeeSdkApiGroup {
  addFollowPrize(params: ShopeeSdkInput<FollowPrizeSchemas.AddFollowPrizeParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.AddFollowPrizeResponse>>;
  deleteFollowPrize(params: ShopeeSdkInput<FollowPrizeSchemas.DeleteFollowPrizeParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.DeleteFollowPrizeResponse>>;
  endFollowPrize(params: ShopeeSdkInput<FollowPrizeSchemas.EndFollowPrizeParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.EndFollowPrizeResponse>>;
  getFollowPrizeDetail(params: ShopeeSdkInput<FollowPrizeSchemas.GetFollowPrizeDetailParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.GetFollowPrizeDetailResponse>>;
  getFollowPrizeList(params: ShopeeSdkInput<FollowPrizeSchemas.GetFollowPrizeListParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.GetFollowPrizeListResponse>>;
  updateFollowPrize(params: ShopeeSdkInput<FollowPrizeSchemas.UpdateFollowPrizeParams>): Promise<ShopeeSdkOutput<FollowPrizeSchemas.UpdateFollowPrizeResponse>>;
}

export interface ShopeeGlobalProductApiGroup extends ShopeeSdkApiGroup {
  getCategory(params?: ShopeeSdkInput<GlobalProductSchemas.GetGlobalCategoryParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalCategoryResponse>>;
  getGlobalItemList(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalItemListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalItemListResponse>>;
  getGlobalItemInfo(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalItemInfoParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalItemInfoResponse>>;
  getGlobalModelList(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalModelListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalModelListResponse>>;
  addGlobalItem(params: ShopeeSdkInput<GlobalProductSchemas.AddGlobalItemParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.AddGlobalItemResponse>>;
  updateGlobalItem(params: ShopeeSdkInput<GlobalProductSchemas.UpdateGlobalItemParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateGlobalItemResponse>>;
  deleteGlobalItem(params: ShopeeSdkInput<GlobalProductSchemas.DeleteGlobalItemParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.DeleteGlobalItemResponse>>;
  addGlobalModel(params: ShopeeSdkInput<GlobalProductSchemas.AddGlobalModelParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.AddGlobalModelResponse>>;
  updateGlobalModel(params: ShopeeSdkInput<GlobalProductSchemas.UpdateGlobalModelParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateGlobalModelResponse>>;
  deleteGlobalModel(params: ShopeeSdkInput<GlobalProductSchemas.DeleteGlobalModelParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.DeleteGlobalModelResponse>>;
  initTierVariation(params: ShopeeSdkInput<GlobalProductSchemas.InitGlobalTierVariationParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.InitGlobalTierVariationResponse>>;
  updateTierVariation(params: ShopeeSdkInput<GlobalProductSchemas.UpdateGlobalTierVariationParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateGlobalTierVariationResponse>>;
  updateStock(params: ShopeeSdkInput<GlobalProductSchemas.UpdateGlobalStockParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateGlobalStockResponse>>;
  updatePrice(params: ShopeeSdkInput<GlobalProductSchemas.UpdateGlobalPriceParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateGlobalPriceResponse>>;
  getAttributeTree(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalAttributeTreeParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalAttributeTreeResponse>>;
  getBrandList(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalBrandListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalBrandListResponse>>;
  categoryRecommend(params: ShopeeSdkInput<GlobalProductSchemas.GlobalCategoryRecommendParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GlobalCategoryRecommendResponse>>;
  getGlobalItemLimit(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalItemLimitParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalItemLimitResponse>>;
  getPublishableShop(params: ShopeeSdkInput<GlobalProductSchemas.GetPublishableShopParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetPublishableShopResponse>>;
  getShopPublishableStatus(params: ShopeeSdkInput<GlobalProductSchemas.GetShopPublishableStatusParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetShopPublishableStatusResponse>>;
  createPublishTask(params: ShopeeSdkInput<GlobalProductSchemas.CreatePublishTaskParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.CreatePublishTaskResponse>>;
  getPublishTaskResult(params: ShopeeSdkInput<GlobalProductSchemas.GetPublishTaskResultParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetPublishTaskResultResponse>>;
  getPublishedList(params: ShopeeSdkInput<GlobalProductSchemas.GetPublishedListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetPublishedListResponse>>;
  getGlobalItemId(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalItemIdParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalItemIdResponse>>;
  getRecommendAttribute(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalRecommendAttributeParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalRecommendAttributeResponse>>;
  searchGlobalAttributeValueList(params: ShopeeSdkInput<GlobalProductSchemas.SearchGlobalAttributeValueListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.SearchGlobalAttributeValueListResponse>>;
  getVariations(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalVariationsParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalVariationsResponse>>;
  setSyncField(params: ShopeeSdkInput<GlobalProductSchemas.SetSyncFieldParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.SetSyncFieldResponse>>;
  getLocalAdjustmentRate(params: ShopeeSdkInput<GlobalProductSchemas.GetLocalAdjustmentRateParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetLocalAdjustmentRateResponse>>;
  updateLocalAdjustmentRate(params: ShopeeSdkInput<GlobalProductSchemas.UpdateLocalAdjustmentRateParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateLocalAdjustmentRateResponse>>;
  getSizeChartList(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalSizeChartListParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalSizeChartListResponse>>;
  getSizeChartDetail(params: ShopeeSdkInput<GlobalProductSchemas.GetGlobalSizeChartDetailParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.GetGlobalSizeChartDetailResponse>>;
  updateSizeChart(params: ShopeeSdkInput<GlobalProductSchemas.UpdateSizeChartParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.UpdateSizeChartResponse>>;
  supportSizeChart(params: ShopeeSdkInput<GlobalProductSchemas.SupportSizeChartParams>): Promise<ShopeeSdkOutput<GlobalProductSchemas.SupportSizeChartResponse>>;
}

export interface ShopeeLivestreamApiGroup extends ShopeeSdkApiGroup {
  createSession(params: ShopeeSdkInput<LivestreamSchemas.CreateSessionParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.CreateSessionResponse>>;
  startSession(params: ShopeeSdkInput<LivestreamSchemas.StartSessionParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.StartSessionResponse>>;
  endSession(params: ShopeeSdkInput<LivestreamSchemas.EndSessionParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.EndSessionResponse>>;
  updateSession(params: ShopeeSdkInput<LivestreamSchemas.UpdateSessionParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.UpdateSessionResponse>>;
  getSessionDetail(params: ShopeeSdkInput<LivestreamSchemas.GetSessionDetailParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetSessionDetailResponse>>;
  getSessionMetric(params: ShopeeSdkInput<LivestreamSchemas.GetSessionMetricParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetSessionMetricResponse>>;
  getSessionItemMetric(params: ShopeeSdkInput<LivestreamSchemas.GetSessionItemMetricParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetSessionItemMetricResponse>>;
  addItemList(params: ShopeeSdkInput<LivestreamSchemas.AddItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.AddItemListResponse>>;
  updateItemList(params: ShopeeSdkInput<LivestreamSchemas.UpdateItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.UpdateItemListResponse>>;
  deleteItemList(params: ShopeeSdkInput<LivestreamSchemas.DeleteItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.DeleteItemListResponse>>;
  getItemList(params: ShopeeSdkInput<LivestreamSchemas.GetItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetItemListResponse>>;
  getItemCount(params: ShopeeSdkInput<LivestreamSchemas.GetItemCountParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetItemCountResponse>>;
  getRecentItemList(params: ShopeeSdkInput<LivestreamSchemas.GetRecentItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetRecentItemListResponse>>;
  getLikeItemList(params: ShopeeSdkInput<LivestreamSchemas.GetLikeItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetLikeItemListResponse>>;
  applyItemSet(params: ShopeeSdkInput<LivestreamSchemas.ApplyItemSetParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.ApplyItemSetResponse>>;
  getItemSetList(params: ShopeeSdkInput<LivestreamSchemas.GetItemSetListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetItemSetListResponse>>;
  getItemSetItemList(params: ShopeeSdkInput<LivestreamSchemas.GetItemSetItemListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetItemSetItemListResponse>>;
  getShowItem(params: ShopeeSdkInput<LivestreamSchemas.GetShowItemParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetShowItemResponse>>;
  updateShowItem(params: ShopeeSdkInput<LivestreamSchemas.UpdateShowItemParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.UpdateShowItemResponse>>;
  deleteShowItem(params: ShopeeSdkInput<LivestreamSchemas.DeleteShowItemParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.DeleteShowItemResponse>>;
  postComment(params: ShopeeSdkInput<LivestreamSchemas.PostCommentParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.PostCommentResponse>>;
  getLatestCommentList(params: ShopeeSdkInput<LivestreamSchemas.GetLatestCommentListParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.GetLatestCommentListResponse>>;
  banUserComment(params: ShopeeSdkInput<LivestreamSchemas.BanUserCommentParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.BanUserCommentResponse>>;
  unbanUserComment(params: ShopeeSdkInput<LivestreamSchemas.UnbanUserCommentParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.UnbanUserCommentResponse>>;
  uploadImage(params: ShopeeSdkInput<LivestreamSchemas.UploadImageParams>): Promise<ShopeeSdkOutput<LivestreamSchemas.UploadImageResponse>>;
}

export interface ShopeeLogisticsApiGroup extends ShopeeSdkApiGroup {
  getChannelList(): Promise<ShopeeSdkOutput<LogisticsSchemas.GetChannelListResponse>>;
  getPauseStatus(): Promise<ShopeeSdkOutput<LogisticsSchemas.GetPauseStatusResponse>>;
  setPauseStatus(params: ShopeeSdkInput<LogisticsSchemas.SetPauseStatusParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.SetPauseStatusResponse>>;
  getShippingParameter(params: ShopeeSdkInput<LogisticsSchemas.GetShippingParameterParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetShippingParameterResponse>>;
  getTrackingNumber(params: ShopeeSdkInput<LogisticsSchemas.GetTrackingNumberParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetTrackingNumberResponse>>;
  shipOrder(params: ShopeeSdkInput<LogisticsSchemas.ShipOrderParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.ShipOrderResponse>>;
  getAddressList(): Promise<ShopeeSdkOutput<LogisticsSchemas.GetAddressListResponse>>;
  getTrackingInfo(params: ShopeeSdkInput<LogisticsSchemas.GetTrackingInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetTrackingInfoResponse>>;
  batchShipOrder(params: ShopeeSdkInput<LogisticsSchemas.BatchShipOrderParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.BatchShipOrderResponse>>;
  massShipOrder(params: ShopeeSdkInput<LogisticsSchemas.MassShipOrderParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.MassShipOrderResponse>>;
  shipBooking(params: ShopeeSdkInput<LogisticsSchemas.ShipBookingParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.ShipBookingResponse>>;
  getBookingShippingParameter(params: ShopeeSdkInput<LogisticsSchemas.GetBookingShippingParameterParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingShippingParameterResponse>>;
  getBookingTrackingInfo(params: ShopeeSdkInput<LogisticsSchemas.GetBookingTrackingInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingTrackingInfoResponse>>;
  getBookingTrackingNumber(params: ShopeeSdkInput<LogisticsSchemas.GetBookingTrackingNumberParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingTrackingNumberResponse>>;
  getMassShippingParameter(params: ShopeeSdkInput<LogisticsSchemas.GetMassShippingParameterParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetMassShippingParameterResponse>>;
  getMassTrackingNumber(params: ShopeeSdkInput<LogisticsSchemas.GetMassTrackingNumberParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetMassTrackingNumberResponse>>;
  setAddressConfig(params: ShopeeSdkInput<LogisticsSchemas.SetAddressConfigParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.SetAddressConfigResponse>>;
  deleteAddress(params: ShopeeSdkInput<LogisticsSchemas.DeleteAddressParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DeleteAddressResponse>>;
  createShippingDocument(params: ShopeeSdkInput<LogisticsSchemas.CreateShippingDocumentParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.CreateShippingDocumentResponse>>;
  downloadShippingDocument(params: ShopeeSdkInput<LogisticsSchemas.DownloadShippingDocumentParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DownloadShippingDocumentResponse>>;
  getShippingDocumentParameter(params: ShopeeSdkInput<LogisticsSchemas.GetShippingDocumentParameterParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetShippingDocumentParameterResponse>>;
  getShippingDocumentResult(params: ShopeeSdkInput<LogisticsSchemas.GetShippingDocumentResultParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetShippingDocumentResultResponse>>;
  getShippingDocumentDataInfo(params: ShopeeSdkInput<LogisticsSchemas.GetShippingDocumentDataInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetShippingDocumentDataInfoResponse>>;
  createBookingShippingDocument(params: ShopeeSdkInput<LogisticsSchemas.CreateBookingShippingDocumentParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.CreateBookingShippingDocumentResponse>>;
  downloadBookingShippingDocument(params: ShopeeSdkInput<LogisticsSchemas.DownloadBookingShippingDocumentParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DownloadBookingShippingDocumentResponse>>;
  getBookingShippingDocumentParameter(params: ShopeeSdkInput<LogisticsSchemas.GetBookingShippingDocumentParameterParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingShippingDocumentParameterResponse>>;
  getBookingShippingDocumentResult(params: ShopeeSdkInput<LogisticsSchemas.GetBookingShippingDocumentResultParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingShippingDocumentResultResponse>>;
  getBookingShippingDocumentDataInfo(params: ShopeeSdkInput<LogisticsSchemas.GetBookingShippingDocumentDataInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetBookingShippingDocumentDataInfoResponse>>;
  createShippingDocumentJob(params: ShopeeSdkInput<LogisticsSchemas.CreateShippingDocumentJobParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.CreateShippingDocumentJobResponse>>;
  downloadShippingDocumentJob(params: ShopeeSdkInput<LogisticsSchemas.DownloadShippingDocumentJobParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DownloadShippingDocumentJobResponse>>;
  getShippingDocumentJobStatus(params: ShopeeSdkInput<LogisticsSchemas.GetShippingDocumentJobStatusParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetShippingDocumentJobStatusResponse>>;
  downloadToLabel(params: ShopeeSdkInput<LogisticsSchemas.DownloadToLabelParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DownloadToLabelResponse>>;
  updateChannel(params: ShopeeSdkInput<LogisticsSchemas.UpdateChannelParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateChannelResponse>>;
  updateShippingOrder(params: ShopeeSdkInput<LogisticsSchemas.UpdateShippingOrderParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateShippingOrderResponse>>;
  updateTrackingStatus(params: ShopeeSdkInput<LogisticsSchemas.UpdateTrackingStatusParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateTrackingStatusResponse>>;
  updateSelfCollectionOrderLogistics(params: ShopeeSdkInput<LogisticsSchemas.UpdateSelfCollectionOrderLogisticsParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateSelfCollectionOrderLogisticsResponse>>;
  getOperatingHours(params: ShopeeSdkInput<LogisticsSchemas.GetOperatingHoursParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetOperatingHoursResponse>>;
  updateOperatingHours(params: ShopeeSdkInput<LogisticsSchemas.UpdateOperatingHoursParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateOperatingHoursResponse>>;
  getOperatingHourRestrictions(params: ShopeeSdkInput<LogisticsSchemas.GetOperatingHourRestrictionsParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetOperatingHourRestrictionsResponse>>;
  deleteSpecialOperatingHour(params: ShopeeSdkInput<LogisticsSchemas.DeleteSpecialOperatingHourParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.DeleteSpecialOperatingHourResponse>>;
  getMartPackagingInfo(params: ShopeeSdkInput<LogisticsSchemas.GetMartPackagingInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.GetMartPackagingInfoResponse>>;
  setMartPackagingInfo(params: ShopeeSdkInput<LogisticsSchemas.SetMartPackagingInfoParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.SetMartPackagingInfoResponse>>;
  batchUpdateTPFWarehouseTrackingStatus(params: ShopeeSdkInput<LogisticsSchemas.BatchUpdateTPFWarehouseTrackingStatusParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.BatchUpdateTPFWarehouseTrackingStatusResponse>>;
  checkPolygonUpdateStatus(params: ShopeeSdkInput<LogisticsSchemas.CheckPolygonUpdateStatusParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.CheckPolygonUpdateStatusResponse>>;
  updateAddress(params: ShopeeSdkInput<LogisticsSchemas.UpdateAddressParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UpdateAddressResponse>>;
  uploadServiceablePolygon(params: ShopeeSdkInput<LogisticsSchemas.UploadServiceablePolygonParams>): Promise<ShopeeSdkOutput<LogisticsSchemas.UploadServiceablePolygonResponse>>;
}

export interface ShopeeMediaSpaceApiGroup extends ShopeeSdkApiGroup {
  uploadImage(params: ShopeeSdkInput<MediaSpaceSchemas.UploadImageParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.UploadImageResponse>>;
  initVideoUpload(params: ShopeeSdkInput<MediaSpaceSchemas.InitVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.InitVideoUploadResponse>>;
  uploadVideoPart(params: ShopeeSdkInput<MediaSpaceSchemas.UploadVideoPartParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.UploadVideoPartResponse>>;
  completeVideoUpload(params: ShopeeSdkInput<MediaSpaceSchemas.CompleteVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.CompleteVideoUploadResponse>>;
  getVideoUploadResult(params: ShopeeSdkInput<MediaSpaceSchemas.GetVideoUploadResultParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.GetVideoUploadResultResponse>>;
  cancelVideoUpload(params: ShopeeSdkInput<MediaSpaceSchemas.CancelVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSpaceSchemas.CancelVideoUploadResponse>>;
}

export interface ShopeeMediaApiGroup extends ShopeeSdkApiGroup {
  uploadMediaImage(params: ShopeeSdkInput<MediaSchemas.UploadMediaImageParams>): Promise<ShopeeSdkOutput<MediaSchemas.UploadMediaImageResponse>>;
  uploadImage(params: ShopeeSdkInput<MediaSchemas.UploadImageParams>): Promise<ShopeeSdkOutput<MediaSchemas.UploadImageResponse>>;
  initVideoUpload(params: ShopeeSdkInput<MediaSchemas.InitVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSchemas.InitVideoUploadResponse>>;
  uploadVideoPart(params: ShopeeSdkInput<MediaSchemas.UploadVideoPartParams>): Promise<ShopeeSdkOutput<MediaSchemas.UploadVideoPartResponse>>;
  completeVideoUpload(params: ShopeeSdkInput<MediaSchemas.CompleteVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSchemas.CompleteVideoUploadResponse>>;
  getVideoUploadResult(params: ShopeeSdkInput<MediaSchemas.GetVideoUploadResultParams>): Promise<ShopeeSdkOutput<MediaSchemas.GetVideoUploadResultResponse>>;
  cancelVideoUpload(params: ShopeeSdkInput<MediaSchemas.CancelVideoUploadParams>): Promise<ShopeeSdkOutput<MediaSchemas.CancelVideoUploadResponse>>;
}

export interface ShopeeMerchantApiGroup extends ShopeeSdkApiGroup {
  getMerchantInfo(params?: ShopeeSdkInput<MerchantSchemas.GetMerchantInfoParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetMerchantInfoResponse>>;
  getMerchantPrepaidAccountList(params: ShopeeSdkInput<MerchantSchemas.GetMerchantPrepaidAccountListParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetMerchantPrepaidAccountListResponse>>;
  getMerchantWarehouseList(params: ShopeeSdkInput<MerchantSchemas.GetMerchantWarehouseListParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetMerchantWarehouseListResponse>>;
  getMerchantWarehouseLocationList(params?: ShopeeSdkInput<MerchantSchemas.GetMerchantWarehouseLocationListParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetMerchantWarehouseLocationListResponse>>;
  getShopListByMerchant(params: ShopeeSdkInput<MerchantSchemas.GetShopListByMerchantParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetShopListByMerchantResponse>>;
  getWarehouseEligibleShopList(params: ShopeeSdkInput<MerchantSchemas.GetWarehouseEligibleShopListParams>): Promise<ShopeeSdkOutput<MerchantSchemas.GetWarehouseEligibleShopListResponse>>;
}

export interface ShopeeOrderApiGroup extends ShopeeSdkApiGroup {
  getOrderList(params: ShopeeSdkInput<OrderSchemas.GetOrderListParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetOrderListResponse>>;
  getOrdersDetail(params: ShopeeSdkInput<OrderSchemas.GetOrdersDetailParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetOrdersDetailResponse>>;
  getShipmentList(params: ShopeeSdkInput<OrderSchemas.GetShipmentListParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetShipmentListResponse>>;
  splitOrder(params: ShopeeSdkInput<OrderSchemas.SplitOrderParams>): Promise<ShopeeSdkOutput<OrderSchemas.SplitOrderResponse>>;
  unsplitOrder(params: ShopeeSdkInput<OrderSchemas.UnsplitOrderParams>): Promise<ShopeeSdkOutput<OrderSchemas.UnsplitOrderResponse>>;
  cancelOrder(params: ShopeeSdkInput<OrderSchemas.CancelOrderParams>): Promise<ShopeeSdkOutput<OrderSchemas.CancelOrderResponse>>;
  getBuyerInvoiceInfo(params: ShopeeSdkInput<OrderSchemas.GetBuyerInvoiceInfoParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetBuyerInvoiceInfoResponse>>;
  setNote(params: ShopeeSdkInput<OrderSchemas.SetNoteParams>): Promise<ShopeeSdkOutput<OrderSchemas.SetNoteResponse>>;
  getPackageDetail(params: ShopeeSdkInput<OrderSchemas.GetPackageDetailParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetPackageDetailResponse>>;
  handleBuyerCancellation(params: ShopeeSdkInput<OrderSchemas.HandleBuyerCancellationParams>): Promise<ShopeeSdkOutput<OrderSchemas.HandleBuyerCancellationResponse>>;
  searchPackageList(params: ShopeeSdkInput<OrderSchemas.SearchPackageListParams>): Promise<ShopeeSdkOutput<OrderSchemas.SearchPackageListResponse>>;
  getPendingBuyerInvoiceOrderList(params: ShopeeSdkInput<OrderSchemas.GetPendingBuyerInvoiceOrderListParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetPendingBuyerInvoiceOrderListResponse>>;
  handlePrescriptionCheck(params: ShopeeSdkInput<OrderSchemas.HandlePrescriptionCheckParams>): Promise<ShopeeSdkOutput<OrderSchemas.HandlePrescriptionCheckResponse>>;
  downloadInvoiceDoc(params: ShopeeSdkInput<OrderSchemas.DownloadInvoiceDocParams>): Promise<ShopeeSdkOutput<OrderSchemas.DownloadInvoiceDocResponse>>;
  uploadInvoiceDoc(params: ShopeeSdkInput<OrderSchemas.UploadInvoiceDocParams>): Promise<ShopeeSdkOutput<OrderSchemas.UploadInvoiceDocResponse>>;
  getBookingDetail(params: ShopeeSdkInput<OrderSchemas.GetBookingDetailParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetBookingDetailResponse>>;
  getBookingList(params: ShopeeSdkInput<OrderSchemas.GetBookingListParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetBookingListResponse>>;
  getWarehouseFilterConfig(): Promise<ShopeeSdkOutput<OrderSchemas.GetWarehouseFilterConfigResponse>>;
  downloadFbsInvoices(params: ShopeeSdkInput<OrderSchemas.DownloadFbsInvoicesParams>): Promise<ShopeeSdkOutput<OrderSchemas.DownloadFbsInvoicesResponse>>;
  generateFbsInvoices(params: ShopeeSdkInput<OrderSchemas.GenerateFbsInvoicesParams>): Promise<ShopeeSdkOutput<OrderSchemas.GenerateFbsInvoicesResponse>>;
  getFbsInvoicesResult(params: ShopeeSdkInput<OrderSchemas.GetFbsInvoicesResultParams>): Promise<ShopeeSdkOutput<OrderSchemas.GetFbsInvoicesResultResponse>>;
}

export interface ShopeePaymentApiGroup extends ShopeeSdkApiGroup {
  getEscrowDetail(params: ShopeeSdkInput<PaymentSchemas.GetEscrowDetailParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetEscrowDetailResponse>>;
  getEscrowList(params: ShopeeSdkInput<PaymentSchemas.GetEscrowListParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetEscrowListResponse>>;
  getEscrowDetailBatch(params: ShopeeSdkInput<PaymentSchemas.GetEscrowDetailBatchParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetEscrowDetailBatchResponse>>;
  getWalletTransactionList(params: ShopeeSdkInput<PaymentSchemas.GetWalletTransactionListParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetWalletTransactionListResponse>>;
  getPaymentMethodList(): Promise<ShopeeSdkOutput<PaymentSchemas.GetPaymentMethodListResponse>>;
  getShopInstallmentStatus(): Promise<ShopeeSdkOutput<PaymentSchemas.GetShopInstallmentStatusResponse>>;
  setShopInstallmentStatus(params: ShopeeSdkInput<PaymentSchemas.SetShopInstallmentStatusParams>): Promise<ShopeeSdkOutput<PaymentSchemas.SetShopInstallmentStatusResponse>>;
  getItemInstallmentStatus(params: ShopeeSdkInput<PaymentSchemas.GetItemInstallmentStatusParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetItemInstallmentStatusResponse>>;
  setItemInstallmentStatus(params: ShopeeSdkInput<PaymentSchemas.SetItemInstallmentStatusParams>): Promise<ShopeeSdkOutput<PaymentSchemas.SetItemInstallmentStatusResponse>>;
  generateIncomeReport(params: ShopeeSdkInput<PaymentSchemas.GenerateIncomeReportParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GenerateIncomeReportResponse>>;
  getIncomeReport(params: ShopeeSdkInput<PaymentSchemas.GetIncomeReportParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetIncomeReportResponse>>;
  generateIncomeStatement(params: ShopeeSdkInput<PaymentSchemas.GenerateIncomeStatementParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GenerateIncomeStatementResponse>>;
  getIncomeStatement(params: ShopeeSdkInput<PaymentSchemas.GetIncomeStatementParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetIncomeStatementResponse>>;
  getBillingTransactionInfo(params: ShopeeSdkInput<PaymentSchemas.GetBillingTransactionInfoParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetBillingTransactionInfoResponse>>;
  getPayoutDetail(params: ShopeeSdkInput<PaymentSchemas.GetPayoutDetailParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetPayoutDetailResponse>>;
  getPayoutInfo(params: ShopeeSdkInput<PaymentSchemas.GetPayoutInfoParams>): Promise<ShopeeSdkOutput<PaymentSchemas.GetPayoutInfoResponse>>;
}

export interface ShopeeProductApiGroup extends ShopeeSdkApiGroup {
  getComment(params: ShopeeSdkInput<ProductSchemas.GetCommentParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetCommentResponse>>;
  replyComment(params: ShopeeSdkInput<ProductSchemas.ReplyCommentParams>): Promise<ShopeeSdkOutput<ProductSchemas.ReplyCommentResponse>>;
  getItemList(params: ShopeeSdkInput<ProductSchemas.GetItemListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemListResponse>>;
  getItemBaseInfo(params: ShopeeSdkInput<ProductSchemas.GetItemBaseInfoParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemBaseInfoResponse>>;
  getModelList(params: ShopeeSdkInput<ProductSchemas.GetModelListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetModelListResponse>>;
  updatePrice(params: ShopeeSdkInput<ProductSchemas.UpdatePriceParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdatePriceResponse>>;
  updateStock(params: ShopeeSdkInput<ProductSchemas.UpdateStockParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateStockResponse>>;
  deleteItem(params: ShopeeSdkInput<ProductSchemas.DeleteItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.DeleteItemResponse>>;
  unlistItem(params: ShopeeSdkInput<ProductSchemas.UnlistItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.UnlistItemResponse>>;
  getCategory(params?: ShopeeSdkInput<ProductSchemas.GetProductCategoryParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetProductCategoryResponse>>;
  addItem(params: ShopeeSdkInput<ProductSchemas.AddItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.AddItemResponse>>;
  updateItem(params: ShopeeSdkInput<ProductSchemas.UpdateItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateItemResponse>>;
  addModel(params: ShopeeSdkInput<ProductSchemas.AddModelParams>): Promise<ShopeeSdkOutput<ProductSchemas.AddModelResponse>>;
  updateModel(params: ShopeeSdkInput<ProductSchemas.UpdateModelParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateModelResponse>>;
  deleteModel(params: ShopeeSdkInput<ProductSchemas.DeleteModelParams>): Promise<ShopeeSdkOutput<ProductSchemas.DeleteModelResponse>>;
  initTierVariation(params: ShopeeSdkInput<ProductSchemas.InitTierVariationParams>): Promise<ShopeeSdkOutput<ProductSchemas.InitTierVariationResponse>>;
  updateTierVariation(params: ShopeeSdkInput<ProductSchemas.UpdateTierVariationParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateTierVariationResponse>>;
  searchItem(params: ShopeeSdkInput<ProductSchemas.SearchItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.SearchItemResponse>>;
  getItemExtraInfo(params: ShopeeSdkInput<ProductSchemas.GetItemExtraInfoParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemExtraInfoResponse>>;
  getAttributeTree(params: ShopeeSdkInput<ProductSchemas.GetAttributeTreeParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetAttributeTreeResponse>>;
  getBrandList(params: ShopeeSdkInput<ProductSchemas.GetBrandListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetBrandListResponse>>;
  registerBrand(params: ShopeeSdkInput<ProductSchemas.RegisterBrandParams>): Promise<ShopeeSdkOutput<ProductSchemas.RegisterBrandResponse>>;
  categoryRecommend(params: ShopeeSdkInput<ProductSchemas.CategoryRecommendParams>): Promise<ShopeeSdkOutput<ProductSchemas.CategoryRecommendResponse>>;
  getItemLimit(params: ShopeeSdkInput<ProductSchemas.GetItemLimitParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemLimitResponse>>;
  getItemPromotion(params: ShopeeSdkInput<ProductSchemas.GetItemPromotionParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemPromotionResponse>>;
  boostItem(params: ShopeeSdkInput<ProductSchemas.BoostItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.BoostItemResponse>>;
  getBoostedList(): Promise<ShopeeSdkOutput<ProductSchemas.GetBoostedListResponse>>;
  getVariations(params: ShopeeSdkInput<ProductSchemas.GetVariationsParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetVariationsResponse>>;
  getRecommendAttribute(params: ShopeeSdkInput<ProductSchemas.GetRecommendAttributeParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetRecommendAttributeResponse>>;
  searchAttributeValueList(params: ShopeeSdkInput<ProductSchemas.SearchAttributeValueListParams>): Promise<ShopeeSdkOutput<ProductSchemas.SearchAttributeValueListResponse>>;
  getMainItemList(params?: ShopeeSdkInput<ProductSchemas.GetMainItemListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetMainItemListResponse>>;
  getItemViolationInfo(params: ShopeeSdkInput<ProductSchemas.GetItemViolationInfoParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemViolationInfoResponse>>;
  getWeightRecommendation(params: ShopeeSdkInput<ProductSchemas.GetWeightRecommendationParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetWeightRecommendationResponse>>;
  getDirectItemList(params?: ShopeeSdkInput<ProductSchemas.GetDirectItemListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetDirectItemListResponse>>;
  getItemContentDiagnosisResult(params: ShopeeSdkInput<ProductSchemas.GetItemContentDiagnosisResultParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemContentDiagnosisResultResponse>>;
  getItemListByContentDiagnosis(params: ShopeeSdkInput<ProductSchemas.GetItemListByContentDiagnosisParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetItemListByContentDiagnosisResponse>>;
  addKitItem(params: ShopeeSdkInput<ProductSchemas.AddKitItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.AddKitItemResponse>>;
  updateKitItem(params: ShopeeSdkInput<ProductSchemas.UpdateKitItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateKitItemResponse>>;
  getKitItemInfo(params: ShopeeSdkInput<ProductSchemas.GetKitItemInfoParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetKitItemInfoResponse>>;
  getKitItemLimit(params: ShopeeSdkInput<ProductSchemas.GetKitItemLimitParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetKitItemLimitResponse>>;
  generateKitImage(params: ShopeeSdkInput<ProductSchemas.GenerateKitImageParams>): Promise<ShopeeSdkOutput<ProductSchemas.GenerateKitImageResponse>>;
  addSspItem(params: ShopeeSdkInput<ProductSchemas.AddSspItemParams>): Promise<ShopeeSdkOutput<ProductSchemas.AddSspItemResponse>>;
  getSspInfo(params: ShopeeSdkInput<ProductSchemas.GetSspInfoParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetSspInfoResponse>>;
  getSspList(params?: ShopeeSdkInput<ProductSchemas.GetSspListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetSspListResponse>>;
  linkSsp(params: ShopeeSdkInput<ProductSchemas.LinkSspParams>): Promise<ShopeeSdkOutput<ProductSchemas.LinkSspResponse>>;
  unlinkSsp(params: ShopeeSdkInput<ProductSchemas.UnlinkSspParams>): Promise<ShopeeSdkOutput<ProductSchemas.UnlinkSspResponse>>;
  updateSipItemPrice(params: ShopeeSdkInput<ProductSchemas.UpdateSipItemPriceParams>): Promise<ShopeeSdkOutput<ProductSchemas.UpdateSipItemPriceResponse>>;
  getSizeChartList(params?: ShopeeSdkInput<ProductSchemas.GetSizeChartListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetSizeChartListResponse>>;
  getSizeChartDetail(params: ShopeeSdkInput<ProductSchemas.GetSizeChartDetailParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetSizeChartDetailResponse>>;
  getAllVehicleList(params?: ShopeeSdkInput<ProductSchemas.GetAllVehicleListParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetAllVehicleListResponse>>;
  getVehicleListByCompatibilityDetail(params: ShopeeSdkInput<ProductSchemas.GetVehicleListByCompatibilityDetailParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetVehicleListByCompatibilityDetailResponse>>;
  getAitemByPitemId(params: ShopeeSdkInput<ProductSchemas.GetAitemByPitemIdParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetAitemByPitemIdResponse>>;
  getDirectShopRecommendedPrice(params: ShopeeSdkInput<ProductSchemas.GetDirectShopRecommendedPriceParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetDirectShopRecommendedPriceResponse>>;
  getProductCertificationRule(params: ShopeeSdkInput<ProductSchemas.GetProductCertificationRuleParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetProductCertificationRuleResponse>>;
  searchUnpackagedModelList(params: ShopeeSdkInput<ProductSchemas.SearchUnpackagedModelListParams>): Promise<ShopeeSdkOutput<ProductSchemas.SearchUnpackagedModelListResponse>>;
  getMartItemMappingById(params: ShopeeSdkInput<ProductSchemas.GetMartItemMappingByIdParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetMartItemMappingByIdResponse>>;
  getMartItemByOutletItemId(params: ShopeeSdkInput<ProductSchemas.GetMartItemByOutletItemIdParams>): Promise<ShopeeSdkOutput<ProductSchemas.GetMartItemByOutletItemIdResponse>>;
  publishItemToOutletShop(params: ShopeeSdkInput<ProductSchemas.PublishItemToOutletShopParams>): Promise<ShopeeSdkOutput<ProductSchemas.PublishItemToOutletShopResponse>>;
}

export interface ShopeePublicApiGroup extends ShopeeSdkApiGroup {
  getShopsByPartner(params?: ShopeeSdkInput<PublicSchemas.GetShopsByPartnerParams>): Promise<ShopeeSdkOutput<PublicSchemas.GetShopsByPartnerResponse>>;
  getMerchantsByPartner(params?: ShopeeSdkInput<PublicSchemas.GetMerchantsByPartnerParams>): Promise<ShopeeSdkOutput<PublicSchemas.GetMerchantsByPartnerResponse>>;
  getShopeeIpRange(): Promise<ShopeeSdkOutput<PublicSchemas.GetShopeeIpRangeResponse>>;
}

export interface ShopeePushApiGroup extends ShopeeSdkApiGroup {
  setAppPushConfig(params: ShopeeSdkInput<PushSchemas.SetAppPushConfigParams>): Promise<ShopeeSdkOutput<PushSchemas.SetAppPushConfigResponse>>;
  getAppPushConfig(): Promise<ShopeeSdkOutput<PushSchemas.GetAppPushConfigResponse>>;
  getLostPushMessage(): Promise<ShopeeSdkOutput<PushSchemas.GetLostPushMessageResponse>>;
  confirmConsumedLostPushMessage(params: ShopeeSdkInput<PushSchemas.ConfirmConsumedLostPushMessageParams>): Promise<ShopeeSdkOutput<PushSchemas.ConfirmConsumedLostPushMessageResponse>>;
}

export interface ShopeeReturnsApiGroup extends ShopeeSdkApiGroup {
  getReturnList(params: ShopeeSdkInput<ReturnsSchemas.GetReturnListParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetReturnListResponse>>;
  getReturnDetail(params: ShopeeSdkInput<ReturnsSchemas.GetReturnDetailParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetReturnDetailResponse>>;
  confirm(params: ShopeeSdkInput<ReturnsSchemas.ConfirmParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.ConfirmResponse>>;
  dispute(params: ShopeeSdkInput<ReturnsSchemas.DisputeParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.DisputeResponse>>;
  offer(params: ShopeeSdkInput<ReturnsSchemas.OfferParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.OfferResponse>>;
  acceptOffer(params: ShopeeSdkInput<ReturnsSchemas.AcceptOfferParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.AcceptOfferResponse>>;
  getAvailableSolutions(params: ShopeeSdkInput<ReturnsSchemas.GetAvailableSolutionsParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetAvailableSolutionsResponse>>;
  cancelDispute(params: ShopeeSdkInput<ReturnsSchemas.CancelDisputeParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.CancelDisputeResponse>>;
  getReturnDisputeReason(params: ShopeeSdkInput<ReturnsSchemas.GetReturnDisputeReasonParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetReturnDisputeReasonResponse>>;
  convertImage(params: ShopeeSdkInput<ReturnsSchemas.ConvertImageParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.ConvertImageResponse>>;
  uploadProof(params: ShopeeSdkInput<ReturnsSchemas.UploadProofParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.UploadProofResponse>>;
  queryProof(params: ShopeeSdkInput<ReturnsSchemas.QueryProofParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.QueryProofResponse>>;
  getShippingCarrier(params: ShopeeSdkInput<ReturnsSchemas.GetShippingCarrierParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetShippingCarrierResponse>>;
  uploadShippingProof(params: ShopeeSdkInput<ReturnsSchemas.UploadShippingProofParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.UploadShippingProofResponse>>;
  getReverseTrackingInfo(params: ShopeeSdkInput<ReturnsSchemas.GetReverseTrackingInfoParams>): Promise<ShopeeSdkOutput<ReturnsSchemas.GetReverseTrackingInfoResponse>>;
}

export interface ShopeeSbsApiGroup extends ShopeeSdkApiGroup {
  getBoundWhsInfo(params?: ShopeeSdkInput<SbsSchemas.GetBoundWhsInfoParams>): Promise<ShopeeSdkOutput<SbsSchemas.GetBoundWhsInfoResponse>>;
  getCurrentInventory(params: ShopeeSdkInput<SbsSchemas.GetCurrentInventoryParams>): Promise<ShopeeSdkOutput<SbsSchemas.GetCurrentInventoryResponse>>;
  getExpiryReport(params: ShopeeSdkInput<SbsSchemas.GetExpiryReportParams>): Promise<ShopeeSdkOutput<SbsSchemas.GetExpiryReportResponse>>;
  getStockAging(params: ShopeeSdkInput<SbsSchemas.GetStockAgingParams>): Promise<ShopeeSdkOutput<SbsSchemas.GetStockAgingResponse>>;
  getStockMovement(params: ShopeeSdkInput<SbsSchemas.GetStockMovementParams>): Promise<ShopeeSdkOutput<SbsSchemas.GetStockMovementResponse>>;
}

export interface ShopeeShopCategoryApiGroup extends ShopeeSdkApiGroup {
  getShopCategoryList(params: ShopeeSdkInput<ShopCategorySchemas.GetShopCategoryListParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.GetShopCategoryListResponse>>;
  addShopCategory(params: ShopeeSdkInput<ShopCategorySchemas.AddShopCategoryParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.AddShopCategoryResponse>>;
  updateShopCategory(params: ShopeeSdkInput<ShopCategorySchemas.UpdateShopCategoryParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.UpdateShopCategoryResponse>>;
  deleteShopCategory(params: ShopeeSdkInput<ShopCategorySchemas.DeleteShopCategoryParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.DeleteShopCategoryResponse>>;
  addItemList(params: ShopeeSdkInput<ShopCategorySchemas.AddItemListParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.AddItemListResponse>>;
  deleteItemList(params: ShopeeSdkInput<ShopCategorySchemas.DeleteItemListParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.DeleteItemListResponse>>;
  getItemList(params: ShopeeSdkInput<ShopCategorySchemas.GetShopCategoryItemListParams>): Promise<ShopeeSdkOutput<ShopCategorySchemas.GetShopCategoryItemListResponse>>;
}

export interface ShopeeShopFlashSaleApiGroup extends ShopeeSdkApiGroup {
  getTimeSlotId(params: ShopeeSdkInput<ShopFlashSaleSchemas.GetTimeSlotIdParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.GetTimeSlotIdResponse>>;
  createShopFlashSale(params: ShopeeSdkInput<ShopFlashSaleSchemas.CreateShopFlashSaleParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.CreateShopFlashSaleResponse>>;
  getShopFlashSale(params: ShopeeSdkInput<ShopFlashSaleSchemas.GetShopFlashSaleParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.GetShopFlashSaleResponse>>;
  getShopFlashSaleList(params: ShopeeSdkInput<ShopFlashSaleSchemas.GetShopFlashSaleListParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.GetShopFlashSaleListResponse>>;
  updateShopFlashSale(params: ShopeeSdkInput<ShopFlashSaleSchemas.UpdateShopFlashSaleParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.UpdateShopFlashSaleResponse>>;
  deleteShopFlashSale(params: ShopeeSdkInput<ShopFlashSaleSchemas.DeleteShopFlashSaleParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.DeleteShopFlashSaleResponse>>;
  addShopFlashSaleItems(params: ShopeeSdkInput<ShopFlashSaleSchemas.AddShopFlashSaleItemsParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.AddShopFlashSaleItemsResponse>>;
  getShopFlashSaleItems(params: ShopeeSdkInput<ShopFlashSaleSchemas.GetShopFlashSaleItemsParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.GetShopFlashSaleItemsResponse>>;
  updateShopFlashSaleItems(params: ShopeeSdkInput<ShopFlashSaleSchemas.UpdateShopFlashSaleItemsParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.UpdateShopFlashSaleItemsResponse>>;
  deleteShopFlashSaleItems(params: ShopeeSdkInput<ShopFlashSaleSchemas.DeleteShopFlashSaleItemsParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.DeleteShopFlashSaleItemsResponse>>;
  getItemCriteria(params?: ShopeeSdkInput<ShopFlashSaleSchemas.GetItemCriteriaParams>): Promise<ShopeeSdkOutput<ShopFlashSaleSchemas.GetItemCriteriaResponse>>;
}

export interface ShopeeShopApiGroup extends ShopeeSdkApiGroup {
  getProfile(params?: ShopeeSdkInput<ShopSchemas.GetProfileParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetProfileResponse>>;
  getShopInfo(params?: ShopeeSdkInput<ShopSchemas.GetShopInfoParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetShopInfoResponse>>;
  updateProfile(params: ShopeeSdkInput<ShopSchemas.UpdateProfileParams>): Promise<ShopeeSdkOutput<ShopSchemas.UpdateProfileResponse>>;
  getWarehouseDetail(params?: ShopeeSdkInput<ShopSchemas.GetWarehouseDetailParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetWarehouseDetailResponse>>;
  getShopNotification(params?: ShopeeSdkInput<ShopSchemas.GetShopNotificationParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetShopNotificationResponse>>;
  getAuthorisedResellerBrand(params: ShopeeSdkInput<ShopSchemas.GetAuthorisedResellerBrandParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetAuthorisedResellerBrandResponse>>;
  getBRShopOnboardingInfo(params?: ShopeeSdkInput<ShopSchemas.GetBRShopOnboardingInfoParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetBRShopOnboardingInfoResponse>>;
  getShopHolidayMode(params?: ShopeeSdkInput<ShopSchemas.GetShopHolidayModeParams>): Promise<ShopeeSdkOutput<ShopSchemas.GetShopHolidayModeResponse>>;
  setShopHolidayMode(params: ShopeeSdkInput<ShopSchemas.SetShopHolidayModeParams>): Promise<ShopeeSdkOutput<ShopSchemas.SetShopHolidayModeResponse>>;
}

export interface ShopeeTopPicksApiGroup extends ShopeeSdkApiGroup {
  addTopPicks(params: ShopeeSdkInput<TopPicksSchemas.AddTopPicksParams>): Promise<ShopeeSdkOutput<TopPicksSchemas.AddTopPicksResponse>>;
  deleteTopPicks(params: ShopeeSdkInput<TopPicksSchemas.DeleteTopPicksParams>): Promise<ShopeeSdkOutput<TopPicksSchemas.DeleteTopPicksResponse>>;
  getTopPicksList(): Promise<ShopeeSdkOutput<TopPicksSchemas.GetTopPicksListResponse>>;
  updateTopPicks(params: ShopeeSdkInput<TopPicksSchemas.UpdateTopPicksParams>): Promise<ShopeeSdkOutput<TopPicksSchemas.UpdateTopPicksResponse>>;
}

export interface ShopeeVideoApiGroup extends ShopeeSdkApiGroup {
  deleteVideo(params: ShopeeSdkInput<VideoSchemas.DeleteVideoParams>): Promise<ShopeeSdkOutput<VideoSchemas.DeleteVideoResponse>>;
  editVideoInfo(params: ShopeeSdkInput<VideoSchemas.EditVideoInfoParams>): Promise<ShopeeSdkOutput<VideoSchemas.EditVideoInfoResponse>>;
  getCoverList(params: ShopeeSdkInput<VideoSchemas.GetCoverListParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetCoverListResponse>>;
  getMetricTrend(params: ShopeeSdkInput<VideoSchemas.GetMetricTrendParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetMetricTrendResponse>>;
  getOverviewPerformance(params: ShopeeSdkInput<VideoSchemas.GetOverviewPerformanceParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetOverviewPerformanceResponse>>;
  getProductPerformanceList(params: ShopeeSdkInput<VideoSchemas.GetProductPerformanceListParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetProductPerformanceListResponse>>;
  getUserDemographics(params?: ShopeeSdkInput<VideoSchemas.GetUserDemographicsParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetUserDemographicsResponse>>;
  getVideoDetail(params: ShopeeSdkInput<VideoSchemas.GetVideoDetailParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoDetailResponse>>;
  getVideoDetailAudienceDistribution(params: ShopeeSdkInput<VideoSchemas.GetVideoDetailAudienceDistributionParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoDetailAudienceDistributionResponse>>;
  getVideoDetailMetricTrend(params: ShopeeSdkInput<VideoSchemas.GetVideoDetailMetricTrendParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoDetailMetricTrendResponse>>;
  getVideoDetailPerformance(params: ShopeeSdkInput<VideoSchemas.GetVideoDetailPerformanceParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoDetailPerformanceResponse>>;
  getVideoDetailProductPerformance(params: ShopeeSdkInput<VideoSchemas.GetVideoDetailProductPerformanceParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoDetailProductPerformanceResponse>>;
  getVideoList(params: ShopeeSdkInput<VideoSchemas.GetVideoListParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoListResponse>>;
  getVideoPerformanceList(params: ShopeeSdkInput<VideoSchemas.GetVideoPerformanceListParams>): Promise<ShopeeSdkOutput<VideoSchemas.GetVideoPerformanceListResponse>>;
  postVideo(params: ShopeeSdkInput<VideoSchemas.PostVideoParams>): Promise<ShopeeSdkOutput<VideoSchemas.PostVideoResponse>>;
}

export interface ShopeeVoucherApiGroup extends ShopeeSdkApiGroup {
  addVoucher(params: ShopeeSdkInput<VoucherSchemas.AddVoucherParams>): Promise<ShopeeSdkOutput<VoucherSchemas.AddVoucherResponse>>;
  deleteVoucher(params: ShopeeSdkInput<VoucherSchemas.DeleteVoucherParams>): Promise<ShopeeSdkOutput<VoucherSchemas.DeleteVoucherResponse>>;
  endVoucher(params: ShopeeSdkInput<VoucherSchemas.EndVoucherParams>): Promise<ShopeeSdkOutput<VoucherSchemas.EndVoucherResponse>>;
  updateVoucher(params: ShopeeSdkInput<VoucherSchemas.UpdateVoucherParams>): Promise<ShopeeSdkOutput<VoucherSchemas.UpdateVoucherResponse>>;
  getVoucher(params: ShopeeSdkInput<VoucherSchemas.GetVoucherParams>): Promise<ShopeeSdkOutput<VoucherSchemas.GetVoucherResponse>>;
  getVoucherList(params: ShopeeSdkInput<VoucherSchemas.GetVoucherListParams>): Promise<ShopeeSdkOutput<VoucherSchemas.GetVoucherListResponse>>;
}

export interface ShopeeTypedSdkApiGroups {
  accountHealth: ShopeeAccountHealthApiGroup;
  addOnDeal: ShopeeAddOnDealApiGroup;
  ads: ShopeeAdsApiGroup;
  ams: ShopeeAmsApiGroup;
  auth: ShopeeAuthApiGroup;
  bundleDeal: ShopeeBundleDealApiGroup;
  discount: ShopeeDiscountApiGroup;
  fbs: ShopeeFbsApiGroup;
  firstMile: ShopeeFirstMileApiGroup;
  followPrize: ShopeeFollowPrizeApiGroup;
  globalProduct: ShopeeGlobalProductApiGroup;
  livestream: ShopeeLivestreamApiGroup;
  logistics: ShopeeLogisticsApiGroup;
  mediaSpace: ShopeeMediaSpaceApiGroup;
  media: ShopeeMediaApiGroup;
  merchant: ShopeeMerchantApiGroup;
  order: ShopeeOrderApiGroup;
  payment: ShopeePaymentApiGroup;
  product: ShopeeProductApiGroup;
  public: ShopeePublicApiGroup;
  push: ShopeePushApiGroup;
  returns: ShopeeReturnsApiGroup;
  sbs: ShopeeSbsApiGroup;
  shopCategory: ShopeeShopCategoryApiGroup;
  shopFlashSale: ShopeeShopFlashSaleApiGroup;
  shop: ShopeeShopApiGroup;
  topPicks: ShopeeTopPicksApiGroup;
  video: ShopeeVideoApiGroup;
  voucher: ShopeeVoucherApiGroup;
}
