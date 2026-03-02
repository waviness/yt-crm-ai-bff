/**
 * 冲差管理相关类型定义
 */

// 冲差总单信息
export interface ImpulseInfo {
  id: string | number;
  confirmDate?: string;
  goodsId?: string | number;
  goodsName?: string;
  goodsType?: string;
  factoryName?: string;
  endDate?: string;
  memo?: string;
  creId?: string | number;
  creName?: string;
  files?: ImpulseFile[];
  [key: string]: any;
}

// 冲差细单信息
export interface ImpulseDetailInfo {
  id: string | number;
  docId: string | number;
  confirmDate?: string;
  customId?: string | number;
  customName?: string;
  deptId?: string | number;
  deptName?: string;
  entryId?: string | number;
  entryName?: string;
  confirmMemo?: string;
  memo?: string;
  salerId?: string | number;
  files?: ImpulseFile[];
  [key: string]: any;
}

// 文件信息
export interface ImpulseFile {
  index: number;
  address: string;
  name?: string;
  [key: string]: any;
}

// 筛选条件
export interface ImpulseFilterData {
  docId: string;
  dtlId: string;
  goods: string;
  customer: string;
  factory: string;
  start: string;
  end: string;
}

// 查询参数
export interface ImpulseQueryParams {
  docId?: string;
  dtlId?: string;
  goods?: string;
  customer?: string;
  factory?: string;
  start?: string;
  end?: string;
  status: number; // 1未处理 2已处理 3已审核
  pageNum: number;
  pageSize: number;
}

// 细单查询参数
export interface ImpulseDetailQueryParams {
  docId: string | number;
  status: number;
}

// 图片上传参数
export interface ImpulseFileUploadParams {
  docId: string | number;
  dtlId: string | number;
  url: string;
}

// 提交参数
export interface ImpulseSubmitParams {
  dtlId: string | number;
  memo?: string;
  userId?: string | number;
}

// 状态类型
export type ImpulseStatus = 1 | 2 | 3; // 1未处理 2已处理 3已审核

// 操作类型
export type ImpulseActionType = 1 | 2 | 3; // 1上传图片 2查看图片 3提交
