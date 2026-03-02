export function useFinalKnotDetail() {
  const appStore = useAppStore();
  const infoList = ref<any[]>([]);
  const fetchDtlList = async (params: any) => {
    const res = await FinalKnotService.getdtlList(params);
    console.log(res);
    infoList.value = res.data.list.map((element: any) => {
      return {
        confirmDate: element.confirmDate,
        customId: element.customId,
        customName: element.customName,
        customSalerId: element.customSalerId,
        customSalerUserId: element.customSalerUserId,
        onwayQty: element.onwayQty ? element.onwayQty : 0,
        remark: element.remark,
        sqty: element.sqty ? element.sqty : 0,
        statusDtl: element.statusDtl,
        unClearedPrice: element.unClearedPrice ? element.unClearedPrice : 0,
        xdId: element.xdId,
        zdId: element.zdId,
      };
    });
  };
  const submit = async (info: any, index: number, statusDtl: number) => {
    const content = statusDtl == 1 ? '是否提交该条订单信息' : '是否设置为非经营品种';
    showModal({
      title: '提示',
      content: content,
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: res => {
        if (res.confirm) {
          updateDtl(info, index, statusDtl);
        }
        // 如果用户点击取消，不做任何操作
      },
    });
  };
  const updateDtl = async (data: any, index: number, type: number) => {
    let upData = JSON.parse(JSON.stringify(data));
    if (!upData.sqty) {
      upData.sqty = 0;
    }
    if (!upData.onwayQty) {
      upData.onwayQty = 0;
    }
    if (!upData.unClearedPrice) {
      upData.unClearedPrice = 0;
    }
    upData.statusDtl = type;

    const res = await FinalKnotService.updateDtl(upData);
    if (+res.code == 200) {
      showSuccess(type == 1 ? '提交成功' : '设置非经营品种成功');
      infoList.value.splice(index, 1);
      if (infoList.value.length == 0) {
        appStore.setHadDoneOnDetail(true);
      }
    } else {
      showError(res.msg);
    }
  };
  return {
    fetchDtlList,
    infoList,
    submit,
  };
}
