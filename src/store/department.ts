import { ref, computed } from 'vue';
import { CommonService } from '@/api/common';

/**
 * 部门树 Store
 * 统一管理部门树数据，避免重复获取
 */
export const useDepartmentStore = defineStore(
  'department',
  () => {
    const depTreeList = ref<any[]>([]); // 部门树列表
    const deptUserData = ref<Record<string, any>>({}); // 已查询的部门对应用户列表数据

    /**
     * 映射树列表，获取所有有权限的部门ID
     */
    const mapTreeList = (item: any[], depIdList: any[], authorizedFlag: boolean = true): any[] => {
      for (let index = 0; index < item.length; index++) {
        const element = item[index];
        if (!authorizedFlag) {
          depIdList.push(element.depId);
        } else {
          if (element.operationFlag) {
            depIdList.push(element.depId);
          }
        }
        if (element.childList && element.childList.length > 0) {
          mapTreeList(element.childList, depIdList, authorizedFlag);
        }
      }
      return depIdList;
    };

    /**
     * 获取组织架构tree信息
     */
    const getDepTree = async (params: any = { treeType: 1, authorizedFlag: true }) => {
      const res = await CommonService.getDepTree(params);
      if (res.length === 0) {
        depTreeList.value = [];
      } else {
        depTreeList.value = res;
      }
      return { data: res };
    };

    /**
     * 根据部门id获取人员基本信息
     */
    const getUserByParams = async (params: any, id?: any) => {
      const res = await CommonService.getUserByParams(params);
      const userList = (res || []).map((item: any) => {
        const { userId, userName, phoneNum, userMainDepNum, userMainDepName } = item;
        return {
          userId,
          userName,
          phoneNum,
          userMainDepNum,
          userMainDepName,
        };
      });
      if (params.depIdList && params.depIdList.length && id) {
        deptUserData.value[id] = {
          userList,
          selectList: [],
        };
      }
      return { userList, res };
    };

    /**
     * 初始化部门树（如果不存在或为空则获取）
     */
    const initDepTree = async (params: any = { treeType: 1, authorizedFlag: true }) => {
      if (!depTreeList.value || depTreeList.value.length === 0) {
        await getDepTree(params);
      }
      return depTreeList.value;
    };

    /**
     * 清空部门树数据
     */
    const clearDepTree = () => {
      depTreeList.value = [];
      deptUserData.value = {};
    };

    /**
     * 检查是否有部门权限（是否有部门树数据）
     */
    const hasDept = computed(() => {
      return depTreeList.value && depTreeList.value.length > 0;
    });

    return {
      depTreeList,
      deptUserData,
      mapTreeList,
      getDepTree,
      getUserByParams,
      initDepTree,
      clearDepTree,
      hasDept,
    };
  },
  {
    persist: {},
  }
);
