import { describe, it, expect } from 'vitest';
import time, { TimeManager } from '@/utils/time';

// ============ format ============
describe('time.format', () => {
  it('Date 对象格式化 - 默认格式', () => {
    const d = new Date(2024, 0, 15, 9, 30, 45); // 2024-01-15 09:30:45
    expect(time.format(d)).toBe('2024-01-15 09:30:45');
  });

  it('自定义格式 yyyy年MM月dd日', () => {
    const d = new Date(2024, 5, 1); // 2024-06-01
    expect(time.format(d, 'yyyy年MM月dd日')).toBe('2024年06月01日');
  });

  it('时间戳格式化', () => {
    const ts = new Date(2024, 0, 1, 0, 0, 0).getTime();
    expect(time.format(ts, 'yyyy-MM-dd')).toBe('2024-01-01');
  });

  it('字符串日期格式化', () => {
    expect(time.format('2024-03-15', 'yyyy/MM/dd')).toBe('2024/03/15');
  });

  it('无效日期返回空字符串', () => {
    expect(time.format('invalid-date')).toBe('');
  });

  it('null 返回空字符串', () => {
    expect(time.format(null as any)).toBe('');
  });

  it('MM-dd 格式', () => {
    const d = new Date(2024, 11, 25);
    expect(time.format(d, 'MM-dd')).toBe('12-25');
  });

  it('HH:mm:ss 格式', () => {
    const d = new Date(2024, 0, 1, 8, 5, 3);
    expect(time.format(d, 'HH:mm:ss')).toBe('08:05:03');
  });
});

// ============ isLeapYear ============
describe('time.isLeapYear', () => {
  it('2024 是闰年', () => {
    expect(time.isLeapYear(2024)).toBe(true);
  });

  it('2023 不是闰年', () => {
    expect(time.isLeapYear(2023)).toBe(false);
  });

  it('2000 是闰年 (能被400整除)', () => {
    expect(time.isLeapYear(2000)).toBe(true);
  });

  it('1900 不是闰年 (能被100整除但不能被400整除)', () => {
    expect(time.isLeapYear(1900)).toBe(false);
  });
});

// ============ getDaysInMonth ============
describe('time.getDaysInMonth', () => {
  it('1月 → 31天', () => {
    expect(time.getDaysInMonth(2024, 1)).toBe(31);
  });

  it('闰年2月 → 29天', () => {
    expect(time.getDaysInMonth(2024, 2)).toBe(29);
  });

  it('非闰年2月 → 28天', () => {
    expect(time.getDaysInMonth(2023, 2)).toBe(28);
  });

  it('4月 → 30天', () => {
    expect(time.getDaysInMonth(2024, 4)).toBe(30);
  });

  it('12月 → 31天', () => {
    expect(time.getDaysInMonth(2024, 12)).toBe(31);
  });
});

// ============ add ============
describe('time.add', () => {
  it('加 1 天', () => {
    const d = new Date(2024, 0, 15);
    const result = time.add(d, 1, 'day');
    expect(result.getDate()).toBe(16);
  });

  it('加 1 月', () => {
    const d = new Date(2024, 0, 15);
    const result = time.add(d, 1, 'month');
    expect(result.getMonth()).toBe(1); // February
  });

  it('加 1 年', () => {
    const d = new Date(2024, 0, 15);
    const result = time.add(d, 1, 'year');
    expect(result.getFullYear()).toBe(2025);
  });

  it('减 1 天（负数）', () => {
    const d = new Date(2024, 0, 15);
    const result = time.add(d, -1, 'day');
    expect(result.getDate()).toBe(14);
  });

  it('加 2 小时', () => {
    const d = new Date(2024, 0, 1, 10, 0, 0);
    const result = time.add(d, 2, 'hour');
    expect(result.getHours()).toBe(12);
  });

  it('加 30 分钟', () => {
    const d = new Date(2024, 0, 1, 10, 0, 0);
    const result = time.add(d, 30, 'minute');
    expect(result.getMinutes()).toBe(30);
  });

  it('字符串日期输入', () => {
    const result = time.add('2024-01-15', 5, 'day');
    expect(time.format(result, 'yyyy-MM-dd')).toBe('2024-01-20');
  });

  it('不修改原始日期', () => {
    const d = new Date(2024, 0, 15);
    time.add(d, 10, 'day');
    expect(d.getDate()).toBe(15); // 原始日期不变
  });
});

// ============ diff ============
describe('time.diff', () => {
  it('相差 9 天', () => {
    expect(time.diff('2024-01-01', '2024-01-10', 'day')).toBe(9);
  });

  it('相差 24 小时', () => {
    expect(time.diff('2024-01-01 00:00:00', '2024-01-02 00:00:00', 'hour')).toBe(24);
  });

  it('相差 60 分钟', () => {
    expect(time.diff('2024-01-01 10:00:00', '2024-01-01 11:00:00', 'minute')).toBe(60);
  });

  it('相差 0 天（同一天）', () => {
    expect(time.diff('2024-06-15', '2024-06-15', 'day')).toBe(0);
  });

  it('默认单位为 day', () => {
    expect(time.diff('2024-01-01', '2024-01-04')).toBe(3);
  });
});

// ============ isBefore / isAfter ============
describe('time.isBefore & isAfter', () => {
  it('较早日期 isBefore 较晚日期', () => {
    expect(time.isBefore('2024-01-01', '2024-06-01')).toBe(true);
  });

  it('较晚日期不 isBefore 较早日期', () => {
    expect(time.isBefore('2024-06-01', '2024-01-01')).toBe(false);
  });

  it('相同日期 isBefore → false', () => {
    expect(time.isBefore('2024-01-01', '2024-01-01')).toBe(false);
  });

  it('较晚日期 isAfter 较早日期', () => {
    expect(time.isAfter('2024-06-01', '2024-01-01')).toBe(true);
  });

  it('相同日期 isAfter → false', () => {
    expect(time.isAfter('2024-01-01', '2024-01-01')).toBe(false);
  });
});

// ============ isSame ============
describe('time.isSame', () => {
  it('相同日期 → true', () => {
    expect(time.isSame('2024-06-15', '2024-06-15', 'day')).toBe(true);
  });

  it('同年不同日，精度 year → true', () => {
    expect(time.isSame('2024-01-01', '2024-12-31', 'year')).toBe(true);
  });

  it('同月不同日，精度 month → true', () => {
    expect(time.isSame('2024-06-01', '2024-06-30', 'month')).toBe(true);
  });

  it('不同小时，精度 hour → false', () => {
    expect(time.isSame('2024-06-15 10:00:00', '2024-06-15 11:00:00', 'hour')).toBe(false);
  });

  it('相同小时，精度 hour → true', () => {
    expect(time.isSame('2024-06-15 10:30:00', '2024-06-15 10:45:00', 'hour')).toBe(true);
  });
});

// ============ isWorkingDay ============
describe('time.isWorkingDay', () => {
  it('周一是工作日', () => {
    // 2024-01-15 是周一
    expect(time.isWorkingDay('2024-01-15')).toBe(true);
  });

  it('周五是工作日', () => {
    // 2024-01-19 是周五
    expect(time.isWorkingDay('2024-01-19')).toBe(true);
  });

  it('周六不是工作日', () => {
    // 2024-01-20 是周六
    expect(time.isWorkingDay('2024-01-20')).toBe(false);
  });

  it('周日不是工作日', () => {
    // 2024-01-21 是周日
    expect(time.isWorkingDay('2024-01-21')).toBe(false);
  });
});

// ============ getWorkingDays ============
describe('time.getWorkingDays', () => {
  it('一周（周一到周日）有 5 个工作日', () => {
    // 2024-01-15(周一) 到 2024-01-21(周日)
    expect(time.getWorkingDays('2024-01-15', '2024-01-21')).toBe(5);
  });

  it('同一天工作日 → 1', () => {
    expect(time.getWorkingDays('2024-01-15', '2024-01-15')).toBe(1);
  });

  it('同一天周末 → 0', () => {
    expect(time.getWorkingDays('2024-01-20', '2024-01-20')).toBe(0);
  });

  it('反转日期也能正常工作', () => {
    expect(time.getWorkingDays('2024-01-21', '2024-01-15')).toBe(5);
  });
});

// ============ getDateRange ============
describe('time.getDateRange', () => {
  it('返回日期范围数组', () => {
    const range = time.getDateRange('2024-01-01', '2024-01-03');
    expect(range.length).toBe(3);
  });

  it('同一天返回 1 个元素', () => {
    const range = time.getDateRange('2024-06-15', '2024-06-15');
    expect(range.length).toBe(1);
  });
});

// ============ getAllDate ============
describe('time.getAllDate', () => {
  it('返回格式化日期字符串数组', () => {
    const dates = time.getAllDate('2024-01-01', '2024-01-03');
    expect(dates).toEqual(['2024-01-01', '2024-01-02', '2024-01-03']);
  });

  it('自定义格式', () => {
    const dates = time.getAllDate('2024-01-01', '2024-01-02', 'MM/dd');
    expect(dates).toEqual(['01/01', '01/02']);
  });
});

// ============ formatForUniapp ============
describe('time.formatForUniapp', () => {
  it('输出 yyyy/MM/dd HH:mm:ss 格式', () => {
    const d = new Date(2024, 0, 15, 9, 30, 0);
    expect(time.formatForUniapp(d)).toBe('2024/01/15 09:30:00');
  });
});

// ============ FORMATS 常量 ============
describe('time.FORMATS', () => {
  it('ISO_DATE 常量正确', () => {
    expect(time.FORMATS.ISO_DATE).toBe('yyyy-MM-dd');
  });

  it('ISO_DATETIME 常量正确', () => {
    expect(time.FORMATS.ISO_DATETIME).toBe('yyyy-MM-dd HH:mm:ss');
  });
});

// ============ 实例化 ============
describe('TimeManager', () => {
  it('可以创建新实例', () => {
    const tm = new TimeManager();
    expect(tm).toBeInstanceOf(TimeManager);
    expect(tm.format(new Date(2024, 0, 1), 'yyyy')).toBe('2024');
  });
});

