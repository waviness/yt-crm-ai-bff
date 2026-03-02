/**
 * vConsole 调试工具
 * 开发环境不启用（使用浏览器控制台）
 * 测试/生产环境通过以下方式启用：
 * 1. URL 参数 ?vconsole=1
 * 2. localStorage 中 vconsole=1
 */

import { isH5 } from './env';

let vConsoleInstance: any = null;

/**
 * 检查是否应该启用 vConsole
 */
function shouldEnableVConsole(): boolean {
  // 只在 H5 环境启用
  if (!isH5()) {
    return false;
  }

  if (typeof window !== 'undefined') {
    // 1. URL 参数控制 ?vconsole=1
    // 支持两种方式：
    // - hash 前的参数：/index.html?vconsole=1#/pages/home/home
    // - hash 后的参数：/index.html#/pages/home/home?vconsole=1
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('vconsole') === '1') {
      return true;
    }

    // 检查 hash 后的参数（hash 路由模式）
    const hash = window.location.hash;
    if (hash) {
      const hashContent = hash.substring(1);
      const hashParts = hashContent.split('?');
      if (hashParts.length > 1) {
        const hashParams = new URLSearchParams(hashParts[1]);
        if (hashParams.get('vconsole') === '1') {
          return true;
        }
      }
    }

    // 2. localStorage 控制（方便切换，刷新后生效）
    try {
      const localEnable = localStorage.getItem('vconsole');
      if (localEnable === '1') {
        return true;
      }
    } catch {
      // localStorage 可能不可用，忽略错误
    }
  }

  return false;
}

/**
 * 初始化 vConsole
 */
export function initVConsole() {
  // #ifdef H5
  if (!shouldEnableVConsole()) {
    return;
  }

  // 避免重复加载
  if (vConsoleInstance) {
    return;
  }

  // 动态导入 vConsole（只在 H5 端）
  // @ts-ignore
  import('vconsole')
    .then((VConsole: any) => {
      if (VConsole && VConsole.default) {
        vConsoleInstance = new VConsole.default({
          theme: 'dark',
          defaultPlugins: ['system', 'network', 'element', 'storage'],
          maxLogNumber: 1000,
        });

        // 将实例挂载到 window 上，方便全局访问
        if (typeof window !== 'undefined') {
          (window as any).vConsole = vConsoleInstance;
        }
      }
    })
    .catch(() => {
      // 静默失败，不影响主流程
    });
  // #endif

  // #ifndef H5
  // 小程序端不执行任何操作
  // #endif
}

/**
 * 销毁 vConsole
 */
export function destroyVConsole() {
  // #ifdef H5
  if (vConsoleInstance) {
    vConsoleInstance.destroy();
    vConsoleInstance = null;
    if (typeof window !== 'undefined') {
      delete (window as any).vConsole;
    }
  }
  // #endif
}
