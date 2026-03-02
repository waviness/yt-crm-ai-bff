<template>
  <up-sticky offset-top="0" :custom-nav-height="0">
    <view
      class="px-4 py-2 bg-white flex items-center justify-between"
      :class="entryObj.titleName && entryObj.titleName.length > 8 ? 'header-2' : 'header'"
    >
      <view class="flex flex-col">
        <view class="flex items-center" @click="deptSelectClick">
          <text
            :class="
              !deptNameShowFlag
                ? entryObj.titleName && entryObj.titleName.length > 8
                  ? 'text-16'
                  : 'text-30'
                : entryObj.customerId || entryObj.goodsId
                  ? 'text-16'
                  : 'text-24'
            "
            class="font-bold"
            >{{ entryObj.titleName }}
          </text>
          <up-icon v-if="selectDeptFlag" name="arrow-down" size="14"></up-icon>
        </view>
        <text v-show="deptNameShowFlag" class="text-12 text-gray-5 mt-1">{{
          entryObj.deptName
        }}</text>
      </view>

      <view
        class="flex items-center text-16"
        style="min-width: fit-content"
        @click="changeDateClick"
      >
        <text class="font-bold color-gray-4">{{ dashboardStore.dateTime }}</text>
        <up-icon v-if="!onDateChangeFlag" name="arrow-down" size="14"></up-icon>
      </view>
    </view>
    <view class="bg-white pa-2 flex" v-show="searchShowFlag">
      <up-search
        :bgColor="'#f7f8fa'"
        :v-model="searchValue"
        placeholder="搜索"
        :showAction="false"
        input-align="center"
        @search="onSearch"
      />
    </view>
    <slot></slot>
    <app-calendar ref="calendarRef" :endDate="maxDate" :date="maxDate" @confirm="calendarConfirm" />
  </up-sticky>
</template>

<script setup lang="ts">
import type { EntryObj } from '../../types';
interface IProps {
  entryObj: EntryObj;
  deptNameShowFlag?: boolean;
  searchShowFlag?: boolean;
  onDateChangeFlag?: boolean;
}
const props = defineProps<IProps>();
const emit = defineEmits(['update:dateTime', 'update:search', 'deptSelectClick']);
const searchValue = ref('');
const onSearch = (value: string) => {
  emit('update:search', value);
};
const dashboardStore = useDashboardStore();
const selectDeptFlag = computed(() => dashboardStore.selectDeptFlag);
// 日期相关
const calendarRef = ref();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
const changeDateClick = () => {
  if (props.onDateChangeFlag) return;
  calendarRef.value.open();
};
const calendarConfirm = (date: string) => {
  emit('update:dateTime', date);
};
const deptSelectClick = () => {
  if (dashboardStore.selectDeptFlag) emit('deptSelectClick');
};
</script>

<style scoped>
.header {
  height: 122rpx;
}

.header-2 {
  min-height: 102rpx;
}
</style>
