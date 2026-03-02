<script setup lang="ts">
import { useBirthdayOperations } from './composables/use-birthday-operations';

defineOptions(SHARED_STYLE_OPTIONS);

const appStore = useAppStore();
const { addUser } = useBirthdayOperations();

// 详情数据
const detailInfo = ref<any>({});

// 部门用户选择
const changeTypeShow = ref(false);
const hasDept = ref(false);
const checkedUsers = ref<string[]>([]);

// 推送至指定人员
const getUsersClick = () => {
  changeTypeShow.value = true;
};

// 确认选择用户
const handleTreeConfirm = (list: string[]) => {
  if (list.length === 0) {
    showToast('未选择推送人');
    return;
  }

  checkedUsers.value = list;
  changeTypeShow.value = false;

  addUser([detailInfo.value], list, () => {
    // 设置标记，通知列表页刷新
    appStore.setHadDoneOnDetail(true);
    uni.navigateBack();
  });
};

// 生命周期
onLoad((options: any) => {
  if (options.data) {
    detailInfo.value = JSON.parse(decodeURIComponent(options.data));
  }
});
</script>

<template>
  <view class="birth-detail h-full bg-light-gray">
    <app-watermark />

    <view class="text-12 pt-10 pb-8 px-10">生日提醒详情</view>

    <!-- 客户姓名 -->
    <view class="detail-item flex items-center justify-between px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">客户姓名</text>
      <text>{{ detailInfo.userName || '-' }}</text>
    </view>

    <!-- 生日 -->
    <view class="detail-item flex items-center px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">生日</text>
      <text class="ml-1 text-12 color-gray-4"> 距下次生日还有 {{ detailInfo.count1 }}天 </text>
      <text class="ml-auto color-main">{{ detailInfo.birthday || '-' }}</text>
    </view>

    <!-- 政治生日 -->
    <view class="detail-item flex items-center px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">政治生日</text>
      <text class="ml-1 text-12 color-gray-4"> 距下次政治生日还有 {{ detailInfo.count2 }}天 </text>
      <text class="ml-auto color-main">
        {{ detailInfo.politicsBirthday || '-' }}
      </text>
    </view>

    <!-- 所在公司 -->
    <view class="detail-item flex items-center justify-between px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">所在公司</text>
      <text>{{ detailInfo.providerName || '-' }}</text>
    </view>

    <!-- 职位 -->
    <view class="detail-item flex items-center justify-between px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">职位</text>
      <text>{{ detailInfo.position || '-' }}</text>
    </view>

    <!-- 分管采购员 -->
    <view class="detail-item flex items-center justify-between px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">分管采购员</text>
      <text>{{ detailInfo.purchaseName || '-' }}</text>
    </view>

    <!-- 分享人 -->
    <view class="detail-item flex items-center justify-between px-4 text-14 bg-white mb-2">
      <text class="color-gray-5">分享人</text>
      <text class="color-main">{{ detailInfo.shareUserName || '-' }}</text>
    </view>

    <!-- 推送按钮 -->
    <view v-if="!detailInfo.shareUserName" class="detail-button">
      <app-action-btn
        type="primary"
        icon="xingzhuangjiehe2"
        :multi="false"
        text="推送附加至"
        @click="getUsersClick"
      />
    </view>

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="handleTreeConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
.birth-detail {
  position: relative;
}

.detail-item {
  height: 44px;
}

.detail-button {
  position: fixed;
  width: 120px;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
}
</style>
