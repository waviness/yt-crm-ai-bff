/**
 * 资金报表编辑逻辑
 */
import { calculateTotal } from '@/utils/number';
export const useFundingReportEdit = () => {
  const editModalShow = ref(false);

  // 金额数据
  const amountData = ref({
    amount: null as number | null,
    chAmount: null as number | null,
    total: null as number | null,
  });

  /**
   * 显示编辑弹窗
   */
  const showEditModal = (fundingData: any) => {
    editModalShow.value = true;
    amountData.value = {
      amount: fundingData.paymentAmount,
      chAmount: fundingData.chAmount,
      total: calculateTotal(fundingData.paymentAmount, fundingData.chAmount),
    };
  };

  /**
   * 隐藏编辑弹窗
   */
  const hideEditModal = () => {
    editModalShow.value = false;
  };

  /**
   * 输入变化处理
   */
  const onInputChange = async () => {
    await nextTick();
    const { amount, chAmount } = amountData.value;
    if (amount !== null || chAmount !== null) {
      amountData.value.total = calculateTotal(amount || 0, chAmount || 0);
    }
  };

  /**
   * 提交金额修改
   */
  const handleSubmitAmount = async (searchDate: string) => {
    const { amount, chAmount } = amountData.value;

    if (amount === null || chAmount === null) {
      showToast('请输入完整金额信息');
      return;
    }

    // 更新报表统计数据
    await FundingService.addPaymentAmount({
      selectDate: searchDate,
      amount,
      chAmount,
    });

    showSuccess('修改成功');
    hideEditModal();

    // 返回成功状态，让调用方决定是否刷新
    return true;
  };

  return {
    editModalShow,
    amountData,
    showEditModal,
    hideEditModal,
    onInputChange,
    handleSubmitAmount,
  };
};
