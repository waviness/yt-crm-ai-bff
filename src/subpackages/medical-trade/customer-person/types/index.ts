// 筛选数据接口
export interface CustomerPersonFilterData {
  custom?: string; // 客户名称或ID
  sourceType?: string; // 来源类型：0-拓展客户，1-业务系统内客户
  customerType?: string; // 客户类型
  relStatus?: string; // 关联状态：0-未关联，1-已关联
}

// 客户人员列表项接口
export interface CustomerPersonItem {
  szymCustomerId: string; // 客户ID
  customerName: string; // 客户名称
  sourceType: number; // 来源类型：0-拓展客户，1-业务系统内客户
  customerTypeName?: string; // 客户类型名称
  customerType?: string; // 客户类型
  registerAddress?: string; // 注册地址
  relCustomerId?: string; // 关联的客户ID
  relCustomerName?: string; // 关联的客户名称
  operateName?: string; // 维护人姓名
  customerStaffNum: number; // 客户人员数量
  businessNatureName?: string; // 经营性质名称
  businessNature?: string; // 经营性质
  scienceLineName?: string; // 学术专线名称
  scienceLine?: string; // 学术专线
}

// 客户人员详情接口
export interface CustomerStaffDetail {
  scStaffId?: string; // 人员ID
  userId?: string; // 用户ID
  userName: string; // 人员姓名
  phoneNum: string; // 手机号
  wxCode: string; // 微信号
  gender?: number; // 性别：1-男，2-女
  genderName?: string; // 性别名称
  birthday?: string; // 生日
  age?: number; // 年龄
  officeId?: string; // 科室ID
  officeName?: string; // 科室名称
  positionId?: string; // 职位ID
  positionName?: string; // 职位名称
  structureLevel?: string; // 行政级别
  structureLevelName?: string; // 行政级别名称
  honorTitle?: string; // 头衔
  customerUserGrade?: string; // 客户分级
  customerUserGradeName?: string; // 客户分级名称
  degree?: string; // 学位
  graduatedSchool?: string; // 毕业学校
  createId?: string; // 创建人ID
  createName?: string; // 创建人姓名
}

// 选项接口
export interface OptionItem {
  value: string | number;
  name: string;
}

// 关联选项类型
export type RelOption = {
  name: string;
  value: string; // 格式：sourceType-relStatus
};
