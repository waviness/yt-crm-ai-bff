<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  formData: any;
  entryList: any[];
}

const props = defineProps<IProps>();
const emit = defineEmits(['confirm']);

// 弹窗状态
const filterShow = ref(false);
const entryShow = ref(false);
const conTypeShow = ref(false);
const sendShow = ref(false);
const handleShow = ref(false);

// 日历组件 ref
const calendarRef = ref();

// 日期范围
const minDate = ref(new Date(2010, 0, 1).getTime());
const maxDate = ref(new Date().getTime());

// 筛选值（内部状态）
const localFilterValue = ref({
  startDate: time.format(time.add(new Date(), -4, 'day'), time.FORMATS.ISO_DATE),
  endDate: time.format(new Date(), time.FORMATS.ISO_DATE),
  entryId: '',
  entryName: '',
  customerKeyword: '',
  goodsKeyword: '',
  conType: '',
  conTypeName: '',
  taskid: '',
  condtlid: '',
  salesmanId: '',
  purchaserId: '',
  accessType: '',
  accessTypeName: '',
  handleType: '',
  handleTypeName: '',
});

// 监听外部 formData 变化，同步到内部状态
watch(
  () => props.formData,
  val => {
    if (val) {
      localFilterValue.value = { ...localFilterValue.value, ...val };
    }
  },
  { immediate: true, deep: true }
);

// 锁控类型选项
const conTypeActions = [
  { id: '', text: '全部', name: '全部' },
  { id: 0, text: '缺货', name: '缺货' },
  { id: 1, text: '区域限销', name: '区域限销' },
  { id: 2, text: '价格限销', name: '价格限销' },
  { id: 3, text: '下限锁', name: '下限锁' },
  { id: 4, text: '两票制提醒', name: '两票制提醒' },
  { id: 5, text: '紧俏药品', name: '紧俏药品' },
  { id: 6, text: '禁限销', name: '禁限销' },
  { id: 7, text: '库存状态', name: '库存状态' },
  { id: 8, text: '近效期', name: '近效期' },
];

// 发送状态选项
const sendActions = [
  { id: '', name: '全部' },
  { id: 1, name: '已发送' },
  { id: 0, name: '未发送' },
];

// 处理状态选项
const handleActions = [
  { id: '', name: '全部' },
  { id: 1, name: '已处理' },
  { id: 0, name: '未处理' },
];

// 核算单元选项（转换为统一格式）
const entryActions = computed(() => {
  return props.entryList.map((item, index) => ({
    id: index,
    name: item.entryid ? `${item.entryid}/${item.entryname}` : item.entryname,
  }));
});

// 计算属性：是否有筛选条件
const hasFilter = computed(() => {
  return (
    !filterShow.value &&
    (localFilterValue.value.entryId ||
      localFilterValue.value.customerKeyword ||
      localFilterValue.value.goodsKeyword ||
      localFilterValue.value.conType !== '' ||
      localFilterValue.value.taskid ||
      localFilterValue.value.condtlid ||
      localFilterValue.value.salesmanId ||
      localFilterValue.value.purchaserId ||
      localFilterValue.value.accessType !== '' ||
      localFilterValue.value.handleType !== '')
  );
});

// 日期选择确认
const onDateConfirm = (value: any) => {
  localFilterValue.value.startDate = time.format(value.range.before, time.FORMATS.ISO_DATE);
  localFilterValue.value.endDate = time.format(value.range.after, time.FORMATS.ISO_DATE);
};

// 锁控类型选择
const onConTypeSelect = (item: any) => {
  const selectedItem = conTypeActions[item.id];
  localFilterValue.value.conType = selectedItem.id;
  localFilterValue.value.conTypeName = selectedItem.name;
};

// 核算单元选择
const onEntrySelect = (item: any) => {
  const selectedEntry = props.entryList[item.id];
  if (selectedEntry) {
    localFilterValue.value.entryId = selectedEntry.entryid;
    localFilterValue.value.entryName = selectedEntry.entryname;
  }
};

// 发送状态选择
const onSendSelect = (item: any) => {
  const selectedItem = sendActions[item.id];
  localFilterValue.value.accessType = selectedItem.id;
  localFilterValue.value.accessTypeName = selectedItem.name;
};

// 处理状态选择
const onHandleSelect = (item: any) => {
  const selectedItem = handleActions[item.id];
  localFilterValue.value.handleType = selectedItem.id;
  localFilterValue.value.handleTypeName = selectedItem.name;
};

// 重置
const handleReset = () => {
  localFilterValue.value = {
    startDate: time.format(time.add(new Date(), -4, 'day'), time.FORMATS.ISO_DATE),
    endDate: time.format(new Date(), time.FORMATS.ISO_DATE),
    entryId: '',
    entryName: '',
    customerKeyword: '',
    goodsKeyword: '',
    conType: '',
    conTypeName: '',
    taskid: '',
    condtlid: '',
    salesmanId: '',
    purchaserId: '',
    accessType: '',
    accessTypeName: '',
    handleType: '',
    handleTypeName: '',
  };
};

// 确认
const handleConfirm = () => {
  filterShow.value = false;
  // 只传递后端需要的字段
  const submitData = {
    startDate: localFilterValue.value.startDate,
    endDate: localFilterValue.value.endDate,
    entryId: localFilterValue.value.entryId,
    customerKeyword: localFilterValue.value.customerKeyword,
    goodsKeyword: localFilterValue.value.goodsKeyword,
    conType: localFilterValue.value.conType,
    taskid: localFilterValue.value.taskid,
    condtlid: localFilterValue.value.condtlid,
    salesmanId: localFilterValue.value.salesmanId,
    purchaserId: localFilterValue.value.purchaserId,
    accessType: localFilterValue.value.accessType,
    handleType: localFilterValue.value.handleType,
  };
  emit('confirm', submitData);
};
</script>

<template>
  <app-filter-pop
    :filterShow="filterShow"
    :filterSome="hasFilter"
    @update:filterShow="filterShow = $event"
    @confirm="handleConfirm"
    @reset="handleReset"
  >
    <up-form>
      <!-- 日期选择 -->
      <app-form-item label="日期选择">
        <view :class="`w-full text-right text-14 color-black-2`" @click="calendarRef.open()">
          {{ localFilterValue.startDate }} 至 {{ localFilterValue.endDate }}
        </view>
      </app-form-item>

      <!-- 核算单元 -->
      <app-form-item label="核算单元">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.entryName ? 'color-black-2' : 'color-gray-6'}`"
          @click="entryShow = true"
        >
          {{ localFilterValue.entryName || '请选择核算单元' }}
        </view>
      </app-form-item>

      <!-- 客户信息 -->
      <app-form-item label="客户信息">
        <up-input
          v-model="localFilterValue.customerKeyword"
          placeholder="请输入客户信息"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 品种信息 -->
      <app-form-item label="品种信息">
        <up-input
          v-model="localFilterValue.goodsKeyword"
          placeholder="请输入品种信息"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 锁控类型 -->
      <app-form-item label="锁控类型">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.conTypeName ? 'color-black-2' : 'color-gray-6'}`"
          @click="conTypeShow = true"
        >
          {{ localFilterValue.conTypeName || '请选择锁控类型' }}
        </view>
      </app-form-item>

      <!-- 锁控编号 -->
      <app-form-item label="锁控编号">
        <up-input
          v-model="localFilterValue.taskid"
          placeholder="请输入锁控编号"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 细单ID -->
      <app-form-item label="细单ID">
        <up-input
          v-model="localFilterValue.condtlid"
          placeholder="请输入合同细单ID"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 业务员 -->
      <app-form-item label="业务员">
        <up-input
          v-model="localFilterValue.salesmanId"
          placeholder="请输入业务员信息"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 采购员 -->
      <app-form-item label="采购员">
        <up-input
          v-model="localFilterValue.purchaserId"
          placeholder="请输入采购员信息"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 发送状态 -->
      <app-form-item label="发送状态">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.accessTypeName ? 'color-black-2' : 'color-gray-6'}`"
          @click="sendShow = true"
        >
          {{ localFilterValue.accessTypeName || '请选择发送状态' }}
        </view>
      </app-form-item>

      <!-- 处理状态 -->
      <app-form-item label="处理状态" :borderBottom="false">
        <view
          :class="`w-full text-right text-14 ${localFilterValue.handleTypeName ? 'color-black-2' : 'color-gray-6'}`"
          @click="handleShow = true"
        >
          {{ localFilterValue.handleTypeName || '请选择处理状态' }}
        </view>
      </app-form-item>
    </up-form>
  </app-filter-pop>

  <!-- 日期选择器 -->
  <app-calendar
    ref="calendarRef"
    mode="range"
    :min-date="minDate"
    :max-date="maxDate"
    :date="[localFilterValue.startDate, localFilterValue.endDate]"
    @confirm="onDateConfirm"
  />

  <!-- 核算单元选择 -->
  <app-action-sheet
    v-model:show="entryShow"
    :actions="entryActions"
    description="核算单元选择"
    @select="onEntrySelect"
  />

  <!-- 锁控类型选择 -->
  <app-action-sheet
    v-model:show="conTypeShow"
    :actions="conTypeActions"
    description="锁控类型选择"
    @select="onConTypeSelect"
  />

  <!-- 发送状态选择 -->
  <app-action-sheet
    v-model:show="sendShow"
    :actions="sendActions"
    description="发送状态选择"
    @select="onSendSelect"
  />

  <!-- 处理状态选择 -->
  <app-action-sheet
    v-model:show="handleShow"
    :actions="handleActions"
    description="处理状态选择"
    @select="onHandleSelect"
  />
</template>

<style scoped></style>
