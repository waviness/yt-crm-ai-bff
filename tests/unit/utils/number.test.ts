import { describe, it, expect } from 'vitest';
import {
  formatValue,
  formatPercent,
  calculateTotal,
  calculateCompletionRate,
  getColorClass,
  formatNumber,
  formatWithUnit,
  arithmetic,
} from '@/utils/number';
import { NumberFormatType } from '@/types/formatters';

// ============ formatValue ============
describe('formatValue', () => {
  it('null 返回 "-"', () => {
    expect(formatValue(null)).toBe('-');
  });

  it('undefined 返回 "-"', () => {
    expect(formatValue(undefined)).toBe('-');
  });

  it('正常数值，默认单位和精度', () => {
    expect(formatValue(123.456)).toBe('123.46万元');
  });

  it('自定义单位', () => {
    expect(formatValue(50, '元')).toBe('50.00元');
  });

  it('自定义精度', () => {
    expect(formatValue(3.14159, '万元', 4)).toBe('3.1416万元');
  });

  it('0 值', () => {
    expect(formatValue(0)).toBe('0.00万元');
  });

  it('负数', () => {
    expect(formatValue(-99.9)).toBe('-99.90万元');
  });
});

// ============ formatPercent ============
describe('formatPercent', () => {
  it('null 返回 "-"', () => {
    expect(formatPercent(null)).toBe('-');
  });

  it('undefined 返回 "-"', () => {
    expect(formatPercent(undefined)).toBe('-');
  });

  it('正常数值', () => {
    expect(formatPercent(75.678)).toBe('75.68%');
  });

  it('0 值', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });

  it('自定义精度', () => {
    expect(formatPercent(33.3333, 1)).toBe('33.3%');
  });
});

// ============ calculateTotal ============
describe('calculateTotal', () => {
  it('两个数字相加', () => {
    expect(calculateTotal(1.1, 2.2)).toBeCloseTo(3.3);
  });

  it('字符串数字相加', () => {
    expect(calculateTotal('10', '20')).toBe(30);
  });

  it('非法字符串视为 0', () => {
    expect(calculateTotal('abc', 5)).toBe(5);
  });

  it('自定义精度', () => {
    const result = calculateTotal(1.123456789, 2.987654321, 2);
    expect(result).toBe(4.11);
  });
});

// ============ calculateCompletionRate ============
describe('calculateCompletionRate', () => {
  it('正常计算完成率', () => {
    expect(calculateCompletionRate(50, 100)).toBe(50);
  });

  it('超过 100%', () => {
    expect(calculateCompletionRate(150, 100)).toBe(150);
  });

  it('目标为 0 返回 0', () => {
    expect(calculateCompletionRate(50, 0)).toBe(0);
  });

  it('实际为 0 返回 0', () => {
    expect(calculateCompletionRate(0, 100)).toBe(0);
  });

  it('自定义精度', () => {
    expect(calculateCompletionRate(1, 3, 4)).toBe(33.3333);
  });
});

// ============ getColorClass ============
describe('getColorClass', () => {
  it('"--" 返回 color-default', () => {
    expect(getColorClass('--')).toBe('color-default');
  });

  it('undefined 返回 color-default', () => {
    expect(getColorClass(undefined)).toBe('color-default');
  });

  it('正数返回 color-success', () => {
    expect(getColorClass(10)).toBe('color-success');
  });

  it('0 返回 color-success', () => {
    expect(getColorClass(0)).toBe('color-success');
  });

  it('负数返回 color-danger', () => {
    expect(getColorClass(-5)).toBe('color-danger');
  });

  it('字符串正数 "12.5%" 返回 color-success', () => {
    expect(getColorClass('12.5%')).toBe('color-success');
  });

  it('字符串负数 "-3.2%" 返回 color-danger', () => {
    expect(getColorClass('-3.2%')).toBe('color-danger');
  });

  it('带加号 "+5" 返回 color-success', () => {
    expect(getColorClass('+5')).toBe('color-success');
  });

  it('带千位分隔符 "1,234" 返回 color-success', () => {
    expect(getColorClass('1,234')).toBe('color-success');
  });

  it('非数字字符串返回 color-default', () => {
    expect(getColorClass('abc')).toBe('color-default');
  });
});

// ============ formatNumber ============
describe('formatNumber', () => {
  describe('RAW 类型', () => {
    it('基本数值格式化', () => {
      expect(formatNumber(12345.678, { type: NumberFormatType.RAW })).toBe('12,345.68');
    });

    it('自定义小数位数', () => {
      expect(formatNumber(1234, { type: NumberFormatType.RAW, digits: 0 })).toBe('1,234');
    });

    it('无千位分隔符', () => {
      expect(
        formatNumber(12345, { type: NumberFormatType.RAW, useThousandSeparator: false })
      ).toBe('12345.00');
    });

    it('null 被 Number() 转为 0，正常格式化', () => {
      // Number(null) === 0，不触发 NaN 分支
      expect(formatNumber(null, { type: NumberFormatType.RAW })).toBe('0.00');
    });

    it('自定义占位符', () => {
      expect(formatNumber(undefined, { type: NumberFormatType.RAW, placeholder: 'N/A' })).toBe(
        'N/A'
      );
    });
  });

  describe('PERCENTAGE 类型', () => {
    it('0.5 → "+50.00%"', () => {
      expect(formatNumber(0.5, { type: NumberFormatType.PERCENTAGE })).toBe('+50.00%');
    });

    it('负数 -0.1 → "-10.00%"', () => {
      expect(formatNumber(-0.1, { type: NumberFormatType.PERCENTAGE })).toBe('-10.00%');
    });

    it('不显示百分号', () => {
      const result = formatNumber(0.5, {
        type: NumberFormatType.PERCENTAGE,
        showPercentage: false,
      });
      expect(result).toBe('+50.00');
    });

    it('不显示加号', () => {
      const result = formatNumber(0.5, {
        type: NumberFormatType.PERCENTAGE,
        showPlusSign: false,
      });
      expect(result).toBe('50.00%');
    });
  });

  describe('CURRENCY 类型', () => {
    it('小于万 → 元', () => {
      expect(formatNumber(999, { type: NumberFormatType.CURRENCY })).toBe('999.00元');
    });

    it('万级 → 万元', () => {
      expect(formatNumber(12345, { type: NumberFormatType.CURRENCY })).toBe('1.23万元');
    });

    it('亿级 → 亿元', () => {
      expect(formatNumber(123456789, { type: NumberFormatType.CURRENCY })).toBe('1.23亿元');
    });

    it('不需要单位', () => {
      expect(formatNumber(12345, { type: NumberFormatType.CURRENCY, needUnit: false })).toBe(
        '1.23'
      );
    });
  });

  describe('TEN_THOUSAND_YUAN 类型', () => {
    it('10000 → "1.00"', () => {
      const result = formatNumber(10000, {
        type: NumberFormatType.TEN_THOUSAND_YUAN,
        showPlusSign: false,
      });
      expect(result).toBe('+1.00');
    });

    it('NaN 输入返回占位符', () => {
      expect(formatNumber('abc', { type: NumberFormatType.TEN_THOUSAND_YUAN })).toBe('--');
    });
  });
});

// ============ formatWithUnit ============
describe('formatWithUnit', () => {
  it('小额 → 元', () => {
    expect(formatWithUnit(500, 2, true, ',')).toBe('500.00元');
  });

  it('万元级别', () => {
    expect(formatWithUnit(50000, 2, true, ',')).toBe('5.00万元');
  });

  it('亿元级别', () => {
    expect(formatWithUnit(200000000, 2, true, ',')).toBe('2.00亿元');
  });

  it('负值 → 万元', () => {
    expect(formatWithUnit(-50000, 2, true, ',')).toBe('-5.00万元');
  });

  it('不需要单位', () => {
    expect(formatWithUnit(50000, 2, false, ',')).toBe('5.00');
  });
});

// ============ arithmetic ============
describe('arithmetic', () => {
  describe('add', () => {
    it('整数加法', () => {
      expect(arithmetic.add(1, 2)).toBe(3);
    });

    it('浮点数精确加法 (0.1 + 0.2)', () => {
      expect(arithmetic.add(0.1, 0.2)).toBe(0.3);
    });

    it('字符串数字', () => {
      expect(arithmetic.add('10', '20')).toBe(30);
    });
  });

  describe('subtract', () => {
    it('整数减法', () => {
      expect(arithmetic.subtract(10, 3)).toBe(7);
    });

    it('浮点数精确减法 (0.3 - 0.1)', () => {
      expect(arithmetic.subtract(0.3, 0.1)).toBe(0.2);
    });
  });

  describe('multiply', () => {
    it('整数乘法', () => {
      expect(arithmetic.multiply(3, 4)).toBe(12);
    });

    it('浮点数精确乘法 (0.1 * 0.2)', () => {
      expect(arithmetic.multiply(0.1, 0.2)).toBe(0.02);
    });
  });

  describe('divide', () => {
    it('正常除法', () => {
      expect(arithmetic.divide(10, 2)).toBe(5);
    });

    it('除以 0 返回 "--"', () => {
      expect(arithmetic.divide(10, 0)).toBe('--');
    });

    it('字符串 "0" 也返回 "--"', () => {
      expect(arithmetic.divide(10, '0')).toBe('--');
    });
  });

  describe('sum', () => {
    it('数组求和', () => {
      expect(arithmetic.sum([1, 2, 3, 4, 5])).toBe(15);
    });

    it('包含字符串数字', () => {
      expect(arithmetic.sum(['1', '2', '3'])).toBe(6);
    });

    it('空数组返回 0', () => {
      expect(arithmetic.sum([])).toBe(0);
    });

    it('包含无效值抛出错误', () => {
      expect(() => arithmetic.sum(['abc'])).toThrow();
    });
  });
});

