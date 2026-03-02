/**
 * 急救补单逻辑处理 Composable
 * 包含列表查询、筛选、分页、状态切换，回退/作废，重置等功能
 */
import type { PaginationParams } from '@/types/common';
import type { FirstAidOrderFilterData, FirstAidOrderOrderItem } from '../types';

// /**
//  * 构建API请求参数
//  * 根据筛选条件、配置信息和分页参数构建API请求所需的参数
//  * @param formData - 筛选表单数据
//  * @param type - 当前激活的标签页索引
//  * @param pagination - 分页参数
//  * @returns API请求参数对象
//  */
function buildApiParams(
  formData: FirstAidOrderFilterData,
  type: number,
  pagination: PaginationParams
) {
  const { starttime, endtime, customerid, customname, goodsid, goodsname } = formData;

  // 基础参数
  const baseParams = {
    starttime,
    endtime,
    customerid,
    customname,
    goodsid,
    goodsname,
  };
  return {
    ...baseParams,
    type, // 标签页类型
    deleteFlag: type === 0 ? false : true,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  };
}

/**
 * 急救订单管理相关的组合式函数
 * 用于处理急救订单的列表展示、筛选、状态变更等功能
 */
export function useFirstAidOrder() {
  // 筛选弹窗显示控制
  const filterShow = ref(false);
  // 获取全局状态管理
  const appStore = useAppStore();
  // 当前激活的标签页索引，默认为0
  const activeTab = ref(0); // 当前激活的标签页索引
  const statusList = reactive([{ name: '未处理' }, { name: '已作废' }]); // 状态列表
  // 表单数据
  const formData = ref<FirstAidOrderFilterData>({
    starttime: '',
    endtime: '',
    customerid: '',
    customname: '',
    goodsid: '',
    goodsname: '',
  });

  /**
   * 获取急救补单列表请求
   */
  const fetchOrderList = async (pagination: { pageNum: number; pageSize: number }) => {
    const params = buildApiParams(formData.value, activeTab.value, pagination);
    console.log('API请求参数:', params);
    const response = await FirstaidService.getEmergencyOrderInfo(params);
    console.log('API响应数据:', response);
    return {
      list: response.data.list,
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  /**
   * 急救补单作废/回退
   * @param item - 当前操作的订单项
   * @param index - 订单项在列表中的索引
   * @param nowType - 操作类型（0: 回退, 2: 作废）
   * @returns Promise - 返回一个Promise对象，表示操作结果
   */
  const fetchOperationForEmergencyOrder = async (item: any, nowType: number) => {
    let content = nowType === 2 ? '作废' : nowType === 0 ? '回退' : '';
    return new Promise(resolve => {
      uni.showModal({
        title: '确认',
        confirmButtonColor: '#2271f5',
        content: `确定${content}？`, // 注意这里是 content 而不是 message
        success: res => {
          if (res.confirm) {
            const params = {
              ddmxbhList: [item.ddmxbh],
              operationType: nowType,
            };
            console.log('API请求参数:', params);
            const response = { code: '200' } as any;
            // const response = await FirstaidService.operationForEmergencyOrder(params);
            if (response.code === '200') {
              showSuccess(`${content}成功`);
            } else {
              showError(`${content}失败`);
            }
            resolve(response);
          } else {
            return { code: 1 }; // 用户取消操作，返回一个默认值
          }
        },
      });
    });
  };
  const fetchEmergencyOrderMatchReset = async (item: any) => {
    return new Promise(resolve => {
      showModal({
        title: '确认',
        confirmColor: '#2271f5',
        content: `确定重置？`, // 注意这里是 content 而不是 message
        success: async res => {
          if (res.confirm) {
            const params = { ddmxbh: item.ddmxbh, ddbh: item.ddbh };
            console.log('API请求参数:', params);
            const response = { code: '200' } as any;
            // const response = await FirstaidService.emergencyOrderMatchReset(params);
            if (response.code === '200') {
              showSuccess(`重置成功`);
            } else {
              showError(`重置失败`);
            }
            resolve(response);
          } else {
            return { code: 1 }; // 用户取消操作，返回一个默认值
          }
        },
      });
    });
  };

  /**
   * 标签页切换处理
   */
  const handleActiveChange = ({ index }: { index: number }) => {
    activeTab.value = index;
  };

  /**
   * 筛选条件变更处理
   */
  const handleFilterChange = (filterVal: FirstAidOrderFilterData) => {
    formData.value = filterVal;
  };

  /**
   * 跳转到详情页
   */
  const toDetail = (data: FirstAidOrderOrderItem) => {
    appStore.setDetailObj(data);
    router.push(RouteMap.firstAidOrderDetail);
  };

  return {
    // 状态 - 返回可修改的响应式对象
    filterShow,
    statusList,
    activeTab,
    // 表单数据 - 返回可修改的响应式对象
    formData,
    // 方法
    fetchOrderList,
    handleActiveChange,
    handleFilterChange,
    toDetail,
    fetchOperationForEmergencyOrder,
    fetchEmergencyOrderMatchReset,
  };
}
