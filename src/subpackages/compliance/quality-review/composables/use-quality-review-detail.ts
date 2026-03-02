import type { QualityReviewDetail } from '../types';

export function useQualityReviewDetail() {
  const reviewDetail = ref<QualityReviewDetail | null>(null);
  const loading = ref(false);

  // 获取详情
  const fetchDetail = async (recheckId: string) => {
    loading.value = true;
    try {
      const res = await QualityService.getQualityRecheckDetail({
        recheckId,
      });
      reviewDetail.value = res;
    } catch (error) {
      showError('获取详情失败');
    } finally {
      loading.value = false;
    }
  };

  // 获取来源文本
  const getComeFromText = computed(() => {
    if (!reviewDetail.value) return '';
    const { comeFrom } = reviewDetail.value;
    return comeFrom === 10
      ? '入库收货'
      : comeFrom === 13
        ? '销退验收'
        : comeFrom === 12
          ? '销退收货'
          : '';
  });

  // 获取审核状态文本
  const getAuditFlagText = computed(() => {
    if (!reviewDetail.value?.auditFlag) return '';
    const { auditFlag } = reviewDetail.value;
    return auditFlag === 1 ? '合格' : auditFlag === 2 ? '不合格' : auditFlag === 5 ? '拒收' : '';
  });

  // 获取审核状态颜色类
  const getAuditFlagColor = computed(() => {
    if (!reviewDetail.value?.auditFlag) return '';
    const { auditFlag } = reviewDetail.value;
    return auditFlag === 1
      ? 'color-success'
      : auditFlag === 2
        ? 'color-warning'
        : auditFlag === 5
          ? 'color-error'
          : '';
  });

  return {
    reviewDetail,
    loading,
    fetchDetail,
    getComeFromText,
    getAuditFlagText,
    getAuditFlagColor,
  };
}
