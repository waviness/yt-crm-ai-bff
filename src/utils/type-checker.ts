type BasicType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'undefined'
  | 'symbol'
  | 'bigint'
  | 'function'
  | 'object';

class TypeChecker {
  /**
   * 获取值的类型
   * @param value 任意值
   * @returns 类型字符串
   */
  getType(value: any): string {
    // 处理 null 和 undefined
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';

    // 使用 Object.prototype.toString 获取准确类型
    const typeStr = Object.prototype.toString.call(value);
    return typeStr.slice(8, -1).toLowerCase();
  }

  /**
   * 检查是否为指定类型
   * @param value 任意值
   * @param type 类型
   * @returns 是否为指定类型
   */
  isType(value: any, type: BasicType | string): boolean {
    return this.getType(value) === type.toLowerCase();
  }

  /**
   * 检查是否为字符串
   * @param value 任意值
   * @returns 是否为字符串
   */
  isString(value: any): value is string {
    return this.isType(value, 'string');
  }

  /**
   * 检查是否为数字
   * @param value 任意值
   * @returns 是否为数字
   */
  isNumber(value: any): value is number {
    return this.isType(value, 'number') && !isNaN(value);
  }

  /**
   * 检查是否为布尔值
   * @param value 任意值
   * @returns 是否为布尔值
   */
  isBoolean(value: any): value is boolean {
    return this.isType(value, 'boolean');
  }

  /**
   * 检查是否为函数
   * @param value 任意值
   * @returns 是否为函数
   */
  isFunction(value: any): value is Function {
    return this.isType(value, 'function');
  }

  /**
   * 检查是否为对象
   * @param value 任意值
   * @returns 是否为对象
   */
  isObject(value: any): value is Record<string, any> {
    return this.isType(value, 'object') && value !== null && !Array.isArray(value);
  }

  /**
   * 检查是否为数组
   * @param value 任意值
   * @returns 是否为数组
   */
  isArray(value: any): value is any[] {
    return Array.isArray(value);
  }

  /**
   * 检查是否为日期对象
   * @param value 任意值
   * @returns 是否为日期对象
   */
  isDate(value: any): value is Date {
    return value instanceof Date && !isNaN(value.getTime());
  }

  /**
   * 检查是否为正则表达式
   * @param value 任意值
   * @returns 是否为正则表达式
   */
  isRegExp(value: any): value is RegExp {
    return value instanceof RegExp;
  }

  /**
   * 检查是否为 Promise 对象
   * @param value 任意值
   * @returns 是否为 Promise 对象
   */
  isPromise(value: any): value is Promise<any> {
    return (
      value instanceof Promise ||
      (value !== null &&
        typeof value === 'object' &&
        typeof (value as Promise<any>).then === 'function')
    );
  }

  /**
   * 检查是否为空（null、undefined、空字符串、空数组、空对象）
   * @param value 任意值
   * @returns 是否为空
   */
  isEmpty(value: any): boolean {
    if (value === null || value === undefined) return true;

    if (this.isString(value) || this.isArray(value)) {
      return value.length === 0;
    }

    if (this.isObject(value)) {
      return Object.keys(value).length === 0;
    }

    return false;
  }

  /**
   * 检查是否为有效值（非 null、非 undefined、非空字符串）
   * @param value 任意值
   * @returns 是否为有效值
   */
  isDefined(value: any): boolean {
    return value !== null && value !== undefined && (!this.isString(value) || value !== '');
  }

  /**
   * 检查是否为整数
   * @param value 任意值
   * @returns 是否为整数
   */
  isInteger(value: any): value is number {
    return this.isNumber(value) && Number.isInteger(value);
  }

  /**
   * 检查是否为浮点数
   * @param value 任意值
   * @returns 是否为浮点数
   */
  isFloat(value: any): value is number {
    return this.isNumber(value) && !Number.isInteger(value);
  }

  /**
   * 检查是否为正数
   * @param value 任意值
   * @returns 是否为正数
   */
  isPositive(value: any): boolean {
    return this.isNumber(value) && value > 0;
  }

  /**
   * 检查是否为负数
   * @param value 任意值
   * @returns 是否为负数
   */
  isNegative(value: any): boolean {
    return this.isNumber(value) && value < 0;
  }

  /**
   * 检查是否为零
   * @param value 任意值
   * @returns 是否为零
   */
  isZero(value: any): boolean {
    return this.isNumber(value) && value === 0;
  }

  /**
   * 检查是否为偶数
   * @param value 任意值
   * @returns 是否为偶数
   */
  isEven(value: any): boolean {
    return this.isInteger(value) && value % 2 === 0;
  }

  /**
   * 检查是否为奇数
   * @param value 任意值
   * @returns 是否为奇数
   */
  isOdd(value: any): boolean {
    return this.isInteger(value) && value % 2 !== 0;
  }

  /**
   * 检查是否为数组且包含元素
   * @param value 任意值
   * @returns 是否为非空数组
   */
  isNonEmptyArray(value: any): value is any[] {
    return this.isArray(value) && value.length > 0;
  }

  /**
   * 检查是否为纯对象（通过 {} 或 new Object() 创建）
   * @param value 任意值
   * @returns 是否为纯对象
   */
  isPlainObject(value: any): value is Record<string, any> {
    if (!this.isObject(value)) return false;

    // 检查构造函数
    if (value.constructor === undefined) return true;

    if (!this.isFunction(value.constructor)) return false;

    // 检查原型链
    return value.constructor.prototype.hasOwnProperty('isPrototypeOf');
  }
}

// 创建默认实例
const typeChecker = new TypeChecker();

export default typeChecker;
export { TypeChecker };
export type { BasicType };
