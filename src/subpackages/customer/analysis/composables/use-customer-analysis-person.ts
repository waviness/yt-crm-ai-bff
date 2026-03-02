import type { PersonInfo, EventCount } from '../types';

export function useCustomerAnalysisPerson(custId: string, isCabin: boolean, personData: string) {
  // 当前人员信息
  const curMan = ref<PersonInfo>({} as PersonInfo);

  // 客情统计
  const eventCount = ref<EventCount>({} as EventCount);

  // 热力值选项
  const warmthNumOptions = ['', '一般客情', '需进阶客情', '未接触客情'];

  // 热力值样式
  const warmthClass = computed(() => {
    const colors = ['', 'color-success', 'color-warning', 'color-danger'];
    return colors[curMan.value.warmthNum || 0] || 'color-gray-5';
  });

  // 获取人员详情
  const getPersonInfo = async () => {
    try {
      const res = await CustomerService.queryPersonDetail({
        custId,
        cueId: curMan.value.cueId,
      });

      curMan.value = { ...curMan.value, ...res };
    } catch (error) {
      console.error('获取人员详情失败:', error);
    }
  };

  // 获取客情统计数据
  const getEventCount = async () => {
    try {
      const params = {
        custId,
        userId: curMan.value.saleId,
        personId: curMan.value.userId,
      };

      const res = isCabin
        ? await CustomerService.cockpitQueryCustEventCount(params)
        : await CustomerService.queryCustEventCount(params);

      eventCount.value = res;
    } catch (error) {
      console.error('获取客情统计失败:', error);
    }
  };

  // 跳转到事件列表
  const toList = () => {
    router.push('/subpackages/customer/analysis/list', {
      curMan: JSON.stringify(curMan.value),
      custId,
      isCabin,
    });
  };

  // 返回
  const goBack = () => {
    router.back();
  };

  // 初始化
  const init = async () => {
    try {
      curMan.value = JSON.parse(personData);
    } catch {
      curMan.value = personData as any;
    }

    await getPersonInfo();
    await getEventCount();
  };

  return {
    curMan,
    eventCount,
    warmthNumOptions,
    warmthClass,
    toList,
    goBack,
    init,
  };
}
