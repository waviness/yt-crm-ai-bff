<template>
  <view class="pb-100">
    <app-watermark></app-watermark>

    <!-- 搜索框 -->
    <view class="search-bar pa-2 bg-white">
      <up-search
        v-model="searchValue"
        placeholder="请输入客户ID|名称"
        :readonly="true"
        @click="fullPopShow = true"
      ></up-search>
    </view>

    <!-- 排行榜（未选择客户时显示） -->
    <customer-analysis-rank-list
      v-if="!curCustom.custName"
      :loading="loading"
      :typeList="typeList"
      :list="rankList"
      @select="onSelectCustomer"
    />

    <!-- 客户详情（选择客户后显示） -->
    <view v-else class="pa-2">
      <!-- 客户基本信息卡片 -->
      <view class="info-card bg-white rd-md pa-3 mb-2">
        <view class="flex justify-between mb-2">
          <text class="font-14 font-bold">{{ dataSource.custId || '' }}/</text>
          <text class="font-bold">{{ dataSource.className }}</text>
        </view>

        <!-- 客户名称（可展开） -->
        <view
          class="customer-name-wrapper flex items-center"
          @click="showFullTitle = !showFullTitle"
        >
          <text
            class="customer-name font-14 font-bold flex-1"
            :class="{ 'line-clamp-1': !showFullTitle }"
          >
            {{ dataSource.custName || '' }}
          </text>
          <up-icon
            v-if="titleOverflow"
            name="arrow-down"
            class="ml-2"
            :class="{ rotate: showFullTitle }"
          ></up-icon>
        </view>

        <!-- 详细信息 -->
        <view class="flex items-center mt-4">
          <view class="flex-3 flex items-center">
            <text class="color-gray-4 label-width">经营性质</text>
            <text class="font-bold text-12">
              {{
                +dataSource.isProfit === 1
                  ? '政府办'
                  : +dataSource.isProfit === 2
                    ? '非政府办营利'
                    : +dataSource.isProfit === 3
                      ? '非政府办非营利'
                      : ''
              }}
            </text>
          </view>
          <view class="flex-4 flex items-center">
            <text class="color-gray-4 label-width-b">年药品销售规模</text>
            <text class="font-bold text-12">{{ dataSource.yearSalesVolumeName }}</text>
          </view>
        </view>

        <view class="flex items-center mt-2">
          <view class="flex-3 flex items-center">
            <text class="color-gray-4 label-width">股东成分</text>
            <text class="font-bold text-12">{{ dataSource.shareholderCompose }}</text>
          </view>
          <view class="flex-4 flex items-center">
            <text class="color-gray-4 label-width-b">学术专线</text>
            <text class="font-bold text-12">{{ dataSource.scienceLineName }}</text>
          </view>
        </view>

        <view class="flex items-center mt-2">
          <text class="color-gray-4 label-width">活跃度</text>
          <text class="font-bold text-12">--</text>
        </view>
      </view>

      <!-- 业务员信息 -->
      <view class="info-card bg-white rd-md pa-3 mb-2">
        <view class="flex">
          <text class="color-gray-4 label-width">业务员</text>
          <view class="flex-1">
            <text v-for="(item, idx) in salersList" :key="idx" class="font-bold text-12 block mb-1">
              {{ item }}
            </text>
          </view>
        </view>
      </view>

      <!-- 近100天统计 -->
      <customer-analysis-recent :loading="countLoading" :eventCount="eventCount" @click="toList" />

      <!-- 相关人员 -->
      <view class="info-card bg-white rd-md mt-2 relative">
        <view class="pa-3 text-14 font-bold">相关人员</view>

        <!-- Tab切换（多个业务员时显示） -->
        <app-tabs
          v-if="dataSource.saleManList && dataSource.saleManList.length > 1"
          :list="dataSource.saleManList.map(item => ({ name: item.userName }))"
          :active="active"
          @change="
            ({ index }) => {
              active = index;
              getPersonList();
            }
          "
        />

        <!-- 加载状态 -->
        <app-local-loading :show="personLoading" />

        <!-- 空状态 -->
        <app-empty
          v-if="!personLoading && !personList.length"
          class="py-7"
          description="暂无相关人员"
        />

        <!-- 人员列表 -->
        <view v-else-if="!personLoading" class="person-list pa-3">
          <view
            v-for="(item, index) in personList"
            :key="index"
            class="person-item flex items-center justify-between"
            @click="toPerson(item)"
          >
            <view class="flex items-center flex-1">
              <text class="person-name text-14 color-black">{{ item.userName }}</text>
              <text class="text-14 ml-2 color-gray-5">{{ item.position }}</text>
            </view>
            <view class="flex items-center">
              <view
                v-if="item.warmthNum"
                class="warmth-tag text-12 mr-2"
                :class="`warmth-${item.warmthNum}`"
              >
                {{
                  item.warmthNum === 1
                    ? '一般客情'
                    : item.warmthNum === 2
                      ? '需进阶客情'
                      : '未接触客情'
                }}
              </view>
              <up-icon name="arrow-right" color="#969799" size="32rpx"></up-icon>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 搜索弹窗 -->
    <up-popup v-model:show="fullPopShow" mode="top" :customStyle="{ height: '100%' }">
      <view class="search-popup">
        <view class="search-header flex items-center pa-2">
          <up-search
            v-model="searchInput"
            placeholder="请输入客户ID|名称"
            @search="getCustList"
            @input="getCustList"
            :showAction="true"
          >
            <template #action>
              <text @click="fullPopShow = false">取消</text>
            </template>
          </up-search>
        </view>

        <!-- 搜索结果 -->
        <scroll-view class="search-results relative" scroll-y>
          <app-local-loading :show="custLoading" />
          <view v-if="!custLoading && custList.length">
            <view
              v-for="(item, index) in custList"
              :key="item.custId"
              class="search-item pa-3 border-b-1 border-gray-2"
              @click="onSelectCustomer(item)"
            >
              <text class="font-14">{{ item.custId }}/{{ item.custName }}</text>
            </view>
          </view>
          <app-empty v-else-if="!custLoading" class="mt-6" description="暂无数据"></app-empty>
        </scroll-view>
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import customerAnalysisRankList from './components/customer-analysis-rank-list.vue';
import customerAnalysisRecent from './components/customer-analysis-recent.vue';
import { useCustomerAnalysis } from './composables/use-customer-analysis';

const searchInput = ref('');

const {
  searchValue,
  fullPopShow,
  custLoading,
  custList,
  curCustom,
  dataSource,
  showFullTitle,
  titleOverflow,
  eventCount,
  countLoading,
  active,
  personList,
  personLoading,
  loading,
  typeList,
  rankList,
  salersList,
  getCustList: getCustListOriginal,
  onSelectCustomer,
  getPersonList,
  toList,
  toPerson,
  init,
} = useCustomerAnalysis();

// 包装搜索方法
const getCustList = () => {
  getCustListOriginal(searchInput.value);
};

onMounted(() => {
  init();
});

onShow(() => {
  // 从其他页面返回时检查是否需要刷新
});
</script>

<style lang="scss" scoped>
.info-card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}

.customer-name-wrapper {
  .rotate {
    transform: rotate(180deg);
    transition: transform 0.3s;
  }
}

.label-width {
  width: 110rpx;
  font-size: 24rpx;
}

.label-width-b {
  width: 184rpx;
  font-size: 24rpx;
}

.person-list {
  .person-item {
    padding: 24rpx 0;
    border-bottom: 1rpx solid #f2f2f2;

    &:last-child {
      border-bottom: none;
    }

    .person-name {
      width: 116rpx;
    }

    .warmth-tag {
      padding: 0rpx 12rpx;
      border-radius: 8rpx;
      color: #fff;

      &.warmth-1 {
        background: #00a870;
      }

      &.warmth-2 {
        background: #ed7b2f;
      }

      &.warmth-3 {
        background: #e34d59;
      }
    }
  }
}

.search-popup {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f5f6f9;

  .search-results {
    flex: 1;
    background: #fff;
  }

  .search-item {
    &:active {
      background: #f5f5f5;
    }
  }
}
</style>
