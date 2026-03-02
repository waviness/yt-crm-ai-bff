/**
 * 经理选择功能 Composable
 * 处理经理列表获取、选择、重置等功能
 */

import type { ManagerInfo } from '../types';

/**
 * 使用经理选择功能
 */
export function useManagerSelection() {
  const chooseShow = ref(false);
  const actionShow = ref(false);
  const leader = ref<ManagerInfo>({
    value: '',
    name: '',
    phone: '',
  });
  const leaderList = ref<ManagerInfo[]>([]);

  /**
   * 获取经理列表
   */
  const getLeaderList = async (): Promise<void> => {
    leaderList.value = [];
    const res = await LicenseService.getManagersByCurrentUser({});
    leaderList.value = res.map((item: any) => ({
      value: item.userId,
      name: item.userName,
      phone: item.phoneNum,
    }));
  };

  /**
   * 选择经理
   */
  const handleSelectLeader = (action: ManagerInfo): void => {
    actionShow.value = false;
    leader.value = action;
  };

  /**
   * 重置选择的经理
   */
  const resetLeader = (): void => {
    leader.value = {
      value: '',
      name: '',
      phone: '',
    };
  };

  return {
    chooseShow,
    actionShow,
    leader: readonly(leader),
    leaderList: readonly(leaderList),
    getLeaderList,
    handleSelectLeader,
    resetLeader,
  };
}
