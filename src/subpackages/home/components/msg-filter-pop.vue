<script setup lang="ts">
interface IProps {
  type: number; // 2工作流 1通用任务
  taskType: number; // 2我收到的 1我发出的
  formData: {
    startTime: string;
    endTime: string;
    urgency: { value?: any; name?: string };
    useStatus: { value?: any; name?: string };
    keyword: string;
  };
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  confirm: [value: IProps['formData']];
}>();

const filterShow = ref(false);
const calendarRef = ref();
const urgencyShow = ref(false);
const statusShow = ref(false);

const useStatusOptions = [
  { value: '', name: '全部' },
  { value: 2, name: '未读' },
  { value: 1, name: '已读' },
  { value: 0, name: '作废' },
];

const sendStatusOptions = [
  { value: '', name: '全部' },
  { value: 1, name: '进行中' },
  { value: 2, name: '已完成' },
  { value: 0, name: '已作废' },
];

const urgencyOptions = [
  { value: '', name: '全部' },
  { value: 1, name: '普通' },
  { value: 2, name: '重要' },
  { value: 3, name: '紧急' },
];

const filterVal = ref<IProps['formData']>({
  startTime: '',
  endTime: '',
  urgency: {},
  useStatus: {},
  keyword: '',
});

const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.startTime ||
      filterVal.value.urgency?.name ||
      filterVal.value.useStatus?.name ||
      filterVal.value.keyword)
  ) {
    return true;
  }
  return false;
});

const onDateConfirm = (value: any) => {
  if (value?.range?.before && value?.range?.after) {
    filterVal.value.startTime = time.format(new Date(value.range.before), time.FORMATS.ISO_DATE);
    filterVal.value.endTime = time.format(new Date(value.range.after), time.FORMATS.ISO_DATE);
  }
};

const onSelectUrgency = (action: any) => {
  urgencyShow.value = false;
  filterVal.value.urgency = action;
};

const onSelectStatus = (action: any) => {
  statusShow.value = false;
  filterVal.value.useStatus = action;
};

const reset = () => {
  filterVal.value = {
    startTime: '',
    endTime: '',
    urgency: {},
    useStatus: {},
    keyword: '',
  };
};

const onConfirm = () => {
  emit('confirm', { ...filterVal.value });
};

watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
  },
  { immediate: true, deep: true }
);
</script>

<template>
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
            filterVal.startTime ? `${filterVal.startTime} 至 ${filterVal.endTime}` : '点击选择日期'
          }}
        </view>
      </app-form-item>
      <app-form-item v-if="type === 1" label="紧急程度">
        <view
          :class="`w-full text-right ${filterVal.urgency?.name ? '' : 'color-gray-6'}`"
          @click="urgencyShow = true"
        >
          {{ filterVal.urgency?.name || '点击选择紧急程度' }}
        </view>
      </app-form-item>
      <app-form-item label="任务状态">
        <view
          :class="`w-full text-right ${filterVal.useStatus?.name ? '' : 'color-gray-6'}`"
          @click="statusShow = true"
        >
          {{ filterVal.useStatus?.name || '点击选择任务状态' }}
        </view>
      </app-form-item>
      <app-form-item :label="type === 1 ? '标题/内容/发送人' : '内容'" :borderBottom="false">
        <up-input
          v-model="filterVal.keyword"
          clearable
          :placeholder="type === 1 ? '请输入标题/内容/发送人' : '请输入内容'"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>
    </up-form>
    <app-calendar ref="calendarRef" mode="range" @confirm="onDateConfirm" />
    <app-action-sheet
      v-model:show="urgencyShow"
      :actions="urgencyOptions"
      description="紧急程度选择"
      @select="onSelectUrgency"
    />
    <app-action-sheet
      v-model:show="statusShow"
      :actions="taskType === 2 ? useStatusOptions : sendStatusOptions"
      description="任务状态选择"
      @select="onSelectStatus"
    />
  </app-filter-pop>
</template>
