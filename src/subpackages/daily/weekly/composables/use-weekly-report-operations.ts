/**
 * 周报操作 Composable
 * 提供周报的提交、暂存、删除、生成等操作
 */
export function useWeeklyReportOperations() {
  /**
   * 验证周报数据
   */
  const validateReportData = (params: any[]): boolean => {
    if (params.length === 0) {
      showToast('没有要新增或编辑的信息');
      return false;
    }

    for (let index = 0; index < params.length; index++) {
      const element = params[index];
      switch (element.tableType) {
        case 1:
          if (!element.objId) {
            showToast('政府单位不能为空');
            return false;
          }
          if (!element.labelRemark) {
            showToast('详情不能为空');
            return false;
          }
          break;
        case 2:
          if (!element.objType) {
            showToast('类型不能为空');
            return false;
          }
          if (!element.objId) {
            showToast('客户信息不能为空');
            return false;
          }
          break;
        case 3:
          if (!element.objType) {
            showToast('类型不能为空');
            return false;
          }
          if (!element.objId) {
            showToast('客户信息不能为空');
            return false;
          }
          if (!element.labelRemark) {
            showToast('详情不能为空');
            return false;
          }
          break;
        case 4:
          if (!element.objId) {
            showToast('事项类型不能为空');
            return false;
          }
          if (!element.labelRemark) {
            showToast('计划不能为空');
            return false;
          }
          break;
      }
    }
    return true;
  };

  /**
   * 收集需要暂存的数据
   */
  const collectSaveData = (weeklyReportObj: any): any[] => {
    const params: any[] = [];

    for (let index = 0; index < weeklyReportObj.resultList.length; index++) {
      const element = weeklyReportObj.resultList[index];
      for (let childindex = 0; childindex < element.childList.length; childindex++) {
        const childelement = element.childList[childindex];
        for (
          let reportDtoindex = 0;
          reportDtoindex < childelement.reportDtoList.length;
          reportDtoindex++
        ) {
          const reportDtoelement = childelement.reportDtoList[reportDtoindex];
          if (reportDtoelement.cwrdocId) {
            reportDtoelement.isSaveClick = true;
            params.push(reportDtoelement);
          }
        }
      }
    }

    return params;
  };

  /**
   * 收集需要提交的数据ID列表
   */
  /**
   * 收集要提交的数据ID列表
   * 原逻辑：
   * - 多个领导（leaderList.length > 1）：只提交选中的（checked === true）
   * - 单个领导（leaderList.length <= 1）：提交全部（不管是否选中）
   */
  const collectSubmitDataIds = (weeklyReportObj: any, leaderList: any[]): string[] => {
    const cwrdtlIdList: string[] = [];

    if (leaderList.length > 1) {
      // 多个领导时，只提交选中的
      for (let index = 0; index < weeklyReportObj.resultList.length; index++) {
        const element = weeklyReportObj.resultList[index];
        for (let childindex = 0; childindex < element.childList.length; childindex++) {
          const childelement = element.childList[childindex];
          for (
            let reportDtoindex = 0;
            reportDtoindex < childelement.reportDtoList.length;
            reportDtoindex++
          ) {
            const reportDtoelement = childelement.reportDtoList[reportDtoindex];
            if (reportDtoelement.checked) {
              cwrdtlIdList.push(reportDtoelement.cwrdtlId);
            }
          }
        }
      }
    } else {
      // 单个领导时，提交全部
      for (let index = 0; index < weeklyReportObj.resultList.length; index++) {
        const element = weeklyReportObj.resultList[index];
        for (let childindex = 0; childindex < element.childList.length; childindex++) {
          const childelement = element.childList[childindex];
          for (
            let reportDtoindex = 0;
            reportDtoindex < childelement.reportDtoList.length;
            reportDtoindex++
          ) {
            const reportDtoelement = childelement.reportDtoList[reportDtoindex];
            cwrdtlIdList.push(reportDtoelement.cwrdtlId);
          }
        }
      }
    }

    return cwrdtlIdList;
  };

  /**
   * 暂存周报
   */
  const saveReport = async (params: any[], onSuccess?: () => void) => {
    try {
      await WeeklyService.insOrUpdReport(params);
      showSuccess('暂存成功');
      onSuccess?.();
    } catch (error) {
      console.error('暂存失败:', error);
    }
  };

  /**
   * 提交周报
   */
  const submitReport = async (
    params: { cwrdocId: string; leaderId: string; cwrdtlIdList: string[] },
    onSuccess?: () => void
  ) => {
    uni.showLoading({ title: '提交中...', mask: true });

    try {
      await WeeklyService.submitReport(params);
      uni.hideLoading();
      showSuccess('提交成功');

      onSuccess?.();
    } catch (error) {
      uni.hideLoading();
      console.error('提交周报失败:', error);
    }
  };

  /**
   * 删除周报项
   */
  const deleteReportItem = async (cwrdtlId: string, onSuccess?: () => void) => {
    try {
      await WeeklyService.dltReport([cwrdtlId]);
      showSuccess('删除成功');
      onSuccess?.();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  /**
   * 生成周报
   */
  const generateReport = async (
    params: { startTime: string; endTime: string },
    onSuccess?: () => void
  ) => {
    try {
      await WeeklyService.generateReport(params);
      showSuccess('生成成功');
      onSuccess?.();
    } catch (error) {
      console.error('生成周报失败:', error);
    }
  };

  return {
    validateReportData,
    collectSaveData,
    collectSubmitDataIds,
    saveReport,
    submitReport,
    deleteReportItem,
    generateReport,
  };
}
