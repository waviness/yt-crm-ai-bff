<script setup lang="ts">
interface IProps {
  modelValue?: string;
  placeholder?: string;
  showAction?: boolean;
  clearable?: boolean;
  shape?: string;
  bgColor?: string;
  cancelButton?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  modelValue: '',
  placeholder: '搜索',
  showAction: false,
  clearable: true,
  shape: 'square',
  bgColor: '#f7f8fa',
  cancelButton: 'none',
});

// 搜索防抖定时器
let searchTimer: any = null;

const emit = defineEmits<{
  'update:modelValue': [value: string];
  input: [value: string];
  search: [value: string];
  clear: [];
  cancel: [];
  blur: [];
  focus: [];
}>();

const localValue = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
});

const handleInput = () => {
  // 添加防抖，避免频繁触发搜索
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    emit('input', localValue.value);
  }, 300);
};

const handleSearch = () => {
  emit('search', localValue.value);
};

const handleClear = () => {
  emit('clear');
};

const handleCancel = () => {
  emit('cancel');
};

const handleBlur = () => {
  emit('blur');
};

const handleFocus = () => {
  emit('focus');
};
</script>

<template>
  <view class="bg-white px-1">
    <uni-search-bar
      v-model="localValue"
      :placeholder="placeholder"
      :bgColor="bgColor"
      :cancelButton="cancelButton"
      @input="handleInput"
      @confirm="handleSearch"
      @clear="handleClear"
      @cancel="handleCancel"
      @blur="handleBlur"
      @focus="handleFocus"
    ></uni-search-bar>
  </view>
</template>
