<template>
  <view class="pb-100">
    <app-watermark></app-watermark>

    <!-- 筛选栏 -->
    <up-sticky style="top: 0">
      <view class="filter-bar px-2 pt-2">
        <view
          class="filter-button flex justify-between items-center"
          :class="{
            'filter-button--active': filterText !== '条件筛选',
            'filter-button--show': filterShow,
          }"
          @click="filterShow = !filterShow"
        >
          <text>{{ filterText }}</text>
          <up-icon :name="filterShow ? 'arrow-up' : 'arrow-down'" size="32rpx"></up-icon>
        </view>
      </view>
    </up-sticky>

    <!-- 列表 -->
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <visit-item
          v-for="(item, idx) in list"
          :key="idx"
          :data="item"
          :isTogether="flag === 1"
          class="mb-2"
        />
      </view>
    </app-pull-refresh>

    <!-- 筛选弹窗 -->
    <up-popup v-model:show="filterShow" mode="top" round>
      <view class="filter-popup">
        <!-- 树形选择 -->
        <view class="filter-tree">
          <scroll-view class="tree-main" scroll-y>
            <view
              v-for="(item, index) in labelTreeList"
              :key="item.id"
              class="tree-main-item"
              :class="{ active: activeIndex === index }"
              @click="activeIndex = index"
            >
              <text>{{ item.text }}</text>
            </view>
          </scroll-view>

          <scroll-view class="tree-sub" scroll-y>
            <view
              v-for="child in labelTreeList[activeIndex]?.children || []"
              :key="child.id"
              class="tree-sub-item"
              :class="{ active: activeId === child.id }"
              @click="activeId = child.id"
            >
              <text>{{ child.text }}</text>
            </view>
          </scroll-view>
        </view>

        <!-- 操作按钮 -->
        <view class="filter-actions flex pa-3">
          <up-button text="重置" class="flex-1 mr-2" @click="reset"></up-button>
          <up-button text="确认" type="primary" class="flex-1" @click="onConfirm"></up-button>
        </view>
      </view>
    </up-popup>

    <!-- 底部按钮 -->
    <app-fix-btn
      :text="flag === 0 ? '协防' : '拜访'"
      :icon="flag === 0 ? 'home' : 'home'"
      @click="onFlagChange"
    />
  </view>
</template>

<script lang="ts" setup>
import visitItem from './components/visit-item.vue';
import { useCustomerAnalysisList } from './composables/use-customer-analysis-list';

// 获取路由参数
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];
const params: any = currentPage.options || {};

const { custId, isCabin, curMan: curManStr } = params;

let curMan;
try {
  curMan = curManStr ? JSON.parse(curManStr) : undefined;
} catch {
  curMan = undefined;
}

const {
  filterShow,
  activeId,
  activeIndex,
  labelTreeList,
  filterText,
  flag,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  getLabelTree,
  reset,
  onConfirm,
  onFlagChange,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useCustomerAnalysisList(custId, isCabin === 'true', curMan);

onMounted(async () => {
  await getLabelTree();
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped>
.filter-button {
  height: 80rpx;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background: #fff;
  font-size: 28rpx;

  &--active {
    color: #fff;
    background: #2271f5;
  }

  &--show {
    color: #2271f5;
  }
}

.filter-popup {
  .filter-tree {
    display: flex;
    height: 600rpx;

    .tree-main {
      width: 200rpx;
      background: #f7f8fa;

      .tree-main-item {
        padding: 24rpx 16rpx;
        font-size: 28rpx;
        color: #323233;

        &.active {
          background: #fff;
          font-weight: bold;
          border-left: 6rpx solid #2271f5;
        }
      }
    }

    .tree-sub {
      flex: 1;
      background: #fff;

      .tree-sub-item {
        padding: 24rpx 32rpx;
        font-size: 28rpx;
        color: #323233;

        &.active {
          color: #2271f5;
          font-weight: bold;
        }
      }
    }
  }

  .filter-actions {
    border-top: 1rpx solid #ebedf0;
  }
}
</style>
