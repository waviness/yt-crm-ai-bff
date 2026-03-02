<template>
  <view>
    <app-watermark></app-watermark>
    <view class="bg-white pa-4 mb-2 rd-md">
      <view class="flex justify-between mb-2">
        <text class="font-bold">{{ detailInfo.projectName }}</text>
        <text class="tag-primary">{{ detailInfo.projectTypeName }}</text>
      </view>
      <view class="flex justify-between mb-2">
        <text class="text-12">已关联品种</text>
        <text class="font-bold color-main text-16">{{
          detailInfo.projectGoodsResList?.length || 0
        }}</text>
      </view>
      <view class="flex justify-between mb-3">
        <text class="text-12">业务员数</text>
        <text class="font-bold text-16">{{ detailInfo.projectUserResList?.length || 0 }}</text>
      </view>

      <view class="title-bar mb-2">
        <view class="title-line"></view>
        <text class="title-text">项目描述</text>
      </view>
      <text class="text-12">{{ detailInfo.projectInfo || '-' }}</text>
    </view>

    <view class="bg-white">
      <!-- ✅ 修复1: 添加 :scrollable="false" 让tab居中 -->
      <up-tabs
        :list="tabList"
        :current="activeTab"
        :scrollable="false"
        @change="handleTabChange"
      ></up-tabs>

      <!-- Tab内容区 -->
      <view class="tab-content pa-2">
        <!-- 相关资料 -->
        <view v-show="activeTab === 0">
          <view v-if="!detailInfo.fileVOList?.length" class="empty-box">
            <up-empty mode="data" text="暂无数据"></up-empty>
          </view>
          <view
            v-for="(file, index) in detailInfo.fileVOList"
            :key="index"
            class="file-item flex items-center"
            @click="downloadFile(file)"
          >
            <up-icon name="file-text" size="16" color="#666" class="mr-2"></up-icon>
            <text class="file-name">{{ file.fileName }}</text>
          </view>
        </view>

        <!-- 相关品种 -->
        <view v-show="activeTab === 1">
          <view v-if="!detailInfo.projectGoodsResList?.length" class="empty-box">
            <up-empty mode="data" text="暂无数据"></up-empty>
          </view>
          <view
            v-for="(goods, index) in detailInfo.projectGoodsResList"
            :key="index"
            class="goods-card pa-3 mb-2 rd-md"
          >
            <!-- 商品名称标题 -->
            <view class="goods-title mb-3 font-bold">{{ goods.goodsName }}</view>

            <!-- ✅ 修复2: 两列布局 -->
            <view class="goods-content">
              <!-- 第一行：规格 + 医保支付价格 -->
              <view class="goods-row mb-2">
                <view class="goods-item">
                  <text class="item-label">规格</text>
                  <text class="item-value">{{ goods.goodsType }}</text>
                </view>
                <view class="goods-item">
                  <text class="item-label">医保支付价格</text>
                  <text class="item-value">{{ goods.medicarePrice || '--' }}</text>
                </view>
              </view>

              <!-- 第二行：单位 + 医保类型 -->
              <view class="goods-row mb-2">
                <view class="goods-item">
                  <text class="item-label">单位</text>
                  <text class="item-value">{{ goods.goodsUnit }}</text>
                </view>
                <view class="goods-item">
                  <text class="item-label">医保类型</text>
                  <text class="item-value">{{ goods.medicareTypeName || '--' }}</text>
                </view>
              </view>

              <!-- 第三行：厂家 + 产品类型 -->
              <view class="goods-row mb-2">
                <view class="goods-item">
                  <text class="item-label">厂家</text>
                  <text class="item-value">{{ goods.factoryName || '--' }}</text>
                </view>
                <view class="goods-item">
                  <text class="item-label">产品类型</text>
                  <text class="item-value">{{ goods.productTypeName || '--' }}</text>
                </view>
              </view>

              <!-- 第四行：集采情况（单独一行） -->
              <view class="goods-row-single">
                <text class="item-label">集采情况</text>
                <text class="item-value">{{ goods.centrCapInfo || '--' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 关联业务员 -->
        <view v-show="activeTab === 2">
          <view v-if="!detailInfo.projectUserResList?.length" class="empty-box">
            <up-empty mode="data" text="暂无数据"></up-empty>
          </view>
          <view
            v-for="(user, index) in detailInfo.projectUserResList"
            :key="index"
            class="file-item"
          >
            <text>{{ user.userId }} / {{ user.userName }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useProjectDetail } from './composables/use-project-detail';
import type { ProjectItem } from './types';

const { detailInfo, activeTab, downloadFile } = useProjectDetail();

const tabList = reactive([{ name: '相关资料' }, { name: '相关品种' }, { name: '关联业务员' }]);

const handleTabChange = ({ index }: { index: number }) => {
  activeTab.value = index;
};

onLoad(async options => {
  const { projectId, projectData } = options || {};

  // 方式1: 如果从列表页传递了完整数据
  if (projectData) {
    detailInfo.value = JSON.parse(projectData);
  }
});
</script>

<style lang="scss" scoped>
.tag-primary {
  padding: 4rpx 16rpx;
  border-radius: 4rpx;
  background: rgb(34 113 245 / 10%);
  color: #2271f5;
  font-size: 24rpx;
}

.title-bar {
  display: flex;
  align-items: center;

  .title-line {
    width: 6rpx;
    height: 28rpx;
    background: #2271f5;
    border-radius: 3rpx;
    margin-right: 12rpx;
  }

  .title-text {
    font-size: 28rpx;
    font-weight: 500;
  }
}

.tab-content {
  min-height: 400rpx;
}

.empty-box {
  padding: 100rpx 0;
}

.file-item {
  padding: 24rpx 32rpx;
  border-bottom: 1px solid #ebedf0;
  font-size: 24rpx;

  .file-name {
    flex: 1;
    word-break: break-all;
  }
}

.goods-card {
  border: 1px solid #979797;
  background: white;
  border-radius: 20rpx;

  .goods-title {
    font-size: 28rpx;
    color: #333;
  }

  .goods-content {
    font-size: 24rpx;
  }

  // ✅ 两列布局样式
  .goods-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24rpx;
  }

  .goods-item {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-label {
      color: #909399;
      font-size: 24rpx;
      white-space: nowrap;
      margin-right: 16rpx;
    }

    .item-value {
      color: #303133;
      font-size: 24rpx;
      text-align: left;
      flex: 1;
    }
  }

  // 单行布局（集采情况）
  .goods-row-single {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-label {
      color: #909399;
      font-size: 24rpx;
      white-space: nowrap;
    }

    .item-value {
      color: #303133;
      font-size: 24rpx;
      text-align: left;
      flex: 1;
      margin-left: 16rpx;
    }
  }
}
</style>
