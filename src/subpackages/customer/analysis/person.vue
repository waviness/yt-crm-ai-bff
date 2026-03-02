<template>
  <view>
    <app-watermark></app-watermark>
    <view class="pa-2">相关人员</view>

    <view class="content pb-100">
      <!-- 人员信息标题 -->
      <view class="section-title text-14 mb-2">人员信息</view>

      <!-- 人员详情表单 -->
      <up-form class="bg-white">
        <app-form-item class="text-14" label="人员姓名">
          <text class="float-right">{{ curMan.userName }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="手机号">
          <text class="float-right">{{ curMan.phoneNum }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="职务">
          <text class="float-right">{{ curMan.position }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="热力值">
          <text class="float-right" :class="warmthClass">
            {{ warmthNumOptions[curMan.warmthNum] || '--' }}
          </text>
        </app-form-item>
        <app-form-item class="text-14" label="是否关键">
          <text class="float-right">-</text>
        </app-form-item>
        <app-form-item class="text-14" label="活跃度">
          <text class="float-right">-</text>
        </app-form-item>
        <app-form-item class="text-14" label="生日">
          <text class="float-right" :class="curMan.birthday ? '' : 'color-gray-3'">
            {{ curMan.birthday || '暂未维护' }}
          </text>
        </app-form-item>
        <app-form-item class="text-14" label="是否党员">
          <text class="float-right">{{ curMan.politicalStatus === 1 ? '是' : '否' }}</text>
        </app-form-item>
        <app-form-item class="text-14" label="兴趣">
          <text class="float-right" :class="curMan.hobby ? '' : 'color-gray-3'">
            {{ curMan.hobby || '暂未维护' }}
          </text>
        </app-form-item>
        <app-form-item class="text-14" label="资料贡献">
          <text class="float-right color-main">{{ curMan.saleName }}</text>
        </app-form-item>
      </up-form>

      <!-- 近100天统计 -->
      <customer-analysis-recent :eventCount="eventCount" class="ma-2" @click="toList" />

      <!-- 返回按钮 -->
      <view class="flex justify-center mt-4">
        <up-button
          text="返回"
          shape="circle"
          :customStyle="{ width: '80%', height: '96rpx', borderRadius: '48rpx' }"
          @click="goBack"
        ></up-button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import customerAnalysisRecent from './components/customer-analysis-recent.vue';
import { useCustomerAnalysisPerson } from './composables/use-customer-analysis-person';

// 获取路由参数
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];
const params: any = currentPage.options || {};

const { item: itemStr, custId, isCabin } = params;

const { curMan, eventCount, warmthNumOptions, warmthClass, toList, goBack, init } =
  useCustomerAnalysisPerson(custId, isCabin === 'true', itemStr);

onMounted(async () => {
  await init();
});
</script>

<style lang="scss" scoped>
.content {
  :deep(.u-form-item__body__right__content__slot) {
    width: 100%;
    display: inline-block;
  }
  :deep(.u-form-item__body__left__content__label, .u-form-item__body__right__content) {
    font-size: 28rpx !important;
  }
}

.section-title {
  border-left: 10rpx solid #2271f5;
  margin-left: 20rpx;
  padding-left: 20rpx;
}
</style>
