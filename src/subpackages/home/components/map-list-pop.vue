<template>
  <view>
    <app-filter-pop
      v-model:filterShow="filterShow"
      :filterSome="filterSome"
      @confirm="onConfirm"
      @reset="reset"
    >
      <up-form>
        <app-form-item label="日期选择" class="mt-1">
          <view
            :class="`w-full text-right ${filterVal.startTime ? '' : 'color-gray-6'}`"
            @click="calendarRef?.open()"
          >
            {{
              filterVal.startTime
                ? `${filterVal.startTime} 至 ${filterVal.endTime}`
                : '点击选择日期'
            }}
          </view>
        </app-form-item>
        <app-form-item label="人员ID/名称">
          <up-input
            v-model="filterVal.user"
            clearable
            placeholder="请输入人员ID/名称"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
        <app-form-item label="关键字搜索" :borderBottom="false">
          <up-input
            v-model="filterVal.keyword"
            clearable
            placeholder="输入打卡地址关键字搜索"
            inputAlign="right"
            fontSize="28rpx"
            border="none"
          />
        </app-form-item>
      </up-form>
    </app-filter-pop>
    <app-calendar ref="calendarRef" mode="range" @confirm="onDateConfirm" />
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  formData: {
    startTime: string;
    endTime: string;
    user: string;
    keyword: string;
  };
}

const props = defineProps<IProps>();
const filterShow = ref(false);
const emit = defineEmits<{
  confirm: [value: IProps['formData']];
}>();
const filterVal = ref<IProps['formData']>({
  startTime: '',
  endTime: '',
  user: '',
  keyword: '',
});
const calendarRef = ref();
const onDateConfirm = (value: any) => {
  if (value?.range?.before && value?.range?.after) {
    filterVal.value.startTime = time.format(new Date(value.range.before), time.FORMATS.ISO_DATE);
    filterVal.value.endTime = time.format(new Date(value.range.after), time.FORMATS.ISO_DATE);
  }
};

const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.startTime || filterVal.value.user || filterVal.value.keyword)
  ) {
    return true;
  }
  return false;
});
const reset = () => {
  filterVal.value = {
    startTime: props.formData.startTime,
    endTime: props.formData.endTime,
    user: props.formData.user,
    keyword: '',
  };
};
watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
  },
  { immediate: true, deep: true }
);
const onConfirm = () => {
  emit('confirm', { ...filterVal.value });
};
</script>

<style lang="scss" scoped></style>
