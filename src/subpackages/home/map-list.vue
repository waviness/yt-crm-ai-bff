<template>
  <view>
    <up-sticky style="top: 0">
      <map-list-pop
        :formData="filterObj"
        @confirm="handleFilterChange"
        @reset="handleFilterReset"
      />
    </up-sticky>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <view class="px-10 pt-10">
        <view
          v-for="(item, index) in list"
          @click="itemClick(item, index)"
          :key="index"
          class="flex pt-1 item-center bg-white mb-10"
        >
          <view class="list-item flex-5 px-2">
            <view class="color-gray-4">{{ item.creDate }}</view>
            <view class="address py-2 text-14">{{ item.address }}</view>
            <view class="pt-1">
              <up-tag
                :text="`${item.userId}/${item.userName}`"
                type="primary"
                plain
                plainFill
                borderColor="transparent"
              ></up-tag>
            </view>
            <view class="py-2 flex">
              <view
                class="flex items-center pl-2"
                :class="item.starNum ? 'color-main' : 'color-gray-5'"
                @click.stop="likeClick(item)"
              >
                <app-icon
                  size="small"
                  name="thumb-up"
                  :color="item.starNum ? '#2271F5' : '#a3a3a3'"
                ></app-icon>
                <text class="px-2">{{ item.starNum }}</text>
              </view>
              <view
                class="flex items-center ml-2 pr-2"
                :class="item.visitNum ? 'color-main' : 'color-gray-5'"
              >
                <app-icon
                  size="small"
                  name="rizhi_log"
                  :color="item.visitNum ? '#2271F5' : '#a3a3a3'"
                ></app-icon>
                <text class="px-2">{{ item.visitNum }}</text>
              </view>
            </view>
          </view>
          <up-icon class="pr-2" size="20" name="arrow-right" />
        </view>
        <app-empty v-show="!list.length && !refreshing" class="py-7" description="暂无数据" />
      </view>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import mapListPop from './components/map-list-pop.vue';
import { useMapList } from './composables/use-map-list';
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  filterObj,
  handleFilterChange,
  handleFilterReset,
  itemClick,
  likeClick,
  routeQuery,
} = useMapList();
onLoad(async (options: any) => {
  routeQuery.value = options;
  filterObj.value = {
    startTime: routeQuery.value.start || '',
    endTime: routeQuery.value.end || '',
    user: routeQuery.value.user || '',
    keyword: '',
  };
  await calcPullRefreshHeight();
  await onRefresh();
});
</script>

<style lang="scss" scoped></style>
