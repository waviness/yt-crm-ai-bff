<template>
  <up-popup
    :show="flitershow"
    :header="'高级操作'"
    mode="bottom"
    round="20"
    @close="fliterClose"
    :safeAreaInsetBottom="true"
  >
    <view class="px-2 pb-3 text-14">
      <view class="up-popup-header text-center text-16 font-bold">高级操作</view>
      <view class="mb-3">搜索</view>
      <up-search
        class="pa-2 mb-2"
        :showAction="false"
        placeholder="输入搜索关键词"
        v-model="stagingFilter.keyword"
      ></up-search>
      <view class="mb-3">排序</view>
      <view class="flex flex-wrap">
        <view
          v-for="(data, index) in orderList"
          :key="index"
          @click="chooseFilter(data, index)"
          class="filter-div px-2 mr-1 mb-3"
          :class="stagingFilter.filterIndex === index ? 'filter-div-active' : ''"
        >
          {{ data.label }}
        </view>
      </view>

      <view class="mb-3" v-show="filterList && filterList.length">筛选</view>
      <view class="flex flex-wrap">
        <view
          v-for="(data, index) in filterList"
          :key="index"
          @click="handleSx(data.selectType)"
          class="filter-div px-2 mr-1 mb-3"
          :class="stagingFilter.selectType === data.selectType ? 'filter-div-active' : ''"
        >
          {{ data.label }}
        </view>
      </view>
      <view class="flex algin-center justify-between mx-2 pb-10 pt-100">
        <up-button shape="circle" @click="refresh" round> 重置 </up-button>
        <up-button class="ml-2" shape="circle" round type="primary" @click="sureClick">
          确定
        </up-button>
      </view>
    </view>
  </up-popup>
</template>

<script setup lang="ts">
import type { StagingFilter } from '../../types';
interface IProps {
  flitershow: boolean;
  orderList: { label: string; value: string; orderType: number }[];
  filterList?: { label: string; selectType: number }[];
}
defineProps<IProps>();
const stagingFilter = reactive<StagingFilter>({
  keyword: '',
  filterIndex: 0,
  selectType: 0,
  orderType: 0,
});
const emit = defineEmits(['close:fliterClose', 'click:sureClick', 'click:refresh']);
const fliterClose = () => {
  emit('close:fliterClose');
};
const chooseFilter = (val: any, index: number) => {
  stagingFilter.filterIndex = index;
  stagingFilter.orderType = val.orderType;
};
const handleSx = (selectType: number) => {
  console.log(selectType, 'index');
  console.log(stagingFilter.selectType, 'stagingFilter.selectType');
  if (stagingFilter.selectType === selectType) {
    stagingFilter.selectType = 0;
  } else {
    stagingFilter.selectType = selectType;
  }
};
const sureClick = () => {
  emit('click:sureClick', stagingFilter);
};
const refresh = () => {
  stagingFilter.keyword = '';
  stagingFilter.filterIndex = 0;
  stagingFilter.selectType = 0;
  emit('click:refresh', stagingFilter);
};
</script>

<style lang="scss" scoped>
.filter-div {
  border-radius: 16px;
  height: 32px;
  line-height: 32px;
  border: 1px solid #dcdee0;
}

.filter-div-active {
  background: #2271f5;
  color: white;
  border: 1px solid #2271f5;
}
</style>
