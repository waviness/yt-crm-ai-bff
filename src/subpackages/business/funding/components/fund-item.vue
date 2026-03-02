<script setup lang="ts">
import type { FundingFormData } from '../types';

interface IProps {
  data: FundingFormData;
}

const appStore = useAppStore();

const emit = defineEmits<{
  click: [];
}>();

const onClick = () => {
  emit('click');
};

const props = defineProps<IProps>();

// 计算合计金额
const totalAmount = computed(() => {
  return calculateTotal(props.data.dhAmount, props.data.chAmount);
});
</script>

<template>
  <view class="bg-white" @click="onClick">
    <view v-if="!data.isFill">
      <app-cell :title="data.deptName" titleClass="color-black-2" isLink @click="onClick">
        <up-tag
          :bgColor="appStore.theme.color.danger"
          :borderColor="appStore.theme.color.danger"
          size="mini"
          height="
          40rpx"
          class="text-12"
          >未填报</up-tag
        >
      </app-cell>
    </view>
    <view v-else class="p-10">
      <view class="flex">
        <app-tag class="tag-blue color-main-2" :name="data.deptName" type="primary" />
      </view>
      <app-infor-item title="电汇(万元)" :content="data.dhAmount" class="block mt-2" />
      <app-infor-item title="承兑(万元)" :content="data.chAmount" class="block mt-2" />
      <app-infor-item title="合计(万元)" :content="totalAmount" class="block mt-2" />
    </view>
  </view>
</template>
