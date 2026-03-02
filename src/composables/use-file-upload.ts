/**
 * 文件上传功能 Composable
 * 提供通用的文件上传相关功能
 */

import type { UploadFileInfo } from '@/types/common';

/**
 * 使用文件上传功能
 * 提供文件列表管理、删除、读取处理等功能
 *
 * @returns 文件上传相关的方法和状态
 */
export function useFileUpload() {
  const fileList = ref<UploadFileInfo[]>([]);

  /**
   * 删除文件
   */
  const deletePic = (event: { index: number }) => {
    fileList.value.splice(event.index, 1);
  };

  /**
   * 文件读取后处理
   */
  const afterRead = async (event: { file: any[] | any }) => {
    const lists = Array.isArray(event.file) ? event.file : [event.file];

    lists.forEach((item: any) => {
      fileList.value.push({
        ...item,
        status: 'success',
        message: '',
      });
    });
  };

  /**
   * 清空文件列表
   */
  const clearFiles = () => {
    fileList.value = [];
  };

  /**
   * 获取文件数量
   */
  const getFileCount = () => {
    return fileList.value.length;
  };

  return {
    fileList,
    deletePic,
    afterRead,
    clearFiles,
    getFileCount,
  };
}
