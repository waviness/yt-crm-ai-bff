<script setup lang="ts">
interface IProps {
  name: string | number;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'normal' | 'advanced' | 'never';
  bold?: string;
  fontSize?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  name: '',
  type: 'primary',
  bold: '',
  fontSize: 14,
});

const typeClass = computed(() => {
  return `tag--${props.type}`;
});
</script>

<template>
  <view :class="['tag', typeClass, bold ? `font-${bold}` : '', `text-${fontSize}`]">{{
    name
  }}</view>
</template>

<style lang="scss" scoped>
.tag {
  border-radius: 2px;
  padding: 0 5px;
  height: 21px;
  line-height: 21px;
  text-align: center;

  &--primary {
    color: #2271f5;
    background: #e8f1fe;
  }

  &--success {
    color: #00a870;
    background: #e8f8f2;
  }

  &--warning {
    color: #ed7b2f;
    background: #fef3e6;
  }

  &--danger {
    color: #e34d59;
    background: #fdecee;
  }

  &--normal {
    color: #ffffff;
    background: #00a870;
  }

  &--advanced {
    color: #ffffff;
    background: #f2995f;
  }

  &--never {
    color: #ffffff;
    background: #e34d59;
  }

  &--default {
    color: #969799;
    background: #f4f4f5;
  }
}
</style>
