<template>
  <view class="relative mb-2 bg-white" @click="detailClick">
    <view class="border-radius pa-2">
      <!-- 顶部信息 -->
      <view class="flex justify-between items-center mb-2">
        <view class="flex items-center flex-shrink-0">
          <up-tag text="标签" plain plainFill borderColor="transparent"> {{ item.taskId }}</up-tag>
          <!-- <view class="tag-primary-plain"></view> -->
          <up-tag
            class="ml-1"
            v-if="item.coreHospital === 1 && role === 2"
            text="标签"
            plain
            plainFill
            borderColor="transparent"
          >
            核心医院</up-tag
          >
          <up-tag
            class="ml-1"
            v-if="role === 2 && (item.conType === 0 || item.conType === 7 || item.conType === 8)"
            :text="
              item.conType === 0
                ? '缺货'
                : item.conType === 7
                  ? '库存状态'
                  : item.conType === 8
                    ? '近效期'
                    : ''
            "
            plain
            plainFill
            borderColor="transparent"
          >
          </up-tag>

          <up-tag
            class="ml-1"
            v-if="item.feedbackTime && role === 1 && (item.conType === 7 || item.conType === 8)"
            text="采购已反馈"
            plain
            plainFill
            borderColor="transparent"
          ></up-tag>
        </view>
        <view class="text-gray min-w-0 text-right">{{ item.createTime }}</view>
      </view>

      <!-- 基本信息 -->
      <view class="mb-2 flex justify-between align-center">
        <text class="text-gray min-w-[80px]">核算单元</text>
        <text class="margin-left-2">{{ item.entryId }}/{{ item.entryName }}</text>
      </view>
      <view class="mb-2 flex justify-between align-center">
        <text class="text-gray min-w-[80px]">客户</text>
        <text class="margin-left-2">{{ item.customerId }}/{{ item.customerName }}</text>
      </view>
      <view class="mb-2 flex justify-between align-center">
        <text class="text-gray min-w-[80px]">品种</text>
        <text class="margin-left-2">
          {{ item.goodsId }}/{{ item.goodsName }}
          <text v-if="conType === 3 && item.goodsCurrencyName && role === 1">
            /{{ item.goodsCurrencyName }}
          </text>
        </text>
      </view>
      <view class="mb-2 flex justify-between align-center">
        <text class="text-gray min-w-[80px]">规格</text>
        <text class="font-bold">{{ item.goodsType }}</text>
      </view>

      <!-- 库存信息 -->
      <view class="flex row-between items-center mb-2">
        <view class="flex-1">
          <text class="text-gray">当前可销总库存</text>
          <text class="color-main font-bold pl-4">{{ item.totalAvailableStockQuantity }}</text>
        </view>
        <view class="min-w-[120px] flex justify-between">
          <text class="text-gray">合同数量</text>
          <text class="font-bold pl-4">{{ item.contractQuantity }}</text>
        </view>
      </view>

      <!-- 订单来源 -->
      <template v-if="(conType === 0 || conType === 4) && (tabType === 3 || tabType === 2)">
        <view class="flex row-between items-center mb-2">
          <view class="flex-1">
            <text class="text-gray">已开数量</text>
            <text class="font-bold pl-4">{{ item.confirmedQuantity }}</text>
          </view>
          <view class="min-w-[120px] flex justify-between">
            <text class="text-gray">订单来源</text>
            <text class="font-bold">{{ getOrderSource }}</text>
          </view>
        </view>
      </template>
      <view v-else class="mb-2 flex justify-between">
        <text class="text-gray">订单来源</text>
        <text class="font-bold pl-4">{{ getOrderSource }}</text>
      </view>

      <!-- 特殊信息 -->
      <view v-if="conType === 1 && tabType === 2" class="mb-2 flex justify-between">
        <text class="text-gray">到货时间</text>
        <text class="margin-left-2">{{ item.arriveTime }}</text>
      </view>
      <view v-if="conType === 4 && tabType === 2" class="mb-2 flex justify-between">
        <text class="text-gray">到票时间</text>
        <text class="margin-left-2">{{ item.arriveTime }}</text>
      </view>
    </view>

    <!-- 按钮区域 -->
    <view v-if="+role === 1" class="px-2 py-2 bg-light-gray-2">
      <view class="flex justify-end">
        <u-button
          size="small"
          shape="circle"
          customStyle="width: 100px;margin:0px 5px;"
          v-if="conType !== 0"
          :type="item.goodsReminder ? 'info' : 'primary'"
          @click.stop="subscribeClick(1)"
        >
          {{ item.goodsReminder ? '已订阅到货提醒' : '订阅到货提醒' }}
        </u-button>
        <u-button
          size="small"
          class="ml-2"
          shape="circle"
          customStyle="width: 100px;margin:0px 5px;"
          v-if="conType !== 4"
          :type="item.ticketReminder ? 'info' : 'primary'"
          @click.stop="subscribeClick(2)"
        >
          {{ item.ticketReminder ? '已订阅到票提醒' : '订阅到票提醒' }}
        </u-button>
      </view>
    </view>

    <!-- 复选框 -->
    <view
      v-if="selectLabelFlag"
      class="changeClass absolute top-0 left-0 w-full h-full bg-[rgba(50,50,51,0.1)]"
      @click.stop="changeCheckClick"
    >
      <view
        class="checkboxWarp"
        :class="item.checked ? 'bg-main' : ''"
        hover-class="none"
        :hover-stop-propagation="false"
      >
        <up-icon v-show="item.checked" name="checkbox-mark" color="white" size="28"></up-icon>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { ListItem } from '../../types/index';
const props = defineProps<{
  item: ListItem;
  index: number;
  conType: number;
  tabType: number;
  role: number;
  selectLabelFlag: boolean;
}>();

const emit = defineEmits<{
  (e: 'detailClick'): void;
  (e: 'subscribeClick', submitFlag: 1 | 2): void;
  (e: 'changeCheckClick'): void;
}>();

const detailClick = () => {
  emit('detailClick');
};

const changeCheckClick = () => {
  emit('changeCheckClick');
};

const subscribeClick = (submitFlag: 1 | 2) => {
  emit('subscribeClick', submitFlag);
};

const getOrderSource = computed(() => {
  const { signAddress, isAutoOrder } = props.item;
  if (isAutoOrder && isAutoOrder === 1) return '自动补货';
  if (!signAddress) return '其他';

  const sourceMap: Record<string, string> = {
    huazhao: '华招平台',
    manbing: '慢病平台',
    微信: '微信订单',
  };
  return sourceMap[signAddress] || '其他';
});
</script>
<style lang="scss">
.checkboxWarp {
  width: 28px;
  height: 28px;
  border: 2px solid white;
  border-radius: 50%;
  position: absolute;
  right: 10px;
  top: 50%;
  margin-top: -14px;
}
</style>
