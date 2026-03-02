/**
 * 项目模块公共逻辑
 */
export function useCommon() {
  const appStore = useAppStore();

  // 通用状态
  const loading = ref(false);

  // 通用方法：显示成功提示并刷新数据
  const showSuccessAndRefresh = (message: string, refreshFn: () => Promise<void>) => {
    showSuccess(message);
    appStore.setHadDoneOnDetail(true);
    refreshFn();
  };

  // 通用方法：构建基础参数
  const buildBaseParams = (goodsName = '', type = 1) => ({
    customId: appStore.detailObj.customId,
    pm4Id: appStore.salerInfor.userId,
    goodsName,
    type,
  });

  // 通用方法：处理日期格式化
  const formatDate = (dateStr: string) => {
    return dateStr ? dateStr.split(' ')[0] : '';
  };

  return {
    // 状态
    loading,

    // 方法
    showSuccessAndRefresh,
    buildBaseParams,
    formatDate,
  };
}
