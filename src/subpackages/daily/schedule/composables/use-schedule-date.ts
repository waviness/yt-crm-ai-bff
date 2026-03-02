/**
 * 日程日期管理 Composable
 * 处理日期计算、周数据等
 */
import time from '@/utils/time';

export function useScheduleDate() {
  const nowClickDay = ref(new Date());
  const nowOrClickWeek = ref('周五');
  const nowdateList = ref<string[]>([]);
  const dateRange = ref<Date[]>([]);
  const chooseDate = ref<string[]>([]);

  const weeekList = ['一', '二', '三', '四', '五', '六', '日'];
  const weekArray = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

  /**
   * 获取日期标题
   */
  const dateTitle = computed(() => {
    const month = nowClickDay.value.getMonth() + 1;
    const day = nowClickDay.value.getDate();
    return `${nowOrClickWeek.value},${month}月${day}日`;
  });

  /**
   * 是否是今天
   */
  const isToday = computed(() => {
    const today = new Date().toLocaleDateString();
    const current = nowClickDay.value.toLocaleDateString();
    return today === current;
  });

  /**
   * 初始化日期（改变时间后初始化）
   */
  const initDay = (day: Date) => {
    nowClickDay.value = day;
    nowOrClickWeek.value = weekArray[day.getDay()];

    // 获取本周的周一和周日
    // 注意：业务逻辑是周日算作一周的结束，不是开始
    let monday: Date;
    let sunday: Date;

    const dayOfWeek = day.getDay();

    if (dayOfWeek === 0) {
      // 如果今天是周日，周一是上周一，周日就是今天
      monday = time.add(day, -6, 'day');
      sunday = new Date(day);
    } else {
      // 否则计算本周的周一和周日
      const daysToMonday = dayOfWeek - 1;
      monday = time.add(day, -daysToMonday, 'day');
      const daysToSunday = 7 - dayOfWeek;
      sunday = time.add(day, daysToSunday, 'day');
    }

    // 获取一周的所有日期
    nowdateList.value = time.getAllDate(monday, sunday);
    dateRange.value = [monday, sunday];
    chooseDate.value = [time.format(day, time.FORMATS.ISO_DATE)];
  };

  /**
   * 点击日期
   */
  const chooseDay = (day: string) => {
    initDay(new Date(day));
  };

  /**
   * 获取日期的样式类
   */
  const getDayClass = (date: string) => {
    const dateStr = date.replace(/-/g, '/');
    const date1 = Date.parse(dateStr);
    const nowDate = new Date().toLocaleDateString();
    const date2 = Date.parse(nowDate);
    const choose = chooseDate.value[0].replace(/-/g, '/');
    const date3 = Date.parse(choose);

    if (date3 === date1) {
      return 'day-text-choose';
    }
    if (date2 > date1) {
      return 'day-text-before';
    } else if (date2 === date1) {
      return 'day-text-today';
    } else {
      return '';
    }
  };

  return {
    nowClickDay,
    nowOrClickWeek,
    nowdateList,
    dateRange,
    chooseDate,
    dateTitle,
    isToday,
    weeekList,
    initDay,
    chooseDay,
    getDayClass,
  };
}
