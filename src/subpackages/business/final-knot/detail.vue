<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="pa-2">末次结款信息详情</view>
    <view class="content pb-100">
      <block v-if="infoList.length">
        <up-form class="bg-white mb-4" v-for="(info, index) in infoList">
          <view>
            <app-form-item class="text-12 mt-1" label="客户">
              <text class="float-right">{{ info.customId }}/{{ info.customName }}</text>
            </app-form-item>
            <view v-if="info.statusDtl === 2">
              <app-form-item class="text-12 mt-1" label="反馈时间">
                <text class="float-right">{{ info.confirmDate }}</text>
              </app-form-item>
            </view>
            <view v-if="info.statusDtl === 0 || info.statusDtl === 1">
              <app-form-item label="客户目前库存">
                <up-input
                  v-if="info.statusDtl === 0"
                  v-model="info.sqty"
                  clearable
                  placeholder="请输入客户目前库存"
                  inputAlign="right"
                  fontSize="28rpx"
                  border="none"
                >
                </up-input>
                <text v-else class="float-right">{{ info.sqty || 0 }}</text>
              </app-form-item>
              <app-form-item label="在途数量">
                <up-input
                  v-if="info.statusDtl === 0"
                  v-model="info.onwayQty"
                  clearable
                  placeholder="请输入在途数量"
                  inputAlign="right"
                  fontSize="28rpx"
                  border="none"
                >
                </up-input>
                <text v-else class="float-right">{{ info.onwayQty || 0 }}</text>
              </app-form-item>
              <app-form-item label="返利金额">
                <up-input
                  v-if="info.statusDtl === 0"
                  v-model="info.unClearedPrice"
                  clearable
                  placeholder="请输入返利金额"
                  inputAlign="right"
                  fontSize="28rpx"
                  border="none"
                >
                </up-input>
                <text v-else class="float-right">{{ info.unClearedPrice || 0 }}</text>
              </app-form-item>
              <app-form-item label="备注">
                <up-textarea
                  border="none"
                  inputAlign="right"
                  fontSize="28rpx"
                  v-if="info.statusDtl === 0"
                  v-model="info.remark"
                  placeholder="请输入备注"
                ></up-textarea>
                <text v-else class="float-right">{{ info.remark || '-' }}</text>
              </app-form-item>
            </view>
          </view>
          <view class="flex justify-center py-2" v-if="info.statusDtl === 0">
            <up-button
              :customStyle="{ width: '240rpx', height: '70rpx' }"
              @click="submit(info, index, 2)"
              text="非经营品种"
              type="error"
              shape="circle"
              class="mr-2"
              plain
            ></up-button>
            <up-button
              @click="submit(info, index, 1)"
              :customStyle="{ width: '240rpx', height: '70rpx' }"
              text="提交"
              type="primary"
              shape="circle"
            ></up-button>
          </view>
        </up-form>
      </block>
      <app-empty v-else-if="!loading" description="暂无数据" style="margin-top: 200rpx" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { useFinalKnotDetail } from './composables/use-final-knot-detail';
const { fetchDtlList, infoList, submit } = useFinalKnotDetail();
const loading = ref(true);
onLoad(async options => {
  const { zdId, selectType, statusDtl } = options || {};
  try {
    await fetchDtlList({
      zdId,
      selectType,
      statusDtl,
      pageNum: 1,
      pageSize: 100,
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.content {
  :deep(.u-form-item__body__right__content__slot) {
    width: 100%;
    display: inline-block;
  }
  :deep(.u-form-item__body__left__content__label, .u-form-item__body__right__content) {
    font-size: 24rpx !important;
  }
}
</style>
