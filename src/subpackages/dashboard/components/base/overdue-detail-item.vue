<template>
  <view class="px-2">
    <!-- 逾期账款列表 (active=1, tabType=0) -->
    <view
      v-if="+activeType === 1 && +tabType === 0"
      class="card-item"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <view class="card-content">
        <!-- 顶部：类型标签 + 业务员 -->
        <view class="flex justify-between">
          <view class="flex align-center">
            <view class="type-circle bg-danger mt-1"></view>
            <text class="text-14 font-bold ml-2">已逾期</text>
          </view>
          <text class="color-gray-5 text-14">{{ data.saleId }}/{{ data.saleName }}</text>
        </view>

        <!-- 客户信息 -->
        <view class="flex justify-between font-bold py-2">
          <text class="text-14">{{ data.customId }}/{{ data.customName }}</text>
        </view>

        <!-- 核算单元 -->
        <view class="color-main-3 pb-2">
          <text>{{ data.entryId }}/{{ data.entryName }}</text>
        </view>

        <!-- 数据行 -->
        <view class="flex text-14">
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">逾期金额</text>
            <text class="color-gray-5 text-16 font-500">{{ data.overdueAmount }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">预收未处理</text>
            <text class="color-danger text-16 font-500">{{ data.advanceAmount || 0 }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">最长逾期天数</text>
            <text class="color-gray-5 text-16 font-500">{{ data.maxDay }}天</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 长账龄列表 (active=1, tabType=1) -->
    <view
      v-if="+activeType === 1 && +tabType === 1"
      class="card-item"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <view class="card-content">
        <!-- 顶部：类型标签 + 核算单元标签 -->
        <view class="flex align-center justify-between mb-2">
          <view class="flex align-center">
            <view class="type-circle bg-danger mt-1"></view>
            <text class="text-12 color-danger ml-2">一年期以上长账龄</text>
          </view>
          <view class="entry-tag">{{ data.entryId }}/{{ data.entryName }}</view>
        </view>

        <!-- 客户信息 + 部门 -->
        <view class="flex justify-between mb-2">
          <text class="text-14 color-gray-5 font-500" style="width: 60%">
            {{ data.customId }}/{{ data.customName }}
          </text>
          <text class="text-12 color-gray-4">{{ data.deptName }}</text>
        </view>

        <!-- 总金额 -->
        <view class="flex flex-col">
          <text class="color-gray-4 pb-1 text-14">总金额</text>
          <text class="color-gray-5 text-16 font-500">{{ data.receivable }}</text>
        </view>
      </view>
    </view>

    <!-- 应收账款列表 (active=2) -->
    <view
      v-if="+activeType === 2"
      class="card-item"
      v-for="(data, index) in dataList"
      :key="index"
      @click="toDetail(data)"
    >
      <view class="card-content">
        <!-- 顶部：类型标签 + 业务员 -->
        <view class="flex justify-between mb-2">
          <view class="flex align-center">
            <view class="type-circle bg-warning"></view>
            <text class="text-14 font-bold ml-2">到本月底即将逾期</text>
          </view>
          <text class="color-gray-5 text-14">{{ data.saleId }}/{{ data.saleName }}</text>
        </view>

        <!-- 客户信息 -->
        <view class="flex justify-between font-bold py-2">
          <text class="text-14">{{ data.customId }}/{{ data.customName }}</text>
        </view>

        <!-- 核算单元 -->
        <view class="color-main-3 pb-2">
          <text>{{ data.entryId }}/{{ data.entryName }}</text>
        </view>

        <!-- 第一行数据 -->
        <view class="flex text-14 mb-4">
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">总应收账款</text>
            <text class="color-gray-5 text-16 font-500">{{ data.receivable }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">逾期金额</text>
            <text class="color-gray-5 text-16 font-500">{{ data.overdueAmount }}</text>
          </view>
        </view>

        <!-- 第二行数据 -->
        <view class="flex text-14">
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">本月应收账款</text>
            <text class="color-gray-5 text-16 font-500">{{ data.thisReceivable }}</text>
          </view>
          <view class="flex-1 flex flex-col">
            <text class="color-gray-4 pb-1">预收未处理</text>
            <text class="color-danger text-16 font-500">{{ data.advanceAmount || 0 }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { OverdueDetailItem } from '../../types/overdue-page';

interface Props {
  dataList: OverdueDetailItem[];
  activeType: number;
  tabType: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  toDetail: [data: OverdueDetailItem];
}>();

const toDetail = (data: OverdueDetailItem) => {
  emit('toDetail', data);
};
</script>

<style lang="scss" scoped>
.card-item {
  margin-bottom: 8px;
  background: linear-gradient(180deg, #f5f5f5 0%, #fff 20px);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
}

.card-content {
  background: #fff;
  padding: 10px;
  border-radius: 8px;
}

.type-circle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.bg-danger {
  background-color: #ee0a24;
}

.bg-warning {
  background-color: #ff976a;
}

.entry-tag {
  padding: 0 5px;
  max-width: 168px;
  height: 21px;
  background: rgb(34 113 245 / 10%);
  border-radius: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #2271f5;
  line-height: 21px;
  text-align: center;
}
</style>
