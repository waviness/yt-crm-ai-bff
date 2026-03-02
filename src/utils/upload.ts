/**
 * 文件上传工具
 * 提供单文件和批量文件上传功能，兼容H5和微信小程序
 * 支持错误重试、文件验证等功能
 *
 * @fileoverview 文件上传工具类
 */

import type { UploadFileInfo } from '@/types/common';

// 常量定义
const UPLOAD_ENDPOINTS = {
  FILE_UPLOAD: (() => {
    // #ifdef MP-WEIXIN
    return `${import.meta.env.VITE_AUTHOR_API_URL}/comm/file/upload`;
    // #endif

    // #ifdef H5
    return `${import.meta.env.VITE_AUTHOR_API_PREFIX}/comm/file/upload`;
    // #endif
  })(),
} as const;

const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_RETRIES: 3,
} as const;

// 错误类型定义
export class UploadError extends Error {
  code?: string;
  file?: UploadFileInfo;

  constructor(message: string, options?: { code?: string; file?: UploadFileInfo }) {
    super(message);
    this.name = 'UploadError';
    this.code = options?.code;
    this.file = options?.file;
  }
}

// 上传选项接口
export interface UploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: UploadError) => void;
}

/**
 * 验证文件大小
 * @param file 文件对象
 * @throws {UploadError} 当文件不符合要求时抛出错误
 */
const validateFile = (file: UploadFileInfo): void => {
  if (file.file && file.file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    throw new UploadError('文件大小不能超过10MB', {
      code: 'FILE_TOO_LARGE',
      file,
    });
  }
};

/**
 * 上传单个文件到服务器
 * 支持错误处理和重试机制
 *
 * @param file 文件对象
 * @param options 上传选项
 * @returns Promise<string> 返回文件URL
 * @throws {UploadError} 当上传失败时抛出错误
 */
export const uploadSingleFile = async (
  file: UploadFileInfo,
  options?: UploadOptions
): Promise<string> => {
  // 验证文件大小
  validateFile(file);

  if (isH5()) {
    return uploadWithFormData(file, options);
  }

  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: UPLOAD_ENDPOINTS.FILE_UPLOAD,
      filePath: file.url || '',
      name: 'file',
      success: res => {
        try {
          const result = JSON.parse(res.data);
          if (result.success) {
            const fileUrl = result.data.url;
            options?.onSuccess?.(fileUrl);
            resolve(fileUrl);
          } else {
            const error = new UploadError(result.msg || '文件上传失败', {
              code: 'UPLOAD_FAILED',
              file,
            });
            options?.onError?.(error);
            reject(error);
          }
        } catch {
          const uploadError = new UploadError('解析上传结果失败', {
            code: 'PARSE_ERROR',
            file,
          });
          options?.onError?.(uploadError);
          reject(uploadError);
        }
      },
      fail: err => {
        console.error('文件上传失败:', err);
        const uploadError = new UploadError('文件上传失败', {
          code: 'UPLOAD_FAILED',
          file,
        });
        options?.onError?.(uploadError);
        reject(uploadError);
      },
    });
  });
};

/**
 * H5 端使用 FormData 上传文件
 * @param file 文件对象
 * @param options 上传选项
 * @returns Promise<string> 返回文件URL
 */
const uploadWithFormData = async (
  file: UploadFileInfo,
  options?: UploadOptions
): Promise<string> => {
  if (!file.file) {
    throw new UploadError('H5 端需要 File 对象', { code: 'INVALID_FILE', file });
  }

  const formData = new FormData();
  formData.append('file', file.file, file.file.name);

  try {
    const response = await fetch(UPLOAD_ENDPOINTS.FILE_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      options?.onSuccess?.(result.data.url);
      return result.data.url;
    } else {
      throw new UploadError(result.msg || '文件上传失败', {
        code: 'UPLOAD_FAILED',
        file,
      });
    }
  } catch {
    const uploadError = new UploadError('文件上传失败', {
      code: 'UPLOAD_FAILED',
      file,
    });
    options?.onError?.(uploadError);
    throw uploadError;
  }
};

/**
 * 带重试机制的文件上传
 * 当上传失败时自动重试，最多重试指定次数
 *
 * @param file 文件对象
 * @param options 上传选项
 * @param maxRetries 最大重试次数
 * @returns Promise<string> 返回文件URL
 */
export const uploadWithRetry = async (
  file: UploadFileInfo,
  options?: UploadOptions,
  maxRetries = UPLOAD_LIMITS.MAX_RETRIES
): Promise<string> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadSingleFile(file, options);
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error; // 最后一次重试失败，抛出错误
      }
      // 等待后重试，使用指数退避策略
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw new UploadError('上传重试次数已达上限', { code: 'MAX_RETRIES_EXCEEDED', file });
};

/**
 * 批量上传文件
 * 支持并发上传
 *
 * @param fileList 文件列表
 * @param options 上传选项
 * @returns Promise<string[]> 返回文件URL数组
 * @throws {UploadError} 当批量上传失败时抛出错误
 */
export const uploadFiles = async (
  fileList: UploadFileInfo[],
  options?: UploadOptions
): Promise<string[]> => {
  if (!fileList || fileList.length === 0) {
    return [];
  }

  try {
    // 并发上传所有文件
    const uploadPromises = fileList.map(file =>
      uploadWithRetry(file, {
        onSuccess: options?.onSuccess,
        onError: options?.onError,
      })
    );

    const urls = await Promise.all(uploadPromises);
    console.log('文件上传完成，URLs:', urls);
    return urls;
  } catch (error) {
    console.error('批量上传文件失败:', error);
    throw error;
  }
};
/**
 * 批量上传图片 且可以携带formdata
 *
 *
 * @param formData 包含要上传的文件数据以及其他表单字段
 * @param actionUrl 服务器接收文件上传的URL，类型为 string
 */
export const uploadFormdataPic = async (formData: any, actionUrl: string): Promise<string> => {
  try {
    const authStore = useAuthStore();
    const token = authStore.token || '';
    const response = await fetch(actionUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'X-TOKEN': token,
      },
    });
    const result = await response.json();
    if (result.success) {
      return result.data;
    } else {
      throw new UploadError(result.msg || '文件上传失败', {
        code: 'UPLOAD_FAILED',
      });
    }
  } catch {
    const uploadError = new UploadError('文件上传失败', {
      code: 'UPLOAD_FAILED',
    });
    throw uploadError;
  }
};
