// 缓存项接口
interface CacheItem<T = any> {
  data: T;
  expiry: number; // 过期时间戳
}

// 缓存管理器键列表的存储键名
const CACHE_KEY_LIST = '__cache_key_list__';

class CacheManager {
  private prefix: string;

  constructor(prefix = 'app_cache_') {
    this.prefix = prefix;
  }

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 过期时间（毫秒），默认不过期
   */
  set<T = any>(key: string, data: T, ttl?: number): void {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      console.error('Invalid cache key');
      return;
    }

    const cacheKey = this.getCacheKey(key);
    const cacheItem: CacheItem<T> = {
      data,
      expiry: ttl ? Date.now() + ttl : 0, // 0表示永不过期
    };

    try {
      // 使用转换工具将缓存项转换为字符串
      const serializedData = converter.toString(cacheItem, '');
      if (serializedData === '') {
        throw new Error('Failed to serialize cache data');
      }

      // 存储缓存项
      uni.setStorageSync(cacheKey, serializedData);
      // 更新键列表
      this.addKeyToList(cacheKey);
    } catch (error) {
      console.error('Failed to set cache:', error);
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据，如果不存在或过期则返回null
   */
  get<T = any>(key: string): T | null {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      console.error('Invalid cache key');
      return null;
    }

    const cacheKey = this.getCacheKey(key);

    try {
      const item = uni.getStorageSync(cacheKey);
      // 使用转换工具检查返回值
      if (!typeChecker.isDefined(item) || converter.toString(item) === '') {
        return null;
      }

      // 使用转换工具将数据转换为对象
      const cacheItem: CacheItem<T> = JSON.parse(converter.toString(item));

      // 检查是否过期
      if (cacheItem.expiry === 0 || cacheItem.expiry > Date.now()) {
        return cacheItem.data;
      }

      // 过期则删除
      this.remove(key);
      return null;
    } catch (error) {
      console.error('Failed to get cache:', error);
      return null;
    }
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  remove(key: string): void {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      console.error('Invalid cache key');
      return;
    }

    const cacheKey = this.getCacheKey(key);
    uni.removeStorageSync(cacheKey);
    // 从键列表中移除
    this.removeKeyFromList(cacheKey);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    try {
      // 获取所有缓存键
      const keyList = this.getKeyList();
      // 删除所有带前缀的缓存项
      keyList.forEach(key => {
        if (typeChecker.isString(key) && key.startsWith(this.prefix)) {
          uni.removeStorageSync(key);
        }
      });
      // 清空键列表
      uni.removeStorageSync(CACHE_KEY_LIST);
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 检查缓存是否存在
   * @param key 缓存键
   * @returns 是否存在且未过期
   */
  has(key: string): boolean {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      return false;
    }

    return this.get(key) !== null;
  }

  /**
   * 获取缓存项的剩余生存时间
   * @param key 缓存键
   * @returns 剩余生存时间（毫秒），-1表示不存在，0表示永不过期
   */
  ttl(key: string): number {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      return -1;
    }

    const cacheKey = this.getCacheKey(key);

    try {
      const item = uni.getStorageSync(cacheKey);
      // 使用转换工具检查返回值
      if (!typeChecker.isDefined(item) || converter.toString(item) === '') {
        return -1;
      }

      const cacheItem: CacheItem = JSON.parse(converter.toString(item));

      if (cacheItem.expiry === 0) {
        return 0; // 永不过期
      }

      const ttl = cacheItem.expiry - Date.now();
      if (ttl <= 0) {
        // 已过期，删除并返回-1
        this.remove(key);
        return -1;
      }

      return ttl;
    } catch (error) {
      console.error('Failed to get TTL:', error);
      return -1;
    }
  }

  /**
   * 获取带前缀的缓存键
   * @param key 原始键
   * @returns 带前缀的缓存键
   */
  private getCacheKey(key: string): string {
    // 使用类型检查和转换工具处理参数
    if (!typeChecker.isString(key)) {
      key = converter.toString(key);
    }
    return this.prefix + key;
  }

  /**
   * 获取键列表
   * @returns 键列表
   */
  private getKeyList(): string[] {
    try {
      const keyListStr = uni.getStorageSync(CACHE_KEY_LIST);
      // 使用转换工具和类型检查工具处理返回值
      if (!typeChecker.isDefined(keyListStr) || converter.toString(keyListStr) === '') {
        return [];
      }

      const result = JSON.parse(converter.toString(keyListStr));
      return typeChecker.isArray(result) ? result : [];
    } catch (error) {
      console.error('Failed to get key list:', error);
      return [];
    }
  }

  /**
   * 添加键到列表
   * @param key 缓存键
   */
  private addKeyToList(key: string): void {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      return;
    }

    try {
      const keyList = this.getKeyList();
      if (!keyList.includes(key)) {
        keyList.push(key);
        // 使用转换工具处理数据
        uni.setStorageSync(CACHE_KEY_LIST, converter.toString(keyList));
      }
    } catch (error) {
      console.error('Failed to add key to list:', error);
    }
  }

  /**
   * 从键列表中移除键
   * @param key 缓存键
   */
  private removeKeyFromList(key: string): void {
    // 使用类型检查工具验证参数
    if (!typeChecker.isString(key) || typeChecker.isEmpty(key)) {
      return;
    }

    try {
      const keyList = this.getKeyList();
      const index = keyList.indexOf(key);
      if (index !== -1) {
        keyList.splice(index, 1);
        // 使用转换工具处理数据
        uni.setStorageSync(CACHE_KEY_LIST, converter.toString(keyList));
      }
    } catch (error) {
      console.error('Failed to remove key from list:', error);
    }
  }
}

// 创建默认实例
const cache = new CacheManager();

export default cache;
export { CacheManager };
export type { CacheItem };
