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

// 日历组件 ref
const calendarRef = ref();

// 日期范围
const minDate = ref(new Date(2010, 0, 1).getTime());
const maxDate = ref(new Date().getTime());

// 筛选值（内部状态）
const localFilterValue = ref({
  start: time.format(time.add(new Date(), -30, 'day'), time.FORMATS.ISO_DATE),
  end: time.format(new Date(), time.FORMATS.ISO_DATE),
  crmId: '',
  entryId: '',
  entryName: '',
  custom: '',
  dtlId: '',
  goods: '',
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
      localFilterValue.value.custom ||
      localFilterValue.value.dtlId ||
      localFilterValue.value.goods)
  );
});

// 日期选择确认
const onDateConfirm = (value: any) => {
  localFilterValue.value.start = time.format(value.range.before, time.FORMATS.ISO_DATE);
  localFilterValue.value.end = time.format(value.range.after, time.FORMATS.ISO_DATE);
};

// 核算单元选择
const onEntrySelect = (item: any) => {
  const selectedEntry = props.entryList[item.id];
  if (selectedEntry) {
    localFilterValue.value.entryId = selectedEntry.entryid;
    localFilterValue.value.entryName = selectedEntry.entryname;
  }
};

// 重置
const handleReset = () => {
  localFilterValue.value = {
    start: time.format(time.add(new Date(), -30, 'day'), time.FORMATS.ISO_DATE),
    end: time.format(new Date(), time.FORMATS.ISO_DATE),
    crmId: '',
    entryId: '',
    entryName: '',
    custom: '',
    dtlId: '',
    goods: '',
  };
};

// 确认
const handleConfirm = () => {
  filterShow.value = false;
  // 只传递后端需要的字段
  const submitData = {
    start: localFilterValue.value.start,
    end: localFilterValue.value.end,
    crmId: localFilterValue.value.crmId,
    entryId: localFilterValue.value.entryId,
    custom: localFilterValue.value.custom,
    dtlId: localFilterValue.value.dtlId,
    goods: localFilterValue.value.goods,
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
          {{ localFilterValue.start }} 至 {{ localFilterValue.end }}
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
          v-model="localFilterValue.custom"
          placeholder="请输入客户ID丨客户名称"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 货品信息 -->
      <app-form-item label="货品信息">
        <up-input
          v-model="localFilterValue.goods"
          placeholder="请输入货品ID丨货品名称"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>

      <!-- 细单ID -->
      <app-form-item label="细单ID" :borderBottom="false">
        <up-input
          v-model="localFilterValue.dtlId"
          placeholder="请输入合同细单ID"
          input-align="right"
          fontSize="14"
          border="none"
          clearable
        />
      </app-form-item>
    </up-form>
  </app-filter-pop>

  <!-- 日期选择器 -->
  <app-calendar
    ref="calendarRef"
    mode="range"
    :min-date="minDate"
    :max-date="maxDate"
    :date="[localFilterValue.start, localFilterValue.end]"
    @confirm="onDateConfirm"
  />

  <!-- 核算单元选择 -->
  <app-action-sheet
    v-model:show="entryShow"
    :actions="entryActions"
    description="核算单元选择"
    @select="onEntrySelect"
  />
</template>

<style scoped></style>
