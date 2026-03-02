<!-- 项目管理 - 准入 - 详情 - 修改药事会信息 -->
<script setup lang="ts">
const appStore = useAppStore();
const today = time.format(new Date(), time.FORMATS.ISO_DATE);
const calendarRef = ref();

const formData = ref({
  clrId: '',
  cuvId: '',
  labelId: '',
  labelName: '',
  yaoshihuiObj: { id: 0, name: '' },
  medicBoardType: 0,
  medicBoardTypeMemo: '',
  scheduleMeetingTime: '',
  medicBoardMemo: '',
});
const actionShow = ref(false);
const actions = [
  {
    id: 1,
    name: '新药会',
  },
  {
    id: 2,
    name: '国谈会',
  },
  {
    id: 3,
    name: '其他',
  },
];
const submitLoading = ref(false);

// 选择项目
const handleSelect = (item: any) => {
  actionShow.value = false;
  formData.value.yaoshihuiObj = item;
};

// 日期确认
const handleDateConfirm = (value: any) => {
  formData.value.scheduleMeetingTime = value.fulldate;
};

// 提交
const submit = async () => {
  const {
    clrId,
    cuvId,
    labelId,
    labelName,
    yaoshihuiObj,
    medicBoardTypeMemo,
    scheduleMeetingTime,
    medicBoardMemo,
  } = formData.value;
  if (yaoshihuiObj.id === 3 && !medicBoardTypeMemo) {
    showToast('药事会类型备注未填写');
    return;
  }
  submitLoading.value = true;
  const params = {
    clrId,
    cuvId,
    labelId,
    labelName,
    scheduleMeetingTime,
    medicBoardType: yaoshihuiObj.id,
    medicBoardTypeMemo,
    medicBoardMemo,
    isSign: false,
    userIdList: [],
    isSyncToTopic: true,
  };
  await CustomerFollowService.insOrUpdRemark([params]);
  submitLoading.value = false;
  appStore.setHadDoneOnDetail(true);
  showSuccess('成功');
  goBack();
};

// 返回
const goBack = () => {
  router.back();
};

onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  formData.value = { ...decodedOpts } as typeof formData.value;
  formData.value.scheduleMeetingTime = formData.value.scheduleMeetingTime.split(' ')[0];
  formData.value.yaoshihuiObj = {
    id: +formData.value.medicBoardType,
    name: actions.find((item: any) => item.id === +formData.value.medicBoardType)?.name || '',
  };
});
</script>

<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="text-sm p-10">修改药事会信息</view>
    <up-form class="bg-white">
      <app-form-item label="药事会类型">
        <view
          :class="`w-full text-right ${formData.yaoshihuiObj.name ? 'color-black-2' : 'color-gray-6'}`"
          @click="
            () => {
              actionShow = true;
            }
          "
        >
          {{ formData.yaoshihuiObj.name || '选择药事会类型' }}
        </view>
      </app-form-item>
      <app-form-item v-if="formData.yaoshihuiObj.id === 3" label="药事会类型备注" required>
        <up-input
          v-model="formData.medicBoardTypeMemo"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
          placeholder="请输入药事会类型备注"
        />
      </app-form-item>
      <app-form-item label="计划开会日期">
        <view
          :class="`w-full text-right ${formData.scheduleMeetingTime ? 'color-black-2' : 'color-gray-6'}`"
          @click="calendarRef.open()"
        >
          {{ formData.scheduleMeetingTime || '选择日期' }}
        </view>
      </app-form-item>
      <app-form-item label="备注" :borderBottom="false">
        <up-input
          v-model="formData.medicBoardMemo"
          placeholder="请输入备注"
          inputAlign="right"
          fontSize="28rpx"
          border="none"
        />
      </app-form-item>
    </up-form>
    <app-bottom-actions class="block pt-15 px-4" :fixed="false">
      <app-action-btn class="flex-1" :disabled="submitLoading" text="取消" @click="goBack" />
      <app-action-btn
        class="flex-1"
        :loading="submitLoading"
        text="保存"
        type="primary"
        @click="submit"
      />
    </app-bottom-actions>
    <app-action-sheet
      v-model:show="actionShow"
      :actions="actions"
      cancel-text="取消"
      description="药事会类型"
      close-on-click-action
      @select="handleSelect"
    />
    <!-- 日期弹框 -->
    <app-calendar
      ref="calendarRef"
      title="计划时间选择"
      :date="today"
      :startDate="today"
      @confirm="handleDateConfirm"
    />
  </view>
</template>
