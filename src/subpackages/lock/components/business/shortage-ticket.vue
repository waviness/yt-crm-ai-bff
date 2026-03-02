<template>
  <view class="bg-white mt-2">
    <!-- 缺货显示 -->

    <view
      class="px-2"
      v-if="(isShortageDisplay || (detailObj.outOfStockType && isShortage)) && !isEditing"
    >
      <lockRow :leftLabel="'缺货类型'" :leftValue="outTypeString"> </lockRow>
      <lockRow
        v-if="shouldShowPredictTime"
        :leftLabel="'预计到货时间'"
        :leftValue="detailObj.predictArriveTime || '--'"
      >
      </lockRow>
      <lockRow v-if="shouldShowReason" :leftLabel="'原因'" :leftValue="availableTypeString || '--'">
      </lockRow>
      <lockRow
        v-if="shouldShowNewPredictTime && detailObj.predictArriveTime"
        :leftLabel="'新货预计到货时间'"
        :leftValue="detailObj.predictArriveTime || '--'"
      >
      </lockRow>

      <lockRow
        :leftLabel="`${detailObj.conType === 7 || detailObj.conType === 8 ? '缺货原因' : '备注'}`"
        :leftValue="detailObj.shortageReason || '--'"
      >
      </lockRow>
    </view>

    <!-- 缺货编辑 -->
    <view v-if="isShortageEdit">
      <up-form>
        <app-form-item label="缺货类型">
          <view
            @click="handleChangeOutType"
            :class="`flex w-full justify-end items-center ${outOfStockObj.outTypeNumber ? '' : 'color-gray-6'}`"
          >
            <text>
              {{
                outOfStockObj.outTypeNumber ? outOfStockObj.outTypeString : '点击选择缺货类型'
              }}</text
            >
            <u-icon name="arrow-right" size="16" />
          </view>
        </app-form-item>
        <app-form-item v-if="shouldShowPredictTime" label="预计到货时间" class="mt-1" required>
          <view
            :class="`flex w-full justify-end items-center ${outOfStockObj.outTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            <text>
              {{ outOfStockObj.outTime ? outOfStockObj.outTime : '点击选择预计到货时间' }}</text
            >
            <u-icon name="arrow-right" size="16" />
          </view>
        </app-form-item>
        <app-form-item v-if="shouldShowCooperateReason" label="原因" required>
          <view
            @click="handleChangeCooperate"
            :class="`flex w-full justify-end items-center ${outOfStockObj.noCooperateString ? '' : 'color-gray-6'}`"
          >
            <text>{{
              outOfStockObj.noCooperateString ? outOfStockObj.noCooperateString : '点击选择原因'
            }}</text>
            <u-icon name="arrow-right" size="16" />
          </view>
        </app-form-item>

        <app-form-item
          v-if="shouldShowNewPredictTime"
          label="新货预计到货时间"
          class="mt-1"
          required
        >
          <view
            :class="`flex w-full justify-end items-center ${outOfStockObj.outTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            <text>
              {{ outOfStockObj.outTime ? outOfStockObj.outTime : '点击选择新货预计到货时间' }}</text
            >
            <u-icon name="arrow-right" size="16" />
          </view>
        </app-form-item>
        <app-form-item label="缺货备注" :required="shouldShowRequiredReason">
          <up-textarea
            v-model="outOfStockObj.outReason"
            :placeholder="requiredReasonPlaceholder"
            height="30px"
            border="none"
            autoHeight
          ></up-textarea>
        </app-form-item>
      </up-form>
    </view>
    <app-calendar ref="calendarRef" :startDate="maxDate" @confirm="calendarConfirm" />

    <!-- 两票制显示 -->
    <view v-if="isTicketDisplay || (isArrive && isTicket)" class="mt-2 px-2 common-detail">
      <lockRow :leftLabel="'预计到票时间'" :leftValue="detailObj.predictArriveTime || '--'">
      </lockRow>
      <lockRow :leftLabel="'缺票原因'" :leftValue="detailObj.shortageReason || '--'"> </lockRow>
    </view>

    <!-- 两票制编辑 -->
    <view v-if="isTicketEdit" class="mt-2 common-detail">
      <up-form>
        <app-form-item label="预计到票时间" class="mt-1" required>
          <view
            :class="`flex w-full justify-end items-center ${outOfStockObj.outTime ? '' : 'color-gray-6'}`"
            @click="calendarRef.open()"
          >
            <text> {{ ticketObj.ticketTime ? ticketObj.ticketTime : '点击选择预计到票时间' }}</text>
            <u-icon name="arrow-right" size="16" />
          </view>
        </app-form-item>
        <app-form-item label="缺票原因">
          <up-textarea
            v-model="ticketObj.ticketReason"
            placeholder="请输入缺票原因"
            height="30px"
            autoHeight
            border="none"
          ></up-textarea>
        </app-form-item>
      </up-form>
    </view>

    <!-- 操作按钮 -->
    <view v-if="showButtons">
      <app-bottom-actions>
        <view class="w-full flex justify-center">
          <up-button
            @click="handleSubmit"
            v-if="shouldShowSubmit"
            shape="circle"
            class="m-0"
            type="primary"
          >
            提交
          </up-button>

          <up-button
            @click="handleEdit"
            v-if="shouldShowEdit && !isEditing"
            shape="circle"
            class="m-0"
            plain
            type="primary"
          >
            编辑
          </up-button>
          <template v-else-if="isShortageEdit && isEditing">
            <up-button @click="handleSubmit" shape="circle" type="primary">提交</up-button>
            <up-button shape="circle" class="ml-2" type="info" @click="handleCancel"
              >取消</up-button
            >
          </template>
          <up-button
            v-if="shouldShowForceActive"
            shape="circle"
            type="primary"
            @click="handleForceActive"
          >
            强制激活
          </up-button>
          <up-button v-if="shouldShowActive" shape="circle" type="primary" @click="handleActive"
            >激活</up-button
          >

          <up-button v-if="shouldShowDisabled" class="ml-2" shape="circle" type="primary" disabled
            >已激活</up-button
          >
        </view>
      </app-bottom-actions>
    </view>

    <app-action-sheet
      v-model:show="showOutTypeFlag"
      :actions="outTypeOptions"
      description="类型选择"
      @select="handleOutType"
    />
    <app-action-sheet
      v-model:show="showCooperateFlag"
      :actions="noCooperateList"
      description="类型选择"
      @select="handleCooperate"
    />
  </view>
</template>

<script lang="ts" setup>
/**
 * 缺货和两票制信息显示/编辑组件
 * 用于展示和编辑商品的缺货信息、两票制信息
 * 支持缺货类型选择、预计到货时间选择、原因填写等功能
 */
import lockRow from '../base/lock-row.vue';
import type { DetailObj } from '../../types';

/**
 * 组件属性接口
 */
interface Props {
  /** 商品详情对象 */
  detailObj: DetailObj;
  /** 用户角色（1-销售 2-采购） */
  role: number;
  /** 是否查询自己的数据（1-是 0-否） */
  querySelfNumber: number;
  /** 销售是否有管理操作权限 */
  managementOpflagForSaler: boolean;
  /** 采购是否有管理操作权限 */
  managementOpflagForPurchaser: boolean;
}
const props = defineProps<Props>();
const emit = defineEmits(['submitSuccess']);

/**
 * 缺货信息响应式对象
 */
const outOfStockObj = ref({
  outTypeNumber: '7', // 缺货类型编号
  outTypeString: '在途', // 缺货类型名称
  noCooperateType: '', // 原因类型
  noCooperateString: '', // 原因类型名称
  outTime: '', // 预计到货时间
  outReason: '', // 缺货原因/备注
});

/**
 * 两票制信息响应式对象
 */
const ticketObj = ref({
  ticketTime: '', // 预计到票时间
  ticketReason: '', // 缺票原因
});

/**
 * 旧的缺货类型选项
 */
const oldOutTypeOptions = [
  { name: '在途', value: 1, color: '#2271f5' },
  { name: '长期断货', value: 2 },
  { name: '短期断货', value: 3 },
  { name: '厂家控货', value: 4 },
  { name: '有货', value: 5 },
  { name: '已不合作', value: 6 },
];

/**
 * 新的缺货类型选项
 */
const outTypeOptions = [
  { name: '在途', value: 7 },
  {
    name: '不合作',
    value: 8,
    children: [
      { name: 'XX商业有货', value: 1 },
      { name: '待争取', value: 2 },
    ],
  },
  {
    name: '有货',
    value: 9,
    children: [
      { name: '厂家分配', value: 1 },
      { name: '禁限销', value: 2 },
      { name: '保管账问题', value: 3 },
      { name: '效期', value: 4 },
      { name: '其他', value: 5 },
      { name: '储备原因', value: 6 },
    ],
  },
  { name: '货源情况待定', value: 10 },
  {
    name: '客观断货',
    value: 11,
    children: [
      { name: '退市', value: 1 },
      { name: '停产', value: 2 },
      { name: '撤网', value: 3 },
      { name: '换规格', value: 4 },
    ],
  },
];

/**
 * 是否处于编辑状态
 */
const isEditing = ref(false);
// 计算属性
/**
 * 是否为缺货类型（库存状态、近效期类型）
 */
const isShortage = computed(
  () =>
    props.detailObj.conType === 0 || props.detailObj.conType === 7 || props.detailObj.conType === 8
);

/**
 * 是否为两票制类型
 */
const isTicket = computed(() => props.detailObj.conType === 4);

/**
 * 是否已处理状态
 */
const isStatusFlag = computed(() => props.detailObj.statusFlag === 1);

/**
 * 是否已到货/票状态
 */
const isArrive = computed(() => props.detailObj.statusFlag === 2);

/**
 * 是否未处理状态
 */
const isInStatusFlag = computed(() => props.detailObj.statusFlag === 0);

/**
 * 是否已激活状态
 */
const isActive = computed(() => props.detailObj.activate === 1);

/**
 * 是否未激活状态
 */
const isInActive = computed(() => props.detailObj.activate === 0);

/**
 * 是否可以编辑
 */
const canEdit = computed(
  () => props.role === 2 && (props.querySelfNumber === 1 || props.managementOpflagForPurchaser)
);

/**
 * 是否显示缺货信息
 */
const isShortageDisplay = computed(() => isShortage.value && isStatusFlag.value);

/**
 * 是否编辑缺货信息
 */
const isShortageEdit = computed(
  () =>
    (isShortage.value && isInStatusFlag.value && canEdit.value) ||
    (isEditing.value && isShortage.value)
);

/**
 * 是否显示两票制信息
 */
const isTicketDisplay = computed(() => isTicket.value && isStatusFlag.value);

/**
 * 是否编辑两票制信息
 */
const isTicketEdit = computed(
  () =>
    (isTicket.value && isInStatusFlag.value && canEdit.value) || (isEditing.value && isTicket.value)
);

/**
 * 是否显示操作按钮
 */
const showButtons = computed(
  () =>
    props.querySelfNumber === 1 ||
    props.managementOpflagForSaler ||
    props.managementOpflagForPurchaser
);

/**
 * 是否显示提交按钮
 */
const shouldShowSubmit = computed(() => isInStatusFlag.value && props.role === 2);

/**
 * 是否显示编辑按钮
 */
const shouldShowEdit = computed(
  () => isStatusFlag.value && props.role === 2 && props.detailObj.outOfStockType
);

/**
 * 是否显示强制激活按钮
 */
const shouldShowForceActive = computed(
  () =>
    (props.detailObj.conType === 0 || props.detailObj.conType === 4) &&
    isStatusFlag.value &&
    isInActive.value &&
    props.detailObj.orderStatus === 0 &&
    !props.detailObj.confirmedQuantity &&
    props.role === 1 &&
    (isShortage.value || isTicket.value)
);

/**
 * 是否显示激活按钮
 */
const shouldShowActive = computed(
  () =>
    props.detailObj.statusFlag === 2 &&
    props.role === 1 &&
    props.detailObj.orderStatus !== 1 &&
    !props.detailObj.confirmedQuantity &&
    (props.detailObj.conType === 0 || props.detailObj.conType === 4)
);

/**
 * 是否显示已激活按钮（禁用状态）
 */
const shouldShowDisabled = computed(
  () => (isActive.value || props.detailObj.orderStatus === 1) && props.role === 1
);

/**
 * 是否显示预计到货时间
 */
const shouldShowPredictTime = computed(
  () => +outOfStockObj.value.outTypeNumber === 7 || +outOfStockObj.value.outTypeNumber === 1
);

/**
 * 是否显示新货预计到货时间
 */
const shouldShowNewPredictTime = computed(
  () => +outOfStockObj.value.outTypeNumber === 9 && +outOfStockObj.value.noCooperateType === 6
);

/**
 * 是否显示原因
 */
const shouldShowReason = computed(
  () => props.detailObj.noCooperateType || props.detailObj.availableType
);

/**
 * 是否显示子选项
 */
const shouldShowSubOptions = computed(
  () =>
    +outOfStockObj.value.outTypeNumber === 8 ||
    +outOfStockObj.value.outTypeNumber === 9 ||
    +outOfStockObj.value.outTypeNumber === 11
);

/**
 * 是否显示合作原因
 */
const shouldShowCooperateReason = computed(
  () =>
    +outOfStockObj.value.outTypeNumber === 8 ||
    +outOfStockObj.value.outTypeNumber === 9 ||
    +outOfStockObj.value.outTypeNumber === 11
);

/**
 * 是否显示必填原因
 */
const shouldShowRequiredReason = computed(
  () =>
    +outOfStockObj.value.outTypeNumber === 10 ||
    (+outOfStockObj.value.outTypeNumber === 9 && +outOfStockObj.value.noCooperateType === 5)
);

/**
 * 原因输入框占位符
 */
const requiredReasonPlaceholder = computed(() =>
  shouldShowRequiredReason.value ? '必填，写清原因' : '请输入备注'
);

/**
 * 不合作类型列表
 */
const noCooperateList: any = ref([]);
/**
 * 缺货类型字符串
 */
const outTypeString = computed(() => {
  if (!props.detailObj.outOfStockType) return '其他';
  const option = outTypeOptions
    .concat(oldOutTypeOptions)
    .find(opt => opt.value === props.detailObj.outOfStockType);
  outOfStockObj.value.outTypeNumber = option?.value + '' || '';
  outOfStockObj.value.outTypeString = option?.name || '';
  noCooperateList.value = option?.children || [];
  return option?.name || '';
});

/**
 * 可用类型字符串
 */
const availableTypeString = computed(() => {
  const option = outTypeOptions
    .concat(oldOutTypeOptions)
    .find(opt => opt.value === props.detailObj.outOfStockType);
  if (!option?.children) return '';

  let targetOption;
  switch (props.detailObj.outOfStockType) {
    case 8:
      targetOption = option.children.find(opt => opt.value === props.detailObj.noCooperateType);
      break;
    case 9:
      targetOption = option.children.find(opt => opt.value === props.detailObj.availableType);
      break;
    case 11:
      targetOption = option.children.find(opt => opt.value === props.detailObj.noStockObjective);
      break;
  }
  return targetOption?.name || '';
});

// 日期相关
/**
 * 日历组件引用
 */
const calendarRef = ref();

/**
 * 最大日期（当前年份）
 */
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));

/**
 * 日历确认回调
 * @param val 日历选择结果
 */
const calendarConfirm = (val: any) => {
  if (
    props.detailObj.conType === 0 ||
    props.detailObj.conType === 7 ||
    props.detailObj.conType === 8
  )
    outOfStockObj.value.outTime = val.fulldate;
  if (props.detailObj.conType === 4) ticketObj.value.ticketTime = val.fulldate;
};

// 方法
/**
 * 是否显示缺货类型选择弹窗
 */
const showOutTypeFlag = ref(false);

/**
 * 是否显示合作原因选择弹窗
 */
const showCooperateFlag = ref(false);

/**
 * 处理缺货类型选择
 * @param e 事件对象
 */
const handleChangeOutType = (e: any) => {
  showOutTypeFlag.value = !showOutTypeFlag.value;
  outOfStockObj.value.outTime = '';
  outOfStockObj.value.outReason = '';
  outOfStockObj.value.noCooperateType = '';
  outOfStockObj.value.noCooperateString = '';
};

/**
 * 处理缺货类型选择结果
 * @param val 选择结果
 */
const handleOutType = (val: any) => {
  outOfStockObj.value.outTypeNumber = val.value;
  outOfStockObj.value.outTypeString = val.name;
  noCooperateList.value = val.children || [];
};

/**
 * 处理合作原因选择
 */
const handleChangeCooperate = () => {
  showCooperateFlag.value = !showCooperateFlag.value;
};

/**
 * 处理合作原因选择结果
 * @param val 选择结果
 */
const handleCooperate = (val: any) => {
  outOfStockObj.value.noCooperateType = val.value;
  outOfStockObj.value.noCooperateString = val.name;
};

/**
 * 处理日期变化
 * @param e 事件对象
 */
const onDateChange = (e: any) => {
  outOfStockObj.value.outTime = e.detail.value;
};

/**
 * 处理两票制日期变化
 * @param e 事件对象
 */
const onTicketDateChange = (e: any) => {
  ticketObj.value.ticketTime = e.detail.value;
};

/**
 * 提交表单
 */
const handleSubmit = async () => {
  try {
    // 构建提交参数
    const params = {
      conDtlId: props.detailObj.conDtlId,
      conType: props.detailObj.conType,
      contractQuantity: props.detailObj.contractQuantity,
      customerName: props.detailObj.customerName,
      entryId: props.detailObj.entryId,
      goodsId: props.detailObj.goodsId,
      goodsName: props.detailObj.goodsName,
      purchaserId: props.detailObj.purchaserId,
      purchaserName: props.detailObj.purchaserName,
      recordId: props.detailObj.recordId,
      taskId: props.detailObj.taskId,
    };
    if (isEditing.value) {
      Object.assign(params, { statusFlag: props.detailObj.statusFlag });
    }
    if (isShortage.value) {
      // 处理缺货提交逻辑
      if (+outOfStockObj.value.outTypeNumber === 7) {
        if (!outOfStockObj.value.outTime) {
          uni.showToast({ title: '请选择预计到货时间', icon: 'none' });
          return;
        }

        Object.assign(params, {
          outOfStockType: +outOfStockObj.value.outTypeNumber,
          predictArriveTime: outOfStockObj.value.outTime,
          shortageReason: outOfStockObj.value.outReason,
        });
      }
      if (+outOfStockObj.value.outTypeNumber === 8) {
        if (!outOfStockObj.value.noCooperateType) {
          uni.showToast({ title: '请选择原因', icon: 'none' });
          return;
        }
        Object.assign(params, {
          outOfStockType: outOfStockObj.value.outTypeNumber,
          noCooperateType: outOfStockObj.value.noCooperateType,
          shortageReason: outOfStockObj.value.outReason,
        });
      }
      if (+outOfStockObj.value.outTypeNumber === 9) {
        Object.assign(params, {
          outOfStockType: outOfStockObj.value.outTypeNumber,
          availableType: outOfStockObj.value.noCooperateType,
          noCooperateType: null,
          noStockObjective: null,
          shortageReason: outOfStockObj.value.outReason,
        });
        if (+outOfStockObj.value.noCooperateType === 6) {
          Object.assign(params, {
            predictArriveTime: outOfStockObj.value.outTime,
          });
        }
        if (+outOfStockObj.value.noCooperateType === 5 && !outOfStockObj.value.outReason) {
          uni.showToast({ title: '请写清原因', icon: 'none' });
          return;
        }
      }

      if (+outOfStockObj.value.outTypeNumber === 11) {
        Object.assign(params, {
          outOfStockType: outOfStockObj.value.outTypeNumber,
          availableType: null,
          noCooperateType: null,
          noStockObjective: outOfStockObj.value.noCooperateType,
          shortageReason: outOfStockObj.value.outReason,
        });
        if (+outOfStockObj.value.noCooperateType === 5 && !outOfStockObj.value.outReason) {
          uni.showToast({ title: '请输入原因', icon: 'none' });
          return;
        }
      }
      if (+outOfStockObj.value.outTypeNumber === 10) {
        if (!outOfStockObj.value.outReason) {
          uni.showToast({ title: '请写清原因', icon: 'none' });
          return;
        }
        Object.assign(params, {
          outOfStockType: outOfStockObj.value.outTypeNumber,
          shortageReason: outOfStockObj.value.outReason,
        });
      }
    } else if (isTicket.value) {
      // 处理两票制提交逻辑
      if (!ticketObj.value.ticketTime) {
        uni.showToast({ title: '请选择预计到票时间', icon: 'none' });
        return;
      }
      Object.assign(params, {
        predictArriveTime: ticketObj.value.ticketTime,
        shortageReason: ticketObj.value.ticketReason,
      });
    }
    // 调用提交接口
    const data = await OutOfStockService.outOfStocksubmit({
      ...params,
      recordId: params.recordId ?? '',
    });
    if (data) {
      showSuccess('提交成功');
      isEditing.value = false;
      emit('submitSuccess');
    } else {
      showError('提交失败');
    }
  } catch (error) {
    showError('提交失败');
  }
};

/**
 * 编辑表单
 */
const handleEdit = () => {
  isEditing.value = true;
};

/**
 * 取消编辑
 */
const handleCancel = () => {
  isEditing.value = false;
};

/**
 * 强制激活
 */
const handleForceActive = () => {
  if (isShortage.value) {
    showModal({
      title: '提示',
      content: '是否已与采购员沟通过，确定强制激活?',
      success: res => {
        if (res.confirm) {
          activeSubmit(0);
        }
      },
    });
  } else {
    showModal({
      title: '提示',
      content: '是否确认强制激活此订单？确认后会在细单备注上标识"强开"?',
      success: res => {
        if (res.confirm) {
          activeSubmit(0);
        }
      },
    });
  }
};

/**
 * 激活订单
 */
const handleActive = async () => {
  try {
    if (isShortage.value) {
      const checkRes = await OutOfStockService.checkTicket({ taskId: props.detailObj.taskId });
      const message = !checkRes.data ? '确定激活?' : '该细单品种发票未到，确定激活吗?';
      showModal({
        title: '提示',
        content: message,
        success: res => {
          if (res.confirm) {
            activeSubmit(0);
          }
        },
      });
    } else {
      showModal({
        title: '提示',
        content: '确定激活?',
        success: res => {
          if (res.confirm) {
            activeSubmit(0);
          }
        },
      });
    }
  } catch (error) {
    showError('检查失败');
  }
};

/**
 * 激活提交
 * @param forceFlag 强制激活标志（0-否 1-是）
 */
const activeSubmit = async (forceFlag: number) => {
  try {
    const params = {
      conDtlId: props.detailObj.conDtlId,
      conType: props.detailObj.conType,
      taskId: props.detailObj.taskId,
      forceFlag,
    };
    const res = await OutOfStockService.salerActive(params);
    if (res.success) {
      showSuccess(res.msg);
      emit('submitSuccess');
    } else {
      showError(res.msg);
    }
  } catch (error) {
    showError('激活失败');
  }
};
</script>

<style lang="scss" scoped>
:deep(.uni-textarea-placeholder) {
  text-align: right;
}
</style>
