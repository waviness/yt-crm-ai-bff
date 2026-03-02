<template>
  <view>
    <up-sticky style="background-color: white; top: 0">
      <view class="flex bg-white pa-2 justify-between items-center position-relative">
        <view class="flex-1">
          <up-dropdown>
            <up-dropdown-item
              @change="handleSearchTypeChange"
              v-model="searchType"
              :title="searchOptions[searchType].label"
              :options="searchOptions"
            ></up-dropdown-item> </up-dropdown
        ></view>
        <view class="flex-3 flex items-center">
          <up-search v-model="searchValue" @search="onRefresh" :show-action="false"></up-search>
          <text class="color-main text-14 pl-2" @click="onRefresh">搜索</text>
        </view>
      </view>
    </up-sticky>

    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <up-swipe-action v-if="+searchType !== 2">
          <up-swipe-action-item
            class="mb-2"
            v-for="(item, index) in list"
            :key="'inventory' + index"
            :closeOnClick="false"
            :options="inventoryOptions(item)"
            @click="val => handleClick(val, item)"
          >
            <inventory-query-list
              @toDetail="toDetail(item)"
              @searchLimit="searchLimit(item)"
              :item="item"
            />
          </up-swipe-action-item>
        </up-swipe-action>
        <inventory-query-yy-list
          v-else
          v-for="(item, index) in list"
          :key="'yyinventory' + index"
          :item="item"
        />
      </view>
    </app-pull-refresh>

    <up-modal :show="limitShow" closeOnClickOverlay @confirm="() => (limitShow = false)">
      <view class="text-16">
        <view v-for="(item, index) in limitList" :key="'ddlName' + index" class="lock-info">
          <text>{{ item.ddlName }}：</text
          ><text class="fontWeight color-main">{{ item.forbidsqty }}</text>
        </view></view
      >
    </up-modal>
  </view>
</template>

<script lang="ts" setup>
import inventoryQueryList from './components/inventory-query-list.vue';
import inventoryQueryYyList from './components/inventory-query-yy-list.vue';
import type { InventoryQueryItem, InventoryQueryLowerLimitItem } from './types';
const searchType = ref(0);
const searchValue = ref('');
const searchOptions = ref([
  {
    label: '货品',
    value: 0,
  },
  {
    label: '省平台ID',
    value: 1,
  },
]);
const inventoryOptions = (item: InventoryQueryItem) => {
  return reactive([
    {
      text: item.goodsReminder ? '已订阅到货提醒' : '订阅到货提醒',
      style: {
        backgroundColor: item.goodsReminder ? '#eeeeef' : '#1989fa',
      },
    },
    {
      text: item.ticketReminder ? '已订阅到票提醒' : '订阅到票提醒',
      style: {
        backgroundColor: item.ticketReminder ? '#bfbfbf' : '#07c160',
      },
    },
  ]);
};
const handleClick = ({ index }: { index: number }, item: InventoryQueryItem) => {
  subscribeArrive(item, index === 0 ? 1 : 2);
};

// 订阅到货/到票提醒
const subscribeArrive = async (info: any, type: number): Promise<void> => {
  await SubscribeReminderService.subscribeArrive({
    entryId: info.entryId,
    goodsId: info.goodsId,
    subType: type,
  });

  const message = type === 1 ? '订阅到货提醒成功' : '订阅到票提醒成功';
  if (type == 1) {
    changeRowValue(info, 'goodsReminder', true);
  } else {
    changeRowValue(info, 'ticketReminder', true);
  }
  inventoryOptions(info);
  showSuccess(message);
};
const handleSearchTypeChange = (val: number) => {
  console.log(val);
  searchType.value = val;
  searchValue.value = '';
};
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  if (!searchValue.value) {
    showError(
      `请输入要查询的${searchType.value === 0 ? '货品' : searchType.value === 1 ? '省平台ID' : '药业货品'}信息`
    );
    return {
      list: [],
      hasNextPage: false,
      total: 0,
    };
  }
  const response =
    searchType.value === 2
      ? await InventoryQueryService.yyInfoList({
          type: searchType.value,
          keyWords: searchValue.value,
          page: params.pageNum,
          pageSize: params.pageSize,
        })
      : await InventoryQueryService.infoList({
          type: searchType.value,
          keyWords: searchValue.value,
          page: params.pageNum,
          pageSize: params.pageSize,
        });
  return {
    list: response.data.list || [],
    hasNextPage: response.data.hasNextPage || false,
    total: response.data.total || 0,
  };
};
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  changeRowValue,
} = usePagination(
  {
    loadmoreConfig: {
      status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
      loadmoreText: !searchValue.value
        ? `请输入要查询的${searchType.value === 0 ? '货品' : searchType.value === 1 ? '省平台ID' : '药业货品'}信息`
        : '上拉加载更多',
      loadingText: '努力加载中...',
      nomoreText: '我们是有底线的',
      iconSize: 18,
    },
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 60,
  },
  fetchData
);

const initPermissions = () => {
  const permissions = useUserStore().permissions;
  if (permissions.includes('QueryYyStock')) {
    searchOptions.value = [
      {
        label: '货品',
        value: 0,
      },
      {
        label: '省平台ID',
        value: 1,
      },
      {
        label: '药业查询',
        value: 2,
      },
    ];
  }
};
onMounted(() => {
  initPermissions();
  calcPullRefreshHeight();
});

const toDetail = async (item: InventoryQueryItem) => {
  if (!item.goodsQuantity) {
    const res = await InventoryQueryService.getPackageInfo({ goodsId: item.goodsId });
    const content = `包装：${res.data}`;
    showModal({
      title: '提示',
      content: content,
      confirmText: '确定',
      confirmColor: '#2271F5',
    });
  } else {
    uni.navigateTo({
      url: `/subpackages/daily/inventory-query/list?entryId=${item.entryId}&goodsId=${item.goodsId}&prodArea=${item.prodArea}`,
    });
  }
};
const limitShow = ref(false);
const limitList = ref<InventoryQueryLowerLimitItem[]>([]);
const searchLimit = async (item: InventoryQueryItem) => {
  limitShow.value = false;
  const response = await InventoryQueryService.lowerLimit({
    entryId: item.entryId,
    goodsId: item.goodsId,
  });
  limitShow.value = true;
  if (+response.code !== 200) {
    showError(response.msg || '查询可销库存下限失败');
    return;
  }

  limitList.value = response.data || [];
};
</script>

<style lang="scss" scoped>
:deep(.u-dropdown__content) {
  position: fixed !important;
  top: 56px !important;
  height: 0;
  z-index: inherit;
}
</style>
