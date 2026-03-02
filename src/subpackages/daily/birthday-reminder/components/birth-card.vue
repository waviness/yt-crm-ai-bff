<script setup lang="ts">
import { computed } from 'vue';

defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  data: any;
  isAll: boolean;
  selected: boolean;
}

const props = defineProps<IProps>();

// 生成项目的唯一标识，用于 checkbox 的 name 属性
const itemId = computed(() => `${props.data.userId}_${props.data.birthFlag}`);
</script>

<template>
  <view class="birth-card common-list-content text-12 mb-2 relative" :class="{ active: isAll }">
    <view class="flex items-center mb-1">
      <text class="text-14 font-bold">{{ data.userName }}</text>
      <text class="ml-2 mt-1px">
        {{ data.birthFlag === 1 ? data.birthday : data.politicsBirthday }}
      </text>
      <app-icon v-if="data.birthFlag === 2" name="is-zz" size="small" class="zz-icon mr-2" />
      <text :class="data.birthFlag === 1 ? 'ml-auto' : ''" class="text-16 font-bold color-main">
        {{ data.count }}天
      </text>
    </view>

    <view class="flex items-center justify-between mb-1">
      <text class="color-gray-4 font-bold"> {{ data.providerName }}/{{ data.position }} </text>
      <text class="color-gray-3"> 距下个{{ data.birthFlag === 1 ? '' : '政治' }}生日 </text>
    </view>

    <view v-if="data.purchaseId" class="flex items-center justify-between mb-1">
      <text class="color-gray-4">分管采购员</text>
      <text>{{ data.purchaseName }}</text>
    </view>

    <view v-if="data.shareUserId" class="flex items-center justify-between">
      <text class="color-gray-4">分享人</text>
      <text class="color-main">{{ data.shareUserName }}</text>
    </view>

    <!-- 批量选择复选框 -->
    <view
      v-if="isAll && (data.typeFlag === 1 || !data.shareUserId)"
      class="birth-card-checkbox"
      @click.stop
    >
      <up-checkbox :name="itemId" shape="circle" iconSize="24" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.birth-card {
  position: relative;
  background: url('@/static/images/birth-card.png') 100% 0 / auto 100% no-repeat;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgb(0 0 0 / 5%);
  padding: 12px 15px;
  margin-bottom: 12px;

  &.active {
    background-color: rgba(#d1cfcf, 0.5);
  }

  .zz-icon {
    width: 9px !important;
    height: 9px !important;
    margin-left: auto;
  }

  .birth-card-checkbox {
    position: absolute;
    bottom: 10px;
    right: 10px;

    :deep(.u-checkbox__icon) {
      border: 2px solid #fff;
      height: 24px;
      width: 24px;
    }
  }
}
</style>
