/**
 * 环境配置工具类
 */

// 获取环境变量
export const getEnv = (): string => {
  return import.meta.env?.MODE || process.env.NODE_ENV || 'development';
};

// 获取平台信息
export const getPlatform = (): string => {
  return (uni.getAppBaseInfo() as any).uniPlatform || 'web';
};

// 获取时候为 h5 环境
export const isH5 = (): boolean => {
  return getPlatform() === 'web';
};

// 获取是否为微信小程序环境
export const isMiniProgram = (): boolean => {
  const platform = getPlatform();
  return ['mp-weixin', 'devtools'].includes(platform);
};

// 获取是否为微信浏览器环境（H5端）
export const isWechatBrowser = (): boolean => {
  // #ifdef H5
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    return navigator.userAgent.toLowerCase().includes('micromessenger');
  }
  // #endif
  return false;
};

export default {
  getEnv,
  getPlatform,
};
