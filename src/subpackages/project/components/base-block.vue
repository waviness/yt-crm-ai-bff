<!-- 项目管理基础块组件 -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import OrgDept from './org-dept.vue';
import ProjectData from './project-data.vue';
import converter from '@/utils/converter';
import type { StatisticsData, OrgInfo } from '../types';

interface IProps {
  data?: StatisticsData;
  title?: string;
  selectMonth?: string;
  leaderLevel?: number;
  columns?: string[][];
  yearMonthData?: Map<string, string[]>; // 年份对应的月份数据，用于联动
  orgList?: OrgInfo[];
  resList?: any[];
  // 组件变体配置
  variant?: 'access' | 'ex'; // 准入管理 | 深分进度
  showUserSelect?: boolean; // 是否显示用户选择
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}) as StatisticsData,
  title: '',
  selectMonth: '',
  leaderLevel: 0,
  columns: () => [],
  yearMonthData: () => new Map(),
  orgList: () => [],
  resList: () => [],
  variant: 'access',
  showUserSelect: true,
});

const emit = defineEmits<{
  tabChange: [tabIndex: number];
  monthChange: [value: string];
  search: [keywords: string];
  userChange: [res: any];
}>();

const showSelectMonth = ref(false);
const showSelect = ref(false);
const pickerRef = ref();

const projectStore = useProjectStore();

// 根据当前路由动态计算 active
const currentActive = computed(() => {
  // 如果 store 中有 currentTab，优先使用
  if (projectStore.currentTab) {
    return projectStore.currentTab === 'access' ? 0 : 1;
  }

  // 否则根据 variant 判断
  if (props.variant === 'access') {
    return 0;
  } else {
    return props.leaderLevel === 1 ? 1 : 0;
  }
});

// 计算属性
const tabConfig = computed(() => {
  let list = [];
  if (props.variant === 'access') {
    list = !props.leaderLevel
      ? [{ name: '准入管理' }]
      : props.leaderLevel === 1
        ? [{ name: '准入管理' }, { name: '深分进度' }]
        : [{ name: '深分进度' }];
  } else {
    list =
      props.leaderLevel === 1
        ? [{ name: '准入管理' }, { name: '深分进度' }]
        : [{ name: '深分进度' }];
  }

  return {
    // 如果列表只有一项，选中项必须是 0，否则使用计算出的 active
    active: list.length === 1 ? 0 : currentActive.value,
    list,
  };
});

const displayText = computed(() => {
  if (!props.resList || props.resList.length === 0) {
    return '请选择';
  }

  const parts: string[] = [];

  // 第一级：公司/中心
  if (props.resList[0]) {
    parts.push(props.resList[0].name || '');
  }

  // 第二级：部门
  if (props.resList[1]) {
    const deptName = props.resList[1].name || '';
    const suffix = props.resList[1].id === -1 ? '部门' : '';
    parts.push(deptName + suffix);
  }

  // 第三级：业务员（仅在显示用户选择时）
  if (props.showUserSelect && props.resList[2]) {
    const userNames = props.resList[2].map((item: any) => item.userName).join('、');
    const suffix = props.resList[2][0]?.userId === -1 ? '业务员' : '';
    parts.push(userNames + suffix);
  }

  return parts.join('/');
});

// 方法
const handleTabChange = (index: number) => {
  let targetTab: 'access' | 'ex' = index === 0 ? 'access' : 'ex';
  // 如果只有深分进度权限(leaderLevel >= 2)，只有一个tab，index 0 对应 ex
  if (props.leaderLevel >= 2) {
    targetTab = 'ex';
  }

  const targetRoute = targetTab === 'access' ? RouteMap.project : RouteMap.projectEx;
  const siblingRoute = targetTab === 'access' ? RouteMap.projectEx : RouteMap.project;

  projectStore.setCurrentTab(targetTab);

  // 埋点统计
  const menuConfig =
    index === 0
      ? { id: '1', name: '准入管理', menuOperation: '项目管理中准入管理Tab' }
      : { id: '2', name: '深分进度', menuOperation: '项目管理中深度分析Tab' };
  CommonService.crmUserClick({
    catalogType: 504,
    catalogTypeName: '项目管理',
    cucrId: '',
    menuId: menuConfig.id,
    menuName: menuConfig.name,
    menuOperation: menuConfig.menuOperation,
    operationType: 2,
  });

  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const currentRoute = currentPage?.route || '';

  // 规范化路由路径（移除前导斜杠）
  const normalizeRoute = (route: string) => {
    return route.replace(/^\//, '');
  };

  const targetRoutePath = normalizeRoute(targetRoute);
  const siblingRoutePath = normalizeRoute(siblingRoute);
  const normalizedCurrentRoute = normalizeRoute(currentRoute);

  // 检查当前是否已经在目标页面（精确匹配列表页）
  const isCurrentTargetPage =
    normalizedCurrentRoute === targetRoutePath ||
    normalizedCurrentRoute === `subpackages/project/${index === 0 ? 'index' : 'exindex'}`;

  // 如果已经在目标页面，不做任何操作
  if (isCurrentTargetPage) {
    return;
  }

  // 查找目标页面在栈中的位置（只匹配列表页，不包括详情页）
  const targetPageIndex = pages.findIndex((page: any) => {
    const route = normalizeRoute(page.route || '');
    // 精确匹配列表页
    return route === targetRoutePath;
  });

  // 查找兄弟页面在栈中的位置
  const siblingPageIndex = pages.findIndex((page: any) => {
    const route = normalizeRoute(page.route || '');
    return route === siblingRoutePath;
  });

  // 情况1：目标页面在栈中（不是当前页），直接返回
  if (targetPageIndex !== -1 && targetPageIndex < pages.length - 1) {
    const delta = pages.length - 1 - targetPageIndex;
    router.back(delta);
    return;
  }

  // 情况2：兄弟页面在栈中（说明当前在详情页或兄弟列表页），需要先返回再切换
  if (siblingPageIndex !== -1) {
    const delta = pages.length - 1 - siblingPageIndex;
    if (delta > 0) {
      // 设置待切换的目标 tab
      projectStore.setPendingTabSwitch(targetTab);
      // 返回到兄弟页面（返回后兄弟页面的 onShow 会检测并执行切换）
      router.back(delta);
      return;
    }
    // 如果当前就在兄弟页面，直接 redirect
    router.redirect(targetRoute);
    return;
  }

  // 情况3：目标和兄弟页面都不在栈中（首次进入或从其他页面进入），直接 redirect
  router.redirect(targetRoute);
};

// 联动处理
const handlePickerChange = (e: any) => {
  const { columnIndex, index } = e;

  // 当选择年份时，更新月份列
  if (columnIndex === 0 && props.yearMonthData) {
    // 获取选中的年份
    const selectedYear = props.columns[0][index];
    const months = props.yearMonthData.get(selectedYear) || [];

    if (months.length > 0) {
      // 使用 setColumnValues 方法更新第二列
      pickerRef.value?.setColumnValues(1, months);
    }
  }
};

const handleConfirm = ({ value }: { value: any }) => {
  const monthVal = value[1].slice(0, value[1].length - 1);
  const selectRes = `${value[0].slice(0, 4)}.${+monthVal > 9 ? monthVal : '0' + monthVal}`;
  showSelectMonth.value = false;
  emit('monthChange', selectRes);
};

const handleSearch = (keywords: string) => {
  emit('search', keywords);
};

const handleCancel = () => {
  showSelect.value = false;
  emit('search', '');
};

const handleUserConfirm = (res: any) => {
  showSelect.value = false;
  emit('userChange', res);
};
</script>

<template>
  <view>
    <up-sticky style="top: 0">
      <app-tabs
        :current="tabConfig.active"
        :list="tabConfig.list"
        @change="({ index }: { index: number }) => handleTabChange(index)"
      />
    </up-sticky>
    <view class="p-10">
      <!-- 月份和组织选择 -->
      <view v-if="leaderLevel" class="flex text-12">
        <view
          class="bg-main-3 rounded-20rpx color-white font-bold py-3 px-4"
          @click="showSelectMonth = true"
        >
          {{ selectMonth }}
        </view>
        <view
          class="flex-1 ml-2 bg-white rounded-20rpx color-black-2 font-bold p-10 flex items-center slh"
          @click="showSelect = true"
        >
          <view class="flex-1 slh">
            {{ displayText }}
          </view>
          <up-icon
            class="ml-1 text-12 text-gray-400"
            :name="showSelect ? 'arrow-up' : 'arrow-down'"
          />
        </view>
      </view>

      <!-- 仅月份选择 -->
      <view
        v-else
        class="flex justify-between items-center p-10 text-14 font-bold bg-white rounded-20rpx"
        @click="showSelectMonth = true"
      >
        <view>{{ selectMonth }}</view>
        <view class="color-gray-7">月份筛选</view>
      </view>

      <!-- 数据展示区域 -->
      <view v-if="variant === 'access'" class="flex pt-10">
        <project-data
          v-if="title"
          class="flex-1"
          icon="zhanbitu_chart-proportion"
          :title="title"
          :valueSize="14"
          specialTitle
        />
        <project-data
          v-else
          class="flex-1"
          icon="zhanbitu_chart-proportion"
          title="项目数"
          :value="data.projectNum"
        />
        <project-data
          class="flex-1 ml-2"
          icon="hezi_box"
          title="品规数量"
          :value="data.productNum"
        />
      </view>

      <view v-else class="pt-10">
        <project-data
          v-if="title"
          class="flex-1"
          icon="zhanbitu_chart-proportion"
          title="项目名称"
          :value="title"
          :valueSize="14"
        />
        <project-data
          v-else
          class="flex-1"
          icon="zhanbitu_chart-proportion"
          title="项目数"
          :value="data.projectNum"
        />
      </view>

      <!-- 指标数据 -->
      <view v-if="variant === 'access'" class="pt-2 flex">
        <project-data
          class="flex-1"
          icon="a-bianzu8"
          title="目标条目"
          :growNum="data.goalNumInc"
          :value="data.goalNum"
          grow
        />
        <project-data
          class="flex-1 ml-2"
          icon="a-bianzu122"
          title="准入条目"
          :growNum="data.accessNumInc"
          :value="data.accessNum"
          grow
        />
      </view>

      <view v-else class="pt-2 flex">
        <project-data
          class="flex-2"
          icon="a-bianzu8"
          title="网点覆盖指标"
          :value="data.dotTarget === null ? '' : Math.round(data.dotTarget)"
          bigValue
        />
        <project-data
          class="flex-3 ml-2"
          icon="a-bianzu122"
          title="已完成指标"
          :growNum="data.dotNumberInc === null ? undefined : Math.round(data.dotNumberInc)"
          :value="data.dotNumber === null ? '-' : Math.round(data.dotNumber)"
          grow
        />
      </view>

      <!-- 内容插槽 -->
      <view class="mt-2 rounded-20rpx bg-white">
        <slot />
      </view>
    </view>

    <!-- 月份选择弹窗 -->
    <up-picker
      ref="pickerRef"
      :show="showSelectMonth"
      :columns="columns"
      round="10"
      title="选择年月"
      closeOnClickOverlay
      @confirm="handleConfirm"
      @change="handlePickerChange"
      @close="showSelectMonth = false"
      @cancel="showSelectMonth = false"
    />

    <!-- 组织部门选择弹窗 -->
    <org-dept
      :show="showSelect"
      :resList="resList"
      :orgList="orgList"
      :noUser="!showUserSelect"
      @search="handleSearch"
      @confirm="handleUserConfirm"
      @cancel="handleCancel"
    />
  </view>
</template>
