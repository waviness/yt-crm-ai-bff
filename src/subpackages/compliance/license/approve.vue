<script setup lang="ts">
/**
 * 证照审批页面
 * 为审批人员提供证照和委托书的审批功能
 */

import licenseFilterPop from './components/license-filter-pop.vue';
import licenseItem from './components/license-item.vue';
import { useLicenseApprove } from './composables/use-license-approve';

const appStore = useAppStore();

// 审批页面特有的状态列表
const statusList = ref([{ name: '待审批' }, { name: '已审批' }]);

// 使用审批页业务逻辑组合式API
const licenseBusiness = useLicenseApprove();
const {
  config,
  formData,
  fetchApprovalLicenseData,
  handleActiveChange,
  handleTypeChange,
  handleFilterChange,
  handleAgreeChange,
  toDetail,
} = licenseBusiness;

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 138,
  },
  fetchApprovalLicenseData
);

const { list, totalNum, refreshing, loadmoreConfig, pullRefreshHeight, calcPullRefreshHeight } =
  pagination;

/**
 * 标签页切换处理
 */
const handleTabChange = (val: { index: number }) => {
  handleActiveChange(val);
  pagination.onRefresh();
};

/**
 * 证照类型切换处理
 */
const handleTypeChangeWrapper = (filterVal: any, val: number) => {
  handleTypeChange(filterVal, val);
  pagination.onRefresh();
};

/**
 * 筛选条件变化处理
 */
const handleFilterChangeWrapper = (filterData: any) => {
  handleFilterChange(filterData);
  pagination.onRefresh();
};

/**
 * 审批状态切换处理
 */
const handleAgreeChangeWrapper = () => {
  handleAgreeChange(config.value.agreeActive === 3 ? 4 : 3);
  pagination.onRefresh();
};

/**
 * 页面生命周期处理
 */
onMounted(() => {
  calcPullRefreshHeight();
  pagination.onRefresh();
  appStore.setHadDoneOnDetail(false);
});

onShow(() => {
  // 从详情页返回时刷新数据
  if (appStore.hadDoneOnDetail) {
    // 触发数据刷新
    pagination.onRefresh();
    // 重置状态
    appStore.setHadDoneOnDetail(false);
  }
});

onReachBottom(() => {
  // 触发加载更多数据
  pagination.onLoadMore();
});
</script>

<template>
  <app-watermark> </app-watermark>
  <up-sticky style="top: 0">
    <license-filter-pop
      :formData="formData"
      :licenseType="config.licenseType"
      @typeChange="handleTypeChangeWrapper"
      @confirm="handleFilterChangeWrapper"
    />
    <app-tabs :current="config.current" :list="statusList" @change="handleTabChange" />
  </up-sticky>

  <view class="px-10 py-2 flex items-center">
    <!-- 根据当前状态显示不同的描述文字 -->
    {{
      config.current === 1 ? (config.agreeActive === 3 ? '审批通过' : '审批未通过') : '当前待处理'
    }}
    <view class="color-main mx-1">{{ totalNum }}</view>
    项
  </view>
  <app-pull-refresh
    :refreshing="refreshing"
    :loadmoreProps="loadmoreConfig"
    :pullRefreshHeight="pullRefreshHeight"
    @refresh="pagination.onRefresh"
    @loadmore="pagination.onLoadMore"
  >
    <view class="px-10">
      <license-item
        class="block mb-2"
        v-for="(item, idx) in list"
        :key="idx"
        :licenseType="config.licenseType"
        :current="config.current"
        :data="item"
        :listType="2"
        @click="toDetail(item)"
      />
    </view>
  </app-pull-refresh>
  <!-- 已审批状态下的切换按钮 -->
  <app-fix-btn
    v-if="config.current === 1"
    :text="config.agreeActive === 4 ? '显示已通过' : '显示未通过'"
    :icon="`${config.agreeActive === 4 ? 'shenhebutongguo1' : 'shenhebutongguo'}`"
    bold
    @click="handleAgreeChangeWrapper"
  />
</template>
