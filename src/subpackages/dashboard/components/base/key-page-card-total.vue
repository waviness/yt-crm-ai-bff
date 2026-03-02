<template>
  <view class="stats-card">
    <view class="flex mb-2 justify-between">
      <view>
        <text class="color-gray-4"
          >{{ activeTab === 0 ? '重点' : '全部' }}{{ itemType === 1 ? '客户' : '品种' }}同比</text
        >
        <view class="pt-1">
          <!-- <icon-Svg :size="iconSize" :name="getName(totaLVal.percent)"></icon-Svg> -->
          <text class="text-20" :class="getColorClass(totaLVal.periodComparePercent)">
            {{ totaLVal.periodComparePercent }}
          </text>
        </view>
      </view>

      <view>
        <text class="color-gray-4">同比(万元)</text>
        <view class="pt-1">
          <text class="text-20" :class="getColorClass(totaLVal.periodCompareNetIncrease)">
            {{ totaLVal.periodCompareNetIncrease }}
          </text>
        </view>
      </view>

      <view>
        <text class="color-gray-4"
          >下降{{ itemType === 1 ? '客户' : '品种' }}数/{{ activeTab === 0 ? '重点' : '全'
          }}{{ itemType === 1 ? '客户' : '品种' }}数</text
        >
        <view class="pt-1">
          <text class="text-20 color-danger">
            {{ totaLVal.salesDeclineNum }}
          </text>
          <text class="separator">/</text>
          <text class="total">{{ totaLVal.salesTotalNum }}</text>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { getColorClass } from '@/utils/number';
interface Props {
  totaLVal: any;
  itemType: number;
  activeTab: number;
}
defineProps<Props>();
</script>

<style lang="scss" scoped>
.stats-card {
  margin: 10px 10px 0;
  padding: 8px 12px;
  overflow: hidden;
  border: 1px solid #ebedf0;
  background-color: #fff;
}
</style>
