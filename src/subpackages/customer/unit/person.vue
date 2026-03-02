<script setup lang="ts">
const appStore = useAppStore();

// 使用分页 composable
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<any>(10);

// 状态
const onlyRead = ref(false);
const detailInfor = computed(() => appStore.detailObj || {});

/**
 * 获取数据列表
 */
const fetchDataList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const res = await CustomerService.queryPersonList({
    creId: detailInfor.value.creId,
    custId: detailInfor.value.custId,
    pageNum,
    pageSize,
  });
  return {
    list: res || [],
    total: res?.length || 0,
  };
};

/**
 * 转职
 */
const transferTo = (item: any) => {
  router.push(RouteMap.customerUnitTransfer, {
    cupId: item?.cupId || '',
    igonreCustId: detailInfor.value.custId,
  });
};

/**
 * 删除用户
 */
const deleteUser = (item: any) => {
  showModal({
    content: '确定删除？',
    success: async res => {
      if (res.confirm) {
        await CustomerService.delectPerson({ cupId: item.cupId });
        showSuccess('删除成功');
        resetAndFetchData(fetchDataList);
      }
    },
  });
};

/**
 * 分享至
 */
const shareTo = (item: any) => {
  router.push(RouteMap.customerUnitShare, {
    shareType: '2',
    personDetail: item,
  });
};

/**
 * 编辑用户
 */
const toEditUser = (editType: number, item?: any) => {
  router.push(RouteMap.customerUnitPersonAdd, {
    type: String(editType),
    customerInfo: detailInfor.value,
    cupId: item ? item.cupId : '',
  });
};

// 生命周期
onMounted(() => {
  onlyRead.value = detailInfor.value.onlyRead || false;
  resetAndFetchData(fetchDataList);
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    resetAndFetchData(fetchDataList);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchDataList);
});
</script>

<template>
  <view class="p-10 pb-100">
    <app-watermark> </app-watermark>
    <view class="bg-white rounded-1 p-10 mb-2 flex justify-between">
      <view>
        <view>{{ detailInfor.custId }}/</view>
        <view>{{ detailInfor.custName || '' }}</view>
      </view>
      <view class="flex flex-col justify-between ml-90px min-w-fit">
        <view class="text-right">{{ detailInfor.hospitalLevel || '' }}</view>
        <view class="flex mt-1">
          <text class="mr-2">维护人</text>
          <text class="color-gray-4">{{
            detailInfor.cceId && detailInfor.creName ? detailInfor.creName : ''
          }}</text>
        </view>
      </view>
    </view>
    <view>
      <view
        v-for="item in list"
        :key="item.cueId"
        @click="toEditUser(3, item)"
        class="bg-light-gray-2 rounded-1 mt-2 shadow-view"
      >
        <view class="bg-white rounded-1 p-10">
          <view class="flex justify-between items-center">
            <view class="text-15px">{{
              item.userId ? item.userId + '/' + item.userName : ''
            }}</view>
            <view>{{ item.orgnizationRoleId }}/{{ item.orgnizationRoleName }}</view>
          </view>
          <view class="mt-1">{{ item.phoneNum }}</view>
          <view class="flex items-center mt-4">
            <text class="w-64px color-gray-4">微信号</text>
            <text class="flex-1">{{ item.wxCode }}</text>
          </view>
          <view class="flex items-center mt-2">
            <text class="w-64px color-gray-4">部门信息</text>
            <text class="flex-1">{{ item.departmentId }}/{{ item.departmentName }}</text>
          </view>
          <view class="flex items-center mt-2">
            <text class="w-64px color-gray-4">职位信息</text>
            <text class="flex-1">{{ item.positionId }}/{{ item.positionName }}</text>
          </view>
          <view class="flex items-center mt-2">
            <text class="w-64px color-gray-4">维护人</text>
            <text class="flex-1">{{ item.operationId }}/{{ item.operationName }}</text>
          </view>
          <view class="flex items-center mt-2">
            <text class="w-64px color-gray-4">状态</text>
            <text class="flex-1">{{
              item.status === 0
                ? '正式'
                : item.status === 2
                  ? '退休/离职'
                  : item.status === 3
                    ? '转职'
                    : item.status === 4
                      ? '由转职来'
                      : ''
            }}</text>
          </view>
        </view>
        <view v-if="!onlyRead" class="p-10 flex justify-end">
          <up-button
            type="primary"
            size="small"
            shape="circle"
            class="mx-0 ml-2 px-10 w-auto!"
            @tap.native.stop="toEditUser(2, item)"
          >
            编辑
          </up-button>
          <up-button
            size="small"
            shape="circle"
            class="mx-0 ml-2 px-10 w-auto!"
            @tap.native.stop="shareTo(item)"
          >
            分享至
          </up-button>
          <up-button
            size="small"
            shape="circle"
            class="mx-0 ml-2 px-10 w-auto!"
            @tap.native.stop="transferTo(item)"
          >
            转职至
          </up-button>
          <up-button
            type="error"
            size="small"
            shape="circle"
            plain
            class="mx-0 ml-2 px-10 w-auto!"
            @tap.native.stop="deleteUser(item)"
          >
            删除
          </up-button>
        </view>
      </view>
      <app-empty v-if="!paginationLoading && !list.length" class="py-7" description="暂无数据" />
      <up-loadmore
        v-if="list.length > 0 || paginationLoading"
        :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
      />
    </view>
    <app-fix-btn v-if="!onlyRead" text="人员新增" icon="renyuan1" @click="toEditUser(1)" />
  </view>
</template>
