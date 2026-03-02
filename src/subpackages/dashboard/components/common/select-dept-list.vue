<template>
  <view class="h-full overflow-y-auto">
    <!-- 搜索框 -->
    <view class="px-2 py-2">
      <up-search
        v-model="keyword"
        placeholder="输入关键词"
        shape="round"
        @search="handleSearch"
        @clear="handleSearch"
      />
    </view>

    <!-- 列表内容 -->
    <scroll-view class="popup-body" scroll-y>
      <!-- 事业部 (deptLevel === 1) -->
      <view v-if="+deptLevel === 1">
        <view class="h-80 px-2 bg-light-gray">事业部</view>
        <up-cell
          v-for="(data, index) in sybList"
          :key="`syb-${data.deptId}-${index}`"
          :title="data.deptName"
          :titleStyle="nowData == data.deptId ? 'color: #2271F5;' : ''"
          clickable
          @click="chooseData(data, nowData == data.deptId)"
        >
          <template #right-icon>
            <up-icon name="arrow-right" size="14" color="#969799" />
          </template>
        </up-cell>
      </view>

      <!-- 销售中心 (deptLevel <= 2) -->
      <view v-if="+deptLevel <= 2">
        <view v-if="xszxSearchList.length > 0" class="h-80 px-2 bg-light-gray">销售中心</view>
        <up-cell
          v-for="(data, index) in xszxSearchList"
          :key="`xszx-${data.deptId}-${index}`"
          :title="data.deptName"
          :titleStyle="nowData == data.deptId ? 'color: #2271F5;' : ''"
          clickable
          @click="chooseData(data, nowData == data.deptId)"
        >
          <template #right-icon>
            <up-icon name="arrow-right" size="14" color="#969799" />
          </template>
        </up-cell>
      </view>

      <!-- 销售部 (deptLevel === 3 或 deptLevel === 2 且有数据) -->
      <view v-if="+deptLevel === 3 || (+deptLevel === 2 && bmSearchList.length)">
        <view v-if="bmSearchList.length > 0" class="h-80 line-height-8 px-2 bg-light-gray"
          >销售部</view
        >
        <up-cell
          v-for="(data, index) in bmSearchList"
          :key="`bm-${data.deptId}-${index}`"
          clickable
          @click="chooseData(data, nowData == data.deptId)"
        >
          <template #title>
            <view>
              <text :class="nowData == data.deptId ? 'text-main' : ''">{{ data.deptName }}</text>
              <text v-if="data.parentName" class="text-12 color-gray-5"
                >({{ data.parentName }})</text
              >
            </view>
          </template>
          <template #right-icon>
            <up-icon name="arrow-right" size="14" color="#969799" />
          </template>
        </up-cell>
      </view>

      <!-- 小组 (deptLevel === 4 或 deptLevel <= 3 且有数据) -->
      <view v-if="+deptLevel === 4 || (+deptLevel <= 3 && bmChildSearchList.length)">
        <view v-if="bmChildSearchList.length > 0" class="h-80 line-height-8 px-2 bg-light-gray"
          >小组</view
        >
        <up-cell
          v-for="(data, index) in bmChildSearchList"
          :key="`bmChild-${data.deptId}-${index}`"
          clickable
          @click="chooseData(data, nowData == data.deptId)"
        >
          <template #title>
            <view>
              <text :class="nowData == data.deptId ? 'text-main' : ''">{{ data.deptName }}</text>
              <text v-if="data.parentName" class="text-12 color-gray-5"
                >({{ data.parentName }})</text
              >
            </view>
          </template>
          <template #right-icon>
            <up-icon name="arrow-right" size="14" color="#969799" />
          </template>
        </up-cell>
      </view>
    </scroll-view>
  </view>
</template>

<script lang="ts" setup>
import { useDashboardStore } from '@/store/dashboard';

interface Props {
  deptLevel: number | string;
  nowData?: string | number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'chooseData', data: any): void;
}>();

const dashboardStore = useDashboardStore();

// 搜索关键字
const keyword = ref('');

// 从 store 获取原始数据
const sybOriginList = computed(() => dashboardStore.sybOriginList || []);
const xszxOriginList = computed(() => dashboardStore.xszxOriginList || []);
const bmList = computed(() => dashboardStore.bmList || []);
const bmChildList = computed(() => dashboardStore.bmChildList || []);

// 过滤后的列表
const sybList = ref<any[]>([]);
const xszxSearchList = ref<any[]>([]);
const bmSearchList = ref<any[]>([]);
const bmChildSearchList = ref<any[]>([]);

// 搜索逻辑
const handleSearch = () => {
  const kw = keyword.value.trim();

  if (!kw) {
    // 无关键词时显示全部
    xszxSearchList.value = [...xszxOriginList.value];
    bmSearchList.value = [...bmList.value];
    bmChildSearchList.value = [...bmChildList.value];
    return;
  }

  // 过滤销售中心（使用 deptId 和 deptName）
  xszxSearchList.value = xszxOriginList.value.filter(
    (item: any) => item.deptName?.includes(kw) || item.deptId?.toString().includes(kw)
  );

  // 过滤部门
  bmSearchList.value = bmList.value.filter(
    (item: any) => item.deptName?.includes(kw) || item.deptId?.toString().includes(kw)
  );

  // 过滤子部门
  bmChildSearchList.value = bmChildList.value.filter(
    (item: any) => item.deptName?.includes(kw) || item.deptId?.toString().includes(kw)
  );
};

// 选择数据
const chooseData = async (data: any, isSelected: boolean = false) => {
  if (isSelected) return;
  try {
    // await CommonService.crmUserClick({
    //   catalogType: 605,
    //   catalogTypeName: '查数据',
    //   menuId: 605015,
    //   menuName: data.deptId,
    //   menuOperation: data.deptName,
    //   operationType: 1,
    // });
  } catch (e) {
    console.log('埋点方法不存在，跳过');
  }
  emit('chooseData', { ...data, justChangeData: +props.deptLevel === +data.deptLevel });
};

// 监听 store 数据变化，同步到本地列表
watch(
  sybOriginList,
  val => {
    sybList.value = JSON.parse(JSON.stringify(val || []));
  },
  { immediate: true }
);

watch(
  xszxOriginList,
  val => {
    xszxSearchList.value = JSON.parse(JSON.stringify(val || []));
  },
  { immediate: true }
);

watch(
  bmList,
  val => {
    bmSearchList.value = JSON.parse(JSON.stringify(val || []));
  },
  { immediate: true }
);

watch(
  bmChildList,
  val => {
    bmChildSearchList.value = JSON.parse(JSON.stringify(val || []));
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.h-80 {
  line-height: 80rpx;
}
</style>
