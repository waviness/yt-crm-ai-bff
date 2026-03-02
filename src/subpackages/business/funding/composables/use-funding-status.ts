/**
 * 资金状态管理和验证逻辑
 */
import { FundingStatusType, type FundingFormData } from '../types';

export const useFundingStatus = () => {
  /**
   * 确定状态类型
   */
  const determineStatus = (detailObj: FundingFormData, readonly: boolean) => {
    if (readonly) {
      return FundingStatusType.DETAIL;
    }

    if (detailObj.addFlag === 1) {
      return FundingStatusType.INITIAL;
    }

    if (detailObj.modifyFlag === 1) {
      return FundingStatusType.REVISE;
    }

    return FundingStatusType.SECOND;
  };

  /**
   * 验证表单数据
   */
  const validateForm = (inputObj: any, statusType: number) => {
    // 验证月初上报销售金额（仅初次填报需要）
    if (
      statusType === FundingStatusType.INITIAL &&
      (!inputObj.xsAmount || inputObj.xsAmount <= 0)
    ) {
      showToast('请输入月初上报销售金额');
      return false;
    }

    // 验证电汇金额
    if (inputObj.dhAmount === null || inputObj.dhAmount === undefined || inputObj.dhAmount < 0) {
      showToast('请输入电汇金额');
      return false;
    }

    // 验证承兑金额
    if (inputObj.chAmount === null || inputObj.chAmount === undefined || inputObj.chAmount < 0) {
      showToast('请输入承兑金额');
      return false;
    }

    // 验证修订原因（仅修订上报需要）
    if (statusType === FundingStatusType.REVISE && !inputObj.reason?.trim()) {
      showToast('请输入修订原因');
      return false;
    }

    return true;
  };

  /**
   * 处理修改提交
   */
  const handleModifySubmit = async (submitData: () => Promise<any>) => {
    const res = await submitData();
    showSuccess('提交成功');
    return res;
  };

  /**
   * 处理返回操作
   */
  const handleGoBack = () => {
    router.back();
  };

  return {
    determineStatus,
    validateForm,
    handleModifySubmit,
    handleGoBack,
  };
};
