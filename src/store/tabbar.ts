/**
 * TabbarItem 接口定义了底部导航栏每一项的结构
 * @property path - 路由路径
 * @property text - 显示文本
 * @property icon - 默认状态下的图标
 * @property activeIcon - 激活状态下的图标
 */
export interface TabbarItem {
  path: string;
  text: string;
  icon: string;
  activeIcon: string;
}

/**
 * useTabbarStore 是一个用于管理底部导航栏状态的 Pinia store
 * 它提供了初始化、构建和切换 tab 的功能
 */
export const useTabbarStore = defineStore('tabbar', () => {
  const appStore = useAppStore();
  const userStore = useUserStore();

  const items = ref<TabbarItem[]>([]);
  const activeIndex = ref(0);
  const settings = ref({
    activeColor: appStore.theme.color.primary,
    activeSize: 44,
    inactiveColor: '#D3D3D3',
    inactiveSize: 44,
  });

  /**
   * 计算属性：判断是否需要显示 tabbar
   * 当 items 数组非空时返回 true
   * @returns boolean - 是否显示 tabbar
   */
  const showTabbar = computed(() => {
    return typeChecker.isNonEmptyArray(items.value);
  });

  /**
   * 初始化 tabbar 数据
   * 从缓存中读取已有的 tab 项和激活索引
   */
  const init = () => {
    if (typeChecker.isEmpty(items.value)) {
      loadFromCache();
    }

    if (
      !typeChecker.isEmpty(userStore.menu.ywzx) &&
      userStore.userInfor.isExistGoodsOrCustomer &&
      !typeChecker.isEmpty(userStore.menu.sjzx)
    ) {
      updateActiveIndex(1);
      router.redirect(items.value[1].path);
    } else {
      updateActiveIndex(0);
      router.redirect(items.value[0].path);
    }
    console.log('init tabbar', activeIndex.value);
  };

  const loadFromCache = () => {
    const cacheItems = cache.get<TabbarItem[]>('tabbarItems');
    items.value = converter.toArray(cacheItems);
  };

  /**
   * 根据权限标识构建 tab 项列表
   * @param hasTabFlag - 包含各模块权限标识的对象
   */
  const buildItems = (hasTabFlag: Record<string, boolean>) => {
    const newItems = [] as TabbarItem[];

    // 数据中心
    if (hasTabFlag.sjzxFlag) {
      newItems.push(TabPageMap.dashboard);
    }

    // 业务中心
    if (hasTabFlag.ywzxFlag) {
      newItems.push(TabPageMap.home);
    }

    // 我的
    if (hasTabFlag.wdFlag) {
      newItems.push(TabPageMap.user);
    }

    items.value = newItems;
    cache.set('tabbarItems', newItems);
  };

  /**
   * 切换 tab 并跳转到对应路由
   * @param index - 要切换到的 tab 索引
   */
  const updateActiveIndex = (index: number) => {
    activeIndex.value = index;
    cache.set('tabbarActiveIndex', index);
  };

  return {
    items,
    activeIndex,
    settings,
    showTabbar,
    init,
    buildItems,
    updateActiveIndex,
  };
});
