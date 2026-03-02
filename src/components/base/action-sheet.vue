<script setup lang="ts">
import type { OptionItem } from '@/types/common';

defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  show: boolean;
  actions: OptionItem[];
  description?: string;
  cancelText?: string;
  closeOnClickOverlay?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  description: '',
  cancelText: '取消',
  closeOnClickOverlay: true,
});

const emit = defineEmits<{
  'update:show': [value: boolean];
  select: [action: OptionItem];
  close: [];
}>();

const onSelect = (action: OptionItem) => {
  emit('select', action);
  emit('update:show', false);
};

const onClose = () => {
  emit('close');
  emit('update:show', false);
};
</script>

<template>
  <up-action-sheet
    :show="show"
    :actions="actions"
    round="16"
    :cancel-text="cancelText"
    :description="description"
    :closeOnClickOverlay="closeOnClickOverlay"
    @close="onClose"
    @select="onSelect"
  />
</template>

<style lang="scss" scoped>
:deep(.u-action-sheet__description) {
  line-height: 120rpx;
}

:deep(.u-action-sheet__item-wrap) {
  max-height: 60vh !important;
}
</style>
