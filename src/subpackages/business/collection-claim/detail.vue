<template>
  <view class="flex flex-col">
    <app-watermark> </app-watermark>
    <app-cell class="mt-2" title="认领总单ID" :value="detailObj.accdocid" />
    <app-cell
      class="mt-2"
      title="核算单元"
      :value="detailObj.entryid + '/' + detailObj.entryname"
    />
    <app-cell
      class="mt-2"
      title="分支机构"
      :value="detailObj.contactid ? detailObj.contactid + '/' + detailObj.contactman : '--'"
    />
    <app-cell class="mt-2" title="对方户名" :value="detailObj.ordercustomname" />
    <app-cell class="mt-2" title="金额" :value="detailObj.total" />
    <app-cell class="mt-2" title="认领金额" :value="detailObj.accmoney" valueClass="color-main" />
    <app-cell
      class="mt-2"
      title="未认领金额"
      :value="detailObj.notaccmoney"
      valueClass="color-main"
    />
    <app-cell
      class="mt-2"
      title="使用状态"
      :value="detailObj.usestatus === '1' ? '未认领' : '部分认领'"
    />
    <app-cell class="mt-2" title="业务员">
      <up-tag :text="`${detailObj.presalerid}/${detailObj.presalername}`" plain> </up-tag>
    </app-cell>
    <app-cell class="mt-2" title="创建时间" :value="detailObj.createtime" />
    <app-cell class="mt-2" title="备注" :value="detailObj.description" />
    <app-cell class="mt-2" title="附件">
      <view class="color-main" @click="uploadShow = true">点击添加附件</view>
    </app-cell>
    <view class="pa-4 bg-white my-3" v-if="+detailObj.uploadstatus === 1">
      <view class="text-14"> 已上传附件 </view>
      <view class="flex flex-wrap">
        <up-image
          v-for="(item, index) in oldFilesList"
          :key="index"
          fit="cover"
          class="mt-4px rounded-8px"
          :style="`margin-right: ${index % 4 === 3 ? 0 : 'calc(25% - 160rpx)'}`"
          width="160rpx"
          height="160rpx"
          :src="item.imglink"
          @click="previewImg(index)"
        />
        <app-empty v-if="!oldFilesList || !oldFilesList.length" description="未上传图片" />
      </view>
    </view>
    <collection-claim-add-pop
      :oldFilesList="oldFilesList"
      :detailObj="detailObj"
      :outerUsestatusString="String(detailObj.usestatus)"
      :uploadShow="uploadShow"
      @addSuccess="addSuccess"
      @closeClick="uploadShow = false"
    />
  </view>
</template>

<script lang="ts" setup>
import collectionClaimAddPop from './components/collection-claim-add-pop.vue';
import type { CollectionClaimImage } from './types';
const appStore = useAppStore();
const detailObj = computed(() => appStore.detailObj);
const oldFilesList = ref<CollectionClaimImage[]>([]);
// 图片预览（传递索引）
const previewImg = (index: number) => {
  const files = oldFilesList.value || [];
  const images = files
    .map((item: CollectionClaimImage) => item.imglink)
    .filter((addr: string) => addr);
  uni.previewImage({
    urls: images.length > 0 ? images : [],
    current: index,
  });
};
// 使用文件上传功能
const uploadShow = ref(false);

const getImgList = () => {
  CollectionClaimService.getCollectionClaimUrl({
    collectionid: detailObj.value.collectionid,
    pageNum: 1,
    pageSize: 100,
  }).then(res => {
    oldFilesList.value = res.data.list;
  });
};
const addSuccess = () => {
  // 先复制detailObj.value到新对象，修改后再更新
  const updatedDetailObj = { ...detailObj.value };
  updatedDetailObj.uploadstatus = '1';
  appStore.setDetailObj(updatedDetailObj);
  getImgList();
};
onMounted(() => {
  if (+detailObj.value.uploadstatus === 1) getImgList();
});
</script>

<style lang="scss" scoped></style>
