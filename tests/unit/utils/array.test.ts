import { describe, it, expect } from 'vitest';
import { findNameById, deepClone } from '@/utils/array';

// ============ findNameById ============
describe('findNameById', () => {
  const options = [
    { id: 1, name: '选项A' },
    { id: 2, name: '选项B' },
    { id: 3, name: '选项C' },
  ] as const;

  it('找到匹配项返回名称', () => {
    expect(findNameById(1, options)).toBe('选项A');
  });

  it('找到另一个匹配项', () => {
    expect(findNameById(3, options)).toBe('选项C');
  });

  it('未找到返回空字符串', () => {
    expect(findNameById(999, options)).toBe('');
  });

  it('id 为 0 返回空字符串', () => {
    expect(findNameById(0, options)).toBe('');
  });

  it('options 不是数组返回空字符串', () => {
    expect(findNameById(1, null as any)).toBe('');
  });
});

// ============ deepClone ============
describe('deepClone', () => {
  it('深拷贝普通对象', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    expect(cloned).toEqual(obj);
    expect(cloned).not.toBe(obj);
    expect(cloned.b).not.toBe(obj.b);
  });

  it('修改克隆不影响原对象', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    cloned.b.c = 999;
    expect(obj.b.c).toBe(2);
  });

  it('深拷贝数组', () => {
    const arr = [1, [2, 3], { a: 4 }];
    const cloned = deepClone(arr);
    expect(cloned).toEqual(arr);
    expect(cloned).not.toBe(arr);
  });

  it('null 返回 null', () => {
    expect(deepClone(null)).toBe(null);
  });

  it('基础类型直接返回', () => {
    expect(deepClone(42)).toBe(42);
    expect(deepClone('hello')).toBe('hello');
    expect(deepClone(true)).toBe(true);
  });

  it('嵌套对象完全独立', () => {
    const obj = {
      level1: {
        level2: {
          level3: 'deep',
        },
      },
    };
    const cloned = deepClone(obj);
    cloned.level1.level2.level3 = 'modified';
    expect(obj.level1.level2.level3).toBe('deep');
  });
});

