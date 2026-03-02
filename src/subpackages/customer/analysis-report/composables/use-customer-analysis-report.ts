import { CustomerFollowService } from '@/api/customer-follow';
import type { DashboardData, VisitDetail, Event, RecommendationItem, KeyEvent } from '../types';

/**
 * 客情分析推送报告业务逻辑
 */
export const useCustomerAnalysisReport = () => {
  // ========== 状态管理 ==========
  const loading = ref(false);
  const error = ref('');
  const showAllUnits = ref(false);
  const showAllActivities = ref(false);
  const updateTime = ref('');

  // 详情模态框
  const showDetailModal = ref(false);
  const selectedEvent = ref<Event>({
    userName: '',
    visitTime: '',
    keyInfo: '',
    fullRemark: '',
  });

  // 推荐详情模态框
  const showRecommendationModal = ref(false);
  const selectedRecommendation = ref<RecommendationItem>({
    description: '',
    cuvIds: [],
  });

  // 拜访记录详情
  const visitDetails = ref<VisitDetail[]>([]);
  const detailLoading = ref(false);

  // 仪表盘数据
  const dashboardData = ref<DashboardData>({
    overview: {
      totalVisits: 0,
      mainUnits: [],
      salespersonActivity: [],
      summary: '',
    },
    keyEvents: [],
    recommendations: {
      urgentFollowUp: [],
      leadershipAttention: [],
      potentialRisksOpportunities: [],
    },
  });

  // ========== 计算属性 ==========
  // 展示的主要单位（默认3条）
  const displayedMainUnits = computed(() => {
    const list = dashboardData.value.overview.mainUnits || [];
    return showAllUnits.value ? list : list.slice(0, 3);
  });

  // 统一转换成 [{name, visitCount}] 形式
  const activityListNormalized = computed(() => {
    const activities = dashboardData.value.overview.salespersonActivity;
    if (!activities) return [];

    if (Array.isArray(activities)) {
      return activities.map((it: any) => ({
        name: it.name || '',
        visitCount: it.visitCount || 0,
      }));
    }

    // object 形式: { name: count, ... }
    return Object.keys(activities).map(name => ({
      name,
      visitCount: activities[name] || 0,
    }));
  });

  // 展示的活动数据（默认3条）
  const displayedActivities = computed(() => {
    const list = activityListNormalized.value;
    return showAllActivities.value ? list : list.slice(0, 3);
  });

  // ========== 方法 ==========
  /**
   * 获取总事件数
   */
  const getTotalEvents = () => {
    if (!Array.isArray(dashboardData.value.keyEvents)) {
      return 0;
    }
    return dashboardData.value.keyEvents.reduce((total, unitEvent) => {
      return total + (Array.isArray(unitEvent.events) ? unitEvent.events.length : 0);
    }, 0);
  };

  /**
   * 获取活动百分比
   */
  const getActivityPercentage = (count: number): number => {
    const activities = dashboardData.value.overview.salespersonActivity;
    if (!activities || typeof activities !== 'object') {
      return 0;
    }

    let values: number[] = [];

    if (Array.isArray(activities)) {
      values = activities
        .map(item => (typeof item === 'object' && item !== null ? item.visitCount || 0 : 0))
        .filter(v => typeof v === 'number' && !isNaN(v));
    } else {
      values = Object.values(activities).filter(v => typeof v === 'number' && !isNaN(v));
    }

    if (values.length === 0) {
      return 0;
    }

    const maxCount = Math.max(...values);
    return maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
  };

  /**
   * 格式化日期时间
   */
  const formatDateTime = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  /**
   * 获取数据
   */
  const fetchData = async (curId: number) => {
    loading.value = true;
    error.value = '';

    try {
      if (!curId || isNaN(curId)) {
        throw new Error('缺少有效的curId参数');
      }

      const response = await CustomerFollowService.getUvaiResult({ curId });

      if (response && response.data && response.data.content) {
        try {
          const contentData = JSON.parse(response.data.content);
          const overview = contentData.overview || {};

          let mainUnits = overview.mainUnits || [];
          if (!Array.isArray(mainUnits)) {
            mainUnits = [];
          }

          let salespersonActivity = overview.salespersonActivity || {};

          // 处理keyEvents数据
          let processedKeyEvents: KeyEvent[] = [];

          if (contentData.keyEvents) {
            if (Array.isArray(contentData.keyEvents)) {
              processedKeyEvents = contentData.keyEvents;
            } else if (typeof contentData.keyEvents === 'object') {
              Object.entries(contentData.keyEvents).forEach(([unit, events]) => {
                if (Array.isArray(events)) {
                  processedKeyEvents.push({
                    unit,
                    events: events.map((e: any) => ({
                      userName: e.userName || '',
                      visitTime: e.visitTime || '',
                      keyInfo: e.keyInfo || '',
                      fullRemark: e.fullRemark || '',
                      cuvId: e.cuvId || '',
                    })),
                  });
                }
              });
            }
          }

          dashboardData.value = {
            overview: {
              totalVisits: overview.totalVisits || 0,
              mainUnits: mainUnits,
              salespersonActivity: salespersonActivity,
              summary: overview.summary || '',
            },
            keyEvents: processedKeyEvents,
            recommendations: contentData.recommendations || {
              urgentFollowUp: [],
              leadershipAttention: [],
              potentialRisksOpportunities: [],
            },
          };
        } catch (parseError) {
          console.error('JSON解析失败:', parseError);
          throw new Error('数据格式解析错误');
        }
      } else {
        throw new Error('响应数据格式不正确');
      }

      // 处理时间范围
      if (response && response.data && response.data.uvParams) {
        try {
          const uvParamsStr = response.data.uvParams;
          const normalizedUvParamsStr = uvParamsStr.replace(/\\"/g, '"');
          const uvParams = JSON.parse(normalizedUvParamsStr);

          if (uvParams.startDate && uvParams.endDate) {
            const startDate = uvParams.startDate.split(' ')[0];
            const endDate = uvParams.endDate.split(' ')[0];
            updateTime.value = `${startDate} 到 ${endDate}`;
          } else {
            updateTime.value = formatDateTime(new Date());
          }
        } catch (e) {
          console.error('解析UV_PARAMS失败:', e);
          updateTime.value = formatDateTime(new Date());
        }
      } else {
        updateTime.value = formatDateTime(new Date());
      }
    } catch (err) {
      console.error('获取数据失败:', err);
      error.value = err instanceof Error ? err.message : '获取数据失败';
    } finally {
      loading.value = false;
    }
  };

  /**
   * 获取拜访记录详情
   */
  const fetchVisitDetails = async (cuvIds: string[]) => {
    if (!cuvIds || cuvIds.length === 0) {
      visitDetails.value = [];
      detailLoading.value = false;
      return;
    }

    detailLoading.value = true;
    visitDetails.value = [];

    try {
      const cuvIdList = cuvIds.join(',');
      const response = await CustomerFollowService.getUserVisitListByCuvId({ cuvIdList });

      if (response && Array.isArray(response)) {
        const companyTypeMap: Record<string, string> = {
          '1': '供应商',
          '2': '下游客户',
          '3': '政府单位',
          '4': '数智医贸客户',
        };

        const taskTypeMap: Record<string, string> = {
          '1': '随访',
          '2': '协访',
        };

        visitDetails.value = response.map((item: any) => ({
          address: item.address || item.cuvName || item.companyName || '暂无',
          visitUserName: item.visitUserName || item.visitUserPosition || '暂无',
          visitUserPosition: item.visitUserPosition || item.visitUserPhoneNum || '暂无',
          companyName: item.companyName || item.cuvName || '暂无',
          companyType: companyTypeMap[item.companyType] || '',
          visitTime: item.visitTime || item.createDate || '暂无',
          taskType: taskTypeMap[item.taskType] || '个人拜访',
          remark:
            (item.crmLabelRemarkDtoList &&
              Array.isArray(item.crmLabelRemarkDtoList) &&
              item.crmLabelRemarkDtoList.length > 0 &&
              item.crmLabelRemarkDtoList[0].remark) ||
            item.remark ||
            item.crmVisitComment ||
            '暂无',
          crmLabelRemarkDtoList: item.crmLabelRemarkDtoList || [],
          creName: item.creName || item.userName || item.visitUserName || '暂无',
        }));
      } else {
        console.warn('API返回数据格式不正确:', response);
        visitDetails.value = [];
      }
    } catch (error) {
      console.error('获取拜访记录详情失败:', error);
      visitDetails.value = [];
    } finally {
      detailLoading.value = false;
    }
  };

  /**
   * 显示事件详情
   */
  const showEventDetail = (event: Event) => {
    selectedEvent.value = event;
    showDetailModal.value = true;

    if (event.cuvId) {
      fetchVisitDetails([event.cuvId]);
    } else {
      visitDetails.value = [];
      detailLoading.value = false;
    }
  };

  /**
   * 关闭事件详情
   */
  const closeDetailModal = () => {
    showDetailModal.value = false;
    visitDetails.value = [];
  };

  /**
   * 显示推荐详情
   */
  const showRecommendationDetail = (recommendation: RecommendationItem) => {
    selectedRecommendation.value = recommendation;
    showRecommendationModal.value = true;

    if (recommendation.cuvIds && recommendation.cuvIds.length > 0) {
      fetchVisitDetails(recommendation.cuvIds);
    } else {
      visitDetails.value = [];
      detailLoading.value = false;
    }
  };

  /**
   * 关闭推荐详情
   */
  const closeRecommendationModal = () => {
    showRecommendationModal.value = false;
    visitDetails.value = [];
  };

  /**
   * 切换单位展示
   */
  const toggleUnits = () => {
    showAllUnits.value = !showAllUnits.value;
  };

  /**
   * 切换活动展示
   */
  const toggleActivities = () => {
    showAllActivities.value = !showAllActivities.value;
  };

  return {
    // 状态
    loading,
    error,
    showAllUnits,
    showAllActivities,
    updateTime,
    showDetailModal,
    selectedEvent,
    showRecommendationModal,
    selectedRecommendation,
    visitDetails,
    detailLoading,
    dashboardData,

    // 计算属性
    displayedMainUnits,
    activityListNormalized,
    displayedActivities,

    // 方法
    getTotalEvents,
    getActivityPercentage,
    fetchData,
    showEventDetail,
    closeDetailModal,
    showRecommendationDetail,
    closeRecommendationModal,
    toggleUnits,
    toggleActivities,
  };
};
