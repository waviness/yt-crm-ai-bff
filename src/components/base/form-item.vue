<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  label?: string;
  labelWidth?: string | number;
  borderBottom: boolean;
  labelPosition?: 'left' | 'top';
  required?: boolean;
  arrow?: boolean;
}

withDefaults(defineProps<IProps>(), {
  labelWidth: 'auto',
  borderBottom: true,
  labelPosition: 'left',
  required: false,
  arrow: false,
});
</script>

<template>
  <up-form-item
    class="px-4 py-4rpx"
    :label="label"
    :labelWidth="labelWidth"
    :borderBottom="borderBottom"
    :labelPosition="labelPosition"
    :required="required"
  >
    <slot></slot>
    <template v-if="arrow" #right>
      <up-icon name="arrow-right" size="16" color="#969799" bold />
    </template>
  </up-form-item>
</template>

<style lang="scss" scoped>
/* stylelint-disable-next-line selector-class-pattern */
:deep(.u-form-item__body__left__content__label) {
  font-size: 28rpx;
  color: #646566;
}
</style>
