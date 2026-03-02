// 项目信息接口
export interface ProjectItem {
  projectId: string; // 项目ID
  projectName: string; // 项目名称
  projectTypeName: string; // 项目类型名称
  projectInfo?: string; // 项目描述
  projectGoodsResList: ProjectGoods[]; // 关联品种列表
  projectUserResList: ProjectUser[]; // 关联业务员列表
  fileVOList?: FileVO[]; // 文件列表
}

// 项目品种接口
export interface ProjectGoods {
  goodsId: string;
  goodsName: string;
  goodsType: string; // 规格
  goodsUnit: string; // 单位
  medicarePrice?: number; // 医保支付价格
  medicareTypeName?: string; // 医保类型
  factoryName?: string; // 厂家
  productTypeName?: string; // 产品类型
  centrCapInfo?: string; // 集采情况
}

// 项目业务员接口
export interface ProjectUser {
  userId: string;
  userName: string;
}

// 文件接口
export interface FileVO {
  fileName: string;
  fileType: string;
  fileUrl: string;
}
