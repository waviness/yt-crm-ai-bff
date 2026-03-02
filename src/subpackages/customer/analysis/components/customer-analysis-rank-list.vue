<template>
  <view class="relative">
    <swiper class="rank-swiper pa-2" :circular="true" :current="curIndex" @change="onSwiperChange">
      <swiper-item v-for="(type, index) in typeList" :key="index">
        <view class="rank-card bg-white rd-md pa-4">
          <view class="text-16 flex items-baseline mb-2">
            <text>本月销售规模</text>
            <text class="font-bold color-main ml-2">TOP10</text>
          </view>
          <view class="text-16 font-bold mb-3">{{ type.DIC_SELECT_NAME }}</view>

          <view
            v-for="(item, idx) in list[type.DIC_SELECT_ID] || []"
            :key="idx"
            class="rank-item flex items-center"
            @click="select(item)"
          >
            <!-- 前三名显示奖杯图标 -->
            <view v-if="idx < 3" class="rank-icon">
              <uni-icons
                :type="idx === 0 ? 'medal' : idx === 1 ? 'medal-filled' : 'medal'"
                :color="idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : '#CD7F32'"
                size="32"
              ></uni-icons>
            </view>
            <view v-else class="rank-number text-16 font-bold color-gray-6">
              {{ idx + 1 }}
            </view>

            <text class="flex-1 text-14 ml-4 text-right line-clamp-1 color-black">{{
              item.custName
            }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 指示器 -->
    <view class="indicators flex justify-center mt-2">
      <view
        v-for="(type, index) in typeList"
        :key="index"
        class="indicator"
        :class="{ active: curIndex === index }"
      ></view>
    </view>

    <!-- 加载状态 -->
    <app-local-loading :show="loading" bg-color="bg-white/80" />
  </view>
</template>

<script lang="ts" setup>
import type { OrgType, RankCustomer } from '../types';

interface Props {
  loading?: boolean;
  typeList: OrgType[];
  list: { [key: string]: RankCustomer[] };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits(['select']);

const curIndex = ref(0);

const onSwiperChange = (e: any) => {
  curIndex.value = e.detail.current;
};

const select = (item: RankCustomer) => {
  emit('select', item);
};
</script>

<style lang="scss" scoped>
.rank-swiper {
  height: 900rpx;
}

.rank-card {
  height: 800rpx;
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}

.rank-item {
  height: 60rpx;
  margin-bottom: 8rpx;

  &:nth-child(odd) {
    background: #fbfbfc;
  }
}

.rank-icon {
  width: 32rpx;
  display: flex;
  justify-content: center;
}

.rank-number {
  width: 32rpx;
  text-align: center;
}

.indicators {
  .indicator {
    width: 16rpx;
    height: 16rpx;
    border-radius: 50%;
    background: #94969b;
    margin: 0 8rpx;
    transition: all 0.3s;

    &.active {
      background: #323233;
      box-shadow: 0 0 16rpx 0 #646566;
    }
  }
}
</style>
