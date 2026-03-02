<template>
  <view class="increase-table">
    <view class="flex color-gray-2">
      <view class="flex-3"></view>
      <view class="flex-4 text-14 flex items-center">
        <app-icon name="#ytcrm-lujing1" class="mr-2" />
        销售额
      </view>
      <view class="flex-3 text-14 flex items-center">
        <app-icon name="#ytcrm-xingzhuang1" class="mr-2" />
        联合体
      </view>
    </view>
    <view v-for="(item, index) in data" :key="index" class="flex mt-2">
      <view class="flex-3 color-black">{{ item.name }}</view>
      <!-- 销售额 -->
      <view v-if="item.type === 'target'" class="flex-4">
        {{ item.saleValue ? `${item.saleValue}%` : '-' }}
      </view>
      <view v-else-if="item.saleValue" class="flex-4 flex items-center">
        <app-icon
          :name="
            Number(item.saleValue) < Number(item.targetSaleValue)
              ? '#ytcrm-a-lujing2'
              : '#ytcrm-a-bianzu60'
          "
          class="mr-1"
        />
        <view
          :class="
            Number(item.saleValue) < Number(item.targetSaleValue) ? 'color-normal' : 'color-never'
          "
        >
          {{ item.saleValue }}%
        </view>
      </view>
      <view v-else class="flex-4">-</view>
      <!-- 联合体 -->
      <view v-if="item.type === 'target'" class="flex-3">
        {{ item.unionValue ? `${item.unionValue}%` : '-' }}
      </view>
      <view v-else-if="item.unionValue" class="flex-3 flex items-center">
        <app-icon
          :name="
            Number(item.unionValue) < Number(item.targetUnionValue)
              ? '#ytcrm-a-lujing2'
              : '#ytcrm-a-bianzu60'
          "
          class="mr-1"
        />
        <view
          :class="
            Number(item.unionValue) < Number(item.targetUnionValue) ? 'color-normal' : 'color-never'
          "
        >
          {{ item.unionValue }}%
        </view>
      </view>
      <view v-else class="flex-3">-</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { IncreaseTableRow } from '../types';

defineProps<{
  data: IncreaseTableRow[];
}>();
</script>

<style lang="scss" scoped>
.increase-table {
  font-size: 14px;
}
</style>
