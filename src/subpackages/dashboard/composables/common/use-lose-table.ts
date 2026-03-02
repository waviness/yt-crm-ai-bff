import type { CommonFilterParams, LoseTotalData, LoseTableData } from '../../types';
export function useLoseTable(salesTabValue: Ref<number>, filterParams: CommonFilterParams) {
  const {
    formatTenThousand, // 格式化为万元，且加千分位
    formatRaw,
  } = useFormatter();
  let totalObj = reactive(<LoseTotalData>{
    thirtyDaysAmount1st: 0,
    thirtyDaysAmount2nd: 0,
    thirtyDaysAmount3rd: 0,
  });

  let dataList = ref<LoseTableData[]>([]);
  // 封装通用的数据获取函数
  const fetchLostData = async (apiCall: Function, params: any) => {
    try {
      const res = await apiCall(params);
      if (+res.code === 200 && res.data) {
        totalObj.thirtyDaysAmount1st = formatTenThousand(
          res.data.thirtyDaysAmount1st || res.data.recent30SalesAmount,
          {
            digits: 0,
          }
        );
        totalObj.thirtyDaysAmount2nd = formatTenThousand(
          res.data.thirtyDaysAmount2nd || res.data.recent31To60SalesAmount,
          {
            digits: 0,
          }
        );
        totalObj.thirtyDaysAmount3rd = formatTenThousand(
          res.data.thirtyDaysAmount3rd || res.data.recent61To90SalesAmount,
          {
            digits: 0,
          }
        );
      } else {
        totalObj.thirtyDaysAmount1st = 0;
        totalObj.thirtyDaysAmount2nd = 0;
        totalObj.thirtyDaysAmount3rd = 0;
      }
      return res;
    } catch (error) {
      totalObj.thirtyDaysAmount1st = 0;
      totalObj.thirtyDaysAmount2nd = 0;
      totalObj.thirtyDaysAmount3rd = 0;
      throw error;
    }
  };
  // 封装通用的详情数据获取函数
  const fetchLostDetailData = async (apiCall: Function, params: any) => {
    filterParams.loading = true;
    try {
      const res = await apiCall(params);
      filterParams.loading = false;

      if (+res.code === 200 && res.data) {
        filterParams.total = res.data.total;
        dataList.value = res.data.list.map((element: any) => ({
          id: element.lostId || element.customerId || element.goodsId,
          name: element.lostName || element.customerName || element.goodsName,
          count1st:
            salesTabValue.value === 1
              ? formatTenThousand(element.thirtyDaysAmount1st || element.recent30SalesAmount, {
                  digits: 0,
                })
              : formatRaw(element.thirtyDaysAmount1st || element.recent30SalesAmount, {
                  digits: 0,
                }),
          count2nd:
            salesTabValue.value === 1
              ? formatTenThousand(element.thirtyDaysAmount2nd || element.recent31To60SalesAmount, {
                  digits: 0,
                })
              : formatRaw(element.thirtyDaysAmount2nd || element.recent31To60SalesAmount, {
                  digits: 0,
                }),
          count3rd:
            salesTabValue.value === 1
              ? formatTenThousand(element.thirtyDaysAmount3rd || element.recent61To90SalesAmount, {
                  digits: 0,
                })
              : formatRaw(element.thirtyDaysAmount3rd || element.recent61To90SalesAmount, {
                  digits: 0,
                }),
          time: element.lastSaleTime,
        }));
      } else {
        filterParams.total = 0;
      }
      return res;
    } catch (error) {
      filterParams.loading = false;
      filterParams.total = 0;
      throw error;
    }
  };
  return {
    totalObj,
    dataList,
    fetchLostData,
    fetchLostDetailData,
  };
}
