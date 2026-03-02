/**
 * 急救补单详情逻辑 Composable
 * 包含列表查询、分页、点选匹配等功能
 */
import type { PaginationParams } from '@/types/common';
import type { FirstAidOrderDetailData, FirstAidOrderOrderDetailListObj } from '../types';
// Store
const appStore = useAppStore(); // 获取订单详情
const detailItem: any = computed(() => appStore.detailObj);
function buildApiParams(config: FirstAidOrderDetailData, pagination: PaginationParams) {
  const { customid, goodsid, goodsqty, entryId } = config;

  // 基础参数
  const baseParams = {
    customid,
    goodsid,
    goodsqty,
    entryId,
  };
  return {
    ...baseParams,
    pageNum: pagination.pageNum,
    pageSize: pagination.pageSize,
  };
}

export function useFirstAidOrderDetail() {
  // 查看参数数据
  const findDetail = ref<FirstAidOrderDetailData>({
    customid: detailItem.value?.erpcustomid || '',
    goodsid: detailItem.value?.erpid || '',
    goodsqty: detailItem.value?.erp_cgsl || '',
    entryId: detailItem.value?.entryid || '',
  });

  /**
   * 查细单列表API调用
   * @param pagination 分页参数
   * @returns 包含列表数据、是否有下一页和总数的Promise
   */
  const fetchEmergencyOrderMatchDetail = async (pagination: {
    pageNum: number;
    pageSize: number;
  }): Promise<{
    list: FirstAidOrderOrderDetailListObj[]; // 明确 list 的类型
    hasNextPage: boolean;
    total: number;
  }> => {
    const params = buildApiParams(findDetail.value, pagination);
    console.log('API请求参数:', params);
    const response = await FirstaidService.emergencyOrderMatchDetail(params);
    console.log('API响应数据:', response);
    return {
      list: response.data.list as FirstAidOrderOrderDetailListObj[], // 确保类型正确
      hasNextPage: response.data.hasNextPage,
      total: response.data.total,
    };
  };
  /**
   * 匹配提交API调用
   */
  const fetchEmergencyOrderMatchSubmit = async (datalist: any) => {
    console.log('当前列表数据:', datalist);
    return new Promise(resolve => {
      // 构建提交参数
      const params: any = [];
      let mergeNumber: number = 0;
      for (let index = 0; index < datalist.length; index++) {
        const element = datalist[index];
        if (element.checked) {
          mergeNumber += element.goodsqty;
          params.push(
            Object.assign(
              {
                ...element,
              },
              {
                hzddmxbh: detailItem.value?.ddmxbh,
                hzddbh: detailItem.value?.ddbh,
              }
            )
          );
        }
      }
      console.log('匹配提交参数:', params);
      if (params.length <= 0) {
        showError('请选择销售细单');
        return;
      } else if (mergeNumber > detailItem.value?.erp_cgsl) {
        showError('销售细单数量不能大于补单数量');
        return;
      }
      // FirstaidService.emergencyOrderMatchSubmit({ bmsSaDtls: params }).then(res => {
      //   if (res.code === '200') {
      //     showSuccess(res.msg);
      // resolve({ code: '200' });
      //   }
      // });
      resolve({ code: '200' });
    });
  };

  return {
    detailItem, // 订单详情
    // API调用函数
    fetchEmergencyOrderMatchDetail,
    fetchEmergencyOrderMatchSubmit,
  };
}
