<script setup lang="ts">
interface IProps {}

const props = withDefaults(defineProps<IProps>(), {});

const emit = defineEmits<{
  taskListClick: [item: any];
}>();

// 响应式数据
const activeNumber = ref(0); // 1我收到的 0我发出的
const statusNumber = ref(1); // 1进行中 2已完成

// 使用分页 composable
const {
  list: dataList,
  totalNum: total,
  paginationLoading,
  resetAndFetchData,
  loadMore,
} = useSimplePagination<any>(10);

// 获取督办订单列表
const fetchSupervisionList = async (params: { pageNum: number; pageSize: number }) => {
  const res = await DataCenterService.getSynergiaOrderList({
    selectType: activeNumber.value,
    useStatus: statusNumber.value,
    startTime: '',
    endTime: '',
    keyword: '',
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });

  // 处理列表数据
  const list = res.list || [];
  list.forEach((element: any) => {
    element.useTitle = element.orderTitle || '';
  });

  return {
    list,
    total: res.total || 0,
  };
};

// 状态切换
const statusClick = async () => {
  await CommonService.crmUserClick({
    catalogType: 1,
    catalogTypeName: 'CDP',
    cucrId: '',
    menuId: '',
    menuName: '',
    menuOperation: '督办列表状态切换按钮点击',
    operationType: 3,
  });
  statusNumber.value = statusNumber.value === 1 ? 2 : 1;
  resetAndFetchData(fetchSupervisionList);
};

// 切换标签
const tabClick = (type: number) => {
  activeNumber.value = type;
  statusNumber.value = 1;
  resetAndFetchData(fetchSupervisionList);
};

// 点击任务项
const taskListClick = async (item: any) => {
  item.activeNumber = activeNumber.value;
  emit('taskListClick', item);

  await CommonService.crmUserClick({
    catalogType: 1,
    catalogTypeName: 'CDP',
    cucrId: '',
    menuId: '',
    menuName: '',
    menuOperation: '督办列表点击',
    operationType: 4,
  });
};

// 初始化
onMounted(() => {
  resetAndFetchData(fetchSupervisionList);
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchSupervisionList);
});
</script>

<template>
  <view class="bg-light-gray h-full pb-100">
    <up-sticky style="top: 0" class="block bg-light-gray!">
      <view class="flex text-14 pt-3 pb-1 px-10">
        <view
          class="h-80 leading-10 rounded-20rpx text-center flex-1"
          :class="activeNumber === 0 ? 'bg-main-3 color-white' : 'bg-white'"
          @click="tabClick(0)"
        >
          我发出的
        </view>
        <view
          class="h-80 leading-10 rounded-20rpx text-center flex-1 ml-2"
          :class="activeNumber === 1 ? 'bg-main-3 color-white' : 'bg-white'"
          @click="tabClick(1)"
        >
          我收到的
        </view>
      </view>
      <view class="py-2 px-10">共{{ total }}条</view>
    </up-sticky>
    <view v-if="paginationLoading || dataList.length">
      <view
        v-for="(item, index) in dataList"
        :key="'dbList' + index"
        class="bg-white py-2 px-10 mb-10"
        :class="statusNumber !== 1 ? 'color-gray-3' : ''"
        @click="taskListClick(item)"
      >
        <view class="flex justify-between items-center">
          <text class="text-14 flex-1">{{ item.useTitle }}</text>
          <text class="color-gray-4 text-right">{{ item.creTime }}</text>
        </view>
        <view class="py-2 overflow-hidden flex items-center justify-between">
          <view class="flex items-center">
            <text
              v-if="activeNumber === 1"
              v-for="(proItem, proIndex) in item.problemLableList"
              :key="'proIndex' + proIndex"
              class="color-main mr-2"
            >
              #{{ proItem }}
            </text>
          </view>
          <app-status-tag
            v-if="item.emergencyLevel === 1"
            type="success"
            name="普通"
            class="mr-2"
          />
          <app-status-tag
            v-if="item.emergencyLevel === 2"
            type="warning"
            name="重要"
            class="mr-2"
          />
          <app-status-tag v-if="item.emergencyLevel === 3" type="danger" name="紧急" class="mr-2" />
        </view>
        <view class="overflow-hidden flex justify-between">
          <view
            v-if="activeNumber === 0"
            v-for="(proItem, proIndex) in item.problemLableList"
            :key="'proIndex' + proIndex"
            class="color-main mr-2"
          >
            #{{ proItem }}
          </view>
          <view v-if="activeNumber === 1">发送人：{{ item.creName }}</view>
          <view class="font-bold ml-auto">{{ statusNumber === 1 ? '进行中' : '已完成' }}</view>
        </view>
      </view>
      <up-loadmore
        v-if="paginationLoading || dataList.length < total"
        :status="paginationLoading ? 'loading' : 'loadmore'"
      />
    </view>
    <app-empty v-else-if="!paginationLoading && !dataList.length" description="暂无数据" />
    <app-bottom-actions>
      <up-button shape="circle" type="primary" customStyle="width: 340rpx" @click="statusClick">
        <view class="flex items-baseline">
          <up-icon size="14" name="error-circle" color="#fff" />
          <view class="text-12 ml-1"
            >点击切换成「{{ statusNumber === 1 ? '已完成' : '进行中' }}」</view
          >
        </view>
      </up-button>
    </app-bottom-actions>
  </view>
</template>
