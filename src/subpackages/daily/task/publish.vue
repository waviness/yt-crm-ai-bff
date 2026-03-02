<script setup lang="ts">
import FileItem from './components/file-item.vue';
import SendPersonPopup from './components/send-person-popup.vue';
import { useTaskPublish } from './composables/use-task-publish';

defineOptions(SHARED_STYLE_OPTIONS);

const {
  activeId,
  activeIndex,
  labelTreeList,
  publishLoading,
  actionShow,
  personShow,
  minDate,
  urgencyList,
  isReturnList,
  dateRange,
  bigLabelValue,
  labelValue,
  urgency,
  isReturn,
  title,
  content,
  depTreeList,
  groupTreeList,
  tagDataList,
  active,
  sendPersons,
  fileList,
  checkedTree,
  labelText,
  dateRangeText,
  sendPersonsText,
  handleDateChange,
  onLabelChange,
  onSendConfirm,
  validator,
  onFailed,
  afterRead,
  removeFile,
  submit,
  goBack,
  init,
} = useTaskPublish();

const calendarRef = ref<any>();

// 监听 activeId 变化，触发标签选择
watch(
  () => activeId.value,
  newId => {
    if (newId && actionShow.value) {
      const currentItem = labelTreeList.value[activeIndex.value];
      const selectedChild = currentItem?.children?.find((child: any) => child.id === newId);
      if (selectedChild) {
        onLabelChange(selectedChild);
      }
    }
  }
);

onLoad((opts: any) => {
  const detail = opts?.detail ? JSON.parse(opts.detail) : null;
  init(detail);
});
</script>

<template>
  <!-- 任务/审批 -->
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="text-14 p-10">新增任务</view>
    <up-form class="bg-white">
      <app-form-item class="block bg-white" :borderBottom="false" label="事件分类" required>
        <view
          :class="`w-full text-right ${labelText ? 'color-black-2' : 'color-gray-6'}`"
          @click="actionShow = true"
        >
          {{ labelText || '点击选择事件分类' }}
        </view>
      </app-form-item>
      <app-form-item class="block bg-white mt-2" :borderBottom="false" label="事件时效">
        <view class="w-full flex items-center justify-end">
          <view :class="dateRangeText ? '' : 'color-gray-7'" @click="calendarRef?.open()">
            {{ dateRangeText || '点击选择事件时效' }}
          </view>
          <up-icon
            v-if="dateRangeText"
            name="close-circle"
            size="16"
            class="ml-2"
            @click="dateRange = []"
          />
        </view>
      </app-form-item>
      <app-form-item class="block bg-white mt-2" :borderBottom="false" label="紧急程度" required>
        <view class="w-full flex justify-end">
          <app-radio v-model:status="urgency" :options="urgencyList" />
        </view>
      </app-form-item>
      <app-form-item
        class="block bg-white mt-2"
        :borderBottom="false"
        label="是否需要回执"
        required
      >
        <view class="w-full flex justify-end">
          <app-radio v-model:status="isReturn" :options="isReturnList" />
        </view>
      </app-form-item>
      <app-form-item class="block bg-white mt-2" :borderBottom="false" label="发送至" required>
        <view
          :class="`w-full text-right ${sendPersonsText ? 'color-black-2' : 'color-gray-6'}`"
          @click="personShow = true"
        >
          {{ sendPersonsText || '点击选择人员' }}
        </view>
      </app-form-item>
      <app-form-item class="block bg-white mt-2" :borderBottom="false" label="标题" required>
        <up-input
          v-model="title"
          placeholder="请输入标题"
          input-align="right"
          fontSize="28rpx"
          border="none"
          clearable
        />
      </app-form-item>
      <app-form-item
        class="block bg-white mt-2"
        :borderBottom="false"
        label="内容"
        labelPosition="top"
        required
      >
        <view class="w-full">
          <up-textarea
            v-model="content"
            placeholder="请输入内容"
            :autoHeight="true"
            border="none"
          />
        </view>
      </app-form-item>
      <app-form-item class="block bg-white mt-2" :borderBottom="false" label="附件">
        <view class="w-full flex justify-end items-center">
          <up-upload :maxSize="10485760" @afterRead="afterRead" @delete="removeFile" accept="">
            <view class="color-main-3 text-right">点击添加附件</view>
          </up-upload>
        </view>
      </app-form-item>
    </up-form>
    <view class="mt-1" v-show="fileList.length">
      <file-item
        v-for="item in fileList"
        :key="item.index"
        :data="item"
        isUpload
        @remove="removeFile(item)"
      />
    </view>
    <app-bottom-actions class="block pt-15 px-4" :fixed="false">
      <app-action-btn class="flex-1" :disabled="publishLoading" text="取消" @click="goBack" />
      <app-action-btn
        class="flex-1"
        :loading="publishLoading"
        type="primary"
        text="提交"
        @click="submit"
      />
    </app-bottom-actions>
    <app-calendar
      ref="calendarRef"
      mode="range"
      title="选择时间范围"
      :date="dateRange[0] && dateRange[1] ? [dateRange[0], dateRange[1]] : ''"
      :start-date="minDate.value ? time.format(minDate.value, time.FORMATS.ISO_DATE) : ''"
      @confirm="handleDateChange"
    />
    <up-popup :show="actionShow" position="bottom" :round="0" @close="actionShow = false">
      <app-cate-select
        :items="labelTreeList"
        v-model:activeIndex="activeIndex"
        v-model:activeId="activeId"
        height="60vh"
      />
    </up-popup>
    <send-person-popup
      v-model:show="personShow"
      :sendPersons="sendPersons"
      :checkedTree="checkedTree"
      :depTreeList="depTreeList"
      :tagDataList="tagDataList"
      :groupTreeList="groupTreeList"
      @confirm="onSendConfirm"
      @cancel="personShow = false"
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

:deep(.u-upload__wrap) {
  justify-content: flex-end;
}
</style>
