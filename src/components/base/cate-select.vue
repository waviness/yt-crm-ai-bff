<script setup lang="ts">
interface IProps {
  activeIndex: number; // 左侧选中项的索引
  activeId: number | string; // 右侧选中项的 id
  activeIds?: (number | string)[]; // 多选时已选中的 id 列表
  items: any[];
  height: string;
}

const props = withDefaults(defineProps<IProps>(), {
  activeIndex: 0,
  activeId: '',
  activeIds: () => [],
  items: () => [],
  height: '600rpx',
});

const appStore = useAppStore();

const emit = defineEmits<{
  'update:activeIndex': [value: number];
  'update:activeId': [value: number | string];
}>();

const currentIndexValue = computed({
  get: () => props.activeIndex,
  set: (value: number) => emit('update:activeIndex', value),
});

const currentIdValue = computed({
  get: () => props.activeId,
  set: (value: number | string) => emit('update:activeId', value),
});

const currentChildren = computed(() => {
  return props.items[currentIndexValue.value]?.children || [];
});

// 判断某项是否被选中（多选模式）
const isItemSelected = (id: number | string) => {
  // 优先使用 activeIds 数组进行多选判断
  if (props.activeIds && props.activeIds.length > 0) {
    // 统一转换为字符串进行比较，避免类型不一致问题
    const idStr = String(id);
    const activeIdsStr = props.activeIds.map(item => String(item));

    // 如果该项在 activeIds 中，直接返回 true
    if (activeIdsStr.includes(idStr)) {
      return true;
    }

    // 如果是"全部"项（id < 0），检查是否所有子项都被选中
    if (Number(id) < 0) {
      const currentItem = props.items[currentIndexValue.value];
      if (!currentItem || !currentItem.children) return false;

      const positiveChildren = currentItem.children.filter((item: any) => Number(item.id) > 0);
      if (positiveChildren.length === 0) return false;

      // 如果所有子项（id > 0）都被选中，则"全部"项也应该显示为选中
      return positiveChildren.every((item: any) => {
        const itemIdStr = String(item.id);
        return activeIdsStr.includes(itemIdStr);
      });
    }

    return false;
  }
  // 如果没有 activeIds 或 activeIds 为空，则使用单选模式（activeId），保持原有比较逻辑以确保向后兼容
  // 但如果传入了 activeIds prop（即使是空数组），说明是多选模式，应该返回 false
  if (props.activeIds !== undefined) {
    return false;
  }
  return currentIdValue.value === id;
};
</script>

<template>
  <view class="flex text-14 color-black-2" :style="{ height: height }">
    <!-- 左侧分类栏 -->
    <scroll-view class="bg-gray-10 w-250" scroll-y>
      <view
        v-for="(item, index) in items"
        :key="item.id"
        :class="[
          'px-3 py-28rpx flex items-center relative',
          currentIndexValue === index ? 'bg-white font-bold active-item' : '',
        ]"
        @click="currentIndexValue = index"
      >
        {{ item.text }}
      </view>
    </scroll-view>
    <!-- 右侧内容栏 -->
    <scroll-view class="flex-1 font-bold" scroll-y>
      <view
        v-for="item in currentChildren"
        :key="item.id"
        class="flex justify-between items-center px-4 py-28rpx"
        @click="currentIdValue = item.id"
      >
        <view :class="[isItemSelected(item.id) ? 'color-main-3' : '']">{{ item.text }}</view>
        <up-icon
          v-if="isItemSelected(item.id)"
          name="checkbox-mark"
          size="32rpx"
          :color="appStore.theme.color.primary"
        />
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.active-item::before {
  position: absolute;
  top: 50%;
  left: 0;
  width: 8rpx;
  height: 32rpx;
  background-color: #2271f5;
  transform: translateY(-50%);
  content: '';
}
</style>
