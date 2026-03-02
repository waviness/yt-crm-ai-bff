<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  refreshing?: boolean;
  showLoadmore?: boolean;
  pullRefreshHeight?: string | number;
  loadmoreProps?: object;
}

withDefaults(defineProps<IProps>(), { showLoadmore: true });

const emit = defineEmits(['refresh', 'loadmore']);

const onRefresh = () => {
  console.log('pull-refresh: onRefresh called');
  emit('refresh');
};

const onLoadMore = () => {
  console.log('pull-refresh: onLoadMore called');
  emit('loadmore');
};
</script>

<template>
  <up-pull-refresh
    :refreshing="refreshing"
    :showLoadmore="showLoadmore"
    :loadmoreProps="loadmoreProps"
    :style="{ display: 'block', height: pullRefreshHeight, overflowY: 'auto' }"
    @refresh="onRefresh"
    @loadmore="onLoadMore"
  >
    <slot></slot>
  </up-pull-refresh>
</template>

<style scoped>
:deep(.u-loadmore__content) {
  margin-bottom: 240rpx;
}
</style>
