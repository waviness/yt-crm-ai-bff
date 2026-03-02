import { describe, it, expect } from 'vitest';
import { getPermissions, getAuthorities, hasAuthority } from '@/utils/permission';
import type { Permission } from '@/utils/permission';

// ============ 测试数据 ============
const mockTree: Permission[] = [
  {
    pmsType: 1,
    keyword: 'menu_dashboard',
    pmsName: '工作台',
    parentName: '系统',
    children: [
      { pmsType: 4, keyword: 'btn_export', pmsName: '导出', parentName: '工作台' },
      { pmsType: 4, keyword: 'btn_view', pmsName: '查看', parentName: '工作台' },
      { pmsType: 2, keyword: 'data_scope', pmsName: '数据范围', parentName: '工作台' },
    ],
  },
  {
    pmsType: 1,
    keyword: 'menu_customer',
    pmsName: '客户管理',
    parentName: '系统',
    children: [
      { pmsType: 4, keyword: 'btn_add', pmsName: '新增', parentName: '客户管理' },
    ],
  },
];

// ============ getPermissions ============
describe('getPermissions', () => {
  it('提取 pmsType 为 1 和 4 的权限 keyword', () => {
    const result = getPermissions(mockTree);
    expect(result).toContain('menu_dashboard');
    expect(result).toContain('menu_customer');
    expect(result).toContain('btn_export');
    expect(result).toContain('btn_view');
    expect(result).toContain('btn_add');
  });

  it('不包含 pmsType 为 2 的权限', () => {
    const result = getPermissions(mockTree);
    expect(result).not.toContain('data_scope');
  });

  it('空数组返回空数组', () => {
    expect(getPermissions([])).toEqual([]);
  });

  it('单层无 children 的节点', () => {
    const flat: Permission[] = [
      { pmsType: 1, keyword: 'menu_a', pmsName: 'A', parentName: '' },
      { pmsType: 4, keyword: 'btn_a', pmsName: 'a', parentName: 'A' },
      { pmsType: 3, keyword: 'skip_me', pmsName: 'skip', parentName: '' },
    ];
    expect(getPermissions(flat)).toEqual(['menu_a', 'btn_a']);
  });

  it('深层嵌套', () => {
    const deep: Permission[] = [
      {
        pmsType: 1,
        keyword: 'level1',
        pmsName: 'L1',
        parentName: '',
        children: [
          {
            pmsType: 1,
            keyword: 'level2',
            pmsName: 'L2',
            parentName: 'L1',
            children: [
              { pmsType: 4, keyword: 'level3_btn', pmsName: 'L3', parentName: 'L2' },
            ],
          },
        ],
      },
    ];
    expect(getPermissions(deep)).toEqual(['level1', 'level2', 'level3_btn']);
  });

  it('返回结果数量正确', () => {
    const result = getPermissions(mockTree);
    // 1(menu_dashboard) + 4(btn_export) + 4(btn_view) + 1(menu_customer) + 4(btn_add) = 5
    expect(result).toHaveLength(5);
  });
});

// ============ getAuthorities ============
describe('getAuthorities', () => {
  it('获取指定菜单下的按钮权限（默认 type=4）', () => {
    const result = getAuthorities(mockTree, '工作台');
    expect(result).toHaveLength(2);
    expect(result.map(r => r.keyword)).toEqual(['btn_export', 'btn_view']);
  });

  it('不匹配的菜单返回空数组', () => {
    expect(getAuthorities(mockTree, '不存在的菜单')).toEqual([]);
  });

  it('自定义 type 参数', () => {
    const result = getAuthorities(mockTree, '工作台', [], 2);
    expect(result).toHaveLength(1);
    expect(result[0].keyword).toBe('data_scope');
  });

  it('空权限树返回空数组', () => {
    expect(getAuthorities([], '工作台')).toEqual([]);
  });

  it('不同菜单下的权限互不影响', () => {
    const dashboard = getAuthorities(mockTree, '工作台');
    const customer = getAuthorities(mockTree, '客户管理');
    expect(dashboard).toHaveLength(2);
    expect(customer).toHaveLength(1);
    expect(customer[0].keyword).toBe('btn_add');
  });
});

// ============ hasAuthority ============
describe('hasAuthority', () => {
  it('存在的权限返回 true', () => {
    expect(hasAuthority(mockTree, '工作台', '导出')).toBe(true);
    expect(hasAuthority(mockTree, '工作台', '查看')).toBe(true);
    expect(hasAuthority(mockTree, '客户管理', '新增')).toBe(true);
  });

  it('不存在的权限名返回 false', () => {
    expect(hasAuthority(mockTree, '工作台', '删除')).toBe(false);
  });

  it('不存在的菜单返回 false', () => {
    expect(hasAuthority(mockTree, '不存在', '导出')).toBe(false);
  });

  it('空权限树返回 false', () => {
    expect(hasAuthority([], '工作台', '导出')).toBe(false);
  });

  it('type 不匹配时返回 false', () => {
    // '数据范围' 的 pmsType 是 2，默认查找 type=4，所以找不到
    expect(hasAuthority(mockTree, '工作台', '数据范围')).toBe(false);
    // 指定 type=2 就能找到
    expect(hasAuthority(mockTree, '工作台', '数据范围', 2)).toBe(true);
  });
});

