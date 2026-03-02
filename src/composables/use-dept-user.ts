import { ref } from 'vue';
import type { DeptItem, UserItem, DeptUserData } from '@/components/biz/dept-user/types';

/**
 * 部门人员选择逻辑 composable（全局复用）
 */
export function useDeptUser(
  options: {
    authorizedFlag?: boolean;
    leaderFlag?: boolean;
  } = {}
) {
  const { authorizedFlag = true, leaderFlag = false } = options;

  const hasDept = ref(false);
  const depTreeList = ref<DeptItem[]>([]);
  const userDataList = ref<UserItem[]>([]);
  const checkedUsers = ref<UserItem[]>([]);
  const changeTypeShow = ref(false);
  const deptUserData = ref<DeptUserData>({});
  const getUserListLoading = ref(false);

  let timeout: any = null;

  // 获取部门树
  const getDepTree = async () => {
    try {
      const res = await CommonService.getDepTree({
        treeType: 1,
        authorizedFlag,
      });

      depTreeList.value = res || [];
      hasDept.value = res && res.length > 0;

      // 初始化时加载第一级部门的人员
      if (hasDept.value && depTreeList.value.length) {
        const firstDept = depTreeList.value[0];
        await getUserByParams({ depIdList: mapTreeList(depTreeList.value, []) }, firstDept.depId);
      }

      return res;
    } catch (error) {
      console.error('获取部门树失败:', error);
      hasDept.value = false;
      return [];
    }
  };

  // 根据参数获取人员
  const getUserByParams = async (params: any, deptId?: string | number) => {
    getUserListLoading.value = true;
    try {
      const res = await CommonService.getUserByParams({
        ...params,
        leaderFlag,
        authorizedFlag,
      });

      userDataList.value = (res || []).map((item: any) => ({
        userId: item.userId,
        userName: item.userName,
        phoneNum: item.phoneNum,
        userMainDepNum: item.userMainDepNum,
        userMainDepName: item.userMainDepName,
      }));

      // 缓存部门对应的人员数据
      if (deptId && params.depIdList?.length) {
        deptUserData.value[deptId] = {
          userList: userDataList.value,
          selectList: [],
        };
      }

      return userDataList.value;
    } catch (error) {
      console.error('获取人员失败:', error);
      showToast('获取人员失败');
      return [];
    } finally {
      getUserListLoading.value = false;
    }
  };

  // 递归获取所有部门ID
  const mapTreeList = (
    items: DeptItem[],
    depIdList: (string | number)[] = []
  ): (string | number)[] => {
    items.forEach(item => {
      if (!authorizedFlag || item.operationFlag) {
        depIdList.push(item.depId);
      }
      if (item.childList?.length) {
        mapTreeList(item.childList, depIdList);
      }
    });
    return depIdList;
  };

  // 搜索人员（防抖）
  const refreshUserByKeywords = (keyword: string) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      await getUserByParams({ keyword });
    }, 800);
  };

  // 按部门刷新人员
  const refreshUserByDepts = async (item: DeptItem) => {
    await getUserByParams({ depIdList: mapTreeList([item]) }, item.depId);
  };

  // 取消选择
  const cancelUserByDepts = () => {
    changeTypeShow.value = false;
  };

  return {
    // 状态
    hasDept,
    depTreeList,
    userDataList,
    checkedUsers,
    changeTypeShow,
    deptUserData,
    getUserListLoading,

    // 方法
    getDepTree,
    getUserByParams,
    mapTreeList,
    refreshUserByKeywords,
    refreshUserByDepts,
    cancelUserByDepts,
  };
}
