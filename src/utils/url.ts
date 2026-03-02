/**
 * 构建带参数的URL
 * @param url 基础URL
 * @param params 参数对象
 * @returns 带参数的URL
 */
export const buildUrlWithParams = (url: string, params?: Record<string, any>): string => {
  // 检查url是否为有效的字符串
  if (!typeChecker.isString(url) || typeChecker.isEmpty(url)) {
    return '';
  }

  // 检查params是否为有效的对象
  if (!params || !typeChecker.isObject(params) || typeChecker.isEmpty(params)) {
    return url;
  }

  // 将参数编码为查询字符串
  const queryString = Object.keys(params)
    .filter(key => typeChecker.isDefined(key)) // 过滤掉无效的键
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(converter.toString(params[key]))}`)
    .join('&');

  // 判断URL是否已包含查询参数
  const separator = url.includes('?') ? '&' : '?';

  return `${url}${separator}${queryString}`;
};

/**
 * 解析 URL 中的查询参数
 * @param url 完整的 URL 字符串或者仅查询参数部分
 * @returns 包含所有查询参数的对象
 */
export const parseUrlSearch = (url: string): Record<string, string> => {
  const query: Record<string, string> = {};

  // 检查url是否为有效的字符串
  if (!typeChecker.isString(url) || typeChecker.isEmpty(url)) {
    return query;
  }

  // 如果传入的是完整 URL，则提取查询参数部分
  let search = url;
  if (url.includes('?')) {
    search = url.split('?')[1];
  }

  // 如果没有查询参数，直接返回空对象
  if (!search) {
    return query;
  }

  // 分割查询参数
  const pairs = search.split('&');

  for (const pair of pairs) {
    // 确保pair格式正确
    if (!pair.includes('=')) {
      continue;
    }

    const [key, value] = pair.split('=');
    if (key) {
      // 解码并存储参数值
      query[decodeURIComponent(key)] = decodeURIComponent(converter.toString(value));
    }
  }

  return query;
};

/**
 * 获取 URL 中指定名称的查询参数值
 * @param url 完整的 URL 字符串
 * @param name 参数名称
 * @returns 参数值，如果不存在则返回空字符串
 */
export const getUrlParam = (url: string, name: string): string => {
  // 检查参数是否为有效字符串
  if (!typeChecker.isString(url) || !typeChecker.isString(name) || typeChecker.isEmpty(name)) {
    return '';
  }

  const params = parseUrlSearch(url);
  return converter.toString(params[name]);
};

/**
 * 解码对象中所有字符串字段的 URL 编码值
 * @param obj 需要解码的对象
 * @returns 解码后的对象
 */
export const decodeObjectValues = (obj: Record<string, any>): Record<string, any> => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const decoded: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      try {
        // 尝试解码，如果解码失败则使用原值
        decoded[key] = decodeURIComponent(value);
      } catch (error) {
        // 如果解码失败（比如不是有效的 URL 编码），使用原值
        decoded[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      // 递归处理嵌套对象
      decoded[key] = decodeObjectValues(value);
    } else {
      // 其他类型的值直接复制
      decoded[key] = value;
    }
  }

  return decoded;
};

export default {
  buildUrlWithParams,
  parseUrlSearch,
  getUrlParam,
  decodeObjectValues,
};
