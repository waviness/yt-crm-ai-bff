<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  listItem: any;
  type?: string;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  subscribeClick: [];
  discussClick: [];
  signToSignedClick: [];
}>();

const handleSubscribeClick = (e: Event) => {
  e.stopPropagation();
  emit('subscribeClick');
};

const handleDiscussClick = (e: Event) => {
  e.stopPropagation();
  emit('discussClick');
};

const handleSignClick = (e: Event) => {
  e.stopPropagation();
  emit('signToSignedClick');
};
</script>

<template>
  <view class="list-item bg-white px-10 py-3 mb-2">
    <!-- 用户信息 -->
    <view class="flex items-center">
      <up-avatar :src="listItem.createHeadImgUrl" size="40" shape="circle" />
      <view class="pl-2 flex-1">
        <view class="text-14">{{ listItem.createName }}</view>
        <view class="color-gray-5 text-12">{{ listItem.createTime }}</view>
      </view>
    </view>

    <!-- 话题内容 -->
    <view class="pt-2 text-14">
      <view style="opacity: 0.7">
        <text>{{ listItem.topicTitle }}</text>
        <text class="pl-3 color-main">#{{ listItem.labelName }}</text>
      </view>
      <view class="pt-2">
        {{ listItem.topicContent }}
      </view>
    </view>

    <!-- 操作按钮 -->
    <view v-if="!type" class="pt-10 flex justify-end">
      <!-- 点赞 -->
      <view class="flex items-center mr-6" @click="handleSubscribeClick">
        <app-icon
          name="thumb-up"
          size="small"
          :color="listItem.subscribeList?.length ? 'main' : 'gray'"
        />
        <text
          class="ml-2 text-14"
          :class="listItem.subscribeList?.length ? 'color-main' : 'color-gray-5'"
        >
          {{ listItem.subscribeList?.length || 0 }}
        </text>
      </view>

      <!-- 评论 -->
      <view class="flex items-center mr-6" @click="handleDiscussClick">
        <app-icon
          name="xingzhuang5"
          size="small"
          :color="listItem.discussList?.length ? 'main' : 'gray'"
        />
        <text
          class="ml-2 text-14"
          :class="listItem.discussList?.length ? 'color-main' : 'color-gray-5'"
        >
          {{ listItem.discussList?.length || 0 }}
        </text>
      </view>

      <!-- @人 -->
      <view class="flex items-center" @click="handleSignClick">
        <app-icon
          name="at"
          size="small"
          :color="listItem.signToSignedList?.length ? 'main' : 'gray'"
        />
        <text
          class="ml-2 text-14"
          :class="listItem.signToSignedList?.length ? 'color-main' : 'color-gray-5'"
        >
          {{ listItem.signToSignedList?.length || 0 }}
        </text>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.list-item {
  box-shadow: 0 2px 12px 1px rgb(209 207 207 / 20%);
  border-radius: 8px;
}
</style>
