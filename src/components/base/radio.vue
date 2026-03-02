<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface Props {
  options?: Array<{ name: string | number; label: string }>;
  status?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  status: '',
});

const emit = defineEmits<{
  'update:status': [value: string | number];
}>();

const value = ref<string | number>(props.status || '');

// 监听外部 status 变化，同步到内部 value（只在外部真正改变时更新）
watch(
  () => props.status,
  newVal => {
    if (value.value !== newVal) {
      value.value = newVal || '';
    }
  },
  { immediate: true }
);

const onChange = (newValue: string | number) => {
  // 直接使用事件传递的新值，确保同步
  value.value = newValue;
  emit('update:status', newValue);
};
</script>

<template>
  <up-radio-group
    v-model="value"
    placement="row"
    class="text-14 justify-end radio-group"
    @change="(val: string | number) => onChange(val)"
  >
    <up-radio
      v-for="(item, idx) in options"
      :key="idx"
      :name="item.name"
      :label="item.label"
      labelSize="14"
      :class="idx > 0 ? 'ml-5' : ''"
    >
      <template #icon>
        <view
          class="w-14px h-14px border-1 border-solid rounded-full flex items-center justify-center"
          :class="value === item.name ? 'border-main' : 'border-[#dcdee0]'"
        >
          <view v-if="value === item.name" class="w-8px h-8px rounded-full bg-main"></view>
        </view>
      </template>
    </up-radio>
  </up-radio-group>
</template>

<style lang="scss" scoped>
:deep(.u-radio__icon-wrap) {
  background: transparent !important;
}
</style>
