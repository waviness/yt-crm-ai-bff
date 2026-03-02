/**
 * 文件预览工具函数
 * 支持 H5 和微信小程序环境的文件预览
 */

import { isH5, isMiniProgram } from './env';
import { showError } from './toast';
import { getFileType } from './download';

// 图片类型列表
const IMG_TYPES = ['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'];

// Office 文件类型列表
const OFFICE_TYPES = [
  'docx',
  'doc',
  'xls',
  'xlsx',
  'xlsb',
  'xlsm',
  'pdf',
  'pptx',
  'ppsx',
  'ppt',
  'pps',
  'potx',
  'ppsm',
];

// 视频类型列表
const VIDEO_TYPES = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];

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

  // 如果是相对路径，需要拼接域名
  if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
    // 如果以 / 开头，可能需要拼接域名
    // 这里返回原值，由调用方处理域名拼接
    return fileUrl;
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
 * 预览图片文件
 * @param fileUrl 图片URL
 * @param urls 图片URL数组（可选，用于多图预览）
 * @param current 当前显示的图片索引（可选）
 */
const previewImage = (fileUrl: string, urls?: string[], current?: number): void => {
  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    showError('图片地址无效');
    return;
  }

  const imageUrls = urls && urls.length > 0 ? urls : [normalizedUrl];
  const currentIndex = current !== undefined ? current : 0;

  uni.previewImage({
    urls: imageUrls,
    current: currentIndex < imageUrls.length ? imageUrls[currentIndex] : imageUrls[0],
  });
};

/**
 * 预览视频文件
 * @param fileUrl 视频URL
 */
const previewVideo = (fileUrl: string): void => {
  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    showError('视频地址无效');
    return;
  }

  // #ifdef H5
  if (isH5()) {
    // H5 环境：使用新窗口打开视频
    window.open(normalizedUrl, '_blank');
    return;
  }
  // #endif

  // #ifndef H5
  // 小程序环境：使用 uni.openVideoPlayer（如果支持）
  // 注意：微信小程序可能不支持直接预览视频，需要下载后播放
  if (isMiniProgram()) {
    // 微信小程序：下载后使用 video 组件播放
    uni.downloadFile({
      url: normalizedUrl,
      success: res => {
        if (res.statusCode === 200) {
          // 使用 video 组件播放
          // 注意：这里需要页面配合使用 video 组件
          showError('小程序环境请使用 video 组件播放视频');
        } else {
          showError('视频下载失败');
        }
      },
      fail: () => {
        showError('视频下载失败');
      },
    });
    return;
  }
  // #endif
};

/**
 * 预览 Office 文件（PDF、Word、Excel等）
 * @param fileUrl 文件URL
 * @param fileType 文件类型（可选，如果不提供则从URL中提取）
 */
const previewOffice = (fileUrl: string, fileType?: string): void => {
  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    showError('文件地址无效');
    return;
  }

  const type = fileType || getFileType(normalizedUrl);

  // #ifdef H5
  if (isH5()) {
    // H5 环境：使用新窗口打开或 iframe 预览
    // PDF 可以直接在新窗口打开
    if (type === 'pdf') {
      window.open(normalizedUrl, '_blank');
      return;
    }
    // 其他 Office 文件可以使用在线预览服务
    // 例如：使用微软 Office Online 预览服务
    // 或者使用第三方预览服务如：https://view.officeapps.live.com/op/view.aspx?src=
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(normalizedUrl)}`;
    window.open(previewUrl, '_blank');
    return;
  }
  // #endif

  // #ifndef H5
  // 小程序环境：下载后使用 uni.openDocument 打开
  if (!isHttpsUrl(normalizedUrl)) {
    showError('小程序环境仅支持HTTPS协议');
    return;
  }

  uni.downloadFile({
    url: normalizedUrl,
    success: res => {
      if (res.statusCode === 200) {
        uni.openDocument({
          filePath: res.tempFilePath,
          success: () => {
            // 打开成功
          },
          fail: error => {
            console.error('打开文件失败:', error);
            showError('打开文件失败，请检查文件格式是否支持');
          },
        });
      } else {
        showError('文件下载失败');
      }
    },
    fail: () => {
      showError('文件下载失败');
    },
  });
  // #endif
};

/**
 * 预览文件（通用方法，自动判断文件类型）
 * @param fileUrl 文件URL
 * @param options 选项
 */
export const previewFile = (
  fileUrl: string,
  options?: {
    fileType?: string; // 文件类型（可选，如果不提供则从URL中提取）
    fileName?: string; // 文件名（可选，用于错误提示）
    urls?: string[]; // 图片URL数组（用于多图预览）
    current?: number; // 当前显示的图片索引（用于多图预览）
    onError?: (error: any) => void; // 错误回调
  }
): void => {
  const { fileType, fileName, urls, current, onError } = options || {};

  const normalizedUrl = normalizeFileUrl(fileUrl);
  if (!normalizedUrl) {
    const errorMsg = '文件地址无效';
    showError(errorMsg);
    onError?.(new Error(errorMsg));
    return;
  }

  // 获取文件类型
  const type = (fileType || getFileType(normalizedUrl)).toLowerCase();

  try {
    // 根据文件类型选择预览方式
    if (IMG_TYPES.includes(type)) {
      // 图片文件
      previewImage(normalizedUrl, urls, current);
    } else if (VIDEO_TYPES.includes(type)) {
      // 视频文件
      previewVideo(normalizedUrl);
    } else if (OFFICE_TYPES.includes(type)) {
      // Office 文件
      previewOffice(normalizedUrl, type);
    } else {
      // 不支持预览的文件类型，尝试下载
      const errorMsg = fileName
        ? `文件 "${fileName}" 暂不支持预览，请下载后查看`
        : '该类型文件暂不支持预览，请下载后查看';
      showError(errorMsg);
      onError?.(new Error(errorMsg));
    }
  } catch (error) {
    console.error('预览文件失败:', error);
    const errorMsg = '预览文件失败，请稍后重试';
    showError(errorMsg);
    onError?.(error);
  }
};

/**
 * 预览图片（便捷方法）
 * @param fileUrl 图片URL
 * @param urls 图片URL数组（可选，用于多图预览）
 * @param current 当前显示的图片索引（可选）
 */
export const previewImageFile = (fileUrl: string, urls?: string[], current?: number): void => {
  previewImage(fileUrl, urls, current);
};

/**
 * 预览 Office 文件（便捷方法）
 * @param fileUrl 文件URL
 * @param fileType 文件类型（可选）
 */
export const previewOfficeFile = (fileUrl: string, fileType?: string): void => {
  previewOffice(fileUrl, fileType);
};

/**
 * 检查文件类型是否支持预览
 * @param fileType 文件类型
 * @returns 是否支持预览
 */
export const isPreviewable = (fileType: string): boolean => {
  const type = fileType.toLowerCase();
  return IMG_TYPES.includes(type) || VIDEO_TYPES.includes(type) || OFFICE_TYPES.includes(type);
};

/**
 * 检查是否为图片文件
 * @param fileType 文件类型
 * @returns 是否为图片
 */
export const isImage = (fileType: string): boolean => {
  return IMG_TYPES.includes(fileType.toLowerCase());
};

/**
 * 检查是否为 Office 文件
 * @param fileType 文件类型
 * @returns 是否为 Office 文件
 */
export const isOfficeFile = (fileType: string): boolean => {
  return OFFICE_TYPES.includes(fileType.toLowerCase());
};

export default {
  previewFile,
  previewImageFile,
  previewOfficeFile,
  isPreviewable,
  isImage,
  isOfficeFile,
};
