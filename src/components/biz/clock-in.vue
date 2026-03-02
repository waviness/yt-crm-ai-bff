<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue';
import { useAmapLocation } from '@/composables/use-amap-location';

// ==================== 类型定义 ====================
interface IProps {
  modelValue: boolean;
  detailClock?: string | boolean | number;
  clickOnly?: boolean;
  visitDate?: string;
}

interface ClockInItem {
  cciId: string | number;
  address: string;
  credate: string;
  [key: string]: any;
}

// ==================== 常量定义 ====================
const TAB_DIRECT_CLOCK = 0; // 直接打卡
const TAB_RELATED_EXISTING = 1; // 关联已有
const POPUP_HEIGHT_OFFSET = 148; // 弹窗高度偏移量

// ==================== Props & Emits ====================
const props = withDefaults(defineProps<IProps>(), {
  detailClock: '',
  clickOnly: false,
  visitDate: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'adressOnConfirm', item: ClockInItem): void;
  (e: 'addressChoose', val: any): void;
  (e: 'adressCancel'): void;
}>();

// ==================== 响应式状态 ====================
// 弹窗 ref
const popupRef = ref<any>(null);

// 激活的 tab
const activeTab = ref(props.clickOnly ? TAB_DIRECT_CLOCK : TAB_RELATED_EXISTING);

// 搜索关键词
const recordSearch = ref('');

// 标记是否正在处理内部关闭（避免 watch 重复关闭）
const isClosing = ref(false);

// ==================== 计算属性 ====================
// tab 列表
const tabList = computed(() => [
  { name: '直接打卡' },
  { name: props.clickOnly ? '打卡记录' : '关联已有' },
]);

// ==================== Composables ====================
// 使用地图 composable
const {
  locationList,
  nowChooseId,
  nowChooseObj,
  lnglatXY,
  addressValue,
  wxRegister,
  onSearch: amapOnSearch,
  nowChooseClick,
  sureClick,
  mapLoading,
  locationPermissionLoading,
  // #ifdef H5
  destroyMap,
  // #endif
  // #ifdef MP-WEIXIN
  mapMarkers,
  mapCenterLng,
  mapCenterLat,
  onMarkerTap,
  // #endif
} = useAmapLocation();

/**
 * 获取打卡信息列表
 */
const fetchDataList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const params = {
    detailFlag: false,
    startTime: props.visitDate ? props.visitDate.slice(0, 10) + ' 00:00:00' : '',
    endTime: props.visitDate ? props.visitDate.slice(0, 10) + ' 23:59:59' : '',
    pageNum,
    pageSize,
    keyword: recordSearch.value,
    type: 1,
  };
  const res = await CustomerFollowService.getCrmClockIn(params);
  return {
    list: res.list || [],
    total: res.total || 0,
    hasNextPage: res.hasNextPage ?? res.list.length >= pageSize,
  };
};

const pagination = usePagination<any>(
  {
    pageSize: 20,
    toolBarHeight: 220, // 顶部固定内容的高度
  },
  fetchDataList
);
const { list, refreshing, loadmoreConfig, pullRefreshHeight, onRefresh, onLoadMore } = pagination;

// 初始化弹窗高度
const windowInfo = uni.getWindowInfo();
pullRefreshHeight.value = `${windowInfo.windowHeight * 0.9 - POPUP_HEIGHT_OFFSET}px`;

// ==================== 工具函数 ====================
/**
 * 关闭弹窗（统一方法）
 */
const closePopup = () => {
  popupRef.value?.close();
};

// ==================== 业务逻辑函数 ====================
/**
 * 初始化地图
 */
const initMap = async () => {
  // #ifdef H5
  if (typeof destroyMap === 'function') {
    destroyMap();
  }
  // #endif

  try {
    await wxRegister('click');
  } catch (error) {
    console.error('地图初始化失败:', error);
    showToast('定位失败，请手动搜索位置');
  }
};

/**
 * 清理资源
 */
const cleanupResources = () => {
  // #ifdef H5
  if (typeof destroyMap === 'function') {
    destroyMap();
  }
  // #endif
  nowChooseId.value = '';
};

/**
 * Tab 切换
 */
const handleTabChange = async (e: { index: number }) => {
  activeTab.value = e.index;
  if (activeTab.value === TAB_DIRECT_CLOCK) {
    initMap();
  } else if (activeTab.value === TAB_RELATED_EXISTING && list.value.length === 0) {
    onRefresh();
  }
};

/**
 * 已有打卡信息选择
 */
const handleConfirm = (item: ClockInItem) => {
  emit('adressOnConfirm', item);
  closePopup();
};

/**
 * 立即打卡确定选择
 */
const handleChoose = async () => {
  if (!nowChooseObj.value) {
    showToast('请选择打卡位置');
    return;
  }

  try {
    if (props.clickOnly) {
      await sureClick();
      closePopup();
    } else {
      const cciId = await sureClick();
      emit('addressChoose', {
        addressID: cciId,
        addressDetail: `${nowChooseObj.value!.name} - ${nowChooseObj.value!.pname}${nowChooseObj.value!.cityname}${nowChooseObj.value!.adname}${nowChooseObj.value!.address}`,
      });
      closePopup();
    }
  } catch (error) {
    console.error('打卡失败:', error);
    showToast('打卡失败，请重试');
  }
};

/**
 * 取消按钮点击处理
 */
const handleCancel = () => {
  closePopup();
  emit('adressCancel');
};

/**
 * 弹窗关闭处理（点击遮罩或关闭按钮）
 */
const handlePopupClose = () => {
  if (isClosing.value) return;

  isClosing.value = true;

  // 重置状态
  activeTab.value = props.clickOnly ? TAB_DIRECT_CLOCK : TAB_RELATED_EXISTING;
  addressValue.value = '';
  recordSearch.value = '';
  cleanupResources();

  // 更新 modelValue，触发父组件状态同步
  emit('update:modelValue', false);

  // 延迟重置标记，确保 watch 能正确处理
  nextTick(() => {
    isClosing.value = false;
  });
};

/**
 * 弹窗状态变化处理（监听 change 事件）
 */
const handlePopupChange = (e: { show: boolean; type: string }) => {
  if (!e.show) {
    handlePopupClose();
  }
};

/**
 * 搜索处理
 */
const handleLocationSearch = () => {
  amapOnSearch();
};

const handleRecordSearch = () => {
  onRefresh();
};

// ==================== 生命周期和监听器 ====================
// 监听父组件状态变化
watch(
  () => props.modelValue,
  async newVal => {
    if (newVal) {
      await nextTick();
      popupRef.value?.open();

      // 重置状态
      activeTab.value = props.clickOnly ? TAB_DIRECT_CLOCK : TAB_RELATED_EXISTING;
      recordSearch.value = '';
      addressValue.value = '';

      // 初始化数据
      if (activeTab.value === TAB_DIRECT_CLOCK) {
        initMap();
      } else if (activeTab.value === TAB_RELATED_EXISTING && list.value.length === 0) {
        onRefresh();
      }
    } else {
      // 需要隐藏弹窗（由外部控制关闭）
      if (!isClosing.value && popupRef.value) {
        popupRef.value.close();
      }
    }
  },
  { immediate: true }
);

// 组件卸载时清理
onUnmounted(() => {
  cleanupResources();
});
</script>

<template>
  <uv-popup ref="popupRef" mode="bottom" :round="16" closeable @change="handlePopupChange">
    <view class="flex flex-col h-90vh">
      <!-- 标题 -->
      <view class="text-16px font-bold text-center pt-4 pb-2">
        {{ clickOnly ? '立即打卡' : '打卡信息选择' }}
      </view>

      <!-- Tabs -->
      <app-tabs :current="activeTab" :list="tabList" @change="handleTabChange" />

      <!-- 搜索框 -->
      <app-search
        v-if="activeTab === 0"
        v-model="addressValue"
        placeholder="搜索位置"
        @input="handleLocationSearch"
      />
      <app-search
        v-else
        v-model="recordSearch"
        placeholder="搜索打卡记录"
        @input="handleRecordSearch"
      />

      <!-- 日期提示 -->
      <text v-if="activeTab === 1 && visitDate" class="px-3 text-12px color-danger block py-1">
        拜访时间：{{ visitDate }} (仅能关联拜访日期当日的打卡信息)
      </text>

      <!-- 关联已有打卡记录 -->
      <view v-if="activeTab === 1" class="flex-1 min-h-0">
        <app-pull-refresh
          :refreshing="refreshing"
          :loadmoreProps="loadmoreConfig"
          :pullRefreshHeight="pullRefreshHeight"
          @refresh="onRefresh"
          @loadmore="onLoadMore"
        >
          <view class="px-2 pt-10">
            <view
              v-for="(item, index) in list"
              :key="index"
              class="px-2 py-3 border-b-1 border-b-solid border-[#ebedf0]"
              @click="handleConfirm(item)"
            >
              <view :class="['text-14', detailClock === item.cciId ? 'color-main' : '']">
                {{ item.cciId }}/{{ item.address }}
                <text class="text-12 color-gray-3 mt-1">({{ item.credate }})</text>
              </view>
            </view>
            <app-empty v-if="!refreshing && !list.length" class="py-7" description="暂无数据" />
          </view>
        </app-pull-refresh>
      </view>

      <!-- 直接打卡地图区域 -->
      <view v-else class="flex flex-col h-[calc(100%-220px)]">
        <!-- H5端：使用div容器，高德地图直接操作DOM -->
        <!-- #ifdef H5 -->
        <view id="container" class="h-[40%] relative overflow-hidden">
          <app-local-loading :show="locationPermissionLoading" text="请求定位权限中..." />
          <app-local-loading
            :show="!locationPermissionLoading && mapLoading"
            text="地图加载中..."
          />
        </view>
        <!-- #endif -->

        <!-- 小程序端：使用uni-app map组件 -->
        <!-- #ifdef MP-WEIXIN -->
        <view class="h-[40%] relative overflow-hidden">
          <app-local-loading :show="locationPermissionLoading" text="请求定位权限中..." />
          <map
            id="amap-container"
            :longitude="mapCenterLng"
            :latitude="mapCenterLat"
            :scale="15"
            :show-location="true"
            :markers="mapMarkers"
            :enable-poi="true"
            class="h-full w-full"
            style="width: 100%; height: 100%"
            @markertap="onMarkerTap"
          ></map>
          <!-- 使用 cover-view 覆盖地图logo区域（腾讯地图字样在右下角） -->
          <cover-view
            class="absolute right-0 bottom-0"
            style="
              width: 180rpx;
              height: 80rpx;
              background: rgb(255 255 255 / 80%);
              backdrop-filter: blur(4px);
              border-top-left-radius: 8px;
            "
          ></cover-view>
        </view>
        <!-- #endif -->

        <scroll-view class="h-[60%]" scroll-y>
          <up-radio-group v-model="nowChooseId">
            <up-cell-group>
              <up-cell
                v-for="item in locationList"
                :key="item.id"
                :name="item.id"
                clickable
                @click="nowChooseClick(item)"
              >
                <template #title>
                  <view class="font-bold">{{ item.name }}</view>
                  <view class="text-12px color-gray-4">
                    -- {{ item.pname + item.cityname + item.adname + item.address }}
                  </view>
                </template>
                <template #right-icon>
                  <up-radio :name="item.id" />
                </template>
              </up-cell>
            </up-cell-group>
          </up-radio-group>
        </scroll-view>
      </view>
      <!-- 底部按钮 -->
      <app-bottom-actions v-if="activeTab === 0" class="block m-4" :fixed="false">
        <app-action-btn class="flex-1" text="取消" @click="handleCancel" />
        <app-action-btn class="flex-1" type="primary" text="确定" @click="handleChoose" />
      </app-bottom-actions>
    </view>
  </uv-popup>
</template>
