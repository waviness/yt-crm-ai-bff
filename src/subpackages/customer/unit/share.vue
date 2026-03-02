<script setup lang="ts">
import ShareItem from './components/share-item.vue';

const appStore = useAppStore();

// 使用分页 composable
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<any>(10);

const shareType = ref<number>(1); // 1客户分享 2人员分享
const personDetail = ref<any>({});
const detailInfor = computed(() => appStore.detailObj || {});

// 滑动操作按钮配置
const swipeOptions = [
  {
    text: '删除',
    style: {
      backgroundColor: appStore.theme.color.danger,
    },
  },
];

/**
 * 获取数据列表
 */
const fetchDataList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const res =
    shareType.value === 1
      ? await CustomerService.queryShareList({ cceId: detailInfor.value.cceId })
      : await CustomerService.querySharePersonList({ cueId: personDetail.value.cueId });
  return {
    list: res || [],
    total: res?.length || 0,
  };
};

/**
 * 删除分享
 */
const deleteDonor = (cesId: any) => {
  showModal({
    content: '确定移除？',
    success: async res => {
      if (res.confirm) {
        if (shareType.value === 1) {
          await CustomerService.delectShare({ cesId });
        } else {
          await CustomerService.delectSharePerson({ cesId });
        }
        showSuccess('移除成功');
        resetAndFetchData(fetchDataList);
      }
    },
  });
};

/**
 * 跳转到编辑页
 * @param editType 1新增 2编辑
 */
const toEdit = (editType: number, item?: any) => {
  let formData = {
    cesId: '',
    user: {},
    isUpdate: {},
    date: '',
  };
  if (editType === 2) {
    formData = {
      cesId: item.cesId,
      user: {
        value: item.shareToUserId,
        name: item.shareToUserName,
      },
      isUpdate: {
        value: item.isUpdate,
        name: +item.isUpdate === 1 ? '是' : +item.isUpdate === 0 ? '否' : '',
      },
      date: item.validDate,
    };
  }
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.customerUnitShareAdd, {
    type: String(shareType.value),
    personDetail: JSON.stringify(personDetail.value),
    formData: JSON.stringify(formData),
  });
};

// 生命周期
onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  shareType.value = +(decodedOpts.shareType || '1');
  personDetail.value = JSON.parse(decodedOpts.personDetail || '{}');
  resetAndFetchData(fetchDataList);
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    resetAndFetchData(fetchDataList);
    appStore.setHadDoneOnDetail(false);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchDataList);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="text-14px p-10">分享至</view>
    <view class="px-10">
      <up-swipe-action>
        <up-swipe-action-item
          v-for="item in list"
          :key="item.cueId"
          :options="swipeOptions"
          @click="deleteDonor(item.cesId)"
          class="block rounded-10rpx mb-2"
        >
          <view @click="toEdit(2, item)">
            <share-item :data="item" />
          </view>
        </up-swipe-action-item>
      </up-swipe-action>
      <app-empty v-if="!paginationLoading && !list.length" class="py-7" description="暂无数据" />
      <up-loadmore
        v-if="list.length > 0 || paginationLoading"
        :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
      />
    </view>
    <app-fix-btn text="分享新增" icon="xingzhuangjiehe2" @click="toEdit(1)" />
  </view>
</template>
