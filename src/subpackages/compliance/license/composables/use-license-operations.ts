/**
 * 证照业务操作功能 Composable
 * 包含延期申请、审批、经理复签等业务操作
 */

import type { LicenseData, ManagerInfo, ExtensionFormData, ApprovalFormData } from '../types';
import { LicenseType, ApprovalStatus } from '../types';
import type { UploadFileInfo } from '@/types/common';

/**
 * 证照业务操作功能
 * 包含延期申请、审批、经理复签等业务操作
 */
export function useLicenseOperations() {
  const appStore = useAppStore();

  /**
   * 构建经理复签参数
   */
  const buildManagerResignParams = (
    formData: LicenseData,
    type: number,
    licenseType: LicenseType
  ): Record<string, string> => {
    const params: Record<string, string> = {
      cmrId: formData.cmrId!,
      reApproveStatus: String(type === 1 ? ApprovalStatus.REJECTED : ApprovalStatus.APPROVED),
    };

    if (licenseType === LicenseType.ENTERPRISE_LICENSE) {
      params.licenseId = formData.licenseId || '';
      params.delayApplyId = formData.approveId || '';
    } else {
      params.letterId = formData.seqId || '';
      params.delayApplyId = formData.delayApplyId || '';
    }

    return params;
  };

  /**
   * 经理复签提交
   */
  const submitManagerResign = async (
    formData: LicenseData,
    type: number,
    licenseType: LicenseType
  ): Promise<boolean> => {
    try {
      const params = buildManagerResignParams(formData, type, licenseType);
      console.log('经理复签参数:', params);

      await LicenseService.managerResign(params);
      showSuccess('提交成功');

      return true;
    } catch (error) {
      console.error('经理复签失败:', error);
      return false;
    }
  };

  /**
   * 构建选择经理表单参数
   */
  const buildChooseManagerFormData = (
    formData: LicenseData,
    date: string,
    memo: string,
    imageUrls: string[],
    leader: ManagerInfo,
    licenseType: LicenseType
  ): Record<string, any> => {
    // 基础参数
    const params: Record<string, any> = {
      delayTo: date,
      delayReason: memo,
      entryId: formData.entryId || '',
      unLockTimes: String(formData.unLockTimes || 0),
      resignManagerId: leader.value,
      resignManagerPhoneNumber: leader.phone,
      companyId: formData.companyId || '',
      imageUrls,
    };

    // 根据证照类型添加特定参数
    if (licenseType === LicenseType.ENTERPRISE_LICENSE) {
      params.licenseId = formData.licenseId || '';
      params.licenseName = formData.licenseName || '';
      params.validOnDate = formData.validOnDate || '';
      params.validEndDate = formData.validEndDate || '';
    } else {
      params.companyName = formData.companyName || '';
      params.letterId = formData.seqId || '';
      params.agentId = formData.agentId || '';
      params.dateFrom = formData.dateFrom || '';
      params.oldDateTo = formData.oldDateTo || '';
    }

    return params;
  };

  /**
   * 提交选择经理
   */
  const submitChooseManager = async (
    formData: LicenseData,
    date: string,
    memo: string,
    fileList: UploadFileInfo[],
    leader: ManagerInfo,
    licenseType: LicenseType,
    msgType: string | number
  ): Promise<boolean> => {
    if (!leader.value) {
      showToast('请选择部门经理');
      return false;
    }

    try {
      let imageUrls: string[] = [];
      if (fileList && fileList.length > 0) {
        imageUrls = await uploadFiles(fileList);
      }

      const formParams = buildChooseManagerFormData(
        formData,
        date,
        memo,
        imageUrls,
        leader,
        licenseType
      );

      await LicenseService.chooseManager(formParams);
      appStore.setHadDoneOnDetail(true);
      showSuccess('提交成功');

      if (!msgType) {
        // 延迟返回上一页
        setTimeout(() => {
          router.back();
        }, 500);
      }

      return true;
    } catch (error) {
      console.error('选择经理失败:', error);
      return false;
    }
  };

  /**
   * 构建延期申请参数
   * 根据证照类型构建不同的申请参数，支持企业证照和委托书两种类型
   */
  const buildExtensionFormData = (
    formData: LicenseData,
    date: string,
    memo: string,
    imageUrls: string[],
    licenseType: LicenseType
  ): ExtensionFormData => {
    // 基础参数
    const params: ExtensionFormData = {
      delayTo: date,
      delayReason: memo,
      entryId: formData.entryId || '',
      unLockTimes: formData.unLockTimes || 0,
      companyId: formData.companyId || '',
      companyName: formData.companyName || '',
      expireLeftDay: formData.expireLeftDay || 0,
      imageUrls,
    };

    // 根据证照类型添加特定参数
    if (licenseType === LicenseType.ENTERPRISE_LICENSE) {
      // 企业证照参数
      params.licenseId = formData.licenseId || '';
      params.licenseName = formData.licenseName || '';
      params.validOnDate = formData.validOnDate || '';
      params.validEndDate = formData.validEndDate || '';
    } else {
      // 委托书参数
      params.seqId = formData.seqId || '';
      params.agentId = formData.agentId || '';
      params.dateFrom = formData.dateFrom || '';
      params.oldDateTo = formData.oldDateTo || '';
    }

    return params;
  };

  /**
   * 提交延期申请
   * 处理延期申请的完整流程：参数验证、文件上传、API调用、结果处理
   */
  const submitExtensionApplication = async (
    formData: LicenseData,
    date: string,
    memo: string,
    fileList: UploadFileInfo[],
    licenseType: LicenseType,
    msgType: string | number
  ): Promise<boolean> => {
    if (!date) {
      showToast('请选择延期时间');
      return false;
    }
    if (!memo) {
      showToast('请填写延期原因');
      return false;
    }

    try {
      // 先上传文件，获取URL数组
      let imageUrls: string[] = [];
      if (fileList && fileList.length > 0) {
        imageUrls = await uploadFiles(fileList);
      }

      const formParams = buildExtensionFormData(formData, date, memo, imageUrls, licenseType);

      console.log('延期申请参数:', formParams);

      licenseType === LicenseType.ENTERPRISE_LICENSE
        ? await LicenseService.delayApply(formParams)
        : await LicenseService.delayAttorneyLetterApply(formParams);

      appStore.setHadDoneOnDetail(true);
      showSuccess('提交成功');

      if (!msgType) {
        // 延迟返回上一页
        setTimeout(() => {
          router.back();
        }, 500);
      }

      return true;
    } catch (error) {
      console.error('延期申请失败:', error);
      return false;
    }
  };

  /**
   * 构建审批表单数据
   * 根据证照类型构建不同的审批参数
   */
  const buildApprovalFormData = (
    formData: LicenseData,
    approveStatus: string,
    extensionReason: string,
    licenseType: LicenseType
  ): ApprovalFormData => {
    // 基础参数
    const params: ApprovalFormData = {
      entryId: formData.entryId || '',
      companyId: formData.companyId || '',
      companyName: formData.companyName || '',
      approveStatus,
      expireLeftDay: formData.expireLeftDay || 0,
    };

    // 添加可选参数
    if (formData.approveId) {
      params.approveId = formData.approveId;
    }

    // 根据证照类型添加特定参数
    if (licenseType === LicenseType.ENTERPRISE_LICENSE) {
      // 企业证照审批参数
      params.licenseId = formData.licenseId || '';
      params.licenseName = formData.licenseName || '';
      params.approveReason = extensionReason || '';
      params.delayTo = formData.delayToDate || '';
    } else {
      // 委托书审批参数
      params.agentId = formData.agentId || '';
      params.seqId = formData.seqId || '';
      params.delayApplyId = formData.delayApplyId || '';
      params.validEndDate = formData.dateTo || '';
      params.approveMemo = extensionReason || '';
      params.delayTo = formData.delayDate || '';
    }

    return params;
  };

  /**
   * 提交审批
   * 处理审批的完整流程：参数验证、API调用、结果处理
   */
  const submitApproval = async (
    formData: LicenseData,
    approveStatus: string,
    extensionReason: string,
    licenseType: LicenseType
  ): Promise<boolean> => {
    if (!extensionReason) {
      showToast('请填写审批原因');
      return false;
    }

    try {
      const formParams = buildApprovalFormData(
        formData,
        approveStatus,
        extensionReason,
        licenseType
      );

      licenseType === LicenseType.ENTERPRISE_LICENSE
        ? await LicenseService.audit(formParams)
        : await LicenseService.attorneyLetterAudit(formParams);

      appStore.setHadDoneOnDetail(true);
      showSuccess('提交成功');

      // 延迟返回上一页
      setTimeout(() => {
        router.back();
      }, 500);

      return true;
    } catch (error) {
      console.error('审批失败:', error);
      return false;
    }
  };

  return {
    submitManagerResign,
    submitChooseManager,
    submitExtensionApplication,
    submitApproval,
  };
}
