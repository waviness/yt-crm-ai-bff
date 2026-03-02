<script setup lang="ts">
import { getStaticImageDir } from '@/utils/static-path';
import { initGoEasy, connectGoEasy, subscribeGoEasy } from './utils/goeasy-handler';

/**
 * 业务中心首页
 * 展示业务菜单和各种快捷操作
 */
useInitTabPageSettings();

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
const appStore = useAppStore();
const userStore = useUserStore();

// 常量定义
const LONG_MENU_THRESHOLD = 8; // 长菜单阈值

// 静态资源路径（使用公共工具函数）
const staticImagePath = getStaticImageDir('images');

// 响应式数据
const ywMenu = ref<YwMenu>({});
/** 一键展开/收起状态：true-一键收起状态，false-一键展开状态 */
const exAllFlag = ref(false);
const showAdressPicker = ref(false);

/**
 * 获取长菜单列表（>=8项的菜单）
 */
const longMenus = computed((): YwItem[] => {
  return Object.values(ywMenu.value).filter(item => item.arr.length >= LONG_MENU_THRESHOLD);
});

/**
 * 计算是否显示底部操作按钮
 * 只有当有长菜单时才显示
 */
const showFixBtn = computed((): boolean => {
  return longMenus.value.length > 0;
});

/**
 * 一键展开/收起所有长菜单
 * isMoreShow = true 表示收起（显示前7项）
 * isMoreShow = false 表示展开（显示所有项）
 * exAllFlag = true 表示当前所有菜单都是收起状态，按钮显示"一键展开"
 * exAllFlag = false 表示当前所有菜单都是展开状态，按钮显示"一键收起"
 */
const handleExClick = (): void => {
  // 如果当前是收起状态（exAllFlag = true），点击后应该展开（isMoreShow = false）
  // 如果当前是展开状态（exAllFlag = false），点击后应该收起（isMoreShow = true）

  // 只更新长菜单的状态
  longMenus.value.forEach(item => {
    // exAllFlag=true（收起状态）时，点击后展开（isMoreShow=false）
    // exAllFlag=false（展开状态）时，点击后收起（isMoreShow=true）
    item.isMoreShow = !exAllFlag.value;
  });
  // exAllFlag 会通过 watch 自动更新，不需要手动设置
};

/**
 * 获取未读消息数量
 */
const getUnReadCount = async (): Promise<void> => {
  const res = await MessageService.getUnReadCount({});
  appStore.setMsgObj({ unReadMsgCount: res });
};

/**
 * 监听长菜单状态变化，同步按钮状态
 * isMoreShow = true 表示收起（显示前7项）
 * isMoreShow = false 表示展开（显示所有项）
 * exAllFlag = true 表示当前所有菜单都是收起状态，按钮显示"一键展开"
 * exAllFlag = false 表示当前所有菜单都是展开状态，按钮显示"一键收起"
 */
watch(
  longMenus,
  newLongMenus => {
    if (newLongMenus.length === 0) {
      exAllFlag.value = false;
      return;
    }

    // 所有长菜单都处于收起状态（isMoreShow = true）时，按钮显示"一键展开"（exAllFlag = true）
    // 所有长菜单都处于展开状态（isMoreShow = false）时，按钮显示"一键收起"（exAllFlag = false）
    const allCollapsed = newLongMenus.every(item => item.isMoreShow);
    const allExpanded = newLongMenus.every(item => !item.isMoreShow);

    if (allCollapsed) {
      exAllFlag.value = true; // 全部收起，显示"一键展开"
    } else if (allExpanded) {
      exAllFlag.value = false; // 全部展开，显示"一键收起"
    }
    // 如果状态不一致（部分展开部分收起），保持当前 exAllFlag 不变
  },
  { deep: true, immediate: true }
);

/**
 * 计算未读消息数量
 */
const count = computed((): number => {
  return converter.toNumber(appStore.msgObj?.unReadMsgCount);
});

/**
 * 跳转到搜索页面
 */
const navigateToSearchPage = (): void => {
  router.push(RouteMap.searchModule);
};

/**
 * 跳转到消息页面
 */
const navigateToMessagePage = (): void => {
  router.push(RouteMap.messageModule);
};

/**
 * 跳转到客情地图
 */
const navigateToCustomerMap = (): void => {
  // 客情地图实际路由
  router.push('/subpackages/home/map');
};

/**
 * 打开打卡弹窗
 */
const clickInClick = (): void => {
  showAdressPicker.value = true;
};

/**
 * 打卡确定选择
 */
const addressChoose = (): void => {
  showAdressPicker.value = false;
};

/**
 * 初始化业务菜单数据
 */
const initYwMenu = (): void => {
  const initData: YwMenu = {};
  const rawData = userStore.menu.ywzx || {};

  Object.entries(rawData).forEach(([key, item]) => {
    const ywItem = item as YwItem;
    initData[key] = {
      ...ywItem, // 默认收起长菜单
      isMoreShow: (ywItem.arr?.length ?? 0) >= LONG_MENU_THRESHOLD,
    };
  });

  ywMenu.value = initData;
};

/**
 * 页面初始化
 */
onMounted(async () => {
  await initGoEasy();
  await connectGoEasy();
  await subscribeGoEasy(appStore, userStore);

  // 并行执行初始化任务
  await Promise.all([getUnReadCount(), initYwMenu()]);
});
</script>

<template>
  <app-page>
    <view class="px-10 pt-10 pb-100">
      <view class="h-120rpx mb-2 flex">
        <view
          class="flex-1 text-14 bg-white rounded-1 px-2 leading-120rpx relative overflow-hidden"
        >
          <image
            class="absolute top-0 right-0 w-240rpx h-full"
            :src="`${staticImagePath}mhgx-bg.png`"
            mode="aspectFit"
          />
          <view class="relative z-1">为全业务流程提供支持</view>
        </view>
        <view class="w-294rpx flex items-center justify-center ml-2 relative overflow-hidden">
          <image
            class="absolute inset-0 w-full h-full"
            :src="`${staticImagePath}custom-map.png`"
            mode="aspectFill"
          />
          <view
            class="flex-1 flex flex-col justify-between pl-2 relative z-1"
            @click="navigateToCustomerMap"
          >
            <app-icon name="faxian" size="44rpx" multi />
            <view class="text-14 color-main">客情地图</view>
          </view>
          <view
            class="w-128rpx h-88rpx flex-1 flex flex-col justify-between p-2 ml-2 bg-[#4970f3] rounded-1 color-white z-1"
            @click="clickInClick"
          >
            <view class="flex justify-between items-center">
              <app-icon name="a-gougou2" size="20rpx" />
              <up-icon name="arrow-right" color="#fff" size="28rpx" />
            </view>
            <view class="text-14">立即打卡</view>
          </view>
        </view>
      </view>

      <!-- 业务菜单卡片 -->
      <biz-menu-card
        v-for="(ywObj, ywkey) in ywMenu"
        :ywObj="ywObj"
        :key="ywkey"
        @update:isMoreShow="(val: boolean) => (ywObj.isMoreShow = val)"
      />

      <!-- 一键展开/收起按钮 -->
      <app-fix-btn
        v-if="showFixBtn"
        :text="exAllFlag ? '一键展开' : '一键收起'"
        @click="handleExClick"
      />

      <!-- 浮动按钮组 -->
      <app-fly-btn icon="sousuo2" :bottom="248" @click="navigateToSearchPage" />
      <biz-permission :value="['msgCenter']">
        <app-fly-btn icon="tixing1" :count="count" @click="navigateToMessagePage" />
      </biz-permission>
    </view>

    <!-- 打卡弹窗 -->
    <biz-clock-in v-model="showAdressPicker" :clickOnly="true" @addressChoose="addressChoose" />
  </app-page>
</template>
