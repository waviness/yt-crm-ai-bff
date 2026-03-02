import { describe, it, expect } from 'vitest';
import converter from '@/utils/converter';

// ============ toNumber ============
describe('converter.toNumber', () => {
  it('数字直接返回', () => {
    expect(converter.toNumber(42)).toBe(42);
  });

  it('字符串 "3.14" → 3.14', () => {
    expect(converter.toNumber('3.14')).toBe(3.14);
  });

  it('非法字符串返回默认值 0', () => {
    expect(converter.toNumber('abc')).toBe(0);
  });

  it('自定义默认值', () => {
    expect(converter.toNumber('abc', -1)).toBe(-1);
  });

  it('true → 1', () => {
    expect(converter.toNumber(true)).toBe(1);
  });

  it('false → 0', () => {
    expect(converter.toNumber(false)).toBe(0);
  });

  it('null → 默认值', () => {
    expect(converter.toNumber(null)).toBe(0);
  });

  it('undefined → 默认值', () => {
    expect(converter.toNumber(undefined)).toBe(0);
  });

  it('Date 对象 — isObject 判定为 false，返回默认值', () => {
    // Date 的 getType 是 "date" 而非 "object"，所以不进入 isObject 分支
    const d = new Date(2024, 0, 1);
    expect(converter.toNumber(d)).toBe(0);
  });

  it('普通对象返回默认值', () => {
    expect(converter.toNumber({ a: 1 })).toBe(0);
  });
});

// ============ toString ============
describe('converter.toString', () => {
  it('字符串直接返回', () => {
    expect(converter.toString('hello')).toBe('hello');
  });

  it('数字 → 字符串', () => {
    expect(converter.toString(42)).toBe('42');
  });

  it('true → "true"', () => {
    expect(converter.toString(true)).toBe('true');
  });

  it('false → "false"', () => {
    expect(converter.toString(false)).toBe('false');
  });

  it('null → 默认空字符串', () => {
    expect(converter.toString(null)).toBe('');
  });

  it('undefined → 默认空字符串', () => {
    expect(converter.toString(undefined)).toBe('');
  });

  it('自定义默认值', () => {
    expect(converter.toString(null, 'N/A')).toBe('N/A');
  });

  it('数组 → JSON 字符串', () => {
    expect(converter.toString([1, 2, 3])).toBe('[1,2,3]');
  });

  it('对象 → JSON 字符串', () => {
    expect(converter.toString({ a: 1 })).toBe('{"a":1}');
  });
});

// ============ toArray ============
describe('converter.toArray', () => {
  it('数组直接返回', () => {
    expect(converter.toArray([1, 2])).toEqual([1, 2]);
  });

  it('null → 默认空数组', () => {
    expect(converter.toArray(null)).toEqual([]);
  });

  it('undefined → 默认空数组', () => {
    expect(converter.toArray(undefined)).toEqual([]);
  });

  it('自定义默认值', () => {
    expect(converter.toArray(null, [0])).toEqual([0]);
  });

  it('非数组值 → 包装为单元素数组', () => {
    expect(converter.toArray('hello')).toEqual(['hello']);
  });

  it('数字 → [数字]', () => {
    expect(converter.toArray(42)).toEqual([42]);
  });
});

// ============ toObject ============
describe('converter.toObject', () => {
  it('对象直接返回', () => {
    expect(converter.toObject({ a: 1 })).toEqual({ a: 1 });
  });

  it('null → 默认空对象', () => {
    expect(converter.toObject(null)).toEqual({});
  });

  it('undefined → 默认空对象', () => {
    expect(converter.toObject(undefined)).toEqual({});
  });

  it('自定义默认值', () => {
    expect(converter.toObject(null, { x: 0 })).toEqual({ x: 0 });
  });

  it('数组 → 索引对象', () => {
    expect(converter.toObject(['a', 'b'])).toEqual({ '0': 'a', '1': 'b' });
  });

  it('其他类型 → { value: ... }', () => {
    expect(converter.toObject('hello')).toEqual({ value: 'hello' });
  });

  it('数字 → { value: 数字 }', () => {
    expect(converter.toObject(42)).toEqual({ value: 42 });
  });
});

