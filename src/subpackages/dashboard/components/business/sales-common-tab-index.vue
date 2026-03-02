<template>
  <view>
    <app-tabs :list="tabList" @change="handleTabClick"></app-tabs>
    <view class="tab-content" v-if="refreshData">
      <!-- 业务员列表 -->
      <salesmanList v-if="shouldShowSalesmanList" :isClick="isClick" :entryObj="entryObj" />
      <!-- 下降客户 -->
      <loseCustomerTable v-if="shouldLoseCustomerTable" :typeVal="tabType" :entryObj="entryObj" />
      <!-- 客户列表 -->
      <customerList
        v-if="shouldShowCustomerList"
        :key="getTabKey('customer')"
        :customerTabName="getCustomerName"
        :entryObj="entryObj"
        :typeVal="tabType"
        :isClick="isClick"
        :isFooterShow="showFooter"
      />
      <up-alert
        type="primary"
        :show-icon="true"
        icon="error-circle"
        v-if="+entryObj.deptLevel! === 6 && getGoodeName === '新增品种'"
        description="本年销售额大于零且去年同期销售额等于零的品种。"
      ></up-alert>
      <up-alert
        type="primary"
        :show-icon="true"
        icon="error-circle"
        v-if="+entryObj.deptLevel! === 6 && getGoodeName === '流失品种'"
        description="30天销售额小于近30-60天销售额的品种。"
      ></up-alert>
      <!-- 品种列表 -->
      <goodsList
        v-if="shouldShowGoodsList"
        :key="getTabKey('goods')"
        :typeVal="tabType"
        :entryObj="entryObj"
        :isClick="isClick"
        :isFooterShow="showFooter"
        :goodsTabName="getGoodeName"
      />

      <!-- 流失品种 -->
      <loseGoodsTable v-if="shouldLoseGoodsTable" :typeVal="tabType" :entryObj="entryObj" />
    </view>
  </view>
</template>

<script setup lang="ts">
import salesmanList from '../common/salesman-list.vue';
import customerList from '../common/customer-list.vue';
import loseGoodsTable from '../common/lose-goods-table.vue';
import loseCustomerTable from '../common/lose-customer-table.vue';
import goodsList from '../common/goods-list.vue';
import type { EntryObj } from '../../types';
/**
 * tabType:
 * customerPersonRelate: 客户某个业务员下的权限
 * personRelate 业务员 下的权限 只需要用userId
 * customDepartmentRelate：客户某个部门下的权限
 * departmentRelate:部门下的权限
 * personGoodsRelate: 人员品种下的权限
 * personCustomerRelate：人员客户下的权限
 */
interface IProps {
  refreshData: boolean;
  entryObj: EntryObj;
  tabType?:
    | 'departmentRelate'
    | 'personRelate'
    | 'customDepartmentRelate'
    | 'customerPersonRelate'
    | 'goodsDepartmentRelate'
    | 'personGoodsRelate'
    | 'personCustomerRelate';
  showFooter?: boolean;
  isClick?: boolean;
}
const props = withDefaults(defineProps<IProps>(), {
  tabType: 'departmentRelate',
  showFooter: false,
  isClick: true,
});
const emit = defineEmits(['tabChange']);
// 标签页配置
const tabConfig = {
  departmentRelate: [
    { index: 0, name: '全客户' },
    { index: 3, name: '下降客户' },
    { index: 1, name: '全品种' },
    { index: 4, name: '流失品种' },
    { index: 2, name: '业务员' },
  ],
  personRelate: [
    { index: 0, name: '客户' },
    { index: 3, name: '下降客户' },
    { index: 1, name: '品种' },
    { index: 4, name: '流失品种' },
  ],
  customDepartmentRelate: [
    { index: 2, name: '业务员' },
    { index: 1, name: '全品种' },
    { index: 5, name: '新增品种' },
    { index: 4, name: '流失品种' },
  ],
  customerPersonRelate: [
    { index: 0, name: '客户' },
    { index: 3, name: '下降客户' },
    { index: 1, name: '品种' },
    { index: 4, name: '流失品种' },
  ],
  goodsDepartmentRelate: [
    { index: 0, name: '全客户' },
    { index: 6, name: '新增客户' },
    { index: 3, name: '下降客户' },
  ],
  personGoodsRelate: [
    { index: 0, name: '全客户' },
    { index: 6, name: '新增客户' },
    { index: 3, name: '下降客户' },
  ],
  personCustomerRelate: [
    { index: 1, name: '全品种' },
    { index: 5, name: '新增品种' },
    { index: 4, name: '流失品种' },
  ],
};
const activeInner = ref(tabConfig[props.tabType][0].index); // 默认选中第一个tab
const getGoodeName = computed(() => {
  return tabConfig[props.tabType].find(item => item.index === activeInner.value)?.name || '';
});
const getCustomerName = computed(() => {
  return tabConfig[props.tabType].find(item => item.index === activeInner.value)?.name || '';
});
// 计算属性
const tabList = computed(() => tabConfig[props.tabType]);
console.log('tabList', tabList);
const shouldShowSalesmanList = computed(() => {
  return activeInner.value === 2;
  // return (
  //   (props.entryObj.deptId && activeInner.value === 2 && props.tabType === 'departmentRelate') ||
  //   (props.entryObj.customerId &&
  //     activeInner.value === 2 &&
  //     props.tabType === 'customDepartmentRelate')
  // );
});
const shouldShowCustomerList = computed(() => {
  return activeInner.value === 0 || activeInner.value === 6;
});
const shouldShowGoodsList = computed(() => activeInner.value === 1 || activeInner.value === 5);
const shouldLoseGoodsTable = computed(() => activeInner.value === 4);
const shouldLoseCustomerTable = computed(() => activeInner.value === 3);

// 方法
const handleTabClick = ({ index }: { index: number }) => {
  const currentTab = tabList.value[index];
  activeInner.value = -1;
  nextTick(() => {
    console.log(currentTab);
    if (currentTab) {
      activeInner.value = currentTab.index;
      emit('tabChange', activeInner.value);
    }
  });
};

const getTabKey = (type: string) => {
  return `${type}-${activeInner.value}-${props.tabType}`;
};
</script>

<style lang="scss" scoped></style>
