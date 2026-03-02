<template>
  <view>
    <app-watermark></app-watermark>
    <view class="pa-2">
      <!-- 商品卡片 -->
      <two-pin-goods-card :item="goodsInfo" :isRouter="true" />

      <!-- 详情卡片列表 -->
      <view class="detail-content">
        <view
          v-for="(data, index) in goodsDtlList"
          :key="index"
          class="detail-card bg-white mb-2 rd-md"
        >
          <!-- 左滑操作 -->
          <up-swipe-action>
            <up-swipe-action-item
              :options="getSwipeOptions(index)"
              @click="handleSwipeClick($event, index)"
            >
              <view class="detail-card-top pa-2" @click="showMore(index)">
                <view class="flex items-center mb-2">
                  <view class="goods-status">{{ data.goodsStatus }}</view>
                  <text class="ml-auto color-gray-4">批号：</text>
                  <text class="font-14 font-bold">{{ data.lotno }}</text>
                  <up-icon
                    name="arrow-down"
                    class="ml-2 font-14 detail-arrow"
                    :class="{ active: chooseIndex === index }"
                  ></up-icon>
                </view>
                <view class="flex items-center justify-between line-text">
                  <text class="color-gray-4">可销库存</text>
                  <text>{{ data.mindtlgoodsqty }}</text>
                </view>
                <view class="flex items-center justify-between line-text">
                  <text class="color-gray-4">二销库存</text>
                  <text>{{ data.dtlsecgoodsqty }}</text>
                </view>
                <view class="flex items-center justify-between line-text">
                  <text class="color-gray-4">保管账</text>
                  <text>{{ data.storageName }}</text>
                </view>
                <view class="flex items-center justify-between line-text-last">
                  <text class="color-gray-4">效期</text>
                  <text>
                    {{ data.invalidDate?.substring(0, 10) }}
                    <text class="color-main">({{ data.diffDay }}天)</text>
                  </text>
                </view>
              </view>

              <!-- 展开的任务列表 -->
              <view class="detail-card-bottom" :class="{ active: chooseIndex === index }">
                <view class="more-block bg-gray-1"></view>
                <view
                  v-for="(task, taskIndex) in data.pqcsImgRecordList"
                  :key="taskIndex"
                  class="task-div flex items-center justify-between"
                >
                  <view>
                    <view class="flex items-center line-text-task">
                      <text class="text-head-1 color-gray-4">创建时间</text>
                      <text>{{ task.createTime }}</text>
                    </view>
                    <view class="flex items-center line-text-task">
                      <text class="text-head-1 color-gray-4">创建人</text>
                      <text>{{ task.sponsorId }}/{{ task.sponsorName }}</text>
                    </view>
                  </view>
                  <up-button
                    :text="activeTab === 1 ? '查看' : '上传'"
                    type="primary"
                    plain
                    shape="circle"
                    size="small"
                    :customStyle="{ width: '180rpx', height: '56rpx', fontSize: '24rpx' }"
                    @click.stop="handleTaskClick(task, index)"
                  >
                    {{ activeTab === 1 ? '查看照片' : '上传照片' }}
                  </up-button>
                </view>
              </view>
            </up-swipe-action-item>
          </up-swipe-action>
        </view>
      </view>
    </view>

    <!-- 上传/查看照片弹窗 -->
    <up-popup
      v-model:show="showPopup"
      mode="bottom"
      round
      closeable
      :customStyle="{ height: 'calc(100% - 30rpx)', paddingTop: '10rpx' }"
    >
      <view class="popup-content">
        <view class="popup-title text-16 font-bold text-center py-2">
          {{ isAll ? '批量处理' : activeTab === 1 ? '查看照片' : '上传照片' }}
        </view>

        <!-- 商品信息 -->
        <view class="popup-info ma-2 pa-2 rd-md border-1 border-gray-3">
          <view class="flex items-center mb-2">
            <view class="goods-status">{{ nowGoods.goodsStatus }}</view>
            <text class="font-13 font-bold ml-2">
              {{ nowGoods.goodsId }}/{{ nowGoods.goodsName }}
            </text>
          </view>
          <view class="flex items-center mb-2">
            <text class="color-gray-4">批号：</text>
            <text class="font-14 font-bold">{{ nowGoods.lotno }}</text>
          </view>
          <view class="flex items-center mb-2">
            <text class="color-gray-4">规格：</text>
            <text>{{ nowGoods.goodstype }}</text>
          </view>
          <view class="flex items-center mb-2">
            <text class="color-gray-4">厂家：</text>
            <text>{{ nowGoods.factoryname }}</text>
          </view>
          <view v-if="nowTask" class="flex items-center mb-2">
            <text class="color-gray-4">创建时间：</text>
            <text>{{ nowTask.createTime }}</text>
          </view>
          <view v-if="nowTask" class="flex items-center">
            <text class="color-gray-4">发起人：</text>
            <text>{{ nowTask.sponsorId }}/{{ nowTask.sponsorName }}</text>
          </view>
        </view>

        <!-- 批量处理提示 -->
        <view v-if="isAll && !activeTab" class="all-info color-red mt-2 px-2 bg-red-1">
          批量处理所有发起
        </view>

        <!-- 上传区域 -->
        <view v-if="!activeTab" class="upload-div mx-4 mt-2" :class="{ active: isAll }">
          <up-upload
            v-model="fileList"
            :maxCount="20"
            multiple
            :previewFullImage="true"
            width="160"
            height="160"
          ></up-upload>
        </view>

        <!-- 查看照片区域 -->
        <scroll-view v-else class="img-content mx-4 mt-2" scroll-y @scrolltolower="loadMoreImages">
          <view class="flex flex-wrap">
            <image
              v-for="(img, imgIndex) in imgList"
              :key="imgIndex"
              :src="img"
              mode="aspectFill"
              class="img-item"
              @click="previewImage(imgIndex)"
            />
          </view>
          <view v-if="imgLoading" class="text-center py-2 color-gray-5">加载中...</view>
          <view v-else-if="finished" class="text-center py-2 color-gray-5">没有更多了</view>
        </scroll-view>

        <!-- 操作按钮 -->
        <view v-if="!activeTab" class="popup-button-div ma-4 flex">
          <up-button
            text="取消"
            plain
            shape="circle"
            class="flex-1 mr-2"
            @click="showPopup = false"
          ></up-button>
          <up-button
            text="提交"
            type="primary"
            shape="circle"
            class="flex-1"
            @click="submitPhotos"
          ></up-button>
        </view>
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import twoPinGoodsCard from './components/two-pin-goods-card.vue';
import { useTwoPinDetail } from './composables/use-two-pin-detail';

const appStore = useAppStore();

const {
  goodsInfo,
  activeTab,
  goodsDtlList,
  chooseIndex,
  showPopup,
  isAll,
  nowGoods,
  nowTask,
  fileList,
  imgList,
  imgLoading,
  finished,
  isFromMessage,
  showMore,
  handleTaskClick,
  handleBatchProcess,
  submitPhotos,
  loadMoreImages,
  previewImage,
  getSwipeOptions,
  handleSwipeClick,
  init,
} = useTwoPinDetail();

onLoad(async options => {
  await init(options);
});

onShow(() => {
  // 如果从消息模块跳转，不需要处理返回刷新
  if (!isFromMessage.value) {
    // 这里可以添加从列表返回后的刷新逻辑
  }
});
</script>

<style lang="scss" scoped>
.detail-content {
  .detail-card {
    box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);

    .detail-card-top {
      .line-text {
        height: 33rpx;
        margin-bottom: 12rpx;
      }

      .line-text-last {
        height: 33rpx;
        margin-bottom: 0;
      }

      .detail-arrow {
        transition: transform 0.3s;

        &.active {
          transform: rotate(180deg);
        }
      }
    }

    .detail-card-bottom {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.3s ease;

      &.active {
        max-height: 2000rpx;
      }

      .more-block {
        height: 16rpx;
      }

      .task-div {
        padding: 16rpx;
        border-bottom: 1rpx solid #ebedf0;

        &:last-child {
          border-bottom: none;
        }

        .line-text-task {
          margin-bottom: 8rpx;

          &:last-child {
            margin-bottom: 0;
          }
        }

        .text-head-1 {
          width: 108rpx;
        }
      }
    }
  }
}

.goods-status {
  height: 40rpx;
  line-height: 40rpx;
  padding: 0 22rpx;
  color: #fff;
  background: #ea394b;
  border-radius: 3rpx;
  font-size: 24rpx;
}

.popup-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .all-info {
    height: 80rpx;
    line-height: 80rpx;
    background: rgb(234 57 75 / 10%);
  }

  .upload-div {
    flex: 1;
    overflow-y: auto;

    &.active {
      flex: 1;
    }
  }

  .img-content {
    flex: 1;
    overflow-y: auto;

    .img-item {
      width: calc(25% - 16rpx);
      height: 160rpx;
      margin-right: 16rpx;
      margin-bottom: 16rpx;
      border-radius: 8rpx;

      &:nth-child(4n) {
        margin-right: 0;
      }
    }
  }

  .popup-button-div {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
