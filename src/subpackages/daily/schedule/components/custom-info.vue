<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  fatherDetail: any;
}

const props = withDefaults(defineProps<IProps>(), {
  fatherDetail: () => ({}),
});

const getUserVisitLoading = ref(false);
const visitList = ref<any[]>([]);

/**
 * 获取位置信息（第一部分）
 */
const getPosition1 = (address: string) => {
  if (!address) {
    return '';
  }
  const addressList = address.split('/');
  if (addressList.length === 1) {
    return address;
  }
  return addressList[0] + '/';
};

/**
 * 获取位置信息（第二部分）
 */
const getPosition2 = (address: string) => {
  if (!address) {
    return '';
  }
  const addressList = address.split('/');
  if (addressList.length === 1) {
    return '';
  }
  let text = addressList[1];
  for (let i = 2; i < addressList.length; i++) {
    text = text + '/' + addressList[i];
  }
  return text;
};

/**
 * 获取随访记录信息
 */
const _getUserVisit = async (day: string) => {
  getUserVisitLoading.value = true;
  const params = {
    startTime: day + ' 00:00:00',
    endTime: day + ' 23:59:59',
    pageNum: 1,
    pageSize: 200,
    userIdList: [],
  };

  try {
    const res = await CustomerFollowService.getUserVisit(params);
    visitList.value = res.list;
  } catch (error) {
    console.error('获取客情信息失败:', error);
  } finally {
    getUserVisitLoading.value = false;
  }
};

// 暴露方法
defineExpose({
  _getUserVisit,
});
</script>

<template>
  <view class="w-full mt-8 rounded-20rpx bg-white">
    <view class="flex items-center h-38px px-10 rounded-20rpx bg-white">
      <text class="text-14 color-black-2">客情信息</text>
      <view
        :style="
          fatherDetail.mor && fatherDetail.mor.visitNum > 0
            ? 'background: #4970f3'
            : 'background: #D8D8D8'
        "
        class="h-12px leading-12px mx-8 px-4px rounded-8px font-600 text-12 color-white"
      >
        {{ fatherDetail.mor && fatherDetail.mor.visitNum ? fatherDetail.mor.visitNum : 0 }}
      </view>
      <up-icon
        name="star"
        size="20rpx"
        :color="fatherDetail.mor && fatherDetail.mor.starNum > 0 ? '#FBD71B' : '#D8D8D8'"
      />
      <text
        v-if="fatherDetail.mor && fatherDetail.mor.starNum > 0"
        class="text-10 font-600 color-warning"
      >
        {{ fatherDetail.mor.starNum }}
      </text>
    </view>

    <view v-for="(item, index) in visitList" :key="index" class="p-10 rounded-5px shadow-view">
      <view class="flex justify-between">
        <!-- 左侧信息 -->
        <view class="flex-1">
          <view class="flex items-center mb-4 text-14 font-600 color-black-2">
            <text>{{ getPosition1(item.visitUserPosition) }}</text>
            <image src="@/static/images/kq-icon4.png" class="w-15px h-15px ml-8" mode="aspectFit" />
          </view>
          <view class="flex items-center mb-6 text-14 font-600 color-black-2">
            <text>{{ getPosition2(item.visitUserPosition) }}</text>
            <text class="ml-10 text-12 font-300 color-gray-10">
              ({{
                item.companyType === 1
                  ? '供应商'
                  : item.companyType === 2
                    ? '下游客户'
                    : item.companyType === 3
                      ? '政府单位'
                      : ''
              }})
            </text>
          </view>
          <view class="flex items-center text-14 font-500 color-black-2">
            <text>{{ item.visitUserName }}</text>
            <app-icon
              v-if="item.warmthNum === 1"
              name="ytcrm-full-green"
              size="30rpx"
              class="ml-1"
            />
            <app-icon
              v-if="item.warmthNum === 2"
              name="ytcrm-full-orange"
              size="30rpx"
              class="ml-1"
            />
            <app-icon v-if="item.warmthNum === 3" name="ytcrm-full-red" size="30rpx" class="ml-1" />
          </view>
        </view>

        <!-- 右侧信息 -->
        <view class="w-30% flex flex-col items-end">
          <text class="mb-8 text-12 color-gray-10 font-500">{{ item.visitTime }}</text>
          <view class="flex items-center mb-8 text-12 font-500 color-main">
            <up-icon v-if="item.starFlag" name="star-o" class="mr-2" size="30rpx" />
            <image src="@/static/images/kq-icon3.png" class="w-15px h-15px mx-8" mode="aspectFit" />
            <text>{{ item.whetherLegwork === 0 ? '非外勤' : '外勤' }}</text>
          </view>
          <view
            :class="
              item.whetherLegwork === 0 ? 'bg-main color-white' : 'border border-main color-main'
            "
            class="w-64px h-22px text-center leading-22px text-12 font-500 rounded-5px"
          >
            {{ item.whetherLegwork === 0 ? '个人拜访' : '回访' }}
          </view>
        </view>
      </view>

      <!-- 客情事件信息 -->
      <view
        v-show="item.crmLabelRemarkDtoList && item.crmLabelRemarkDtoList.length > 0"
        class="mt-8"
      >
        <text class="text-14 color-gray-10">客情事件信息</text>
      </view>

      <view
        v-show="
          item.crmLabelRemarkDtoList &&
          item.crmLabelRemarkDtoList.length > 0 &&
          item.crmLabelRemarkDtoList.length <= 3
        "
        class="flex items-center h-45px px-8 rounded-5px bg-light-gray mt-2"
      >
        <view
          v-for="(data, idx) in item.crmLabelRemarkDtoList"
          :key="idx"
          class="h-22px px-8 mr-8 leading-22px color-main text-12 font-500 rounded-5px bg-[rgba(38,111,232,0.1)]"
        >
          {{ data.labelName }}
        </view>
      </view>

      <view
        v-show="item.crmLabelRemarkDtoList && item.crmLabelRemarkDtoList.length > 3"
        class="flex items-center h-45px px-8 rounded-5px bg-light-gray mt-2"
      >
        <view
          v-for="idx in 3"
          :key="idx"
          class="h-22px px-8 mr-8 leading-22px color-main text-12 font-500 rounded-5px bg-[rgba(38,111,232,0.1)]"
        >
          {{ item.crmLabelRemarkDtoList[idx - 1].labelName }}
        </view>
        <view
          class="h-22px px-8 mr-8 leading-22px color-main text-12 font-500 rounded-5px bg-[rgba(38,111,232,0.1)]"
        >
          ...
        </view>
      </view>

      <!-- 批注信息 -->
      <view class="flex items-center mt-8">
        <text class="text-14 color-gray-10">批注信息</text>
        <text class="ml-8 text-12 color-white px-4 bg-purple rounded-8px">
          {{ item.crmVisitCommentDtoList ? item.crmVisitCommentDtoList.length : 0 }}
        </text>
      </view>

      <!-- 底部按钮 -->
      <view class="flex items-center h-44px pt-4 bg-light-gray mt-2">
        <up-icon name="star-o" class="ml-10 color-main" size="40rpx" />
        <image src="@/static/images/kq-icon1.png" class="w-20px h-20px ml-22" mode="aspectFit" />
        <image src="@/static/images/kq-icon2.png" class="w-16px h-16px ml-22" mode="aspectFit" />
        <view
          class="w-90px h-28px ml-auto mr-6 text-center leading-28px text-12 color-white rounded-12px bg-main"
        >
          客情事件编辑
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.shadow-view {
  box-shadow: 0 1px 6px 0.5px rgb(209 207 207 / 50%);
}
</style>
