<script setup lang="ts">
interface IProps {
  name: string;
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
}

const props = withDefaults(defineProps<IProps>(), {
  name: '',
  type: 'default',
});
</script>

<template>
  <view :class="`crm-tag crm-tag--${type} font-bold`">{{ name }}</view>
</template>

<style lang="scss" scoped>
.crm-tag {
  position: relative;

  &::before {
    position: absolute;
    top: 2px;
    left: -6px;
    width: 3px;
    height: 6px;
    content: '';
  }

  &::after {
    position: absolute;
    bottom: 2px;
    right: -6px;
    width: 3px;
    height: 6px;
    content: '';
  }

  &--success {
    color: $u-success;

    &::before {
      border-left: 2rpx solid $u-success;
      border-top: 2rpx solid $u-success;
    }

    &::after {
      border-right: 2rpx solid $u-success;
      border-bottom: 2rpx solid $u-success;
    }
  }

  &--warning {
    color: $u-warning;

    &::before {
      border-left: 2rpx solid $u-warning;
      border-top: 2rpx solid $u-warning;
    }

    &::after {
      border-right: 2rpx solid $u-warning;
      border-bottom: 2rpx solid $u-warning;
    }
  }

  &--danger {
    color: $u-error;

    &::before {
      border-left: 2rpx solid $u-error;
      border-top: 2rpx solid $u-error;
    }

    &::after {
      border-right: 2rpx solid $u-error;
      border-bottom: 2rpx solid $u-error;
    }
  }

  &--default {
    color: $default-color;

    &::before {
      border-left: 2rpx solid $default-color;
      border-top: 2rpx solid $default-color;
    }

    &::after {
      border-right: 2rpx solid $default-color;
      border-bottom: 2rpx solid $default-color;
    }
  }
}
</style>
