export type Entry = {
  entryid: string;
  entryname: string;
};

/**
 * 订单筛选参数
 */
export interface OrderFilterParams {
  /**
   * 单据ID
   */
  codDocId: string;
  /**
   * 客户ID
   */
  customId: string;
  /**
   * 客户名称
   */
  customName: string;
  /**
   * 开始时间
   */
  startTime: string;
  /**
   * 结束时间
   */
  endTime: string;

  /**
   * 订单类型
   */
  orderType: string | number;
}
/**
 * report 商品列表项类型
 */
// 分类集合项类型
export interface FsCollectionItem {
  controllevel: number;
  typename: string;
}
export interface GoodsItem {
  smallimglink: string;
  bigimglink: string;
  narcoticId?: number;
  hadsale?: boolean;
  coldflag?: boolean;
  fsCollection?: FsCollectionItem[];
  goodsId: string | number;
  goodsName: string;
  goodstype: string;
  goodsunit: string;
  factoryid: string | number;
  factoryname: string;
  sausestatus?: number;
  gspusestatus?: number;
  ADDRESSID?: string | number;
  ADDRESS?: string;
  limitQty: number;
  entryId: string | number;
  bgzQty: number;
  limitQtyOfYy: number | null;
  yyBgzQty: number;
  nearlyEffectiveFlag?: number;
  dirType?: number;
  price?: number;
  mintotalgoodsqty?: number;
}
export interface GoodsDetail extends GoodsItem {
  supplyerid: string | number;
  supplyername: string;
  price: number;
  packsizeList: string;
  maxCanSellQty: number;
  yyMaxCanSellQty: number;
  salesqtycontrol: number;
  leastsaleqty: number;
  lastSellPrice?: number;
  lastSellQty?: number;
  lastSellDate?: string;
  dtlSinglenum?: number;
  dtlMonthnum?: number;
  sellQtyOfThisMonth?: number;
  dtlForwarddays?: number;
  qtyOfForwardDays?: number;
  dtlForwarddaysnum?: number;
  yyDtlSinglenum?: number;
  yyDtlMonthnum?: number;
  yySellQtyOfThisMonth?: number;
  yyDtlForwarddays?: number;
  yyDtlForwarddaysnum?: number;
  yyQtyOfForwardDays?: number;
}
