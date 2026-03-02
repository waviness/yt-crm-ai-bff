<script setup lang="ts">
/**
 * 订单详情页面
 * 显示订单的详细信息和相关操作
 */

defineOptions(SHARED_STYLE_OPTIONS);

// 响应式数据
const id = ref('');
const info = ref<any>({});
const entryObj = ref({
  entryId: '',
  entryName: '',
});
const logisticsInfor = ref<any[]>([]);
const logisticsShow = ref(false);
const lotInfor = ref<any[]>([]);
const lotInformationShow = ref(false); // 批号信息列表弹窗
const epzInformationShow = ref(false); // 两票制信息列表弹窗
const erPzinfor = ref<any>({ content: '' });
const photoInfor = ref<any[]>([]);

// 获取订单详情
const getCstmOrderDetail = async () => {
  const response = await OrderManageService.getCstmOrderDetail({ condtlId: id.value });
  info.value = response;
};

// 处理按钮点击
const onItemClick = async (type: number) => {
  if (type === 1) {
    // 物流信息
    const res = await ContractService.queryOrderStatusInfo({ condtlid: info.value.condtlId });
    if (res.success) {
      logisticsInfor.value = res.data;
      logisticsShow.value = true;
    } else {
      showModal({
        title: '提示',
        content: `该订单（${info.value.condtlId}）${res.msg}`,
      });
    }
  } else {
    // 两票制信息 - 先获取批号信息列表
    const res = await ContractService.queryApiInformationsByCondtlid({
      condtlid: info.value.condtlId,
    });
    if (res.success) {
      lotInfor.value = res.data || [];
      // 为每个批号信息添加工厂ID
      lotInfor.value.forEach((lot: any) => {
        lot.factoryId = info.value.factoryId;
      });
      lotInformationShow.value = true;
    } else {
      showModal({
        title: '提示',
        content: `该订单（${info.value.condtlId}）${res.msg}`,
      });
    }
  }
};

// 批号点击事件
const lotInformationClick = async (item: any) => {
  if (item.sflpzhp === 1) {
    // 是两票制，获取详细信息
    const res = await ContractService.queryLotNumberInfo(item);
    if (res.flag === 1) {
      erPzinfor.value = res;
      epzInformationShow.value = true;
      await findPhoto();
    } else {
      showModal({
        title: '提示',
        content: res.content,
      });
    }
  } else {
    // 非两票制
    showModal({
      title: '提示',
      content: '当前批号是非两票制',
    });
  }
};

// 获取进货发票图片
const findPhoto = async () => {
  const { suinvno, suinvfirstno, salesdtlid } = erPzinfor.value;
  const params = {
    invno: suinvno,
    invfirstno: suinvfirstno,
    salesdtlid,
  };
  photoInfor.value = [];
  const res = await ContractService.querySuInvkcPic(params);
  photoInfor.value = res || [];
};

// 图片预览
const previewImg = (index: number) => {
  const images = photoInfor.value.map((item: any) => item.inv_pic).filter(Boolean);
  if (images.length > 0) {
    uni.previewImage({
      urls: images,
      current: index < images.length ? images[index] : images[0],
    });
  }
};

onLoad((opts: any) => {
  // 获取页面参数
  const decodeOpts = decodeObjectValues(opts);
  id.value = decodeOpts.id || '';
  entryObj.value.entryId = decodeOpts.entryId || '';
  entryObj.value.entryName = decodeOpts.entryName || '';
  if (id.value) {
    getCstmOrderDetail();
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark />
    <view class="px-10 pt-10">订单详情</view>
    <view class="bg-light-gray-2 shadow-view rounded-10rpx mt-4 mx-2">
      <view class="bg-white rounded-10rpx p-10">
        <view class="flex justify-between items-center">
          <app-tag type="primary" :name="info.condtlId" :fontSize="12" />
          <app-tag v-if="info.dtlUsestatus === 1" type="success" name="已分配" :fontSize="12" />
          <app-tag v-else-if="info.dtlUsestatus === 0" type="danger" name="未分配" :fontSize="12" />
        </view>
        <app-infor-item
          title="核算单元"
          :content="`${entryObj.entryId}/${entryObj.entryName}`"
          class="block mt-2"
        />
        <app-infor-item
          title="销售单总单ID"
          :content="info.conId || '-'"
          class="block mt-2"
          hasCopy
        />
        <app-infor-item
          title="品种"
          :content="`${info.goodsId}/${info.goodsName}`"
          class="block mt-2"
        />
        <app-infor-item title="规格" :content="info.goodsType" class="block mt-2" />
        <app-infor-item title="产地" :content="info.factoryName" class="block mt-2" />
        <app-infor-item title="总金额" :content="info.totalLine" class="block mt-2" />
        <app-infor-item title="合同数量" :content="info.goodsQty" class="block mt-2" />
        <app-infor-item title="累计执行数量" :content="info.accstQty || '-'" class="block mt-2" />
        <app-infor-item title="采购员" class="block mt-2">
          <app-tag type="primary" :name="info.supplyerName || '-'" :fontSize="12" />
        </app-infor-item>
      </view>
      <view class="flex items-center justify-end px-10 py-2">
        <up-button
          type="primary"
          size="small"
          shape="circle"
          plain
          class="mr-4 px-8! w-auto!"
          @click="onItemClick(1)"
        >
          物流
        </up-button>
        <up-button
          type="primary"
          size="small"
          shape="circle"
          class="mx-0 px-8! w-auto!"
          @click="onItemClick(2)"
        >
          两票制
        </up-button>
      </view>
    </view>
    <up-popup
      :show="logisticsShow"
      :round="16"
      mode="bottom"
      closeable
      @close="logisticsShow = false"
    >
      <view class="flex flex-col h-90vh">
        <view class="text-base font-bold text-center py-4">物流信息</view>
        <view class="flex-1 my-2 mx-3 overflow-y-auto">
          <up-steps :current="0" active-color="#323233" direction="column" dot>
            <up-steps-item v-for="(item, index) in logisticsInfor" :key="index">
              <template #title>
                <view class="text-sm">{{ item.operator }}操作，{{ item.operastatus }}</view>
              </template>
              <template #desc>
                <view class="mt-2">{{ new Date(item.operadate).toLocaleString() }}</view>
              </template>
            </up-steps-item>
          </up-steps>
        </view>
      </view>
    </up-popup>
    <!-- 批号信息列表弹窗 -->
    <up-popup
      :show="lotInformationShow"
      :round="16"
      mode="bottom"
      closeable
      @close="lotInformationShow = false"
    >
      <view class="flex flex-col h-50vh">
        <view class="text-16 font-bold text-center py-4">批号信息列表</view>
        <view class="flex-1 mb-2 mx-3 overflow-y-auto text-14">
          <!-- 表头 -->
          <view class="flex px-4 py-3 color-gray-5">
            <view class="flex-3">批号</view>
            <view class="flex-2">是否两票制</view>
            <view class="flex-2">是否严控</view>
          </view>
          <!-- 批号列表 -->
          <view
            v-for="(item, index) in lotInfor"
            :key="index"
            :class="['flex px-4 py-3', index % 2 === 0 ? 'bg-gray-8' : '']"
            @click="lotInformationClick(item)"
          >
            <view class="flex-3">{{ item.lotno }}</view>
            <view class="flex-2">{{ item.sflpzhp === 1 ? '是' : '否' }}</view>
            <view class="flex-2">{{ item.skiplpz === 1 ? '是' : '否' }}</view>
          </view>
          <!-- 空状态 -->
          <app-empty
            v-show="lotInfor.length === 0"
            class="py-6 bg-white"
            description="当前没有批号信息"
          />
        </view>
      </view>
    </up-popup>
    <!-- 两票制信息列表弹窗 -->
    <up-popup
      :show="epzInformationShow"
      :round="16"
      mode="bottom"
      closeable
      @close="epzInformationShow = false"
    >
      <view class="flex flex-col h-90vh">
        <view class="text-16 font-bold text-center py-4">两票制信息列表</view>
        <view class="flex-1 mx-3 pb-7 overflow-y-auto text-14">
          <!-- HTML 内容 -->
          <rich-text v-if="erPzinfor.content" class="mb-4" :nodes="erPzinfor.content"></rich-text>

          <!-- 进货发票 (第一票) -->
          <view class="color-gray-4 my-3">进货发票 (第一票)</view>

          <!-- 图片列表 -->
          <view v-if="photoInfor.length > 0">
            <view v-for="(item, index) in photoInfor" :key="index" class="mb-4">
              <view v-if="photoInfor.length > 1" class="mb-1 text-14">图片{{ index + 1 }}</view>
              <up-image
                class="w-full"
                :src="item.inv_pic"
                mode="widthFix"
                @click="previewImg(index)"
              />
            </view>
          </view>

          <!-- 空状态 -->
          <app-empty v-else class="py-6 bg-white" description="暂无数据" />
        </view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-steps-item) {
  color: $default-color;
}

:deep(.u-steps-item__content--current) {
  color: $uni-text-color;
}
</style>
