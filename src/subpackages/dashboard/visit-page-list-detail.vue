<template>
  <view>
    <app-watermark> </app-watermark>
    <visitCard :visit-obj="visitObj" />
    <!-- 详细信息列表 -->
    <view class="mt-2">
      <view class="bg-white p-4 rounded">
        <!-- 定位信息 -->
        <view class="flex justify-between items-center py-2">
          <text class="font-bold text-gray-700 w-280">定位信息：</text>
          <text :class="visitObj.address ? 'text-gray-600' : 'text-gray-400'">{{
            visitObj.address || '暂无定位信息'
          }}</text>
        </view>

        <!-- 批注信息 -->
        <view class="mt-2">
          <view class="flex justify-between items-center py-2">
            <text class="font-bold text-gray-700 w-280">批注信息：</text>
            <text v-if="!visitObj.crmVisitCommentDtoList.length" class="text-gray-400"
              >暂无批注信息</text
            >
          </view>

          <view
            v-for="crmVisitComment in visitObj.crmVisitCommentDtoList"
            :key="'crmLabelRemark' + crmVisitComment.cvcId"
            class="px-2 py-3"
          >
            <view class="text-blue-500 py-2">
              {{ crmVisitComment.creName }}
              <text class="pl-2 text-gray-500" v-if="crmVisitComment.credate">
                {{ crmVisitComment.credate.substring(0, crmVisitComment.credate.length - 3) }}
              </text>
            </view>
            <view class="text-gray-600 pb-2">
              {{ crmVisitComment.commentRemark }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import visitCard from './components/common/visit-card.vue';
const dashboardStore = useDashboardStore();
const visitObj: any = dashboardStore.visitDetail;
</script>

<style lang="scss" scoped></style>
