<script setup lang="ts">
import { useAppStore } from '@/store/app';

interface IProps {
  data?: any;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
});

const appStore = useAppStore();
const headImgUrl = computed(() => `${appStore.domainUrl}${props.data.headImgUrl}`);
</script>

<template>
  <view class="bg-white p-10">
    <view class="flex items-center justify-between">
      <view class="flex-1 min-width-0 flex items-center">
        <up-image round fit="cover" :src="headImgUrl" width="20px" height="20px" />
        <view class="text-14 ml-2">{{ data.sendUserName }}</view>
        <view class="flex-1 slh">
          <!-- 暂时使用简单显示，如需下拉菜单可以使用自定义组件 -->
          <view class="color-gray-4 ml-2 slh">
            {{ data.sendTypeList[0]?.text || '' }}
          </view>
        </view>
      </view>
      <view class="color-gray-7 w-240 text-right">{{ data.callBackTime }}</view>
    </view>
    <view class="mt-3">{{ data.content }}</view>
  </view>
</template>
