<script setup lang="ts">
/**
 * 应收管理页面
 * 支持预收预警、逾期预警、逾期原因填报三种类型的应收管理
 */

import ReceivableItem from './components/receivable-item.vue';
import ReasonPopup from './components/reason-popup.vue';
import type { ReceivableTabType } from './types';

// 响应式数据
const active = ref<ReceivableTabType>(0);
const keywords = ref('');
const flag = ref(0); // 0-显示全部, 1-显示与我相关（默认全部）
const ingCount = ref(0);
const taskNum = ref(0);
const reasonShow = ref(false);
const reasonDetail = ref<any>({});
const curType = ref(1); // 1-提交原因, 2-查看
const curItem = ref<any>({});

const placeholder = computed(() => '请输入客户单位名称|ID');

const currentCount = computed(() => {
  return active.value === 0 ? ingCount.value : taskNum.value;
});

const countClass = computed(() => {
  return active.value === 1 ? 'color-warning' : 'color-danger';
});

// 使用简单分页 composable
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } = useSimplePagination(10);

// 获取列表数据
const fetchList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const params = {
    pageNum,
    pageSize,
    custom: keywords.value,
    flag: flag.value,
  };

  let response;
  if (active.value === 0) {
    response = await ReceivableService.queryAdvanceList(params);
  } else if (active.value === 1) {
    response = await ReceivableService.queryOverdueWarnList(params);
  } else {
    response = await ReceivableService.queryOverdueDataList(params);
  }

  return {
    list: response?.list || [],
    total: response?.total || 0,
  };
};

// 获取统计数据
const fetchCount = async () => {
  if (active.value === 0) {
    // 预收预警：使用 queryAdvanceCount
    const response = await ReceivableService.queryAdvanceCount({
      custom: keywords.value,
      flag: flag.value,
    });
    ingCount.value = response || 0;
  } else {
    // 逾期预警和逾期原因填报：从列表接口获取 total
    taskNum.value = totalNum.value || 0;
  }
};

// 刷新数据（用于搜索、切换标签等场景）
const handleRefresh = async () => {
  await resetAndFetchData(fetchList);
  await fetchCount();
};

// 标签页切换
const handleTabChange = (index: ReceivableTabType) => {
  active.value = index;
  keywords.value = '';
  flag.value = 0; // 重置为"显示全部"
  handleRefresh();
};

// 搜索
const handleSearch = () => {
  handleRefresh();
};

// 切换显示状态
const changeStatus = () => {
  flag.value = flag.value === 0 ? 1 : 0;
  handleRefresh();
};

const tabList = ref([{ name: '预收预警' }, { name: '逾期预警' }, { name: '逾期原因填报' }]);

// 跳转到详情页
const toDetail = (item: any) => {
  const idMap = [item.cadId, item.cowId, item.codId];
  const id = idMap[active.value];

  router.push(RouteMap.receivableDetail, {
    id,
    active: active.value,
    type: item.type || 0,
  });
};

// 提交原因
const toSubmit = async (type: number, item: any) => {
  console.log('toSubmit', type, item);
  curType.value = type;
  curItem.value = item;

  if (type === 1) {
    // 提交原因
    reasonDetail.value = {
      lastReasonType: item.lastReasonType,
      repayThisMonth: item.overdueAmount,
      overdueAmount: item.overdueAmount,
    };
    reasonShow.value = true;
  } else {
    // 查看原因
    const res = await ReceivableService.queryOverdueRemark({ codId: item.codId });
    reasonDetail.value = res;
    reasonShow.value = true;
  }
};

// 提交原因
const submitReason = async (params: any) => {
  params.codId = curItem.value.codId;
  params.corId = curItem.value.corId;

  await ReceivableService.addOverdueRemark(params);

  showSuccess('提交成功');
  reasonShow.value = false;
  resetAndFetchData(fetchList);
};

// 关闭原因弹窗
const closeReasonPopup = () => {
  reasonShow.value = false;
};

// 初始化
onMounted(() => {
  handleRefresh();
});

// 滚动到底部加载更多
onReachBottom(() => {
  loadMore(fetchList);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <app-search v-model="keywords" clearable :placeholder="placeholder" @search="handleSearch" />
      <app-tabs
        :current="active"
        :list="tabList"
        @change="({ index }: { index: number }) => handleTabChange(index)"
      />
    </up-sticky>

    <view class="px-10 py-2 flex items-center">
      当前进行中
      <view :class="['mx-1', countClass]">
        {{ currentCount }}
      </view>
      条
    </view>

    <view class="px-10">
      <receivable-item
        class="block mb-2"
        v-for="(item, idx) in list"
        :key="idx"
        :data="item"
        :active="active"
        @click="toDetail(item)"
        @onBtnClick="toSubmit"
      />
      <app-empty v-if="!paginationLoading && list.length === 0" description="暂无数据" />

      <up-loadmore
        v-if="paginationLoading || list.length < totalNum"
        :status="paginationLoading ? 'loading' : 'loadmore'"
      />

      <app-data-desc
        v-if="active === 2"
        present-text="数据更新于本月第一个工作日"
        next-text="待财务勾对后，以第六个工作日展示的数据为准"
      />
      <app-data-desc
        v-else
        present-text="以上数据统计截止至昨日23:59"
        next-text="下次更新时间为今日23:59"
      />
    </view>

    <app-fix-btn
      :text="flag === 0 ? '显示与我相关' : '显示全部'"
      :icon="`${flag === 0 ? 'wode' : 'suoyou'}`"
      @click="changeStatus"
    />

    <reason-popup
      :show="reasonShow"
      :type="curType"
      :detail="reasonDetail"
      @close="closeReasonPopup"
      @submit="submitReason"
    />
  </view>
</template>

<style lang="scss" scoped>
.leader {
  padding: 20px;

  &-title {
    font-size: 14px;
  }

  &-select {
    margin-top: 15px;
  }
}
</style>
