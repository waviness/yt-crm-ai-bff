<script setup lang="ts">
import CustomerFollowAdd from './add.vue';
import IntellVisitDetail from './intell-visit-detail.vue';

const appStore = useAppStore();
const activeTab = ref(0); // 默认显示客情新增

// 从 appStore 中获取数据
const queryParams = computed(() => {
  const detailObj = appStore.detailObj || {};
  return {
    curpId: String(detailObj.curpId || ''),
    objId: String(detailObj.objId || detailObj.customerId || ''),
    objName: String(detailObj.objName || detailObj.customerName || ''),
    objTypeValue: String(detailObj.objTypeValue || '2'),
    createTime: String(detailObj.createTime || ''),
    customerId: String(detailObj.customerId || detailObj.objId || ''),
    customerName: String(detailObj.customerName || detailObj.objName || ''),
    entryId: String(detailObj.entryId || ''),
    entryName: String(detailObj.entryName || ''),
    userId: String(detailObj.userId || ''),
    contactName: String(detailObj.contactName || ''),
  };
});

onMounted(() => {
  console.log('📋 拜访容器页面加载, 参数:', queryParams.value);
});
</script>

<template>
  <view class="visit-container">
    <app-watermark />

    <!-- 标签页 -->
    <app-tabs
      :current="activeTab"
      :list="[{ name: '客情新增' }, { name: '智能拜访详情' }]"
      :lineWidth="40"
      @change="(e: any) => (activeTab = e.index)"
    />

    <!-- 客情新增 -->
    <view v-show="activeTab === 0">
      <CustomerFollowAdd
        :curpId="queryParams.curpId"
        :objId="queryParams.objId"
        :objName="queryParams.objName"
        :objTypeValue="queryParams.objTypeValue"
      />
    </view>

    <!-- 智能拜访详情 -->
    <view v-show="activeTab === 1">
      <IntellVisitDetail
        :createTime="queryParams.createTime"
        :curpId="queryParams.curpId"
        :customerId="queryParams.customerId"
        :customerName="queryParams.customerName"
        :entryId="queryParams.entryId"
        :entryName="queryParams.entryName"
        :userId="queryParams.userId"
        :contactName="queryParams.contactName"
        :showButtons="false"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.visit-container {
  background-color: #f5f6f9;
  min-height: 100vh;
}
</style>
