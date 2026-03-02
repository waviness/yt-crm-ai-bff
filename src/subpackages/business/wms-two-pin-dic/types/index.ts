// 筛选条件接口
export interface TwoPinFilterData {
  goodsNameOrId?: string; // 货品ID或名称
  entryId?: string; // 核算单元ID
  entryName?: string; // 核算单元名称
}

// 货品卡片信息接口
export interface TwoPinGoodsItem {
  goodsId: string; // 货品ID
  goodsName: string; // 货品名称
  goodstype: string; // 规格
  goodsunit: string; // 单位
  smallimglink: string; // 商品图片链接
  nearlyEffectiveFlag: boolean; // 近效期标识
  waiteProcessFlag: boolean; // 待处理标识
  waiteProcessotNum?: number; // 待处理批号数
  nearlyEffectiveLotNum?: number; // 可销库存
  [key: string]: any; // 其他可能的字段
}

// Tab状态枚举
export enum TwoPinTabStatus {
  PENDING = 0, // 未处理
  PROCESSED = 1, // 已处理
}
