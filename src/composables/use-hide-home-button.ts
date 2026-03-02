const useHideHomeButton = () => {
  onShow(() => {
    // #ifdef MP-WEIXIN || MP-TOUTIAO
    if (typeof uni.hideHomeButton === 'function') {
      uni.hideHomeButton();
    } else {
      console.warn('当前环境不支持 hideHomeButton API');
    }
    // #endif
  });
};

export default useHideHomeButton;
