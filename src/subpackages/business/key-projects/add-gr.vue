<template>
  <view class="page-container">
    <app-watermark />

    <!-- 正常显示状态 -->
    <view v-if="!personSearchShow">
      <view class="page-title">拜访层级{{ data.cupId ? '编辑' : '新增' }}</view>

      <!-- 人员信息选择 -->
      <view class="form-item" @click="choosePerson">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>人员信息</text>
        </view>
        <view class="form-item-value">
          <text :class="data.personName ? 'text-value' : 'text-placeholder'">
            {{ data.personName || '请输入人员信息' }}
          </text>
          <uni-icons type="right" size="16" color="#969799" />
        </view>
      </view>

      <!-- 职位 -->
      <view class="form-item">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>职位</text>
        </view>
        <view class="form-item-value">
          <text :class="data.position ? 'text-value' : 'text-placeholder'">
            {{ data.position || '人员职位' }}
          </text>
        </view>
      </view>

      <!-- 进度 -->
      <view class="form-item">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>进度</text>
        </view>
        <view class="form-item-value-input">
          <input
            v-model="data.content"
            placeholder="请输入进度"
            class="input-field"
            placeholder-class="input-placeholder"
          />
        </view>
      </view>

      <!-- 事件类型 -->
      <view class="form-item" @click="chooseTopic">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>事件类型</text>
        </view>
        <view class="form-item-value">
          <text :class="data.topicDetailVO?.smallTagName ? 'text-value' : 'text-placeholder'">
            {{ data.topicDetailVO?.smallTagName || '事件类型' }}
          </text>
          <uni-icons type="right" size="16" color="#969799" />
        </view>
      </view>

      <!-- 事件时间 -->
      <view class="form-item" @click="showPickerDate = true">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>事件时间</text>
        </view>
        <view class="form-item-value">
          <text :class="data.topicDetailVO?.visitTime ? 'text-value' : 'text-placeholder'">
            {{ data.topicDetailVO?.visitTime || '事件时间' }}
          </text>
          <uni-icons type="right" size="16" color="#969799" />
        </view>
      </view>

      <!-- 事件备注 -->
      <view class="form-item form-item-textarea" @click="showRemarkPopup = true">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>事件备注</text>
        </view>
        <view class="form-item-value">
          <text :class="data.topicDetailVO?.remark ? 'text-value' : 'text-placeholder'">
            {{ data.topicDetailVO?.remark || '事件备注' }}
          </text>
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
    </view>

    <!-- 搜索模式 -->
    <view v-else class="search-container">
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-input-wrapper">
          <uni-icons type="search" size="18" color="#969799" />
          <input
            v-model="searchKeyword"
            class="search-input"
            placeholder="请输入人员ID|名称"
            focus
            @input="getPersonList"
            @confirm="getPersonList"
          />
          <uni-icons
            v-if="searchKeyword"
            type="clear"
            size="18"
            color="#969799"
            @click="clearSearch"
          />
        </view>
        <view class="search-cancel" @click="cancelSearch">取消</view>
      </view>

      <!-- 搜索结果列表 -->
      <view class="search-results">
        <view v-if="personLoading" class="loading-wrapper">
          <uni-icons type="spinner-cycle" size="32" color="#2271f5" class="loading-icon" />
          <text class="loading-text">搜索中...</text>
        </view>
        <view v-else-if="personList.length === 0 && searchKeyword" class="empty-wrapper">
          <text class="empty-text">暂无搜索结果</text>
        </view>
        <view v-else-if="personList.length > 0" class="person-list">
          <view
            v-for="item in personList"
            :key="item.userId"
            class="person-item"
            @click="selectPerson(item)"
          >
            <view class="person-info">
              <text class="person-name">{{ item.userId }}/{{ item.userName }}</text>
              <text class="person-position">({{ item.position }})</text>
            </view>
            <uni-icons type="right" size="16" color="#c8c9cc" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { KeyProjectsService } from '@/api/key-projects';
import { CustomerService } from '@/api/customer';

const data = ref<any>({
  cupId: '',
  personId: '',
  personName: '',
  position: '',
  content: '',
  topicDetailVO: {
    smallTagName: '',
    visitTime: '',
    remark: '',
  },
});

const custId = ref('');
const ccuId = ref('');
const curDept = ref<any>({});
const submitLoading = ref(false);
const personSearchShow = ref(false);
const searchKeyword = ref('');
const personLoading = ref(false);
const personList = ref<any[]>([]);
let searchTimer: any = null;

// 选择人员
const choosePerson = () => {
  if (!data.value.cupId) {
    personSearchShow.value = true;
    searchKeyword.value = '';
    personList.value = [];
  }
};

// 获取人员列表
const getPersonList = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(async () => {
    if (!searchKeyword.value) {
      personList.value = [];
      return;
    }
    personLoading.value = true;
    try {
      const res = await CustomerService.queryPerson({ person: searchKeyword.value });
      if (res.success) {
        personList.value = res.data || [];
      }
    } catch (error) {
      console.error('获取人员列表失败:', error);
    } finally {
      personLoading.value = false;
    }
  }, 300);
};

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  personList.value = [];
};

// 取消搜索
const cancelSearch = () => {
  personSearchShow.value = false;
  searchKeyword.value = '';
  personList.value = [];
};

// 选择人员
const selectPerson = (item: any) => {
  data.value.personId = item.userId;
  data.value.personName = item.userName;
  data.value.position = item.position;
  personSearchShow.value = false;
  searchKeyword.value = '';
  personList.value = [];
};

// 提交
const submit = async () => {
  if (!data.value.personId) {
    uni.showToast({
      title: '人员信息不能为空',
      icon: 'none',
    });
    return;
  }
  if (!data.value.content) {
    uni.showToast({
      title: '进度不能为空',
      icon: 'none',
    });
    return;
  }

  const params = {
    ccuId: ccuId.value,
    deptId: curDept.value.deptId,
    deptName: curDept.value.deptName,
    saleId: curDept.value.userId,
    saleName: curDept.value.userName,
    cupId: data.value.cupId,
    content: data.value.content,
    position: data.value.position,
    personId: data.value.personId,
    personName: data.value.personName,
  };

  submitLoading.value = true;
  try {
    const res = data.value.cupId
      ? await KeyProjectsService.modifyPlan(params)
      : await KeyProjectsService.addPlan(params);

    if (res.success) {
      uni.showToast({
        title: res.msg || (data.value.cupId ? '修改成功' : '添加成功'),
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
  custId.value = options.custId;
  ccuId.value = options.ccuId;
  curDept.value = options.curDept ? JSON.parse(decodeURIComponent(options.curDept)) : {};

  if (options.item) {
    try {
      const item = JSON.parse(decodeURIComponent(options.item));
      data.value = {
        ...item,
        topicDetailVO: item.topicDetailVO || {
          smallTagName: '',
          visitTime: '',
          remark: '',
        },
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
}

.page-title {
  font-size: 28rpx;
  font-weight: bold;
  padding: 32rpx;
  color: #323233;
}

.form-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 0 16rpx 16rpx;
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
  min-width: 160rpx;
}

.required-mark {
  color: #ee0a24;
  margin-right: 4rpx;
}

.form-item-value {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  justify-content: flex-end;
}

.form-item-value-input {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.form-item-value-full {
  width: 100%;
  margin-top: 16rpx;
}

.input-field {
  width: 100%;
  text-align: right;
  font-size: 28rpx;
  color: #323233;
}

.input-placeholder {
  color: #969799;
}

.text-value {
  font-size: 28rpx;
  color: #323233;
  text-align: right;
}

.text-placeholder {
  font-size: 28rpx;
  color: #969799;
  text-align: right;
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

/* 搜索模式样式 */
.search-container {
  min-height: 100vh;
  background-color: #fff;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  background: #fff;
  border-bottom: 1rpx solid #ebedf0;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #f7f8fa;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #323233;
}

.search-cancel {
  font-size: 28rpx;
  color: #323233;
  padding: 8rpx 16rpx;
}

.search-results {
  padding: 16rpx;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #969799;
}

.empty-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #969799;
}

.person-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.person-item {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.person-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
}

.person-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #323233;
}

.person-position {
  font-size: 24rpx;
  color: #969799;
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
