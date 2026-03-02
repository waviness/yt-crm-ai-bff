<template>
  <view>
    <app-watermark> </app-watermark>
    <app-page v-if="!isInnerFlag && entryObj.deptId">
      <salesDepartIndex
        :entryObj="entryObj"
        @chooseDeptData="chooseDeptData"
        :isShowFlag="isShowFlag"
      />
    </app-page>
    <salesDepartIndex
      class="pb-100"
      v-if="isInnerFlag && entryObj.deptId"
      :entryObj="entryObj"
      @chooseDeptData="chooseDeptData"
      :isShowFlag="isShowFlag"
    />
  </view>
</template>
<script setup lang="ts">
import salesDepartIndex from './components/sales-depart-index.vue';
import { useDashboardStore } from '@/store/dashboard';
const dashboardStore = useDashboardStore();
import type { EntryObj } from './types';
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  titleName: '',
  deptLevel: '',
});
let isShowFlag = ref(false); // 是否显示重点客户/品种以及逾期应收卡片
let isInnerFlag = ref(false); // 是否内部页面
const chooseDeptData = (val: any) => {
  if (val.justChangeData) {
    entryObj.value = { deptId: '', deptName: '', titleName: '', deptLevel: '' };
    nextTick(async () => {
      entryObj.value = {
        deptLevel: val.deptLevel,
        deptId: val.deptId,
        deptName: val.deptName,
      };
      await initData(entryObj.value);
      console.log('chooseDeptData', entryObj.value);
    });
    return;
  }
  const routeConfig: Record<number, any> = {
    1: {
      path: RouteMap.salesLineRise,
      query: {
        deptLevel: dashboardStore.sybOriginList[0]?.deptLevel,
        deptId: dashboardStore.sybOriginList[0]?.deptId,
        deptName: dashboardStore.sybOriginList[0]?.deptName,
        isInner: '1',
      },
    },
    2: {
      path: RouteMap.salesLineRise,
      query: {
        deptLevel: dashboardStore.xszxOriginList[0]?.deptLevel,
        deptId: dashboardStore.xszxOriginList[0]?.deptId,
        deptName: dashboardStore.xszxOriginList[0]?.deptName,
        isInner: '1',
      },
    },
    3: {
      path: RouteMap.salesLineRise,
      query: {
        deptLevel: dashboardStore.bmList[0]?.deptLevel,
        deptId: dashboardStore.bmList[0]?.deptId,
        deptName: dashboardStore.bmList[0]?.deptName,
        isInner: '1',
      },
    },
    4: {
      path: RouteMap.salesLineRise,
      query: {
        deptLevel: dashboardStore.bmChildList[0]?.deptLevel,
        deptId: dashboardStore.bmChildList[0]?.deptId,
        deptName: dashboardStore.bmChildList[0]?.deptName,
        isInner: '1',
      },
    },
  };
  const config = routeConfig[val.deptLevel];
  if (config) {
    const currentRoute: any = router.getCurrentRoute();
    // 只在路径不同时才进行跳转
    if (currentRoute.path !== config.path) {
      router.push(config.path, { ...config.query });
    }
  }
};
const initData = (decodedOpts: any) => {
  entryObj.value.deptLevel = decodedOpts.deptLevel;
  isInnerFlag.value = !!+decodedOpts.isInner;
  switch (+decodedOpts.deptLevel) {
    case 0:
      isShowFlag.value = false;
      entryObj.value.deptId = '431';
      entryObj.value.deptName = '英特集团';
      entryObj.value.titleName = '英特集团';
      break;
    case 1:
      entryObj.value.deptId = decodedOpts.deptId;
      entryObj.value.deptName = decodedOpts.deptName;
      entryObj.value.titleName = decodedOpts.deptName;
      isShowFlag.value = decodedOpts.deptId === '449';
      break;
    case 4:
      entryObj.value.deptId = decodedOpts.deptId;
      entryObj.value.deptName = decodedOpts.deptName;
      entryObj.value.titleName = decodedOpts.deptName;
      isShowFlag.value = false;
      break;
    default:
      isShowFlag.value = true;
      entryObj.value.deptId = decodedOpts.deptId;
      entryObj.value.deptName = decodedOpts.deptName;
      entryObj.value.titleName = decodedOpts.deptName;
      break;
  }
};
// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  console.log('decodedOpts', decodedOpts);
  if (decodedOpts) {
    initData(decodedOpts);
  }
});
</script>
<style scoped lang="scss"></style>
