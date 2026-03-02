/**
 * 资金详情相关逻辑
 *
 * 主要功能：
 * - 管理资金详情数据的状态
 * - 处理复杂的业务状态判断逻辑
 * - 提供数据提交和历史查询功能
 */
import { FundingStatusType, type FundingFormData } from '../types';

// 资金业务相关常量
const DATE_CONSTANTS = {
  // 次月填报开始日期（每月26号开始可以填报次月数据）
  NEXT_MONTH_START_DAY: 26,
  // 当月数据只读截止日期（每月25号后进入只读状态）
  CURRENT_MONTH_READONLY_DAY: 25,
  // 初次填报截止日期（每月4号前可以初次填报）
  INITIAL_REPORT_END_DAY: 4,
} as const;

const STATUS_FLAGS = {
  // 最大添加标志值
  MAX_ADD_FLAG: 2,
  // 最大修改标志值
  MAX_MODIFY_FLAG: 1,
} as const;

const BUSINESS_STATUS = {
  // 初始状态
  INITIAL_STATUS: -1,
} as const;

/**
 * 日期信息接口
 */
interface DateInfo {
  /** 目标年份 */
  year: number;
  /** 目标月份 */
  month: number;
  /** 当前年份 */
  currentYear: number;
  /** 当前月份 */
  currentMonth: number;
  /** 当前日期 */
  currentDay: number;
}

/**
 * 状态判断结果接口
 */
interface StatusResult {
  /** 状态类型 */
  statusType: number;
  /** 是否只读 */
  readonly: boolean;
}

/**
 * 资金详情管理 Composable
 *
 * @returns 返回资金详情相关的状态、数据和方法
 */
export const useFundingDetail = () => {
  // ==================== 响应式状态定义 ====================

  /** 修改权限标识 */
  const modifyAuth = ref(false);

  /** 当前状态类型 */
  const statusType = ref<number>(BUSINESS_STATUS.INITIAL_STATUS);
  /** 详情数据对象 */
  const detailObj = ref<FundingFormData>({
    addFlag: 0,
    modifyFlag: 0,
    isFill: false,
    creTime: '',
    deptName: '',
    dhAmount: 0,
    chAmount: 0,
    oldDhAmount: 0,
    oldChAmount: 0,
    xsAmount: 0,
    reason: '',
    total: 0,
  });

  /** 资金表单ID */
  const cffId = ref('');

  /** 目标年份 */
  const year = ref('');

  /** 目标月份 */
  const month = ref('');

  /** 是否只读状态 */
  const readonly = ref(false);

  /** 加载状态 */
  const loading = ref(false);

  /** 箭头方向 */
  const arrow = ref<'up' | 'down'>('down');

  /** 历史记录列表 */
  const historyList = ref([]);

  /** 用户输入数据对象 */
  const inputObj = ref({
    xsAmount: null as number | null,
    dhAmount: null as number | null,
    chAmount: null as number | null,
    reason: '',
    total: null as number | null,
  });

  // ==================== 基础工具方法 ====================

  /**
   * 切换箭头状态
   * 用于控制历史记录展开/收起
   */
  const changeArrow = () => {
    arrow.value = arrow.value === 'down' ? 'up' : 'down';
  };

  /**
   * 输入变化时重新计算合计
   * 当用户修改电汇金额或承兑金额时，自动计算总金额
   */
  const onInputChange = async () => {
    await nextTick();
    const dhAmount = Number(inputObj.value.dhAmount) || 0;
    const chAmount = Number(inputObj.value.chAmount) || 0;
    inputObj.value.total = calculateTotal(dhAmount, chAmount);
  };

  /**
   * 获取历史记录
   * 查询当前资金表单的历史修改记录
   */
  const getHistory = async () => {
    const res = await FundingService.queryFundFormHistory({ cffId: cffId.value });
    historyList.value = res;
  };

  // ==================== 状态判断相关方法 ====================

  /**
   * 获取当前日期信息
   * 构建用于状态判断的日期对象
   */
  const getCurrentDateInfo = (): DateInfo => {
    const now = new Date();
    return {
      year: +year.value,
      month: +month.value,
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth() + 1,
      currentDay: now.getDate(),
    };
  };

  /**
   * 判断是否为未来月份数据
   * @param dateInfo 日期信息
   * @returns 是否为未来月份
   */
  const isFutureMonth = (dateInfo: DateInfo): boolean => {
    const { year, month, currentYear, currentMonth } = dateInfo;
    return year > currentYear || (year === currentYear && month > currentMonth);
  };

  /**
   * 判断是否为当月数据
   * @param dateInfo 日期信息
   * @returns 是否为当月
   */
  const isCurrentMonth = (dateInfo: DateInfo): boolean => {
    const { year, month, currentYear, currentMonth } = dateInfo;
    return year === currentYear && month === currentMonth;
  };

  /**
   * 处理次月数据状态逻辑
   *
   * 业务规则：
   * - 每月26号后可以填报次月数据
   * - 26号前次月数据为只读状态
   *
   * @param dateInfo 日期信息
   * @returns 状态判断结果
   */
  const handleFutureMonthStatus = (dateInfo: DateInfo): StatusResult => {
    const { currentDay } = dateInfo;

    // 26号之后可以填报次月数据
    if (currentDay >= DATE_CONSTANTS.NEXT_MONTH_START_DAY) {
      const canAdd = detailObj.value.addFlag < STATUS_FLAGS.MAX_ADD_FLAG;
      return {
        statusType: canAdd ? detailObj.value.addFlag + 1 : FundingStatusType.DETAIL,
        readonly: !canAdd,
      };
    }

    // 26号之前不能填报次月数据
    return {
      statusType: FundingStatusType.DETAIL,
      readonly: true,
    };
  };

  /**
   * 处理当月数据状态逻辑
   *
   * 业务规则：
   * - 1-4号：可以进行初次填报
   * - 5-24号：只能查看详情，是否可编辑取决于修改权限
   * - 25-31号：进入修改限制期，根据修改次数和权限决定是否只读
   *
   * @param dateInfo 日期信息
   * @returns 状态判断结果
   */
  const handleCurrentMonthStatus = (dateInfo: DateInfo): StatusResult => {
    const { currentDay } = dateInfo;

    // 25号之后，当月数据进入修改限制期
    if (currentDay >= DATE_CONSTANTS.CURRENT_MONTH_READONLY_DAY) {
      return {
        statusType: FundingStatusType.DETAIL,
        readonly: detailObj.value.modifyFlag >= STATUS_FLAGS.MAX_MODIFY_FLAG && !modifyAuth.value,
      };
    }

    // 4号之前，可以进行初次填报
    if (currentDay <= DATE_CONSTANTS.INITIAL_REPORT_END_DAY) {
      const canAdd = detailObj.value.addFlag < STATUS_FLAGS.MAX_ADD_FLAG;
      return {
        statusType: canAdd ? detailObj.value.addFlag + 1 : FundingStatusType.DETAIL,
        readonly: !canAdd,
      };
    }

    // 5-24号期间，只能查看详情，是否只读取决于修改权限
    return {
      statusType: FundingStatusType.DETAIL,
      readonly: !modifyAuth.value,
    };
  };

  /**
   * 处理历史数据状态逻辑
   *
   * 业务规则：
   * - 历史数据只能查看详情
   * - 是否可编辑取决于用户的修改权限
   *
   * @returns 状态判断结果
   */
  const handleHistoryDataStatus = (): StatusResult => {
    return {
      statusType: FundingStatusType.DETAIL,
      readonly: !modifyAuth.value,
    };
  };

  /**
   * 确定状态类型和只读状态
   *
   * 根据当前日期和目标日期的关系，判断数据的操作权限：
   * - 未来月份：次月数据处理逻辑
   * - 当前月份：当月数据处理逻辑
   * - 历史月份：历史数据处理逻辑
   */
  const determineStatusAndReadonly = () => {
    const dateInfo = getCurrentDateInfo();
    let result: StatusResult;

    if (isFutureMonth(dateInfo)) {
      // 处理次月数据
      result = handleFutureMonthStatus(dateInfo);
    } else if (isCurrentMonth(dateInfo)) {
      // 处理当月数据
      result = handleCurrentMonthStatus(dateInfo);
    } else {
      // 处理历史数据
      result = handleHistoryDataStatus();
    }

    statusType.value = result.statusType;
    readonly.value = result.readonly;
  };

  // ==================== 数据处理相关方法 ====================

  /**
   * 初始化输入表单数据
   * 根据当前状态和详情数据，设置表单的初始值
   *
   * @param data 详情数据
   */
  const initializeInputData = (data: FundingFormData) => {
    // 只在初次填报时设置销售金额
    if (statusType.value === FundingStatusType.INITIAL) {
      inputObj.value.xsAmount = data.xsAmount;
    }

    // 设置基础输入数据
    inputObj.value.dhAmount = data.dhAmount;
    inputObj.value.chAmount = data.chAmount;
    inputObj.value.reason = data.reason || '';

    // 重新计算合计
    onInputChange();
  };

  /**
   * 获取详情数据
   *
   * 主要流程：
   * 1. 调用API获取数据
   * 2. 更新详情对象
   * 3. 确定当前状态和权限
   * 4. 初始化表单数据
   * 5. 根据需要获取历史记录
   */
  const getDetail = async () => {
    try {
      loading.value = true;

      // 获取详情数据
      const res = await FundingService.queryFundFormDtl({ cffId: cffId.value });
      detailObj.value = { ...detailObj.value, ...res };

      // 确定状态和只读状态
      determineStatusAndReadonly();

      // 初始化输入表单数据
      initializeInputData(res);

      // 如果已填写，获取历史记录
      if (detailObj.value.isFill) {
        await getHistory();
      }
    } finally {
      loading.value = false;
    }
  };

  // ==================== 提交相关接口和方法 ====================

  /** 提交参数基础接口 */
  interface BaseSubmitParams {
    cffId: string;
    xsAmount: number | null;
    dhAmount: number | null;
    chAmount: number | null;
    reason: string;
  }

  /** 新增表单参数接口 */
  interface AddFormParams extends BaseSubmitParams {
    addFlag: number;
  }

  /** 修改表单参数接口 */
  interface ModifyFormParams extends BaseSubmitParams {
    modifyFlag: number;
  }

  /**
   * 验证提交数据
   *
   * 验证规则：
   * - 至少需要填写一项金额（电汇或承兑）
   * - 金额不能为负数
   *
   * @returns 验证结果
   */
  const validateSubmitData = (): { isValid: boolean; message?: string } => {
    const { dhAmount, chAmount } = inputObj.value;

    // 至少需要填写一项金额
    if (
      (dhAmount === null || dhAmount === undefined) &&
      (chAmount === null || chAmount === undefined)
    ) {
      return { isValid: false, message: '请至少填写一项金额' };
    }

    // 金额不能为负数
    if (dhAmount !== null && dhAmount < 0) {
      return { isValid: false, message: '电汇金额不能为负数' };
    }

    if (chAmount !== null && chAmount < 0) {
      return { isValid: false, message: '承兑金额不能为负数' };
    }

    return { isValid: true };
  };

  /**
   * 构建基础提交参数
   * 从当前输入状态构建API调用所需的参数
   *
   * @returns 基础提交参数
   */
  const buildBaseParams = (): BaseSubmitParams => {
    return {
      cffId: cffId.value,
      xsAmount: inputObj.value.xsAmount,
      dhAmount: inputObj.value.dhAmount,
      chAmount: inputObj.value.chAmount,
      reason: inputObj.value.reason,
    };
  };

  /**
   * 转换参数为API所需格式
   * 过滤null值，确保API参数类型正确
   */
  const convertToApiParams = (
    params: AddFormParams | ModifyFormParams
  ): Record<string, string | number> => {
    const apiParams: Record<string, string | number> = {
      cffId: params.cffId,
      reason: params.reason,
    };

    // 只有非null值才添加到API参数中
    if (params.xsAmount !== null && params.xsAmount !== undefined) {
      apiParams.xsAmount = params.xsAmount;
    }
    if (params.dhAmount !== null && params.dhAmount !== undefined) {
      apiParams.dhAmount = params.dhAmount;
    }
    if (params.chAmount !== null && params.chAmount !== undefined) {
      apiParams.chAmount = params.chAmount;
    }

    // 添加对应的标志字段
    if ('addFlag' in params) {
      apiParams.addFlag = params.addFlag;
    }
    if ('modifyFlag' in params) {
      apiParams.modifyFlag = params.modifyFlag;
    }

    return apiParams;
  };

  /**
   * 提交新增表单
   * 用于初次填报或再次上报
   *
   * @returns API响应结果
   */
  const submitAddForm = async () => {
    const params: AddFormParams = {
      ...buildBaseParams(),
      addFlag: detailObj.value.addFlag,
    };
    const apiParams = convertToApiParams(params);
    return await FundingService.addFundForm(apiParams);
  };

  /**
   * 提交修改表单
   * 用于修改已有的资金数据
   *
   * @returns API响应结果
   */
  const submitModifyForm = async () => {
    const params: ModifyFormParams = {
      ...buildBaseParams(),
      modifyFlag: detailObj.value.modifyFlag,
    };
    const apiParams = convertToApiParams(params);
    return await FundingService.modifyFundForm(apiParams);
  };

  /**
   * 提交数据
   *
   * 主要流程：
   * 1. 验证输入数据的有效性
   * 2. 根据当前状态选择提交方式（新增/修改）
   * 3. 调用相应的API接口
   *
   * @returns API响应结果
   * @throws {Error} 数据验证失败时抛出错误
   */
  const submitData = async () => {
    // 验证数据
    const validation = validateSubmitData();
    if (!validation.isValid) {
      throw new Error(validation.message || '数据验证失败');
    }

    // 根据状态类型提交不同的表单
    if (statusType.value === FundingStatusType.INITIAL) {
      return await submitAddForm();
    }

    return await submitModifyForm();
  };

  // ==================== 返回公共接口 ====================

  return {
    // 状态相关
    modifyAuth,
    statusType,
    readonly,
    arrow,
    cffId,
    year,
    month,
    loading,

    // 数据相关
    detailObj,
    inputObj,
    historyList,

    // 方法相关
    changeArrow,
    onInputChange,
    getHistory,
    getDetail,
    submitData,
  };
};
