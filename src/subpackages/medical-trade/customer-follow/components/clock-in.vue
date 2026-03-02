<script setup lang="ts">
import { ref, watch } from 'vue';
import { CustomerFollowService } from '@/api/customer-follow';

interface IProps {
  showAdressPicker: boolean;
  detailClock?: string;
  clickOnly?: boolean;
  visitDate: string;
}

const props = withDefaults(defineProps<IProps>(), {
  clickOnly: false,
  detailClock: '',
});

const emit = defineEmits(['adressOnConfirm', 'addressChoose', 'adressCancel']);

// 状态
const innerShowAdressPicker = ref(false);
const adressActive = ref(0); // 0: 关联已有, 1: 直接打卡
const addressValue = ref('');

// 标签页列表
const tabList = computed(() => [
  { name: props.clickOnly ? '打卡记录' : '关联已有' },
  { name: '直接打卡' },
]);

// 打卡列表相关
const dataList = ref<any[]>([]);
const page = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);

// 地图定位相关
const locationList = ref<any[]>([]);
const nowChooseId = ref('');
const nowChooseObj = ref<any>(null);
const mapContext = ref<any>(null);

/**
 * 切换tab
 */
const addressActiveChange = async ({ index }: { index: number }) => {
  adressActive.value = index;
  if (index === 1) {
    // 直接打卡，需要定位
    await initMap();
  }
};

/**
 * 初始化地图（使用uni-app的地图API）
 */
const initMap = async () => {
  try {
    showLoading('定位中...');

    // 获取当前位置
    const location = await uni.getLocation({
      type: 'gcj02',
      success: () => {},
    });

    // 使用地图选择位置
    uni.chooseLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      success: res => {
        hideLoading();
        // 直接使用选中的位置
        emit('addressChoose', {
          addressID: `${res.latitude},${res.longitude}`,
          addressDetail: res.address + res.name,
        });
      },
      fail: () => {
        hideLoading();
        showToast('定位失败');
      },
    });
  } catch (error) {
    hideLoading();
    console.error('定位失败', error);
    showToast('定位失败');
  }
};

/**
 * 获取打卡记录列表
 */
const fetchClockInList = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    const visitDate = props.visitDate.slice(0, 10);
    const params = {
      detailFlag: false,
      startTime: `${visitDate} 00:00:00`,
      endTime: `${visitDate} 23:59:59`,
      pageNum: page.value,
      pageSize: 20,
      keyword: addressValue.value,
      type: 1,
    };

    const res = await CustomerFollowService.getCrmClockIn(params);
    if (res.success) {
      const newList = res.data?.list || [];
      if (page.value === 1) {
        dataList.value = newList;
      } else {
        dataList.value = [...dataList.value, ...newList];
      }
      finished.value = !res.data?.hasNextPage;
      if (res.data?.hasNextPage) {
        page.value++;
      }
    }
  } catch (error) {
    console.error('获取打卡记录失败', error);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 搜索
 */
const onSearch = () => {
  page.value = 1;
  dataList.value = [];
  finished.value = false;
  if (adressActive.value === 0) {
    fetchClockInList();
  }
};

/**
 * 下拉刷新
 */
const onRefresh = () => {
  page.value = 1;
  dataList.value = [];
  finished.value = false;
  refreshing.value = true;
  fetchClockInList();
};

/**
 * 上拉加载更多
 */
const onLoadMore = () => {
  if (finished.value || loading.value) return;
  fetchClockInList();
};

/**
 * 选择打卡记录
 */
const selectClockIn = (item: any) => {
  emit('adressOnConfirm', item);
};

/**
 * 取消
 */
const cancel = () => {
  emit('adressCancel');
};

// 监听显示状态
watch(
  () => props.showAdressPicker,
  val => {
    innerShowAdressPicker.value = val;
    if (val) {
      if (props.clickOnly) {
        adressActive.value = 1;
        initMap();
      } else {
        adressActive.value = 0;
        fetchClockInList();
      }
    }
  },
  { immediate: true }
);
</script>

<template>
  <up-popup
    :show="innerShowAdressPicker"
    mode="bottom"
    round="16"
    closeable
    :customStyle="{ height: '90vh' }"
    @close="cancel"
  >
    <view class="h-full flex flex-col">
      <view class="text-16 font-bold text-center py-4">
        {{ clickOnly ? '立即打卡' : '打卡信息选择' }}
      </view>

      <app-tabs :list="tabList" :current="adressActive" @change="addressActiveChange" />

      <up-search v-model="addressValue" placeholder="搜索" @search="onSearch" @input="onSearch" />

      <!-- 关联已有打卡记录 -->
      <view v-if="adressActive === 0" class="flex-1 overflow-hidden">
        <view class="px-3 py-2">
          拜访时间：{{ visitDate }}
          <text class="color-red">(仅能关联拜访日期当日的打卡信息)</text>
        </view>

        <scroll-view
          scroll-y
          class="flex-1"
          @scrolltolower="onLoadMore"
          refresher-enabled
          :refresher-triggered="refreshing"
          @refresherrefresh="onRefresh"
        >
          <app-empty v-if="!loading && !dataList.length" description="暂无打卡记录" />
          <view
            v-for="(item, index) in dataList"
            :key="index"
            class="border-b p-10"
            :class="detailClock === item.cciId ? 'color-main' : ''"
            @click="selectClockIn(item)"
          >
            <text>{{ item.cciId }}/{{ item.address }}</text>
            <text class="ml-1 text-12 color-gray-6">({{ item.credate }})</text>
          </view>
          <up-loadmore
            v-if="loading || dataList.length"
            :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
          />
        </scroll-view>
      </view>

      <!-- 直接打卡提示 -->
      <view v-else class="flex-1 flex items-center justify-center">
        <view class="text-center color-gray-6">
          <view class="mb-3">点击"确定"将打开地图选择位置</view>
          <view class="text-12">请选择准确的打卡位置</view>
        </view>
      </view>
    </view>
  </up-popup>
</template>

<style lang="scss" scoped></style>
