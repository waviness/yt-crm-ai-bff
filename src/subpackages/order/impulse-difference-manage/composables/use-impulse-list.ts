/**
 * 冲差管理列表页面业务逻辑
 */
import type { ImpulseInfo, ImpulseFilterData, ImpulseQueryParams } from '../types';

export const useImpulseList = () => {
  const appStore = useAppStore();

  // 响应式数据
  const active = ref(0);
  const fileShow = ref(false);
  const curFiles = ref<any[]>([]);

  // 筛选条件
  const formData = ref<ImpulseFilterData>({
    docId: '',
    dtlId: '',
    goods: '',
    customer: '',
    factory: '',
    start: '',
    end: '',
  });

  // 获取数据列表
  const fetchImpulseList = async (params: { pageNum: number; pageSize: number }) => {
    const { docId, dtlId, goods, customer, factory, start, end } = formData.value;
    const requestParams: ImpulseQueryParams = {
      docId,
      dtlId,
      goods,
      customer,
      factory,
      start,
      end,
      status: active.value + 1,
      pageNum: params.pageNum,
      pageSize: params.pageSize,
    };

    const res = await ImpulseService.queryGoodsCC(requestParams);

    return {
      list: res?.list || [],
      total: res?.total || 0,
    };
  };

  // 筛选条件变化
  const handleFilterChange = (
    filterVal: ImpulseFilterData,
    resetAndFetchData: () => Promise<void>
  ) => {
    formData.value = filterVal;
    resetAndFetchData();
  };

  // 标签页切换
  const handleActiveChange = (resetAndFetchData: () => Promise<void>) => {
    resetAndFetchData();
  };

  // 跳转到详情页
  const toDetail = (item: ImpulseInfo) => {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.impulseDifferenceManageDetail, {
      statusType: active.value + 1,
      docId: item.id,
    });
  };

  // 下载文件
  const download = (files: any[]) => {
    if (files.length === 1) {
      _downloadFile(files[0]);
    } else {
      fileShow.value = true;
      curFiles.value = files;
    }
  };

  // 下载单个文件
  const _downloadFile = (file: any) => {
    const fileUrl = file.address;
    // 所有文件（包括图片）都跳转到下载页面进行下载
    router.push(RouteMap.download, {
      fileUrl,
    });
  };

  return {
    // 响应式数据
    active,
    fileShow,
    curFiles,
    formData,

    // 方法
    fetchImpulseList,
    handleFilterChange,
    handleActiveChange,
    toDetail,
    download,
    _downloadFile,
  };
};
