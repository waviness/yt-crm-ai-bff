/**
 * 证照列表页业务逻辑 Composable
 * 封装证照列表页面的业务逻辑和状态管理
 * 包含列表查询、筛选、分页、状态切换等功能
 */

import type { FilterFormData, LicenseConfig, LicenseData } from '../types';
import type { PaginationParams } from '@/types/common';

/**
 * 构建API请求参数
 * 根据筛选条件、配置信息和分页参数构建API请求所需的参数
 *
 * @param formData - 筛选表单数据
 * @param config - 证照配置信息
 * @param pagination - 分页参数
 * @returns API请求参数对象
 */
function buildApiParams(
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

  const { licenseType, current, agreeActive, licenseStatus } = config;

  // 基础参数
  const baseParams = {
    companyKeyWord,
    expireStatus: expireStatus.value,
    queryEntryId,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
    moreRecordFlag: licenseStatus === 1 ? 0 : 1,
  };

  // 状态参数处理
  const statusNum = current < 2 ? current : agreeActive;

  // 根据证照类型添加特定参数
  if (licenseType === 0) {
    // 企业证照参数
    return {
      ...baseParams,
      licenseKeyWord,
      validEndDateBegin,
      validEndDateTerminate,
      licenseStatus: statusNum,
    };
  } else {
    // 委托书参数
    return {
      ...baseParams,
      letterKeyWord: licenseKeyWord,
      companyType: companyType.value,
      dateToBegin: validEndDateBegin,
      dateToTerminate: validEndDateTerminate,
      letterStatus: statusNum,
    };
  }
}

/**
 * 证照列表页业务逻辑
 * 提供列表页相关的业务逻辑和状态管理
 *
 * @returns 列表页相关的方法和状态
 */
export function useLicenseList() {
  // 状态定义
  const statusList = ref([{ name: '临期' }, { name: '审批中' }, { name: '已审批' }]);

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
   * API调用函数
   */
  const fetchLicenseData = async (pagination: { pageNum: number; pageSize: number }) => {
    const params = buildApiParams(formData.value, config.value, pagination);

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
    // 切换到临期标签时，重置证照状态为待处理
    if (index === 0) {
      config.value.licenseStatus = 1;
    }
    // 每次切换标签时，重置审批状态为通过
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
   * 自动在通过(3)和未通过(4)之间切换
   */
  const handleAgreeChange = () => {
    config.value.agreeActive = config.value.agreeActive === 3 ? 4 : 3;
  };

  /**
   * 证照状态切换处理
   * 自动在待处理(1)和所有(2)之间切换
   */
  const handleStatusChange = () => {
    config.value.licenseStatus = config.value.licenseStatus === 1 ? 2 : 1;
  };

  /**
   * 跳转到详情页
   */
  const toDetail = (data: LicenseData) => {
    // 检查是否需要解锁确认
    if (data.unLockTimes && config.value.current === 0 && data.reApproveStatus === 1) {
      // 复签中，显示解锁确认对话框
      showModal({
        title: '',
        content: '请等待部门经理解锁',
        showCancel: false,
      });
    } else {
      // 正常跳转到详情页
      const appStore = useAppStore();
      appStore.setHadDoneOnDetail(false);

      router.push(RouteMap.licenseDetail, {
        listType: 1,
        licenseType: config.value.licenseType,
        statusType: config.value.current < 2 ? config.value.current : config.value.agreeActive,
        item: data,
      });
    }
  };

  return {
    statusList,
    config,
    formData,
    fetchLicenseData,
    handleActiveChange,
    handleTypeChange,
    handleFilterChange,
    handleAgreeChange,
    handleStatusChange,
    toDetail,
  };
}
