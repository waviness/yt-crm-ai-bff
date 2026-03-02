<script setup lang="ts">
useHideHomeButton();

const authStore = useAuthStore();

const formRef = ref(null);

const formData = ref({
  account: '',
  password: '',
});

const rules = ref({
  account: [],
  password: [],
});

const signIn = () => {
  authStore.signInWithCredentials(formData.value);
};
</script>

<template>
  <view class="px-4">
    <up-form :model="formData" :rules="rules" ref="formRef" labelWidth="120rpx">
      <up-form-item label="用户名" prop="account" borderBottom>
        <up-input v-model="formData.account" placeholder="请输入用户名" border="none"> </up-input>
      </up-form-item>
      <up-form-item label="密码" prop="password">
        <up-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          border="none"
        >
        </up-input>
      </up-form-item>
      <view class="mt-4">
        <up-button type="primary" @click="signIn">登录</up-button>
      </view>
    </up-form>
  </view>
</template>
