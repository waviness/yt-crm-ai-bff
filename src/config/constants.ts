export const conTypeList = [
  { value: 0, name: '缺货', icon: '#ytcrm-qh' },
  { value: 2, name: '价格限销', icon: '#ytcrm-jgxx' },
  { value: 3, name: '库存下限', icon: '#ytcrm-kcxx' },
  { value: 4, name: '两票制', icon: '#ytcrm-lpz' },
  { value: 5, name: '紧俏药品', icon: '#ytcrm-jqyp' },
  { value: 6, name: '禁限销', icon: '#ytcrm-jxx' },
  { value: 7, name: '库存状态', icon: '#ytcrm-kczt' },
  { value: 8, name: '近效期', icon: '#ytcrm-jxq' },
];

export const lockMenuForSalesman: any = [];
export const lockMenuForPurchaser: any = [];

for (let index = 0; index < conTypeList.length; index++) {
  const element = conTypeList[index];
  lockMenuForSalesman.push({
    icon: element.icon + '-yw',
    path: `/subpackages/lock/index?role=1&conType=${element.value}`,
    pmsName: element.name,
    pmsId: 437,
    type: element.value,
    role: 1,
    ingShowFlag: false,
  });

  if (!(element.value === 7 || element.value === 8)) {
    lockMenuForPurchaser.push({
      icon: element.icon + '-cg',
      path: `/subpackages/lock/index?role=2&conType=${element.value}`,
      pmsName: element.name,
      pmsId: 445,
      role: 2,
      type: element.value,
      ingShowFlag: false,
    });
  }
}

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  INITIAL_PAGE: 1,
} as const;

// 组件选项常量
export const SHARED_STYLE_OPTIONS = {
  options: {
    // 微信小程序：关闭样式隔离（仅当前页面/组件生效）
    styleIsolation: 'shared' as const,
  },
} as const;

// 上传相关常量定义
export const FORMDATA_UPLOAD_ENDPOINTS = {
  /**
   * 询证函图片的上传
   *  /api/task/uploadConfirmationRequestPictures
   */
  CONFIRMATION_LITTER: (() => {
    // #ifdef MP-WEIXIN
    return `${import.meta.env.VITE_WECHAT_API_URL}/api/task/uploadConfirmationRequestPictures`;
    // #endif

    // #ifdef H5
    return `${import.meta.env.VITE_WECHAT_API_PREFIX}/api/task/uploadConfirmationRequestPictures`;
    // #endif
  })(),
  /**
   * 业务员主动发起询证函
   */
  ACTIVE_INITIATE_CONFIRMATION_LITTER: (() => {
    // #ifdef MP-WEIXIN
    return `${import.meta.env.VITE_WECHAT_API_URL}/api/task/activeInitiateConfirmationRequest`;
    // #endif

    // #ifdef H5
    return `${import.meta.env.VITE_WECHAT_API_PREFIX}/api/task/activeInitiateConfirmationRequest`;
    // #endif
  })(),
  /**
   * 收款认领上传附件
   */
  COLLECTION_UPLOAD_APPENDIX: (() => {
    // #ifdef MP-WEIXIN
    return `${import.meta.env.VITE_WECHAT_API_URL}/api/crmCollectionClaim/uploadAppendix`;
    // #endif

    // #ifdef H5
    return `${import.meta.env.VITE_WECHAT_API_PREFIX}/api/crmCollectionClaim/uploadAppendix`;
    // #endif
  })(),
} as const;
