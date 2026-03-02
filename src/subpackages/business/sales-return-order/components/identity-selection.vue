<template>
  <view class="pa-2">
    <view class="header px-2 mb-4"> 请选择 <text class="color-main">PM4账号</text> 进入 </view>

    <view
      v-for="(identity, index) in identityList"
      :key="index"
      class="identity-card bg-white pa-4 mb-2 rd-md flex justify-between align-center"
      @click="handleSelect(identity)"
    >
      <view class="flex flex-col">
        <text class="font-bold mb-1">{{ identity.userCode }}/{{ identity.userName }}</text>
        <text class="text-12 color-gray-6">{{ identity.entryId }}/{{ identity.entryName }}</text>
      </view>
      <up-icon name="arrow-right" color="#999" size="18" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { IdentityInfo } from '../types';

interface Props {
  identityList: IdentityInfo[];
}

interface Emits {
  (e: 'change', identity: IdentityInfo): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleSelect = (identity: IdentityInfo) => {
  emit('change', identity);
};
</script>

<style lang="scss" scoped>
.header {
  font-size: 32rpx;
  line-height: 1.5;
}

.identity-card {
  box-shadow: 0 2rpx 12rpx 2rpx rgb(209 207 207 / 30%);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}
</style>
