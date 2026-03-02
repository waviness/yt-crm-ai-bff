<script setup lang="ts">
import { onMounted } from 'vue';
import { usePersonList } from '../composables/use-person-list';
import { useBirthdayOperations } from '../composables/use-birthday-operations';

// 导入默认头像
import defaultAvatar from '@/static/images/default_head/(12).png';

const appStore = useAppStore();
const { updateUser } = useBirthdayOperations();

const { personList, loading, finished, onLoad, resetList, params } = usePersonList();

// 删除人员
const deletePerson = async (data: any) => {
  try {
    await showModal({
      content: `确定移除${data.userName}的所有推送?`,
    });

    await updateUser([data.userId], [], () => {
      // 设置标记，通知主页刷新
      appStore.setHadDoneOnDetail(true);
      resetList();
    });
  } catch (error) {
    console.log('取消删除');
  }
};

// 查看人员详情
const showPersonDetail = (data: any) => {
  uni.navigateTo({
    url: `/subpackages/daily/birthday-reminder/person-detail?data=${encodeURIComponent(JSON.stringify(data))}`,
  });
};

// 暴露方法给父组件
const handleSearch = (keyword: string) => {
  params.value.user = keyword;
  resetList();
};

defineExpose({
  handleSearch,
});

// 生命周期
onMounted(() => {
  resetList();
});
</script>

<template>
  <view class="person-list">
    <scroll-view class="h-full" scroll-y enable-flex @scrolltolower="onLoad">
      <app-empty
        v-if="!loading && !personList.length"
        description="暂无数据"
        class="bg-white pb-4"
      />

      <up-swipe-action v-for="(item, index) in personList" :key="item.userId || index" class="mb-2">
        <up-swipe-action-item
          :options="[{ text: '删除', style: { backgroundColor: '#ea394b' } }]"
          @click="deletePerson(item)"
        >
          <view class="person-card flex items-center bg-white" @click="showPersonDetail(item)">
            <up-avatar :src="defaultAvatar" size="40" shape="circle" class="card-img" />
            <view class="ml-3">
              <view class="text-16 font-bold mb-1">{{ item.userName }}</view>
              <view class="text-12 color-gray-4">/{{ item.userId }}</view>
            </view>
            <view class="ml-auto text-right">
              <view class="text-18 font-bold color-primary">{{ item.count }}条</view>
              <view class="text-12 color-gray-3">已推送信息数</view>
            </view>
          </view>
        </up-swipe-action-item>
      </up-swipe-action>

      <up-loadmore
        v-if="loading || !finished"
        :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
      />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.person-list {
  height: 100%;
  background-color: #f5f6f9;
  margin: 8px 10px;
}

.person-card {
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.2s;

  .card-img {
    border: 1px solid #e9e9e9;
  }

  .color-primary {
    color: #1989fa;
  }

  .color-gray-3 {
    color: #c8c9cc;
  }

  .color-gray-4 {
    color: #969799;
  }
}
</style>
