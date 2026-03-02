<template>
  <view class="account-list">
    <view v-if="!list || list.length === 0" class="empty-state">
      <text class="color-gray-4">暂无数据</text>
    </view>

    <view v-else class="list-container">
      <view
        v-for="(item, index) in list"
        :key="index"
        class="list-item"
        :class="{ 'border-bottom': index !== list.length - 1 }"
      >
        <view class="item-date">
          <view :class="['date-dot', type === 'danger' ? 'bg-danger' : 'bg-primary']" />
          <text class="date-text color-gray-5">{{ getDate(item) }}</text>
        </view>

        <view class="item-amount">
          <text :class="['amount-text', type === 'danger' ? 'color-danger' : 'color-main']">
            {{ getAmount(item) }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
interface Props {
  /** 列表数据 */
  list: any[];
  /** 日期字段名 */
  dateKey: string;
  /** 金额字段名 */
  valKey: string;
  /** 类型 danger/primary */
  type?: 'danger' | 'primary';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
});

const getDate = (item: any) => {
  return item[props.dateKey] || '-';
};

const getAmount = (item: any) => {
  return item[props.valKey] || '0';
};
</script>

<style lang="scss" scoped>
.account-list {
  .empty-state {
    padding: 60rpx 0;
    text-align: center;
  }

  .list-container {
    .list-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx 0;

      &.border-bottom {
        border-bottom: 1px solid #f5f5f5;
      }

      .item-date {
        display: flex;
        align-items: center;

        .date-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;
          margin-right: 16rpx;

          &.bg-danger {
            background-color: #ea394b;
          }

          &.bg-primary {
            background-color: #2271f5;
          }
        }

        .date-text {
          font-size: 28rpx;
        }
      }

      .item-amount {
        .amount-text {
          font-size: 32rpx;
          font-weight: 500;

          &.color-danger {
            color: #ea394b;
          }

          &.color-main {
            color: #2271f5;
          }
        }
      }
    }
  }
}
</style>
