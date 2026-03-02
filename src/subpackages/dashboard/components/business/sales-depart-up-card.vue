<!-- 销售端上部卡片样式封装 -->
<template>
  <view class="pa-2">
    <view class="flex w-full justify-between">
      <view class="flex-5 w-full border-rounded-8 year-sales common-border">
        <view class="year-sales-bg"></view>
        <view class="year-sales-content pl-2 pt-3">
          <text class="text-14">本年累计</text>
          <view class="py-2 text-14">
            <text>{{ salesDataObj.cyperiodIncrease }}</text>
            <text class="pl-2">{{ salesDataObj.cyonPercent }}</text>
          </view>
          <view class="pb-1">
            <text class="text-28">{{ salesDataObj.cymoney }}</text>
            <text class="text-12">万元</text>
          </view>
          <view class="text-12" v-show="salesDataObj.ndyy !== '--'"
            ><text> 年度预算 </text> <text> {{ salesDataObj.ndyy }}</text></view
          >
        </view>
      </view>
      <view class="flex-4 w-full border-rounded-8 month-sales common-border">
        <view class="pl-2 pt-3">
          <text class="text-14 color-gray-4">本月累计</text>
          <view class="py-2 text-14"
            ><text class="color-blue-1">{{ salesDataObj.cmperiodIncrease }}</text>
            <text class="color-success pl-2">{{ salesDataObj.cmonPercent }}</text>
          </view>
          <view>
            <text class="text-28">{{ salesDataObj.cmmoney }}</text>
            <text class="text-12">万元</text>
          </view>
        </view>
      </view>
    </view>
    <view class="current-card">
      <view class="color-gray-4">当日销售(万元)</view>
      <view class="color-black-1 text-28 font-bold">{{ salesDataObj.cdmoney }}</view>
    </view>
    <view class="color-gray-4 text-14 mt-2 pa-2 common-border" v-if="isShowFlag">
      <view class="flex">
        <view>
          <text>重点客户</text>
          <text
            class="text-16 underline"
            @click="keyPageClick(1)"
            :class="getColorClass(salesDataObj.imptCustomerYearOnPercent)"
            >{{
              salesDataObj.imptCustomerYearOnPercent === '--'
                ? ''
                : +salesDataObj.imptCustomerYearOnPercent > 0
                  ? '上升 '
                  : '下降 '
            }}{{ Math.abs(+salesDataObj.imptCustomerYearOnPercent) }}%</text
          >
        </view>
        <view class="pl-2">
          <text>重点品种</text>
          <text
            class="text-16 underline"
            @click="keyPageClick(2)"
            :class="getColorClass(salesDataObj.imptGoodsYearOnPercent)"
            >{{
              salesDataObj.imptGoodsYearOnPercent === '--'
                ? ''
                : +salesDataObj.imptGoodsYearOnPercent > 0
                  ? '上升 '
                  : '下降 '
            }}{{ Math.abs(+salesDataObj.imptGoodsYearOnPercent) }}%</text
          >
        </view>
      </view>
      <view>
        <text>逾期账款总金额(</text>
        <text class="text-12">日期截止{{ yqEndDay }}</text>
        <text>)</text>
        <text @click="overdueReceivableClick(1)" class="text-16 underline color-danger">{{
          salesDataObj.overdueAmount
        }}</text>
      </view>
      <view>
        <text>应收总金额</text>
        <text class="color-danger" @click="overdueReceivableClick(2)">
          <text class="text-16 underline">{{ salesDataObj.receivable }}(</text>
          <text class="text-12 underline">截至本月底应收</text>
          <text class="text-16 underline">{{ salesDataObj.thisReceivable }})</text>
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { QuickOverviewSalesData } from '../../types';
import { getColorClass } from '@/utils/number';
interface IProps {
  salesDataObj: QuickOverviewSalesData;
  deptLevel: number | string; // 部门级别
  isShowFlag: boolean;
}
const props = defineProps<IProps>();
const yqEndDay = time.format(time.add(new Date(), -1, 'day'), 'yyyy-MM-dd');
const emit = defineEmits(['keyPageClick', 'overdueReceivableClick']);
const keyPageClick = (type: number) => {
  // 1 重点客户 2 重点品种
  emit('keyPageClick', type);
};
const overdueReceivableClick = (type: number) => {
  // 1 逾期账款 2 应收账款
  emit('overdueReceivableClick', type);
};
</script>

<style lang="scss" scoped>
.year-sales {
  height: 276rpx;
  margin-right: 8px;
  border-radius: 25px;
  color: white;
  background: #1989fa
    url('data:image/webp;base64,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')
    no-repeat;
  background-position: 65% 0%;
  background-size: 55%;
  position: relative;

  &-bg {
    background: #0052d9;
    position: absolute;
    z-index: 0;
    width: 50%;
    height: 100%;
    border-radius: 25px;
  }

  &-content {
    position: absolute;
    z-index: 5;
  }
}

.month-sales {
  height: 276rpx;
}

.common-border {
  border-radius: 25px;
  border: 1px solid #e7e7e7;
}

.current-card {
  margin-top: 8px;
  padding: 12px 16px;
  background: url('@/static/images/chashuju-total-bg.webp') no-repeat;
  background-position: 100% 0%;
  background-size: 50%;
  border-radius: 25px;
  border: 1px solid #e7e7e7;
}
</style>
