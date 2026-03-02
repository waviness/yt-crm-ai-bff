<template>
  <view>
    <!-- 水印组件 -->
    <app-watermark />

    <!-- 订单筛选栏 - 固定在顶部 -->
    <up-sticky style="top: 0">
      <order-filter-pop
        :orderTypeFlag="!formData.orderType"
        :formData="formData"
        @confirm="onFilterConfirm"
      />
    </up-sticky>

    <!-- 订单列表 - 支持下拉刷新和上拉加载 -->
    <view>
      <app-pull-refresh
        :refreshing="refreshing"
        :loadmoreProps="loadmoreConfig"
        :pullRefreshHeight="pullRefreshHeight"
        @refresh="onRefresh"
        @loadmore="onLoadMore"
      >
        <view class="pa-2">
          <order-list
            v-for="item in list"
            :key="item.codDocId"
            :item="item"
            @click="onClickDetail(item)"
          />
        </view>
      </app-pull-refresh>
    </view>
  </view>
</template>

<script lang="ts" setup>
import orderFilterPop from '../components/base/order-filter-pop.vue';
import orderList from '../components/base/order-list.vue';
import { useWxOrder } from '../composables/use-wx-order';

/**
 * 微信订单列表页面
 * 功能：展示微信订单列表，支持筛选、刷新、加载更多、查看详情
 */

// 组件事件定义
interface Emits {
  (e: 'update:filterShow', data: boolean): void;
}

// 组件属性定义
const props = defineProps<{
  /** 订单类型 */
  orderType: string;
}>();

const emit = defineEmits<Emits>();

// 使用订单列表组合式函数，管理订单列表状态和操作
const {
  formData, // 筛选表单数据
  filterShow, // 筛选弹窗显示状态
  list, // 订单列表数据
  refreshing, // 刷新状态
  loadmoreConfig, // 加载更多配置
  pullRefreshHeight, // 下拉刷新高度
  onRefresh, // 刷新方法
  onLoadMore, // 加载更多方法
  calcPullRefreshHeight, // 计算下拉刷新区域高度
  onFilterConfirm, // 筛选确认方法
} = useWxOrder(props.orderType);

/**
 * 跳转到订单详情页
 * @param item 订单数据项
 */
const onClickDetail = (item: any) => {
  // 确定 orderType：优先使用 props 传入的值，否则使用 formData 中的值
  const orderTypeValue = props.orderType || formData.value.orderType;
  const orderTypeParam = orderTypeValue ? `&orderType=${orderTypeValue}` : '';

  uni.navigateTo({
    url: `/subpackages/report-two/wx-order/detail?codDocId=${item.codDocId}${orderTypeParam}`,
  });
};

/**
 * 页面加载生命周期
 * 初始化默认时间范围（最近10天）
 */
onLoad(() => {
  // 订单类型为 '14' 时不设置默认时间
  if (props.orderType === '14') {
    return;
  }

  // 设置默认时间范围为最近10天
  const endTime = time.format(new Date(), time.FORMATS.ISO_DATE);
  const startTime = time.format(time.add(new Date(endTime), -10, 'day'), time.FORMATS.ISO_DATE);
  formData.value.startTime = startTime;
  formData.value.endTime = endTime;
});

/**
 * 页面挂载生命周期
 * 计算刷新区域高度并加载初始数据
 */
onMounted(async () => {
  await calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
