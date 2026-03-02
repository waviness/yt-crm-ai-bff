<script setup lang="ts">
import TaskTitle from './components/task-title.vue';
import TaskPiece from './components/task-piece.vue';
import NoReplyPopup from './components/noreply-popup.vue';
import ReplyItem from './components/reply-item.vue';
import FileItem from './components/file-item.vue';
import { useTaskDetail } from './composables/use-task-detail';

const {
  detail,
  loading,
  replyContent,
  submitLoading,
  knownLoading,
  replyList,
  noReplyList,
  replyRate,
  rateText,
  noReplyshow,
  isMsg,
  detailInfor,
  known,
  submit,
  downloadFile,
  onUrgeReply,
  resend,
  init,
} = useTaskDetail();

onLoad(() => {
  init();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <task-piece :data="detail" :receipt="+detailInfor.type === 2" />
    <view class="bg-white px-10 pb-10 flex justify-between">
      <view class="flex items-center">
        <view class="flex items-center">
          <app-icon name="dixiaqushuijing" class="color-main-3" />
          <text class="ml-1">#{{ detail.csoId || '' }}</text>
        </view>
        <view class="flex items-center pl-10">
          <app-icon
            name="return"
            :class="+detail.isReturn === 1 ? 'color-main-3' : 'color-gray-3'"
          />
          <text class="ml-1">{{ +detail.isReturn === 1 ? '需要回执' : '无需回执' }}</text>
        </view>
      </view>
      <view
        v-if="+detailInfor.type === 1"
        :class="[
          'flex items-center font-bold',
          +detail.useStatus === 1 ? 'color-main-3' : 'color-gray-7',
        ]"
      >
        <view class="w-50px h-17px bg-gray-10 rounded-5px mr-2">
          <view
            :class="['h-full rounded-5px', +detail.useStatus === 1 ? 'bg-main' : 'bg-gray-7']"
            :style="`width: ${+detail.useStatus === 2 ? 100 : replyRate}%`"
          ></view>
        </view>
        {{ rateText }}
      </view>
    </view>
    <task-title title="标题及内容" />
    <view class="bg-white p-10 font-bold">{{ detail.orderTitle }}</view>
    <view class="bg-white p-10 mt-2 color-gray-5">{{ detail.orderContent }}</view>
    <view
      v-if="+detail.isReturn === 1 && +detail.useStatus !== 0 && noReplyList && noReplyList.length"
      class="bg-white flex items-center justify-between px-4 py-10 mt-2"
    >
      <view class="color-gray-5 text-14">未回执</view>
      <view class="flex items-center">
        <view
          class="w-174 h-50 rounded-2px bg-main-3 color-white flex items-center justify-center mr-6"
          @click="onUrgeReply(detail.csoId)"
        >
          <app-icon name="tongzhi" class="mr-2" />
          <view class="font-bold text-12">点击催办</view>
        </view>
        <view @click="noReplyshow = true" class="text-14">{{ noReplyList.length }}人</view>
      </view>
    </view>
    <task-title title="附件" />
    <template v-if="detail.files && detail.files.length">
      <file-item
        v-for="item in detail.files"
        :key="item.index"
        :data="item"
        @download="downloadFile"
      />
    </template>
    <view v-else class="bg-white p-10 color-gray-7">暂无附件</view>
    <template v-if="+detail.useStatus !== 0 && detail.content">
      <task-title title="回执" />
      <view class="bg-white p-10">
        <view class="color-gray-7">{{ detail.callBackTime }}</view>
        <view class="color-gray-5 pt-10">{{ detail.content }}</view>
      </view>
    </template>
    <template
      v-else-if="
        +detailInfor.type === 2 && detail.isReturn && !detail.content && +detail.useStatus !== 0
      "
    >
      <task-title title="回执" />
      <view class="bg-white p-10">
        <up-textarea
          v-model="replyContent"
          placeholder="请输入回执信息"
          :autoHeight="true"
          border="none"
          maxlength="200"
          count
        />
      </view>
    </template>
    <template v-else-if="+detail.useStatus !== 0 && +detailInfor.type === 1">
      <task-title title="回执列表">
        <view v-if="+detail.isReturn === 1">
          已回执 <text class="color-main-3">{{ replyList.length }}</text> 人
        </view>
      </task-title>
      <view v-if="+detail.isReturn === 0" class="bg-white color-gray-5 p-10 min-h-115px">
        无需回执
      </view>
      <app-empty v-else-if="!replyList.length" description="暂无回执" class="bg-white py-7" />
      <reply-item v-for="(item, idx) in replyList" :key="idx" :data="item" />
    </template>
    <app-bottom-actions
      v-if="+detailInfor.type === 2 && detail.useStatus !== 0 && detail.isReturn && !detail.content"
      class="mx-4 mt-7"
      :fixed="false"
    >
      <app-action-btn :loading="knownLoading" text="已知悉" @click="known" class="flex-1" />
      <app-action-btn
        class="flex-1"
        :loading="submitLoading"
        text="提交"
        type="primary"
        @click="submit"
      />
    </app-bottom-actions>
    <app-bottom-actions
      v-else-if="+detailInfor.type === 1 && detail.useStatus === 0"
      class="mx-4 mt-7"
      :fixed="false"
      :count="1"
    >
      <app-action-btn text="再次发起" type="primary" @click="resend" />
    </app-bottom-actions>
    <no-reply-popup v-if="noReplyshow" :list="noReplyList" @close="noReplyshow = false" />
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-textarea__field) {
  font-size: 28rpx;
}
</style>
