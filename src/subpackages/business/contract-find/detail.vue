<script setup lang="ts">
import { useContractDetail } from './composables/use-contract-detail';
import ContractDetailItem from './components/contract-detail-item.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const conId = ref('');

const {
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
  getDataList,
  onItemClick,
  lotInformationClick,
  previewImg,
  formatLogisticsTime,
} = useContractDetail(conId);

// 获取路由参数
onLoad((opts: any) => {
  conId.value = opts.conId || '';
  getDataList();
});
</script>

<template>
  <view class="pb-50">
    <app-watermark></app-watermark>

    <view class="px-10 pt-10">细单信息列表</view>

    <!-- 细单列表 -->
    <view class="p-10">
      <contract-detail-item
        class="mb-2"
        v-for="(item, idx) in list"
        :key="idx"
        :data="item"
        @click="onItemClick"
      />
    </view>

    <!-- 物流信息弹窗 -->
    <up-popup
      v-model:show="logisticsShow"
      mode="bottom"
      :round="16"
      closeable
      @close="logisticsShow = false"
    >
      <view class="flex flex-col h-90vh">
        <view class="text-base font-bold text-center py-4">物流信息</view>
        <view class="flex-1 my-2 mx-3 overflow-y-auto">
          <up-steps :current="0" active-color="#2271f5" direction="column" dot>
            <up-steps-item v-for="(item, index) in logisticsInfor" :key="index">
              <template #title>
                <view class="text-sm">{{ item.operator }}操作，{{ item.operastatus }}</view>
              </template>
              <template #desc>
                <view class="mt-2 mb-4">{{ new Date(item.operadate).toLocaleString() }}</view>
              </template>
            </up-steps-item>
          </up-steps>
        </view>
      </view>
    </up-popup>

    <!-- 批号信息弹窗 -->
    <up-popup
      v-model:show="lotInformationShow"
      mode="bottom"
      :round="16"
      closeable
      @close="lotInformationShow = false"
    >
      <view class="flex flex-col">
        <view class="text-16 font-bold text-center py-4">批号信息列表</view>
        <scroll-view class="mb-2 mx-3 text-14 max-h-70vh" scroll-y>
          <!-- 表头 -->
          <view class="flex px-4 py-3 color-gray-5">
            <view class="flex-3">批号</view>
            <view class="flex-2">是否两票制</view>
            <view class="flex-2">是否严控</view>
          </view>
          <!-- 列表 -->
          <view
            :class="['flex px-4 py-3', index % 2 === 0 ? 'bg-gray-8' : '']"
            v-for="(item, index) in lotInfor"
            :key="index"
            @click="lotInformationClick(item)"
          >
            <view class="flex-3">{{ item.lotno }}</view>
            <view class="flex-2">{{ item.sflpzhp === 1 ? '是' : '否' }}</view>
            <view class="flex-2">{{ item.skiplpz === 1 ? '是' : '否' }}</view>
          </view>
          <app-empty
            v-show="lotInfor.length === 0"
            class="py-6 bg-white"
            description="当前没有批号信息"
          />
        </scroll-view>
      </view>
    </up-popup>

    <!-- 两票制信息弹窗 -->
    <up-popup
      v-model:show="epzInformationShow"
      mode="bottom"
      :round="16"
      closeable
      @close="epzInformationShow = false"
    >
      <view class="h-90vh flex flex-col">
        <view class="text-16 font-bold text-center py-4">两票制信息列表</view>
        <scroll-view class="flex-1 mx-3 pb-7 text-14" scroll-y>
          <view v-html="erPzinfor.content"></view>
          <view class="color-gray-4 my-3">进货发票 (第一票)</view>
          <view v-if="photoInfor.length > 0">
            <view v-for="(item, index) in photoInfor" :key="index" class="mb-3">
              <view v-show="photoInfor.length > 1" class="mb-1">图片{{ index + 1 }}</view>
              <image
                class="w-full"
                :src="item.inv_pic"
                mode="widthFix"
                @click="previewImg(index)"
              />
            </view>
          </view>
          <app-empty v-else class="py-6 bg-white" description="暂无数据" />
        </scroll-view>
      </view>
    </up-popup>

    <!-- 提示对话框 -->
    <up-modal
      v-model="dialogShow"
      :content="dialogContent"
      :showCancelButton="false"
      confirmColor="#2271F5"
      @confirm="dialogShow = false"
    />
  </view>
</template>

<style lang="scss" scoped>
// 物流步骤条样式调整（如果需要）
:deep(.up-steps) {
  .up-step {
    &--vertical:not(:last-child)::after {
      border: none;
    }

    &__icon--active {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #2271f5;
    }

    &__circle {
      width: 8px;
      height: 8px;
    }

    &__line {
      width: 2px;
      left: -16px;
    }
  }
}
</style>
