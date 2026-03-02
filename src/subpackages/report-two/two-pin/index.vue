<template>
  <view>
    <app-watermark> </app-watermark>
    <entry-list v-show="entryShow" @handleClick="handleEntryClick" />
    <view v-if="!entryShow">
      <up-sticky style="top: 0">
        <app-tabs :list="statusList" :active="activeTab" @change="onhandleActiveChange" />
      </up-sticky>
      <biz-custom-list
        v-if="reportTwoStore.entryChoose.entryid && activeTab === 0"
        :entryid="reportTwoStore.entryChoose.entryid + ''"
        @cell-click="handleCellClick"
      />
    </view>
    <wx-order
      v-if="activeTab === 2"
      orderType="14"
      :entryid="reportTwoStore.entryChoose.entryid + ''"
    />
    <two-pin-tab :entryChoose="reportTwoStore.entryChoose" v-if="activeTab === 1" />
    <app-bottom-actions v-show="!entryShow">
      <view class="w-full flex justify-center">
        <app-action-btn
          customClass="px-3"
          icon="a-xingzhuang4"
          type="plain"
          :multi="false"
          @click="changeEntryClick"
          :text="`切换核算单元 当前(${reportTwoStore.entryChoose.entryid})`"
      /></view>
    </app-bottom-actions>
    <shop-card-btn v-show="!entryShow" cardType="2" />
  </view>
</template>

<script lang="ts" setup>
import shopCardBtn from '../components/base/shop-card-btn.vue';
import entryList from '../components/business/entry-list.vue';
import twoPinTab from '../components/business/two-pin-tab.vue';
import wxOrder from '../wx-order/index.vue';
import { useBaseIndex } from '../composables/use-base-index';
const statusList = reactive([{ name: '按客户下单' }, { name: '二销目录' }, { name: '订单查询' }]);
const reportTwoStore = useReportTwoStore();

const {
  activeTab,
  entryShow,
  changeEntryClick,
  handleEntryClick,
  onhandleActiveChange,
  handleCellClick,
} = useBaseIndex('two-pin');
</script>

<style lang="scss" scoped></style>
