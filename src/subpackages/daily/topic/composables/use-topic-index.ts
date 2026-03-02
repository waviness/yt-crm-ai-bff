/**
 * 话题广场首页 Composable
 * 按页面轻复用原则，仅用于 index.vue
 */
export function useTopicIndex() {
  // 日期范围
  const startTime = ref('');
  const endTime = ref('');
  const dateRange = ref<Date[]>([]);

  // 话题数据
  const topicList = ref<any[]>([]);
  const todayList = ref<any[]>([]);
  const topicMessage = ref('');

  /**
   * 初始化日期范围（默认最近30天）
   */
  const initDateRange = () => {
    const end = new Date();
    const start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);

    dateRange.value = [start, end];
    startTime.value = time.format(start, time.FORMATS.ISO_DATE);
    endTime.value = time.format(end, time.FORMATS.ISO_DATE);
  };

  /**
   * 设置日期范围
   */
  const setDateRange = (start: Date, end: Date) => {
    dateRange.value = [start, end];
    startTime.value = time.format(start, time.FORMATS.ISO_DATE);
    endTime.value = time.format(end, time.FORMATS.ISO_DATE);
  };

  /**
   * 获取话题统计信息
   */
  const getTopicNum = async (params?: any) => {
    const requestParams = params || {
      startTime: `${startTime.value} 00:00:00`,
      endTime: `${endTime.value} 23:59:59`,
    };

    try {
      const res = await TopicService.getTopicNum(requestParams);

      topicMessage.value = '';

      if (params) {
        // 获取今日数据
        todayList.value = res.filter((val: any) => val.labelList.length > 0);
        const allLabels: any[] = [];
        todayList.value.forEach((val: any) => {
          allLabels.push(...val.labelList);
        });
        todayList.value = allLabels;
      } else {
        // 获取全部数据并合并今日统计
        let midTopicList = res.filter((val: any) => val.labelList.length > 0);

        for (let index = 0; index < todayList.value.length; index++) {
          const element = todayList.value[index];
          midTopicList.forEach((val: any) => {
            val.labelList.forEach((item: any) => {
              if (item.LABEL_ID === element.LABEL_ID) {
                item.todayNum = element.topicSquareNum;
              }
            });
          });
        }

        topicList.value = midTopicList;
      }
    } catch (error: any) {
      if (error?.code === 'topicSquareErr400') {
        topicMessage.value = error?.msg || '暂无关注标签';
      }
      console.error('获取话题统计失败:', error);
    }
  };

  /**
   * 刷新话题数据
   */
  const refreshTopicData = async () => {
    // 先获取今日数据
    await getTopicNum({
      startTime: `${time.format(new Date(), time.FORMATS.ISO_DATE)} 00:00:00`,
      endTime: `${time.format(new Date(), time.FORMATS.ISO_DATE)} 23:59:59`,
      full: true,
    });

    // 再获取全部数据
    await getTopicNum();
  };

  return {
    startTime,
    endTime,
    dateRange,
    topicList,
    todayList,
    topicMessage,
    initDateRange,
    setDateRange,
    getTopicNum,
    refreshTopicData,
  };
}
