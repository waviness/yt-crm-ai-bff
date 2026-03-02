import { useCommon } from './use-vbp-project-common';
import type { GoodsItem } from './use-vbp-project-goods';
import type { TabsItem } from '@/types/common';

/**
 * 项目列表页面业务逻辑
 */
export function useVbpProjectList() {
  // 公共逻辑
  const { buildBaseParams, formatDate } = useCommon();

  // 状态管理
  const firstFlag = ref(true);
  const current = ref(0);
  const taskDot = ref(false);
  const vbpDot = ref(false);
  const list = ref<GoodsItem[]>([]);

  // 类型列表（使用 computed 确保徽标动态更新）
  const typeList = computed<TabsItem[]>(() => [
    {
      name: '拜访任务',
      badge: {
        isDot: taskDot.value,
      },
    },
    {
      name: 'VBP品种信息填报',
      badge: {
        isDot: vbpDot.value,
      },
    },
  ]);

  // 获取数据列表
  const getDataList = async () => {
    const params = buildBaseParams('', 1);
    const res = await VbpService.queryVisitGoodsList({
      ...params,
      type: current.value + 1,
    });

    taskDot.value = res.flag1;
    vbpDot.value = res.flag2;
    list.value = res.goodsVOS || [];
    list.value.forEach((item: GoodsItem) => {
      item.creDate = item.creDate ? formatDate(item.creDate) : '';
      item.modifyDate = item.modifyDate ? formatDate(item.modifyDate) : '';
    });
  };

  // 切换标签
  const handleActiveChange = async ({ index }: { index: number }) => {
    current.value = index;
    list.value = [];
    await getDataList();
  };

  // 跳转详情
  const toDetail = (item: GoodsItem) => {
    const appStore = useAppStore();
    appStore.setHadDoneOnDetail(false);

    // 根据当前标签页决定跳转页面
    router.push(current.value === 0 ? RouteMap.vbpProjectFill : RouteMap.vbpProjectDetail, {
      goodsName: item.goodsName,
    });
  };

  // 初始化
  const init = async () => {
    list.value = [];
    await getDataList();

    // 首次进入且有VBP待填报，提示用户
    if (vbpDot.value && firstFlag.value) {
      firstFlag.value = false;
      showModal({
        content: '有VBP品种信息填报待填写',
        confirmText: '前往',
        success: res => {
          if (res.confirm) {
            current.value = 1;
            list.value = [];
            getDataList();
          } else {
            current.value = 0;
          }
        },
      });
    }
  };

  // 页面显示时刷新
  const onPageShow = async () => {
    const appStore = useAppStore();
    if (appStore.hadDoneOnDetail) {
      console.log('appStore.hadDoneOnDetail', appStore.hadDoneOnDetail);
      await getDataList();
    }
  };

  return {
    // 状态
    current,
    taskDot,
    vbpDot,
    list,
    typeList,

    // 方法
    getDataList,
    handleActiveChange,
    toDetail,
    init,
    onPageShow,
    formatDate,
  };
}
