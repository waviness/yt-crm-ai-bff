<template>
  <view>
    <app-watermark> </app-watermark>
    <!-- 头部：客户 + 运输地址 + 标签 + 搜索 -->
    <up-sticky style="top: 0">
      <view class="px-2" bg-white>
        <!-- 客户信息：点击选择客户 -->
        <up-cell @click="customShow = true">
          <template #icon>
            <app-icon name="xiaoshou_sales-report" size="24" class="mr-2"></app-icon>
          </template>
          <template #value>
            <text class="text-14">
              {{
                (customParams.CONTACTID || customParams.customid) +
                '/' +
                (customParams.CONTACTMAN || customParams.customname)
              }}
            </text>
          </template>
          <template #right-icon>
            <up-icon name="arrow-down" size="16" class="text-gray-5"></up-icon>
          </template>
        </up-cell>

        <!-- 运输地址：点击选择地址 -->
        <up-cell @click="addressShow = true">
          <template #icon>
            <app-icon
              name="bendi_local-pin"
              size="24"
              :color="chooseAddress.ADDRESS ? 'main' : '#969799'"
              class="mr-2"
            />
          </template>
          <template #value>
            <text :class="chooseAddress.ADDRESS ? 'text-main' : 'text-gray-5'">
              {{
                chooseAddress.ADDRESS
                  ? `${chooseAddress.ADDRESSID}/${chooseAddress.ADDRESS}`
                  : '请选择运输地址'
              }}
            </text>
          </template>
          <template #right-icon>
            <up-icon name="arrow-down" size="16" class="text-gray-5"></up-icon>
          </template>
        </up-cell>
      </view>

      <!-- 目录类型切换 + 搜索 -->
      <view bg-white>
        <app-tabs :list="statusList" :active="dirType" @change="onRefresh" />
        <!-- <up-tabs v-model="dirType" @change="onRefresh" active-color="#2271F5">
          <up-tab :name="1" title="全部" />
          <up-tab :name="2" title="近效期" />
          <up-tab :name="3" title="待处理" />
        </up-tabs> -->

        <up-search
          class="pa-2"
          bg-white
          shape="round"
          v-model="searchValue"
          placeholder="请输入搜索关键词"
          @search="onRefresh"
          @clear="onRefresh"
        />
      </view>
    </up-sticky>

    <!-- 列表 + 下拉刷新 / 上拉加载 -->
    <app-pull-refresh
      class="mt-2"
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2 listWarp">
        <app-empty
          class="pb-6 white-bg"
          v-if="!refreshing && !list.length"
          description="暂无数据"
        />
        <two-pin-list
          v-for="item in list"
          :key="'two-pin-goods-' + item.goodsId"
          :item="item"
          @click="handleClickGoods(item)"
        />
      </view>
    </app-pull-refresh>

    <!-- 运输地址选择 -->
    <app-action-sheet
      v-model:show="addressShow"
      :actions="addressList"
      description="选择地址"
      @select="handleSelectAddress"
    />

    <!-- 客户选择弹窗 -->
    <up-popup
      class="van-popup-bg"
      :customStyle="{ height: '90vh' }"
      v-model:show="customShow"
      shape="circle"
      mode="bottom"
      :safe-area-inset-bottom="true"
    >
      <view class="text-16 py-2 font-bold text-center">单位信息</view>
      <biz-custom-list @cell-click="chooseCustomClick" :entryid="entryChoose.entryid + ''" />
    </up-popup>

    <!-- 底部筛选按钮：库存排序 / 销售情况 -->
    <app-bottom-actions>
      <view class="flex w-full justify-center">
        <app-action-btn
          customClass="px-3"
          icon="shaixuan_filterdefuben"
          type="plain"
          :multi="false"
          @click="showOrderPopover = true"
          :text="
            orderFlag === ''
              ? '库存排序'
              : orderFlag === 1
                ? '按库存排序'
                : orderFlag === 2
                  ? '按金额排序'
                  : ''
          "
        />
        <app-action-btn
          customClass="px-3 ml-3"
          icon="paixu2_sort-two"
          type="primary"
          :multi="false"
          @click="showSoldPopover = true"
          :text="
            soldFlag === ''
              ? '销售情况'
              : soldFlag === 0
                ? '未销售过'
                : soldFlag === 1
                  ? '销售过'
                  : ''
          "
        />
      </view>
    </app-bottom-actions>

    <!-- 库存排序方式 -->
    <app-action-sheet
      v-model:show="showOrderPopover"
      :actions="orderActions"
      description="排序方式"
      @select="orderSelect"
    />

    <!-- 销售情况选择 -->
    <app-action-sheet
      v-model:show="showSoldPopover"
      :actions="soldActions"
      description="销售情况"
      @select="soldSelect"
    />

    <!-- 购物车按钮：跳转到二销购物车 -->
    <shop-card-btn cardType="2" />
  </view>
</template>

<script lang="ts" setup>
import shopCardBtn from '../components/base/shop-card-btn.vue';
import twoPinList from '../components/base/two-pin-list.vue';
import { useBaseIndex } from '../composables/use-base-index';
import { useReportCustomDetail } from '../composables/use-custom-detail';

const reportTwoStore = useReportTwoStore();
const customParams = computed(() => reportTwoStore.customParams);
const entryChoose = computed(() => reportTwoStore.entryChoose);
const statusList = reactive([
  { name: '全部', index: 1 },
  { name: '近效期', index: 2 },
  { name: '待处理', index: 3 },
]);
// 地址选择复用 useBaseIndex 的逻辑
const { fetchContact, handleSelectAddress, addressShow, chooseAddress, addressList } =
  useBaseIndex('two-pin');

// 列表筛选 & 排序
const dirType = ref(1); // 1: 全部 2: 近效期 3: 待处理
const searchValue = ref('');
const orderFlag = ref<any>(''); // 排序方式：1库存 2金额
const soldFlag = ref<any>(''); // 销售标记：0未销售过 1销售过

const orderActions = [
  { name: '按库存排序', id: 1 },
  { name: '按金额排序', id: 2 },
  { name: '取消排序', id: '' },
];

const soldActions = [
  { name: '未销售过', id: 0 },
  { name: '销售过', id: 1 },
  { name: '取消选择', id: '' },
];

const showOrderPopover = ref(false);
const showSoldPopover = ref(false);
const customShow = ref(false);

// 根据当前筛选条件动态构造查询参数（交给 useReportCustomDetail）
const getGoodsParams = () => ({
  entryId: entryChoose.value.entryid,
  customId: customParams.value.customid,
  contactId: customParams.value.CONTACTID || '',
  addressId: chooseAddress.value.ADDRESSID || '',
  goodsNameOrId: searchValue.value,
  dirType: dirType.value === 1 ? '' : dirType.value,
  soldFlag: soldFlag.value,
  orderFlag: orderFlag.value,
});

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useReportCustomDetail(getGoodsParams, 'two-pin');

const soldSelect = (action: any) => {
  soldFlag.value = action.id;
  showSoldPopover.value = false;
  onRefresh();
};

const orderSelect = (action: any) => {
  orderFlag.value = action.id;
  showOrderPopover.value = false;
  onRefresh();
};

const chooseCustomClick = (val: any) => {
  reportTwoStore.setCustomParams(val);
  customShow.value = false;
  // 重置地址并重新查询地址和列表
  chooseAddress.value = {
    ADDRESSID: '',
    ADDRESS: '',
  } as any;
  fetchContact();
};

// 点击货品
const handleClickGoods = (item: any) => {
  if (item.narcoticId == 262 || item.narcoticId == 263) {
    showError((item.narcoticId == 262 ? '麻醉药品' : '第一类精神药品') + '不允许下单');
    return;
  }
  if (!chooseAddress.value.ADDRESS) {
    showError('请先选择运输地址');
    return;
  }
  if (item.sausestatus && item.sausestatus !== 1) {
    const alertMessage = '当前货品状态不可销，不可加购';
    showError(alertMessage);
    return;
  }
  if ((item.gspusestatus || item.gspusestatus === 0) && item.gspusestatus !== 1) {
    const alertMessage = `当前货品${
      item.gspusestatus === 2
        ? '待首营'
        : item.gspusestatus === 3
          ? '质量禁止'
          : item.gspusestatus === 4
            ? '首营不通过'
            : item.gspusestatus === 5
              ? '未首营'
              : ''
    }，不可加购`;
    showError(alertMessage);
    return;
  }
  // 额外条件检查
  if (item.limitFlag === 2 || item.limitFlag === 3) {
    showError('当前货品有限制，不可加购');
    return;
  }
  reportTwoStore.setGoodsDetail(
    Object.assign(
      {
        ...chooseAddress.value,
        dirType: dirType.value === 1 ? '' : dirType.value,
      },
      item
    )
  );
  uni.navigateTo({
    url: '/subpackages/report-two/two-pin/goods-detail?type=2',
  });
};
onMounted(async () => {
  fetchContact();
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
