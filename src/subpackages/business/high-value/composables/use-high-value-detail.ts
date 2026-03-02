/**
 * 高值详情 Composable
 */
export function useHighValueDetail(chgtsId: Ref<string>, statusDtl: Ref<number>) {
  const appStore = useAppStore();

  const info = ref<any>({});
  const loading = ref(false);

  // 反馈参数（statusDtl === 0 时才需要）
  const params = ref({
    customerQty: '',
    feedbackType: '',
    feedbackTypeName: '',
    feedbackMemo: '',
  });

  // 反馈类型选项
  const columns = ['退货', '继续销售', '其他'];

  /**
   * 获取详情
   */
  const getDetail = async () => {
    if (!chgtsId.value) return;

    loading.value = true;
    try {
      const res = await HighValueService.getToSalerDetailWx({
        chgtsId: chgtsId.value,
      });
      info.value = res;
    } catch (error) {
      console.error('获取详情失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 选择反馈类型
   */
  const onConfirm = (e: any) => {
    params.value.feedbackTypeName = e.value[0];
    params.value.feedbackType = String(e.indexs[0] + 1);
  };

  /**
   * 获取反馈类型文本
   */
  const getFeedbackTypeText = (feedbackType: number) => {
    const map: Record<number, string> = {
      1: '退货',
      2: '继续销售',
      3: '其他',
    };
    return map[feedbackType] || '-';
  };

  /**
   * 提交反馈
   */
  const feedback = async (submitParams: any) => {
    try {
      await HighValueService.feedback(submitParams);
      showSuccess('提交反馈成功');
      statusDtl.value = 1;
      getDetail();
      // 标记需要刷新列表
      appStore.setHadDoneOnDetail(true);
    } catch (error: any) {
      showToast(error.message || '提交失败');
    }
  };

  /**
   * 处理点击事件
   */
  const handleClick = (data: any, type?: number) => {
    let submitParams: any = {};

    if (data) {
      submitParams.chgtsId = data.chgtsId;

      // 按上次反馈
      if (type === 1) {
        submitParams.customerQty = data.customerQty;
        submitParams.feedbackType = data.feedbackType;
        submitParams.feedbackMemo = data.feedbackMemo;
      }

      // 已销售完
      if (type === 2) {
        showModal({
          content: '确认标记为已销售完吗？',
          success: res => {
            if (res.confirm) {
              submitParams.customerQty = 0;
              submitParams.feedbackType = 3;
              submitParams.feedbackMemo = '已销售完';
              feedback(submitParams);
            }
          },
        });
        return;
      }
    } else {
      // 提交新反馈
      if (!params.value.feedbackType) {
        showToast('请选择反馈处理意见');
        return;
      }
      submitParams.chgtsId = info.value.chgtsId;
      submitParams.customerQty = params.value.customerQty;
      submitParams.feedbackType = params.value.feedbackType;
      submitParams.feedbackMemo = params.value.feedbackMemo;
    }

    feedback(submitParams);
  };

  return {
    info,
    loading,
    params,
    columns,
    getDetail,
    onConfirm,
    getFeedbackTypeText,
    handleClick,
  };
}
