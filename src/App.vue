<script setup lang="ts">
import { isH5 } from '@/utils/env';

// 消息通知 路径重写映射
import { PATH_REWRITE_MAP } from '@/config/legacy-route';

// 防止重复执行的标记
let isRewriting = false;

/**
 * 处理外部链接的路径重写
 */
function handleExternalPathRewrite() {
  // 防止重复执行
  if (isRewriting) {
    return;
  }

  const currentPath = window.location.pathname;
  const search = window.location.search;
  const hash = window.location.hash;

  // 处理 Hash 路由：从 hash 中提取路径和查询参数
  let actualPath = currentPath;
  let actualSearch = search;

  if (hash) {
    // 移除 # 号，然后分离路径和查询参数
    const hashContent = hash.substring(1); // 移除 #
    const [hashPath, hashSearch] = hashContent.split('?');
    actualPath = hashPath;
    actualSearch = hashSearch ? `?${hashSearch}` : '';
  }

  // 检查是否需要重写路径
  for (const [originalPath, targetPath] of Object.entries(PATH_REWRITE_MAP)) {
    if (actualPath === originalPath) {
      isRewriting = true; // 设置标记，防止重复执行

      const newUrl = actualSearch ? `${targetPath}${actualSearch}` : targetPath;

      // 在 Hash 路由模式下，只更新 hash 部分
      if (hash) {
        // 更新 hash 为新的路径
        window.location.hash = newUrl;
      } else {
        // 非 Hash 路由模式，使用 replaceState
        window.history.replaceState(null, '', newUrl);
      }

      // 使用 uni.reLaunch 跳转到目标页面
      // @ts-ignore
      if (typeof uni !== 'undefined') {
        uni.reLaunch({
          url: newUrl,
          success: () => {
            isRewriting = false; // 重置标记
          },
          fail: (error: any) => {
            isRewriting = false; // 重置标记
            // 如果跳转失败，回退到重新加载
            window.location.reload();
          },
        });
      } else {
        // 如果 uni 不可用，回退到重新加载
        window.location.reload();
      }
      return;
    }
  }
}

onLaunch(() => {
  console.log('App Launch');

  // 只在 H5 环境下处理外部链接的路径重写（主要用于推送链接）
  if (isH5()) {
    handleExternalPathRewrite();
  }
});
</script>

<style lang="scss">
@import 'uview-plus/index.scss';
@import './scss/main.scss';

page {
  background-color: #f5f6f9;
  font-family: 'HarmonyOS Sans SC Medium', Arial, Helvetica, sans-serif;
  color: $uni-text-color;
  font-size: 24rpx;
}
</style>
