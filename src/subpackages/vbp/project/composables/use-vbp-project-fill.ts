import { useCommon } from './use-vbp-project-common';
import { GOODS_POLICY_OPTIONS } from '../../constants';
import type { GoodsItem } from './use-vbp-project-goods';
import type { OptionItem } from '@/types/common';

/**
 * 项目填报页面业务逻辑
 */
export function useVbpProjectFill() {
  // 表单验证
  const validateString = (value: string, message: string) => {
    if (!value?.trim()) {
      showToast(message);
      return false;
    }
    return true;
  };

  // 公共逻辑
  const { showSuccessAndRefresh, buildBaseParams } = useCommon();

  // 状态管理
  const goodsName = ref('');
  const selectedlist = ref<GoodsItem[]>([]);
  const notSelectedlist = ref<GoodsItem[]>([]);
  const finishShow = ref(false);
  const finishActions = ref<OptionItem[]>([
    { id: 1, name: '能完成' },
    { id: 2, name: '不能完成' },
  ]);
  const policyShow = ref(false);
  const policyActions = ref<OptionItem[]>([...GOODS_POLICY_OPTIONS]);
  const curIndex = ref(-1);

  // 获取数据列表
  const getDataList = async () => {
    const params = buildBaseParams(goodsName.value, 1);
    const params2 = buildBaseParams(goodsName.value, 0);

    const [res, res2] = await Promise.all([
      VbpService.queryVisitGoodsDetail(params),
      VbpService.queryVisitGoodsDetail(params2),
    ]);

    selectedlist.value = res || [];
    notSelectedlist.value = res2 || [];

    // 处理选项映射
    selectedlist.value.forEach((item: GoodsItem) => {
      item.bidGoodsName = item.bidGoods ? findNameById(item.bidGoods, finishActions.value) : '';
      item.goodsPolicyName = item.goodsPolicy
        ? findNameById(item.goodsPolicy, [...GOODS_POLICY_OPTIONS])
        : '';
    });
  };

  // 完成状态选择
  const handleClickFinish = (item: any, idx: number) => {
    if (!item.visitUseStatus) {
      finishShow.value = true;
      curIndex.value = idx;
    }
  };

  const handleFinishConfirm = (item: any) => {
    selectedlist.value[curIndex.value].bidGoods = item.id;
    selectedlist.value[curIndex.value].bidGoodsName = item.name;
    finishShow.value = false;
  };

  // 政策选择
  const handleClickPolicy = (item: any, idx: number) => {
    if (!item.visitUseStatus) {
      policyShow.value = true;
      curIndex.value = idx;
    }
  };

  const handlePolicyConfirm = (item: any) => {
    selectedlist.value[curIndex.value].goodsPolicy = item.id;
    selectedlist.value[curIndex.value].goodsPolicyName = item.name;
    policyShow.value = false;
  };

  // 提交中选品种
  const submit = async (idx: number) => {
    const item = selectedlist.value[idx];
    if (!(item.bidGoods === 1 || item.bidGoods === 2)) {
      showToast('请选择是否能完成');
      return;
    }
    if (!item.goodsPolicy) {
      showToast('请选择政策');
      return;
    }
    if (!item.complete) {
      showToast('请填写完成量');
      return;
    }
    const { svDtlId, bidGoods, goodsPolicy, complete } = item;
    await VbpService.addVisitGoodsDetail({
      svDtlId,
      bidGoods,
      goodsPolicy,
      complete,
    });

    showSuccessAndRefresh('提交成功', () => getDataList());
  };

  // 提交非中选品种
  const submitNotSelect = async (idx: number) => {
    const item = notSelectedlist.value[idx];
    if (!validateString(item.goodsName || '', '请选择品种')) return;
    if (!validateString(item.complete || '', '请填写完成量')) return;
    const { svDtlId, bidGoods, goodsPolicy, complete } = item;
    await VbpService.addVisitGoodsDetail({
      svDtlId,
      bidGoods,
      goodsPolicy,
      complete,
    });

    showSuccessAndRefresh('提交成功', () => getDataList());
  };

  // 初始化
  const init = (opts: any) => {
    goodsName.value = opts?.goodsName || '';
    getDataList();
  };

  return {
    // 状态
    goodsName,
    selectedlist,
    notSelectedlist,
    finishShow,
    finishActions,
    policyShow,
    policyActions,
    curIndex,

    // 方法
    getDataList,
    handleClickFinish,
    handleFinishConfirm,
    handleClickPolicy,
    handlePolicyConfirm,
    submit,
    submitNotSelect,
    init,
  };
}
