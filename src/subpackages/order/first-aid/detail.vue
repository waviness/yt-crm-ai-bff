<template>
  <view>
    <card class="pa-2" :key="detailItem.id" :orderItem="detailItem" />
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <up-checkbox-group v-model="checkValue" @change="checkChange" placement="column">
        <up-checkbox
          v-if="list.length"
          v-for="(deatilListItem, deatilIndex) in list"
          :key="deatilListItem.salesdtlid + deatilIndex"
          :name="deatilListItem.salesdtlid"
          :customStyle="{
            marginBottom: '8px',
            width: 'calc(100%- 20px)',
            padding: '10px',
            background: '#fff',
          }"
        >
          <template style="width: 100%; padding: 10px" #label>
            <firstAidOrderDetailList
              :key="deatilListItem.salesdtlid"
              :deatilListItem="deatilListItem as FirstAidOrderOrderDetailListObj"
            />
          </template>
        </up-checkbox>
      </up-checkbox-group>
    </app-pull-refresh>

    <app-empty v-show="!refreshing && !list.length" class="py-7" description="暂无数据" />
    <app-fix-btn text="匹配" @click="matchSubmit" />
  </view>
</template>

<script setup lang="ts">
import card from './components/first-aid-card.vue';
import { useFirstAidOrderDetail } from './composables/use-first-aid-detail';
import firstAidOrderDetailList from './components/first-aid-detail-list.vue';
import type { FirstAidOrderOrderDetailListObj } from './types';
const { fetchEmergencyOrderMatchDetail, fetchEmergencyOrderMatchSubmit, detailItem } =
  useFirstAidOrderDetail();
// 使用分页组合式API
const pagination = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 138,
  },
  fetchEmergencyOrderMatchDetail
);
const {
  list,
  loadmoreConfig,
  refreshing,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  pullRefreshHeight,
} = pagination;

const checkValue = ref([]);
let checkList: any = ref([]);
const checkChange = (val: any) => {
  checkList = ref([]);
  val.forEach((element: any) => {
    console.log('选中项:', element);
    list.value.forEach((listItem: any) => {
      console.log('列表项:', listItem.salesdtlid);
      console.log(element === listItem.salesdtlid);
      if (element === listItem.salesdtlid) {
        checkList.value.push({
          ...listItem,
          checked: true,
        });
        console.log('匹配项:', checkList.value);
      }
    });
  });
};
const matchSubmit = () => {
  // 这里是提交匹配的逻辑
  fetchEmergencyOrderMatchSubmit(checkList.value).then((res: any) => {
    // 提交成功后可以进行一些操作，比如刷新列表
    if (res && res.code === '200') {
      onRefresh();
      checkList.value = [];
      checkValue.value = [];
    }
  });
};
/**
 * 页面生命周期处理
 */
onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style scoped lang="scss">
:deep(.u-checkbox__label-wrap) {
  width: calc(100% - 40px);
}
</style>
