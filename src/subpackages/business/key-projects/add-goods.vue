<template>
  <view class="page-container">
    <app-watermark />

    <!-- 正常显示状态 -->
    <view v-if="!searchMode">
      <view class="page-title">目标品种新增</view>

      <!-- 货品信息选择 -->
      <view class="form-item" @click="enterSearchMode">
        <view class="form-item-label">
          <text class="required-mark">*</text>
          <text>货品信息</text>
        </view>
        <view class="form-item-value">
          <text :class="goods ? 'text-value' : 'text-placeholder'">
            {{ goods || '点击选择' }}
          </text>
          <uni-icons type="right" size="16" color="#969799" />
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
            v-model="searchInput"
            class="search-input"
            placeholder="请输入货品ID|名称"
            focus
            @input="onSearchInput"
            @confirm="onSearchConfirm"
          />
          <uni-icons
            v-if="searchInput"
            type="clear"
            size="18"
            color="#969799"
            @click="clearSearch"
          />
        </view>
        <view class="search-cancel" @click="exitSearchMode">取消</view>
      </view>

      <!-- 搜索结果列表 -->
      <view class="search-results">
        <view v-if="goodsLoading" class="loading-wrapper">
          <uni-icons type="spinner-cycle" size="32" color="#2271f5" class="loading-icon" />
          <text class="loading-text">搜索中...</text>
        </view>
        <view v-else-if="goodsList.length === 0 && searchInput" class="empty-wrapper">
          <text class="empty-text">暂无搜索结果</text>
        </view>
        <view v-else-if="goodsList.length > 0" class="goods-list">
          <view
            v-for="item in goodsList"
            :key="item.goodsId"
            class="goods-item"
            @click="onSelectGoods(item)"
          >
            <view class="goods-id">{{ item.goodsId }}</view>
            <view class="goods-name">{{ item.goodsName }}</view>
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

const searchMode = ref(false);
const searchInput = ref('');
const goodsLoading = ref(false);
const goodsList = ref<any[]>([]);
const goods = ref('');
const ccuId = ref('');
const curDept = ref<any>({});
const data = ref<any>({
  cugId: '',
  goodsId: '',
  goodsName: '',
});
const submitLoading = ref(false);
let searchTimer: any = null;

// 进入搜索模式
const enterSearchMode = () => {
  if (!data.value.cugId) {
    searchMode.value = true;
    searchInput.value = '';
    goodsList.value = [];
  }
};

// 退出搜索模式
const exitSearchMode = () => {
  searchMode.value = false;
  searchInput.value = '';
  goodsList.value = [];
};

// 清除搜索
const clearSearch = () => {
  searchInput.value = '';
  goodsList.value = [];
};

// 搜索输入
const onSearchInput = () => {
  if (searchTimer) {
    clearTimeout(searchTimer);
  }
  searchTimer = setTimeout(() => {
    getGoodsList();
  }, 300);
};

// 搜索确认
const onSearchConfirm = () => {
  getGoodsList();
};

// 获取货品列表
const getGoodsList = async () => {
  if (!searchInput.value) {
    goodsList.value = [];
    return;
  }
  goodsLoading.value = true;
  try {
    const res = await KeyProjectsService.queryGoods({ goods: searchInput.value });
    if (res.success) {
      goodsList.value = res.data || [];
    }
  } catch (error) {
    console.error('获取货品列表失败:', error);
  } finally {
    goodsLoading.value = false;
  }
};

// 选择货品
const onSelectGoods = (item: any) => {
  goods.value = `${item.goodsId}/${item.goodsName}`;
  data.value.goodsId = item.goodsId;
  data.value.goodsName = item.goodsName;
  exitSearchMode();
};

// 提交
const submit = async () => {
  if (!data.value.goodsId) {
    uni.showToast({
      title: '货品信息不能为空',
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
    cugId: data.value.cugId,
    goodsId: data.value.goodsId,
    goodsName: data.value.goodsName,
  };

  submitLoading.value = true;
  try {
    const res = await KeyProjectsService.addGridGoods(params);

    if (res.success) {
      uni.showToast({
        title: res.msg || '添加成功',
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

  if (options.cugId) {
    data.value = {
      cugId: options.cugId,
      goodsId: options.goodsId,
      goodsName: options.goodsName,
    };
    goods.value = `${options.goodsId}/${options.goodsName}`;
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

.text-value {
  font-size: 28rpx;
  color: #323233;
}

.text-placeholder {
  font-size: 28rpx;
  color: #969799;
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

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.goods-item {
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.goods-id {
  font-size: 28rpx;
  font-weight: 500;
  color: #2271f5;
  min-width: 120rpx;
}

.goods-name {
  flex: 1;
  font-size: 28rpx;
  color: #323233;
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
