<template>
  <view class="px-2 py-2 bg-white">
    <view class="stats-card">
      <!-- 逾期账款/长账龄卡片 (active=1) -->
      <view v-if="+entryObj.active === 1">
        <template v-if="isSalesLine">
          <view class="header-info">
            <text class="color-gray-5 font-500">{{ entryObj.deptName }}</text>
            <text class="color-gray-5 ml-2 font-bold" style="font-size: 12px">
              <text v-if="+entryObj.tabType === 0">截止昨日，逾期账款总金额</text>
              <text v-else
                >长账龄总金额({{ entryObj.date || new Date().toISOString().split('T')[0] }})</text
              >
            </text>
          </view>
          <view class="amount-main color-danger">
            {{
              formatCurrency(
                parseVal(+entryObj.tabType === 0 ? totaLVal.overdueAmount : totaLVal.amount),
                {
                  digits: 2,
                }
              )
            }}
          </view>
        </template>
        <template v-else>
          <view class="header-info">
            <text class="color-gray-5 font-500">{{ entryObj.deptName }}</text>
          </view>
          <view class="amount-main color-danger">
            {{
              formatCurrency(
                parseVal(+entryObj.tabType === 0 ? totaLVal.overdueAmount : totaLVal.amount),
                {
                  digits: 2,
                }
              )
            }}
          </view>
          <view class="amount-label color-gray-5 font-bold">
            <text v-if="+entryObj.tabType === 0">截止昨日，逾期账款总金额</text>
            <text v-else
              >长账龄总金额({{ entryObj.date || new Date().toISOString().split('T')[0] }})</text
            >
          </view>
        </template>
      </view>

      <!-- 应收账款卡片 (active=2) -->
      <view v-if="+entryObj.active === 2">
        <view class="header-info mb-2">
          <text class="color-gray-5 font-500">{{ entryObj.deptName }}</text>
          <text class="color-gray-4 ml-2">{{ entryObj.date }}</text>
        </view>
        <view class="header-amount-row">
          <view class="header-amount-col">
            <view class="header-amount-main color-main-3">{{
              formatCurrency(parseVal(totaLVal.thisAmount), { digits: 2 })
            }}</view>
            <view class="header-amount-label color-gray-5">本月应收账款</view>
          </view>
          <view class="header-amount-divider"></view>
          <view class="header-amount-col">
            <view class="header-amount-main color-main-3">{{
              formatCurrency(parseVal(totaLVal.amount), { digits: 2 })
            }}</view>
            <view class="header-amount-label color-gray-5">总应收账款</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useFormatter } from '@/composables/use-number-formatter';
import type { TotalVal, EntryObj } from '../../types/overdue-page';

interface Props {
  totaLVal: TotalVal;
  entryObj: EntryObj;
  isSalesLine?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSalesLine: false,
});

const { formatCurrency } = useFormatter();

// 辅助函数：处理可能的字符串数值（移除逗号）
const parseVal = (val: string | number | undefined) => {
  if (val === undefined || val === null) return val;
  if (typeof val === 'string') {
    return val.replace(/,/g, '');
  }
  return val;
};
</script>

<style lang="scss" scoped>
.stats-card {
  // margin: 0 10px;
  padding: 12px;
  overflow: hidden;
  border: 1px solid #e7e7e7;
  background-color: #fff;
  border-radius: 5px;
}

.header-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.amount-main {
  font-size: 26px;
  font-weight: 500;
  line-height: 1.2;
  padding: 8px 0;
}

.amount-label {
  font-size: 14px;
  margin-top: 4px;
}

.header-amount-row {
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  margin-top: 8px;
}

.header-amount-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.header-amount-divider {
  width: 1px;
  height: 50px;
  background: #e7e7e7;
  margin: 0 24px;
  border-radius: 1px;
  align-self: center;
}

.header-amount-main {
  font-size: 28px;
  font-weight: bold;
  line-height: 1;
}

.header-amount-label {
  font-size: 12px;
  margin-top: 4px;
}
</style>
