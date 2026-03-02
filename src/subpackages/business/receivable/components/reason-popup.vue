<script setup lang="ts">
/**
 * 原因弹窗组件
 * 用于逾期原因填报和查看
 */
// 定义组件属性
interface Props {
  show: boolean;
  type: number; // 1-提交原因, 2-查看
  detail: {
    lastReasonType?: string;
    lastReason?: string;
    repayThisMonth?: number;
    overdueAmount?: number;
    reasonType?: string;
    reason?: string;
    repayDate?: string;
  };
}

const props = defineProps<Props>();

// 定义事件
const emit = defineEmits<{
  close: [];
  submit: [params: any];
}>();

// 响应式数据
const reason = ref<any>({ value: null, name: '' });
const reasonList = ref<any[]>([]);
const payAssess = ref<string | number>('');
const resolveTime = ref<string | number>('');
const calendarRef = ref<any>(null);
const startDate = ref<string>(time.format(new Date(), time.FORMATS.ISO_DATE));
const inputShow = ref(false);
const reasonText = ref('');

// 计算属性
const isAfter15th = computed(() => new Date().getDate() > 15);
const popupHeight = computed(() => (isAfter15th.value ? 'h-434' : 'h-90vh'));
const popupTitle = computed(() => {
  if (isAfter15th.value) return '查看原因';
  return props.type === 2 ? '编辑原因' : '填写原因';
});

// 原因列表数据
const initReasonList = () => {
  reasonList.value = [
    { value: 1, name: '未获取勾兑信息及未及时勾兑' },
    { value: 2, name: '未及时开具/送发票至客户' },
    { value: 3, name: '未及时处理退货相关事宣' },
    { value: 4, name: '供应商返利未到位，客户扣押货款' },
    { value: 5, name: '来自于供应商的压货/滞销' },
    { value: 6, name: '回款金额差异' },
    { value: 7, name: '客户付款账期/付款流程冗长' },
    { value: 8, name: '客户财务跳票/漏付款' },
    { value: 9, name: '药品价格调整' },
    { value: 10, name: '客户做账期差异' },
    { value: 11, name: '末次销售/商品销售完毕结款' },
    { value: 12, name: '受政策影响扣压老款' },
    { value: 13, name: '医保拖欠/停拨，造成客户资金紧张' },
    { value: 14, name: '我司对客户有欠款（授信占用为负数）' },
    { value: 15, name: '客户支付意外中断/恶意拖欠' },
    { value: 16, name: '客户经营情况遭遇重大改变' },
    { value: 17, name: '客户自身经营管理混乱，导致资金流失' },
    { value: 18, name: '客户破产倒闭/关门' },
    { value: 19, name: '由于冲差/退货原因导致逾期金额为负' },
    { value: 20, name: '其他原因（自行填写）' },
  ];
};

// 选择原因
const onReasonChange = (item: any) => {
  reason.value = item;
  if (item.value === 20) {
    reasonText.value = '';
    inputShow.value = true;
  }
};

// 日期选择
const onDateChange = (value: any) => {
  resolveTime.value = time.format(value.fulldate, time.FORMATS.ISO_DATE);
};

// 确认输入
const confirmInput = (text: string) => {
  reasonText.value = text;
  reason.value = {
    value: 20,
    name: text,
  };
  inputShow.value = false;
};

// 监听 payAssess 变化并验证修正
let isUpdating = false;
const inputKey = ref(0);

// 处理输入事件（兼容微信小程序）
const handleInput = (value: any) => {
  if (isUpdating) return;

  // 提取输入值（兼容小程序事件对象和直接值）
  const inputValue =
    typeof value === 'object' && value !== null ? (value.detail?.value ?? '') : value;
  const strValue = String(inputValue).trim();
  const maxAmount = Number(props.detail.overdueAmount || 0);

  // 空值处理
  if (strValue === '') {
    payAssess.value = '';
    return;
  }

  const numValue = Number(strValue);
  if (isNaN(numValue)) {
    payAssess.value = strValue;
    return;
  }

  // 验证并修正值
  let fixedValue: string;
  if (numValue < 0) {
    showToast('本月可回款不能小于0');
    fixedValue = '0';
  } else if (maxAmount > 0 && numValue > maxAmount) {
    showToast('本月可回款不能大于逾期金额');
    fixedValue = String(maxAmount);
  } else {
    fixedValue = strValue;
  }

  // 如果值需要修正，强制更新输入框
  if (fixedValue !== strValue) {
    isUpdating = true;
    payAssess.value = fixedValue;
    // 更新 key 强制重新渲染，确保输入框显示修正后的值
    inputKey.value++;
    nextTick(() => {
      isUpdating = false;
    });
  } else {
    // 验证通过，直接更新值
    payAssess.value = fixedValue;
  }
};

// 确认提交
const confirm = () => {
  if (!reason.value.name) {
    showToast('请填写逾期原因');
    return;
  }
  if (+reason.value.value === 20 && !reason.value.name) {
    showToast('逾期原因为其他原因时不能为空');
    return;
  }
  if (!payAssess.value) {
    showToast('请填写本月可回款');
    return;
  }
  if (Number(payAssess.value) < 0) {
    showToast('本月可回款必须大于等于0');
    return;
  }
  if (Number(payAssess.value) > Number(props.detail.overdueAmount || 0)) {
    showToast('本月可回款不能超过逾期金额');
    return;
  }
  if (Number(payAssess.value) !== Number(props.detail.overdueAmount || 0) && !resolveTime.value) {
    showToast('请选择剩余回款评估');
    return;
  }

  const params = {
    repayThisMonth: payAssess.value,
    reason: reason.value.name,
    reasonType: reason.value.value,
    repayment: +payAssess.value === +(props.detail.overdueAmount || 0) ? '' : resolveTime.value,
  };

  emit('submit', params);
};

// 关闭弹窗
const onClose = () => {
  emit('close');
};

// 重置数据
const resetData = () => {
  reason.value = { value: null, name: '' };
  payAssess.value = '';
  resolveTime.value = '';
  reasonText.value = '';
  inputShow.value = false;
};

// 初始化数据
const initData = () => {
  initReasonList();

  if (props.detail.reasonType) {
    reason.value = {
      value: props.detail.reasonType,
      name: props.detail.reason || '',
    };
  } else {
    const selectedReason = reasonList.value.find(
      item => item.value === props.detail.lastReasonType
    );
    if (selectedReason) {
      reason.value = selectedReason;
    }
    if (reason?.value === 20 && props.detail.lastReason) {
      reason.value.name = props.detail.lastReason;
    }
  }

  // 重置更新标志
  isUpdating = false;

  if (props.detail.repayThisMonth !== undefined && props.detail.repayThisMonth !== null) {
    payAssess.value = String(props.detail.repayThisMonth);
  } else if (props.detail.overdueAmount !== undefined && props.detail.overdueAmount !== null) {
    // 如果没有 repayThisMonth，使用 overdueAmount 作为默认值
    payAssess.value = String(props.detail.overdueAmount || 0);
  } else {
    payAssess.value = '';
  }

  // 更新 inputKey 确保组件重新渲染
  nextTick(() => {
    inputKey.value++;
  });

  if (props.detail.repayDate) {
    resolveTime.value = props.detail.repayDate.split(' ')[0];
  }
};

// 监听show变化，打开时重置并初始化
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      resetData();
      initData();
    }
  }
);

// 初始化
onMounted(() => {
  if (props.show) {
    initData();
  }
});
</script>

<template>
  <view>
    <up-popup :show="show" closeable :round="16" position="bottom" :zIndex="988" @close="onClose">
      <view :class="`flex flex-col ${popupHeight}`">
        <view class="text-base font-bold text-center py-3">
          {{ popupTitle }}
        </view>

        <view class="flex-1 my-2 overflow-y-auto">
          <!-- 逾期原因 -->
          <view class="flex justify-between items-center px-4 py-3 text-sm">
            <view :class="!isAfter15th ? 'font-bold' : ''">逾期原因</view>
            <view v-if="reason.name" class="color-main-3 font-bold slh flex-1 text-right ml-2">
              {{ reason.name }}
            </view>
            <view v-else class="color-gray-7">
              {{ isAfter15th ? '未填写' : '请选择' }}
            </view>
          </view>

          <!-- 原因选择 -->
          <view v-if="!isAfter15th" class="flex flex-wrap ml-4">
            <view
              v-for="(item, idx) in reasonList"
              :key="idx"
              :class="[
                'px-1 h-64 line-height-8 rounded-1 text-12 mr-2 mb-10',
                reason.value === item.value ? 'color-white bg-main' : 'bg-gray-11',
              ]"
              @click="onReasonChange(item)"
            >
              {{ item.name }}
            </view>
          </view>

          <!-- 本月可回款 -->
          <view class="flex justify-between items-center px-4 py-3 text-sm">
            <view :class="!isAfter15th ? 'font-bold' : ''">本月可回款</view>
            <view
              v-if="isAfter15th && type === 2 && detail.repayThisMonth"
              class="color-main-3 font-bold slh flex-1 text-right ml-2"
            >
              {{ detail.repayThisMonth }}
            </view>
            <view v-else-if="isAfter15th" class="color-gray-7">未填写</view>
          </view>

          <!-- 回款输入 -->
          <view v-if="!isAfter15th" class="flex flex-wrap mx-4">
            <uv-input
              :key="inputKey"
              :modelValue="payAssess"
              label=""
              class="bg-gray-11 w-full"
              customStyle="padding: 10px 16px;"
              fontSize="28rpx"
              type="digit"
              placeholder="请输入本月可回款"
              border="none"
              @input="handleInput"
              @update:modelValue="handleInput"
            />
          </view>

          <!-- 剩余回款评估 -->
          <view class="flex justify-between items-center px-4 py-3 text-sm">
            <view :class="!isAfter15th ? 'font-bold' : ''">剩余回款评估</view>
            <view
              v-if="isAfter15th && detail.repayDate"
              class="color-main-3 font-bold slh flex-1 text-right ml-2"
            >
              {{ detail.repayDate ? detail.repayDate.split(' ')[0] : '' }}
            </view>
            <view v-else-if="isAfter15th" class="color-gray-7">未填写</view>
          </view>

          <!-- 日期选择 -->
          <view v-if="!isAfter15th" class="flex flex-wrap mx-4">
            <view
              v-if="+payAssess === +detail.overdueAmount"
              class="bg-gray-11 w-full px-4 py-10 text-sm"
            >
              -
            </view>
            <view
              v-else
              class="bg-gray-11 w-full px-4 py-10 text-sm"
              :class="resolveTime ? 'color-black-2' : 'color-gray-6'"
              @click="calendarRef?.open()"
            >
              {{ resolveTime || '点击选择' }}
            </view>
          </view>
        </view>

        <!-- 确认按钮 -->
        <view class="p-4">
          <up-button v-if="!isAfter15th" shape="circle" type="primary" @click="confirm">
            提交
          </up-button>
        </view>
      </view>
    </up-popup>

    <!-- 自定义输入弹窗 -->
    <up-popup :show="inputShow" round="16" position="bottom" closeable @close="inputShow = false">
      <view class="flex flex-col">
        <view class="text-center text-base font-bold py-4">逾期原因填写</view>
        <up-textarea v-model="reasonText" border="none" placeholder="请填写逾期原因" />
        <view class="bg-gray-10 text-right">
          <view class="text-sm font-bold color-main-3 mx-4 my-5" @click="confirmInput(reasonText)"
            >确认</view
          >
        </view>
      </view>
    </up-popup>

    <!-- 日期选择器 -->
    <app-calendar ref="calendarRef" :startDate="startDate" @confirm="onDateChange" />
  </view>
</template>
