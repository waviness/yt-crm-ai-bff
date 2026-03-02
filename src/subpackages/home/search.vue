<script setup lang="ts">
/**
 * 功能搜索页面
 * 展示业务菜单卡片，支持搜索过滤
 */
/**
 * 菜单项类型定义
 */
interface MenuItem {
  /** 路由路径 */
  path: string;
  /** 图标名称 */
  icon: string;
  /** 权限名称 */
  pmsName: string;
  /** 是否显示进度标识 */
  ingShowFlag?: boolean;
  /** 进度值 */
  ing?: string | number;
}

/**
 * 业务组类型定义
 */
interface YwItem {
  /** 是否展开更多 */
  isMoreShow: boolean;
  /** 菜单项列表 */
  arr: MenuItem[];
  /** 标题 */
  title: [string, string];
}

/**
 * 业务菜单类型
 */
type YwMenu = Record<string, YwItem>;

// Store
const userStore = useUserStore();

// 响应式数据
const searchKeyword = ref('');
const ywMenu = ref<YwMenu>({});

/**
 * 初始化业务菜单数据
 */
const initYwMenu = (): void => {
  const initData: YwMenu = {};
  const rawData = userStore.menu.ywzx || {};

  Object.entries(rawData).forEach(([key, item]) => {
    const ywItem = item as YwItem;
    initData[key] = {
      ...ywItem,
      // 搜索页面默认展开所有菜单
      isMoreShow: false,
    };
  });

  ywMenu.value = initData;
};

/**
 * 根据搜索关键词过滤菜单
 */
const filteredYwMenu = computed((): YwMenu => {
  const keyword = searchKeyword.value.trim().toLowerCase();

  // 如果搜索关键词为空，返回所有菜单
  if (!keyword) {
    return ywMenu.value;
  }

  // 过滤菜单
  const filtered: YwMenu = {};
  Object.entries(ywMenu.value).forEach(([key, ywItem]) => {
    // 过滤菜单项，只保留包含搜索关键词的项
    const filteredItems = ywItem.arr.filter(item => item.pmsName.toLowerCase().includes(keyword));

    // 只有当过滤后的菜单项不为空时，才添加该菜单组
    if (filteredItems.length > 0) {
      filtered[key] = {
        ...ywItem,
        arr: filteredItems,
      };
    }
  });

  return filtered;
});

/**
 * 处理搜索输入
 */
const handleSearchInput = (value: string): void => {
  searchKeyword.value = value;
};

/**
 * 处理搜索清除
 */
const handleSearchClear = (): void => {
  searchKeyword.value = '';
};

/**
 * 页面初始化
 */
onMounted(() => {
  initYwMenu();
});
</script>

<template>
  <view class="pb-100">
    <!-- 搜索框 -->
    <app-search
      v-model="searchKeyword"
      class="mb-2"
      placeholder="功能搜索发现"
      clearable
      @input="handleSearchInput"
      @clear="handleSearchClear"
    />

    <!-- 业务菜单卡片 -->
    <biz-menu-card
      v-for="(ywObj, ywkey) in filteredYwMenu"
      :ywObj="ywObj"
      :key="ywkey"
      @update:isMoreShow="(val: boolean) => (ywObj.isMoreShow = val)"
    />

    <!-- 无搜索结果提示 -->
    <app-empty
      v-if="searchKeyword && Object.keys(filteredYwMenu).length === 0"
      class="mt-6"
      description="未找到相关功能"
    />
  </view>
</template>
