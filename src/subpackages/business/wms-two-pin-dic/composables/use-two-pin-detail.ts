import type { TwoPinGoodsItem } from '../types';

export function useTwoPinDetail() {
  const appStore = useAppStore();

  // 商品基础信息
  const goodsInfo = ref<TwoPinGoodsItem>({} as TwoPinGoodsItem);

  // 是否从消息模块跳转
  const isFromMessage = ref(false);

  // 当前Tab状态 0-未处理 1-已处理
  const activeTab = ref(0);

  // 详情列表
  const goodsDtlList = ref<any[]>([]);

  // 当前展开的卡片索引
  const chooseIndex = ref(-1);

  // 弹窗显示状态
  const showPopup = ref(false);

  // 是否批量处理
  const isAll = ref(false);

  // 当前操作的商品
  const nowGoods = ref<any>({});

  // 当前操作的任务
  const nowTask = ref<any>({});

  // 上传的文件列表
  const fileList = ref<any[]>([]);

  // 图片列表
  const imgList = ref<string[]>([]);

  // 图片加载状态
  const imgLoading = ref(false);

  // 是否加载完成
  const finished = ref(false);

  // 当前图片页码
  const imgPage = ref(1);

  // 图片总数
  const imgTotal = ref(0);

  // 初始化
  const init = async (options: any) => {
    showPopup.value = false;

    // 判断是从消息模块还是列表跳转
    if (options.entryId && options.goodsId && options.storageId) {
      // 从消息模块跳转（query方式）
      isFromMessage.value = true;
      await handleMessageRoute(options);
    } else if (options.item) {
      // 从列表跳转（params方式）
      isFromMessage.value = false;
      await handleListRoute(options);
    }
  };

  // 处理从消息模块的跳转
  const handleMessageRoute = async (query: any) => {
    // 先获取图片信息判断状态
    const imgRes = await TwoPinService.getimgsPqsc({
      shareEntryId: query.entryId,
      goodsId: query.goodsId,
      goodsStatusId: query.goodsStatusId,
      lotid: query.lotid,
      storageId: query.storageId,
      pageNum: 1,
      pageSize: 1,
      cpsiId: query.cpsiId,
    });

    if (imgRes.list && imgRes.list.length > 0) {
      activeTab.value = imgRes.list[0].pqcsFlag;
      imgList.value = imgRes.list[0].imgList || [];
    }

    // 获取详情列表
    await fetchGoodsDtl({
      entryId: query.entryId,
      goodsId: query.goodsId,
      storageId: query.storageId,
      lotid: query.lotid,
      cpsiId: query.cpsiId,
      pqcsFlag: activeTab.value,
    });

    // 设置商品基础信息
    if (goodsDtlList.value.length > 0) {
      goodsInfo.value = goodsDtlList.value[0];
    }
  };

  // 处理从列表的跳转
  const handleListRoute = async (params: any) => {
    try {
      const item = typeof params.item === 'string' ? JSON.parse(params.item) : params.item;
      goodsInfo.value = item;
      activeTab.value = Number(params.index) || 0;

      await fetchGoodsDtl({
        entryId: item.entryId,
        goodsId: item.goodsId,
        storageId: item.storageId,
        pqcsFlag: activeTab.value,
      });
    } catch (error) {
      console.error('解析参数失败:', error);
      showError('参数解析失败');
    }
  };

  // 获取商品详情列表
  const fetchGoodsDtl = async (params: any) => {
    try {
      const res = await TwoPinService.getGoodsDtlPcsq(params);
      goodsDtlList.value = res || [];

      if (goodsDtlList.value.length === 0) {
        showToast('无细单列表');
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      showError('获取详情失败');
    }
  };

  // 展开/收起详情
  const showMore = (index: number) => {
    chooseIndex.value = chooseIndex.value === index ? -1 : index;
  };

  // 点击任务上传/查看按钮
  const handleTaskClick = (task: any, index: number) => {
    isAll.value = false;
    nowGoods.value = goodsDtlList.value[index];
    nowTask.value = task;
    showPopup.value = true;
    fileList.value = [];
    imgList.value = [];

    if (activeTab.value === 1) {
      imgPage.value = 1;
      finished.value = false;
      loadImages();
    }
  };

  // 批量处理
  const handleBatchProcess = (index: number) => {
    isAll.value = true;
    nowGoods.value = goodsDtlList.value[index];
    nowTask.value = {};
    showPopup.value = true;
    fileList.value = [];
    imgList.value = [];

    if (activeTab.value === 1) {
      imgPage.value = 1;
      finished.value = false;
      loadImages();
    }
  };

  // 加载图片
  const loadImages = async () => {
    if (imgLoading.value || finished.value) return;

    imgLoading.value = true;

    try {
      const params: any = {
        entryId: goodsInfo.value.entryId,
        goodsId: goodsInfo.value.goodsId,
        goodsStatusId: goodsInfo.value.goodsStatusId,
        lotid: goodsInfo.value.lotid,
        pqcsFlag: 1,
        storageId: goodsInfo.value.storageId,
        pageNum: imgPage.value,
        pageSize: 100,
      };

      // 如果不是批量处理，需要传cpsiId
      if (!isAll.value && nowTask.value?.cpsiId) {
        params.cpsiId = nowTask.value.cpsiId;
      }

      const res = await TwoPinService.getimgsPqsc(params);

      if (res.list && res.list.length > 0) {
        res.list.forEach((element: any) => {
          if (element.imgList && element.imgList.length > 0) {
            imgList.value.push(...element.imgList);
          }
        });
      }

      imgTotal.value = res.total || 0;

      // 判断是否加载完成
      if (imgPage.value * 100 >= imgTotal.value) {
        finished.value = true;
      } else {
        imgPage.value++;
      }
    } catch (error) {
      console.error('加载图片失败:', error);
    } finally {
      imgLoading.value = false;
    }
  };

  // 加载更多图片
  const loadMoreImages = () => {
    if (!finished.value && !imgLoading.value) {
      loadImages();
    }
  };

  // 预览图片
  const previewImage = (index: number) => {
    uni.previewImage({
      urls: imgList.value,
      current: index,
    });
  };

  // 提交照片
  const submitPhotos = async () => {
    if (fileList.value.length === 0) {
      showToast('请选择要上传的图片');
      return;
    }

    // 获取cpsiId列表
    const cpsiIdList: string[] = [];
    if (!nowTask.value || !nowTask.value.cpsiId) {
      // 批量处理，获取所有任务的cpsiId
      nowGoods.value.pqcsImgRecordList?.forEach((record: any) => {
        if (record.cpsiId) {
          cpsiIdList.push(record.cpsiId);
        }
      });
    } else {
      // 单个任务
      cpsiIdList.push(nowTask.value.cpsiId);
    }

    try {
      // 构建FormData
      const formData = new FormData();

      fileList.value.forEach((file, index) => {
        const fileName = `image_${index}.${file.url.split('.').pop()}`;
        formData.append('imgs', {
          uri: file.url,
          type: file.type || 'image/jpeg',
          name: fileName,
        } as any);
      });

      formData.append('cpsiIds', cpsiIdList.join(','));

      // 上传照片
      await TwoPinService.uploadPhotos(formData);

      showSuccess('上传成功');
      showPopup.value = false;
      appStore.setHadDoneOnDetail(true);

      // 延迟刷新列表
      setTimeout(async () => {
        // 如果只有一条且是唯一任务，切换到已处理
        const shouldSwitchTab =
          goodsDtlList.value.length === 1 &&
          (!nowTask.value?.cpsiId || goodsDtlList.value[0].pqcsImgRecordList?.length === 1);

        if (shouldSwitchTab) {
          activeTab.value = 1;
        }

        // 重新获取详情
        await fetchGoodsDtl({
          entryId: goodsInfo.value.entryId,
          goodsId: goodsInfo.value.goodsId,
          storageId: goodsInfo.value.storageId,
          pqcsFlag: activeTab.value,
        });
      }, 800);
    } catch (error) {
      console.error('上传失败:', error);
      showError('上传失败');
    }
  };

  // 获取左滑选项
  const getSwipeOptions = (index: number) => {
    return [
      {
        text: activeTab.value === 1 ? '查看所有' : '批量处理',
        style: {
          backgroundColor: '#2271F5',
        },
      },
    ];
  };

  // 处理左滑点击
  const handleSwipeClick = (event: any, index: number) => {
    handleBatchProcess(index);
  };

  return {
    goodsInfo,
    activeTab,
    goodsDtlList,
    chooseIndex,
    showPopup,
    isAll,
    nowGoods,
    nowTask,
    fileList,
    imgList,
    imgLoading,
    finished,
    isFromMessage,
    showMore,
    handleTaskClick,
    handleBatchProcess,
    submitPhotos,
    loadMoreImages,
    previewImage,
    getSwipeOptions,
    handleSwipeClick,
    init,
  };
}
