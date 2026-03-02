<template>
  <view>
    <app-page v-if="!isInnerFlag">
      <view class="purchase-detail-page">
        <!-- 头部 -->
        <view class="header">
          <view class="header-left">
            <text class="person-name">{{ personName }}</text>
          </view>
          <view class="header-right" @click="handleCalendarClick">
            <text class="time">{{ selectedDate }}</text>
            <app-icon name="arrow-down" size="14" />
          </view>
        </view>

        <!-- 主要数据 -->
        <view class="total-content">
          <view class="main-content">
            <!-- 营收实绩 -->
            <view class="daily-sales">
              <view class="sales-info">
                <text class="label">{{ activeTab === '1' ? '年' : '月' }}营收实绩(万元)</text>
                <text class="sub-label">同比:{{ purchaseDataObj.yearRevenueOnPercent }}</text>
                <text class="value">{{ purchaseDataObj.yearRevenue }}</text>
              </view>
            </view>

            <!-- 在销品规数 -->
            <view class="goods-info">
              <view class="info-row">
                <text class="info-label">在销品规数</text>
              </view>
              <view v-if="purchaseDataObj.targetCompletePercent !== '--'" class="info-row">
                <text class="info-value">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
              </view>
              <view v-if="purchaseDataObj.targetCompletePercent !== '--'" class="info-row">
                <text class="info-label">预算完成进度</text>
              </view>
              <view v-if="purchaseDataObj.targetCompletePercent !== '--'" class="info-row">
                <text class="info-value">{{ purchaseDataObj.targetCompletePercent }}</text>
              </view>
              <view v-if="purchaseDataObj.targetCompletePercent === '--'" class="info-row center">
                <text class="info-value large">{{ purchaseDataObj.yearInSaleGoodsNum }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 货品满足 -->
        <view class="card goods-satisfaction">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">货品满足</text>
          </view>
          <view v-if="gsloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月货品满足率</text>
              <text class="value">{{ goodsSatisfactionData.monthGoodsFillRate }}</text>
              <text
                :class="['growth', getColor(goodsSatisfactionData.monthGoodsFillRateNetIncrease)]"
              >
                {{ getFH(goodsSatisfactionData.monthGoodsFillRateNetIncrease)
                }}{{ goodsSatisfactionData.monthGoodsFillRateNetIncrease }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年货品满足率</text>
              <text class="value">{{ goodsSatisfactionData.yearGoodsFillRate }}</text>
              <text
                :class="['growth', getColor(goodsSatisfactionData.yearGoodsFillRateNetIncrease)]"
              >
                {{ getFH(goodsSatisfactionData.yearGoodsFillRateNetIncrease)
                }}{{ goodsSatisfactionData.yearGoodsFillRateNetIncrease }}
              </text>
            </view>
            <view
              v-if="
                goodsSatisfactionData.targetFillRateDiff !== '--' &&
                goodsSatisfactionData.targetFillRateDiff != '+0.00%'
              "
              class="content-item"
            >
              <text class="label">较指标差距</text>
              <text :class="['value', getColor(goodsSatisfactionData.targetFillRateDiff)]">
                {{ getFH(goodsSatisfactionData.targetFillRateDiff)
                }}{{ goodsSatisfactionData.targetFillRateDiff }}
              </text>
            </view>
          </view>
        </view>

        <!-- KA供应商 -->
        <view class="card ka-purveyor">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">KA供应商(万元)</text>
            <app-icon name="arrow" size="16" />
          </view>
          <view v-if="kaloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月无税收入</text>
              <text class="value">{{ purveyorData.monthSalesAmount }}</text>
              <text :class="['growth', getColor(purveyorData.monthOnPercent)]">
                {{ getFH(purveyorData.monthOnPercent) }}{{ purveyorData.monthOnPercent }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年无税收入</text>
              <text class="value">{{ purveyorData.yearSalesAmount }}</text>
              <text :class="['growth', getColor(purveyorData.yearOnPercent)]">
                {{ getFH(purveyorData.yearOnPercent) }}{{ purveyorData.yearOnPercent }}
              </text>
            </view>
            <view class="content-item">
              <text class="label">销售占比</text>
              <text class="value">{{ purveyorData.sharePercent }}</text>
              <text :class="['growth', getColor(purveyorData.sharePercentNetIncrease)]">
                {{ getFH(purveyorData.sharePercentNetIncrease)
                }}{{ purveyorData.sharePercentNetIncrease }}
              </text>
            </view>
          </view>
        </view>

        <view class="card sale-lock">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">锁控</text>
          </view>
          <view v-if="tdloading" class="loading">加载中...</view>
          <view v-else class="card-content"> </view>
        </view>

        <!-- 库存周转 -->
        <view class="card turnover">
          <view class="card-header">
            <view class="blue-icon"></view>
            <text class="card-title">库存周转</text>
          </view>
          <view v-if="tdloading" class="loading">加载中...</view>
          <view v-else class="card-content">
            <view class="content-item">
              <text class="label">本月库存周转</text>
              <text class="value">{{ turnoverData.monthTurnoverDays }}天</text>
              <text :class="['growth', getColor(turnoverData.monthTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.monthTurnoverDaysNetDiff)
                }}{{ turnoverData.monthTurnoverDaysNetDiff }}天
              </text>
            </view>
            <view class="content-item">
              <text class="label">本年库存周转</text>
              <text class="value">{{ turnoverData.yearTurnoverDays }}天</text>
              <text :class="['growth', getColor(turnoverData.yearTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.yearTurnoverDaysNetDiff)
                }}{{ turnoverData.yearTurnoverDaysNetDiff }}天
              </text>
            </view>
            <view
              v-if="
                turnoverData.targetDiffPercent !== '--' &&
                goodsSatisfactionData.targetFillRateDiff != '+0.00%'
              "
              class="content-item"
            >
              <text class="label">较指标差距</text>
              <text :class="['value', getColor(turnoverData.yearTurnoverDaysNetDiff)]">
                {{ getFH(turnoverData.targetDiffPercent) }}{{ turnoverData.targetDiffPercent }}
              </text>
            </view>
          </view>
        </view>

        <!-- 分管品类列表 -->
        <view v-if="showItemBox" class="item-box">
          <view v-for="item in sonObjectStatList" :key="item.generalObjectName" class="item">
            <view class="item-title">
              <view class="blue-icon"></view>
              <text class="name">{{ item.generalObjectName }}</text>
              <text class="count">
                分管品规数 {{ item.underLyingGoodsNum || 0 }}(本年有销售{{
                  item.yearInSaleGoodsNum
                }})
              </text>
            </view>
            <view class="item-line"></view>
            <view class="item-body">
              <view class="body-row">
                <view class="body-col">
                  <text class="label">本{{ activeTab === '1' ? '年' : '月' }}营收实绩</text>
                  <text class="value">{{ item.yearRevenue }}</text>
                </view>
                <view class="body-col">
                  <text class="label">本{{ activeTab === '1' ? '年' : '月' }}同比</text>
                  <text :class="['value', getColor(item.yearRevenueOnPercent)]">
                    {{ item.yearRevenueOnPercent || '--' }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部Tab -->
        <view class="end-tab">
          <view class="tab-container">
            <view :class="['tab-btn', { active: activeTab === '1' }]" @click="handleTabChange">
              年
            </view>
            <view :class="['tab-btn', { active: activeTab === '2' }]" @click="handleTabChange">
              月
            </view>
          </view>
        </view>

        <!-- 日历弹窗 -->
        <u-calendar
          v-model="calendarShow"
          :default-date="selectedDate"
          :min-date="new Date(2021, 0, 1)"
          :max-date="new Date()"
          @confirm="handleDateSelect"
        />
      </view>
    </app-page>
    <view v-else class="pb-100">
      <!-- 内部页面内容 -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePurchaseDetail } from './composables/use-purchase-detail';

const isInnerFlag = ref(false);

const {
  personName,
  objectId,
  activeTab,
  calendarShow,
  purchaseDataObj,
  sonObjectStatList,
  goodsSatisfactionData,
  purveyorData,
  turnoverData,
  selectedDate,
  gsloading,
  kaloading,
  tdloading,
  showItemBox,
  getColor,
  getFH,
  loadAllData,
  handleTabChange,
  handleDateSelect,
  handleCalendarClick,
} = usePurchaseDetail();

// 页面加载
onLoad((options: any) => {
  if (options) {
    isInnerFlag.value = !!Number(options.isInner);
    personName.value = options.name || options.userName || '';
    objectId.value = options.id || options.userId || '';
  }

  // 加载数据
  loadAllData();
});
</script>

<style lang="scss" scoped>
.purchase-detail-page {
  min-height: 100vh;
  background: #fff;
}

.header {
  height: 144rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background: #fff;
  box-shadow: 0 8rpx 48rpx rgb(100 101 102 / 8%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;

  &-left,
  &-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
    flex: 1;
    justify-content: center;
  }

  .person-name {
    font-size: 64rpx;
    font-weight: bold;
  }

  .time {
    font-size: 32rpx;
  }
}

.total-content {
  padding: 176rpx 16rpx 0;
}

.main-content {
  display: flex;
  gap: 20rpx;
}

.daily-sales {
  flex: 5;
  height: 240rpx;
  border-radius: 60rpx;
  padding: 24rpx 32rpx;
  color: #fff;
  background: linear-gradient(135deg, #3561f2 0%, #5b7ff5 100%);

  .sales-info {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .label {
    font-size: 28rpx;
  }

  .sub-label {
    font-size: 28rpx;
    margin: 16rpx 0 8rpx;
  }

  .value {
    font-size: 56rpx;
    font-weight: bold;
    padding: 8rpx 0;
  }
}

.goods-info {
  flex: 3;
  height: 240rpx;
  border-radius: 60rpx;
  border: 2rpx solid #e7e7e7;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-around;

  .info-row {
    display: flex;
    align-items: center;
    padding: 0 24rpx;

    &.center {
      justify-content: center;
      margin-top: 56rpx;
    }
  }

  .info-label {
    font-size: 28rpx;
    color: #969799;
    padding-left: 8rpx;
  }

  .info-value {
    font-size: 28rpx;
    padding-left: 8rpx;

    &.large {
      font-size: 56rpx;
      font-weight: bold;
    }
  }
}

.blue-icon {
  width: 12rpx;
  height: 32rpx;
  background-color: #2271f5;
  border-radius: 6rpx;
}

.card {
  margin: 16rpx;
  border: 2rpx solid #e7e7e7;
  border-radius: 60rpx;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 30rpx 40rpx;
  border-bottom: 2rpx solid #ebedf0;

  .card-title {
    flex: 1;
    font-size: 32rpx;
    font-weight: 500;
  }
}

.card-content {
  display: flex;
  padding: 30rpx;
  gap: 20rpx;
}

.content-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  position: relative;
  padding-right: 10rpx;

  &:last-child {
    padding-right: 0;
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 4rpx;
    bottom: 4rpx;
    width: 2rpx;
    background: #ebedf0;
  }

  .label {
    font-size: 24rpx;
    color: #666;
  }

  .value {
    font-size: 48rpx;
    font-weight: bold;
  }

  .growth {
    font-size: 28rpx;
  }
}

.color-normal {
  color: #27ae60;
}

.color-never {
  color: #e74c3c;
}

.loading {
  padding: 64rpx;
  text-align: center;
  color: #969799;
}

.item-box {
  padding: 10rpx 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item {
  border: 2rpx solid #e7e7e7;
  border-radius: 40rpx;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 36rpx;
  font-size: 32rpx;
  font-weight: 500;

  .name {
    flex: 1;
    color: #2271f5;
  }

  .count {
    font-size: 28rpx;
  }
}

.item-line {
  height: 2rpx;
  background: #ebedf0;
  margin: 4rpx 0;
}

.item-body {
  padding: 20rpx 24rpx 30rpx;
}

.body-row {
  display: flex;
  gap: 20rpx;
}

.body-col {
  flex: 1;
  margin-left: 24rpx;

  .label {
    font-size: 24rpx;
    color: #969799;
  }

  .value {
    font-size: 24rpx;
    margin-top: 16rpx;
  }
}

.end-tab {
  position: fixed;
  bottom: 72rpx;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
}

.tab-container {
  display: flex;
  width: 352rpx;
  height: 64rpx;
  background: #fff;
  box-shadow: 0 0 24rpx 10rpx rgb(209 207 207 / 50%);
  border-radius: 64rpx;
  overflow: hidden;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  transition: all 0.3s;

  &.active {
    background: #3561f2;
    color: #fff;
    border-radius: 30rpx;
    padding: 30rpx 80rpx;
  }
}
</style>
