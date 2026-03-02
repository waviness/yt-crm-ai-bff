import { describe, it, expect } from 'vitest';
import typeChecker from '@/utils/type-checker';

// ============ getType ============
describe('typeChecker.getType', () => {
  it('null → "null"', () => {
    expect(typeChecker.getType(null)).toBe('null');
  });

  it('undefined → "undefined"', () => {
    expect(typeChecker.getType(undefined)).toBe('undefined');
  });

  it('string → "string"', () => {
    expect(typeChecker.getType('hello')).toBe('string');
  });

  it('number → "number"', () => {
    expect(typeChecker.getType(42)).toBe('number');
  });

  it('boolean → "boolean"', () => {
    expect(typeChecker.getType(true)).toBe('boolean');
  });

  it('array → "array"', () => {
    expect(typeChecker.getType([1, 2])).toBe('array');
  });

  it('object → "object"', () => {
    expect(typeChecker.getType({ a: 1 })).toBe('object');
  });

  it('function → "function"', () => {
    expect(typeChecker.getType(() => {})).toBe('function');
  });

  it('Date → "date"', () => {
    expect(typeChecker.getType(new Date())).toBe('date');
  });

  it('RegExp → "regexp"', () => {
    expect(typeChecker.getType(/test/)).toBe('regexp');
  });
});

// ============ isString ============
describe('typeChecker.isString', () => {
  it('"hello" → true', () => {
    expect(typeChecker.isString('hello')).toBe(true);
  });

  it('"" (空字符串) → true', () => {
    expect(typeChecker.isString('')).toBe(true);
  });

  it('数字 → false', () => {
    expect(typeChecker.isString(123)).toBe(false);
  });
});

// ============ isNumber ============
describe('typeChecker.isNumber', () => {
  it('42 → true', () => {
    expect(typeChecker.isNumber(42)).toBe(true);
  });

  it('0 → true', () => {
    expect(typeChecker.isNumber(0)).toBe(true);
  });

  it('NaN → false', () => {
    expect(typeChecker.isNumber(NaN)).toBe(false);
  });

  it('字符串 "42" → false', () => {
    expect(typeChecker.isNumber('42')).toBe(false);
  });
});

// ============ isBoolean ============
describe('typeChecker.isBoolean', () => {
  it('true → true', () => {
    expect(typeChecker.isBoolean(true)).toBe(true);
  });

  it('false → true', () => {
    expect(typeChecker.isBoolean(false)).toBe(true);
  });

  it('0 → false', () => {
    expect(typeChecker.isBoolean(0)).toBe(false);
  });
});

// ============ isFunction ============
describe('typeChecker.isFunction', () => {
  it('箭头函数 → true', () => {
    expect(typeChecker.isFunction(() => {})).toBe(true);
  });

  it('null → false', () => {
    expect(typeChecker.isFunction(null)).toBe(false);
  });
});

// ============ isObject ============
describe('typeChecker.isObject', () => {
  it('普通对象 → true', () => {
    expect(typeChecker.isObject({ a: 1 })).toBe(true);
  });

  it('空对象 → true', () => {
    expect(typeChecker.isObject({})).toBe(true);
  });

  it('null → false', () => {
    expect(typeChecker.isObject(null)).toBe(false);
  });

  it('数组 → false', () => {
    expect(typeChecker.isObject([1, 2])).toBe(false);
  });
});

// ============ isArray ============
describe('typeChecker.isArray', () => {
  it('数组 → true', () => {
    expect(typeChecker.isArray([1, 2, 3])).toBe(true);
  });

  it('空数组 → true', () => {
    expect(typeChecker.isArray([])).toBe(true);
  });

  it('对象 → false', () => {
    expect(typeChecker.isArray({})).toBe(false);
  });
});

// ============ isDate ============
describe('typeChecker.isDate', () => {
  it('有效 Date → true', () => {
    expect(typeChecker.isDate(new Date())).toBe(true);
  });

  it('无效 Date → false', () => {
    expect(typeChecker.isDate(new Date('invalid'))).toBe(false);
  });

  it('字符串 → false', () => {
    expect(typeChecker.isDate('2024-01-01')).toBe(false);
  });
});

// ============ isEmpty ============
describe('typeChecker.isEmpty', () => {
  it('null → true', () => {
    expect(typeChecker.isEmpty(null)).toBe(true);
  });

  it('undefined → true', () => {
    expect(typeChecker.isEmpty(undefined)).toBe(true);
  });

  it('"" → true', () => {
    expect(typeChecker.isEmpty('')).toBe(true);
  });

  it('[] → true', () => {
    expect(typeChecker.isEmpty([])).toBe(true);
  });

  it('{} → true', () => {
    expect(typeChecker.isEmpty({})).toBe(true);
  });

  it('"hello" → false', () => {
    expect(typeChecker.isEmpty('hello')).toBe(false);
  });

  it('[1] → false', () => {
    expect(typeChecker.isEmpty([1])).toBe(false);
  });

  it('{ a: 1 } → false', () => {
    expect(typeChecker.isEmpty({ a: 1 })).toBe(false);
  });

  it('0 → false (数字不算空)', () => {
    expect(typeChecker.isEmpty(0)).toBe(false);
  });

  it('false → false (布尔值不算空)', () => {
    expect(typeChecker.isEmpty(false)).toBe(false);
  });
});

// ============ isDefined ============
describe('typeChecker.isDefined', () => {
  it('有效字符串 → true', () => {
    expect(typeChecker.isDefined('hello')).toBe(true);
  });

  it('null → false', () => {
    expect(typeChecker.isDefined(null)).toBe(false);
  });

  it('undefined → false', () => {
    expect(typeChecker.isDefined(undefined)).toBe(false);
  });

  it('"" → false', () => {
    expect(typeChecker.isDefined('')).toBe(false);
  });

  it('0 → true', () => {
    expect(typeChecker.isDefined(0)).toBe(true);
  });
});

// ============ 数字相关 ============
describe('typeChecker 数字工具方法', () => {
  it('isInteger: 整数 → true', () => {
    expect(typeChecker.isInteger(5)).toBe(true);
  });

  it('isInteger: 浮点数 → false', () => {
    expect(typeChecker.isInteger(5.5)).toBe(false);
  });

  it('isFloat: 浮点数 → true', () => {
    expect(typeChecker.isFloat(3.14)).toBe(true);
  });

  it('isFloat: 整数 → false', () => {
    expect(typeChecker.isFloat(3)).toBe(false);
  });

  it('isPositive: 正数 → true', () => {
    expect(typeChecker.isPositive(1)).toBe(true);
  });

  it('isPositive: 0 → false', () => {
    expect(typeChecker.isPositive(0)).toBe(false);
  });

  it('isNegative: 负数 → true', () => {
    expect(typeChecker.isNegative(-1)).toBe(true);
  });

  it('isZero: 0 → true', () => {
    expect(typeChecker.isZero(0)).toBe(true);
  });

  it('isEven: 偶数 → true', () => {
    expect(typeChecker.isEven(4)).toBe(true);
  });

  it('isEven: 奇数 → false', () => {
    expect(typeChecker.isEven(3)).toBe(false);
  });

  it('isOdd: 奇数 → true', () => {
    expect(typeChecker.isOdd(3)).toBe(true);
  });

  it('isOdd: 偶数 → false', () => {
    expect(typeChecker.isOdd(4)).toBe(false);
  });
});

// ============ isNonEmptyArray ============
describe('typeChecker.isNonEmptyArray', () => {
  it('[1] → true', () => {
    expect(typeChecker.isNonEmptyArray([1])).toBe(true);
  });

  it('[] → false', () => {
    expect(typeChecker.isNonEmptyArray([])).toBe(false);
  });

  it('非数组 → false', () => {
    expect(typeChecker.isNonEmptyArray('abc')).toBe(false);
  });
});

// ============ isPlainObject ============
describe('typeChecker.isPlainObject', () => {
  it('字面量对象 → true', () => {
    expect(typeChecker.isPlainObject({ a: 1 })).toBe(true);
  });

  it('new Object() → true', () => {
    expect(typeChecker.isPlainObject(new Object())).toBe(true);
  });

  it('数组 → false', () => {
    expect(typeChecker.isPlainObject([])).toBe(false);
  });

  it('null → false', () => {
    expect(typeChecker.isPlainObject(null)).toBe(false);
  });
});

// ============ isPromise ============
describe('typeChecker.isPromise', () => {
  it('Promise 实例 → true', () => {
    expect(typeChecker.isPromise(Promise.resolve())).toBe(true);
  });

  it('含 then 方法的对象 → true', () => {
    expect(typeChecker.isPromise({ then: () => {} })).toBe(true);
  });

  it('普通对象 → false', () => {
    expect(typeChecker.isPromise({})).toBe(false);
  });
});

// ============ isRegExp ============
describe('typeChecker.isRegExp', () => {
  it('正则表达式 → true', () => {
    expect(typeChecker.isRegExp(/test/)).toBe(true);
  });

  it('new RegExp → true', () => {
    expect(typeChecker.isRegExp(new RegExp('test'))).toBe(true);
  });

  it('字符串 → false', () => {
    expect(typeChecker.isRegExp('/test/')).toBe(false);
  });
});

