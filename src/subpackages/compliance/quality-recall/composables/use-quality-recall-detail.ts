import type { QualityRecallDetail } from '../types';

export function useQualityRecallDetail() {
  const appStore = useAppStore();
  const recallDetail = ref<QualityRecallDetail | null>(null);
  const loading = ref(false);
  const expectQty = ref(''); // 拟召回数量
  const fileList = ref<any[]>([]); // 上传文件列表

  // 获取详情
  const fetchDetail = async (cgrId: string) => {
    loading.value = true;
    try {
      const res = await QualityService.getGspRecoverDtlByCgrId({
        cgrId,
      });

      recallDetail.value = res;

      // 处理图片列表
      if (res.imageUrlList && res.imageUrlList.length > 0) {
        recallDetail.value.imageUrlList = res.imageUrlList.map((url: string) => ({
          url: `${import.meta.env.VITE_APP_BASE_URL}${url}`,
        }));
      }

      // 如果有拟召回数量，赋值给表单
      if (res.expectQty !== undefined && res.expectQty !== null) {
        expectQty.value = String(res.expectQty);
      }
    } catch (error) {
      showError('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  // 获取召回级别文本
  const getRecLevelText = computed(() => {
    if (!recallDetail.value) return '';
    const { recLevel } = recallDetail.value;
    return recLevel === 3 ? '三级' : recLevel === 2 ? '二级' : recLevel === 1 ? '一级' : '';
  });

  // 获取剩余天数标签类型
  const getDeadlineTagType = computed(() => {
    if (!recallDetail.value?.toDeadlineDays) return null;
    return recallDetail.value.toDeadlineDays < 0 ? 'error' : 'success';
  });

  // 获取剩余天数文本
  const getDeadlineText = computed(() => {
    if (!recallDetail.value?.toDeadlineDays) return '';
    const days = Math.abs(recallDetail.value.toDeadlineDays);
    return recallDetail.value.toDeadlineDays < 0 ? `已过期${days}天` : `距到期还剩${days}天`;
  });

  // 提交处理
  const handleSubmit = async (params: {
    cgrId: string;
    recDocId: string;
    recDtlId: string;
    selectType: number;
  }) => {
    if (fileList.value.length === 0) {
      showError('请选择要上传的图片');
      return false;
    }

    if (params.selectType === 1 && !expectQty.value) {
      showError('请输入拟召回数量');
      return false;
    }

    try {
      const formData = new FormData();

      // 添加图片文件
      fileList.value.forEach((file, index) => {
        const fileName = file.file.name;
        const fileExt = fileName.substring(fileName.lastIndexOf('.'));
        const newFile = new File([file.file], `index${index}${fileExt}`);
        formData.append('receiptImageList', newFile);
      });

      // 添加其他参数
      formData.append('cgrId', params.cgrId);
      formData.append('recDocId', params.recDocId);
      formData.append('recDtlId', params.recDtlId);
      formData.append(
        'expectQty',
        params.selectType === 2 ? String(recallDetail.value?.expectQty || 0) : expectQty.value
      );

      await QualityService.dealGspRecover(formData);

      showSuccess('提交成功');
      appStore.setHadDoneOnDetail(true);
      return true;
    } catch (error) {
      showError('提交失败');
      return false;
    }
  };

  return {
    recallDetail,
    loading,
    expectQty,
    fileList,
    fetchDetail,
    getRecLevelText,
    getDeadlineTagType,
    getDeadlineText,
    handleSubmit,
  };
}
