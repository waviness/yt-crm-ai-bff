/**
 * 日程操作 Composable
 * 提供日程的新增、编辑、删除等操作
 */
export function useScheduleOperations() {
  /**
   * 新增/编辑日程
   */
  const insertSchedule = async (params: any[], onSuccess?: () => void) => {
    try {
      await ScheduleService.insertSchedule(params);
      showSuccess('日程录入成功');
      onSuccess?.();
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  return {
    insertSchedule,
  };
}
