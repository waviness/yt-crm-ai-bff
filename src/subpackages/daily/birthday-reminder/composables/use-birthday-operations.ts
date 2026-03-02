/**
 * 生日提醒操作 Composable
 * 提供推送、删除等公共操作
 */
export function useBirthdayOperations() {
  /**
   * 添加推送用户
   */
  const addUser = async (
    cueIdBirthFlagReqList: any[],
    userIdList: string[],
    onSuccess?: () => void
  ) => {
    const params = {
      cueIdBirthFlagReqList,
      userIdList,
    };

    try {
      await BirthdayService.addUser(params);
      showSuccess('推送成功');
      onSuccess?.();
    } catch (error) {
      console.error('推送失败:', error);
    }
  };

  /**
   * 更新推送用户（删除）
   */
  const updateUser = async (
    userIdList: string[],
    cueIdBirthFlagReqList: any[],
    onSuccess?: () => void
  ) => {
    const params = {
      userIdList,
      cueIdBirthFlagReqList,
    };

    try {
      await BirthdayService.updateUser(params);
      showSuccess('删除成功');
      onSuccess?.();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  /**
   * 计算距离下次生日的天数
   */
  const getSurplusDay = (birthday: string): number => {
    if (!birthday) return 0;

    const today = new Date();
    const birthDate = new Date(birthday);

    // 将生日年份设置为今年
    birthDate.setFullYear(today.getFullYear());

    // 如果今年的生日已过，计算到明年生日的天数
    if (birthDate < today) {
      birthDate.setFullYear(today.getFullYear() + 1);
    }

    // 计算天数差
    const diff = birthDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return {
    addUser,
    updateUser,
    getSurplusDay,
  };
}
