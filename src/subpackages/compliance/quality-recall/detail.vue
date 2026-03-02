<template>
  <view>
    <app-watermark></app-watermark>
    <view v-if="recallDetail" class="pa-2 flex justify-between items-center">
      <text>质量召回详情</text>
      <text class="font-bold">#{{ recallDetail.recDtlId }}</text>
    </view>
    <up-form class="pb-2" v-if="recallDetail">
      <app-cell title="创建时间" class="mb-2">
        <text>{{ recallDetail.creDate }}</text>
      </app-cell>
      <app-cell title="单位信息" class="mb-2">
        <text>{{ recallDetail.customId }}/{{ recallDetail.customName }}</text>
      </app-cell>
      <app-cell title="核算单元" class="mb-2">
        <text>{{ recallDetail.entryId }}/{{ recallDetail.entryName }}</text>
      </app-cell>
      <app-cell title="货品信息" class="mb-2">
        <text>{{ recallDetail.goodsId }}/{{ recallDetail.goodsName }}</text>
      </app-cell>
      <app-cell title="规格" class="mb-2">
        <text>{{ recallDetail.goodsType }}/{{ recallDetail.goodsUnit }}</text>
      </app-cell>
      <app-cell title="厂家" class="mb-2">
        <text>{{ recallDetail.factoryName }}</text>
      </app-cell>
      <app-cell title="召回级别" class="mb-2">
        <text class="color-main">{{ getRecLevelText }}</text>
      </app-cell>
      <app-cell title="召回截至日期" class="mb-2">
        <text>{{ recallDetail.deadline }}</text>
      </app-cell>
      <app-cell title="剩余时间" class="mb-2" v-if="recallDetail.toDeadlineDays">
        <view :class="getDeadlineClass">
          {{ getDeadlineText }}
        </view>
      </app-cell>
      <app-cell v-if="recallDetail.lotNoStr" title="批号" class="mb-2">
        <view class="flex flex-wrap">
          <up-tag
            v-for="(lotNo, index) in (recallDetail.lotNoStr || '').split(',')"
            :key="index"
            :text="lotNo"
            type="primary"
            plain
            class="mr-1 mb-1"
          />
        </view>
      </app-cell>

      <!-- 未处理状态或者从通知进入时显示输入框 -->
      <app-cell
        v-if="
          (selectType === 1 && canEdit) ||
          (fromNotification && recallDetail.expectQty !== 0 && !recallDetail.expectQty)
        "
        title="拟召回数量"
        class="mb-2"
        required
      >
        <up-input
          v-model="expectQty"
          placeholder="请输入拟召回数量"
          type="number"
          border="none"
          inputAlign="right"
        />
      </app-cell>

      <!-- 已处理状态显示数量 -->
      <app-cell
        v-if="
          (selectType === 2 && !canEdit) ||
          (fromNotification && (recallDetail.expectQty === 0 || recallDetail.expectQty))
        "
        title="拟召回数量"
        class="mb-2"
      >
        <text>{{ recallDetail.expectQty }}</text>
      </app-cell>

      <!-- 附件上传 -->
      <view v-if="canEdit || fromNotification" class="mb-2">
        <view class="bg-white py-2 px-3 rounded-1">
          <view class="mb-2">
            <text class="text-14">附件上传</text>
          </view>
          <up-upload
            :fileList="fileList"
            @afterRead="afterRead"
            @delete="deleteFile"
            multiple
            :maxCount="9"
          ></up-upload>
        </view>
      </view>

      <!-- 已上传附件 -->
      <view
        v-if="
          (selectType === 2 && !canEdit) ||
          (fromNotification && recallDetail.expectQty !== undefined)
        "
        class="mb-2"
      >
        <view class="bg-white py-2 px-3 rounded-1">
          <view class="mb-2">
            <text class="text-14">已上传附件</text>
          </view>
          <view v-if="recallDetail.imageUrlList && recallDetail.imageUrlList.length">
            <up-upload :fileList="recallDetail.imageUrlList" :deletable="false"></up-upload>
          </view>
          <view v-else class="flex flex-col items-center justify-center py-10">
            <app-empty description="暂无图片" />
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view v-if="canEdit || fromNotification" class="flex justify-center gap-2 mt-4">
        <up-button v-if="!fromNotification" text="取消" @click="handleCancel" shape="circle" />
        <up-button text="提交" type="primary" @click="handleSubmit" shape="circle" />
      </view>
    </up-form>
  </view>
</template>

<script lang="ts" setup>
import { useQualityRecallDetail } from './composables/use-quality-recall-detail';

const {
  recallDetail,
  loading,
  expectQty,
  fileList,
  fetchDetail,
  getRecLevelText,
  getDeadlineText,
  handleSubmit: submitForm,
} = useQualityRecallDetail();

const getDeadlineClass = computed(() => {
  if (!recallDetail.value || !recallDetail.value.toDeadlineDays) return '';
  return recallDetail.value.toDeadlineDays < 0 ? 'tag-red' : 'tag-green';
});

// 从路由参数获取信息
const cgrId = ref('');
const selectType = ref(1);
const buttonShow = ref(true);
const fromNotification = ref(false); // 是否从通知进入

// 是否可以编辑（与vue2逻辑一致）
const canEdit = computed(() => {
  // 如果是从通知进入，根据是否有expectQty判断
  if (fromNotification.value) {
    return true;
  }
  // 未处理状态且有编辑权限才显示
  return selectType.value === 1 && buttonShow.value;
});

// 文件上传后的回调
const afterRead = (event: any) => {
  const files = Array.isArray(event.file) ? event.file : [event.file];
  files.forEach((file: any) => {
    fileList.value.push({
      url: file.url,
      file: file,
    });
  });
};

// 删除文件
const deleteFile = (event: any) => {
  fileList.value.splice(event.index, 1);
};

// 取消
const handleCancel = () => {
  router.back();
};

// 提交
const handleSubmit = async () => {
  if (!recallDetail.value) return;

  const success = await submitForm({
    cgrId: cgrId.value,
    recDocId: recallDetail.value.recDocId,
    recDtlId: recallDetail.value.recDtlId,
    selectType: selectType.value,
  });

  if (success) {
    router.back();
  }
};

onLoad(async options => {
  const {
    cgrId: paramCgrId,
    selectType: paramSelectType,
    buttonShow: paramButtonShow,
  } = options || {};

  if (paramCgrId) {
    cgrId.value = paramCgrId;
    selectType.value = Number(paramSelectType) || 1;
    buttonShow.value = paramButtonShow === 'true' || paramButtonShow === true;
    // 如果没有 selectType 或 buttonShow 参数，说明是从通知进入
    fromNotification.value = !paramSelectType || paramButtonShow === undefined;

    await fetchDetail(paramCgrId);
  }
});
</script>

<style scoped>
.tag-green {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #00a870;
  background: rgb(0 168 112 / 10%);
  border-radius: 4rpx;
}

.tag-red {
  display: inline-block;
  padding: 4rpx 12rpx;
  font-size: 24rpx;
  color: #e34d59;
  background: rgb(227 77 89 / 10%);
  border-radius: 4rpx;
}
</style>
