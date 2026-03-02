import { useAppStore } from '@/store/app';

/**
 * 客户订单审核详情页组合式API
 * 提供客户订单审核详情页的所有业务逻辑和数据管理
 */
export function useCustomerOrderApproveDetail() {
  const appStore = useAppStore();

  // 详情对象
  const detailObj = ref<any>({});

  // 细单列表
  const list = ref<any[]>([]);

  // 加载状态
  const loading = ref(false);

  // 审核弹窗显示状态
  const approveShow = ref(false);

  // 审核类型：1-通过 2-不通过
  const approveType = ref(0);

  // 选中的细单列表
  const result = ref<any[]>([]);

  /**
   * 获取订单细单列表
   */
  const fetchDetailList = async () => {
    loading.value = true;
    try {
      const { getOrderDtlSaler } = await import('@/api/customer-order-approve');
      const res = await getOrderDtlSaler({ invoiceid: detailObj.value.invoiceid });

      if (res.success) {
        list.value = res.data || [];
      } else {
        list.value = [];
        uni.showToast({
          title: res.msg || '获取详情失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      uni.showToast({
        title: '获取详情失败',
        icon: 'none',
      });
      list.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * 选中项变化事件
   * @param {Array} res - 选中的细单列表
   */
  const onChange = (res: any[]) => {
    result.value = res;
    console.log('选中项变化:', res);
  };

  /**
   * 审核操作
   * @param {number} type - 审核类型：1-通过 2-不通过
   */
  const onApprove = (type: number) => {
    if (!result.value.length) {
      uni.showToast({
        title: '请至少选择一条细单',
        icon: 'none',
      });
      return;
    }
    approveType.value = type;
    approveShow.value = true;
  };

  /**
   * 提交审核
   */
  const submitApprove = async () => {
    const params = result.value.map(({ invoiceid, invoicedtlid }: any) => {
      return {
        auditstatus: approveType.value,
        invoiceid,
        invoicedtlid,
      };
    });

    console.log('审核类型:', approveType.value);
    console.log('选中项:', result.value);
    console.log('提交参数:', params);

    try {
      const { updateInvoiceByInvoiceid } = await import('@/api/customer-order-approve');
      const res = await updateInvoiceByInvoiceid({ wxInvoiceDtlReqList: params });

      if (res.success) {
        uni.showToast({
          title: res.msg || '提交成功',
          icon: 'success',
        });
        approveShow.value = false;
        result.value = [];
        appStore.setHadDoneOnDetail(true);
        await fetchDetailList();
      } else {
        uni.showToast({
          title: res.msg || '提交失败',
          icon: 'none',
        });
      }
    } catch (error) {
      console.error('提交审核失败:', error);
      uni.showToast({
        title: '提交失败',
        icon: 'none',
      });
    }
  };

  return {
    detailObj,
    list,
    approveShow,
    approveType,
    result,
    fetchDetailList,
    onChange,
    onApprove,
    submitApprove,
  };
}
