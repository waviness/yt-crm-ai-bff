<script setup lang="ts">
/**
 * 公共文件下载页面
 * 支持不同平台的文件下载和复制功能
 */
// 响应式数据
const isAndroid = ref(false);
const isIOS = ref(false);
const isWechatBro = ref(false);
const isDesktop = ref(false); // 是否为桌面浏览器
const fileUrl = ref<string>('');
const loading = ref(false);
const isMixedContent = ref(false); // 是否为混合内容错误

// 检测微信浏览器
const isWechat = (): boolean => {
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent.toLowerCase().indexOf('micromessenger') !== -1;
  }
  return false;
};

// 检测是否为桌面浏览器
// 优先检测移动设备，桌面浏览器作为兜底
const checkIsDesktop = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const ua = navigator.userAgent?.toLowerCase() || '';
  const platform = navigator.platform?.toLowerCase() || '';

  // 优先检测移动设备（项目主要面向移动端）
  const mobileUARegex =
    /iphone|ipad|ipod|android|webos|blackberry|iemobile|opera mini|mobile|tablet/i;
  const isMobileUA = mobileUARegex.test(ua);

  // 如果 UA 中有明确的移动设备标识，则认为是移动设备
  if (isMobileUA) {
    return false;
  }

  // 检测桌面操作系统平台标识
  const desktopPlatforms = ['win32', 'win64', 'wow64', 'macintel', 'mac68k', 'linux'];
  const isDesktopPlatform = desktopPlatforms.some(p => platform.includes(p));

  // 如果 platform 是桌面系统，则认为是桌面浏览器（开发测试用）
  if (isDesktopPlatform) {
    return true;
  }

  // 如果 UA 中没有移动设备标识，且包含桌面浏览器特征，也认为是桌面浏览器
  const desktopBrowserRegex = /chrome|firefox|safari|edge|opera|msie|trident/i;
  if (desktopBrowserRegex.test(ua) && !isMobileUA) {
    return true;
  }

  // 默认认为是移动设备（项目主要面向移动端）
  return false;
};

// 复制链接
const copy = async () => {
  // #ifdef H5
  if (isH5()) {
    try {
      await navigator.clipboard.writeText(fileUrl.value);
      showSuccess('复制成功');
    } catch (err) {
      showError('该浏览器不支持自动复制');
    }
    return;
  }
  // #endif

  // #ifndef H5
  uni.setClipboardData({
    data: fileUrl.value,
    success: () => {
      showSuccess('复制成功');
    },
    fail: () => {
      showError('该浏览器不支持自动复制');
    },
  });
  // #endif
};

// 下载文件
const _downloadFile = async () => {
  loading.value = true;
  isMixedContent.value = false;
  try {
    await smartDownloadFile(fileUrl.value, {
      onSuccess: () => {
        loading.value = false;
      },
      onError: error => {
        loading.value = false;
        // 检测是否为混合内容错误
        if (error instanceof MixedContentError) {
          isMixedContent.value = true;
        }
      },
    });
  } catch (err) {
    console.error('下载失败:', err);
    loading.value = false;
    // 检测是否为混合内容错误
    if (err instanceof MixedContentError) {
      isMixedContent.value = true;
    }
  }
};

// 检测混合内容
const checkMixedContent = (): boolean => {
  // #ifdef H5
  if (!isH5()) {
    return false;
  }

  if (!fileUrl.value) {
    return false;
  }

  try {
    // 检测当前页面是否为 HTTPS
    const isCurrentHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:';
    // 检测文件地址是否为 HTTP
    const isFileHttp = fileUrl.value.trim().toLowerCase().startsWith('http://');

    // 如果是 HTTPS 页面加载 HTTP 资源，则是混合内容
    if (isCurrentHttps && isFileHttp) {
      return true;
    }
  } catch (error) {
    console.error('检测混合内容失败:', error);
  }
  // #endif
  return false;
};

// 页面初始化
onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  fileUrl.value = decodedOpts.fileUrl || '';

  // #ifdef H5
  // H5 环境下检测平台和浏览器（优先检测移动设备）
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent || '';

    // 优先检测移动设备（项目主要面向移动端）
    isAndroid.value = /android/i.test(ua);
    // iOS 设备检测（排除桌面 Safari）
    isIOS.value = /iphone|ipad|ipod/i.test(ua) && !/macintosh/i.test(ua);

    // 如果不是移动设备，则检测是否为桌面浏览器（开发测试用）
    if (!isAndroid.value && !isIOS.value) {
      isDesktop.value = checkIsDesktop();
    }

    isWechatBro.value = isWechat();
  }

  // 页面加载时检测混合内容
  isMixedContent.value = checkMixedContent();
  // #endif

  // #ifndef H5
  // 小程序环境下，直接触发下载
  _downloadFile();
  // #endif
});
</script>

<template>
  <view class="h-100vh flex justify-center items-center flex-col mx-[100rpx]">
    <!-- #ifdef H5 -->
    <!-- 桌面浏览器 -->
    <template v-if="isDesktop">
      <view class="mb-5 text-14 text-center break-all">
        {{ fileUrl }}
      </view>
      <!-- 混合内容提示 -->
      <view v-if="isMixedContent" class="mb-3 text-12 color-orange-5 text-center px-10">
        当前页面使用HTTPS，无法加载HTTP资源，请点击下方复制按钮复制地址到浏览器打开
      </view>
      <up-button
        :type="isMixedContent ? 'warning' : 'primary'"
        size="small"
        shape="circle"
        :loading="loading"
        @click="isMixedContent ? copy() : _downloadFile()"
      >
        {{ isMixedContent ? '复制地址' : '点击下载' }}
      </up-button>
    </template>

    <!-- Android 移动设备 -->
    <template v-else-if="isAndroid">
      <image v-if="isWechatBro" class="w-full" src="@/static/images/tobrowser.png" />
      <view v-if="!isWechatBro" class="mb-5 text-14 text-center break-all">
        {{ fileUrl }}
      </view>
      <!-- 混合内容提示 -->
      <view
        v-if="!isWechatBro && isMixedContent"
        class="mb-3 text-12 color-orange-5 text-center px-10"
      >
        当前页面使用HTTPS，无法加载HTTP资源，请点击下方复制按钮复制地址到浏览器打开
      </view>
      <up-button
        v-if="!isWechatBro"
        :type="isMixedContent ? 'warning' : 'primary'"
        size="small"
        shape="circle"
        :loading="loading"
        @click="isMixedContent ? copy() : _downloadFile()"
      >
        {{ isMixedContent ? '复制地址' : '点击下载' }}
      </up-button>
    </template>

    <!-- iOS 移动设备 -->
    <template v-else-if="isIOS">
      <view class="mb-5 text-14 text-center break-all color-main-3" @click="copy">
        {{ fileUrl }}
      </view>
      <view class="color-gray-3 text-12">点击上方复制链接，到浏览器打开</view>
    </template>
    <!-- #endif -->

    <!-- #ifndef H5 -->
    <view class="mb-5 text-14 text-center break-all">文件下载中...</view>
    <up-button type="primary" size="small" shape="circle" :loading="loading" @click="_downloadFile">
      重新下载
    </up-button>
    <!-- #endif -->
  </view>
</template>
