<script setup lang="ts">
import { ref } from 'vue';
import { useAppStore } from '@/store/app';
import BirthList from './components/birth-list.vue';
import PersonList from './components/person-list.vue';

const appStore = useAppStore();

// Tab
const activeTab = ref(0);
const searchValue = ref('');

// 子组件引用
const birthListRef = ref();
const personListRef = ref();

// Tab配置 - 改为 ref，确保响应式
const tabList = ref([{ name: '生日列表' }, { name: '附加推送至' }]);

// 搜索处理
const handleSearch = () => {
  if (activeTab.value === 0) {
    birthListRef.value?.handleSearch(searchValue.value);
  } else {
    personListRef.value?.handleSearch(searchValue.value);
  }
};

// Tab切换 - 修复参数接收方式
const handleTabChange = (e: { index: number }) => {
  // emit 出来的是 { index: number }，不是直接的 number
  activeTab.value = e.index;
  searchValue.value = '';
};

// 生命周期
onShow(() => {
  // 从详情页返回时刷新数据
  if (appStore.hadDoneOnDetail) {
    handleSearch();
    appStore.setHadDoneOnDetail(false);
  }
});
</script>

<template>
  <view class="birthday h-full">
    <app-watermark />

    <!-- 搜索栏 -->
    <app-search
      v-model="searchValue"
      placeholder="搜索"
      @input="handleSearch"
      class="px-4 py-2 bg-white"
    />

    <!-- Tabs -->
    <app-tabs :list="tabList" :current="activeTab" @change="handleTabChange" />

    <!-- Tab内容 - 改用 v-if，确保组件正确挂载/卸载 -->
    <view class="tab-content">
      <birth-list v-if="activeTab === 0" ref="birthListRef" class="h-full" />
      <person-list v-if="activeTab === 1" ref="personListRef" class="h-full" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.birthday {
  background: #f5f6f9;
}

.tab-content {
  height: calc(100% - 98px);
}
</style>
