import type { ProjectItem } from '../types';

export function useProjectDetail() {
  const detailInfo = ref<ProjectItem>({
    projectId: '',
    projectName: '',
    projectTypeName: '',
    projectInfo: '',
    projectGoodsResList: [],
    projectUserResList: [],
    fileVOList: [],
  });

  const activeTab = ref(0);

  const fetchDetail = async (projectId: string) => {
    // 如果需要从后端获取详情，取消下面的注释
    const response = await ProjectService.getDetail(projectId);
    detailInfo.value = response.data;
  };

  // 下载文件
  const downloadFile = (file: any) => {
    const { fileName, fileType, fileUrl } = file;
    const imgTypes = ['png', 'jpg', 'jpeg', 'svg', 'heic'];

    if (imgTypes.includes(fileType.toLowerCase())) {
      // 图片类型直接打开
      uni.previewImage({
        urls: [fileUrl],
        current: fileUrl,
      });
    } else {
      // 其他文件类型下载
      uni.downloadFile({
        url: fileUrl,
        success: res => {
          if (res.statusCode === 200) {
            uni.openDocument({
              filePath: res.tempFilePath,
              showMenu: true,
              success: () => {
                console.log('打开文档成功');
              },
              fail: err => {
                showError('文件打开失败');
                console.error(err);
              },
            });
          }
        },
        fail: err => {
          showError('文件下载失败');
          console.error(err);
        },
      });
    }
  };

  return {
    detailInfo,
    activeTab,
    fetchDetail,
    downloadFile,
  };
}
