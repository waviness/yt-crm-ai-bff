<script setup lang="ts">
import type { SuggestionItem, ClickInItem } from './composables/use-user-features';
import { useAmapLocation } from '@/composables/use-amap-location';
import { useUserMenu, useUserInfo } from './composables/use-user-features';
import time from '@/utils/time';
import UserCard from './components/user-card.vue';
/**
 * 用户个人中心页面
 * 包含用户信息展示、意见反馈、打卡记录等功能
 */

useInitTabPageSettings();

const userStore = useUserStore();
const appStore = useAppStore();
const departmentStore = useDepartmentStore();

// 使用地图定位 composable 获取天气和位置信息
const { nowWeather, locationCity, wxRegister, locationPermissionLoading } = useAmapLocation();

// 用户功能管理
const userMenuManager = useUserMenu();
const {
  userMenu,
  handleMenuClick,
  suggestionFeature,
  clickInFeature,
  phoneUpdateLogStatus,
  unWriteQuestionnaire,
  shouldShowBadge,
} = userMenuManager;

// 用户信息管理
const userInfoManager = useUserInfo();
const { user } = userInfoManager;

// 意见反馈分页功能
const suggestionPagination = usePagination<SuggestionItem>(
  { pageSize: 10 },
  suggestionFeature.fetchSuggestionList
);

// 打卡记录分页功能 - 使用动态函数以支持搜索和筛选
const fetchClickInListWithFilter = async (params: { pageNum: number; pageSize: number }) => {
  return clickInFeature.fetchClickInList(params);
};

const clickInPagination = usePagination({ pageSize: 20 }, fetchClickInListWithFilter);

// 获取 pullRefreshHeight（用于弹窗高度设置）
const suggestionPullRefreshHeight = suggestionPagination.pullRefreshHeight;
const clickInPullRefreshHeight = clickInPagination.pullRefreshHeight;

// 日历组件引用
const calendarRef = ref<any>(null);

// 意见反馈相关状态
const suggestMsgList = ref<SuggestionItem[]>([]);

// 打卡记录相关状态
const clickInList = ref<ClickInItem[]>([]);

/**
 * 格式化日期范围显示
 */
const formatDateRange = computed(() => {
  if (!clickInFeature.dateRange.value || clickInFeature.dateRange.value.length < 2) {
    return '';
  }
  const [start, end] = clickInFeature.dateRange.value;
  return `${time.format(start, 'MM-dd')} ~ ${time.format(end, 'MM-dd')}(${time.format(start, 'yyyy')})`;
});

/**
 * 格式化打卡时间（去掉最后3个字符）
 */
const formatClickInTime = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr.substring(0, timeStr.length - 3);
};

/**
 * 切换用户复选框状态
 */
const toggleUserCheckbox = (index: number) => {
  const userList = clickInFeature.userDetailList.value;
  if (index >= 0 && index < userList.length) {
    const userId = userList[index].userId;
    const currentIndex = clickInFeature.result.value.indexOf(userId);
    if (currentIndex > -1) {
      clickInFeature.result.value.splice(currentIndex, 1);
    } else {
      clickInFeature.result.value.push(userId);
    }
  }
};

/**
 * 菜单点击处理
 */
const cellClick = (item: any) => {
  handleMenuClick(item);

  // 如果是查看意见反馈，则刷新数据
  if (item.keyword === 'querySuggest') {
    suggestionPagination.onRefresh();
  }
  if (item.keyword === 'getClickIn') {
    clickInPagination.onRefresh();
  }
};

// 监听意见反馈列表数据变化
watch(
  () => suggestionPagination.list,
  newList => {
    suggestMsgList.value = [...newList.value] as SuggestionItem[];
  },
  { deep: true, immediate: true }
);

// 监听打卡记录列表数据变化
watch(
  () => clickInPagination.list,
  newList => {
    clickInList.value = [...newList.value] as ClickInItem[];
  },
  { deep: true, immediate: true }
);

// 监听搜索关键词变化，刷新打卡记录
watch(
  () => clickInFeature.addressSearchValue.value,
  () => {
    if (clickInFeature.clickInShow.value) {
      clickInPagination.onRefresh();
    }
  }
);

// 监听日期范围变化，刷新打卡记录
watch(
  () => clickInFeature.dateRange.value,
  () => {
    if (clickInFeature.clickInShow.value && clickInFeature.dateRange.value.length === 2) {
      clickInPagination.onRefresh();
    }
  },
  { deep: true }
);

// 监听人员选择变化，刷新打卡记录
watch(
  () => clickInFeature.sureResult.value,
  () => {
    if (clickInFeature.clickInShow.value) {
      clickInPagination.onRefresh();
    }
  },
  { deep: true }
);

/**
 * 页面初始化
 */
onMounted(async () => {
  // 初始化弹窗高度（在页面加载时计算一次即可）
  const windowInfo = uni.getWindowInfo();

  // 意见反馈弹窗：弹窗高度 90vh，没有固定内容
  suggestionPullRefreshHeight.value = `${windowInfo.windowHeight * 0.9}px`;

  // 打卡记录弹窗：弹窗高度 90vh，减去搜索栏
  clickInPullRefreshHeight.value = `${windowInfo.windowHeight * 0.9 - 66}px`;

  // 初始化用户菜单（从 userInfor.resListTree 获取）
  userMenuManager.initUserMenu(userStore.userInfor);

  // 初始化用户信息
  userInfoManager.initUserInfo(userStore.userInfor, appStore.domainUrl);

  // 初始化更新日志状态
  userMenuManager.initUpdateLogStatus();

  // 检查问卷未填写状态
  await userMenuManager.judgeUnWriteQuestionnaire();

  // 获取定位和天气信息（传入空字符串表示不需要显示地图）
  try {
    await wxRegister('');
  } catch (error) {
    console.warn('获取定位和天气信息失败:', error);
    // 定位失败不影响页面正常使用，只记录警告
  }
});
</script>

<template>
  <app-page>
    <user-card
      bgIcon="intl"
      :user="user"
      :nowWeather="nowWeather"
      :locationCity="locationCity"
      :loading="locationPermissionLoading"
      bigBg
    >
    </user-card>
    <up-cell-group customClass="bg-white mt-4">
      <up-cell
        v-for="(item, index) in userMenu"
        :title="item.pmsName"
        is-link
        @click="cellClick(item)"
        :key="index"
      >
        <template #icon>
          <up-icon color="#363636" :name="item.icon" class="mt-1" style="margin-right: 10px" />
        </template>
        <template #right-icon>
          <view
            v-if="item.keyword === 'updateLog' || item.keyword === 'questionServey'"
            class="relative inline-flex items-center"
          >
            <up-icon name="arrow-right" />
            <up-badge
              v-if="shouldShowBadge(item)"
              :isDot="true"
              class="absolute top-[-12rpx] right-[-8rpx]"
            ></up-badge>
          </view>
          <up-icon v-else name="arrow-right" />
        </template>
      </up-cell>
    </up-cell-group>

    <!-- 意见反馈弹窗 -->
    <up-modal
      :show="suggestionFeature.suggestionShow.value"
      title="意见反馈"
      @confirm="suggestionFeature.commitSuggestion"
      @cancel="suggestionFeature.suggestionShow.value = false"
      showCancelButton
    >
      <up-textarea v-model="suggestionFeature.suggestMsg.value" placeholder="请输入意见反馈">
      </up-textarea>
    </up-modal>

    <!-- 意见反馈列表弹窗 -->
    <up-popup
      :show="suggestionFeature.suggestMsgShow.value"
      mode="bottom"
      :round="16"
      :customStyle="{ height: '90vh' }"
      class="bg-gray"
      @close="suggestionFeature.suggestMsgShow.value = false"
    >
      <app-pull-refresh
        :refreshing="suggestionPagination.refreshing.value"
        :loadmoreProps="suggestionPagination.loadmoreConfig.value"
        :pullRefreshHeight="suggestionPullRefreshHeight"
        @refresh="suggestionPagination.onRefresh"
        @loadmore="suggestionPagination.onLoadMore"
      >
        <view class="pt-5 px-10 text-12">
          <view
            v-for="(item, index) in suggestMsgList"
            :key="index"
            class="px-1 py-3 mb-10 rounded-2 shadow-view"
          >
            <view
              class="flex justify-between line-height-7 px-1 border-b-1rpx border-b-dashed border-blue-2 color-blue-2"
            >
              <view>时间： {{ formatClickInTime(item.credate) }}</view>
              <view class="color-gray-3 right">ID: {{ item.suggestionid }}</view>
            </view>
            <view class="line-height-5 px-1 pt-10">反馈建议： {{ item.advicemsg }}</view>
            <view class="line-height-5 px-1 pt-10"
              >提出人： {{ item.creId }}/{{ item.creName }}</view
            >
          </view>
        </view>
        <app-empty
          v-if="
            suggestMsgList.length === 0 &&
            suggestionPagination.loadmoreConfig.value.status !== 'loading' &&
            !suggestionPagination.refreshing.value
          "
          class="my-6"
          description="暂无反馈信息，下拉刷新试试~"
        />
      </app-pull-refresh>
    </up-popup>

    <!-- 打卡记录列表弹窗 -->
    <up-popup
      :show="clickInFeature.clickInShow.value"
      mode="bottom"
      :round="16"
      @close="clickInFeature.clickInShow.value = false"
    >
      <view class="h-90vh bg-light-gray">
        <!-- 搜索和日期选择区域 -->
        <view class="flex items-center bg-white">
          <view class="flex-1">
            <app-search
              v-model="clickInFeature.addressSearchValue.value"
              placeholder="请输入搜索关键词"
              clearable
              @input="clickInFeature.handleSearchInput"
              class="mr-2"
            />
          </view>
          <view
            class="w-300 h-68 leading-68rpx text-center bg-[#f7f8fa] rounded mr-10"
            @click="calendarRef?.open()"
          >
            <view class="text-14 color-gray-5">
              {{ formatDateRange || '点击选择时间' }}
            </view>
          </view>
        </view>

        <app-pull-refresh
          :refreshing="clickInPagination.refreshing.value"
          :loadmoreProps="clickInPagination.loadmoreConfig.value"
          :pullRefreshHeight="clickInPullRefreshHeight"
          @refresh="clickInPagination.onRefresh"
          @loadmore="clickInPagination.onLoadMore"
        >
          <view class="p-10 text-12">
            <view
              v-for="(item, index) in clickInList"
              :key="index"
              class="py-3 px-2 mb-10 rounded-2 bg-white"
            >
              <view
                class="flex justify-between line-height-7 px-1 border-b-1rpx border-b-solid border-#efefef color-#1989fa"
              >
                <view>打卡时间： {{ formatClickInTime(item.credate) }}</view>
                <view class="color-gray-3 right">ID: {{ item.cciId }}</view>
              </view>
              <view class="line-height-5 px-1 pt-10">打卡地址： {{ item.address }}</view>
              <view class="line-height-5 px-1 pt-10 flex justify-between">
                <view>打卡经纬度： {{ item.longitude }}/{{ item.latitude }}</view>
                <view> {{ item.creName }}</view>
              </view>
            </view>
          </view>
          <app-empty
            v-if="
              clickInList.length === 0 &&
              clickInPagination.loadmoreConfig.value.status !== 'loading' &&
              !clickInPagination.refreshing.value
            "
            class="my-6"
            description="暂无打卡记录，下拉刷新试试~"
          />
        </app-pull-refresh>

        <!-- 人员选择按钮 -->
        <app-bottom-actions
          v-if="departmentStore.depTreeList && departmentStore.depTreeList.length"
          :count="1"
        >
          <app-action-btn
            :text="
              clickInFeature.sureResult.value.length
                ? `已选${clickInFeature.sureResult.value.length}人`
                : '人员选择'
            "
            type="plain"
            class="block w-200 mx-auto shadow-btn"
            @click="clickInFeature.chooseUser"
          />
        </app-bottom-actions>
      </view>
    </up-popup>

    <!-- 日期选择器 -->
    <app-calendar
      ref="calendarRef"
      mode="range"
      :date="
        clickInFeature.dateRange.value.length === 2
          ? [
              time.format(clickInFeature.dateRange.value[0], time.FORMATS.ISO_DATE),
              time.format(clickInFeature.dateRange.value[1], time.FORMATS.ISO_DATE),
            ]
          : ['', '']
      "
      @confirm="clickInFeature.calendarConfirm"
    />

    <!-- 人员选择弹窗 -->
    <up-popup
      :show="clickInFeature.userListShow.value"
      mode="bottom"
      :round="16"
      closeable
      @close="clickInFeature.userListShow.value = false"
    >
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">人员选择</view>
        <app-search
          v-model="clickInFeature.keywords.value"
          placeholder="搜索"
          @input="clickInFeature.onUserSearch"
          @clear="clickInFeature.onUserSearch"
        />
        <scroll-view
          v-if="clickInFeature.userListContentReady.value"
          class="h-[calc(100%-352rpx)]"
          scroll-y
          enable-flex
        >
          <!-- 加载状态 -->
          <view
            v-if="clickInFeature.userDetailListLoading.value"
            class="flex items-center justify-center py-8"
          >
            <up-loading-icon mode="circle" text="加载中..." textSize="14" />
          </view>
          <!-- 空状态 -->
          <app-empty
            v-else-if="clickInFeature.userDetailList.value.length === 0"
            class="py-8"
            description="暂无人员"
          />
          <!-- 数据列表 -->
          <up-checkbox-group v-else v-model="clickInFeature.result.value" shape="circle">
            <up-cell-group>
              <up-cell
                v-for="(item, index) in clickInFeature.userDetailList.value"
                :key="item.userId"
                clickable
                @click="() => toggleUserCheckbox(index)"
              >
                <template #title>
                  <view
                    :class="[
                      clickInFeature.result.value.includes(item.userId) ? 'color-main' : '',
                      'text-14',
                    ]"
                  >
                    <text>{{ item.userCode || item.userId }}/{{ item.userName }}</text>
                  </view>
                </template>
                <template #right-icon>
                  <up-checkbox :name="item.userId" />
                </template>
              </up-cell>
            </up-cell-group>
          </up-checkbox-group>
        </scroll-view>
        <!-- 内容未准备好时显示加载状态 -->
        <view v-else class="h-[calc(100%-100px)] flex items-center justify-center">
          <up-loading-icon mode="circle" text="加载中..." textSize="14" />
        </view>
        <app-bottom-actions class="block m-4" :count="2" :fixed="false">
          <app-action-btn class="flex-1" text="重置" @click="clickInFeature.cancelUserSelect" />
          <app-action-btn
            class="flex-1"
            text="确定"
            type="primary"
            @click="clickInFeature.confirmUserSelect"
          />
        </app-bottom-actions>
      </view>
    </up-popup>
  </app-page>
</template>
