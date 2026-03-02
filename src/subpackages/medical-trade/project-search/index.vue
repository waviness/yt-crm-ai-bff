<template>
  <view class="page-container">
    <app-watermark></app-watermark>
    <view class="sticky-container">
      <up-sticky>
        <view class="search-container">
          <up-search
            v-model="searchValue"
            placeholder="搜索"
            :show-action="false"
            @search="onSearch"
            @change="onSearch"
            @clear="onSearch"
          ></up-search>
        </view>
      </up-sticky>
    </view>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="list-container">
        <project-list
          v-for="(item, index) in list"
          :key="item.projectId || index"
          :item="item"
          @toDetail="toDetail(item)"
        />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import projectList from './components/project-list.vue';
import { useProject } from './composables/use-project';
import type { ProjectItem } from './types';

const {
  searchValue,
  onSearch,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = useProject();

const toDetail = (item: ProjectItem) => {
  router.push('/subpackages/medical-trade/project-search/detail', {
    projectId: item.projectId,
    // 传递整个对象（如果不需要重新请求接口）
    projectData: JSON.stringify(item),
  });
};

onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style scoped>
.page-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.sticky-container {
  height: 50px;
  margin-bottom: 10px;
}

.search-container {
  background-color: white;
  padding: 8px 15px;
  border-radius: 8px;
}

.list-container {
  padding: 0 15px;
}
</style>
