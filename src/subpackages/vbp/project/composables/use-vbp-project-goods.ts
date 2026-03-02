// 基础商品信息
export interface GoodsItem {
  goodsName: string;
  factoryName: string;
  goodsType: string;
  yearTarget?: string;
  startDate?: string;
  isUse?: number;
  finishStatus?: boolean;
  reportId?: string;
  seqGoodsId?: string;
  hgId?: string;
  creDate?: string;
  modifyDate?: string;
  isFinish: boolean;
  bidGoodsName?: string;
  bidGoods?: number;
  goodsPolicyName?: string;
  goodsPolicy?: number;
  complete: string;
  visitUseStatus?: boolean;
  svDtlId?: string;
}

// 商品添加表单数据
export interface FormData {
  goodsName: string;
  factory: string;
  goodsType: string;
}

/**
 * 商品相关业务逻辑（选择 + 添加）
 */
export function useVbpProjectGoods() {
  // 表单验证
  const validateString = (value: string, message: string) => {
    if (!value?.trim()) {
      showToast(message);
      return false;
    }
    return true;
  };

  // 商品选择相关状态
  const show = ref(true);
  const searchValue = ref('');
  const list = ref<GoodsItem[]>([]);
  const curIndex = ref(-1);
  const curItem = ref<GoodsItem>({} as GoodsItem);
  let initGoodsName = ''; // 保存初始品种名称

  // 商品添加相关状态
  const addGoodsShow = ref(false);
  const loading = ref(false);
  const formData = ref<FormData>({
    goodsName: '',
    factory: '',
    goodsType: '',
  });

  // ========== 商品选择相关方法 ==========

  // 获取商品列表
  const getDataList = async (goodsName: string) => {
    const res = await VbpService.queryUnVBPGoods({
      goodsName,
      search: searchValue.value,
    });
    list.value = res || [];
  };

  // 搜索处理
  const onSearch = (value: string, goodsName: string) => {
    searchValue.value = value;
    getDataList(goodsName);
  };

  // 选择商品
  const onItemClick = (item: GoodsItem, idx: number) => {
    curIndex.value = idx;
    curItem.value = item;
  };

  // 确认选择
  const onConfirm = (emit: any) => {
    if (curIndex.value === -1) {
      showToast('请选择商品');
      return;
    }
    emit('confirm', curItem.value);
  };

  // 关闭弹窗
  const onClose = (emit: any) => {
    emit('close');
  };

  // ========== 商品添加相关方法 ==========

  // 显示添加商品弹窗
  const showAddGoods = () => {
    addGoodsShow.value = true;
  };

  // 关闭添加商品弹窗
  const closeAddGoods = () => {
    addGoodsShow.value = false;
  };

  // 添加商品
  const addGoods = async (emit: any) => {
    if (!validateString(formData.value.goodsName, '请输入品种名称')) return;
    if (!validateString(formData.value.factory, '请输入厂家信息')) return;
    if (!validateString(formData.value.goodsType, '请输入规格信息')) return;

    loading.value = true;
    await VbpService.addUnVBPGoods(formData.value);
    showSuccess('添加成功');
    addGoodsShow.value = false;
    loading.value = false;
    emit('confirm');
  };

  // 添加商品成功回调
  const onAddGoodsSuccess = (goodsName?: string) => {
    addGoodsShow.value = false;
    // 使用添加的商品名称或搜索值来刷新列表
    const searchName = goodsName || searchValue.value || initGoodsName;
    getDataList(searchName);
  };

  // ========== 初始化方法 ==========

  // 初始化
  const init = (goodsName: string) => {
    initGoodsName = goodsName;
    formData.value.goodsName = goodsName;
    getDataList(goodsName);
  };

  return {
    // 状态
    show,
    searchValue,
    list,
    curIndex,
    curItem,
    addGoodsShow,
    loading,
    formData,

    // 方法
    getDataList,
    onSearch,
    onItemClick,
    onConfirm,
    onClose,
    showAddGoods,
    closeAddGoods,
    addGoods,
    onAddGoodsSuccess,
    init,
  };
}
