import type { PiniaPlugin, StateTree, SubscriptionCallbackMutation } from 'pinia';

// 定义持久化配置选项
interface PersistOptions {
  key?: string; // 自定义缓存键名，默认使用store的id
  paths?: string[]; // 需要持久化的字段列表，默认全部字段
  ttl?: number; // 过期时间(毫秒)，0表示永不过期
}

// 扩展Pinia类型定义
declare module 'pinia' {
  interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions;
  }

  interface PiniaCustomProperties {
    $cache: typeof cache;
  }
}

// 实现Pinia缓存插件
const CachePiniaPlugin: PiniaPlugin = ({ store, options }) => {
  // 注入缓存工具到Store实例
  store.$cache = cache;

  // 获取持久化配置
  const persistOptions: PersistOptions = options.persist || {};
  const cacheKey = persistOptions.key || store.$id;
  const { paths, ttl = 0 } = persistOptions;

  // 从缓存加载数据到Store
  const loadFromCache = () => {
    try {
      const cachedData = cache.get<any>(cacheKey);
      if (cachedData && typeChecker.isObject(cachedData)) {
        const patchData: Partial<StateTree> = {};
        Object.keys(cachedData).forEach(key => {
          if ((!paths || paths.includes(key)) && key in store.$state) {
            patchData[key] = cachedData[key];
          }
        });
        store.$patch(patchData);
      }
    } catch (error) {
      console.error(`Failed to load cache for store ${store.$id}:`, error);
    }
  };

  loadFromCache();

  // 监听状态变化并自动持久化（使用正确的类型）
  store.$subscribe(
    (_mutation: SubscriptionCallbackMutation<StateTree>, state: StateTree) => {
      try {
        let dataToPersist: Partial<StateTree> = state;

        if (paths && paths.length > 0) {
          dataToPersist = paths.reduce((acc, key) => {
            if (key in state) {
              acc[key] = state[key];
            }
            return acc;
          }, {} as Partial<StateTree>);
        }

        cache.set(cacheKey, dataToPersist, ttl);
      } catch (error) {
        console.error(`Failed to persist cache for store ${store.$id}:`, error);
      }
    },
    { deep: true }
  );
};

export { CachePiniaPlugin };
