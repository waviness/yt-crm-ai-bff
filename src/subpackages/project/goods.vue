<!-- 项目管理 - 准入管理 - 项目 -->
<script setup lang="ts">
import { useProjectGoods } from './composables/use-project-goods';
import { useProjectSearchUnified } from './composables/use-project-search-unified';
import BaseBlock from './components/base-block.vue';
import GoodsItem from './components/goods-item.vue';

const projectStore = useProjectStore();
const leaderLevel = computed(() => projectStore.projectLeaderLevel || 0);

// 定义搜索占位符
const placeholder = ref('搜索');
const goodsTabsList = ref([
  { name: '全部', value: 0 },
  { name: '未准入', value: 1 },
  { name: '已准入', value: 2 },
]);

// 使用业务逻辑 composable
const {
  projectName,
  data,
  searchGoodsParams,
  list,
  loading,
  getData,
  getGoodsList,
  handleMonthChange,
  handleUserChange,
  toDetail,
  toPolicy,
  handlePageLoad,
  resList,
  selectMonth,
  orgOriginList,
  orgList,
  columns,
  yearMonthData,
} = useProjectGoods();

const { searchKeyword, searchUsers } = useProjectSearchUnified();

// 搜索方法
const handleUserSearch = (keyword: string) => {
  searchUsers(orgOriginList.value, orgList, keyword);
};

// 页面加载处理
onLoad(() => {
  // 设置当前tab
  projectStore.setCurrentTab('access');

  handlePageLoad();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <base-block
      :leaderLevel="leaderLevel"
      :data="data"
      :title="projectName"
      :selectMonth="selectMonth"
      :columns="columns"
      :yearMonthData="yearMonthData"
      :orgList="orgList"
      :resList="resList"
      variant="access"
      :showUserSelect="true"
      @monthChange="handleMonthChange"
      @search="handleUserSearch"
      @userChange="handleUserChange"
    >
      <view class="px-3 py-10">
        <up-search
          key="project-goods-search-input"
          v-model="searchGoodsParams.key"
          clearable
          shape="square"
          bgColor="#f7f8fa"
          :showAction="false"
          :placeholder="placeholder"
          confirm-type="search"
          @search="getGoodsList"
          @clear="getGoodsList"
        />
      </view>
      <up-tabs
        :current="searchGoodsParams.status"
        :list="goodsTabsList"
        :lineWidth="40"
        :scrollable="false"
        @change="
          ({ index }: { index: number }) => {
            searchGoodsParams.status = index;
            getGoodsList();
          }
        "
      />
      <goods-item
        v-for="(item, idx) in list"
        :key="idx"
        :data="item"
        :gray="idx % 2 === 0"
        @click="toDetail"
      />
      <up-loadmore v-if="loading" status="loading" />
      <app-empty v-show="!loading && !list.length" class="py-7" description="暂无数据" />
    </base-block>
    <app-fix-btn text="点击查看项目品种政策" :fontSize="12" bold @click="toPolicy" />
  </view>
</template>

<style lang="scss" scoped>
:deep(.up-search) {
  border-radius: 10px;
}
</style>
