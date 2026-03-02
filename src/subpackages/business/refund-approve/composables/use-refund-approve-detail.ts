import { RefundApproveService } from '@/api/refund-approve';
import type { RefundApproveDetail } from '../types';

export function useRefundApproveDetail() {
  const appStore = useAppStore();

  // 详情数据
  const detailObj = ref<RefundApproveDetail>({
    status: 0,
  } as RefundApproveDetail);

  // 是否通过 1-通过 2-不通过
  const isAgree = ref(1);

  // 备注
  const remark = ref('');

  // 获取详情
  const fetchDetail = async (fetchdtlId: string) => {
    try {
      const res = await RefundApproveService.queryOrder({ fetchdtlId });
      detailObj.value = res || { status: 0 };
    } catch (error) {
      console.error('获取详情失败:', error);
      showError('获取详情失败');
    }
  };

  // 提交审批
  const submitApproval = async () => {
    if (!detailObj.value.fetchdtlId) {
      showError('缺少必要参数');
      return;
    }

    try {
      const res = await RefundApproveService.operationForEmergencyOrder({
        fetchdtlId: detailObj.value.fetchdtlId,
        fetchId: detailObj.value.fetchId,
        useStatus: isAgree.value,
        memo: remark.value,
      });

      if (res && +res.code === 200) {
        showSuccess(res.msg || '提交成功');
        appStore.setHadDoneOnDetail(true);
        // 重新获取详情
        await fetchDetail(detailObj.value.fetchdtlId);
      } else {
        showError(res?.msg || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      showError('提交失败');
    }
  };

  return {
    detailObj,
    isAgree,
    remark,
    fetchDetail,
    submitApproval,
  };
}
