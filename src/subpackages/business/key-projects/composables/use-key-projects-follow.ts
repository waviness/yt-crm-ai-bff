/**
 * 工作跟进composable
 */
import { ref } from 'vue';
import { KeyProjectsService } from '@/api/key-projects';
import type { GrItem, TargetItem, GoodsItem } from '../types';
import { usePagination } from '@/composables/use-pagination';

export const useKeyProjectsFollow = () => {
  const typeActive = ref('1'); // 1:GR 2:目标任务 3:目标品种
  const targetStatus = ref(1); // 1:待完成 2:已完成
  const dateRange = ref('');
  const goods = ref('');
  const grList = ref<GrItem[]>([]);
  const targetList = ref<TargetItem[]>([]);
  const goodsList = ref<GoodsItem[]>([]);
  const curDept = ref<any>({});
  const ccuId = ref('');
  const custId = ref('');

  const statusOptions = [
    { label: '待完成', value: 1 },
    { label: '已完成', value: 2 },
  ];

  // 格式化日期
  const formatSearchDate = (date: Date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  // 获取GR列表
  const fetchGrList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await KeyProjectsService.queryPlanListByPage({
      ccuId: ccuId.value,
      custId: custId.value,
      saleId: curDept.value.userId,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    if (response.success) {
      const list = response.data.list.map((item: any) => ({
        ...item,
        topicDetailVO: item.topicDetailVO || {
          smallTagName: '',
          visitTime: '',
          remark: '',
        },
      }));
      return {
        list,
        hasNextPage: response.data.hasNextPage,
        total: response.data.total,
      };
    }
    return { list: [], hasNextPage: false, total: 0 };
  };

  // 获取目标任务列表
  const fetchTargetList = async (params: { pageNum: number; pageSize: number }) => {
    const response = await KeyProjectsService.queryTargetListByPage({
      ccuId: ccuId.value,
      saleId: curDept.value.userId,
      status: targetStatus.value === 1 ? 0 : 1,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    if (response.success) {
      const list = response.data.list.map((item: any, index: number) => ({
        ...item,
        targetText: `目标${index + 1}`,
        targetTime: item.targetTime ? item.targetTime.split(' ')[0] : '',
      }));
      return {
        list,
        hasNextPage: response.data.hasNextPage,
        total: response.data.total,
      };
    }
    return { list: [], hasNextPage: false, total: 0 };
  };

  // 获取目标品种列表
  const fetchGoodsList = async (params: { pageNum: number; pageSize: number }) => {
    const [start, end] = dateRange.value
      ? dateRange.value.split('至').map(s => s.trim())
      : ['', ''];

    const response = await KeyProjectsService.queryGridGoodsListByPage({
      ccuId: ccuId.value,
      deptId: curDept.value.deptId,
      saleId: curDept.value.userId,
      goods: goods.value,
      start,
      end,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    });

    if (response.success) {
      return {
        list: response.data.list,
        hasNextPage: response.data.hasNextPage,
        total: response.data.total,
      };
    }
    return { list: [], hasNextPage: false, total: 0 };
  };

  // 删除GR项
  const deleteGrItem = async (item: GrItem) => {
    const res = await KeyProjectsService.delPlan({ cupId: item.cupId });
    if (res.success) {
      showSuccess(res.msg || '删除成功');
      return true;
    }
    return false;
  };

  // 删除目标任务
  const deleteTargetItem = async (item: TargetItem) => {
    const res = await KeyProjectsService.delTarget({ cutId: item.cutId });
    if (res.success) {
      showSuccess(res.msg || '删除成功');
      return true;
    }
    return false;
  };

  // 删除目标品种
  const deleteGoodsItem = async (item: GoodsItem) => {
    const res = await KeyProjectsService.delGridGoods({ cugId: item.cugId });
    if (res.success) {
      showSuccess(res.msg || '删除成功');
      return true;
    }
    return false;
  };

  // 完成任务
  const finishTarget = async (item: TargetItem) => {
    const params = {
      ccuId: ccuId.value,
      cutId: item.cutId,
      content: item.content,
      status: 1,
      targetTime: item.targetTime,
      deptId: curDept.value.deptId,
      deptName: curDept.value.deptName,
      saleId: curDept.value.userId,
      saleName: curDept.value.userName,
    };

    const res = await KeyProjectsService.modifyTarget(params);
    if (res.success) {
      showSuccess(res.msg || '修改成功');
      return true;
    }
    return false;
  };

  // 改变状态
  const changeStatusBase = (val: number) => {
    targetStatus.value = val;
  };

  return {
    typeActive,
    targetStatus,
    dateRange,
    goods,
    grList,
    targetList,
    goodsList,
    curDept,
    ccuId,
    custId,
    statusOptions,
    formatSearchDate,
    fetchGrList,
    fetchTargetList,
    fetchGoodsList,
    deleteGrItem,
    deleteTargetItem,
    deleteGoodsItem,
    finishTarget,
    changeStatusBase,
  };
};
