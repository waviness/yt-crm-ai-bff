import { useCommon } from './use-vbp-project-common';
import type { GoodsItem } from './use-vbp-project-goods';

/**
 * 项目详情页面业务逻辑
 */
export function useVbpProjectDetail() {
  // 表单验证
  const validateString = (value: string, message: string) => {
    if (!value?.trim()) {
      showToast(message);
      return false;
    }
    return true;
  };

  // 日历相关
  const calendarRef = ref();

  // 公共逻辑
  const { loading, showSuccessAndRefresh, buildBaseParams, formatDate } = useCommon();

  // 状态管理
  const goodsName = ref('');
  const selectedlist = ref<GoodsItem[]>([]);
  const notSelectedlist = ref<GoodsItem[]>([]);
  const curIndex = ref(-1);
  const deleteShow = ref(false);
  const curDeleteItem = ref<GoodsItem>({} as GoodsItem);
  const goodsShow = ref(false);

  // 获取数据列表
  const getDataList = async () => {
    const params = buildBaseParams(goodsName.value, 1);
    const params2 = buildBaseParams(goodsName.value, 0);

    const [res, res2] = await Promise.all([
      VbpService.queryVBPGoodsDetail(params),
      VbpService.queryVBPGoodsDetail(params2),
    ]);

    selectedlist.value = res || [];
    selectedlist.value.forEach((item: GoodsItem) => {
      item.startDate = formatDate(item.startDate || '');
    });
    notSelectedlist.value = res2 || [];
  };

  // 日期选择
  const handleClickDate = (item: any, idx: number) => {
    if (!item.finishStatus) {
      calendarRef.value?.open();
      curIndex.value = idx;
    }
  };

  const handleDateConfirm = (value: any) => {
    console.log(value);
    selectedlist.value[curIndex.value].startDate = value.fulldate;
    console.log(selectedlist.value[curIndex.value]);
  };

  // 提交中选品种
  const submit = async (idx: number) => {
    const item = selectedlist.value[idx];
    if (!(item.isUse === 0 || item.isUse === 1)) {
      showToast('请选择是否使用');
      return;
    }
    if (item.isUse === 1 && !item.startDate) {
      showToast('请选择起始日期');
      return;
    }
    if (item.isUse === 1 && !validateString(item.yearTarget || '', '请填写年签约量')) {
      return;
    }

    const { reportId, isUse, startDate, yearTarget } = item;
    await VbpService.addVBPGoodsDetail({
      reportId,
      isUse,
      startDate,
      yearTarget,
    });

    showSuccessAndRefresh('提交成功', () => getDataList());
  };

  // 新增非中选品种
  const addNotSelect = () => {
    notSelectedlist.value = [
      ...notSelectedlist.value,
      {
        goodsName: '',
        factoryName: '',
        goodsType: '',
        yearTarget: '',
        isFinish: false,
        complete: '',
      } as GoodsItem,
    ];
  };

  // 商品选择
  const handleClickGoods = (item: any, idx: number) => {
    if (!item.finishStatus) {
      goodsShow.value = true;
      curIndex.value = idx;
    }
  };

  const handleChooseGoods = (item: any) => {
    notSelectedlist.value[curIndex.value] = item;
    goodsShow.value = false;
  };

  // 提交非中选品种
  const submitNotSelect = async (idx: number) => {
    const item = notSelectedlist.value[idx];
    if (!validateString(item.goodsName || '', '请选择品种')) return;
    if (!validateString(item.yearTarget || '', '请填写计划量')) return;

    const { goodsName: name, factoryName, goodsType, seqGoodsId, yearTarget } = item;
    const appStore = useAppStore();

    await VbpService.addUnVBPGoodsDetail({
      customId: appStore.detailObj.customId,
      entryId: appStore.salerInfor.entryId,
      salerId: appStore.salerInfor.userId,
      goodsName: name,
      factoryName,
      goodsType,
      seqGoodsId,
      yearTarget,
    });

    showSuccessAndRefresh('提交成功', () => getDataList());
  };

  // 删除非中选品种
  const deleteNotSelect = (item: GoodsItem) => {
    curDeleteItem.value = item;
    deleteShow.value = true;
  };

  const handleDeleteConfirm = async () => {
    await VbpService.deleteUnVBPGoodsDetail({
      hgId: curDeleteItem.value.hgId,
    });
    deleteShow.value = false;
    showSuccessAndRefresh('删除成功', () => getDataList());
  };

  // 初始化
  const init = (opts: any) => {
    goodsName.value = opts?.goodsName || '';
    getDataList();
  };

  return {
    // 状态
    loading,
    goodsName,
    selectedlist,
    notSelectedlist,
    curIndex,
    deleteShow,
    curDeleteItem,
    goodsShow,
    calendarRef,

    // 方法
    getDataList,
    handleClickDate,
    handleDateConfirm,
    submit,
    addNotSelect,
    handleClickGoods,
    handleChooseGoods,
    submitNotSelect,
    deleteNotSelect,
    handleDeleteConfirm,
    init,
  };
}
