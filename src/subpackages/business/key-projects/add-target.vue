<template>
  <view class="page-container">
    <app-watermark />
    <view class="page-title">目标任务{{ data.cutId ? '编辑' : '新增' }}</view>

    <!-- 状态选择 -->
    <view class="form-item" @click="actionShow = true">
      <view class="form-item-label">
        <text class="required-mark">*</text>
        <text>状态</text>
      </view>
      <view class="form-item-value">
        <text :class="statusText ? 'text-value' : 'text-placeholder'">
          {{ statusText || '点击选择' }}
        </text>
        <uni-icons type="right" size="16" color="#969799" />
      </view>
    </view>

    <!-- 时间选择 -->
    <view class="form-item" @click="calendarShow = true">
      <view class="form-item-label">
        <text class="required-mark">*</text>
        <text>时间</text>
      </view>
      <view class="form-item-value">
        <text :class="data.targetTime ? 'text-value' : 'text-placeholder'">
          {{ data.targetTime || '点击选择' }}
        </text>
        <uni-icons type="right" size="16" color="#969799" />
      </view>
    </view>

    <!-- 内容输入 -->
    <view class="form-item form-item-textarea">
      <view class="form-item-label">
        <text class="required-mark">*</text>
        <text>内容</text>
      </view>
      <view class="form-item-value-full">
        <textarea
          v-model="data.content"
          placeholder="请输入内容"
          class="textarea-input"
          auto-height
          :maxlength="-1"
        />
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="footer-buttons">
      <view class="btn-cancel" @click="goBack">取消</view>
      <view class="btn-submit" @click="submit">
        <text v-if="!submitLoading">提交</text>
        <uni-icons v-else type="spinner-cycle" size="20" color="#fff" class="loading-icon" />
      </view>
    </view>

    <!-- 状态选择弹窗 -->
    <up-action-sheet
      :show="actionShow"
      :actions="statusList"
      title="选择状态"
      @close="actionShow = false"
      @select="onStatusChange"
    />

    <!-- 日期选择 -->
    <uv-calendars
      v-model:show="calendarShow"
      mode="single"
      :minDate="minDate"
      @confirm="onDateChange"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { KeyProjectsService } from '@/api/key-projects';

const statusList = [
  {
    value: 0,
    name: '待完成',
  },
  {
    value: 1,
    name: '已完成',
  },
];

const actionShow = ref(false);
const minDate = new Date(2010, 0, 1);
const calendarShow = ref(false);
const status = ref<any>({});
const data = ref<any>({
  cutId: '',
  status: '',
  targetTime: '',
  content: '',
});
const ccuId = ref('');
const curDept = ref<any>({});
const submitLoading = ref(false);

// 状态文本
const statusText = computed(() => {
  return status.value.name || '';
});

// 格式化日期
const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 选择状态
const onStatusChange = (action: any) => {
  status.value = action;
  data.value.status = action.value;
  actionShow.value = false;
};

// 选择日期
const onDateChange = (value: any) => {
  calendarShow.value = false;
  data.value.targetTime = formatDate(new Date(value));
};

// 提交
const submit = async () => {
  if (data.value.status !== 0 && data.value.status !== 1) {
    uni.showToast({
      title: '状态不能为空',
      icon: 'none',
    });
    return;
  }
  if (!data.value.targetTime) {
    uni.showToast({
      title: '时间不能为空',
      icon: 'none',
    });
    return;
  }
  if (!data.value.content) {
    uni.showToast({
      title: '内容不能为空',
      icon: 'none',
    });
    return;
  }

  const params = {
    ccuId: ccuId.value,
    cutId: data.value.cutId,
    content: data.value.content,
    status: data.value.status,
    targetTime: data.value.targetTime,
    deptId: curDept.value.deptId,
    deptName: curDept.value.deptName,
    saleId: curDept.value.userId,
    saleName: curDept.value.userName,
  };

  submitLoading.value = true;
  try {
    const res = data.value.cutId
      ? await KeyProjectsService.modifyTarget(params)
      : await KeyProjectsService.addTarget(params);

    if (res.success) {
      uni.showToast({
        title: res.msg || (data.value.cutId ? '修改成功' : '添加成功'),
        icon: 'success',
      });
      setTimeout(() => {
        goBack();
      }, 1000);
    }
  } catch (error) {
    console.error('提交失败:', error);
  } finally {
    submitLoading.value = false;
  }
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

onLoad((options: any) => {
  ccuId.value = options.ccuId;
  curDept.value = options.curDept ? JSON.parse(decodeURIComponent(options.curDept)) : {};

  if (options.item) {
    try {
      const item = JSON.parse(decodeURIComponent(options.item));
      data.value = item;
      status.value = {
        value: +item.status,
        name: +item.status === 0 ? '待完成' : +item.status === 1 ? '已完成' : '',
      };
    } catch (error) {
      console.error('解析参数失败:', error);
    }
  }
});
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 16rpx;
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  padding: 16rpx 0;
  color: #323233;
}

.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-item-textarea {
  flex-direction: column;
  align-items: flex-start;
}

.form-item-label {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  color: #323233;
}

.required-mark {
  color: #ee0a24;
  margin-right: 4rpx;
}

.form-item-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-item-value-full {
  width: 100%;
  margin-top: 16rpx;
}

.text-value {
  font-size: 28rpx;
  color: #323233;
}

.text-placeholder {
  font-size: 28rpx;
  color: #969799;
}

.textarea-input {
  width: 100%;
  min-height: 200rpx;
  font-size: 28rpx;
  color: #323233;
  line-height: 1.5;
}

.footer-buttons {
  display: flex;
  gap: 24rpx;
  padding: 60rpx 32rpx 20rpx;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 500;
}

.btn-cancel {
  background: #fff;
  color: #323233;
  border: 2rpx solid #ebedf0;
}

.btn-submit {
  background: linear-gradient(135deg, #4a8df8 0%, #2271f5 100%);
  color: #fff;
  box-shadow: 0 8rpx 24rpx rgba(34, 113, 245, 0.3);
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
