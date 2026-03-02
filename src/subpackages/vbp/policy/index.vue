<script setup lang="ts">
import { useVbpPolicy } from './composables/use-vbp-policy';
import PolicyFilterPop from './components/policy-filter-pop.vue';
import VbpItem from './components/vbp-item.vue';

interface PolicyItem {
  recordId: string;
  customId: string;
  customName: string;
  creDate: string;
  visitFinishDate?: string;
}

interface FormData {
  custom: string;
  start: string;
  end: string;
}

interface StatusItem {
  name: string;
}

const { getPolicyList } = useVbpPolicy();

const loading = ref(false);

const current = ref(0);
const statusList = ref<StatusItem[]>([{ name: '未处理' }, { name: '已处理' }]);
const formData = ref<FormData>({
  custom: '',
  start: '',
  end: '',
});
const list = ref<PolicyItem[]>([]);

const getDataList = async () => {
  const { custom, start, end } = formData.value;
  const params = {
    custom,
    start,
    end,
    type: current.value,
  };

  list.value = [];
  loading.value = true;
  const res = await getPolicyList(params);
  list.value = res || [];
  loading.value = false;
};

const onFilterChange = (filterVal: FormData) => {
  formData.value = filterVal;
  getDataList();
};

const onActiveChange = ({ index }: { index: number }) => {
  current.value = index;
  getDataList();
};

const onRefresh = () => {
  getDataList();
};

const toDetail = (item: PolicyItem) => {
  const appStore = useAppStore();
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.vbpPolicyDetail, {
    statusType: current.value,
    id: item.recordId,
  });
};

onMounted(() => {
  getDataList();
});

onShow(() => {
  const appStore = useAppStore();
  if (appStore.hadDoneOnDetail) {
    getDataList();
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <policy-filter-pop :formData="formData" @confirm="onFilterChange" />
      <app-tabs
        :current="current"
        :list="statusList"
        @change="({ index }: { index: number }) => onActiveChange(index)"
      />
    </up-sticky>
    <vbp-item
      class="block mt-2"
      v-for="(item, idx) in list"
      :key="idx"
      :active="current"
      :data="item"
      @click="toDetail(item)"
    />
    <app-empty v-if="!loading && !list.length" class="py-7" description="暂无数据" />
  </view>
</template>

<style lang="scss" scoped>
:deep(.up-tab--active) {
  font-weight: bold;
}
</style>
