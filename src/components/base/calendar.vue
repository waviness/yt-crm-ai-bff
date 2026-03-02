<script setup lang="ts">
interface IProps {
  mode?: string;
  startText?: string;
  endText?: string;
  selected?: any[];
  date?: string | string[];
  startDate?: string;
  endDate?: string;
  color?: string;
  round?: number;
  title?: string;
  firstDayOfWeek?: number;
  autoSelectWeek?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  mode: 'single',
  startText: '开始',
  endText: '结束',
  selected: () => [],
  startDate: time.format(new Date(2010, 0, 1), time.FORMATS.ISO_DATE),
  endDate: time.format(time.add(new Date(), 10, 'year'), time.FORMATS.ISO_DATE),
  color: '',
  round: 16,
});

const appStore = useAppStore();

const emit = defineEmits<{
  confirm: [value: any];
  close: [];
  choice: [value: any];
}>();

// 使用计算属性获取主题颜色，如果没有传入则使用默认值
const calendarColor = computed(() => props.color || appStore.theme.color.main);

// 内部日历引用
const calendarsRef = ref<any>(null);

// 暴露 open 方法
const open = () => {
  calendarsRef.value?.open();
};

// 暴露 close 方法
const close = () => {
  calendarsRef.value?.close();
};

const handleConfirm = (value: any) => {
  emit('confirm', value);
};

const handleClose = () => {
  emit('close');
};

const handleChoice = (e: any) => {
  emit('choice', e);
};

// 设置日期范围（用于range模式）
const setDateRange = (startDate: string, endDate: string) => {
  if (calendarsRef.value) {
    calendarsRef.value.setDateRange(startDate, endDate);
  }
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
  setDateRange,
});
</script>

<template>
  <uv-calendars
    ref="calendarsRef"
    :mode="mode"
    :date="date"
    :title="title"
    :start-text="startText"
    :end-text="endText"
    :selected="selected"
    :start-date="startDate"
    :end-date="endDate"
    :color="calendarColor"
    :round="round"
    :first-day-of-week="firstDayOfWeek"
    :auto-select-week="autoSelectWeek"
    @choiceDate="handleChoice"
    @confirm="handleConfirm"
    @close="handleClose"
  />
</template>
