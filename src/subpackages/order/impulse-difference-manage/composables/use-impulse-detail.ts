/**
 * 冲差管理详情页面业务逻辑
 */
import type {
  ImpulseDetailInfo,
  ImpulseDetailQueryParams,
  ImpulseFileUploadParams,
  ImpulseSubmitParams,
} from '../types';

export const useImpulseDetail = () => {
  // 响应式数据
  const loading = ref(false);
  const list = ref<ImpulseDetailInfo[]>([]);
  const submitShow = ref(false);
  const replenishDesc = ref('');
  const curData = ref<any>({});
  const imgShow = ref(false);
  const showType = ref(0); // 1上传图片 2查看图片
  const imgSubmiting = ref(false);

  // 获取详情列表
  const getDetailList = async (docId: string | number, statusType: number) => {
    const params: ImpulseDetailQueryParams = {
      docId,
      status: statusType,
    };

    loading.value = true;
    const res = await ImpulseService.queryCCDtl(params);
    loading.value = false;

    list.value = [...res];
    loading.value = false;
  };

  // 处理操作
  const onSubmit = (type: number, data: any) => {
    curData.value = data;
    if (type === 3) {
      replenishDesc.value = '';
      submitShow.value = true;
    } else {
      imgShow.value = true;
      showType.value = type;
    }
  };

  // 提交图片
  const submitImg = async (list: any[]) => {
    const { docId, id } = curData.value;
    const imgArr: ImpulseFileUploadParams[] = list.map((item: any) => ({
      docId,
      dtlId: id,
      url: item.url,
    }));

    imgSubmiting.value = true;
    await ImpulseService.updateCCFile(imgArr);
    imgSubmiting.value = false;

    showSuccess('上传成功');
    imgShow.value = false;
    imgSubmiting.value = false;
  };

  // 提交说明
  const submitDesc = async () => {
    const params: ImpulseSubmitParams = {
      dtlId: curData.value.id,
      memo: replenishDesc.value,
      userId: curData.value.salerId,
    };

    await ImpulseService.submitGoodsCC(params);
    showSuccess('提交成功');
    submitShow.value = false;
  };

  return {
    // 响应式数据
    loading,
    list,
    submitShow,
    replenishDesc,
    curData,
    imgShow,
    showType,
    imgSubmiting,

    // 方法
    getDetailList,
    onSubmit,
    submitImg,
    submitDesc,
  };
};
