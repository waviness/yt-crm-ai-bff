<template>
  <view>
    <app-watermark> </app-watermark>
    <!-- 头部固定 -->
    <up-sticky style="top: 0; background-color: #f5f6f9">
      <view class="bg-white pa-2 mb-2">
        <view class="flex mb-2 justify-between align-center">
          <text class="text-16 font-bold">
            {{ opTopObj.type === 0 ? opTopObj.customName : opTopObj.brandName }}
          </text>
        </view>

        <app-infor-item
          v-if="opTopObj.type === 0"
          class="mb-1"
          title="厂牌名称"
          :content="opTopObj.brandName"
        />
        <app-infor-item
          v-if="opTopObj.type === 1"
          class="mb-1"
          title="客户名称"
          :content="opTopObj.customName"
        />
        <app-infor-item class="mb-1" title="品种名称" :content="opTopObj.goodsName" />
        <app-infor-item class="mb-1" title="医院销售情况">
          <text :class="+opTopObj.goodsFlag === 1 ? '' : 'color-red'">
            {{ +opTopObj.goodsFlag === 1 ? '新厂牌' : '存量厂牌' }}
          </text>
        </app-infor-item>
        <app-infor-item class="mb-1" title="规格" :content="opTopObj.goodsType" />
        <app-infor-item
          class="mb-1"
          title="最后一次提交状态"
          :contentClass="
            opTopObj.lastFillStatus === 1
              ? 'color-success'
              : opTopObj.lastFillStatus === 2
                ? 'color-red'
                : opTopObj.lastFillStatus === 3
                  ? 'color-main'
                  : ''
          "
          :content="
            opTopObj.lastFillStatus === 1
              ? '医院已完成'
              : opTopObj.lastFillStatus === 2
                ? '医院未完成'
                : opTopObj.lastFillStatus === 3
                  ? '医院报量未知'
                  : '待填报'
          "
        />
      </view>
      <app-cell title="附件" :value="fileNumber + ''" @click="handleClickFile" isLink>
        <template #right-icon>
          <up-icon name="arrow-right" size="20px" class="text-gray-5" />
        </template>
      </app-cell>
    </up-sticky>

    <!-- 列表内容 -->
    <view>
      <view class="pa-2">
        <view
          v-for="(item, index) in dataList"
          :key="`fill-${item.cgtfillId}-${index}`"
          class="card-warp"
          :class="index !== 0 && item.submitTime ? 'border-color' : ''"
        >
          <view class="circle-warp" :class="index !== 0 ? 'circle-color' : ''">
            <view v-if="index === 0" class="circle-dark"></view>
            <view v-else class="circle"></view>
          </view>
          <view class="content-warp ml-4">
            <view class="header text-14 font-bold py-2">{{ item.creTime }}</view>
            <view class="title color-gray-5 text-14 py-3">
              当前状态{{ item.submitTime ? `（提交时间:${item.submitTime}）` : '' }}
            </view>

            <!-- 状态选择 -->
            <view class="radio-warp py-3">
              <up-radio-group :disabled="!!item.expiredTime" v-model="item.status" placement="row">
                <up-radio class="text-14 flex-1" label="已完成" :name="1"></up-radio>
                <up-radio class="text-14 flex-1" label="报量未知" :name="3"></up-radio>
                <up-radio class="text-14 flex-1" label="未完成" :name="2"></up-radio>
              </up-radio-group>
            </view>

            <!-- 已完成时的填报内容 -->
            <view v-if="item.status === 1">
              <!-- 本厂牌数量 -->
              <view
                class="two-row flex align-center"
                v-show="(item.expiredTime && item.brandNum) || !item.expiredTime"
              >
                <view class="flex-1 radio-left flex align-center">
                  <up-radio-group
                    :disabled="!!item.expiredTime"
                    :modelValue="item.brandNum ? 1 : ''"
                  >
                    <up-radio class="text-14" label="本厂牌数量" :name="1"></up-radio>
                  </up-radio-group>
                </view>
                <view class="flex-1">
                  <up-input
                    :disabled="!!item.expiredTime"
                    class="text-14"
                    type="number"
                    v-model="item.brandNum"
                    inputAlign="right"
                    placeholder="请输入数量"
                    border="none"
                  />
                </view>
              </view>

              <!-- 新增厂牌列表 -->
              <view
                v-for="(brand, brandIndex) in item.brandCountList"
                :key="`brand-${brandIndex}`"
                class="two-row flex align-center"
              >
                <view class="flex-1 radio-left d-flex align-center">
                  <up-input
                    :disabled="!!item.expiredTime"
                    v-model="brand.brandName"
                    placeholder="请输入厂牌"
                    border="none"
                  />
                </view>
                <view class="flex-1">
                  <up-input
                    :disabled="!!item.expiredTime"
                    type="number"
                    v-model="brand.brandCount"
                    inputAlign="right"
                    placeholder="请输入数量"
                    border="none"
                  />
                </view>
              </view>

              <!-- 新增厂牌按钮 -->
              <view v-if="!item.expiredTime" class="py-3 text-16 two-row text-center">
                <up-button
                  shape="circle"
                  @click="addBrandCount(item)"
                  type="primary"
                  size="small"
                  plain
                  >厂牌新增</up-button
                >
              </view>
            </view>
            <!-- 备注 -->
            <up-textarea v-model="item.memo" :rows="3" placeholder="请输入备注" border="none" />
            <!-- 底部操作按钮 -->
            <view v-if="!item.expiredTime" class="mt-2 flex align-center">
              <view class="flex-1 radio-left d-flex align-center" v-if="!item.submitTime">
                <view class="text-14 text-center" @click="submitAsBeforeClick(item)">
                  按上次填报内容填报
                </view>
              </view>
              <view class="flex-1">
                <view class="color-main text-14 text-center" @click="_submitFill(item)">提交</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 文件上传弹窗 -->
    <file-pop
      v-if="filePopShow"
      @submitClick="submitClick"
      @cancelClick="filePopShow = false"
      :outPopShow="filePopShow"
      showCancelButton
    />
    <up-modal
      :show="submitModelShow"
      showCancelButton
      @cancel="submitModelShow = false"
      @confirm="onModelSubmitConfirm"
    >
      <view class="slot-content">
        <view class="text-16 text-left mb-2">确定按照以下方式提交？</view>

        <view v-if="itemVal.status" class="mb-2">
          <view v-if="+itemVal.status === 1" class="color-success">医院已完成</view>
          <view v-else-if="+itemVal.status === 2" class="color-red">医院未完成</view>
          <view v-else-if="+itemVal.status === 3" class="color-main">医院报量未知</view>
        </view>

        <view v-if="+itemVal.status === 1">
          <view v-if="itemVal.brandNum" class="mb-1">
            本厂牌填报数量<span class="color-main">{{ itemVal.brandNum }}</span>
          </view>
          <view v-if="itemVal.brandCountList && itemVal.brandCountList.length">
            <view
              v-for="(brand, index) in itemVal.brandCountList"
              :key="`brand-${index}`"
              v-show="brand.brandName && brand.brandCount"
            >
              <view
                v-if="index === 0 && brand.brandName && brand.brandCount"
                class="color-main pt-2 mb-1"
              >
                新增厂牌
              </view>
              <view v-if="brand.brandName && brand.brandCount" class="mb-1">
                {{ brand.brandName }}：{{ brand.brandCount }}
              </view>
            </view>
          </view>
        </view>
        <view v-if="itemVal.memo" class="mb-1">
          备注:<text class="color-main">{{ itemVal.memo }}</text>
        </view>
      </view>
    </up-modal>
  </view>
</template>

<script lang="ts" setup>
import filePop from './compontents/file-pop.vue';

const varietyFollowStore = useVarietyFollowStore();
const opTopObj = computed(() => varietyFollowStore.opTopObj);
const pcObj = computed(() => varietyFollowStore.pcObj);

const dataList = ref<any[]>([]);
const fileNumber = ref(0);
const filePopShow = ref(false);

// 查询填报详情
const _queryFillDetail = async () => {
  try {
    const res = await varietyFollowService.queryFillDetail({
      cgtfId: opTopObj.value.cgtformId,
      cgtcId: pcObj.value.cgtcId,
    });

    if (+res.code === 200) {
      fileNumber.value = res.data.fileCount || 0;

      if (!res.data.fillList[0].creTime) {
        res.data.fillList[0].brandCountList = [
          {
            cgtcId: res.data.fillList[0].cgtfillId,
            brandName: res.data.fillList[0].brandName,
            brandCount: res.data.fillList[0].brandCount,
          },
        ];
      }

      dataList.value = res.data.fillList.map((item: any) => ({
        ...item,
        goodsName: opTopObj.value.goodsName,
        brandName: opTopObj.value.brandName,
        cgtfId: opTopObj.value.cgtformId,
      }));
    }
  } catch (error: any) {
    showError(error.msg || '获取填报详情失败');
  }
};

// 查询上次填报内容
const _queryLastFill = async (item: any) => {
  try {
    const res = await varietyFollowService.queryLastFill({
      cgtfId: opTopObj.value.cgtformId,
      cgtcId: pcObj.value.cgtcId,
    });

    if (+res.code === 200 && res.data) {
      item.brandNum = res.data.brandNum;
      item.status = res.data.status;
      item.memo = res.data.memo;
      item.brandCountList = res.data.brandCountList || [];
    } else {
      showToast('暂无上次填报内容');
    }
  } catch (error: any) {
    showError(error.msg || '获取上次填报内容失败');
  }
};

// 新增厂牌
const addBrandCount = (item: any) => {
  console.log(item);
  item.brandCountList.push({
    cgtcId: item.cgtfillId,
    brandName: '',
    brandCount: '',
  });
};
const submitModelShow = ref(false);
const itemVal = ref<any>({});
const onModelSubmitConfirm = async () => {
  submitModelShow.value = false;
  const brandCountList: any[] = [];
  itemVal.value.brandCountList.forEach((brand: any) => {
    if (brand.brandName && brand.brandCount) {
      brandCountList.push({
        ...brand,
        cgtcId: itemVal.value.cgtfillId,
        brandCount: Number(brand.brandCount),
      });
    }
  });

  const params = {
    ...itemVal.value,
    cgtfId: itemVal.value.cgtfillId,
    brandNum:
      +itemVal.value.status === 1 && itemVal.value.brandNum ? Number(itemVal.value.brandNum) : null,
    goodsNum: null,
    brandList: +itemVal.value.status === 1 ? brandCountList : null,
    cgtcId: pcObj.value.cgtcId,
    memo: itemVal.value.memo,
  };

  varietyFollowStore.setOpTopObj({
    ...opTopObj.value,
    lastFillStatus: itemVal.value.status,
  });

  try {
    const submitRes = await varietyFollowService.submitFill(params);
    if (+submitRes.code === 200) {
      showSuccess('提交成功');
      _queryFillDetail();
    }
  } catch (error: any) {
    showError(error.msg || '提交失败');
  }
};
// 提交填报
const _submitFill = async (item: any) => {
  if (!item.status) {
    showError('请先选择医院已完成、报量未知或未完成');
    return;
  }
  if (
    +item.brandNum === 0 &&
    item.brandCountList.every((brand: any) => brand.brandName && +brand.brandCount === 0) &&
    +item.status === 1 &&
    (!item.memo || item.memo.trim() === '')
  ) {
    showError('数量和备注不能全部为0或者空，请重新填写');
    return;
  }
  itemVal.value = item;
  submitModelShow.value = true;
};

// 点击附件
const handleClickFile = () => {
  filePopShow.value = true;
};

// 文件上传成功
const submitClick = async (fileList: any[]) => {
  try {
    const requestList = fileList.map(element =>
      varietyFollowService.uploadFile({
        cgtfId: opTopObj.value.cgtformId,
        fileUrl: element.fileUrl,
        full: true,
      })
    );

    const resList = await Promise.all(requestList);

    if (resList.every((item: any) => +item.code === 200)) {
      showSuccess('上传成功');
      filePopShow.value = false;
      _queryFillDetail();
    } else {
      showError('部分文件上传失败');
    }
  } catch (error: any) {
    showError(error.msg || '上传失败');
  }
};

// 按上次填报内容填报
const submitAsBeforeClick = (item: any) => {
  _queryLastFill(item);
};

onMounted(() => {
  _queryFillDetail();
});
</script>

<style lang="scss" scoped>
.card-warp {
  position: relative;
  min-height: 200rpx;
  border-left: 2px solid #3561f2;
  margin: 20rpx;
}

.border-color {
  border-color: #dcdee0;
}

.content-warp {
  width: calc(100% - 40rpx);
  padding: 20rpx;
  height: fit-content;
  background: #fff;
  border-radius: 30rpx;

  .header {
    border-bottom: 1px solid #ebedf0;
  }

  .radio-warp {
    border-bottom: 1px solid #ebedf0;
  }
}

.circle-warp {
  position: absolute;
  top: -16rpx;
  left: -16rpx;
  width: 32rpx;
  height: 32rpx;
  background: rgb(53 97 242 / 20%);
  border-radius: 50%;

  .circle-dark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20rpx;
    height: 20rpx;
    background: #3561f2;
    border-radius: 50%;
  }

  .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20rpx;
    height: 20rpx;
    background: #dcdee0;
    border-radius: 50%;
  }
}

.circle-color {
  background: #f5f6f5;
}

.two-row {
  padding: 20rpx 0;
  border-bottom: 1px solid #ebedf0;
}

.radio-left {
  border-right: 1px solid #ebedf0;
}
</style>
