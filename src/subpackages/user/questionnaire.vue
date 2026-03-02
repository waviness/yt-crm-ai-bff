<script setup lang="ts">
/**
 * 问卷列表页面
 * 展示用户问卷列表，支持跳转到问卷详情
 */
/**
 * 问卷项接口
 */
interface QuestionnaireItem {
  title: string;
  time: string;
  status: number;
  csDocId: number;
}

// 响应式数据
const questionnaireList = ref<QuestionnaireItem[]>([]);
const appStore = useAppStore();
/**
 * 跳转到问卷详情
 */
const goToDetail = (item: QuestionnaireItem) => {
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.questDetail, { id: item.csDocId, status: item.status });
};

/**
 * 返回上一页
 */
const goBack = () => {
  router.back();
};

/**
 * 获取问卷状态文本
 */
const getStatusText = (status: number): string => {
  return +status === 2 ? '已填写' : '未填写';
};

/**
 * 获取问卷列表
 */
const fetchQuestionnaireList = async () => {
  const res = await QuestionnaireService.getDocUser({ csDocId: '' });
  // 将后端数据转换为前端需要的格式
  questionnaireList.value = res.map((item: any) => ({
    title: item.title,
    time: item.releaseTime,
    status: item.status,
    csDocId: item.csDocId,
  }));
};

onMounted(() => {
  appStore.setHadDoneOnDetail(false);
  fetchQuestionnaireList();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    appStore.setHadDoneOnDetail(false);
    fetchQuestionnaireList();
  }
});
</script>

<template>
  <view>
    <view class="p-10 bg-light-gray min-h-screen">
      <view v-if="questionnaireList.length">
        <view
          v-for="item in questionnaireList"
          :key="item.csDocId"
          class="flex justify-between items-center p-10 mb-3 bg-white rounded-3 shadow-view"
          @click="goToDetail(item)"
        >
          <view class="flex-1">
            <view class="text-14 font-semibold color-[#333] mb-1">{{ item.title }}</view>
            <view class="text-12 color-gray-4">{{ item.time }}</view>
          </view>
          <app-tag
            :type="+item.status === 2 ? 'danger' : 'success'"
            :name="getStatusText(item.status)"
            :fontSize="12"
          />
        </view>
      </view>

      <!-- 没有问卷时显示空状态 -->
      <view v-else>
        <app-empty class="mt-6 bg-white" description="暂无数据" />
        <app-bottom-actions :count="1">
          <app-action-btn text="返回" type="default" @click="goBack" />
        </app-bottom-actions>
      </view>
    </view>
  </view>
</template>
