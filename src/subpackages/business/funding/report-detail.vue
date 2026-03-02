<script setup lang="ts">
import FundHistoryItem from './components/fund-history-item.vue';
import { formatValue } from '@/utils/number';
import type { FundingReportData } from './types';

// 详情页状态
const historyList = ref([]);
const loading = ref(false);

// 初始化详情数据
const initDetailData = async (cffId: string) => {
  loading.value = true;
  const res = await FundingService.queryFundFormHistory({
    cffId,
  });
  historyList.value = res;
  loading.value = false;
};

// 详情数据
const detailObj = ref<FundingReportData>({
  cffId: '',
  deptName: '',
  actualityTotal: 0,
  actualityDhAmount: 0,
  actualityChAmount: 0,
  finish: 0,
  csfinish: 0,
  total: 0,
  dhAmount: 0,
  chAmount: 0,
  csAmount: 0,
  xsAmount: 0,
});

// 箭头状态
const arrow = ref<'down' | 'up'>('down');

// 切换箭头
const changeArrow = () => {
  arrow.value = arrow.value === 'down' ? 'up' : 'down';
};

onLoad(async (opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  detailObj.value = { ...detailObj.value, ...decodedOpts };
  await initDetailData(opts.cffId);
});
</script>

<!-- 资金系统 - 详情 -->
<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="p-10">资金系统详情</view>
    <view>
      <app-cell title="部门" :value="detailObj.deptName" value-class="color-black-2" border />
      <app-cell
        title="当前回款总额"
        titleIcon="arrow-down-fill"
        :value="formatValue(detailObj.actualityTotal)"
        value-class="color-black-2"
        border
      />
      <app-cell
        :value="formatValue(detailObj.actualityDhAmount)"
        title="电汇(含买方付息)"
        value-class="color-black-2"
        border
      />
      <app-cell
        :value="formatValue(detailObj.actualityChAmount)"
        title="承兑"
        value-class="color-black-2"
      />
      <app-cell
        :value="formatValue(detailObj.finish, '%')"
        title="业务计划完成情况%"
        value-class="color-black-2"
        class="block mt-3"
        border
      />
      <app-cell
        :value="formatValue(detailObj.csfinish, '%')"
        title="测算目标完成情况%"
        value-class="color-black-2"
      />
      <app-cell
        title="月初上报回款"
        titleIcon="arrow-down-fill"
        :value="formatValue(detailObj.total)"
        value-class="color-black-2"
        class="block mt-3"
        border
      />
      <app-cell
        :value="formatValue(detailObj.dhAmount)"
        title="电汇"
        value-class="color-black-2"
        border
      />
      <app-cell :value="formatValue(detailObj.chAmount)" title="承兑" value-class="color-black-2" />
      <app-cell
        title="测算目标"
        :value="formatValue(detailObj.csAmount)"
        value-class="color-black-2"
        class="block mt-3"
      />
    </view>
    <view>
      <app-cell
        v-if="historyList.length"
        title="查看修改记录"
        isLink
        :arrow-direction="arrow"
        class="block mt-3"
        titleClass="color-black-2"
        @click="changeArrow()"
      />
      <view v-show="arrow === 'up'">
        <fund-history-item v-for="(item, idx) in historyList" :key="idx" :data="item" />
      </view>
    </view>
  </view>
</template>
