/**
 * 项目管理公共逻辑 composable
 *
 * 提供项目管理模块的完整功能：
 * - 月份选择列表获取
 * - 组织架构数据获取
 * - 权限级别判断和数据初始化
 * - 搜索功能（支持用户搜索和部门搜索）
 *
 * @param isEx 是否为深分进度模式，默认为false（准入管理模式）
 *
 * @example
 * ```typescript
 * // 准入管理模式
 * const {
 *   columns,        // 月份选择列表
 *   orgList,        // 当前组织列表
 *   resList,        // 选中结果列表
 *   selectMonth,    // 选中的月份
 *   searchUsers,    // 用户搜索方法
 *   initData,       // 初始化数据
 * } = useProjectCommon();
 *
 * // 深分进度模式
 * const {
 *   searchDepts,    // 部门搜索方法
 *   initData,       // 初始化数据
 * } = useProjectCommon(true);
 *
 * // 初始化数据
 * await initData();
 * ```
 */
import type { OrgInfo } from '../types';

export function useProjectCommon(isEx: boolean = false) {
  // 响应式数据
  const loading = ref(false);
  const columns = ref<string[][]>([]);
  const yearMonthData = ref<Map<string, string[]>>(new Map());
  const orgOriginList = ref<OrgInfo[]>([]);
  const orgList = ref<OrgInfo[]>([]);
  const resList = ref<any[]>([]);
  const selectMonth = ref('');

  /**
   * 获取月份选择列表
   * @param flag 标志位：1-准入管理，2-深分进度
   */
  const getMonthColumns = async (flag: 1 | 2) => {
    const res = await ProjectService.getProjectManageDate({ flag });

    // 收集所有年份和月份数据
    const yearMap = new Map<string, Set<number>>();
    res.forEach((date: string) => {
      const dateArr = date.split('-');
      const year = dateArr[0];
      const month = Number(dateArr[1]);

      if (!yearMap.has(year)) {
        yearMap.set(year, new Set());
      }
      yearMap.get(year)!.add(month);
    });

    // 转换为二维数组格式：[[年份数组], [月份数组]]
    const years = Array.from(yearMap.keys()).sort();
    const months = Array.from(yearMap.get(years[0]) || []).sort();

    columns.value = [years.map(y => `${y}年`), months.map(m => `${m}月`)];

    // 存储年份对应的月份数据，用于联动
    const tempYearMonthData = new Map<string, string[]>();
    years.forEach(year => {
      const monthSet = yearMap.get(year)!;
      // 按照 res 数组中的顺序排序，而不是数字排序
      const sortedMonths = Array.from(monthSet).sort((a, b) => {
        const dateA = `${year}-${a.toString().padStart(2, '0')}`;
        const dateB = `${year}-${b.toString().padStart(2, '0')}`;
        return res.indexOf(dateA) - res.indexOf(dateB);
      });
      tempYearMonthData.set(
        `${year}年`,
        sortedMonths.map(m => `${m}月`)
      );
    });

    // 更新响应式数据
    yearMonthData.value = tempYearMonthData;

    // 设置默认选中月份
    const lastMonth = res[res.length - 1];
    selectMonth.value = lastMonth ? `${lastMonth.split('-')[0]}.${lastMonth.split('-')[1]}` : '';
  };

  /**
   * 获取组织架构数据
   * @param date 日期
   * @param isEx 是否为深分进度
   */
  const getOrgData = async (date: string, isEx: boolean = false) => {
    const res = await ProjectService.queryDataDeptByType({ date });

    // 构建组织架构
    const deptTree = res.deptTreeList[0];
    orgOriginList.value = [];

    deptTree.deptVO.forEach((org: any) => {
      const children = isEx
        ? [
            // 深分进度：只有部门，没有用户
            {
              id: `${org.deptId}-1`,
              name: '不限',
              parentId: org.deptId,
            },
            ...org.deptVO.map((dept: any) => ({
              id: dept.deptId,
              name: dept.deptName,
              parentId: org.deptId,
            })),
          ]
        : [
            // 准入管理：有部门和用户
            {
              id: `${org.deptId}-1`,
              name: '不限',
              parentId: org.deptId,
              crmUserDtoList: org.crmUserDtoList || [],
            },
            ...org.deptVO.map((dept: any) => ({
              id: dept.deptId,
              name: dept.deptName,
              parentId: org.deptId,
              crmUserDtoList: dept.crmUserDtoList || [],
            })),
          ];

      orgOriginList.value.push({
        id: org.deptId,
        name: org.deptName,
        children,
      });
    });

    // 添加父级组织（公司整体）
    orgOriginList.value.unshift({
      id: deptTree.parentId,
      name: deptTree.parentName,
      children: isEx
        ? [
            // 深分进度：只有部门
            {
              id: `${deptTree.parentId}-1`,
              name: '不限',
              parentId: deptTree.parentId,
            },
          ]
        : [
            // 准入管理：有用户
            {
              id: `${deptTree.parentId}-1`,
              name: '不限',
              parentId: deptTree.parentId,
              crmUserDtoList: deptTree.crmUserDtoList || [],
            },
          ],
    });

    orgList.value = [...orgOriginList.value];

    // 设置默认选中
    setDefaultSelection(res, isEx);

    return res;
  };

  /**
   * 设置默认选中项
   * @param orgData 组织数据
   * @param isEx 是否为深分进度
   */
  const setDefaultSelection = (orgData: any, isEx: boolean = false) => {
    const projectStore = useProjectStore();
    const leaderLevel = projectStore.projectLeaderLevel || 0;

    if (leaderLevel === 1) {
      // 公司整体管理人员
      const firstOrg = orgList.value[0];
      if (firstOrg) {
        const { id, name, children } = firstOrg;
        if (isEx) {
          // 深分进度：只有组织和部门
          resList.value = [
            { id, name, children },
            { id: `${id}-1`, name: '不限' },
          ];
        } else {
          // 准入管理：有组织、部门和用户
          resList.value = [
            { id, name, children },
            { id: `${id}-1`, name: '不限', crmUserDtoList: children[0]?.crmUserDtoList || [] },
            [{ userId: -1, userName: '不限' }],
          ];
        }
      }
    } else if (leaderLevel === 2) {
      // 中心管理人员
      const centerOrg = orgList.value.find((item: any) => item.id === orgData.crmGroup.depId);
      if (centerOrg) {
        const { id, name, children } = centerOrg;
        if (isEx) {
          // 深分进度：只有组织和部门
          resList.value = [
            { id, name, children },
            { id: `${id}-1`, name: '不限' },
          ];
        } else {
          // 准入管理：有组织、部门和用户
          resList.value = [
            { id, name, children },
            { id: `${id}-1`, name: '不限', crmUserDtoList: children[0]?.crmUserDtoList || [] },
            [{ userId: -1, userName: '不限' }],
          ];
        }
      }
    } else {
      // 部门管理人员
      const tempOrg = orgList.value.find(({ id }: any) => id === orgData.crmGroup.parentId);
      if (tempOrg) {
        const tempDept = tempOrg.children?.find(({ id }: any) => id === orgData.crmGroup.depId);
        if (tempDept) {
          const { id, name, children } = tempOrg;
          if (isEx) {
            // 深分进度：只有组织和部门
            resList.value = [
              { id, name, children },
              { id: tempDept.id, name: tempDept.name },
            ];
          } else {
            // 准入管理：有组织、部门和用户
            resList.value = [
              { id, name, children },
              {
                id: tempDept.id,
                name: tempDept.name,
                crmUserDtoList: tempDept.crmUserDtoList || [],
              },
              [{ userId: -1, userName: '不限' }],
            ];
          }
        }
      }
    }
  };

  /**
   * 初始化数据（根据isEx参数选择初始化模式）
   */
  const initData = async () => {
    loading.value = true;
    try {
      await getMonthColumns(isEx ? 2 : 1);
      if (selectMonth.value) {
        await getOrgData(selectMonth.value.replace('.', '-'), isEx);
      }
    } finally {
      loading.value = false;
    }
  };

  /**
   * 重置数据
   */
  const resetData = () => {
    columns.value = [];
    orgOriginList.value = [];
    orgList.value = [];
    resList.value = [];
    selectMonth.value = '';
  };

  /**
   * 获取统计数据（准入管理专用）
   * @description 获取项目统计数据
   */
  const getAccessData = async () => {
    const projectStore = useProjectStore();
    const userStore = useUserStore();
    const leaderLevel = projectStore.projectLeaderLevel || 0;
    const params: any = {
      date: selectMonth.value.replace('.', '-'),
      userIdList: !leaderLevel
        ? [userStore.userInfor.userId]
        : resList.value[2]
            .filter(({ userId }: any) => userId !== -1)
            .map(({ userId }: any) => userId),
    };

    if (leaderLevel) {
      params.centerId = resList.value[0].id === 1 ? '' : resList.value[0].id;
      params.crmDeptId = resList.value[1].id.toString().includes('-1') ? '' : resList.value[1].id;
    }

    const res = await ProjectService.getAccessProjectDocNum(params);
    return res;
  };

  return {
    // 数据
    columns,
    yearMonthData,
    orgOriginList,
    orgList,
    resList,
    selectMonth,
    loading,

    // 核心方法
    initData,

    // 数据方法
    getMonthColumns,
    getOrgData,
    resetData,
    getAccessData,
  };
}
