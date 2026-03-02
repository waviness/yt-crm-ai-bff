<template>
  <view>
    <app-watermark />
    <up-sticky style="top: 0">
      <view class="bg-white pa-2 mb-2 box-shadow relative z-100">
        <view class="flex justify-between items-start">
          <view class="font-bold text-14 flex-1">
            <view>{{ detailInfo.szymCustomerId }}/</view>
            <view>{{ detailInfo.customerName?.split('/')[0] || '' }}</view>
          </view>
          <view class="flex flex-col items-end ml-4">
            <text class="tag-primary-plain mb-2">
              {{ detailInfo.sourceType === 0 ? '拓展客户' : '业务系统内客户' }}
            </text>
            <text :class="detailInfo.customerTypeName ? 'tag-primary-plain' : 'tag-text-plain'">
              {{ detailInfo.customerTypeName || '未维护' }}
            </text>
          </view>
        </view>
        <view class="color-gray-5 pb-2">{{ detailInfo.registerAddress }}</view>
        <view class="flex justify-between pb-2">
          <view v-if="detailInfo.relCustomerId" class="text-12 color-normal">
            已关联至{{ detailInfo.relCustomerId }}/{{ detailInfo.relCustomerName || '--' }}
          </view>
          <view v-else class="color-gray-7">暂未关联业务系统内客户</view>
          <view>
            <text>维护人：</text>
            <text>{{ detailInfo.operateName }}</text>
          </view>
        </view>
        <view class="flex justify-between pa-2">
          <view>客户人员数</view>
          <view class="font-bold color-main text-16">{{ detailInfo.customerStaffNum }}</view>
        </view>
      </view>
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2 pb-120">
        <view v-for="(person, index) in personList" :key="person.userId" class="person-card mb-2">
          <view class="bg-white pa-3">
            <view class="flex justify-between items-center mb-2">
              <view class="flex flex-col">
                <text class="text-16 font-bold mb-1"
                  >{{ person.userId }}/{{ person.userName }}</text
                >
                <text>{{ person.phoneNum }}</text>
              </view>
              <text
                class="text-14"
                :class="person.customerUserGradeName ? 'tag-primary-plain' : 'tag-text-plain'"
              >
                {{ person.customerUserGradeName || '未维护' }}
              </text>
            </view>
            <app-infor-item class="mb-2" title="微信号" :content="person.wxCode" />
            <app-infor-item class="mb-2" title="部门信息" :content="person.officeName || '--'" />
            <app-infor-item class="mb-2" title="职位信息" :content="person.positionName || '--'" />
            <app-infor-item
              class="mb-2"
              title="维护人"
              :content="`${person.createId}/${person.createName}`"
            />
          </view>
          <view class="py-2 flex justify-end">
            <up-button
              :customStyle="{ width: '120rpx', height: '60rpx' }"
              class="mr-2"
              text="编辑"
              type="primary"
              shape="circle"
              size="small"
              @click="handleEditPerson(person)"
            />
            <up-button
              :customStyle="{ width: '120rpx', height: '60rpx' }"
              text="删除"
              type="error"
              shape="circle"
              size="small"
              plain
              @click="handleDeletePerson(person)"
            />
          </view>
        </view>
      </view>
    </app-pull-refresh>

    <!-- 底部操作按钮 -->
    <app-bottom-actions class="mt-15 mx-4 block" :count="2">
      <app-action-btn class="flex-1" text="客户编辑" type="plain" @click="handleEditCustomer" />
      <app-action-btn class="flex-1" text="人员新增" type="primary" @click="handleAddPerson" />
    </app-bottom-actions>

    <!-- 人员新增/编辑弹窗 -->
    <up-popup v-model:show="addPopVisible" mode="bottom" :round="10">
      <view class="popup-content" style="height: 90vh">
        <person-op
          v-if="addPopVisible"
          :userDetail="editPersonObj"
          :officeOptions="officeOptions"
          :positionOptions="positionOptions"
          :structureLevelOptions="structureLevelOptions"
          :customerUserGradeOptions="customerUserGradeOptions"
          @cancel="addPopVisible = false"
          @submit="handleSubmitPerson"
        />
      </view>
    </up-popup>

    <!-- 客户编辑弹窗 -->
    <up-popup v-model:show="editCustomerVisible" mode="bottom" :round="10">
      <view class="popup-content" style="height: 70vh">
        <customer-edit
          v-if="editCustomerVisible"
          :detailInfo="detailInfo"
          :customTypeObj="customTypeObj"
          :businessNatureObj="businessNatureObj"
          :scienceLineObj="scienceLineObj"
          :customTypeList="customTypeList"
          :scienceLineTypeList="scienceLineTypeList"
          :businessNatureTypeList="businessNatureTypeList"
          @cancel="editCustomerVisible = false"
          @submit="handleSaveCustomer"
        />
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
import personOp from './components/person-op.vue';
import customerEdit from './components/customer-edit.vue';
import { useCustomerPersonDetail } from './composables/use-customer-person-detail';

const appStore = useAppStore();

const {
  detailInfo,
  personList,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  editCustomerVisible,
  addPopVisible,
  editPersonObj,
  officeOptions,
  positionOptions,
  structureLevelOptions,
  customerUserGradeOptions,
  customTypeList,
  scienceLineTypeList,
  businessNatureTypeList,
  customTypeObj,
  businessNatureObj,
  scienceLineObj,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  initDictData,
  handleAddPerson,
  handleEditPerson,
  handleDeletePerson,
  handleSubmitPerson,
  handleEditCustomer,
  handleSaveCustomer,
} = useCustomerPersonDetail();

onLoad(() => {
  detailInfo.value = appStore.detailObj;
});

onMounted(async () => {
  await initDictData();
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped>
.person-card {
  background: #f9f9f9;
  box-shadow: 0 1px 6px 1px rgba(209, 207, 207, 0.5);
  border-radius: 10rpx;
}

.popup-content {
  padding: 20rpx;
  overflow-y: auto;
}
</style>
