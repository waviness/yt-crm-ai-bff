/**
 * 类型转换工具类
 */
import typeChecker from './type-checker';

class Converter {
  /**
   * 将任意类型的值转换为数字类型。
   * @param value 需要转换的值，可以是任意类型
   * @param defaultValue 转换失败时返回的默认值，默认为0
   * @returns 转换后的数字。对于数字类型直接返回；字符串解析为浮点数，失败则返回默认值；
   * 布尔值true返回1，false返回0；null/undefined返回默认值；Date对象返回时间戳；其他对象返回默认值
   */
  toNumber(value: any, defaultValue: number = 0): number {
    // 处理数字类型，直接返回原值
    if (typeChecker.isNumber(value)) {
      return value;
    }

    // 处理字符串类型，尝试解析为浮点数，失败返回默认值
    if (typeChecker.isString(value)) {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }

    // 处理布尔类型，转换为1或0
    if (typeChecker.isBoolean(value)) {
      return value ? 1 : 0;
    }

    // 处理null或undefined，返回默认值
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // 处理对象类型，Date实例返回时间戳，其他返回默认值
    if (typeChecker.isObject(value)) {
      if (typeChecker.isDate(value)) {
        return value.getTime();
      }
      return defaultValue;
    }

    // 未处理的类型（symbol、function等），返回默认值
    return defaultValue;
  }

  /**
   * 将任意类型的值转换为字符串类型。
   * @param value 需要转换的值，可以是任意类型
   * @param defaultValue 转换失败时返回的默认值，默认为空字符串
   * @returns 转换后的字符串。字符串类型直接返回；数字类型转换为字符串；
   * 布尔值true返回'true'，false返回'false'；null/undefined返回默认值；
   * 数组和对象使用JSON.stringify转换；其他类型调用toString方法
   */
  toString(value: any, defaultValue: string = ''): string {
    // 处理字符串类型，直接返回原值
    if (typeChecker.isString(value)) {
      return value;
    }

    // 处理数字类型，转换为字符串
    if (typeChecker.isNumber(value)) {
      return value.toString();
    }

    // 处理布尔类型，转换为'true'或'false'
    if (typeChecker.isBoolean(value)) {
      return value ? 'true' : 'false';
    }

    // 处理null或undefined，返回默认值
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // 处理数组和对象，使用JSON.stringify转换
    if (typeChecker.isArray(value) || typeChecker.isObject(value)) {
      try {
        return JSON.stringify(value);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_) {
        return defaultValue;
      }
    }

    // 其他类型调用String方法
    try {
      return String(value);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return defaultValue;
    }
  }

  /**
   * 将任意类型的值转换为数组类型。
   * @param value 需要转换的值，可以是任意类型
   * @param defaultValue 转换失败时返回的默认值，默认为空数组
   * @returns 转换后的数组。数组类型直接返回；null/undefined返回默认值；
   * 其他类型包装成单元素数组
   */
  toArray(value: any, defaultValue: any[] = []): any[] {
    // 处理数组类型，直接返回原值
    if (typeChecker.isArray(value)) {
      return value;
    }

    // 处理null或undefined，返回默认值
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // 其他类型包装成单元素数组
    return [value];
  }

  /**
   * 将任意类型的值转换为对象类型。
   * @param value 需要转换的值，可以是任意类型
   * @param defaultValue 转换失败时返回的默认值，默认为空对象
   * @returns 转换后的对象。对象类型直接返回；null/undefined返回默认值；
   * 数组返回索引为key的对象；其他类型返回包含value属性的对象
   */
  toObject(value: any, defaultValue: Record<string, any> = {}): Record<string, any> {
    // 处理对象类型，直接返回原值
    if (typeChecker.isObject(value)) {
      return value;
    }

    // 处理null或undefined，返回默认值
    if (value === null || value === undefined) {
      return defaultValue;
    }

    // 处理数组类型，转换为以索引为key的对象
    if (typeChecker.isArray(value)) {
      const result: Record<string, any> = {};
      value.forEach((item, index) => {
        result[index.toString()] = item;
      });
      return result;
    }

    // 其他类型返回包含value属性的对象
    return { value };
  }
}

// 创建默认实例
const converter = new Converter();

export default converter;
export { Converter };
