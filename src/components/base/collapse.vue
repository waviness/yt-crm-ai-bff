<script setup lang="ts">
interface IProps {
  /** 列表数据 */
  list: any[];
  /** 唯一标识字段名，默认为 'id' */
  idKey?: string;
  /** 子项列表字段名，默认为 'children' */
  childrenKey?: string;
}

const props = withDefaults(defineProps<IProps>(), {
  idKey: 'id',
  childrenKey: 'children',
});

const emit = defineEmits<{
  /** 展开折叠面板时触发，用于加载子项数据 */
  open: [item: any];
  /** 选择子项时触发 */
  select: [parent: any, child: any];
}>();

const activeNames = ref<(string | number)[]>([]);
const loadingMap = ref<Record<string | number, boolean>>({});

/**
 * 获取项的唯一标识
 */
const getItemId = (item: any): string | number => {
  return item[props.idKey];
};

/**
 * 获取子项列表
 */
const getChildren = (item: any): any[] | undefined => {
  return item[props.childrenKey];
};

/**
 * 切换折叠面板
 */
const toggleCollapse = async (item: any) => {
  const itemId = getItemId(item);
  const isActive = activeNames.value.includes(itemId);

  // 手风琴模式：只保留一个展开项
  if (isActive) {
    // 关闭当前项
    activeNames.value = [];
  } else {
    // 展开新项
    activeNames.value = [itemId];

    // 如果还没有加载数据，触发加载
    const children = getChildren(item);
    if (!children || children.length === 0) {
      loadingMap.value[itemId] = true;
      emit('open', item);

      // 等待一小段时间让父组件更新数据
      await nextTick();
      loadingMap.value[itemId] = false;
    }
  }
};

/**
 * 选择子项
 */
const handleSelect = (parent: any, child: any) => {
  emit('select', parent, child);
};

/**
 * 判断是否展开
 */
const isExpanded = (itemId: string | number) => {
  return activeNames.value.includes(itemId);
};
</script>

<template>
  <view class="text-14">
    <view v-for="(item, index) in list" :key="getItemId(item) + index" class="bg-white">
      <!-- 折叠面板标题 -->
      <view
        class="flex items-center justify-between px-4 py-4 border-b border-solid border-t-0 border-r-0 border-l-0 border-gray-100"
        @click="toggleCollapse(item)"
      >
        <view class="flex-1">
          <slot name="title" :item="item" :index="index">
            <view>{{ item }}</view>
          </slot>
        </view>
        <view
          class="ml-2 mr-2 transition-transform duration-300 ease-in-out"
          :class="{ 'rotate-180': isExpanded(getItemId(item)) }"
        >
          <up-icon name="arrow-down" size="14"></up-icon>
        </view>
      </view>

      <!-- 折叠面板内容 -->
      <view v-if="isExpanded(getItemId(item))" class="bg-white pl-8">
        <template v-if="loadingMap[getItemId(item)]">
          <view class="flex items-center justify-center py-4">
            <up-loading-icon mode="circle"></up-loading-icon>
            <text class="ml-2 text-12 color-gray-5">加载中...</text>
          </view>
        </template>
        <template v-else>
          <slot name="content" :item="item" :children="getChildren(item) || []">
            <app-empty
              v-if="!getChildren(item) || getChildren(item)!.length === 0"
              class="py-4"
              description="暂无数据"
            />
          </slot>
        </template>
      </view>
    </view>
  </view>
</template>
