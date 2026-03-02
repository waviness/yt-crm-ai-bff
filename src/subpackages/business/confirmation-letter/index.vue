<template>
  <view>
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0"
      ><confirmation-letter-filter-pop
        v-model:filterShow="filterShow"
        :formData="formData"
        @confirm="onFilterConfirm"
      />
      <app-tabs :list="statusList" :active="activeTab" @change="onhandleActiveChange" />
      <up-alert
        @click="overdueClick"
        type="warning"
        :description="`预警：你有${validNumber}条询证函超期未完成`"
      ></up-alert>
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="pa-2">
        <confirm-list
          class="block mb-2"
          @changeStatus="
            (val: { confirmadocid: string; statue: number; index: number }) =>
              changeStatus({ ...val, index: index })
          "
          v-for="(item, index) in list"
          @toDetail="toDetail(index)"
          :key="index"
          :item="item"
        />
        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
    <!-- 高级操作 -->
    <app-bottom-actions>
      <view class="w-full flex justify-center">
        <app-action-btn
          @click="addClick"
          customClass="px-3"
          type="dark"
          :multi="false"
          icon="a-xingzhuang2"
          text="新增客户信息"
        />
        <app-action-btn
          customClass="ml-2 px-3"
          @click="abnormalClick"
          icon="a-xingzhuang2"
          type="plain"
          :multi="false"
          text="询证函异常"
        />
      </view>
    </app-bottom-actions>
  </view>
</template>

<script lang="ts" setup>
import { useConfirmationLetter } from './composables/use-confirmation-letter';
import confirmationLetterFilterPop from './components/confirmation-letter-filter-pop.vue';
import confirmList from './components/confirm-list.vue';
const appStore = useAppStore();
// 使用业务逻辑组合式API
const {
  filterShow,
  statusList,
  activeTab,
  formData,
  validNumber,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  toDetail,
  rowIndex,
  onRefresh,
  onLoadMore,
  removeRow,
  calcPullRefreshHeight,
  fetchExceedTimeLimitTask,
  changeStatus,
} = useConfirmationLetter();
// 筛选条件变更处理
const onFilterConfirm = (filterVal: any) => {
  filterShow.value = false;
  formData.value = { ...filterVal };
  //   handleFilterChange(filterVal);
  onRefresh();
};
const onhandleActiveChange = ({ index }: { index: number }) => {
  activeTab.value = index;
  //   handleActiveChange({ index });
  onRefresh();
};
const overdueClick = () => {
  router.push('/subpackages/business/confirmation-letter/overdue');
};
const abnormalClick = () => {
  router.push('/subpackages/business/confirmation-letter/abnormal', { role: 1 });
};
const addClick = () => {
  router.push('/subpackages/business/confirmation-letter/add');
};
onShow(() => {
  if (rowIndex.value !== -1 && appStore.hadDoneOnDetail) {
    removeRow(rowIndex.value);
    rowIndex.value = -1;
    appStore.setHadDoneOnDetail(false);
  }
});
onMounted(async () => {
  await calcPullRefreshHeight();
  onRefresh();
  fetchExceedTimeLimitTask();
});
</script>

<style scoped></style>
