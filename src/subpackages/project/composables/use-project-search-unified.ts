/**
 * 项目管理统一搜索逻辑 composable
 * 整合项目搜索、组织搜索、用户搜索等功能
 *
 * @example
 * ```typescript
 * const {
 *   // 项目搜索
 *   searchProject,
 *   searchDeepProject,
 *   // 组织搜索
 *   searchUsers,
 *   searchDepts,
 *   // 通用方法
 *   clearSearch,
 *   resetSearch
 * } = useProjectSearchUnified();
 *
 * // 搜索项目
 * await searchProject('2024-01', '关键词');
 *
 * // 搜索用户
 * searchUsers(orgOriginList, orgList, '张三');
 * ```
 */
import type { OrgInfo, UserInfo, DeptInfo } from '../types';

export function useProjectSearchUnified() {
  // 项目搜索相关状态
  const proLoading = ref(false);
  const projectList = ref<any[]>([]);
  const activeIndex = ref(0);
  const keywords = ref('');

  // 通用搜索状态
  const placeholder = ref('搜索');
  const searchKeyword = ref('');

  // ==================== 项目搜索 ====================

  /**
   * 搜索项目列表
   * @param date 日期
   * @param key 搜索关键词
   * @returns 项目列表
   */
  const searchProject = async (date: string, key: string = '') => {
    proLoading.value = true;
    try {
      const res = await ProjectService.getProjectProductList({ date, key });
      projectList.value = processProjectList(res, key);
      return projectList.value;
    } finally {
      proLoading.value = false;
    }
  };

  /**
   * 搜索深分项目列表
   * @param date 日期
   * @param key 搜索关键词
   * @returns 深分项目列表
   */
  const searchDeepProject = async (date: string, key: string = '') => {
    proLoading.value = true;
    try {
      const res = await ProjectService.getDeepProjectSelect({ date, key });
      projectList.value = processDeepProjectList(res, key);
      return projectList.value;
    } finally {
      proLoading.value = false;
    }
  };

  /**
   * 处理项目列表数据
   * @param list 原始项目列表
   * @param key 搜索关键词
   * @returns 处理后的项目列表
   */
  const processProjectList = (list: any[], key: string = '') => {
    const processedList = list.map((item: any) => ({
      ...item,
      text: item.projectName,
      children:
        item.productVOList?.map((pro: any) => ({
          ...pro,
          id: pro.productId,
          text: pro.productName,
        })) || [],
    }));

    // 为每个项目添加"不限"选项
    processedList.forEach((item: any) => {
      item.children.unshift({
        id: `${item.projectId}-1`,
        text: '不限',
      });
    });

    // 如果没有搜索关键词，添加"全部"选项
    if (!key) {
      processedList.unshift({
        projectId: '',
        projectName: '全部',
        text: '全部',
        children: [],
      });
    }

    return processedList;
  };

  /**
   * 处理深分项目列表数据
   * @param list 原始深分项目列表
   * @param key 搜索关键词
   * @returns 处理后的深分项目列表
   */
  const processDeepProjectList = (list: any[], key: string = '') => {
    const processedList = list.map((item: any) => ({
      ...item,
      text: item.projectName,
    }));

    // 如果没有搜索关键词，添加"全部"选项
    if (!key) {
      processedList.unshift({
        projectId: '',
        projectName: '全部',
        text: '全部',
      });
    }

    return processedList;
  };

  /**
   * 设置当前选中的项目
   * @param projectId 项目ID
   */
  const setActiveProject = (projectId: string) => {
    const index = projectList.value.findIndex(item => item.projectId === projectId);
    if (index !== -1) {
      activeIndex.value = index;
    }
  };

  // ==================== 组织搜索 ====================

  /**
   * 通用搜索函数
   * @param orgList 组织列表
   * @param keyword 搜索关键词
   * @param searchFields 搜索字段配置
   */
  const searchInOrgList = (
    orgList: OrgInfo[],
    keyword: string,
    searchFields: {
      searchUsers?: boolean; // 是否搜索用户
      searchDepts?: boolean; // 是否搜索部门
    } = { searchUsers: true, searchDepts: true }
  ): OrgInfo[] => {
    if (!keyword.trim()) {
      return orgList;
    }

    const filteredOrgs: OrgInfo[] = [];

    orgList.forEach((org: OrgInfo) => {
      // 搜索中心名称
      if (org.name.includes(keyword)) {
        filteredOrgs.push(org);
        return;
      }

      if (org.children?.length) {
        const filteredDepts: DeptInfo[] = [];

        org.children.forEach((dept: DeptInfo) => {
          // 搜索部门名称
          if (searchFields.searchDepts && dept.name.includes(keyword)) {
            filteredDepts.push(dept);
            return;
          }

          // 搜索用户
          if (searchFields.searchUsers && dept.crmUserDtoList?.length) {
            const filteredUsers: UserInfo[] = dept.crmUserDtoList.filter((user: UserInfo) =>
              user.userName.includes(keyword)
            );

            if (filteredUsers.length > 0) {
              filteredDepts.push({
                ...dept,
                crmUserDtoList: filteredUsers,
              });
            }
          }
        });

        if (filteredDepts.length > 0) {
          filteredOrgs.push({
            ...org,
            children: filteredDepts,
          });
        }
      }
    });

    return filteredOrgs;
  };

  /**
   * 用户搜索（包含部门和用户）
   * @param orgOriginList 原始组织列表
   * @param orgList 当前组织列表
   * @param keyword 搜索关键词
   */
  const searchUsers = (
    orgOriginList: OrgInfo[],
    orgList: { value: OrgInfo[] },
    keyword: string
  ) => {
    searchKeyword.value = keyword;
    orgList.value = searchInOrgList(orgOriginList, keyword, {
      searchUsers: true,
      searchDepts: true,
    });
  };

  /**
   * 部门搜索（仅搜索部门）
   * @param orgOriginList 原始组织列表
   * @param orgList 当前组织列表
   * @param keyword 搜索关键词
   */
  const searchDepts = (
    orgOriginList: OrgInfo[],
    orgList: { value: OrgInfo[] },
    keyword: string
  ) => {
    searchKeyword.value = keyword;
    orgList.value = searchInOrgList(orgOriginList, keyword, {
      searchUsers: false,
      searchDepts: true,
    });
  };

  /**
   * 清空搜索
   * @param orgOriginList 原始组织列表
   * @param orgList 当前组织列表
   */
  const clearSearch = (orgOriginList: OrgInfo[], orgList: { value: OrgInfo[] }) => {
    searchKeyword.value = '';
    orgList.value = [...orgOriginList];
  };

  // ==================== 通用方法 ====================

  /**
   * 重置所有搜索状态
   */
  const resetSearch = () => {
    // 项目搜索状态
    keywords.value = '';
    projectList.value = [];
    activeIndex.value = 0;

    // 通用搜索状态
    searchKeyword.value = '';
    placeholder.value = '搜索';
  };

  return {
    // 项目搜索状态
    proLoading,
    projectList,
    activeIndex,
    keywords,

    // 通用搜索状态
    placeholder,
    searchKeyword,

    // 项目搜索方法
    searchProject,
    searchDeepProject,
    processProjectList,
    processDeepProjectList,
    setActiveProject,

    // 组织搜索方法
    searchUsers,
    searchDepts,
    clearSearch,
    searchInOrgList,

    // 通用方法
    resetSearch,
  };
}
