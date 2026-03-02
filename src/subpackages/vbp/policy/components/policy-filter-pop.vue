<!-- 政策筛选组件 -->
<script setup lang="ts">
interface FilterVal {
  custom: string;
  start: string;
  end: string;
}

const props = defineProps<{
  formData: FilterVal;
}>();

const emit = defineEmits<{
  confirm: [value: FilterVal];
}>();

const calendarRef = ref();
const filterShow = ref(false);
const filterVal = ref<FilterVal>({
  custom: '',
  start: '',
  end: '',
});

const filterSome = computed(() => {
  if (!filterShow.value && (filterVal.value.custom || filterVal.value.start)) {
    return true;
  }
  return false;
});

const handleDateConfirm = (value: any) => {
  filterVal.value.start = value.range.before;
  filterVal.value.end = value.range.after;
};

const reset = () => {
  filterVal.value = {
    custom: '',
    start: '',
    end: '',
  };
};

const handleConfirm = () => {
  filterShow.value = false;
  emit('confirm', { ...filterVal.value });
};

watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
  },
  { immediate: true }
);
</script>

<template>
  <app-filter-pop
    v-model:filterShow="filterShow"
    :filterSome="filterSome"
    @confirm="handleConfirm"
    @reset="reset"
  >
    <up-form>
      <app-form-item label="时间范围" class="mt-1">
        <view
          :class="`w-full text-right ${filterVal.start ? '' : 'color-gray-6'}`"
          @click="calendarRef?.open()"
        >
          {{ filterVal.start ? `${filterVal.start} 至 ${filterVal.end}` : '点击选择时间范围' }}
        </view>
      </app-form-item>
      <app-form-item label="客户名称|ID" :borderBottom="false">
        <up-input
          v-model="filterVal.custom"
          clearable
          placeholder="请输入客户名称|ID"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        >
        </up-input>
      </app-form-item>
    </up-form>
    <app-calendar ref="calendarRef" mode="range" @confirm="handleDateConfirm" />
  </app-filter-pop>
</template>
