<template>
  <view class="w-full">
    <!-- 搜索 -->
    <view class="pa-2">
      <view class="text-16 py-4 font-bold text-center">不包含货品</view>
      <up-search
        v-model="searchValue"
        placeholder="搜索"
        shape="round"
        inputAlign="center"
        @search="onSearch"
        @clear="onSearch"
      />
    </view>

    <!-- 列表 + 下拉刷新 / 上拉加载 -->
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-2 pt-2">
        <up-checkbox-group style="display: block" v-model="result">
          <view v-for="item in list" :key="item.value" class="mb-2">
            <up-cell clickable :title="item.label" @click="toggle(item.value)" border>
              <template #right-icon>
                <up-checkbox :name="item.value" />
              </template>
            </up-cell>
          </view>
        </up-checkbox-group>

        <app-empty v-if="!refreshing && !list.length" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>

    <!-- 底部按钮 -->
    <app-bottom-actions>
      <up-button shape="circle" @click="cancelClick">取消</up-button>
      <up-button type="primary" shape="circle" @click="handleFilterOk">确定</up-button>
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  querySelfNumber?: number | string;
  exgoodsIds?: (string | number)[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'cancelClick'): void;
  (e: 'handleFilterOk', val: (string | number)[]): void;
}>();

// 搜索关键字与选中结果
const searchValue = ref('');
const result = ref<(string | number)[]>(props.exgoodsIds || []);

// 分页 + 列表数据
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  const data = await CommonService.getAuthorizedList({
    menuName: '采购锁控模块',
    querySelfFlag: props.querySelfNumber,
    goodsKeyword: searchValue.value,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });

  const list =
    data?.list?.map((val: any) => ({
      value: val.goodsId,
      label: `${val.goodsId}/${val.goodsName}`,
    })) || [];

  return {
    list,
    hasNextPage: data?.hasNextPage || false,
    total: data?.total || 0,
  };
};

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  calcPullRefreshHeight,
  onRefresh,
  onLoadMore,
} = usePagination(
  {
    pageSize: 20,
    initialPage: 1,
    toolBarHeight: 180,
  },
  fetchData
);

const onSearch = () => {
  onRefresh();
};

// 点击整行时切换勾选状态
const toggle = (value: string | number) => {
  const idx = result.value.indexOf(value);
  if (idx > -1) {
    result.value.splice(idx, 1);
  } else {
    result.value.push(value);
  }
};

// 取消
const cancelClick = () => {
  emit('cancelClick');
};

// 确定
const handleFilterOk = () => {
  emit('handleFilterOk', result.value);
};

// 初始化时同步外部传入的选中值
onMounted(() => {
  if (props.exgoodsIds && props.exgoodsIds.length) {
    result.value = [...props.exgoodsIds];
  }
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
