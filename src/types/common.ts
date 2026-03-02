/**
 * 通用类型定义文件
 * 统一管理项目中常用的类型定义
 */

/**
 * API响应基础类型
 */
export interface ApiResponse<T = any> {
  /** 响应数据 */
  data: T;
  /** 响应状态码 */
  code: number;
  /** 响应消息 */
  message: string;
  /** 是否成功 */
  success: boolean;
}

/**
 * 分页查询参数类型
 */
export interface PaginationParams {
  /** 页码 */
  pageNum: number;
  /** 每页条数 */
  pageSize: number;
}

/**
 * 分页响应数据类型
 */
export interface PaginationResult<T = any> {
  /** 数据列表 */
  list: T[];
  /** 是否有下一页 */
  hasNextPage: boolean;
  /** 总条数 */
  total: number;
  /** 当前页码 */
  pageNum?: number;
  /** 每页条数 */
  pageSize?: number;
}

/**
 * 菜单项基础类型
 */
export interface BaseMenuItem {
  /** 菜单ID */
  id?: string;
  /** 菜单名称 */
  name: string;
  /** 菜单路径 */
  path?: string;
  /** 菜单图标 */
  icon?: string;
  /** 权限标识 */
  permission?: string;
  /** 是否可用 */
  enabled?: boolean;
}

/**
 * 用户基本信息类型
 */
export interface UserBasicInfo {
  /** 用户ID */
  userId: string;
  /** 用户名 */
  userName: string;
  /** 部门名称 */
  depName: string;
  /** 头像地址 */
  headerImg?: string;
  /** 手机号 */
  phone?: string;
  /** 邮箱 */
  email?: string;
}

/**
 * 日期范围类型
 */
export interface DateRange {
  /** 开始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
}

/**
 * 通用选项类型 - 用于业务选项常量
 */
export interface OptionItem {
  /** 选项ID */
  readonly id: number;
  /** 选项名称 */
  readonly name: string;
  /** 是否禁用 */
  readonly disabled?: boolean;
}

/**
 * 表单验证结果类型
 */
export interface ValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误消息 */
  message?: string;
}

/**
 * 上传文件类型
 */
export interface UploadFileInfo {
  /** 文件名 */
  name: string;
  /** 文件大小 */
  size: number;
  /** 文件类型 */
  type: string;
  /** 文件路径 */
  url: string;
  /** 上传状态 */
  status: 'uploading' | 'done' | 'error';
  /** 文件对象 */
  file?: File;
  /** 临时文件路径 */
  tempFilePath?: string;
}

/**
 * 组件基础属性类型
 */
export interface BaseComponentProps {
  /** 是否可见 */
  visible?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否只读 */
  readonly?: boolean;
  /** 自定义样式类名 */
  customClass?: string;
  /** 自定义内联样式 */
  customStyle?: Record<string, string | number>;
}

/**
 * 主题配置类型
 */
export interface ThemeConfig {
  /** 主色调 */
  primary: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 信息色 */
  info: string;
}

/**
 * 环境配置类型
 */
export interface EnvironmentConfig {
  /** 环境名称 */
  name: string;
  /** API基础地址 */
  apiUrl: string;
  /** 是否为开发环境 */
  isDev: boolean;
  /** 是否启用调试 */
  debug: boolean;
}

/**
 * 操作结果类型
 */
export interface OperationResult {
  /** 是否成功 */
  success: boolean;
  /** 结果消息 */
  message: string;
  /** 返回数据 */
  data?: any;
  /** 错误代码 */
  errorCode?: string;
}

/**
 * 标签页项类型
 */
export interface TabsItem {
  /** 标签名称 */
  name: string;
  /** 徽章配置 */
  badge: {
    /** 是否显示红点 */
    isDot?: boolean;
    /** 徽章数值 */
    value?: string | number;
  };
}

/**
 * 客户信息类型
 */
export interface CustomerItem {
  /** 客户ID */
  customId: string;
  /** 客户名称 */
  customName: string;
}

/**
 * 销售人员信息类型
 */
export interface SalesItem {
  /** 用户ID */
  userId: string;
  /** 用户名称 */
  userName: string;
  /** 部门ID */
  entryId: string;
  /** 部门名称 */
  entryName: string;
}

/**
 * 加载状态类型
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 排序方向类型
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 排序配置类型
 */
export interface SortConfig {
  /** 排序字段 */
  field: string;
  /** 排序方向 */
  order: SortOrder;
}
