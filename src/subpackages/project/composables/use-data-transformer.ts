/**
 * 数据转换通用逻辑 composable
 * 用于处理各种数据转换和格式化操作
 *
 * @example
 * ```typescript
 * const {
 *   transformProjectList,
 *   transformRankList,
 *   formatDisplayText
 * } = useDataTransformer();
 *
 * // 转换项目列表
 * const transformedList = transformProjectList(originalList);
 *
 * // 格式化显示文本
 * const displayText = formatDisplayText(resList);
 * ```
 */
import type { ProjectInfo, RankData, OrgInfo } from '../types';

export function useDataTransformer() {
  /**
   * 转换项目列表数据
   * @param list 原始项目列表
   * @param addUnlimited 是否添加"不限"选项
   * @returns 转换后的项目列表
   */
  const transformProjectList = (list: any[], addUnlimited: boolean = true) => {
    return list.map((item: any) => {
      const transformed: ProjectInfo = {
        projectId: item.projectId || item.id || '',
        projectName: item.projectName || item.name || item.text || '',
        ...item,
      };

      if (addUnlimited && item.productVOList) {
        transformed.children = [
          {
            id: `${item.projectId}-1`,
            text: '不限',
            projectId: `${item.projectId}-1`,
            projectName: '不限',
          },
          ...item.productVOList.map((pro: any) => ({
            id: pro.productId,
            text: pro.productName,
            projectId: pro.productId,
            projectName: pro.productName,
            ...pro,
          })),
        ];
      }

      return transformed;
    });
  };

  /**
   * 转换排名列表数据
   * @param list 原始排名列表
   * @param listType 列表类型
   * @returns 转换后的排名列表
   */
  const transformRankList = (list: any[], listType: number) => {
    return list.map((item: any) => {
      const transformed: RankData = {
        id: listType === 1 ? item.centerId : listType === 2 ? item.deptId : item.salerId,
        name: listType === 1 ? item.centerName : listType === 2 ? item.deptName : item.salerName,
        text: listType === 1 ? item.centerName : listType === 2 ? item.deptName : item.salerName,
        accessNum: item.accessNum,
        accessRate: item.accessRate,
        completeRate: item.completeRate,
        targetCompleted: item.targetCompleted,
        centerId: item.centerId,
        centerName: item.centerName,
        deptId: item.deptId,
        deptName: item.deptName,
        salerId: item.salerId,
        salerName: item.salerName,
        ...item,
      };

      return transformed;
    });
  };

  /**
   * 格式化显示文本
   * @param resList 结果列表
   * @param showUserSelect 是否显示用户选择
   * @returns 格式化后的显示文本
   */
  const formatDisplayText = (resList: OrgInfo[], showUserSelect: boolean = false) => {
    if (!resList.length) return '';

    if (!showUserSelect) {
      return `${resList[0]?.name || ''}/${resList[1]?.name || ''}${resList[1] && resList[1].id === -1 ? '部门' : ''}`;
    }

    return `${resList[0]?.name || ''}/${resList[1]?.name || ''}${resList[1] && resList[1].id === -1 ? '部门' : ''}/${Array.isArray(resList[2]) ? resList[2].map((item: any) => item.userName).join('、') : ''}${Array.isArray(resList[2]) && resList[2][0]?.userId === -1 ? '业务员' : ''}`;
  };

  /**
   * 添加"全部"选项到列表开头
   * @param list 原始列表
   * @param allText 全部选项的文本
   * @returns 添加全部选项后的列表
   */
  const addAllOption = (list: any[], allText: string = '全部') => {
    return [
      {
        projectId: '',
        projectName: allText,
        text: allText,
        id: '',
        name: allText,
        ...(list.length > 0 && list[0].children ? { children: [] } : {}),
      },
      ...list,
    ];
  };

  /**
   * 处理列表项的数据结构
   * @param item 原始列表项
   * @param listType 列表类型
   * @returns 处理后的列表项
   */
  const processListItem = (item: any, listType: number) => {
    return {
      ...item,
      id: listType === 1 ? item.centerId : listType === 2 ? item.deptId : item.salerId,
      name: listType === 1 ? item.centerName : listType === 2 ? item.deptName : item.salerName,
    };
  };

  return {
    transformProjectList,
    transformRankList,
    formatDisplayText,
    addAllOption,
    processListItem,
  };
}
