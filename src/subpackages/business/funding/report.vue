<script setup lang="ts">
import FundReportItem from './components/fund-report-item.vue';
import { useFundingReport } from './composables/use-funding-report';
import { useFundingReportEdit } from './composables/use-funding-report-edit';

defineOptions(SHARED_STYLE_OPTIONS);

// 使用组合式函数管理报表逻辑
const {
  calendarRef,
  today,
  searchDate,
  dataLoading,
  fundingData,
  searchParams,
  list,
  loading,
  getReportStats,
  getReportList,

  handleSearch,
  handleSort,
  handleDateChange,
  toDetail,
} = useFundingReport();

// 使用组合式函数管理编辑逻辑
const {
  editModalShow,
  amountData,
  showEditModal,
  hideEditModal,
  onInputChange,
  handleSubmitAmount,
} = useFundingReportEdit();

// 编辑权限
const buttonShow = ref(false);

// 处理编辑点击
const onEditClick = () => {
  showEditModal({
    paymentAmount: fundingData.value.paymentAmount,
    chAmount: fundingData.value.chAmount,
  });
};

// 处理提交金额
const submitAmount = async () => {
  const success = await handleSubmitAmount(searchDate.value);
  if (success) {
    // 提交成功后刷新统计数据
    getReportStats();
  }
};

onLoad(() => {
  getReportStats();
  getReportList();
  buttonShow.value = hasPermission('FundingSystemWx-edit');
});
</script>

<!-- 资金系统 - 列表 -->
<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="flex items-center bg-white py-10 px-3">
      <view
        class="flex items-center color-black font-bold text-14 pl-3 pr-6"
        @click="calendarRef.open()"
      >
        <view>{{ searchDate.replaceAll('-', '.') }}</view>
        <up-icon name="arrow-down" class="ml-1" size="14" color="#323233" bold />
      </view>
      <up-search
        class="flex-1"
        v-model="searchParams.key"
        clearable
        shape="square"
        bgColor="#f7f8fa"
        placeholder="搜索"
        :showAction="false"
        @search="handleSearch"
      />
    </view>
    <view class="py-10 px-4 color-main-3 text-14 bg-[#e8effa]">
      截止{{ fundingData.statDate ? fundingData.statDate.split(' ')[0] : '' }}，回款金额{{
        fundingData.totalAmount
      }}万（其中电汇{{ fundingData.dhAmount }}万），达成业务计划进度{{
        fundingData.ywPercent
      }}%，达成测算目标进度{{ fundingData.csPercent }}%。
      <view class="mt-1" />
      截止{{ searchDate }}，付款金额总计{{
        fundingData.paymentAmount !== null || fundingData.chAmount !== null
          ? (+fundingData.paymentAmount * 1000000 + +fundingData.chAmount * 1000000) / 1000000
          : '-'
      }}万（其中电汇{{
        fundingData.paymentAmount !== null ? fundingData.paymentAmount : '-'
      }}万，承兑{{ fundingData.chAmount !== null ? fundingData.chAmount : '-' }}万）<br />
      <up-button
        v-if="buttonShow && today === searchDate"
        class="mt-2"
        :customStyle="{ width: '120rpx', display: 'inline-flex' }"
        size="small"
        type="primary"
        @click="onEditClick"
        >修改</up-button
      >
    </view>
    <view class="overflow-x-auto mt-2">
      <view class="flex bg-white h-88 pr-9" style="min-width: 876px">
        <app-th-item
          style="width: 150px"
          class="flex-5 position-sticky left-0 pl-4 bg-white"
          title="部门"
        />
        <app-th-item class="justify-end ml-8 flex-3 w-168" title="当前回款总额" />
        <app-th-item
          class="justify-end ml-8 flex-5"
          style="width: 138px"
          title="业务计划完成情况%"
          :sort="searchParams.finishnum"
          @click="handleSort('finish')"
          sortShow
        />
        <app-th-item
          class="justify-end ml-8 flex-5"
          style="width: 138px"
          title="测算目标完成情况%"
          :sort="searchParams.csfinishnum"
          @click="handleSort('csfinish')"
          sortShow
        />
        <app-th-item class="justify-end ml-8 flex-3 w-168" title="月初上报回款" />
        <app-th-item class="justify-end ml-8 flex-3 w-168" title="测算目标" />
      </view>
      <fund-report-item
        v-for="(item, idx) in list"
        :key="idx"
        :data="item"
        :gray="idx % 2 === 0"
        @click="toDetail(item)"
      />
      <app-empty v-show="!loading && !list.length" class="py-7" description="暂无数据" />
    </view>
    <app-calendar ref="calendarRef" @confirm="handleDateChange" />
    <up-modal
      :show="editModalShow"
      title="修改付款金额"
      confirmButtonColor="#2271F5"
      show-cancel-button
      @cancel="hideEditModal"
      @confirm="submitAmount"
    >
      <up-form class="w-full my-4">
        <app-form-item label="电汇(万元)">
          <up-input
            v-model="amountData.amount"
            type="number"
            placeholder="点击输入电汇金额"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            @change="onInputChange"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="承兑(万元)">
          <up-input
            v-model="amountData.chAmount"
            type="number"
            placeholder="点击输入承兑金额"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
            @change="onInputChange"
          >
          </up-input>
        </app-form-item>
        <app-form-item label="合计" :borderBottom="false">
          <view class="w-full text-right">
            {{ amountData.total }}
          </view>
        </app-form-item>
      </up-form>
    </up-modal>
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-modal__content) {
  padding: 0 !important;
}
</style>
