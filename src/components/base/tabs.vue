<script setup lang="ts">
interface IProps {
  current?: number;
  list?: any[];
  lineWidth?: number | string;
  scrollable?: boolean;
  color?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  current: 0,
  list: () => [],
  lineWidth: 40,
  scrollable: false,
  color: '',
});

const emit = defineEmits<{
  change: [{ index: number }];
}>();

const appStore = useAppStore();

// 如果没有传入 color，使用主题色
const tabColor = computed(() => props.color || appStore.theme.color.primary);

const handleChange = ({ index }: { index: number }) => {
  emit('change', { index });
};
</script>

<template>
  <up-tabs
    class="bg-white"
    :current="current"
    :list="list"
    :lineWidth="lineWidth"
    :scrollable="scrollable"
    :color="tabColor"
    @change="handleChange"
  />
</template>

<style lang="scss" scoped>
/* stylelint-disable-next-line selector-class-pattern */
:deep(.u-tabs__wrapper__nav__item__text) {
  font-size: 28rpx;
}
</style>
