/**
 * 将 API 原始数据转换为销售概览数据
 * @param rawData API 原始数据
 * @returns 转换后的 SalesData 对象
 */
import type {
  QuickOverviewApiRawData,
  QuickOverviewSalesData,
  QuickOverviewDepartmentTabItem,
} from '../types';
const {
  formatTenThousand, // 格式化为万元，且加千分位
  formatPercentage,
  formatCurrency,
} = useFormatter();
export const transformToSalesData = (
  rawData: QuickOverviewApiRawData,
  showPlusSign: boolean = true
): QuickOverviewSalesData => {
  return {
    cdmoney: formatTenThousand(rawData.currentDayMoney),
    cmcircleOnPercent: formatPercentage(rawData.cmcircleOnPercent),
    cmmoney: formatTenThousand(rawData.currentMonthMoney, { digits: 0 }),
    cmonPercent: formatPercentage(rawData.currentMonthOnPercent),
    cmperiodIncrease: formatTenThousand(rawData.currentMonthPeriodIncrease),
    cymoney: formatTenThousand(rawData.currentYearMoney, { digits: 0 }),
    cyonPercent: formatPercentage(rawData.currentYearOnPercent),
    cyperiodIncrease: formatTenThousand(rawData.currentYearPeriodIncrease),
    imptCustomerYearOnPercent: formatPercentage(rawData.imptCustomerYearOnPercent, {
      digits: Math.abs(rawData.imptCustomerYearOnPercent) < 0.001 ? 2 : 1,
      showPlusSign,
      showPercentage: false,
    }),
    imptGoodsYearOnPercent: formatPercentage(rawData.imptGoodsYearOnPercent, {
      digits: Math.abs(rawData.imptGoodsYearOnPercent) < 0.001 ? 2 : 1,
      showPlusSign,
      showPercentage: false,
    }),
    overdueAmount: formatCurrency(rawData.overdueAmount),
    receivable: formatCurrency(rawData.receivable),
    thisReceivable: formatCurrency(rawData.thisReceivable),
    longAccounts: formatCurrency(rawData.longAccounts),
    ndyy: formatTenThousand(rawData.revenueTargetAmount),
  };
};

/**
 * 将 API 原始数据转换为部门标签项的扩展数据（用于 ywInit）
 * @param rawData API 原始数据
 * @param arithmetic 实例，用于计算
 * @returns 部分部门标签项数据
 */
export const transformToDepartmentTabData = (
  rawData: QuickOverviewApiRawData,
  arithmetic: any
): Partial<QuickOverviewDepartmentTabItem> => {
  const salesData = transformToSalesData(rawData);
  return {
    targetCompletePercent: rawData.revenueTargetAmount
      ? formatPercentage(
          arithmetic.divide(rawData.currentYearMoney, rawData.revenueTargetAmount),
          { showPercentage: false, showPlusSign: false } // 只设置是否显示百分比，其他参数使用默认值
        )
      : '--',
    ...salesData,
  };
};
