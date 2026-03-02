/**
 * 日程首页 Composable
 * 按页面轻复用原则，仅用于 index.vue
 */
import { ref } from 'vue';
import { useScheduleDate } from './use-schedule-date';

export function useScheduleIndex(userId: any) {
  // 使用日期管理
  const {
    nowClickDay,
    nowdateList,
    dateRange,
    chooseDate,
    dateTitle,
    isToday,
    weeekList,
    initDay,
    chooseDay,
    getDayClass,
  } = useScheduleDate();

  // 状态
  const nowDetail = ref<any>({});
  const nowDetailList = ref<any[]>([]);

  const statusMap = {
    '0': '在岗办公',
    '1': '本地出差',
    '2': '外地出差',
    '3': '请假/调休',
  };

  /**
   * 获取状态圆点颜色
   */
  const getColor = (data: any, type: string) => {
    if (!data || !data[type] || (data[type].scheduleType !== 0 && !data[type].scheduleType)) {
      return '';
    }

    const colorMap: Record<number, string> = {
      0: '#00a870',
      1: '#0052d9',
      2: '#ed7b2f',
      3: '#e34d59',
    };

    const color = colorMap[data[type].scheduleType];
    return color ? `background: ${color}` : '';
  };

  /**
   * 获取日程列表
   */
  const getScheduleOfDateList = async () => {
    const params = {
      userId: userId.value,
      scheduleDateList: nowdateList.value,
    };

    let res: any[] = [];
    try {
      res = await ScheduleService.getScheduleOfDateList(params);
    } catch (error) {
      console.error('获取日程列表失败:', error);
    }

    nowDetailList.value = [];
    for (let i = 0; i < 7; i++) {
      const obj: any = {
        chooseDate: nowdateList.value[i],
        mor: '',
        morRemark: '',
        aft: '',
        aftRemark: '',
      };

      if (res && res.length > 0) {
        for (let index = 0; index < res.length; index++) {
          const element = res[index];
          if (element.scheduleDate.slice(0, 10) === nowdateList.value[i]) {
            if (element.timeSlot === 1) {
              obj.mor = element;
              obj.morRemark = element.remark && element.remark !== 'null' ? element.remark : '';
            } else if (element.timeSlot === 2) {
              obj.aft = element;
              obj.aftRemark = element.remark && element.remark !== 'null' ? element.remark : '';
            }
          }
        }
      }
      nowDetailList.value.push(obj);
    }

    // 设置当前选中日期的详情
    const dayIndex = nowClickDay.value.getDay() === 0 ? 6 : nowClickDay.value.getDay() - 1;
    nowDetail.value = nowDetailList.value[dayIndex];
  };

  /**
   * 监听日期变化，自动获取日程列表
   */
  watch(nowdateList, () => {
    getScheduleOfDateList();
  });

  return {
    nowClickDay,
    nowdateList,
    dateRange,
    chooseDate,
    dateTitle,
    isToday,
    weeekList,
    nowDetail,
    nowDetailList,
    statusMap,
    initDay,
    chooseDay,
    getDayClass,
    getColor,
    getScheduleOfDateList,
  };
}
