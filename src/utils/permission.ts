export interface Permission {
  pmsType: number;
  keyword: string;
  pmsName?: string;
  parentName?: string;
  children?: Permission[];
  [key: string]: any; // 允许其他属性
}

export const getPermissions = (array: Permission[]) => {
  const permissions = [] as string[];

  const helper = (array: Permission[]) => {
    array.forEach(item => {
      if ([1, 4].includes(item.pmsType)) {
        permissions.push(item.keyword);
      }
      if (!typeChecker.isEmpty(item.children)) {
        helper(item.children!);
      }
    });
  };

  helper(array);

  return permissions;
};

export const hasPermission = (permission: string) => {
  const permissions = cache.get('user').permissions;
  return permissions.includes(permission);
};

/**
 * 获取指定菜单下的权限列表
 * @param authorityList 权限树列表
 * @param menuValue 菜单名称（parentName）
 * @param result 结果数组（用于递归）
 * @param type 权限类型，默认为 4
 * @returns 匹配的权限对象数组
 */
export const getAuthorities = (
  authorityList: Permission[],
  menuValue: string,
  result: Permission[] = [],
  type: number = 4
): Permission[] => {
  for (let index = 0; index < authorityList.length; index++) {
    const element = authorityList[index];
    if (element.children && element.children.length > 0) {
      getAuthorities(element.children, menuValue, result, type);
    } else {
      if (element.pmsType === type && element.parentName === menuValue) {
        result.push(element);
      }
    }
  }
  return result;
};

/**
 * 检查指定菜单下是否存在某个权限名称
 * @param authorityList 权限树列表
 * @param menuValue 菜单名称（parentName）
 * @param authorityName 权限名称（pmsName）
 * @param type 权限类型，默认为 4
 * @returns 是否存在该权限
 */
export const hasAuthority = (
  authorityList: Permission[],
  menuValue: string,
  authorityName: string,
  type: number = 4
): boolean => {
  const authorities = getAuthorities(authorityList, menuValue, [], type);
  return authorities.some(item => item.pmsName === authorityName);
};
