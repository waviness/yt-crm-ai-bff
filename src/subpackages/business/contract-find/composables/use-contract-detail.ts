/**
 * 合同细单详情 Composable
 * 按页面轻复用原则，仅用于 detail.vue
 */
export function useContractDetail(conId: Ref<string>) {
  const list = ref<any[]>([]);
  const loading = ref(false);

  // 物流信息
  const logisticsInfor = ref<any[]>([]);
  const logisticsShow = ref(false);

  // 批号信息
  const lotInfor = ref<any[]>([]);
  const lotInformationShow = ref(false);

  // 两票制信息
  const erPzinfor = ref<any>({});
  const epzInformationShow = ref(false);
  const photoInfor = ref<any[]>([]);

  // 对话框
  const dialogShow = ref(false);
  const dialogContent = ref('');

  /**
   * 获取细单列表
   */
  const getDataList = async () => {
    loading.value = true;
    try {
      const res = await ContractService.queryContractDtlList({ conId: conId.value });

      list.value = res || [];
    } catch (error) {
      console.error('获取细单列表失败:', error);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 点击物流或两票制
   * @param type 1:物流 2:两票制
   * @param item 细单项
   */
  const onItemClick = async (type: number, item: any) => {
    if (type === 1) {
      // 物流信息
      try {
        const res = await ContractService.queryOrderStatusInfo({ condtlid: item.conDtlId });
        // 修复：接口返回 BaseResult<any>，真正的数组在 data 字段中
        logisticsInfor.value = res?.data || [];
        logisticsShow.value = true;
      } catch (error: any) {
        dialogShow.value = true;
        dialogContent.value = `该销售合同细单（${item.conDtlId}）${error?.errMsg || '查询失败'}`;
      }
    } else {
      // 两票制 - 批号信息
      try {
        const res = await ContractService.queryApiInformationsByCondtlid({
          condtlid: item.conDtlId,
        });
        // 修复：接口返回 BaseResult<any>，真正的数组在 data 字段中
        lotInfor.value = (res?.data || []).map((lot: any) => ({
          ...lot,
          factoryId: item.factoryId,
        }));
        lotInformationShow.value = true;
      } catch (error) {
        console.error('获取批号信息失败:', error);
      }
    }
  };

  /**
   * 批号点击事件
   */
  const lotInformationClick = async (item: any) => {
    if (item.sflpzhp === 1) {
      try {
        const res = await ContractService.queryLotNumberInfo(item);
        // 修复：接口返回 BaseResult<any>，真正的数据在 data 字段中
        if (res.data?.flag === 1) {
          erPzinfor.value = res.data;
          epzInformationShow.value = true;
          findPhoto();
        } else {
          dialogShow.value = true;
          dialogContent.value = res.data?.content;
        }
      } catch (error) {
        console.error('获取两票制信息失败:', error);
      }
    } else {
      dialogShow.value = true;
      dialogContent.value = '当前批号是非两票制';
    }
  };

  /**
   * 查找发票照片
   */
  const findPhoto = async () => {
    const { suinvno, suinvfirstno, salesdtlid } = erPzinfor.value;
    const params = {
      invno: suinvno,
      invfirstno: suinvfirstno,
      salesdtlid,
    };

    try {
      const res = await ContractService.querySuInvkcPic(params);
      // 修复：接口返回 BaseResult<any>，真正的数组在 data 字段中
      photoInfor.value = res?.data || [];
    } catch (error) {
      console.error('获取发票照片失败:', error);
    }
  };

  /**
   * 预览图片
   */
  const previewImg = (index: number) => {
    const images = photoInfor.value.map((item: any) => item.inv_pic);
    uni.previewImage({
      urls: images,
      current: index,
    });
  };

  /**
   * 格式化物流时间
   */
  const formatLogisticsTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return {
    // 数据
    list,
    loading,
    logisticsInfor,
    logisticsShow,
    lotInfor,
    lotInformationShow,
    erPzinfor,
    epzInformationShow,
    photoInfor,
    dialogShow,
    dialogContent,
    // 方法
    getDataList,
    onItemClick,
    lotInformationClick,
    previewImg,
    formatLogisticsTime,
  };
}
