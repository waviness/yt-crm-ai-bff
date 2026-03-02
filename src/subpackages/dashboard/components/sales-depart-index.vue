<template>
  <view>
    <salesHeader
      :entryObj="entryObj"
      @deptSelectClick="showPopup = true"
      @update:dateTime="dateChange"
    />
    <view class="bg-white pb-6">
      <salesUpCard
        :salesDataObj="salesDataObj"
        :isShowFlag="isShowFlag"
        :deptLevel="entryObj.deptLevel || ''"
        @keyPageClick="keyPageClick"
        @overdueReceivableClick="overdueReceivableClick"
      ></salesUpCard>
      <!-- 页面 -->
      <salesDepartTab
        :entryObj="entryObj"
        @statusTabClick="statusTabClick"
        @echartsBarClick="echartsBarClick"
      />
      <salesDepartListCard
        v-if="
          (entryObj.deptLevel && +entryObj.deptLevel === 1 && entryObj.deptId !== '449') ||
          (entryObj.deptLevel && +entryObj.deptLevel === 0) ||
          statusActive === 1
        "
        :entryObj="entryObj"
        @departClick="departClick"
        :ytyyDepartList="ytyyDepartList"
        :qtDepartList="qtDepartList"
        :departNameTabs="departNameTabs"
        :deptLevel="entryObj.deptLevel || ''"
      />
      <salesDepartGlobal
        v-if="
          ywkbRefreshData &&
          entryObj.deptLevel &&
          ((+entryObj.deptLevel !== 0 && +entryObj.deptLevel !== 1 && +entryObj.deptLevel !== 4) ||
            (+entryObj.deptLevel === 1 && entryObj.deptId === '449'))
        "
        :entryObj="entryObj"
        v-show="statusActive === 0"
      />
      <salesCommonTabIndex
        v-if="
          entryObj.deptLevel &&
          (+entryObj.deptLevel === 3 || +entryObj.deptLevel === 4) &&
          statusActive === 1
        "
        :refreshData="ywkbRefreshData"
        :entryObj="entryObj"
        :active="ywkbActive"
        tab-type="departmentRelate"
        @tabChange="handleTabChange"
      />
    </view>
    <up-popup
      v-model:show="showPopup"
      mode="bottom"
      :closeOnClickOverlay="true"
      :customStyle="{ height: '90vh' }"
    >
      <select-dept-list
        :deptLevel="entryObj.deptLevel || ''"
        :nowData="entryObj.deptId"
        @chooseData="chooseData"
      />
    </up-popup>
    <up-popup
      v-model:show="echartsShow"
      mode="bottom"
      :round="0"
      :closeable="true"
      :closeOnClickOverlay="true"
      :customStyle="{ height: '100vh' }"
    >
      <echartBar
        v-if="echartsShow"
        :currentYearDatalist="currentYearDatalist"
        :lastYearDatalist="lastYearDatalist"
      />
    </up-popup>
  </view>
</template>

<script setup lang="ts">
import salesHeader from './base/header.vue';
import salesDepartTab from './base/sales-tab.vue';
import salesUpCard from './business/sales-depart-up-card.vue';
import salesDepartListCard from './business/sales-depart-list-card.vue';
import salesDepartGlobal from './sales-depart-global.vue';
import salesCommonTabIndex from './business/sales-common-tab-index.vue';
import selectDeptList from './common/select-dept-list.vue';
import { useSalesDepartIndex } from '../composables/use-sales-depart-index';
import type { QuickOverviewDepartmentTabItem, EntryObj } from '../types';
import echartBar from './base/ecahrts-bar.vue';
import { useDashboardStore } from '@/store/dashboard';
const dashboardStore = useDashboardStore();
interface IProps {
  entryObj: EntryObj;
  isShowFlag: boolean;
}
const props = defineProps<IProps>();

const {
  fetchGetQuickOverview,
  triggerPostFetchActions,
  fetchGetMonthCumulativeMoney,
  salesDataObj,
  ytyyDepartList,
  qtDepartList,
  departNameTabs,
  echartsLoading,
  statusActive,
  showPopup,
  lastYearDatalist,
  currentYearDatalist,
} = useSalesDepartIndex(props.entryObj, false);
// 添加页面活动状态
let isPageActive = true;
const lastDateTime = ref(''); // 初始化为空字符串
const isFirstLoad = ref(true); // 添加标记，判断是否是第一次加载
const ywkbActive = ref(0); // 默认选中第一个tab
const ywkbRefreshData = ref(true); // 默认加载
const handleTabChange = (val: number) => {
  // tab切换
  ywkbActive.value = val;
};
const emit = defineEmits(['echartsBarClick', 'statusTabClick', 'dateChange', 'chooseDeptData']);

const chooseData = (val: any) => {
  emit('chooseDeptData', val);
};
const statusTabClick = (index: number) => {
  statusActive.value = index;
  if (index === 1) {
    triggerPostFetchActions();
  }
  emit('statusTabClick', index);
};
const departClick = (val: QuickOverviewDepartmentTabItem) => {
  const isInner = 1; //内部点击
  const path = '/subpackages/dashboard/sales-line-rise';
  const query = {
    deptLevel: val.deptLevel,
    deptId: val.deptId,
    deptName: val.deptName,
    isInner: isInner ? '1' : '0',
  };
  router.push(path, query);
};
const keyPageClick = (key: string) => {
  const path = '/subpackages/dashboard/sales-line-key-page';
  const query = {
    key: key,
    deptId: props.entryObj.deptId,
    deptName: props.entryObj.deptName,
  };
  router.push(path, query);
};
const overdueReceivableClick = (type: number) => {
  const path = '/subpackages/dashboard/overdue-receivable-index';
  const query = {
    active: String(type), // ✅ 1-逾期账款, 2-应收账款
    tabType: '0', // ✅ 默认第一个tab（逾期账款tab）
    deptId: String(props.entryObj.deptId),
    deptName: props.entryObj.deptName,
    date: dashboardStore.dateTime || time.format(new Date(), 'yyyy-MM-dd'), // ✅ 添加日期
    level: String(props.entryObj.deptLevel || '1'), // ✅ 添加层级
  };

  console.log('跳转到逾期/应收页面，参数:', query); // 调试日志
  router.push(path, query);
};
const echartsShow = ref(false);
const echartsBarClick = () => {
  echartsShow.value = true;
};
const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
};

const initData = async () => {
  try {
    // 先更新记录，避免重复请求
    lastDateTime.value = dashboardStore.dateTime;

    // 同时发起两个请求，提高性能
    await Promise.all([fetchGetQuickOverview(true), fetchGetMonthCumulativeMoney(true)]);

    // 刷新页面
    ywkbRefreshData.value = false;
    nextTick(() => {
      ywkbRefreshData.value = true;
    });
  } catch (error) {
    console.error('[initData] 数据加载失败:', error);
  }
};
// 监听页面显示/隐藏
onShow(() => {
  isPageActive = true;
});
onMounted(() => {
  if (props.entryObj.deptLevel && +props.entryObj.deptLevel === 4) {
    statusActive.value = 1;
  }
  initData();
  isFirstLoad.value = false; // 标记已经不是第一次加载
});
// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  async (newDateTime, oldDateTime) => {
    if (isPageActive && newDateTime !== oldDateTime) {
      await initData();
    }
  }
);
onHide(() => {
  isPageActive = false;
});
</script>

<style lang="scss" scoped></style>
