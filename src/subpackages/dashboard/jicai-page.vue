<template>
  <view class="bg-white">
    <salesHeader
      @update:dateTime="dateChange"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    />

    <!-- 固定按钮组 -->
    <view class="button-group">
      <view class="button-row">
        <button
          v-for="(button, index) in buttons"
          :key="index"
          :class="['filter-button', { active: activeButton === index }]"
          @click="selectButton(index)"
        >
          {{ button }}
        </button>
      </view>
    </view>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-4 pt-2" v-for="(card, index) in list" :key="index + 'jcCard'">
        <view class="card-wrapper">
          <!-- 卡片头部 -->
          <view class="px-4 d-flex justify-space-between" @click="jumpToJcDetail(card)">
            <view class="py-10 pr-4 header-left" @click.stop="toggleCard(index)">
              <text class="text-14 pr-4">{{ card.batchName }}</text>
              <up-icon :name="card.expanded ? 'arrow-up' : 'arrow-down'" size="14" color="#333" />
            </view>
            <view class="py-10 header-right" @click="jumpToJcDetail(card)">
              <u-icon name="arrow-right" size="16" color="#dcdcdc"></u-icon>
            </view>
          </view>

          <view class="summary-all">
            <view class="summary-inline">
              <text class="summary-title">集采看板</text>
              <text class="total-sales">{{ card.totalSales }}万元</text>
              <view
                :class="[
                  'growth-rate summary-growth',
                  card.growthRateRaw > 0 ? 'positive' : 'negative',
                ]"
              >
                {{ card.growthRateValue }}
              </view>
            </view>
          </view>

          <!-- 卡片内容 -->
          <view v-if="card.expanded" class="card-content">
            <view class="summary">
              <view class="progress-bar">
                <view class="progress-inner" :style="{ width: card.winningProgress + '%' }"></view>
              </view>

              <view class="summary-item">
                <text>中标品种</text>
                <text class="value">{{ card.winningSales }}万元</text>
                <text
                  :class="['growth-rate', card.winningGrowthRateRaw > 0 ? 'positive' : 'negative']"
                >
                  {{ card.winningGrowthRateValue }}
                </text>
              </view>
            </view>
            <view class="divider"></view>
            <view class="summary">
              <view class="progress-bar">
                <view
                  class="progress-inner"
                  :style="{ width: card.nonWinningProgress + '%' }"
                ></view>
              </view>
              <view class="summary-item">
                <text>备选和未中选品种</text>
                <text class="value">{{ card.nonWinningSales }}万元</text>
                <text
                  :class="[
                    'growth-rate',
                    card.nonWinningGrowthRateRaw > 0 ? 'positive' : 'negative',
                  ]"
                >
                  {{ card.nonWinningGrowthRateValue }}
                </text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <app-empty
        v-show="!(loadmoreConfig.status === 'loadmore') && !list.length"
        class="py-7"
        description="暂无数据"
      />
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import type { EntryObj } from './types';
import { defineAsyncComponent } from 'vue';
const salesHeader = defineAsyncComponent(() => import('./components/base/header.vue'));
// import { queryJiCaiList } from '@/api/chashuju';
// 使用统一的数字格式化 Composable
const { formatTenThousand, formatPercentage } = useFormatter();

const dashboardStore = useDashboardStore();

const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});

const buttons = ref(['国家集采(含续约)', '浙江省集采', '江西联盟', '全国中成药联盟']);
const activeButton = ref(0);
const type = ref('国家集采(含续约)');

const dateChange = ({ fulldate }: { fulldate: string }) => {
  dashboardStore.setDateTime(time.format(new Date(fulldate), 'yyyy-MM-dd'));
  lastDateTime.value = dashboardStore.dateTime;
  initData();
};

// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    loadmoreConfig: {
      nomoreText: '',
      status: 'loadmore',
      loadmoreText: '上拉加载更多',
      loadingText: '努力加载中...',
      iconSize: 18,
    },
    toolBarHeight: 82,
  },

  async params => {
    const res = await DashboardService.queryJiCaiList({
      date: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      flag: 1,
      type: type.value,
    });

    if ((Number(res.code) === 200 || res.success === true) && res.data) {
      const list = res.data.map((item: any, index: number) => ({
        batchName: item.batch,
        batchIndex: index + 1,
        expanded: index === 0, // 默认展开第一个
        totalSales: formatTenThousand(item.sale),
        growthRateValue: formatPercentage(item.saleTb, { digits: 1, showPlusSign: true }),
        growthRateRaw: item.saleTb, // 用于判断正负用于样式
        winningSales: formatTenThousand(item.bidSale),
        winningGrowthRateValue: formatPercentage(item.bidSaleTb, { digits: 1, showPlusSign: true }),
        winningGrowthRateRaw: item.bidSaleTb,
        winningProgress: ((item.bidSale / item.sale) * 100).toFixed(1),
        nonWinningSales: formatTenThousand(item.noBidSale),
        nonWinningGrowthRateValue: formatPercentage(item.noBidSaleTb, {
          digits: 1,
          showPlusSign: true,
        }),
        nonWinningGrowthRateRaw: item.noBidSaleTb,
        nonWinningProgress: ((item.noBidSale / item.sale) * 100).toFixed(1),
      }));

      return {
        list: list,
        hasNextPage: false,
        total: 0,
      };
    }

    return {
      list: [],
      hasNextPage: false,
      total: 0,
    };
  }
);

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  changeRowValue,
} = pagination;

// 切换按钮
const selectButton = (index: number) => {
  activeButton.value = index;
  type.value = buttons.value[index];
  console.log(`切换到按钮: ${buttons.value[index]}`);
  initData();
};

// 跳转到集采详情
const jumpToJcDetail = (card: any) => {
  router.push(
    `/subpackages/dashboard/jicai-page-detail?type=${type.value}&deptId=${entryObj.value.deptId}&batch=${card.batchIndex}&date=${dashboardStore.dateTime}&deptName=${entryObj.value.deptName}`
  );
};

// 切换卡片展开/收起
const toggleCard = (index: number) => {
  // list 是 usePagination 返回的只读引用（readonly(list)），不能直接修改。
  // 使用 pagination 提供的 changeRowValue 方法来修改底层数据。
  changeRowValue(index, 'expanded' as any, !list.value[index].expanded);
};

// 页面加载
onLoad(options => {
  console.log('页面参数:', options);
  if (options) {
    entryObj.value.deptLevel = options.deptLevel;
    entryObj.value.deptId = options.deptId;
    entryObj.value.deptName = options.deptName;
    entryObj.value.titleName = '集采看板';
    initData();
  }
});

const initData = async () => {
  lastDateTime.value = dashboardStore.dateTime;
  calcPullRefreshHeight();
  onRefresh();
};

const lastDateTime = ref('');

// 监听日期变化时刷新数据
watch(
  () => dashboardStore.dateTime,
  newDateTime => {
    if (newDateTime !== lastDateTime.value) {
      initData();
    }
  }
);
</script>

<style lang="scss" scoped>
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 16px;
  background: white;
}

.button-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.filter-button {
  padding: 6px 18px;
  font-size: 12px;
  border: 1px solid #c8c9cc;
  border-radius: 50px;
  background: white;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  line-height: 1.5;
  margin: 0;
}

.filter-button.active {
  background: #3561f2;
  color: white;
  border-color: #3561f2;
}

.card-wrapper {
  margin-bottom: 16px;
  border: 1px solid #e7e7e7;
  border-radius: 16px;
  background: white;
}

.card-content {
  padding: 0px 16px;
}

.summary {
  margin-bottom: 16px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.value {
  font-size: 14px;
  font-weight: bold;
  color: #3561f2;
}

.growth-rate {
  font-size: 14px;
  font-weight: bold;
}

.growth-rate.positive {
  color: #00a870;
}

.growth-rate.negative {
  color: #f56c6c;
}

.progress-bar {
  height: 10px;
  background-color: #ebedf0;
  border-radius: 4px;
  margin: 8px 0px;
}

.progress-inner {
  height: 100%;
  background-color: #3561f2;
  border-radius: 4px;
}

.summary-all {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin: 0px 10px 10px 10px;
  font-size: 14px;
  background: #f5f5f7;
  border-radius: 12px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-left {
  cursor: pointer;
}
.header-right {
  cursor: pointer;
}

.summary-inline {
  display: flex;
  align-items: center;
  width: 100%;
}

.summary-title {
  flex: 1;
  font-size: 14px;
  color: #666666;
}

.total-sales {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #3561f2;
}

.summary-growth {
  flex: 1;
  text-align: right;
}

.px-4 {
  padding-left: 16px;
  padding-right: 16px;
}

.pt-2 {
  padding-top: 8px;
}

.py-10 {
  padding-top: 10px;
  padding-bottom: 10px;
}

.pr-4 {
  padding-right: 16px;
}

.py-7 {
  padding-top: 28px;
  padding-bottom: 28px;
}

.d-flex {
  display: flex;
}

.justify-space-between {
  justify-content: space-between;
}

.divider {
  height: 1px;
  background: #ebedf0;
  margin: 16px 0;
}

.bg-white {
  background-color: white;
}
</style>
