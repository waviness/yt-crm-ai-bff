<template>
  <view class="px-2">
    <view class="flex items-center w-full">
      <view
        v-if="
          (entryObj.deptLevel &&
            +entryObj.deptLevel <= 3 &&
            +entryObj.deptLevel !== 0 &&
            +entryObj.deptLevel !== 1) ||
          (entryObj.deptLevel && +entryObj.deptLevel === 1 && entryObj.deptId === '449')
        "
        class="flex data-trend items-center flex-3 mr-2"
      >
        <view
          @click="statusTabClick(0)"
          class="flex-1 flex items-center align-center"
          :class="statusActive === 0 ? 'active' : ''"
        >
          <app-icon class="ml-2" name="sjzx-fill" multi size="18" />
          <view class="text-16">全局看板</view>
        </view>
        <view
          class="flex-1 flex items-center"
          @click="statusTabClick(1)"
          :class="statusActive === 1 ? 'active' : ''"
        >
          <app-icon
            class="ml-2"
            :name="statusActive === 1 ? 'sjzx-ywkb-white' : 'sjzx-ywkb-blue'"
            multi
            size="18"
          />
          <view class="text-16">业务看板</view>
        </view>
      </view>
      <view
        @click="echartsBarClick"
        class="data-trend flex-2 flex justify-between align-center px-2"
      >
        <view class="flex items-center">
          <app-icon class="mr-1" size="14px" multi name="sjzx-sjqs" />
          <view class="text-16">数据趋势</view>
        </view>
        <up-icon name="arrow-right"></up-icon>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj } from '../../types';
interface IProps {
  entryObj: EntryObj;
}
defineProps<IProps>();
const emit = defineEmits(['echartsBarClick', 'statusTabClick']);
const statusActive = ref(0);
const statusTabClick = (index: number) => {
  statusActive.value = index;
  emit('statusTabClick', index);
};
const echartsBarClick = () => {
  emit('echartsBarClick');
};
</script>

<style lang="scss" scoped>
.data-trend {
  height: 37px;
  line-height: 37px;
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  .active {
    background-color: #3561f2;
    color: #fff;
    border-radius: 30px;
  }
}
</style>
