<script setup lang="ts">
/**
 * 应收管理项目组件
 * 显示应收管理列表项的基本信息
 */

import TypeCircle from './type-circle.vue';
import type { ReceivableTabType } from '../types';

// 定义组件属性
interface Props {
  data: any;
  active: ReceivableTabType;
}

const props = defineProps<Props>();

const dataTypeClass = computed(() => {
  const classArr = ['', 'color-danger', 'color-warning', 'color-main'];
  return classArr[props.data.type];
});
// 定义事件
const emit = defineEmits<{
  click: [item: any];
  onBtnClick: [type: number, item: any];
}>();

// 点击项目
const onClick = () => {
  emit('click', props.data);
};

// 点击按钮
const onBtnClick = (type: number) => {
  emit('onBtnClick', type, props.data);
};
</script>

<template>
  <view
    class="mb-2 rounded-16rpx bg-gray-10 shadow-[0_4rpx_16rpx_1rpx_rgba(0,0,0,0.1)]"
    @click="onClick"
  >
    <view class="rounded-16rpx bg-white p-10">
      <view class="flex justify-between font-bold">
        <type-circle :type="data.type" :active="active" />
        <view class="ml-2 flex items-baseline">
          核算单元
          <view class="ml-1">{{ data.entryId }}</view>
        </view>
      </view>

      <view class="font-bold pt-10">{{ data.customId }}/{{ data.customName }}</view>

      <app-infor-item
        title="业务员"
        :content="`${data.saleId}/${data.saleName}`"
        class="block mt-2"
      />

      <!-- 逾期预警 -->
      <template v-if="active === 1">
        <app-infor-item title="应收账款" :content="data.receivable" class="block mt-2" />
        <app-infor-item
          title="已逾期"
          :content="data.overdueAmount"
          :content-class="data.overdueAmount > 0 ? 'color-warning' : ''"
          class="block mt-2"
        />
        <app-infor-item title="预收未处理" :content="data.advanceAmount || 0" class="block mt-2" />
      </template>

      <!-- 逾期原因填报 -->
      <template v-else-if="active === 2">
        <app-infor-item
          title="逾期金额"
          :content="data.overdueAmount"
          :content-class="data.overdueAmount > 0 ? 'color-danger' : ''"
          class="block mt-2"
        />
        <app-infor-item title="预收未处理" :content="data.advanceAmount || 0" class="block mt-2" />
        <app-infor-item title="信保天数" :content="data.creditDays" class="block mt-2" />
      </template>

      <!-- 预收预警 -->
      <template v-else>
        <app-infor-item title="逾期金额" :content="data.overdueAmount" class="block mt-2" />
        <app-infor-item title="预收未处理" :content="data.unMixedMoney || 0" class="block mt-2" />
        <app-infor-item
          title="最早挂账天数"
          :content="data.maxDay"
          :contentClass="dataTypeClass"
          class="block mt-2"
        />
      </template>
    </view>

    <!-- 操作按钮 -->
    <view v-if="active === 2" class="flex justify-end py-2">
      <up-button
        v-if="!data.isRemark"
        type="primary"
        size="small"
        shape="circle"
        class="mr-10"
        style="width: 180rpx"
        @tap.native.stop="onBtnClick(1)"
      >
        填写原因
      </up-button>
      <up-button
        v-else
        type="primary"
        size="small"
        shape="circle"
        :plain="true"
        class="mr-10"
        style="width: 180rpx"
        @tap.native.stop="onBtnClick(2)"
      >
        查看原因
      </up-button>
    </view>
  </view>
</template>
