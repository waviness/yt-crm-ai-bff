<template>
  <view class="pb-100">
    <up-sticky style="top: 0">
      <view class="flex pt-1 items-center bg-white mb-10">
        <view class="flex-5 px-2">
          <view class="color-gray-4">{{ detailShowObj.creDate }}</view>
          <view class="py-2 text-14">{{ detailShowObj.address }}</view>
          <view class="pt-1">
            <up-tag
              :text="`${detailShowObj.userId}/${detailShowObj.userName}`"
              type="primary"
              plain
              plainFill
              borderColor="transparent"
            ></up-tag>
          </view>
          <up-tabbar
            :value="active"
            @change="changeClick"
            :fixed="false"
            :border="false"
            :placeholder="false"
            :safeAreaInsetBottom="false"
          >
            <up-tabbar-item class="flex">
              <template #text>
                <view
                  :class="active === 0 ? 'border-bottom-main' : ''"
                  class="flex items-center py-2"
                >
                  <app-icon
                    class="pl-1"
                    name="thumb-up"
                    size="16"
                    :color="active === 0 ? '#2271F5' : '#a3a3a3'"
                  ></app-icon>
                  <text class="px-2">{{ detailShowObj.starNum }}</text>
                </view>
              </template>
            </up-tabbar-item>
            <up-tabbar-item class="flex">
              <template #text>
                <view
                  :class="active === 1 ? 'border-bottom-main' : ''"
                  class="flex items-center py-2"
                >
                  <app-icon
                    class="pl-1"
                    name="rizhi_log"
                    size="16"
                    :color="active === 1 ? '#2271F5' : '#a3a3a3'"
                  ></app-icon>
                  <text class="px-2">{{ detailShowObj.visitNum }}</text>
                </view>
              </template>
            </up-tabbar-item>
          </up-tabbar>
        </view>
      </view>
    </up-sticky>

    <!-- Virtual Scrolling Container -->
    <view
      class="px-2 bg-white pb-100"
      scroll-y
      :style="{ height: 'calc(100vh - 200px)' }"
      :show-scrollbar="false"
    >
      <view v-if="active === 0" class="pt-2">
        <app-empty description="暂无人员点赞" v-if="!starloading && !starDTOList.length" />
        <view
          class="pa-2 flex"
          v-for="(starDTO, index) in starDTOList"
          :key="starDTO.userId + index"
        >
          <up-avatar :src="domainUrl + starDTO.headImgUrl" fontSize="40" shape="circle" />
          <view class="pl-2 flex flex-col justify-between">
            <text class="text-14">{{ starDTO.userName }}</text>
            <text class="color-gray">{{ starDTO.starDate }}</text>
          </view>
        </view>
      </view>

      <view v-if="active === 1">
        <app-pull-refresh
          :refreshing="refreshing"
          :loadmoreProps="loadmoreConfig"
          :pullRefreshHeight="pullRefreshHeight"
          @refresh="onRefresh"
          @loadmore="onLoadMore"
        >
          <view v-for="item in list" :key="item.cuvId" class="card my-2">
            <view class="header flex justify-between items-center py-10 bg-white">
              <view class="flex items-center px-10">
                <up-tag
                  :type="getTaskTypeTag(item.taskType)"
                  size="mini"
                  plain
                  plainFill
                  borderColor="transparent"
                >
                  {{ getTaskTypeText(item.taskType) }}
                </up-tag>
                <up-tag
                  class="ml-2"
                  :type="getWarmthTypeTag(item.warmthNum)"
                  size="mini"
                  plain
                  plainFill
                  borderColor="transparent"
                >
                  {{ warmthNumOptions[item.warmthNum] }}
                </up-tag>
              </view>
              <text class="color-gray-4 pr-2">{{ item.visitTime }}</text>
            </view>
            <view class="px-10 py-2">
              <view class="text-14">
                {{ item.companyId }}/ {{ item.companyName }}({{
                  getCompanyTypeText(item.companyType)
                }})
              </view>
              <view class="flex">
                <view class="py-2 flex flex-col">
                  <text>客户人员</text>
                  <text :class="getWarmthColor(item.warmthNum)">
                    {{ item.visitUserId }}/{{ item.visitUserName }}
                  </text>
                </view>
                <view class="py-2 flex flex-col pl-4" v-if="item.togetherUserId">
                  <text>协访人</text>
                  <text class="color-main">
                    {{ item.togetherUserId }}/{{ item.togetherUserName }}
                  </text>
                </view>
              </view>
              <view
                v-for="(visit, index) in item.visitMapList"
                :key="visit.labelId + index"
                class="pb-2 flex flex-col"
              >
                <text class="color-gray-4">#{{ visit.labelName }}</text>
                <text> {{ visit.memo }} </text>
              </view>
            </view>
          </view>
          <app-empty
            v-show="!(loadmoreConfig.status === 'loadmore') && !list.length"
            class="py-7"
            description="暂无数据"
          />
        </app-pull-refresh>
      </view>
    </view>

    <app-bottom-actions>
      <up-button
        style="width: 120px"
        v-if="!detailShowObj.isStar"
        shape="circle"
        type="primary"
        @click="opClick"
      >
        <app-icon name="thumb-up" size="20" color="#fff"></app-icon>
      </up-button>
      <up-button v-else style="width: 120px" shape="circle" type="primary" plain @click="opClick">
        <app-icon name="xingzhuangjiehe4" size="20" color="#2271F5"></app-icon>
      </up-button>
    </app-bottom-actions>
  </view>
</template>

<script setup lang="ts">
import { useMapDetail } from './composables/use-map-detail';
const {
  domainUrl,
  detailObj,
  detailShowObj,
  active,
  starloading,
  starDTOList,
  warmthNumOptions,
  getTaskTypeTag,
  getTaskTypeText,
  getWarmthTypeTag,
  getWarmthColor,
  getCompanyTypeText,
  changeClick,
  opClick,
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
} = useMapDetail();
onMounted(async () => {
  Object.assign(detailShowObj, JSON.parse(JSON.stringify(detailObj.value)));
  changeClick(0);
});
</script>

<style lang="scss" scoped>
.border-bottom-main {
  border-bottom: 2px solid #2271f5;
  color: #2271f5;
}

.card {
  border-radius: 10px;
  border: 1px solid #e7e7e7;
  overflow: hidden;
}

.header {
  border-bottom: 1px solid #e5e5e5;
}

/* Virtual Scrolling */
::-webkit-scrollbar {
  display: none;
}

.scroll-view {
  -webkit-overflow-scrolling: touch;
}
</style>
