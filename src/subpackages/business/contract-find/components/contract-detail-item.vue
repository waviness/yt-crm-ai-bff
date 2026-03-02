<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  data: any;
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  click: [type: number, data: any];
}>();

const onClick = (type: number) => {
  emit('click', type, props.data);
};
</script>

<template>
  <view class="gray-block shadow-view rounded-8rpx">
    <view class="bg-white p-10 rounded-t-8rpx">
      <view class="flex justify-between items-center">
        <view class="tag-blue">{{ data.conDtlId }}</view>
        <view v-if="data.useStatus === 1" class="tag-green">已分配</view>
        <view v-else-if="data.useStatus === 0" class="tag-red">未分配</view>
      </view>

      <app-infor-item
        title="销售单总单ID"
        :content="data.salesId && data.salesId.length ? data.salesId.join('、') : '-'"
        class="block mt-2"
        hasCopy
      />

      <app-infor-item
        title="品种"
        :content="`${data.goodsId}/${data.goodsName}`"
        class="block mt-2"
      />

      <app-infor-item title="规格" :content="data.goodsType" class="block mt-2" />

      <app-infor-item title="产地" :content="data.factory" class="block mt-2" />

      <app-infor-item title="总金额" :content="String(data.total)" class="block mt-2" />

      <app-infor-item title="合同数量" :content="String(data.goodsQty)" class="block mt-2" />

      <app-infor-item title="累计执行数量" :content="data.accstQty || '-'" class="block mt-2" />

      <app-infor-item
        title="采购员"
        :content="data.supplyerName"
        contentClass="tag-blue"
        class="block mt-2"
      />
    </view>

    <view class="inner-block flex justify-end items-center p-10 bg-gray-1 rounded-b-8rpx">
      <up-button
        type="primary"
        size="small"
        :customStyle="{
          width: '90px',
          height: '28px',
          fontSize: '12px',
          borderRadius: '28px',
          background: 'transparent',
          color: '#2271F5',
          border: '1px solid #2271F5',
        }"
        @click="onClick(1)"
      >
        物流
      </up-button>

      <up-button
        type="primary"
        size="small"
        :customStyle="{
          width: '90px',
          height: '28px',
          fontSize: '12px',
          borderRadius: '28px',
          marginLeft: '12px',
          background: '#2271F5',
          color: '#fff',
        }"
        @click="onClick(2)"
      >
        两票制
      </up-button>
    </view>
  </view>
</template>

<style scoped>
.gray-block {
  background: #f5f5f5;
}

.inner-block {
  border-top: 1px solid #eee;
}

:deep(.tag-blue) {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #2271f5;
  background: #e8f3ff;
  border-radius: 4rpx;
}

.tag-green {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #07c160;
  background: #e7f7ed;
  border-radius: 4rpx;
}

.tag-red {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #ee0a24;
  background: #fef0f0;
  border-radius: 4rpx;
}
</style>
