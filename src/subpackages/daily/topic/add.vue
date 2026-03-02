<script setup lang="ts">
import { useTopicAdd } from './composables/use-topic-add';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  title,
  labelType,
  topicValue,
  message,
  checkedUsers,
  labelTreeList,
  labelShow,
  activeId,
  activeIndex,
  getLabelTree,
  handleLabelSelect,
  handleUserConfirm,
  submitTopic,
  cancelAdd,
} = useTopicAdd();

// 部门用户选择
const changeTypeShow = ref(false);
const hasDept = ref(false);

// 打开标签选择
const openLabelSelect = () => {
  labelShow.value = true;
};

// 打开用户选择
const openUserSelect = () => {
  changeTypeShow.value = true;
};

// 用户选择确认
const onTreeConfirm = (list: string[], userList: any[]) => {
  handleUserConfirm(list, userList);
  changeTypeShow.value = false;
};

// 提交
const onSubmit = () => {
  submitTopic();
};

// 生命周期
onMounted(() => {
  getLabelTree();
});
</script>

<template>
  <view class="add pb-100">
    <app-watermark />

    <up-sticky style="top: 0">
      <view class="text-14 pt-10 pl-10 pb-4 bg-light-gray">话题新增</view>
    </up-sticky>

    <view class="add-content">
      <up-form class="bg-white">
        <!-- 标题 -->
        <app-form-item label="标题" :required="true" :borderBottom="false">
          <up-input
            v-model="title"
            placeholder="请输入标题"
            input-align="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>

        <!-- 事件分类 -->
        <app-form-item label="事件分类" :required="true" :borderBottom="false">
          <view
            :class="`w-full text-right ${labelType.text ? 'color-black-2' : 'color-gray-6'}`"
            @click="openLabelSelect"
          >
            {{ labelType.text || '点击选择事件分类' }}
          </view>
        </app-form-item>

        <!-- 话题内容 -->
        <app-form-item label="话题内容" :required="true" :borderBottom="false">
          <up-textarea
            v-model="topicValue"
            class="flex-1 text-right text-14 p-8px min-h-60px w-full"
            border="none"
            placeholder="请输入话题内容"
            auto-height
          />
        </app-form-item>

        <!-- 提醒谁看 -->
        <app-form-item label="提醒谁看" :required="true" :borderBottom="false">
          <view
            :class="`w-full text-right ${checkedUsers.length ? 'color-black-2' : 'color-gray-6'}`"
            @click="openUserSelect"
          >
            {{ checkedUsers.length ? `已选${checkedUsers.length}人` : '点击选择人员' }}
          </view>
        </app-form-item>

        <!-- 留言 -->
        <app-form-item v-if="checkedUsers.length" label="留言" :borderBottom="false">
          <up-textarea
            v-model="message"
            class="flex-1 text-right text-14 p-8px min-h-60px w-full"
            border="none"
            placeholder="请输入留言"
            auto-height
          />
        </app-form-item>
      </up-form>
    </view>

    <!-- 底部操作 -->
    <app-bottom-actions>
      <view class="flex w-full px-4">
        <app-action-btn class="flex-1" text="取消" @click="cancelAdd" />
        <app-action-btn class="flex-1 ml-2" type="primary" text="提交" @click="onSubmit" />
      </view>
    </app-bottom-actions>

    <!-- 标签选择 -->
    <up-popup :show="labelShow" mode="bottom" :round="16" @close="labelShow = false">
      <view class="h-65vh">
        <app-cate-select
          v-model:activeIndex="activeIndex"
          v-model:activeId="activeId"
          :items="labelTreeList"
          height="100%"
          @update:activeId="handleLabelSelect"
        />
      </view>
    </up-popup>

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="onTreeConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-textarea) {
  padding: 0 !important;

  textarea {
    font-size: 28rpx;
  }
}
</style>
