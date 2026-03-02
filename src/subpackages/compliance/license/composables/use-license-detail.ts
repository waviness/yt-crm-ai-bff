/**
 * 证照详情页面核心状态管理 Composable
 * 处理证照详情页面的基础状态和计算属性
 */

import type { LicenseData, PageConfig, LoadingStates, PopupStates } from '../types';

/**
 * 使用证照详情功能
 * 提供证照详情页面的核心状态管理
 */
export function useLicenseDetail() {
  // 页面配置
  const pageConfig = ref<PageConfig>({
    msgType: '',
    listType: 1,
    licenseType: 0,
    statusType: 0,
  });

  // 表单数据
  const formData = ref<LicenseData>({
    buttonShow: true,
    expireLeftDay: 0,
  });

  // 加载状态
  const loadingStates = reactive<LoadingStates>({
    publishLoading: false,
    submitLoading: false,
    submitLoading2: false,
  });

  // 弹窗状态
  const popupStates = reactive<PopupStates>({
    chooseShow: false,
    actionShow: false,
  });

  // 其他状态
  const memo = ref('');
  const extensionReason = ref('');
  const approveStatus = ref<string>('4');

  /**
   * 计算证照状态类型
   */
  const licenseStatusType = computed(() => {
    const expireLeftDay = formData.value.expireLeftDay;
    return expireLeftDay > 7 ? 'success' : expireLeftDay >= 0 ? 'warning' : 'danger';
  });

  /**
   * 审批状态选项
   */
  const approveStatusList = ref([
    { name: '3', label: '是' },
    { name: '4', label: '否' },
  ]);

  // 日期选择相关
  const date = ref('');

  /**
   * 计算明天日期
   */
  const tomorrowDate = computed(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return time.format(tomorrow, time.FORMATS.ISO_DATE);
  });

  /**
   * 计算7天后的日期
   */
  const sevenDaysLaterDate = computed(() => {
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    return time.format(sevenDaysLater, time.FORMATS.ISO_DATE);
  });

  /**
   * 日期确认处理
   */
  const handleDateConfirm = (value: string, formData: LicenseData) => {
    const dateToTime = Date.parse(formData.dateTo || '');
    const targetTime = Date.parse(value);

    if (dateToTime && targetTime < dateToTime) {
      showToast('延期时间不能早于效期至');
    } else {
      date.value = value;
    }
  };

  return {
    // 状态 - 返回响应式对象，允许修改
    pageConfig,
    formData,
    loadingStates,
    popupStates,
    memo,
    extensionReason,
    approveStatus,
    licenseStatusType,
    approveStatusList,
    // 日期选择
    date,
    tomorrowDate,
    sevenDaysLaterDate,
    handleDateConfirm,
  };
}
