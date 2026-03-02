/**
 * 微信锁控详情 Composable
 * 提供锁控详情和处理意见详情的逻辑
 */

// 锁控类型映射
const conTypeList = [
  '缺货',
  '区域限销',
  '价格限销',
  '下限锁',
  '两票制提醒',
  '紧俏药品',
  '禁限销',
  '库存状态',
  '近效期',
];

/**
 * 锁控详情 Composable
 */
export function useWxLockDetail(taskid: Ref<string>) {
  const detailObj = ref<any>({});
  const loading = ref(false);

  /**
   * 获取锁控详情
   */
  const getDetail = async () => {
    if (!taskid.value) return;

    loading.value = true;
    try {
      const res = await WxLockService.getLockDtl({ taskid: taskid.value });
      detailObj.value = res;
    } catch (error) {
      console.error('获取锁控详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 跳转到处理意见详情
   */
  const toHandleDetail = () => {
    if (detailObj.value.recordid) {
      router.push(RouteMap.wxLockHandleDetail, { recordid: detailObj.value.recordid });
    }
  };

  /**
   * 获取到货状态文本
   */
  const getStockTypeText = (stockType: number) => {
    const map: Record<number, string> = {
      0: '未到货',
      1: '已到货',
      '-1': '作废',
    };
    return map[stockType] || '';
  };

  /**
   * 获取发送状态文本
   */
  const getAccessTypeText = (accessType: number) => {
    const map: Record<number, string> = {
      0: '未发送',
      1: '已发送',
    };
    return map[accessType] || '';
  };

  /**
   * 获取激活状态文本
   */
  const getActivateText = (activate: number) => {
    const map: Record<number, string> = {
      0: '未激活',
      1: '已激活',
    };
    return map[activate] || '';
  };

  return {
    detailObj,
    loading,
    conTypeList,
    getDetail,
    toHandleDetail,
    getStockTypeText,
    getAccessTypeText,
    getActivateText,
  };
}

/**
 * 处理意见详情 Composable
 */
export function useWxLockHandleDetail(recordid: Ref<string>) {
  const detailObj = ref<any>({});
  const loading = ref(false);

  /**
   * 根据状态获取状态名称
   */
  const getNameByStatus = (status: number) => {
    const statusList = [
      { id: 0, name: '缺货未处理' },
      { id: 3, name: '缺货已处理' },
      { id: 1, name: '已到货' },
      { id: 4, name: '货品超期' },
      { id: -2, name: '未审核' },
      { id: -1, name: '审核未通过' },
      { id: 2, name: '审核已通过' },
    ];
    return statusList.find(({ id }) => id === status)?.name || '';
  };

  /**
   * 获取发送标记文本
   */
  const getSendFlagText = (sendflag: number) => {
    const map: Record<number, string> = {
      0: '未发送',
      1: '已发送',
    };
    return map[sendflag] || '';
  };

  /**
   * 获取处理意见详情
   */
  const getDetail = async () => {
    if (!recordid.value) return;

    loading.value = true;
    try {
      const res = await WxLockService.getLockRecord({ recordid: recordid.value });
      detailObj.value = res;
    } catch (error) {
      console.error('获取处理意见详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 返回详情页
   */
  const goBack = () => {
    router.back();
  };

  /**
   * 获取数量标签文本
   */
  const getQtyLabel = (conType: number) => {
    if (conType === 0) return '预计到货数量';
    if (conType === 4) return '预计到票数量';
    return '解锁数量';
  };

  return {
    detailObj,
    loading,
    getDetail,
    getNameByStatus,
    getSendFlagText,
    goBack,
    getQtyLabel,
  };
}
