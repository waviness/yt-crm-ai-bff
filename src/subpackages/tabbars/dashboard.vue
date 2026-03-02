<script setup lang="ts">
useInitTabPageSettings();
import Card from './components/sjzx-card.vue';
import { useDashboardIndex } from './composables/use-dashboard';
// 使用组合式函数管理列表逻辑
const { showIdentityPage, identityList, initDashboard, initSelectFlag, cardClick } =
  useDashboardIndex();

// onMounted(async () => {
//   initSelectFlag();
//   await initDashboard(); // 初始化数据中心
// });

onShow(async () => {
  // 页面显示时重新初始化数据，解决返回时空白页面问题
  initSelectFlag();
  await initDashboard();
});
</script>

<template>
  <app-page>
    <view v-if="showIdentityPage" class="entry-container">
      <view class="identity-title">
        <view class="main-title">
          请进行<span class="highlight">身份选择</span><br />
          进入驾驶舱
        </view>
        <view class="sub-title">选择身份进入驾驶舱后可查看对应权限的数据分析</view>
      </view>
      <!-- @click="cardClick(item)" -->
      <view class="card-grid" :class="identityList.length > 2 ? 'max-margin' : 'mid-margin'">
        <view
          class="identity-card"
          v-for="(item, index) in identityList"
          :key="index"
          @click="cardClick(item)"
        >
          <Card :Item="item" />
        </view>
      </view>
    </view>
  </app-page>
</template>
<style lang="scss" scoped>
.entry-container {
  height: calc(100vh - 51px);
  background: white;
}

.identity-title {
  padding: 48px 16px;
  text-align: left;

  .main-title {
    font-size: 28px;
    font-weight: bold;
    line-height: 1.2;
    margin-bottom: 8px;
  }

  .highlight {
    color: #2271f5;
  }

  .sub-title {
    color: #b0b0b0;
    font-size: 12px;
    margin-top: 8px;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 10px;
  padding: 0 16px;
  justify-content: center;
}

.max-margin {
  margin-top: 150px;
}

.mid-margin {
  margin-top: 200px;
}

.identity-card {
  background: #fff;
  border-radius: 30px;
  box-shadow: 0 2px 8px rgb(0 0 0 / 4%);
  padding: 16px;
  border: 1px solid #e7e7e7;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  transition: box-shadow 0.2s;
}
</style>
