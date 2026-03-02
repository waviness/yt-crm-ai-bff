<script setup lang="ts">
/**
 * 微信小程序登录页面
 * 支持微信手机号授权登录和登录协议展示
 */

useHideHomeButton();

const appStore = useAppStore();
const authStore = useAuthStore();

/**
 * 处理协议确认
 */
const handleConfirm = (): void => {
  authStore.agreeAgreement();
};

/**
 * 处理微信手机号授权
 * @param e 微信授权事件对象
 */
const handleGetPhoneNumber = (e: any): void => {
  if (typeChecker.isEmpty(e.detail.code)) {
    console.warn('未获取到手机号授权码');
    return;
  }

  authStore.signInWithMiniProgram({
    phoneCode: e.detail.code,
    type: 6,
  });
};

/**
 * 页面初始化
 * 尝试自动登录
 */
onMounted(() => {
  console.log('登录页面已挂载，尝试自动登录');
  authStore.autoSignIn();
});
</script>

<template>
  <view class="flex flex-col align-center justify-center">
    <!-- 应用Logo -->
    <view class="mt-40 mx-auto" v-if="!authStore.autoLoading">
      <up-image
        src="/static/images/logo.svg"
        shape="circle"
        mode="aspectFill"
        width="100"
        height="100"
      />
    </view>

    <!-- 登录按钮 -->
    <view class="w-350 mt-10 mx-auto" v-if="!authStore.autoLoading">
      <up-button color="#07C160" open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber">
        登录授权
      </up-button>
    </view>

    <view class="my-7 mx-12" v-if="!authStore.autoLoading">
      <view class="text-12 text-center color-gray-5"
        >注意：本小程序仅限内部特定人群使用，非授权用户请勿尝试登录。</view
      >
    </view>

    <!-- 加载状态 -->
    <up-loading-page
      :loading="authStore.autoLoading"
      loading-text="加载中"
      loading-mode="spinner"
      :loading-color="appStore.theme.color.primary"
      :color="appStore.theme.color.primary"
      icon-size="32"
    />

    <!-- 登录协议模态框 -->
    <up-modal
      :show="authStore.signInAgreement.show"
      :title="authStore.signInAgreement.title"
      @confirm="handleConfirm"
    >
      <scroll-view scroll-y class="h-600">
        <rich-text :nodes="authStore.signInAgreement.content" />
      </scroll-view>
    </up-modal>
  </view>
</template>
