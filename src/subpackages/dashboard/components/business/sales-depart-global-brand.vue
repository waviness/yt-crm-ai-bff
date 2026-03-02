<template>
  <view class="brand-card-warp mb-2">
    <view
      class="brand-card-warp-header flex flex-justify-between text-14 color-gray-4 px-3"
      @click="brandClick"
    >
      <!-- <app-icon name="ytcrm-pinpaijihe" size="14" /> -->
      <view class="flex flex-items-center">
        <app-icon name="pinpaijihe" size="14" />
        <text class="pl-2">品牌集合看板</text>
      </view>
      <up-icon name="arrow-right" size="14"></up-icon>
    </view>
    <view class="brand-card-warp-content position-relative px-4 pb-4">
      <up-loading-icon v-if="loading"></up-loading-icon>
      <view
        v-if="!loading"
        class="brand-card-warp-content_header px-4 text-14 flex flex-justify-between flex-items-center"
      >
        <text class="color-gray-5 font-bold">{{ brandHeaderObj.title }}</text>
        <text class="color-main-3 font-bold">{{ brandHeaderObj.value }}</text>
        <text class="color-main-3 font-bold">{{ brandHeaderObj.increment }}</text>
      </view>
      <view
        v-if="brandList.length === 3 && !loading"
        class="brand-card-warp-content_card pt-10 flex"
      >
        <view class="flex-5 flex bg-gray-10 border-rd-1 color-white text-14">
          <view class="flex-1 bg-main-3 border-rd-1 flex flex-col flex-items-center justify-center">
            <text>{{ brandList[0].title }}</text>
            <text class="pt-4">{{ brandList[0].value }}万元</text>
          </view>
          <view class="flex-1 flex flex-col">
            <view
              class="flex-3 bg-gray-9 border-rd-1 flex flex-col flex-items-center justify-center"
            >
              <text>{{ brandList[1].title }}</text>
              <text class="pt-4">{{ brandList[1].value }}万元</text>
            </view>
            <view class="flex-2 color-black-2 flex flex-col flex-items-center justify-center">
              <text>{{ brandList[2].title }}</text>
              <text class="pt-4">{{ brandList[2].value }}万元</text>
            </view>
          </view>
        </view>
        <view class="flex-2 flex flex-col pl-4 justify-end color-gray-5">
          <view class="flex pb-10" v-for="(brand, index) in brandList" :key="index">
            <view :class="'cricle-' + (index + 1)" class="cricle"></view>
            <view class="flex flex-col pl-2">
              <text class="text-14 pb-1">{{ brand.title }}</text>
              <text class="text-12" :class="getColorClass(brand.increment)">{{
                brand.increment
              }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getColorClass } from '@/utils/number';
import type { EntryObj } from '../../types';
const { formatPercentage, formatTenThousand } = useFormatter();
interface IProps {
  entryObj: EntryObj;
}

const props = defineProps<IProps>();
const emit = defineEmits(['brandClick']);
const dashboardStore = useDashboardStore();

const brandHeaderObj = reactive({
  title: '',
  value: '',
  increment: '',
});
interface BrandItem {
  title: string;
  value: string;
  increment: string;
}
const brandList = ref<BrandItem[]>([]);
const loading = ref(false);
const brandClick = () => {
  emit('brandClick', props.entryObj);
};
const _getDeptTotalStat = async () => {
  try {
    const res = await DashboardService.getDeptTotalStat({
      date: dashboardStore.dateTime,
      deptId: props.entryObj.deptId,
    });
    if (res.code === '200') {
      brandHeaderObj.title = 'TOP品牌';
      brandHeaderObj.value = formatTenThousand(res.data.yearAmount);
      brandHeaderObj.increment = formatPercentage(res.data.yearOnPercent);
    }
  } catch (error) {
    console.error('获取部门统计数据失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  }
};
const _getStatListByDept = async () => {
  loading.value = true;
  try {
    const res = await DashboardService.getStatListByDept({
      date: dashboardStore.dateTime,
      deptId: props.entryObj.deptId,
      pageFlag: 0,
      queryTop3Flag: 0,
    });
    if (res.code === '200') {
      const list = res.data.list;
      brandList.value = list.map((val: any) => {
        return {
          title: val.brandName,
          value: formatTenThousand(val.yearAmount),
          increment: formatPercentage(val.yearOnPercent),
        };
      });
    }
  } catch (error) {
    console.error('获取部门统计列表失败:', error);
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    });
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  _getDeptTotalStat();
  _getStatListByDept();
});
</script>
<style lang="scss">
.brand-card-warp {
  border-radius: 30px;
  border: 1px solid #e7e7e7;

  &-header {
    padding: 15px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ebedf0;
  }

  &-content {
    min-height: 60px;

    &_header {
      height: 52px;
      background: #f3f3f3;
      border-radius: 16px;
    }

    &_card {
      height: 220px;

      .cricle {
        width: 6px;
        height: 6px;
        border-radius: 3px;
        margin-top: 6px;

        &-1 {
          background: #3561f2;
        }

        &-2 {
          background: #b8b8bb;
        }

        &-3 {
          background: #eee;
        }
      }
    }
  }
}
</style>
