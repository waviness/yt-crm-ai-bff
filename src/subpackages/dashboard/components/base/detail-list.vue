<template>
  <view class="white-bg detail-card mt-2 mx-2 pa-2" @click="clickDetail">
    <view
      :class="isClick ? 'color-main' : ''"
      class="flex items-center justify-between text-16 pb-2 card-title"
    >
      <view class="font-medium flex-1 flex flex-col" :class="name.length > 5 ? 'line-clamp-2' : ''">
        <text>{{ name }}</text>
        <text class="color-gray-5 text-12">{{ data.mainDeptName }}</text>
      </view>
      <view v-if="showDrxs">
        <text class="font-medium color-gray-5">当日销售</text>
        <text class="fontWeight color-main">
          {{ formattedTodaySales }}
        </text>
      </view>
    </view>
    <!-- 数据展示 -->
    <view class="flex justify-between items-baseline">
      <view
        class="flex items-center flex-col text-center"
        v-for="(item, index) in dataItems"
        :key="index"
      >
        <view class="text-12 color-gray-4 py-2">{{ item.label }}</view>
        <view
          class="text-12 font-medium"
          :class="!item.noColorFlag ? getColorClass(item.value) : ''"
        >
          {{ item.value }}
        </view>
      </view>
    </view>

    <!-- 预算进度 -->
    <view v-if="per && per > -1 && perShow" class="position-relative pt-2">
      <up-line-progress
        :inactiveColor="'rgba(100,101,102,0.4)'"
        :height="20"
        :activeColor="'#4970F3'"
        :percentage="per"
        :showText="false"
      ></up-line-progress>
      <view class="color-white progress-text text-14 px-3"> 预算进度达成率 {{ formattedPer }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
const {
  formatRaw, // 格式化为千分位
  formatTenThousand, // 格式化为万元，且加千分位
  formatPercentage,
} = useFormatter();
import { getColorClass } from '@/utils/number';
interface IProps {
  data: Record<string, any>;
  name: string;
  per?: number;
  showDrxs: boolean;
  isClick: boolean;
  perShow: boolean;
  salesTabValue: number; // 1 销售数据 2销售数量
}
const props = defineProps<IProps>();
const formattedPer = computed(() => {
  return `${formatPercentage(props.per, { showPlusSign: false, showPercentage: false })}%`;
});
const formattedTodaySales = computed(() => {
  return `${props.salesTabValue === 1 ? formatTenThousand(props.data.todaySales) + '万元' : formatRaw(props.data.byxs, { digits: 0 })}`;
});
const dataItems = computed(() => {
  return [
    {
      label: '本月销售',
      value:
        props.salesTabValue === 1
          ? formatTenThousand(props.data.byxs, { digits: 0 })
          : formatRaw(props.data.byxs, { digits: 0 }),
      noColorFlag: true,
    },
    { label: '月同比', value: formatPercentage(props.data.ytb) },
    {
      label: '去年整月',
      value:
        props.salesTabValue === 1
          ? formatTenThousand(props.data.qnzy, { digits: 0 })
          : formatRaw(props.data.qnzy, { digits: 0 }),
    },
    {
      label: '本年累计',
      value:
        props.salesTabValue === 1
          ? formatTenThousand(props.data.bnlj, { digits: 0 })
          : formatRaw(props.data.bnlj, { digits: 0 }),
      noColorFlag: true,
    },
    { label: '年同比', value: formatPercentage(props.data.ntb) },
    {
      label: '去年累计整月',
      value:
        props.salesTabValue === 1
          ? formatTenThousand(props.data.qnljy, { digits: 0 })
          : formatRaw(props.data.qnljy, { digits: 0 }),
      noColorFlag: true,
    },
  ];
});
const emit = defineEmits(['click']);
const clickDetail = () => {
  emit('click', props.data);
};
</script>

<style lang="scss" scoped>
.detail-card {
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  .card-title {
    border-bottom: 1px solid #ebedf0;
  }
}

.progress-text {
  position: absolute;
  top: 8px;
}
</style>
