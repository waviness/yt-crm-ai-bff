<script setup lang="ts">
import time from '@/utils/time';
import FollowItem from './components/follow-item.vue';
import Comment from './components/comment.vue';
import CustomLabel from './components/custom-label.vue';
import { useCustomerFollow } from './composables/use-customer-follow';
import { useRecommendationAndPlan } from './composables/use-recommendation-and-plan';

const userStore = useUserStore();
const appStore = useAppStore();
const departmentStore = useDepartmentStore();

// 标签页相关状态
const activeTab = ref(2); // 默认显示客情记录
const buttonShow = ref(false); // 是否显示拜访推荐和拜访计划标签页
const isFirstLoad = ref(true); // 是否首次加载

// 部门用户相关状态
const hasDept = ref(false);
const checkedUsers = ref<any[]>([]);
const changeTypeShow = ref(false);

// 使用客户随访 composable
const {
  commentShow,
  showAdressPicker,
  customerLabelShow,
  addStarClick: _addStarClick,
  editClick,
  commentClick,
  sureComment: _sureComment,
  clickChange: _clickChange,
  adressOnConfirm,
  addressChoose,
  adressCancel,
} = useCustomerFollow();

// 使用推荐和计划 composable
const {
  recommendationList,
  planList,
  recommendationLoading,
  planLoading,
  showFilter,
  showVisitTypePopup,
  showAccountUnitPopup,
  visitTypes,
  accountUnitList,
  filterObj,
  loadRecommendationData,
  loadPlanData,
  onVisitTypeConfirm,
  onAccountUnitConfirm,
  getAccountUnitList,
  filterRefresh,
  handleFilterOk,
  goToIntellDetail,
  goToAddVisit,
  filterPlanClick,
} = useRecommendationAndPlan();

// 使用分页 composable
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<any>(10);

// 监听列表变化，更新统计数据
watch(
  list,
  () => {
    getNumber();
  },
  { deep: true }
);

const calendarRef = ref();
const visitDate = ref('');

// 状态
const dateRange = ref<Date[]>([]);
const calendarShow = ref(false);
const numberObj = ref({
  numberAll: 0,
  numberStar: 0,
});

/**
 * 获取周的开始日期（周一）和结束日期（周日）
 */
const getWeekDateRange = (day: Date): Date[] => {
  const monday = time.getWeekdayOfWeek(day, 1);
  const sunday = time.add(monday, 6, 'day');
  return [monday, sunday];
};

/**
 * 初始化日期范围
 */
const initDateRange = (day: Date) => {
  const [startDate, endDate] = getWeekDateRange(day);
  dateRange.value = [startDate, endDate];
};

/**
 * 日历选择确认
 */
const calendarConfirm = (value: any) => {
  calendarShow.value = false;
  if (value && value.range && value.range.before && value.range.after) {
    dateRange.value = [new Date(value.range.before), new Date(value.range.after)];
  }
  resetAndFetchData(fetchDataList);
};

/**
 * 获取数据列表
 */
const fetchDataList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const params = {
    startTime: time.format(dateRange.value[0], time.FORMATS.ISO_DATE) + ' 00:00:00',
    endTime: time.format(dateRange.value[1], time.FORMATS.ISO_DATE) + ' 23:59:59',
    pageNum,
    pageSize,
    userIdList: checkedUsers.value,
  };
  const res = await CustomerFollowService.getUserVisit(params);
  return {
    list: res.list || [],
    total: res.total || 0,
    hasNextPage: res.hasNextPage ?? res.list.length >= pageSize,
  };
};

/**
 * 获取数量统计
 */
const getNumber = () => {
  numberObj.value.numberStar = list.value.filter((val: any) => val.isRaisedStarFlag).length;
  numberObj.value.numberAll = list.value.length;
};

/**
 * 客情新增
 */
const addClick = () => {
  appStore.setDetailObj({ staffMemberCheckDetail: [] });
  router.push(RouteMap.customerFollowAdd);
};

/**
 * 列表项点击
 */
const listClick = (item: any) => {
  appStore.setDetailObj(item);
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.customerFollowDetail);
};

/**
 * 部门用户选择确认
 */
const onTreeConfirm = (userList: any[]) => {
  changeTypeShow.value = false;
  resetAndFetchData(fetchDataList);
};

/**
 * 星标点击
 */
const addStarClick = async (item: any) => {
  const success = await _addStarClick(item);
  if (success) {
    resetAndFetchData(fetchDataList);
  }
};

/**
 * 确认批注
 */
const sureComment = async (val: string) => {
  const success = await _sureComment(val);
  if (success) {
    resetAndFetchData(fetchDataList);
  }
};

/**
 * 关联打卡点击
 */
const clickChange = (item: any) => {
  visitDate.value = item.visitTime;
  _clickChange(item);
};

/**
 * 切换到本人客情
 */
const resetToMyReport = () => {
  checkedUsers.value = [];
  resetAndFetchData(fetchDataList);
};

/**
 * 初始化部门树
 */
const initDeptTree = async () => {
  await departmentStore.initDepTree({ treeType: 1, authorizedFlag: true });
  hasDept.value = departmentStore.hasDept;
};

/**
 * 标签页切换处理
 */
const onTabChange = (e: { index: number }) => {
  const value = e.index;
  activeTab.value = value;
  if (value === 0 && recommendationList.value.length === 0) {
    loadRecommendationData();
  } else if (value === 1 && planList.value.length === 0) {
    loadPlanData();
  } else if (value === 2) {
    if (list.value.length === 0) {
      resetAndFetchData(fetchDataList);
    }
  }
};

/**
 * 检查权限
 */
const checkPermission = () => {
  const permissions = userStore.permissions;

  if (!permissions) {
    console.warn('⚠️ 权限数据为空');
    buttonShow.value = false;
    return;
  }

  if (!Array.isArray(permissions)) {
    console.error('❌ permissions 不是数组:', permissions);
    buttonShow.value = false;
    return;
  }

  const hasPermission = permissions.some((item: any) => item === 'visitRecomm');
  buttonShow.value = hasPermission;
};

// 立即检查权限，避免页面渲染时闪烁
checkPermission();

/**
 * 初始化
 */
const init = async () => {
  try {
    initDateRange(new Date());
    await initDeptTree();
    checkPermission(); // 再次检查权限，确保数据加载后状态正确

    await resetAndFetchData(fetchDataList);

    // 如果有拜访推荐权限,初始化加载推荐和计划数据
    if (buttonShow.value) {
      loadRecommendationData();
      loadPlanData();
    } else {
    }
  } catch (error) {
    console.error('❌ 客情模块初始化失败:', error);
  } finally {
    isFirstLoad.value = false;
  }
};

// 生命周期
onLoad((options: any) => {
  if (options && options.currentTab !== undefined) {
    activeTab.value = Number(options.currentTab);
  }
});

onMounted(() => {
  init();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    resetAndFetchData(fetchDataList);
    appStore.setHadDoneOnDetail(false);
  }

  // 检查是否需要刷新推荐或计划数据
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  const options = (currentPage as any).options || {};

  if (options.needRefresh === 'recommendation') {
    loadRecommendationData();
  } else if (options.needRefresh === 'plan') {
    loadPlanData();
  }
});

// 上拉加载更多
onReachBottom(() => {
  if (activeTab.value === 2) {
    loadMore(fetchDataList);
  }
});
</script>

<template>
  <view class="pb-50">
    <app-watermark />

    <!-- 标签页 -->
    <up-sticky style="top: 0">
      <app-tabs
        v-if="buttonShow"
        :current="activeTab"
        :list="[{ name: '拜访推荐' }, { name: '拜访计划' }, { name: '客情记录' }]"
        :lineWidth="40"
        @change="onTabChange"
      />
    </up-sticky>

    <!-- 拜访推荐内容 -->
    <view v-if="buttonShow && activeTab === 0" class="tab-content">
      <up-loading-icon v-if="recommendationLoading" mode="circle" color="#2271F5" />
      <view v-else>
        <view
          v-for="(item, index) in recommendationList"
          :key="index"
          class="recommendation-item"
          @click="goToIntellDetail(item, index)"
        >
          <view class="recommendation-header">
            <view class="flex items-center">
              <view class="customer-type">{{ item.customerType || '下游客户' }}</view>
              <text class="company-name"
                >{{ item.entryId || '-' }}/{{ item.entryName || '-' }}</text
              >
            </view>
            <up-icon name="arrow-right" color="#999" size="16" />
          </view>
          <view class="recommendation-info">
            <view class="info-row">
              <text class="info-label">客户名称：</text>
              <text class="info-value"
                >{{ item.customerId || '-' }}/{{ item.customerName || '-' }}</text
              >
            </view>
            <view class="info-row">
              <text class="info-label">分支机构：</text>
              <text class="info-value">{{ item.contactName || '-' }}</text>
            </view>
          </view>
        </view>
        <app-empty v-if="recommendationList.length === 0" description="暂无推荐数据" />
      </view>
    </view>

    <!-- 拜访计划内容 -->
    <view v-if="buttonShow && activeTab === 1" class="tab-content">
      <up-loading-icon v-if="planLoading" mode="circle" color="#2271F5" />
      <view v-else>
        <view
          v-for="(item, index) in planList"
          :key="index"
          class="recommendation-item"
          @click="item.visitPlan !== 4 && goToAddVisit(item)"
        >
          <view class="recommendation-header">
            <view class="flex items-center">
              <view class="customer-type">{{ item.customerType || '下游客户' }}</view>
              <text class="company-name"
                >{{ item.entryId || '-' }}/{{ item.entryName || '-' }}</text
              >
            </view>
            <up-icon v-if="item.visitPlan !== 4" name="arrow-right" color="#999" size="16" />
          </view>
          <view class="recommendation-info">
            <view class="info-row">
              <text class="info-label">客户名称：</text>
              <text class="info-value"
                >{{ item.customerId || '-' }}/{{ item.customerName || '-' }}</text
              >
            </view>
            <view class="info-row">
              <text class="info-label">分支机构：</text>
              <text class="info-value">{{ item.contactName || '-' }}</text>
            </view>
          </view>
        </view>
        <app-empty v-if="planList.length === 0" description="暂无计划数据" />
      </view>
    </view>

    <!-- 客情记录内容 -->
    <view v-if="!buttonShow || activeTab === 2">
      <!-- 顶部固定区域 -->
      <up-sticky style="top: 0">
        <view class="flex p-10 bg-light-gray">
          <view
            class="flex-5 pl-10 bg-white rounded-20rpx h-80 leading-10 text-14"
            @click="calendarRef?.open()"
          >
            <text v-if="dateRange.length === 2">
              {{ time.format(dateRange[0], 'MM-dd') }} ~ {{ time.format(dateRange[1], 'MM-dd')
              }}<text class="text-12">({{ time.format(dateRange[0], 'yyyy年') }})</text>
            </text>
          </view>
          <view
            v-if="hasDept && !checkedUsers.length"
            class="flex-3 text-center text-14 ml-2 bg-white rounded-20rpx h-80 leading-10 flex items-center justify-center"
            @click="changeTypeShow = !changeTypeShow"
          >
            <text>我的客情</text>
            <up-icon v-if="hasDept" name="arrow-down" size="32rpx" class="ml-1" />
          </view>
          <view
            v-if="hasDept && checkedUsers.length"
            class="flex-3 text-center text-14 ml-2 bg-main text-white rounded-20rpx h-80 leading-10"
            @click="changeTypeShow = !changeTypeShow"
          >
            <text>已选{{ checkedUsers.length }}人</text>
          </view>
          <view
            class="ml-2 flex-2 text-center bg-white rounded-20rpx h-80 leading-10 flex items-center justify-center"
          >
            <text
              :class="[
                +numberObj.numberAll === 0 ? 'bg-gray-13' : 'bg-main',
                'inline-block h-24 px-6px color-white rounded-8px text-12 leading-3',
              ]"
            >
              {{ numberObj.numberAll || '0' }}
            </text>
            <up-icon
              class="ml-1"
              :name="numberObj.numberStar === 0 ? 'star' : 'star-fill'"
              size="16"
              color="#FBD71B"
            />
            {{ numberObj.numberStar || '0' }}
          </view>
        </view>
      </up-sticky>

      <!-- 列表内容 -->
      <view class="px-10 pt-2">
        <follow-item
          v-for="(item, index) in list"
          :key="index"
          :item="item"
          @listClick="listClick"
          @addStarClick="addStarClick"
          @editClick="editClick"
          @clickChange="clickChange"
          @commentClick="commentClick"
        />
        <app-empty
          v-if="!isFirstLoad && !paginationLoading && !list.length"
          class="py-7 bg-white"
          description="暂无数据"
        />
        <view v-if="isFirstLoad" class="flex justify-center py-20 bg-white">
          <up-loading-icon mode="circle" color="#2271F5" />
        </view>
        <up-loadmore
          v-if="!isFirstLoad && (paginationLoading || list.length < totalNum)"
          :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
        />
      </view>
    </view>

    <!-- 拜访计划条件筛选按钮 -->
    <app-fix-btn v-if="buttonShow && activeTab === 1" text="条件筛选" @click="filterPlanClick" />

    <!-- 客情记录底部操作按钮 -->
    <app-fix-btn
      v-if="!buttonShow || activeTab === 2"
      v-show="!checkedUsers.length"
      text="客情新增"
      icon="a-xingzhuang2"
      @click="addClick"
    />
    <app-fix-btn
      v-if="(!buttonShow || activeTab === 2) && checkedUsers.length"
      text="本人客情"
      icon="juxing1"
      @click="resetToMyReport"
    />

    <!-- 日期弹框 -->
    <app-calendar
      v-if="dateRange.length === 2"
      ref="calendarRef"
      mode="range"
      :firstDayOfWeek="1"
      :date="dateRange.map((d: Date) => time.format(d, time.FORMATS.ISO_DATE))"
      :startDate="time.format(new Date(2020, 0, 1), time.FORMATS.ISO_DATE)"
      @confirm="calendarConfirm"
    />

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="onTreeConfirm"
    />

    <!-- 批注 -->
    <Comment
      v-if="commentShow"
      :commentShow="commentShow"
      @closeClick="commentShow = false"
      @sureComment="sureComment"
    />

    <!-- 打卡信息 -->
    <biz-clock-in
      v-model="showAdressPicker"
      :detailClock="appStore.detailObj?.cciId"
      :visitDate="visitDate"
      @adressOnConfirm="adressOnConfirm"
      @addressChoose="addressChoose"
      @adressCancel="adressCancel"
    />

    <!-- 客情标签 -->
    <CustomLabel
      v-if="customerLabelShow"
      :activeName="0"
      :customerLabelShow="customerLabelShow"
      @closeClick="customerLabelShow = false"
    />

    <!-- 拜访计划筛选弹窗 -->
    <up-popup v-model="showFilter" mode="bottom" :round="10" closeable>
      <view class="px-20 pb-30 font-14" style="padding-top: 40px">
        <view class="text-center text-16 font-bold mb-20">高级筛选</view>

        <!-- 客户ID/名称 -->
        <up-form-item label="客户ID/名称">
          <up-input v-model="filterObj.customer" placeholder="点击输入客户ID/名称" clearable />
        </up-form-item>

        <!-- 核算单元 -->
        <up-form-item label="核算单元">
          <up-input
            v-model="filterObj.accountUnit"
            placeholder="点击选择核算单元"
            readonly
            @click="showAccountUnitPopup = true"
          />
        </up-form-item>

        <!-- 预约拜访类型 -->
        <up-form-item label="预约拜访类型">
          <up-input
            v-model="filterObj.visitType"
            placeholder="点击选择预约拜访类型"
            readonly
            @click="showVisitTypePopup = true"
          />
        </up-form-item>

        <view class="flex justify-between mt-20">
          <up-button text="重置" @click="filterRefresh" style="width: 48%" />
          <up-button text="确定" type="primary" @click="handleFilterOk" style="width: 48%" />
        </view>
      </view>
    </up-popup>

    <!-- 预约拜访类型选择弹窗 -->
    <up-picker
      v-model="showVisitTypePopup"
      :columns="[visitTypes]"
      keyName="text"
      @confirm="onVisitTypeConfirm"
      @cancel="showVisitTypePopup = false"
    />

    <!-- 核算单元选择弹窗 -->
    <up-picker
      v-model="showAccountUnitPopup"
      :columns="[accountUnitList]"
      @confirm="onAccountUnitConfirm"
      @cancel="showAccountUnitPopup = false"
    />
  </view>
</template>

<style lang="scss" scoped>
.tab-content {
  padding: 10px 0;
  min-height: 400px;
  background-color: #f5f5f5;
}

.recommendation-item {
  background-color: #fff;
  border-radius: 8px;
  margin: 10px 15px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .recommendation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;

    .customer-type {
      background-color: #2271f5;
      color: #fff;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .company-name {
      background-color: #e7e7e7;
      color: #333;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-left: 8px;
    }
  }

  .recommendation-info {
    .info-row {
      margin-bottom: 8px;

      .info-label {
        color: #666;
        font-size: 14px;
        display: inline-block;
        width: 80px;
      }

      .info-value {
        color: #333;
        font-size: 14px;
        word-break: break-all;
        margin-left: 5px;
      }
    }
  }
}
</style>
