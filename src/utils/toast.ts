export const showToast = (title: string) => {
  uni.showToast({ title, icon: 'none', mask: true });
};

export const showError = (title: string) => {
  if (title.length > 6) {
    uni.showModal({
      title: '提示',
      content: title,
      showCancel: false,
    });
  } else {
    uni.showToast({ title, icon: 'error', mask: true });
  }
  throw new Error(title);
};

export const showSuccess = (title: string) => {
  uni.showToast({ title, icon: 'success', mask: true });
};

export const showModal = (options: {
  title?: string;
  content: string;
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  duration?: number;
  success?: (res: { confirm: boolean; cancel: boolean }) => void;
  fail?: () => void;
  complete?: () => void;
}) => {
  const appStore = useAppStore();
  let isHandled = false;

  const wrappedSuccess = (res: { confirm: boolean; cancel: boolean }) => {
    if (!isHandled && options.success) {
      isHandled = true;
      options.success(res);
    }
  };

  const modalPromise = uni.showModal({
    title: options.title ?? '提示',
    content: options.content,
    showCancel: options.showCancel ?? true,
    confirmText: options.confirmText ?? '确定',
    cancelText: options.cancelText ?? '取消',
    confirmColor: options.confirmColor ?? appStore.theme.color.main,
    success: wrappedSuccess,
    fail: options.fail,
    complete: options.complete,
  });

  // 如果设置了 duration，在指定时间后自动触发确认
  if (options.duration && options.duration > 0) {
    setTimeout(() => {
      if (!isHandled) {
        isHandled = true;
        // uni.showModal 无法通过代码直接关闭弹窗
        // 这里只是触发 success 回调，模拟用户点击确认
        if (options.success) {
          options.success({ confirm: true, cancel: false });
        }
      }
    }, options.duration);
  }

  return modalPromise;
};

/**
 * 显示加载提示
 * @param title 提示文字，默认为"加载中..."
 */
export const showLoading = (title: string = '加载中...') => {
  uni.showLoading({
    title,
    mask: true,
  });
};

/**
 * 隐藏加载提示
 */
export const hideLoading = () => {
  uni.hideLoading();
};

export default {
  showToast,
  showError,
  showSuccess,
  showModal,
  showLoading,
  hideLoading,
};
