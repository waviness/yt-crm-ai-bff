/**
 * 数组工具函数
 */
import type { OptionItem } from '@/types/common';

/**
 * 根据ID查找选项名称
 * @param id 选项ID
 * @param options 选项数组
 * @returns 选项名称，未找到时返回空字符串
 */
export const findNameById = (id: number, options: readonly OptionItem[]): string => {
  if (!id || !Array.isArray(options)) {
    return '';
  }
  const option = options.find(item => item.id === id);
  return option?.name ?? '';
};

/**
 * 深拷贝对象（使用 JSON 序列化方式）
 * 适用于简单的对象结构（字符串、数字、数组、普通对象等）
 *
 * 注意：此方法不支持以下情况：
 * - 函数
 * - undefined（会被忽略）
 * - Symbol
 * - 循环引用
 * - Date 对象（会变成字符串）
 *
 * @param obj 需要深拷贝的对象
 * @returns 深拷贝后的新对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  try {
    return JSON.parse(JSON.stringify(obj)) as T;
  } catch (error) {
    console.warn('深拷贝失败，返回原对象:', error);
    return obj;
  }
};
