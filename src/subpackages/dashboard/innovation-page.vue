<template>
  <view class="bg-white">
    <salesHeader
      @update:dateTime="dateChange"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    />
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-4 pt-2" v-for="(data, index) in list" :key="index + 'innovationCard'">
        <innovationCard @detail-click="detailClick(data)" :data-item="data" />
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
// 使用异步组件避免 TS 的 default export 类型错误
import { defineAsyncComponent } from 'vue';
const salesHeader = defineAsyncComponent(() => import('./components/base/header.vue'));
// 修正组件路径：innovation-card 位于 components/base 下
const innovationCard = defineAsyncComponent(() => import('./components/base/innovation-card.vue'));
import { DashboardService } from '@/api/dashboard';

const { formatTenThousand, formatPercentage } = useFormatter();
const dashboardStore = useDashboardStore();

const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});

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
    const res = await DashboardService.getDeptNewSaleGoodsStat({
      selectedDate: dashboardStore.dateTime,
      deptId: entryObj.value.deptId,
      timeDimFlag: 1,
    });

    if (res.code === '200' && res.data) {
      // 第一个元素是总数据,第二个元素是各年份数据数组
      const yearDataList = res.data[1];

      // 找到最高的销售额
      const maxSaleAmount = Math.max(...yearDataList.map((item: any) => item.salesAmount));

      // 处理数据
      const list = yearDataList
        .map((item: any) => ({
          year: item.yearNum,
          sales: formatTenThousand(item.salesAmount),
          // 保留展示字符串，同时提供一个数值型的同比(0..100)，便于组件做数值判断/计算
          growthRate: formatPercentage(item.periodComparePercent),
          growthRateNum:
            item.periodComparePercent != null && !isNaN(item.periodComparePercent)
              ? Number(item.periodComparePercent) * 100
              : null,
          progress: ((item.salesAmount / maxSaleAmount) * 100).toFixed(2),
        }))
        .sort((a: any, b: any) => b.year - a.year); // 按年份倒序排序

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
} = pagination;

const detailClick = (item: any) => {
  router.push(
    `/subpackages/dashboard/innovation-page-detail?year=${item.year}&deptId=${entryObj.value.deptId}&deptName=${entryObj.value.deptName}`
  );
};

// 页面加载
onLoad(options => {
  console.log('页面参数:', options);
  if (options) {
    entryObj.value.deptLevel = options.deptLevel;
    entryObj.value.deptId = options.deptId;
    entryObj.value.deptName = options.deptName;
    entryObj.value.titleName = '创新品种';
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

<style lang="sass" scoped></style>
