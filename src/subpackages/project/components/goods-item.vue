<script setup lang="ts">
import GoodsItemPiece from './goods-item-piece.vue';

interface IProps {
  data?: any;
  gray?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  gray: false,
});

const emit = defineEmits<{
  click: [item: any];
}>();

const showDetail = ref(false);

const formatStatus = (statusDO: any) => {
  if (!statusDO || (!statusDO.updateTimeTemPurchase && !statusDO.updateTimeNewGood)) return '无';
  if (
    statusDO.updateTimeTemPurchase &&
    (!statusDO.updateTimeNewGood || statusDO.updateTimeTemPurchase > statusDO.updateTimeNewGood)
  ) {
    if (statusDO.temPurchRecord)
      return `(临采)采购记录-${statusDO.temPurchRecord === 1 ? '进行中' : '已完成'}(${
        statusDO.updateTimeTemPurchase
      })`;
    if (statusDO.temPurchApprove)
      return `(临采)临采审批-${statusDO.temPurchApprove === 1 ? '进行中' : '已完成'}(${
        statusDO.updateTimeTemPurchase
      })`;
    if (statusDO.temPurchase)
      return `(临采)临采单-${statusDO.temPurchase === 1 ? '进行中' : '已完成'}(${statusDO.updateTimeTemPurchase})`;
    else return '无';
  } else {
    if (statusDO.newGoodRecord)
      return `(新药)采购记录-${statusDO.newGoodRecord === 1 ? '进行中' : '已完成'}(${statusDO.updateTimeNewGood})`;
    else if (statusDO.haveAttendMeeting)
      return `(新药)是否过会-${
        statusDO.haveAttendMeeting === 1
          ? '进行中'
          : statusDO.haveAttendMeeting === 2
            ? '过会'
            : '未过会'
      }(${statusDO.updateTimeNewGood})`;
    else if (statusDO.attendMeeting)
      return `(新药)是否上会-${
        statusDO.attendMeeting === 1 ? '进行中' : statusDO.attendMeeting === 2 ? '上会' : '未上会'
      }(${statusDO.updateTimeNewGood})`;
    else if (statusDO.newGood)
      return `(新药)新药单-${statusDO.newGood === 1 ? '进行中' : '已完成'}(${statusDO.updateTimeNewGood})`;
    else return '无';
  }
};
const onClick = (item: any) => {
  emit('click', item);
};
</script>

<template>
  <view>
    <view
      class="mx-10 py-10 bg-white flex items-center border-0 border-b border-solid border-gray-200"
      @click="showDetail = !showDetail"
    >
      <view class="flex-1">
        <app-tag
          class="w-fit block"
          :name="`${data.productName || ''}${data.name2 ? '（' + data.name2 + '）' : ''}${data.goodsType || ''}`"
          bold="medium"
        />
        <view class="flex items-center mt-2">
          <view class="color-gray-4">目标</view>
          <view class="flex-1 text-right">{{ data.goalNum }}</view>
          <view class="flex-1 text-right ml-7 color-gray-4">完成</view>
          <view class="flex-1 text-right">{{ data.accessNum }}</view>
        </view>
      </view>
      <up-icon class="ml-7" :name="showDetail ? 'arrow-up' : 'arrow-down'" />
    </view>
    <view v-if="showDetail">
      <view
        v-for="(item, idx) in data.accessProductDocVOS"
        :key="idx"
        :class="['p-10', idx % 2 === 0 ? 'bg-gray-10' : 'bg-white']"
        @click="onClick(item)"
      >
        <view class="flex">
          <goods-item-piece class="flex-3" title="目标医院" :value="item.customerName" />
          <goods-item-piece
            class="flex-2"
            title="是否准入"
            :value="item.ytAccesss === 1 ? '已准入' : '未准入'"
            :color="
              item.ytAccesss === 1 ? 'color-success' : item.ytAccesss === 0 ? 'color-danger' : ''
            "
          />
        </view>
        <view class="flex mt-2">
          <goods-item-piece class="flex-3" title="相关部门" :value="item.deptName" />
          <goods-item-piece
            class="flex-2"
            title="业务员"
            :value="`${item.salerId}/${item.salerName}`"
          />
        </view>
        <goods-item-piece
          class="mt-2 block"
          title="当前状态"
          :value="formatStatus(item.crmAccesssProjectStatusDO)"
          color="color-main-3"
        />
      </view>
    </view>
  </view>
</template>
