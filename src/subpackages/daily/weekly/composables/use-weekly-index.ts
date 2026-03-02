/**
 * 周报首页 Composable
 * 按页面轻复用原则，仅用于 index.vue
 */
export function useWeeklyIndex(userId: string, weeklyReportObj: Ref<any>) {
  // 日期和周数相关
  const weekNumber = ref(0);
  const weekString = ref('');
  const weekChangeString = ref('');
  const startTime = ref('');
  const endTime = ref('');
  const dateRange = ref<Date[]>([]);

  // 汇报领导相关
  const leaderList = ref<any[]>([]);
  const submitLeaderId = ref<string[]>([]);
  const submitLeaderName = ref('');
  const leaderShow = ref(false);

  // 标签选择相关
  const selectLabelFlag = ref(false);
  const selectLabelAll = ref(false);

  /**
   * 计算周数（基于上周六计算，即该周的开始日期）
   * @param startDateStr 开始日期字符串（ISO格式）
   */
  const calculateWeekNumber = (startDateStr: string) => {
    const startDate = new Date(startDateStr);
    const yearChange = startDate.getFullYear();
    const allSaturdays = time.getWeekdaysInYear(yearChange, 6, time.FORMATS.ISO_DATE) as string[];
    const yearNow = new Date().getFullYear();
    const nowFriday = time.getWeekdayOfWeek(new Date(), 5);
    const nowLastSaturday = time.add(nowFriday, -6, 'day');

    let weekChangeStringVal = '';
    let weekStringVal = '';
    let weekNumberVal = 0;

    allSaturdays.forEach((item: string, index: number) => {
      if (item === startDateStr) {
        weekChangeStringVal = `${yearChange}第${index + 1}周`;
        weekNumberVal = index + 1;
      }
      if (item === time.format(nowLastSaturday, time.FORMATS.ISO_DATE)) {
        weekStringVal = `${yearNow}第${index + 1}周`;
      }
    });

    weekChangeString.value = weekChangeStringVal;
    weekString.value = weekStringVal;
    weekNumber.value = weekNumberVal;
  };

  /**
   * 设置日期范围并计算周数
   * @param startDateStr 开始日期字符串（ISO格式）
   * @param endDateStr 结束日期字符串（ISO格式）
   * @param onInitComplete 初始化完成后的回调
   */
  const setWeekDateRange = (
    startDateStr: string,
    endDateStr: string,
    onInitComplete?: () => void
  ) => {
    startTime.value = startDateStr;
    endTime.value = endDateStr;
    dateRange.value = [new Date(startDateStr), new Date(endDateStr)];
    calculateWeekNumber(startDateStr);
    onInitComplete?.();
  };

  /**
   * 初始化周报日期和周数
   * @param day 指定日期（点击的日期，会自动计算整周：上周六到这周五）
   * @param onInitComplete 初始化完成后的回调
   */
  const initWeekDate = (day: Date, onInitComplete?: () => void) => {
    // 获取指定日期所在周的周五
    const selectedFriday = time.getWeekdayOfWeek(day, 5);
    // 获取指定日期所在周的上周六（周五往前推6天）
    const selectedLastSaturday = time.add(selectedFriday, -6, 'day');

    const startDateStr = time.format(selectedLastSaturday, time.FORMATS.ISO_DATE);
    const endDateStr = time.format(selectedFriday, time.FORMATS.ISO_DATE);

    setWeekDateRange(startDateStr, endDateStr, onInitComplete);
  };

  /**
   * 获取汇报领导列表
   */
  const getLeader = async () => {
    leaderList.value = [];
    const params = { userId };

    const res = await WeeklyService.getLeader(params);
    submitLeaderId.value = [];
    submitLeaderName.value = '';

    for (let index = 0; index < res.length; index++) {
      const element = res[index];
      if (element.leaderId) {
        leaderList.value.push({
          id: element.leaderId,
          name: element.leaderName,
        });
      }
    }

    if (leaderList.value.length === 1) {
      submitLeaderId.value = [leaderList.value[0].id];
      submitLeaderName.value = leaderList.value[0].name;
    }
  };

  /**
   * 汇报对象选择
   */
  const leaderSelect = (item: any) => {
    submitLeaderName.value = '';
    for (let index = 0; index < item.length; index++) {
      const element = item[index];
      const leader = leaderList.value.find((val: any) => +val.id === +element);
      if (leader) {
        submitLeaderName.value += leader.name + ' ';
      }
    }
  };

  /**
   * 重置汇报领导选择
   */
  const resetLeaderSelect = () => {
    submitLeaderId.value = [];
    submitLeaderName.value = '';
  };

  /**
   * 切换标签选择模式
   */
  const toggleSelectLabel = () => {
    selectLabelFlag.value = !selectLabelFlag.value;

    if (!selectLabelFlag.value) {
      // 取消选择时，清空所有选中状态
      weeklyReportObj.value.resultList?.forEach((val: any) => {
        val.childList?.forEach((item: any) => {
          if (item.reportDtoList?.length > 0) {
            item.reportDtoList.forEach((report: any) => {
              report.checked = false;
            });
          }
        });
      });
    }
  };

  /**
   * 检查是否全部选中
   */
  const checkSelectAll = () => {
    let totalCount = 0;
    let checkedCount = 0;

    weeklyReportObj.value.resultList?.forEach((val: any) => {
      val.childList?.forEach((item: any) => {
        if (item.reportDtoList?.length > 0) {
          item.reportDtoList.forEach((report: any) => {
            totalCount++;
            if (report.checked) {
              checkedCount++;
            }
          });
        }
      });
    });

    selectLabelAll.value = totalCount > 0 && checkedCount === totalCount;
  };

  /**
   * 全选/取消全选标签
   */
  const toggleSelectAll = () => {
    selectLabelAll.value = !selectLabelAll.value;

    weeklyReportObj.value.resultList?.forEach((val: any) => {
      val.childList?.forEach((item: any) => {
        if (item.reportDtoList?.length > 0) {
          item.reportDtoList.forEach((report: any) => {
            report.checked = selectLabelAll.value;
          });
        }
      });
    });
  };

  /**
   * 重置标签选择状态
   */
  const resetLabelSelect = () => {
    selectLabelFlag.value = false;
    selectLabelAll.value = false;
  };

  return {
    // 日期和周数
    weekNumber,
    weekString,
    weekChangeString,
    startTime,
    endTime,
    dateRange,
    initWeekDate,
    setWeekDateRange,
    // 汇报领导
    leaderList,
    submitLeaderId,
    submitLeaderName,
    leaderShow,
    getLeader,
    leaderSelect,
    resetLeaderSelect,
    // 标签选择
    selectLabelFlag,
    selectLabelAll,
    toggleSelectLabel,
    toggleSelectAll,
    checkSelectAll,
    resetLabelSelect,
  };
}
