<template>
  <view>
    <app-watermark> </app-watermark>
    <!-- 批次选择组件 -->
    <pc-list v-if="pcShow" @batchChangeClick="batchChangeClick" />

    <!-- 头部：tabs + 搜索 -->
    <up-sticky v-if="!pcShow" style="top: 0">
      <app-tabs
        :list="tabList"
        :active="tabActive"
        @change="({ index }: { index: number }) => tabChange(index)"
        activeColor="#2271F5"
      />
      <view class="pa-2 bg-white">
        <up-search
          v-model="searchValue"
          placeholder="搜索"
          shape="round"
          @search="onSearch"
          @clear="onSearch"
        />
      </view>
    </up-sticky>

    <!-- 列表内容 -->
    <view v-if="!pcShow" class="pa-2">
      <app-pull-refresh
        :refreshing="refreshing"
        :loadmoreProps="loadmoreConfig"
        :pullRefreshHeight="pullRefreshHeight"
        @refresh="onRefresh"
        @loadmore="onLoadMore"
      >
        <view class="pb-100">
          <varietyFollowList
            v-for="item in list"
            :key="item.id"
            :isCustomer="tabActive === 0"
            :type="tabActive"
            :itemObj="item"
            @onFillSubmit="onFillSubmit(item)"
            @click="handleClick(item)"
          />
        </view>
      </app-pull-refresh>
    </view>

    <!-- 底部按钮 -->
    <app-bottom-actions v-if="!pcShow" :count="1">
      <app-action-btn
        customClass="px-2"
        icon="a-xingzhuang4"
        type="plain"
        shape="circle"
        :text="`切换批次 当前(${pcObj.configName})`"
        @click="pcShow = true"
        :multi="false"
      >
        <!-- <template #icon>
          <app-icon name="" size="18" color="#2271F5" />
        </template> -->
        <!-- <text></text> -->
      </app-action-btn>
    </app-bottom-actions>

    <up-modal :show="beforeSubmitShow" @confirm="onBeforeSubmit">
      <view class="slot-content">
        <view
          >确定将当前客户下所有厂牌货品中<text class="color-red">未处理的医院</text
          >勾选状态标记为<text class="color-red">"医院未完成"</text>？</view
        >
      </view>
    </up-modal>
    <up-modal :show="submitShow" @confirm="onSubmitConfirm">
      <view class="slot-content">
        <view>
          共有{{ submitObj.allCount }}条数据，之前已处理<span class="color-success"
            >{{ submitObj.filledCount }}条</span
          >，剩余<text class="color-red">{{ submitObj.unFillCount }}条</text>数据已被标记为<text
            class="color-red"
            >"医院未完成"！</text
          >`;
        </view>
      </view>
    </up-modal>
  </view>
</template>

<script lang="ts" setup>
import varietyFollowList from './compontents/variety-follow-list.vue';
import pcList from './compontents/pc-list.vue';

const varietyFollowStore = useVarietyFollowStore();
const pcObj = computed(() => varietyFollowStore.pcObj);

// 批次选择显示状态
const pcShow = ref(true);

// tabs 配置
const tabList = [{ name: '按客户填报' }, { name: '按厂牌填报' }];
const tabActive = ref(0);
const searchValue = ref('');

// 根据当前 tab 和搜索条件获取数据
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  const apiParams = {
    cgtcId: pcObj.value.cgtcId,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
    search: searchValue.value,
  };

  const res =
    tabActive.value === 0
      ? await varietyFollowService.queryCustomFillList(apiParams)
      : await varietyFollowService.queryBrandFillList(apiParams);

  if (+res.code === 200) {
    const list = res.data.list.map((item: any) => {
      if (tabActive.value === 0) {
        item.objId = item.customId;
        item.objName = item.customName;
      } else {
        item.objName = item.brandName;
      }
      return item;
    });

    return {
      list,
      hasNextPage: res.data.hasNextPage || false,
      total: res.data.total || 0,
    };
  }

  return {
    list: [],
    hasNextPage: false,
    total: 0,
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
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 95,
  },
  fetchData
);

// tab 切换
const tabChange = (index: number) => {
  tabActive.value = index;
  searchValue.value = '';
  onRefresh();
};

// 搜索
const onSearch = () => {
  onRefresh();
};

// 点击列表项
const handleClick = (item: any) => {
  console.log(item);
  varietyFollowStore.setTableTopObj(item);
  uni.navigateTo({
    url: `/subpackages/daily/variety-follow/detail?type=${tabActive.value}`,
  });
};

// 批次切换
const batchChangeClick = async (val: any) => {
  pcShow.value = false;
  varietyFollowStore.setPcObj(val);
  searchValue.value = '';
  await calcPullRefreshHeight();
  onRefresh();
};
const beforeSubmitShow = ref(false);
const submitShow = ref(false);
const submitObj = ref({
  allCount: 0,
  unFillCount: 0,
  filledCount: 0,
});
// 一键填报
const onFillSubmit = (item: any) => {
  beforeSubmitShow.value = true;
  //   const content =
  //     '确定将当前客户下所有厂牌货品中<span class="color-red">未处理的医院</span>勾选状态标记为' +
  //     '<span class="color-red">"医院未完成"</span>？';

  //   showModal({
  //     title: '提示',
  //     content: content,
  //     confirmText: '确定',
  //     confirmColor: '#2271f5',
  //     success: async res => {
  //       if (res.confirm) {
  //         await _oneKeyFillAll(item);
  //       }
  //     },
  //   });
};
const onBeforeSubmit = async () => {
  beforeSubmitShow.value = false;
  await _oneKeyFillAll(varietyFollowStore.tableTopObj);
};
// 一键填报全部
const _oneKeyFillAll = async (item: any) => {
  try {
    const res = await varietyFollowService.oneKeyFillAll({
      cgtcId: pcObj.value.cgtcId,
      customId: item.customId,
    });

    if (+res.code === 200) {
      const allCount = res.data.allCount;
      const unFillCount = res.data.unFillCount;
      const filledCount = allCount - unFillCount;
      submitObj.value.allCount = allCount;
      submitObj.value.unFillCount = unFillCount;
      submitObj.value.filledCount = filledCount;
      submitShow.value = true;
    }
  } catch (error: any) {
    showError(error.msg || '操作失败');
  }
};
const onSubmitConfirm = () => {
  submitShow.value = false;
  onRefresh();
};
// 页面进入时的逻辑（对应 beforeRouteEnter）
onMounted(() => {
  // 如果从 Home 页面进入，先隐藏再显示批次选择
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2];
    if (prevPage?.route === 'pages/home/index') {
      pcShow.value = false;
      nextTick(() => {
        pcShow.value = true;
      });
    }
  }
});
</script>
<style lang="scss" scoped></style>
