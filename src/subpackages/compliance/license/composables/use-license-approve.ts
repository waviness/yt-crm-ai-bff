/**
 * 证照审批页业务逻辑 Composable
 * 封装证照审批页面的业务逻辑和状态管理
 * 包含审批列表查询、筛选、分页等功能
 */

import type { FilterFormData, LicenseConfig, LicenseData } from '../types';
import type { PaginationParams } from '@/types/common';

/**
 * 构建审批页面API请求参数
 * 根据筛选条件、配置信息和分页参数构建API请求所需的参数
 *
 * @param formData - 筛选表单数据
 * @param config - 证照配置信息
 * @param pagination - 分页参数
 * @returns API请求参数对象
 */
function buildApprovalApiParams(
  formData: FilterFormData,
  config: LicenseConfig,
  pagination: PaginationParams
) {
  const {
    companyKeyWord,
    expireStatus,
    companyType,
    queryEntryId,
    licenseKeyWord,
    validEndDateBegin,
    validEndDateTerminate,
  } = formData;

  // 对于审批页面，状态映射不同
  const statusNum = config.current === 0 ? 1 : config.agreeActive;

  const params: any = {
    companyKeyWord,
    expireStatus: expireStatus.value,
    queryEntryId,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  };

  if (config.licenseType === 0) {
    // 企业证照参数
    params.licenseStatus = statusNum;
    params.licenseKeyWord = licenseKeyWord;
    params.validEndDateBegin = validEndDateBegin;
    params.validEndDateTerminate = validEndDateTerminate;
  } else {
    // 委托书参数
    params.letterStatus = statusNum;
    params.letterKeyWord = licenseKeyWord;
    params.dateToBegin = validEndDateBegin;
    params.dateToTerminate = validEndDateTerminate;
    params.companyType = companyType.value;
  }

  return params;
}

/**
 * 证照审批页业务逻辑
 * 提供审批页相关的业务逻辑和状态管理
 *
 * @returns 审批页相关的方法和状态
 */
export function useLicenseApprove() {
  // 配置状态
  const config = ref<LicenseConfig>({
    licenseType: 0, // 0-企业证照，1-委托书
    current: 0, // 当前标签页索引
    agreeActive: 3, // 审批状态：3-通过，4-未通过
    licenseStatus: 1, // 证照状态：1-待处理，2-所有
  });

  // 表单数据
  const formData = ref<FilterFormData>({
    companyKeyWord: '',
    licenseKeyWord: '',
    queryEntryId: '',
    expireStatus: {
      value: '',
      name: '',
    },
    validEndDateBegin: '',
    validEndDateTerminate: '',
    companyType: {
      value: '',
      name: '',
    },
  });

  /**
   * 审批页面数据获取函数
   */
  const fetchApprovalLicenseData = async (pagination: { pageNum: number; pageSize: number }) => {
    const params = buildApprovalApiParams(formData.value, config.value, pagination);

    const response =
      config.value.licenseType === 0
        ? await LicenseService.queryLicenseList(params)
        : await LicenseService.queryAttorneyLetterList(params);

    return {
      list: response.list,
      hasNextPage: response.hasNextPage,
      total: response.total,
    };
  };

  /**
   * 标签页切换处理
   */
  const handleActiveChange = ({ index }: { index: number }) => {
    config.value.current = index;
    config.value.agreeActive = 3;
  };

  /**
   * 证照类型切换处理
   */
  const handleTypeChange = (filterVal: any, val: number) => {
    formData.value = filterVal;
    config.value.licenseType = val;
    config.value.current = 0;
    config.value.agreeActive = 3;
  };

  /**
   * 筛选条件变化处理
   */
  const handleFilterChange = (filterData: FilterFormData) => {
    formData.value = { ...formData.value, ...filterData };
  };

  /**
   * 审批状态切换处理
   */
  const handleAgreeChange = (status: number) => {
    config.value.agreeActive = status;
  };

  /**
   * 跳转到详情页
   */
  const toDetail = (item: LicenseData) => {
    const appStore = useAppStore();
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.licenseDetail, {
      listType: 2, // 审批列表类型
      licenseType: config.value.licenseType,
      statusType: config.value.current === 0 ? 1 : config.value.agreeActive,
      item,
    });
  };

  return {
    config,
    formData,
    fetchApprovalLicenseData,
    handleActiveChange,
    handleTypeChange,
    handleFilterChange,
    handleAgreeChange,
    toDetail,
  };
}
