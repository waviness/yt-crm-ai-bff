<script setup lang="ts">
interface IProps {
  data: any;
}

defineProps<IProps>();

const appStore = useAppStore();
</script>

<template>
  <view class="bg-white rounded-10rpx flex justify-between items-center py-4">
    <view class="ml-5 flex">
      <image
        v-if="data.headImgUrl"
        :src="appStore.domainUrl + data.headImgUrl"
        class="w-40px h-40px rounded-full"
        mode="aspectFill"
      />
      <view class="font-bold flex flex-col justify-between ml-2">
        <view class="text-16px">{{ data.shareToUserName }}</view>
        <view class="color-gray-5">/{{ data.shareToUserId }}</view>
      </view>
    </view>
    <view class="mr-4">
      <view class="flex justify-end">
        <text>是否更新</text>
        <text class="font-bold ml-4">{{
          data.isUpdate === 1 ? '是' : data.isUpdate === 0 ? '否' : ''
        }}</text>
      </view>
      <view class="flex justify-end mt-4">
        <text>过期时间</text>
        <text class="font-bold ml-4">{{ data.validDate }}</text>
      </view>
    </view>
  </view>
</template>
