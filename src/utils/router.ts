/**
 * 路由管理工具类
 */

class RouterManager {
  /**
   * 跳转到 tabBar 页面
   * @param url 页面路径
   */
  tab(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.switchTab({
        url,
        success: () => resolve(),
        fail: error => reject(error),
      });
    });
  }

  /**
   * 重定向到应用内的某个页面
   * @param url 页面路径
   * @param params 页面参数
   */
  redirect(url: string, params?: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      // 处理参数
      const urlWithParams = buildUrlWithParams(url, params);

      uni.redirectTo({
        url: urlWithParams,
        success: () => resolve(),
        fail: error => reject(error),
      });
    });
  }

  /**
   * 跳转到应用内的某个页面
   * @param url 页面路径
   * @param params 页面参数
   */
  push(url: string, params?: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      // 处理参数
      const urlWithParams = buildUrlWithParams(url, params);

      uni.navigateTo({
        url: urlWithParams,
        success: () => resolve(),
        fail: error => reject(error),
      });
    });
  }

  /**
   * 返回上一页面或多级页面
   * @param delta 返回的页面数
   */
  back(delta: number = 1): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.navigateBack({
        delta: delta,
        success: () => resolve(),
        fail: error => reject(error),
      });
    });
  }

  /**
   * 关闭所有页面，打开到应用内的某个页面
   * @param url 页面路径
   * @param params 页面参数
   */
  reLaunch(url: string, params?: Record<string, any>): Promise<void> {
    return new Promise((resolve, reject) => {
      // 处理参数
      const urlWithParams = buildUrlWithParams(url, params);

      uni.reLaunch({
        url: urlWithParams,
        success: () => resolve(),
        fail: error => reject(error),
      });
    });
  }

  /**
   * 获取当前页面栈
   * @returns 页面栈数组
   */
  getCurrentPages(): any[] {
    // @ts-ignore
    return getCurrentPages() || [];
  }

  /**
   * 获取当前页面路由信息
   * @returns 当前页面路由信息
   */
  getCurrentRoute(): { route: string; options: Record<string, any> } | null {
    // @ts-ignore
    const pages = getCurrentPages() || [];
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      return {
        route: currentPage.route || '',
        // @ts-ignore
        options: currentPage.options || {},
      };
    }
    return null;
  }
}

const router = new RouterManager();

export default router;
export { RouterManager };
