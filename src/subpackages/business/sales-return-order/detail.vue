<template>
  <view>
    <app-watermark></app-watermark>

    <up-sticky style="top: 0">
      <view class="pa-2 bg-white">
        <view class="tag-primary mb-2">
          {{ detailData?.entryId }}/{{ detailData?.entryName }}
        </view>
        <app-infor-item class="mb-2" title="收货总单ID" :content="detailData?.redocId" />
        <app-infor-item class="mb-2" title="销退申请总单ID" :content="detailData?.fetchId" />
        <app-infor-item
          class="mb-2"
          title="客户"
          :content="`${detailData?.custId}/${detailData?.custName}`"
        />
        <app-infor-item
          class="mb-2"
          title="分支机构"
          :content="
            detailData?.contactId ? `${detailData?.contactId}/${detailData?.contactName}` : '--'
          "
        />
        <app-infor-item class="mb-2" title="收货日期" :content="detailData?.receiptDate" />
        <app-infor-item class="mb-2" title="总单备注" :content="detailData?.docMemo || '--'" />
      </view>
    </up-sticky>

    <view class="pb-100">
      <view class="card-content bg-white ma-2 rd-md">
        <!-- 货品信息 -->
        <view class="pa-2">
          <view class="tag-primary mb-2">
            {{ detailData?.goodsId }}/{{ detailData?.goodsName }}
          </view>
          <app-infor-item class="mb-2" title="规格" :content="detailData?.goodsType" />
          <app-infor-item class="mb-2" title="厂家" :content="detailData?.factoryName" />
          <app-infor-item class="mb-2" title="订单总数量">
            <text class="color-main">{{ detailData?.oldGoodsQty }}</text>
          </app-infor-item>
          <app-infor-item class="mb-2" title="验收总数量">
            <text class="color-main">{{ detailData?.rggoodsQty }}</text>
          </app-infor-item>
          <app-infor-item class="mb-2" title="批号" :content="detailData?.lotNo" />
          <app-infor-item
            class="mb-2"
            title="有效期至"
            :content="detailData?.invalidDate ? detailData.invalidDate.split(' ')[0] : '--'"
          />
          <app-infor-item class="mb-2" title="货品状态">
            <text class="color-normal">{{ detailData?.goodsStatus }}</text>
          </app-infor-item>
        </view>

        <!-- 价格选择 -->
        <view class="price-selector pb-2 px-2">
          <!-- 已处理：显示选中的价格 -->
          <view v-if="saleReturnType === 2" class="price-card price-card-active">
            <view class="flex flex-col">
              <text class="pb-2">
                入库单价
                <text v-if="detailData?.priceType">
                  ({{
                    detailData?.priceType === 1
                      ? '收货单价'
                      : detailData?.priceType === 2
                        ? '销售原单单价'
                        : detailData?.priceType === 3
                          ? '销售单折后单价'
                          : ''
                  }})
                </text>
              </text>
              <text class="font-bold">{{ detailData?.realPrice }}</text>
            </view>
          </view>

          <!-- 未处理：可选择价格 -->
          <view v-else class="flex gap-2">
            <view
              v-for="item in priceList"
              :key="item.type"
              class="price-card flex-1"
              :class="{ 'price-card-active': selectedPrice?.type === item.type }"
              @click="handlePriceSelect(item)"
            >
              <view class="flex justify-between align-center">
                <view class="flex flex-col">
                  <text class="pb-2">{{ item.label }}</text>
                  <text class="font-bold">{{ item.value }}</text>
                </view>
                <up-icon
                  v-if="selectedPrice?.type === item.type"
                  name="checkbox-mark"
                  color="#2271F5"
                  size="20"
                />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <app-bottom-actions v-if="saleReturnType === 1">
      <view class="flex w-full">
        <app-action-btn class="flex-1" text="取消" @click="uni.navigateBack()" />
        <app-action-btn
          class="flex-1 ml-2"
          type="primary"
          text="确定点单"
          @click="handleConfirmOrder(identityObj)"
        />
      </view>
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
import { useSalesReturnDetail } from './composables/use-sales-return-detail';
import { useSalesReturn } from './composables/use-sales-return';

const { identityObj } = useSalesReturn();

const {
  saleReturnType,
  detailData,
  priceList,
  selectedPrice,
  fetchDetail,
  handlePriceSelect,
  handleConfirmOrder,
} = useSalesReturnDetail();

onLoad(async options => {
  const { redocId, status } = options || {};
  await fetchDetail({
    redocId,
    status: Number(status),
  });
});
</script>

<style lang="scss" scoped>
.tag-primary {
  background: rgba(#2271f5, 0.1);
  border-radius: 4rpx;
  color: #2271f5;
  padding: 10rpx;
  display: inline-block;
}

.card-content {
  box-shadow: 0 2rpx 12rpx 2rpx rgb(209 207 207 / 30%);
}

.price-selector {
  .gap-2 {
    gap: 8rpx;
  }
}

.price-card {
  padding: 20rpx;
  border-radius: 8rpx;
  border: 2rpx solid #dcdee0;
  background: #fff;
  transition: all 0.3s;

  &-active {
    background: #e8f1fe;
    border-color: #2271f5;
    color: #2271f5;
  }
}

.fixed-bottom-btns {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 32rpx;
  background: #fff;
  display: flex;
  gap: 16rpx;
  box-shadow: 0 -2rpx 10rpx rgb(0 0 0 / 5%);
}
</style>
