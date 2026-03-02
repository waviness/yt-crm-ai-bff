/**
 * 文件下载工具函数
 * 支持 H5 和小程序环境的文件下载
 */

import { isH5 } from './env';
import { showSuccess, showError } from './toast';

// 图片类型列表
const IMG_TYPES = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'];

/**
 * 验证和规范化文件URL
 * @param fileUrl 文件URL
 * @returns 规范化后的URL，如果无效则返回null
 */
const normalizeFileUrl = (fileUrl: string): string | null => {
  if (!fileUrl) {
    return null;
  }

  // 移除首尾空格
  fileUrl = fileUrl.trim();

  // 如果不是完整URL，返回null
  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    return null;
  }

  return fileUrl;
};

/**
 * 检查URL协议是否安全
 * @param fileUrl 文件URL
 * @returns 是否为HTTPS
 */
const isHttpsUrl = (fileUrl: string): boolean => {
  return fileUrl.startsWith('https://');
};

/**
 * 检查当前页面协议
 * @returns 当前页面是否为HTTPS
 */
const isCurrentPageHttps = (): boolean => {
  // #ifdef H5
  if (typeof window !== 'undefined' && window.location) {
    return window.location.protocol === 'https:';
  }
  // #endif
  return false;
};

/**
 * 混合内容错误类
 * 用于标识混合内容问题
 */
export class MixedContentError extends Error {
  constructor(
    public fileUrl: string,
    message: string = '混合内容被阻止'
  ) {
    super(message);
    this.name = 'MixedContentError';
  }
}

/**
 * 检测是否为图片文件
 */
export const isImageFile = (fileUrl: string): boolean => {
  const fileArr = fileUrl.split('.');
  const fileType = fileArr[fileArr.length - 1]?.toLowerCase();
  return IMG_TYPES.includes(fileType);
};

/**
 * 获取文件类型
 */
export const getFileType = (fileUrl: string): string => {
  const fileArr = fileUrl.split('.');
  return fileArr[fileArr.length - 1]?.toLowerCase() || '';
};

/**
 * 下载文件（适用于非图片文件）
 * @param fileUrl 文件完整 URL
 * @param options 选项
 */
export const downloadFile = async (
  fileUrl: string,
  options?: {
    onProgress?: (progress: number) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  const { onProgress, onSuccess, onError } = options || {};

  // 验证和规范化URL
  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    const errorMsg = '文件地址无效，请检查URL格式';
    console.error(errorMsg, fileUrl);
    onError?.(new Error(errorMsg));
    showError(errorMsg);
    return;
  }

  // #ifdef H5
  if (isH5()) {
    try {
      // H5 环境：检查混合内容问题
      // 混合内容：HTTPS 页面加载 HTTP 资源（浏览器会阻止）
      // 注意：HTTP 页面加载 HTTPS 资源是安全的，浏览器允许
      if (isCurrentPageHttps() && !isHttpsUrl(normalizedUrl)) {
        // 混合内容被阻止，抛出特殊错误让页面处理
        const error = new MixedContentError(
          normalizedUrl,
          '当前页面使用HTTPS，无法加载HTTP资源，请使用页面上的复制按钮复制地址到浏览器打开'
        );
        console.error('混合内容被阻止:', normalizedUrl);
        onError?.(error);
        showError('当前页面使用HTTPS，无法加载HTTP资源，请点击上方复制按钮复制地址到浏览器打开');
        return;
      }

      // 使用 iframe 下载
      // 支持的情况：
      // 1. HTTP 页面 + HTTP 文件 ✅
      // 2. HTTP 页面 + HTTPS 文件 ✅
      // 3. HTTPS 页面 + HTTPS 文件 ✅
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = normalizedUrl;
      document.getElementsByTagName('body')[0].appendChild(iframe);

      // 延迟移除 iframe
      setTimeout(() => {
        try {
          document.getElementsByTagName('body')[0].removeChild(iframe);
        } catch {
          // 忽略移除失败的错误
        }
      }, 1000);

      onSuccess?.();
    } catch (error) {
      console.error('下载失败:', error);
      onError?.(error);
      showError('下载失败');
    }
    return;
  }
  // #endif

  // #ifndef H5
  // 小程序环境：检查协议
  if (!isHttpsUrl(normalizedUrl)) {
    const errorMsg = '小程序环境仅支持HTTPS协议，请使用HTTPS地址';
    console.error(errorMsg);
    onError?.(new Error(errorMsg));
    showError(errorMsg);
    return;
  }

  // 使用 uni.downloadFile
  try {
    uni.downloadFile({
      url: normalizedUrl,
      success: downloadRes => {
        if (downloadRes.statusCode === 200) {
          onProgress?.(100);
          // 打开文件
          uni.openDocument({
            filePath: downloadRes.tempFilePath,
            success: () => {
              onSuccess?.();
            },
            fail: error => {
              console.error('打开文件失败:', error);
              onError?.(error);
              showError('打开文件失败');
            },
          });
        } else {
          const errorMsg = `下载失败，状态码：${downloadRes.statusCode}`;
          console.error(errorMsg);
          onError?.(new Error(errorMsg));
          showError(errorMsg);
        }
      },
      fail: error => {
        console.error('下载失败:', error);
        onError?.(error);
        showError('下载失败，请检查网络连接');
      },
    });
  } catch (error) {
    console.error('下载失败:', error);
    onError?.(error);
    showError('下载失败');
  }
  // #endif
};

/**
 * 下载图片（适用于图片文件）
 * @param fileUrl 图片完整 URL
 * @param options 选项
 */
export const downloadImage = async (
  fileUrl: string,
  options?: {
    onProgress?: (progress: number) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  const { onProgress, onSuccess, onError } = options || {};

  // 验证和规范化URL
  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    const errorMsg = '文件地址无效，请检查URL格式';
    console.error(errorMsg, fileUrl);
    onError?.(new Error(errorMsg));
    showError(errorMsg);
    return;
  }

  // #ifdef H5
  if (isH5()) {
    try {
      // H5 环境：检查混合内容问题
      // 混合内容：HTTPS 页面加载 HTTP 资源（浏览器会阻止）
      // 注意：HTTP 页面加载 HTTPS 资源是安全的，浏览器允许
      if (isCurrentPageHttps() && !isHttpsUrl(normalizedUrl)) {
        // 混合内容被阻止，抛出特殊错误让页面处理
        const error = new MixedContentError(
          normalizedUrl,
          '当前页面使用HTTPS，无法加载HTTP资源，请使用页面上的复制按钮复制地址到浏览器打开'
        );
        console.error('混合内容被阻止:', normalizedUrl);
        onError?.(error);
        showError('当前页面使用HTTPS，无法加载HTTP资源，请点击上方复制按钮复制地址到浏览器打开');
        return;
      }

      // 直接打开图片
      // 支持的情况：
      // 1. HTTP 页面 + HTTP 图片 ✅
      // 2. HTTP 页面 + HTTPS 图片 ✅
      // 3. HTTPS 页面 + HTTPS 图片 ✅
      window.location.href = normalizedUrl;
      onSuccess?.();
    } catch (error) {
      console.error('下载失败:', error);
      onError?.(error);
      showError('下载失败');
    }
    return;
  }
  // #endif

  // #ifndef H5
  // 小程序环境：检查协议
  if (!isHttpsUrl(normalizedUrl)) {
    const errorMsg = '小程序环境仅支持HTTPS协议，请使用HTTPS地址';
    console.error(errorMsg);
    onError?.(new Error(errorMsg));
    showError(errorMsg);
    return;
  }

  // 下载并保存到相册
  try {
    uni.downloadFile({
      url: normalizedUrl,
      success: downloadRes => {
        if (downloadRes.statusCode === 200) {
          onProgress?.(100);
          // 保存到相册
          uni.saveImageToPhotosAlbum({
            filePath: downloadRes.tempFilePath,
            success: () => {
              showSuccess('保存成功');
              onSuccess?.();
            },
            fail: error => {
              console.error('保存失败:', error);
              onError?.(error);
              showError('保存失败');
            },
          });
        } else {
          const errorMsg = `下载失败，状态码：${downloadRes.statusCode}`;
          console.error(errorMsg);
          onError?.(new Error(errorMsg));
          showError(errorMsg);
        }
      },
      fail: error => {
        console.error('下载失败:', error);
        onError?.(error);
        showError('下载失败，请检查网络连接');
      },
    });
  } catch (error) {
    console.error('下载失败:', error);
    onError?.(error);
    showError('下载失败');
  }
  // #endif
};

/**
 * 智能下载文件（自动判断图片或普通文件）
 * @param fileUrl 文件完整 URL
 * @param options 选项
 */
export const smartDownloadFile = async (
  fileUrl: string,
  options?: {
    onProgress?: (progress: number) => void;
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
): Promise<void> => {
  if (isImageFile(fileUrl)) {
    return downloadImage(fileUrl, options);
  } else {
    return downloadFile(fileUrl, options);
  }
};

export default {
  isImageFile,
  getFileType,
  downloadFile,
  downloadImage,
  smartDownloadFile,
};
