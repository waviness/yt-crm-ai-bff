<script setup lang="ts">
/**
 * 应收管理详情页面
 * 显示预收预警、逾期预警、逾期原因填报的详细信息
 */

import TypeCircle from './components/type-circle.vue';
import AccountList from './components/account-list.vue';
import FieldPopup from './components/field-popup.vue';
import type { ReceivableTabType } from './types';

// 路由参数
const dtlId = ref<string>('');
const active = ref<ReceivableTabType>(0);
const itemType = ref<number>(0); // 从列表页传递的 type 字段

// 响应式数据
const detail = ref<any>({});
const detailList = ref<any[]>([]);
const loading = ref(false);
const queryRemarkLoading = ref(false);
const showFieldPopup = ref(false);
const fieldTitle = ref('');
const fieldPlaceholder = ref('');
const feedbackText = ref('');
const fieldReadonly = ref(false);
const curFeedBack = ref<any>({});
const feedFlag = ref(true);

// 计算属性
const pageTitle = computed(() => {
  const titles = ['预收预警详情', '逾期预警详情', '逾期原因填报详情'];
  return titles[active.value];
});

const typeClass = computed(() => {
  if (active.value === 0) {
    // 预收预警：根据 type 类型显示不同颜色
    const classArr = ['', 'color-danger', 'color-warning', 'color-main-3'];
    return classArr[itemType.value] || 'color-gray-4';
  } else if (active.value === 1) {
    // 逾期预警
    return 'color-warning';
  } else {
    // 逾期原因填报
    return 'color-danger';
  }
});

const creditStatusText = computed(() => {
  const creditStatusArr = ['A', 'B', 'C', 'D', 'E'];
  const creditStatus = 'creditStatus' in detail.value ? detail.value.creditStatus : undefined;
  return creditStatus !== undefined && creditStatus !== null ? creditStatusArr[creditStatus] : '-';
});

const overdueAmountClass = computed(() => {
  if (detail.value.overdueAmount > 0) {
    return active.value === 2 ? 'color-danger' : 'color-warning';
  }
  return 'color-black-2';
});

// 获取详情数据
const getDetail = async () => {
  loading.value = true;
  const res = await ReceivableService.queryAdvanceDetail({ cadId: dtlId.value });

  detail.value = res.advanceDataVO;
  detailList.value = res.advanceDataDetailDOList || [];
  loading.value = false;
};

const getOverdueWarnDetail = async () => {
  loading.value = true;
  const res = await ReceivableService.queryOverdueWarnDetail({ cowId: dtlId.value });

  detail.value = res.crmOverdueWarnVO;
  detailList.value = res.overdueWarnDetailDOList || [];
  loading.value = false;
};

const getOverdueDetail = async () => {
  loading.value = true;
  const res = await ReceivableService.queryOverdueDataDetail({ codId: dtlId.value });

  detail.value = res.overdueDataVO;
  detailList.value = res.overdueDataDetailDOList || [];
  loading.value = false;
};

// 反馈处理
const feedback = async (feedType: number, item: any) => {
  curFeedBack.value = item;

  if (feedType === 1) {
    // 反馈
    feedbackText.value = '';
    fieldTitle.value = '填写反馈原因';
    fieldPlaceholder.value = '请填写反馈原因';
    fieldReadonly.value = false;
    showFieldPopup.value = true;
  } else {
    // 查看反馈
    queryRemarkLoading.value = true;
    const res = await ReceivableService.queryAdvanceRemark({ caddId: item.caddId });

    feedbackText.value = res;
    fieldTitle.value = '查看反馈';
    fieldPlaceholder.value = '';
    fieldReadonly.value = true;
    showFieldPopup.value = true;
    queryRemarkLoading.value = false;
  }
};

// 关闭弹窗
const closeFieldPopup = () => {
  showFieldPopup.value = false;
  feedbackText.value = '';
};

// 提交反馈
const submitFeedback = async (remark: string) => {
  if (!feedFlag.value) return;

  feedFlag.value = false;
  const res = await ReceivableService.addAdvanceRemark({
    caddId: curFeedBack.value.caddId,
    remark,
  });

  showSuccess('反馈成功');
  getDetail();
  showFieldPopup.value = false;
  feedFlag.value = true;
};

// 页面加载
onLoad((options: any) => {
  // 获取路由参数
  dtlId.value = options?.id || '';
  active.value = +(options?.active || 0) as ReceivableTabType;
  itemType.value = +(options?.type || 0); // 获取 type 参数用于 typeClass 计算

  // 初始化数据
  if (active.value === 0) {
    getDetail();
  } else if (active.value === 1) {
    getOverdueWarnDetail();
  } else {
    getOverdueDetail();
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="px-10 pt-10">
      {{ pageTitle }}
    </view>

    <type-circle class="block py-2 px-10" :type="detail.type" :active="active" />

    <app-cell
      title="客户信息"
      :value="detail.customId ? `${detail.customId}/${detail.customName}` : ''"
      value-class="color-black-2"
      class="block mt-2"
    />
    <app-cell
      title="核算单元"
      :value="detail.entryId"
      value-class="color-black-2"
      class="block mt-2"
    />

    <!-- 预收预警详情 -->
    <template v-if="active === 0">
      <app-cell
        title="逾期金额"
        :value="detail.overdueAmount"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="预收未处理"
        :value="detail.unMixedMoney || 0"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="最早挂账天数"
        :value="detail.maxDay"
        :value-class="typeClass"
        class="block mt-2"
      />
    </template>

    <!-- 逾期预警和逾期原因填报详情 -->
    <template v-else>
      <app-cell
        v-if="active < 2"
        title="应收账款"
        :value="detail.receivable || 0"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="已逾期"
        :value="detail.overdueAmount || 0"
        :value-class="overdueAmountClass"
        class="block mt-2"
      />
      <app-cell
        title="预收未处理"
        :value="detail.advanceAmount || 0"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="剩余信额"
        :value="
          detail.creditAmount !== undefined && detail.creditAmount !== null
            ? detail.creditAmount
            : '-'
        "
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        v-if="active >= 2"
        title="最长逾期天数"
        :value="detail.maxDay"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        title="信保状态"
        :value="creditStatusText"
        value-class="color-black-2"
        class="block mt-2"
      />
      <app-cell
        v-if="active >= 2"
        title="信用天数"
        :value="detail.creditDays"
        value-class="color-black-2"
        class="block mt-2"
      />
    </template>

    <!-- 账户列表 -->
    <view v-if="active === 0" class="bg-white mt-2 py-5 px-4">
      <account-list
        :list="detailList"
        valKey="total"
        :disabled="queryRemarkLoading"
        is-advanced
        @feedback="feedback"
      />
    </view>
    <view v-else-if="active === 1" class="bg-white mt-2 py-10 px-4">
      <view class="color-gray-5 text-sm">应收金额（根据发货单确认日期）</view>
      <account-list :list="detailList" dateKey="billDate" valKey="billAmount" />
    </view>
    <view v-else class="bg-white mt-2 py-10 px-4">
      <view class="color-gray-5 text-sm">逾期金额到期分布</view>
      <account-list :list="detailList" dateKey="overdueDate" valKey="overdueAmount" type="danger" />
    </view>

    <!-- 数据说明 -->
    <app-data-desc
      v-if="active === 2"
      present-text="数据更新于本月第一个工作日，待财务勾对后，以第六个工作日展示的数据为准"
    />
    <app-data-desc
      v-else
      present-text="以上数据统计截止至昨日23:59"
      next-text="下次更新时间为今日23:59"
    />

    <!-- 反馈弹窗 -->
    <field-popup
      :show="showFieldPopup"
      :title="fieldTitle"
      :content="feedbackText"
      :placeholder="fieldPlaceholder"
      :readonly="fieldReadonly"
      @close="closeFieldPopup"
      @confirm="submitFeedback"
    />
  </view>
</template>
