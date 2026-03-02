import type { SalesReturnDetail, PriceOption } from '../types';

export function useSalesReturnDetail() {
  const appStore = useAppStore();

  // 订单类型 1-未处理 2-已处理
  const saleReturnType = ref<number>(1);
  // 详情数据
  const detailData = ref<SalesReturnDetail | null>(null);
  // 价格选项列表
  const priceList = ref<PriceOption[]>([]);
  // 选中的价格
  const selectedPrice = ref<PriceOption | null>(null);

  // 获取详情数据
  const fetchDetail = async (params: { redocId: string; status: number }) => {
    saleReturnType.value = params.status;

    const res = await SalesReturnService.querySaleReturnDetail({
      redocId: params.redocId,
      status: params.status,
    });

    detailData.value = res;

    // 构建价格列表
    priceList.value = [];
    if (res.rgunitPrice) {
      priceList.value.push({
        label: '收货单价',
        type: 1,
        value: res.rgunitPrice,
      });
    }
    if (res.oldunitPrice) {
      priceList.value.push({
        label: '销售原单单价',
        type: 2,
        value: res.oldunitPrice,
      });
    }
    if (res.aftdicPrc) {
      priceList.value.push({
        label: '销售单折后单价',
        type: 3,
        value: res.aftdicPrc,
      });
    }
  };

  // 选择价格
  const handlePriceSelect = (item: PriceOption) => {
    // 如果点击已选中的项，则取消选中
    if (selectedPrice.value?.type === item.type) {
      selectedPrice.value = null;
    } else {
      selectedPrice.value = { ...item };
    }
  };

  // 确认点单
  const handleConfirmOrder = async (identityObj: any) => {
    if (!selectedPrice.value) {
      showError('请选择价格');
      return;
    }

    // 价格校验逻辑
    let warningContent = '';
    if (detailData.value?.aftdicPrc) {
      if (
        selectedPrice.value.type === 1 &&
        detailData.value.aftdicPrc < detailData.value.rgunitPrice!
      ) {
        warningContent = '当前所选价格大于销售单折后单价 是否继续？';
      }
      if (
        selectedPrice.value.type === 2 &&
        detailData.value.aftdicPrc < detailData.value.oldunitPrice!
      ) {
        warningContent = '当前所选价格大于销售单折后单价 是否继续？';
      }
    }

    // 如果有警告，先确认
    if (warningContent) {
      showModal({
        title: '提示',
        content: warningContent,
        confirmText: '继续',
        confirmColor: '#2271F5',
        success: res => {
          if (res.confirm) {
            confirmSubmit(identityObj);
          }
        },
      });
    } else {
      confirmSubmit(identityObj);
    }
  };

  // 最终提交确认
  const confirmSubmit = (identityObj: any) => {
    showModal({
      title: '',
      content: `是否确定以选择的价格 对已选择的进行销退点单操作\n\n${selectedPrice.value?.label}: ${selectedPrice.value?.value}`,
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: res => {
        if (res.confirm) {
          submitOrder(identityObj);
        }
      },
    });
  };

  // 提交订单
  const submitOrder = async (identityObj: any) => {
    if (!detailData.value || !selectedPrice.value) return;

    const res = await SalesReturnService.submitSaleReturn({
      deptId: identityObj.deptId,
      entryId: detailData.value.entryId,
      pm4Id: identityObj.userId,
      price: selectedPrice.value.value,
      priceType: selectedPrice.value.type,
      redocId: detailData.value.redocId,
    });

    if (+res.code === 200) {
      showSuccess(res.msg || '提交成功');
      appStore.setHadDoneOnDetail(true);
      router.back();
    } else {
      showError(res.msg || '提交失败');
    }
  };

  return {
    saleReturnType,
    detailData,
    priceList,
    selectedPrice,
    fetchDetail,
    handlePriceSelect,
    handleConfirmOrder,
  };
}
