<template>
  <view>
    <view class="header text-center text-20 py-2 font-bold">
      {{ titleString }}
    </view>
    <view class="pa-2"
      ><view class="card pa-2">
        <view
          ><up-tag
            borderColor="transparent"
            :text="detailInfor.goodsStatus"
            :type="detailInfor.goodsStatusId === 3 ? 'warning' : 'error'"
            plain
            plainFill
          ></up-tag>
          <span class="pl-1 fontWeight-500"
            >{{ detailInfor.goodsId }}/{{ detailInfor.goodsName }}</span
          ></view
        >
        <app-infor-item class="pt-1" title="批号：" :content="detailInfor.lotno" />
        <app-infor-item class="pt-1" title="可销库存：" :content="detailInfor.mindtlgoodsqty" />
        <app-infor-item
          class="pt-1"
          title="效期："
          :content="`${detailInfor.invalidDate.substring(0, 10)}(${detailInfor.diffDay}天)`"
        />
      </view>
      <view class="pa-3" v-if="detailInfor.type === 1">
        <view>
          <text class="text-14 color-gray-7">最近上传日期：</text>
          <text>{{ imgInfor && imgInfor[0] && imgInfor[0].pqcsDealTime }}</text>
        </view>
      </view>
      <view v-if="detailInfor.type === 1" class="flex flex-wrap">
        <up-image
          v-for="(item, index) in imgList"
          :key="index"
          fit="cover"
          class="mt-4px rounded-8px"
          :style="`margin-right: ${index % 4 === 3 ? 0 : 'calc(25% - 160rpx)'}`"
          width="160rpx"
          height="160rpx"
          :src="item.url"
          @click="previewImg(index)"
        />
        <app-empty v-if="!imgList || !imgList.length" description="未上传图片" />
      </view>
      <view v-if="detailInfor.type === 2">
        <app-pull-refresh
          :refreshing="refreshing"
          :loadmoreProps="loadmoreConfig"
          :pullRefreshHeight="pullRefreshHeight"
          @refresh="onRefresh"
          @loadmore="onLoadMore"
        >
          <view class="pa-2">
            <view
              class="list-card pa-2 mb-2"
              v-for="(item, index) in list"
              :key="'customOftenList' + index"
            >
              <app-infor-item class="pt-1" title="常销客户" :content="item.openPinCustomName" />
              <app-infor-item class="pt-1" title="服务频次" :content="item.lotCount" />
              <app-infor-item class="pt-1" title="业务员" :content="item.openPinSalerName" />
            </view>
            <app-empty v-if="!refreshing && !list.length" description="暂无常销客户信息" />
          </view>
        </app-pull-refresh>
      </view>
      <!-- <view v-if="detailInfor.type === 1" class="imageWarp pa-10">
      <view class="imageWarp-header py-2 font-14">
        <span class="color-gray-7">最近上传日期：</span> {{ imgInfor && imgInfor[0] && imgInfor[0].pqcsDealTime }}
      </view>
      <van-uploader v-model="imgList" :deletable="false" />
      <app-empty v-if="!imgList.length" description="暂无图片" />
    </view> -->
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  titleString: string;
  detailInfor?: any;
}
const props = defineProps<Props>();
const operatorKey = []; // 仓管员绑定
const imgList: any = ref([]); // 图片列表
const imgInfor: any = ref([]); // 图片信息
const fetchImgs = async () => {
  let shareEntryHasNum = 0;
  if (
    props.detailInfor &&
    props.detailInfor.shareGoodsDtl &&
    props.detailInfor.shareGoodsDtl.length > 0
  ) {
    for (let index = 0; index < props.detailInfor.shareGoodsDtl.length; index++) {
      const element = props.detailInfor.shareGoodsDtl[index];
      shareEntryHasNum += element.mindtlgoodsqty;
    }
  }
  const res = await TwoPinService.getimgs({
    entryId: props.detailInfor.entryId,
    goodsId: props.detailInfor.goodsId,
    goodsStatusId: props.detailInfor.goodsStatusId,
    lotid: props.detailInfor.lotid,
    pqcsFlag: 1,
    storageId: props.detailInfor.storageId,
    shareEntryId:
      shareEntryHasNum > 0
        ? props.detailInfor.shareGoodsDtl[0].mindtlgoodsqty
        : props.detailInfor.gentryId,
    pageNum: 1,
    pageSize: 100000,
  });
  if (+res.code === 200) {
    imgList.value = [];
    imgInfor.value = res.data;
    for (let index = 0; index < imgInfor.value.length; index++) {
      const element = imgInfor.value[index];
      imgList.value = imgList.value.concat(element.imgList);
    }
    imgList.value = imgList.value.map((val: any) => {
      return {
        url: val,
      };
    });
  }
};
// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = imgList.value || [];
  const images = files.map((item: any) => item.url).filter((addr: string) => addr);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};

const fetchCustomOften = async (params: { pageNum: number; pageSize: number }) => {
  const data: any = await TwoPinService.getCustomersOftenPin({
    entryId: props.detailInfor.entryId,
    goodsId: props.detailInfor.goodsId,
    lotid: props.detailInfor.lotid,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });
  return {
    list: data.list || [],
    hasNextPage: data.hasNextPage || false,
    total: data.total || 0,
  };
};
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = usePagination(
  {
    pageSize: 10,
    initialPage: 1,
    toolBarHeight: 210,
  },
  fetchCustomOften
);
onMounted(() => {
  console.log(props.detailInfor);
  if (props.detailInfor.type === 1) {
    fetchImgs();
  } else {
    calcPullRefreshHeight();
    onRefresh();
  }
});
</script>

<style lang="scss" scoped>
.card {
  border-radius: 10px;
  border: 1px solid #c8c9cc;
}

.list-card {
  box-shadow: 0 1px 6px 1px #c8c9cc;
  border-radius: 10px;
}
</style>
