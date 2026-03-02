<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <view class="px-2" bg-white>
        <up-cell :value="customParams.customname">
          <template #icon>
            <app-icon name="xiaoshou_sales-report" size="24" class="mr-2"></app-icon>
          </template>
          <template #right-icon>
            <up-icon name="arrow-down" size="16" class="text-gray-5"></up-icon>
          </template>
        </up-cell>
        <up-cell @click="addressShow = true">
          <template #icon>
            <app-icon name="bendi_local-pin" size="24" color="main" class="mr-2"></app-icon>
          </template>
          <template #value>
            <text :class="chooseAddress.ADDRESS ? 'text-main' : 'text-gray-5'">{{
              chooseAddress.ADDRESS || '请选择运输地址'
            }}</text>
          </template>
          <template #right-icon>
            <up-icon name="arrow-down" size="16" class="text-gray-5"></up-icon>
          </template>
        </up-cell>
      </view>
      <!--    @search="onSearch"
        @clear="onSearch"
        v-model="searchValue" -->
      <up-search class="pa-2" bg-white shape="round"></up-search>
      <view class="color-main pa-2"> {{ entryChoose.entryid }}/{{ entryChoose.entryname }} </view>
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2">
        <report-goods-list
          v-for="item in list"
          @click="handleClickGoods(item)"
          :key="'report-goods' + item.goodsId"
          :item="item"
        />
      </view>
    </app-pull-refresh>
    <app-action-sheet
      v-model:show="addressShow"
      :actions="addressList"
      description="选择地址"
      @select="handleSelectAddress"
    />
    <shop-card-btn cardType="1" />
  </view>
</template>

<script lang="ts" setup>
import reportGoodsList from '../components/base/report-goods-list.vue';
import type { GoodsItem } from '../types/index';
import shopCardBtn from '../components/base/shop-card-btn.vue';
const reportTwoStore = useReportTwoStore();
const customParams = computed(() => reportTwoStore.customParams);
const entryChoose = computed(() => reportTwoStore.entryChoose);
import { useBaseIndex } from '../composables/use-base-index';
import { useReportCustomDetail } from '../composables/use-custom-detail';
const { fetchContact, handleSelectAddress, addressShow, chooseAddress, addressList } =
  useBaseIndex();

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useReportCustomDetail({
  entryId: entryChoose.value.entryid,
  customId: customParams.value.customid,
  contactId: customParams.value.CONTACTID ? customParams.value.CONTACTID : '',
  goodsNameOrId: '',
});

const handleClickGoods = (item: GoodsItem) => {
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
  reportTwoStore.setGoodsDetail(Object.assign({ ...chooseAddress.value }, item));
  uni.navigateTo({
    url: '/subpackages/report-two/report/goods-detail',
  });
};

onMounted(async () => {
  fetchContact();
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped>
:deep(.u-cell__body) {
  padding: 5px 0;
}
</style>
