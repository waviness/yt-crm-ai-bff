<!-- 销售端业务部门列表卡片 -->
<template>
  <view class="pa-2">
    <view
      class="card white-block mb-3"
      v-for="(departData, index) in departNameTabs"
      :key="'departData' + index"
    >
      <view class="card-header px-4 py-2" @click="departClick(departData)">
        <view class="flex items-center align-center">
          <view class="card-block"></view>
          <view class="flex justify-between items-center flex-1">
            <view class="text-16 flex flex-1 justify-between items-center">
              <text>{{ departData.showName }}</text>
              <text class="text-14 flex items-center color-gray-5 pr-2">
                当日销售
                <text class="color-main pl-1">{{ departData.cdmoney }} </text>
                万元
              </text>
            </view>
            <up-icon
              v-if="
                ((+deptLevel === 0 || +deptLevel === 1) && departData.hasClick) ||
                (+deptLevel != 0 && +deptLevel != 1)
              "
              name="arrow-right"
            ></up-icon>
          </view>
        </view>
        <view class="card-text pl-1 py-1" v-if="departData.isShowFlag">
          <text>重点客户</text>
          <text :class="getColorClass(departData.imptCustomerYearOnPercent)">{{
            departData.imptCustomerYearOnPercent
          }}</text
          ><text>，重点品种</text>
          <text :class="getColorClass(departData.imptGoodsYearOnPercent)"
            >{{ departData.imptGoodsYearOnPercent }}%</text
          ><text>，逾期账款</text
          ><text class="color-danger pl-1">{{ departData.overdueAmount }}</text>
        </view>
      </view>

      <view class="flex justify-space-between pt-2 pb-2 pl-6">
        <view class="flex flex-1 flex-col">
          <text class="color-gray-4 text-14">本月累计</text>
          <text class="color-gray-5 text-16 pt-2">{{ departData.cmmoney || '--' }}</text>
        </view>
        <view class="flex flex-1 flex-col">
          <text class="color-gray-4 text-14">月同比</text>
          <text class="text-16 pt-2" :class="getColorClass(departData.cmonPercent)">{{
            departData.cmonPercent
          }}</text>
        </view>
        <view class="flex flex-1 flex-col">
          <text class="color-gray-4 text-14">本年累计</text>
          <text class="color-gray-5 text-16 pt-2">{{ departData.cymoney || '--' }}</text>
        </view>
        <view class="flex flex-1 flex-col">
          <text class="color-gray-4 text-14 pl-2">年同比</text>
          <text class="text-16 pt-2 pl-2" :class="getColorClass(departData.cyonPercent)">{{
            departData.cyonPercent
          }}</text>
        </view>
      </view>
      <view v-if="departData.targetCompletePercent" class="position-relative px-4 mb-3">
        <up-line-progress
          :inactiveColor="'rgba(100,101,102,0.4)'"
          :height="20"
          :activeColor="'#4970F3'"
          :percentage="
            departData.targetCompletePercent === '--' ? 0 : departData.targetCompletePercent
          "
          :showText="false"
        ></up-line-progress>

        <view class="color-white progress-text text-14 px-3">
          预算进度达成率{{ departData.targetCompletePercent }}%
        </view>
      </view>
    </view>
    <view
      v-show="+deptLevel === 1 && entryObj.deptId && entryObj.deptId === '449'"
      class="card mt-2"
      v-for="(titleDepart, index) in titleDepartArr"
      :key="'titleDepart' + index"
    >
      <view
        class="px-4 flex justify-between"
        :class="titleDepart.isExp ? 'border-bottom' : ''"
        @click.stop="expClick(index)"
      >
        <view class="py-4 pr-4">
          <text class="text-14 pr-4">{{ titleDepart.title }}</text>
        </view>
        <view class="py-4">
          <up-icon :name="titleDepart.isExp ? 'arrow-up' : 'arrow-down'" size="18px" />
        </view>
      </view>
      <view v-if="titleDepart.isExp">
        <view
          class="mx-4 pt-10"
          :class="dataIndex < titleDepart.departList.length - 1 ? 'border-bottom' : ''"
          v-for="(departData, dataIndex) in titleDepart.departList"
          :key="'data' + dataIndex"
        >
          <view class="header flex items-center justify-between">
            <view class="flex items-center">
              <view class="card-block"></view>
              <view class="tag-primary-plain text0-16 ml-2">
                {{ departData.showName }}
              </view>
            </view>
            <text class="text-14 color-gray-5 pl-2"
              >当日销售<text class="color-main pl-1">{{ departData.cdmoney }}</text
              >万元</text
            >
          </view>
          <view class="flex justify-between pt-2 pb-2">
            <view class="flex-1 flex flex-col">
              <text class="color-gray-4 text-14">本月累计</text>
              <text class="color-gray-5 text-16 pt-2">{{ departData.cmmoney }}</text>
            </view>
            <view class="flex-1 flex flex-col">
              <text class="color-gray-4 text-14">月同比</text>
              <text class="text-16 pt-2" :class="getColorClass(departData.cmonPercent)">{{
                departData.cmonPercent
              }}</text>
            </view>
            <view class="flex-1 flex flex-col">
              <text class="color-gray-4 text-14">本年累计</text>
              <text class="color-gray-5 text-16 pt-2">{{ departData.cymoney }}</text>
            </view>
            <view class="flex-1 flex flex-col">
              <text class="color-gray-4 text-14 pl-2">年同比</text>
              <text class="text-16 pt-2 pl-2" :class="getColorClass(departData.cyonPercent)">{{
                departData.cyonPercent
              }}</text>
            </view>
          </view>
          <view class="position-relative mb-2">
            <up-line-progress
              class="mt-1"
              :percentage="
                departData.targetCompletePercent === '--' ? 0 : departData.targetCompletePercent
              "
              :inactive-color="'rgba(100, 101, 102, 0.6)'"
              active-color="#4970F3"
              :show-text="false"
              height="20"
            />
            <text class="text-white progress-text text-14 pl-3">
              预算进度达成率{{ departData.targetCompletePercent }}%
            </text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { QuickOverviewDepartmentTabItem, EntryObj } from '../../types';
import { getColorClass } from '@/utils/number';
// 定义组件的props
interface IProps {
  entryObj: EntryObj;
  departNameTabs: Array<QuickOverviewDepartmentTabItem>;
  deptLevel: number | string; // 部门级别
  ytyyDepartList: Array<QuickOverviewDepartmentTabItem>; // 展开数据列表
  qtDepartList: Array<QuickOverviewDepartmentTabItem>; // 展开数据列表
}
const props = defineProps<IProps>();
// 使用 ref 来管理展开状态，确保响应式
const expandState = ref([
  { title: '英特药业', isExp: false },
  { title: '其他经营单元', isExp: false },
]);
// 使用 computed 来创建 titleDepartArr，确保数据更新
const titleDepartArr = computed(() => [
  {
    title: '英特药业',
    isExp: expandState.value[0].isExp,
    departList: props.ytyyDepartList,
  },
  {
    title: '其他经营单元',
    isExp: expandState.value[1].isExp,
    departList: props.qtDepartList,
  },
]);
// 定义事件
const emit = defineEmits(['departClick']);

// 方法：处理部门点击事件
const departClick = (departData: any) => {
  console.log('点击部门：', departData);
  if (departData.hasClick) emit('departClick', departData);
};
// 方法：处理展开/收起点击事件
const expClick = (index: number) => {
  // 直接修改 ref 的值，确保响应式更新
  expandState.value[index].isExp = !expandState.value[index].isExp;
};
</script>

<style lang="scss" scoped>
.card {
  background-color: #fff;
  border-radius: 25px;
  border: 1px solid #e7e7e7;

  &-header {
    border-bottom: 1px solid #f5f5f5;
  }

  &-block {
    width: 6px;
    height: 16px;
    border-radius: 4px;
    background-color: #4970f3;
    margin-right: 8px;
  }
}

.progress-text {
  position: absolute;
  top: 0;
  left: 10;
}

.border-bottom {
  border-bottom: 1px solid #ebedf0;
}
</style>
