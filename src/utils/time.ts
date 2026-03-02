/**
 * 时间管理工具类
 *
 * 提供了丰富的日期处理功能，包括日期格式化、相对时间计算、日期范围生成、
 * 时间计算、时区转换、日期比较和工作日计算等。
 *
 * 特别针对uniapp平台进行了优化：
 * 1. 处理iOS平台对日期字符串解析的兼容性问题
 * 2. 提供统一的日期处理接口，屏蔽平台差异
 * 3. 支持多种输入格式：Date对象、时间戳、日期字符串
 */

// 常用日期格式常量定义
const DATE_FORMATS = {
  /** ISO标准日期格式：yyyy-MM-dd */
  ISO_DATE: 'yyyy-MM-dd',
  /** ISO标准日期时间格式：yyyy-MM-dd HH:mm:ss */
  ISO_DATETIME: 'yyyy-MM-dd HH:mm:ss',
  /** 中文日期格式：yyyy年MM月dd日 */
  CN_DATE: 'yyyy年MM月dd日',
  /** 中文日期时间格式：yyyy年MM月dd日 HH:mm:ss */
  CN_DATETIME: 'yyyy年MM月dd日 HH:mm:ss',
  /** 美式日期格式：MM/dd/yyyy */
  US_DATE: 'MM/dd/yyyy',
  /** 美式日期时间格式：MM/dd/yyyy HH:mm:ss */
  US_DATETIME: 'MM/dd/yyyy HH:mm:ss',
  /** 简短日期格式：yy-M-d */
  SHORT_DATE: 'yy-M-d',
  /** 简短日期时间格式：yy-M-d H:m */
  SHORT_DATETIME: 'yy-M-d H:m',
  /** 完整日期格式（包含星期）：yyyy-MM-dd EEEE */
  FULL_DATE: 'yyyy-MM-dd EEEE',
  /** 周日期格式：yyyy-MM-dd EE */
  WEEK_DATE: 'yyyy-MM-dd EE',
  /** 时间格式：HH:mm:ss */
  TIME: 'HH:mm:ss',
  /** 简短时间格式：H:m:s */
  SHORT_TIME: 'H:m:s',
  /** 简短日期格式：MM-dd */
  SHORT_DAY: 'MM-dd',
  /** 年 */
  YEAR: 'yyyy',
} as const;

/**
 * 时间管理工具类
 *
 * 提供了完整的日期时间处理功能，包括：
 * - 日期格式化和解析
 * - 相对时间计算（如"5分钟前"）
 * - 日期范围生成
 * - 时间计算（加减年、月、日等）
 * - 日期比较
 * - 工作日计算
 * - 时区转换
 */
class TimeManager {
  /** 常用日期格式常量 */
  public readonly FORMATS = DATE_FORMATS;

  /**
   * 格式化日期时间
   *
   * 将传入的日期对象、时间戳或日期字符串格式化为指定格式的字符串。
   * 支持多种占位符：
   * - yyyy: 四位年份
   * - MM: 两位月份
   * - dd: 两位日期
   * - HH: 两位小时
   * - mm: 两位分钟
   * - ss: 两位秒数
   * - EEEE: 完整星期名称（如"星期一"）
   * - EE: 简写星期名称（如"周一"）
   *
   * @param date - 日期对象、时间戳（数字）或日期字符串
   * @param format - 格式字符串，默认为 'yyyy-MM-dd HH:mm:ss'
   * @returns 格式化后的日期时间字符串
   *
   * @example
   * ```typescript
   * time.format(new Date()); // "2023-05-15 14:30:25"
   * time.format(new Date(), 'yyyy年MM月dd日'); // "2023年05月15日"
   * time.format(1684131025000, 'MM/dd/yyyy'); // "05/15/2023"
   * ```
   */
  format(date: Date | number | string, format = 'yyyy-MM-dd HH:mm:ss'): string {
    // 处理空值情况
    if (date === null || date === undefined) {
      return '';
    }

    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      // 时间戳
      d = new Date(date);
    } else if (typeof date === 'string') {
      // 字符串日期
      // 处理uniapp中iOS平台对日期字符串的兼容性问题
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 检查日期是否有效
    if (isNaN(d.getTime())) {
      return '';
    }

    // 提取日期时间各部分
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const minute = d.getMinutes();
    const second = d.getSeconds();

    // 按照格式字符串进行替换
    return (
      format
        .replace('yyyy', year.toString())
        .replace('MM', month.toString().padStart(2, '0'))
        .replace('dd', day.toString().padStart(2, '0'))
        .replace('HH', hour.toString().padStart(2, '0'))
        .replace('mm', minute.toString().padStart(2, '0'))
        .replace('ss', second.toString().padStart(2, '0'))
        // 支持星期格式
        .replace('EEEE', this.getWeekdayName(d, 'full'))
        .replace('EE', this.getWeekdayName(d, 'short'))
    );
  }

  /**
   * 获取星期名称
   *
   * 根据日期获取对应的星期名称
   *
   * @param date - 日期对象
   * @param type - 星期名称类型，'full'为完整名称，'short'为简写名称
   * @returns 星期名称
   */
  private getWeekdayName(date: Date, type: 'full' | 'short'): string {
    // 定义星期名称映射
    const weekdays = {
      full: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      short: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    };

    // 根据星期几(0-6)获取对应名称
    return weekdays[type][date.getDay()];
  }

  /**
   * 获取相对时间描述
   *
   * 根据传入的日期获取相对于当前时间的描述，如"刚刚"、"5分钟前"等
   *
   * @param date - 日期对象、时间戳（数字）或日期字符串
   * @returns 相对时间描述
   *
   * @example
   * ```typescript
   * time.getRelativeTime(new Date(Date.now() - 30 * 1000)); // "刚刚"
   * time.getRelativeTime(new Date(Date.now() - 5 * 60 * 1000)); // "5分钟前"
   * time.getRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000)); // "3小时前"
   * ```
   */
  getRelativeTime(date: Date | number | string): string {
    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 计算时间差（毫秒）
    const now = new Date().getTime();
    const diff = now - d.getTime();

    // 转换为各种时间单位
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // 根据时间差返回相应的描述
    if (seconds < 30) {
      return '刚刚';
    } else if (seconds < 60) {
      return `${seconds}秒前`;
    } else if (minutes < 60) {
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      // 超过7天显示具体日期
      return this.format(d, 'yyyy-MM-dd');
    }
  }

  /**
   * 获取日期范围
   *
   * 生成从开始日期到结束日期的日期数组（包含起止日期）
   *
   * @param startDate - 开始日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param endDate - 结束日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 日期范围数组
   *
   * @example
   * ```typescript
   * const dates = time.getDateRange('2023-05-01', '2023-05-03');
   * // [Mon May 01 2023, Tue May 02 2023, Wed May 03 2023]
   * ```
   */
  getDateRange(startDate: Date | number | string, endDate: Date | number | string): Date[] {
    // 根据输入类型标准化为Date对象
    let start: Date;
    let end: Date;

    if (typeof startDate === 'number') {
      start = new Date(startDate);
    } else if (typeof startDate === 'string') {
      const normalizedDate = startDate.replace(/-/g, '/');
      start = new Date(normalizedDate);
    } else {
      start = startDate;
    }

    if (typeof endDate === 'number') {
      end = new Date(endDate);
    } else if (typeof endDate === 'string') {
      const normalizedDate = endDate.replace(/-/g, '/');
      end = new Date(normalizedDate);
    } else {
      end = endDate;
    }

    // 存储结果的数组
    const dates: Date[] = [];
    // 当前处理的日期
    const current = new Date(start);

    // 重置时间部分，只比较日期
    current.setHours(0, 0, 0, 0);
    const endTime = new Date(end).setHours(0, 0, 0, 0);

    // 循环生成日期范围
    while (current.getTime() <= endTime) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * 添加时间
   *
   * 在基准日期上增加指定单位的时间量
   *
   * @param date - 基准日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param amount - 增加的数量（可以为负数表示减少）
   * @param unit - 单位，支持 'year'、'month'、'day'、'hour'、'minute'、'second'
   * @returns 新的日期对象
   *
   * @example
   * ```typescript
   * const nextWeek = time.add(new Date(), 7, 'day');
   * const nextYear = time.add(new Date(), 1, 'year');
   * const anHourAgo = time.add(new Date(), -1, 'hour');
   * ```
   */
  add(
    date: Date | number | string,
    amount: number,
    unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
  ): Date {
    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = new Date(date);
    }

    // 创建结果日期对象
    const result = new Date(d);

    // 根据单位调整日期
    switch (unit) {
      case 'year':
        result.setFullYear(result.getFullYear() + amount);
        break;
      case 'month':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'day':
        result.setDate(result.getDate() + amount);
        break;
      case 'hour':
        result.setHours(result.getHours() + amount);
        break;
      case 'minute':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'second':
        result.setSeconds(result.getSeconds() + amount);
        break;
    }

    return result;
  }

  /**
   * 计算两个日期之间的差值
   *
   * 计算两个日期之间指定单位的差值
   *
   * @param startDate - 开始日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param endDate - 结束日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param unit - 单位，默认为 'day'，支持 'day'、'hour'、'minute'、'second'
   * @returns 差值
   *
   * @example
   * ```typescript
   * const days = time.diff('2023-05-01', '2023-05-10', 'day'); // 9
   * const hours = time.diff('2023-05-01 10:00', '2023-05-01 15:30', 'hour'); // 5
   * ```
   */
  diff(
    startDate: Date | number | string,
    endDate: Date | number | string,
    unit: 'day' | 'hour' | 'minute' | 'second' = 'day'
  ): number {
    // 根据输入类型标准化为Date对象
    let start: Date;
    let end: Date;

    if (typeof startDate === 'number') {
      start = new Date(startDate);
    } else if (typeof startDate === 'string') {
      const normalizedDate = startDate.replace(/-/g, '/');
      start = new Date(normalizedDate);
    } else {
      start = startDate;
    }

    if (typeof endDate === 'number') {
      end = new Date(endDate);
    } else if (typeof endDate === 'string') {
      const normalizedDate = endDate.replace(/-/g, '/');
      end = new Date(normalizedDate);
    } else {
      end = endDate;
    }

    // 计算毫秒差
    const diffMs = end.getTime() - start.getTime();

    // 根据单位换算为相应值
    switch (unit) {
      case 'day':
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      case 'hour':
        return Math.floor(diffMs / (1000 * 60 * 60));
      case 'minute':
        return Math.floor(diffMs / (1000 * 60));
      case 'second':
        return Math.floor(diffMs / 1000);
      default:
        return diffMs;
    }
  }

  /**
   * 判断是否为闰年
   *
   * 根据格里高利历规则判断指定年份是否为闰年
   *
   * @param year - 年份
   * @returns 是否为闰年
   *
   * @example
   * ```typescript
   * time.isLeapYear(2024); // true
   * time.isLeapYear(2023); // false
   * ```
   */
  isLeapYear(year: number): boolean {
    // 闰年规则：能被4整除但不能被100整除，或者能被400整除的年份是闰年
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  /**
   * 获取指定月份的天数
   *
   * 获取指定年月的天数
   *
   * @param year - 年份
   * @param month - 月份 (1-12)
   * @returns 天数
   *
   * @example
   * ```typescript
   * time.getDaysInMonth(2023, 2); // 28 (非闰年2月)
   * time.getDaysInMonth(2024, 2); // 29 (闰年2月)
   * time.getDaysInMonth(2023, 1); // 31 (1月)
   * ```
   */
  getDaysInMonth(year: number, month: number): number {
    // 特殊处理2月的闰年情况
    if (month === 2) {
      return this.isLeapYear(year) ? 29 : 28;
    }

    // 其他月份的天数（索引对应月份-1）
    const daysInMonth = [31, -1, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return daysInMonth[month - 1];
  }

  /**
   * 获取当前时间戳
   *
   * 获取当前时间戳（毫秒），兼容uniapp平台
   *
   * @returns 当前时间戳（毫秒）
   *
   * @example
   * ```typescript
   * const timestamp = time.now(); // 1684131025000
   * ```
   */
  now(): number {
    // 直接使用 Date.now() 或 new Date().getTime()，不需要检查系统信息
    return Date.now();
  }

  /**
   * 格式化时间为uniapp支持的格式
   *
   * 将日期格式化为 uniapp 推荐的格式（yyyy/MM/dd HH:mm:ss）
   *
   * @param date - 日期对象、时间戳或日期字符串
   * @returns 格式化后的时间字符串 (yyyy/MM/dd HH:mm:ss)
   *
   * @example
   * ```typescript
   * time.formatForUniapp(new Date()); // "2023/05/15 14:30:25"
   * ```
   */
  formatForUniapp(date: Date | number | string): string {
    return this.format(date, 'yyyy/MM/dd HH:mm:ss');
  }

  // ==================== 新增功能 ====================

  /**
   * 时区转换
   *
   * 将日期转换到指定时区。目前支持UTC时区转换。
   *
   * @param date - 日期对象、时间戳或日期字符串
   * @param timezone - 目标时区标识符，目前支持 'UTC'
   * @returns 转换后的日期对象
   *
   * @example
   * ```typescript
   * const utcDate = time.convertTimezone(new Date(), 'UTC');
   * ```
   */
  convertTimezone(date: Date | number | string, timezone: string): Date {
    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 注意：由于JavaScript在不同环境对Intl API的支持不同，这里提供基础实现
    // 在实际项目中，可能需要引入moment-timezone等库来处理复杂的时区转换
    if (timezone === 'UTC') {
      // UTC时区转换：当前时间加上时区偏移量
      return new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    }

    // 默认返回原日期
    return new Date(d);
  }

  /**
   * 判断日期是否在指定日期之前
   *
   * 判断日期是否在指定日期之前
   *
   * @param date - 要比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param compareDate - 用于比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 是否在指定日期之前
   *
   * @example
   * ```typescript
   * time.isBefore('2023-05-01', '2023-05-10'); // true
   * time.isBefore(new Date(), new Date()); // false
   * ```
   */
  isBefore(date: Date | number | string, compareDate: Date | number | string): boolean {
    // 根据输入类型标准化为Date对象
    let d: Date;
    let cd: Date;

    // 处理第一个日期参数
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 处理比较日期参数
    if (typeof compareDate === 'number') {
      cd = new Date(compareDate);
    } else if (typeof compareDate === 'string') {
      const normalizedDate = compareDate.replace(/-/g, '/');
      cd = new Date(normalizedDate);
    } else {
      cd = compareDate;
    }

    // 通过时间戳比较
    return d.getTime() < cd.getTime();
  }

  /**
   * 判断日期是否在指定日期之后
   *
   * 判断日期是否在指定日期之后
   *
   * @param date - 要比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param compareDate - 用于比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 是否在指定日期之后
   *
   * @example
   * ```typescript
   * time.isAfter('2023-05-10', '2023-05-01'); // true
   * time.isAfter(new Date(), new Date()); // false
   * ```
   */
  isAfter(date: Date | number | string, compareDate: Date | number | string): boolean {
    // 根据输入类型标准化为Date对象
    let d: Date;
    let cd: Date;

    // 处理第一个日期参数
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 处理比较日期参数
    if (typeof compareDate === 'number') {
      cd = new Date(compareDate);
    } else if (typeof compareDate === 'string') {
      const normalizedDate = compareDate.replace(/-/g, '/');
      cd = new Date(normalizedDate);
    } else {
      cd = compareDate;
    }

    // 通过时间戳比较
    return d.getTime() > cd.getTime();
  }

  /**
   * 判断两个日期是否相同
   *
   * 判断两个日期是否相同，支持不同精度的比较
   *
   * @param date - 要比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param compareDate - 用于比较的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param precision - 比较精度，默认为 'millisecond'，支持 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond'
   * @returns 是否相同
   *
   * @example
   * ```typescript
   * time.isSame('2023-05-01', '2023-05-01'); // true
   * time.isSame('2023-05-01 10:00:00', '2023-05-01 15:00:00', 'day'); // true
   * time.isSame('2023-05-01 10:00:00', '2023-05-01 15:00:00', 'hour'); // false
   * ```
   */
  isSame(
    date: Date | number | string,
    compareDate: Date | number | string,
    precision:
      | 'year'
      | 'month'
      | 'day'
      | 'hour'
      | 'minute'
      | 'second'
      | 'millisecond' = 'millisecond'
  ): boolean {
    // 根据输入类型标准化为Date对象
    let d: Date;
    let cd: Date;

    // 处理第一个日期参数
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 处理比较日期参数
    if (typeof compareDate === 'number') {
      cd = new Date(compareDate);
    } else if (typeof compareDate === 'string') {
      const normalizedDate = compareDate.replace(/-/g, '/');
      cd = new Date(normalizedDate);
    } else {
      cd = compareDate;
    }

    // 根据精度进行比较
    switch (precision) {
      case 'year':
        return d.getFullYear() === cd.getFullYear();
      case 'month':
        return d.getFullYear() === cd.getFullYear() && d.getMonth() === cd.getMonth();
      case 'day':
        return (
          d.getFullYear() === cd.getFullYear() &&
          d.getMonth() === cd.getMonth() &&
          d.getDate() === cd.getDate()
        );
      case 'hour':
        return (
          d.getFullYear() === cd.getFullYear() &&
          d.getMonth() === cd.getMonth() &&
          d.getDate() === cd.getDate() &&
          d.getHours() === cd.getHours()
        );
      case 'minute':
        return (
          d.getFullYear() === cd.getFullYear() &&
          d.getMonth() === cd.getMonth() &&
          d.getDate() === cd.getDate() &&
          d.getHours() === cd.getHours() &&
          d.getMinutes() === cd.getMinutes()
        );
      case 'second':
        return (
          d.getFullYear() === cd.getFullYear() &&
          d.getMonth() === cd.getMonth() &&
          d.getDate() === cd.getDate() &&
          d.getHours() === cd.getHours() &&
          d.getMinutes() === cd.getMinutes() &&
          d.getSeconds() === cd.getSeconds()
        );
      case 'millisecond':
      default:
        return d.getTime() === cd.getTime();
    }
  }

  /**
   * 计算两个日期之间的工作日数量
   *
   * 计算两个日期之间的工作日数量（周一到周五）
   *
   * @param startDate - 开始日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param endDate - 结束日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 工作日数量
   *
   * @example
   * ```typescript
   * const workingDays = time.getWorkingDays('2023-05-01', '2023-05-07'); // 5
   * ```
   */
  getWorkingDays(startDate: Date | number | string, endDate: Date | number | string): number {
    // 根据输入类型标准化为Date对象
    let start: Date;
    let end: Date;

    if (typeof startDate === 'number') {
      start = new Date(startDate);
    } else if (typeof startDate === 'string') {
      const normalizedDate = startDate.replace(/-/g, '/');
      start = new Date(normalizedDate);
    } else {
      start = startDate;
    }

    if (typeof endDate === 'number') {
      end = new Date(endDate);
    } else if (typeof endDate === 'string') {
      const normalizedDate = endDate.replace(/-/g, '/');
      end = new Date(normalizedDate);
    } else {
      end = endDate;
    }

    // 确保开始日期小于结束日期
    if (start.getTime() > end.getTime()) {
      [start, end] = [end, start];
    }

    // 工作日计数
    let count = 0;
    // 当前处理的日期
    const current = new Date(start);

    // 重置时间部分
    current.setHours(0, 0, 0, 0);
    const endTime = new Date(end).setHours(0, 0, 0, 0);

    // 遍历日期范围，统计工作日
    while (current.getTime() <= endTime) {
      // 获取星期几 (0=周日, 1=周一, ..., 6=周六)
      const dayOfWeek = current.getDay();
      // 周一到周五为工作日
      if (dayOfWeek > 0 && dayOfWeek < 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  }

  /**
   * 判断指定日期是否为工作日
   *
   * 判断指定日期是否为工作日（周一到周五）
   *
   * @param date - 要判断的日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 是否为工作日
   *
   * @example
   * ```typescript
   * time.isWorkingDay(new Date()); // true 或 false（取决于当天是否为工作日）
   * ```
   */
  isWorkingDay(date: Date | number | string): boolean {
    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = date;
    }

    // 获取星期几 (0=周日, 1=周一, ..., 6=周六)
    const dayOfWeek = d.getDay();
    // 周一到周五为工作日 (0=周日, 1=周一, ..., 6=周六)
    return dayOfWeek > 0 && dayOfWeek < 6;
  }

  /**
   * 获取指定日期所在周的指定星期几
   *
   * 获取指定日期所在周的指定星期几的日期
   *
   * @param date - 基准日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param weekday - 目标星期几，0=周日, 1=周一, ..., 6=周六
   * @returns 目标星期几的日期对象
   *
   * @example
   * ```typescript
   * // 获取本周六的日期
   * const saturday = time.getWeekdayOfWeek(new Date(), 6);
   * // 获取本周一的日期
   * const monday = time.getWeekdayOfWeek(new Date(), 1);
   * ```
   */
  getWeekdayOfWeek(date: Date | number | string, weekday: number): Date {
    // 根据输入类型标准化为Date对象
    let d: Date;
    if (typeof date === 'number') {
      d = new Date(date);
    } else if (typeof date === 'string') {
      const normalizedDate = date.replace(/-/g, '/');
      d = new Date(normalizedDate);
    } else {
      d = new Date(date);
    }

    // 确保 weekday 在有效范围内 (0-6)
    const targetWeekday = weekday % 7;
    if (targetWeekday < 0) {
      throw new Error('weekday must be between 0 (Sunday) and 6 (Saturday)');
    }

    // 获取当前日期是星期几 (0=周日, 1=周一, ..., 6=周六)
    const currentDay = d.getDay();
    // 计算需要调整的天数
    const daysToAdd = targetWeekday - currentDay;
    // 创建结果日期对象
    const result = new Date(d);
    result.setDate(result.getDate() + daysToAdd);

    return result;
  }

  /**
   * 获取指定年份的所有指定星期几的日期
   *
   * 获取指定年份中所有指定星期几的日期列表
   *
   * @param year - 年份
   * @param weekday - 目标星期几，0=周日, 1=周一, ..., 6=周六
   * @param format - 返回格式，默认为 'yyyy-MM-dd'，传入 null 则返回 Date 对象数组
   * @returns 日期字符串数组或 Date 对象数组
   *
   * @example
   * ```typescript
   * // 获取2024年所有周六的日期字符串
   * const saturdays = time.getWeekdaysInYear(2024, 6);
   * // 获取2024年所有周一的 Date 对象
   * const mondays = time.getWeekdaysInYear(2024, 1, null);
   * ```
   */
  getWeekdaysInYear(
    year: number,
    weekday: number,
    format: string | null = 'yyyy-MM-dd'
  ): string[] | Date[] {
    // 确保 weekday 在有效范围内 (0-6)
    const targetWeekday = weekday % 7;
    if (targetWeekday < 0) {
      throw new Error('weekday must be between 0 (Sunday) and 6 (Saturday)');
    }

    const result: (string | Date)[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    // 找到第一个目标星期几
    const firstWeekday = this.getWeekdayOfWeek(startDate, targetWeekday);
    // 如果第一个目标星期几在年份开始之前，则从下一个开始
    let currentDate = new Date(firstWeekday);
    if (currentDate < startDate) {
      currentDate = this.add(currentDate, 7, 'day');
    }

    // 遍历所有目标星期几
    while (currentDate <= endDate) {
      if (format === null) {
        result.push(new Date(currentDate));
      } else {
        result.push(this.format(currentDate, format));
      }
      currentDate = this.add(currentDate, 7, 'day');
    }

    return result as string[] | Date[];
  }

  /**
   * 获取指定日期的小时时间戳
   *
   * 获取指定日期的小时时间戳
   *
   * @param date - 日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @returns 小时时间戳
   */
  getHourTimestamp(date: Date | number | string): number {
    const temp = new Date(date); // 复制传入的时间对象，避免修改原对象
    temp.setMinutes(0, 0, 0);
    return temp.getTime();
  }

  /**
   * 获取日期段中的每一天
   *
   * 生成从开始日期到结束日期的每一天的格式化日期字符串数组（包含起止日期）
   *
   * @param startDate - 开始日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param endDate - 结束日期，可以是 Date 对象、时间戳（数字）或日期字符串
   * @param format - 日期格式，默认为 'yyyy-MM-dd'
   * @returns 格式化的日期字符串数组
   *
   * @example
   * ```typescript
   * const dates = time.getAllDate('2023-05-01', '2023-05-03');
   * // ['2023-05-01', '2023-05-02', '2023-05-03']
   * ```
   */
  getAllDate(
    startDate: Date | number | string,
    endDate: Date | number | string,
    format = 'yyyy-MM-dd'
  ): string[] {
    // 获取日期范围的Date对象数组
    const dateRange = this.getDateRange(startDate, endDate);

    // 将Date对象数组转换为格式化的日期字符串数组
    return dateRange.map(date => this.format(date, format));
  }
}

// 创建默认实例
const time = new TimeManager();

export default time;
export { TimeManager };
