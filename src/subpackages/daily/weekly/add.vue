<script setup lang="ts">
import { useWeeklyAdd } from './composables/use-weekly-add';

defineOptions(SHARED_STYLE_OPTIONS);

const cwrdocId = ref('');

// 使用表单 composable（传入 ref，以便响应式更新）
const {
  addList,
  addOpIndex,
  labelTreeList,
  isSubmit,
  needOptions,
  needOptions1,
  objTypeActions,
  labelShow,
  activeId,
  activeIndex,
  objTypeShowPicker,
  objShowPicker,
  labelShowPicker,
  labelShowPicker1,
  loading,
  finished,
  objSearchValue,
  custlistOptions,
  goverListOptions,
  providerInforOptions,
  openLabelSelect,
  openObjTypeSelect,
  openObjSelect,
  openTaskTypeSelect,
  objTypeSelect,
  labelTypeSelect,
  handleLabelNavChange,
  handleLabelSelect,
  getLabelTreeData,
  handleObjSearch,
  handleLoad,
  changeCust,
  changeProvider,
  changeGover,
  addListClick,
  deleteItem,
  onSubmit,
  cancelClick,
} = useWeeklyAdd(cwrdocId);

// 生命周期
onLoad((options: any) => {
  console.log('cwrdocId', options.cwrdocId);
  cwrdocId.value = options.cwrdocId;
  getLabelTreeData();
});
</script>

<template>
  <view class="pb-50">
    <app-watermark> </app-watermark>
    <up-sticky style="top: 0">
      <view class="text-14 pt-10 pl-10 pb-4 flex-shrink-0">周报新增</view>
    </up-sticky>
    <up-swipe-action
      v-for="(addItem, index) in addList"
      :key="'addItem' + index"
      class="block mb-2"
    >
      <up-swipe-action-item
        :disabled="isSubmit"
        :options="!isSubmit ? [{ text: '删除', style: { backgroundColor: '#ea394b' } }] : []"
        @click="deleteItem(index)"
      >
        <up-form class="bg-white">
          <!-- 周报标签分类 -->
          <app-form-item label="周报标签分类" :required="true" :borderBottom="false">
            <view
              :class="`w-full text-right ${addItem.labelTypeText ? 'color-black-2' : 'color-gray-6'}`"
              @click="openLabelSelect(index)"
            >
              {{ addItem.labelTypeText || '点击选择事件分类' }}
            </view>
          </app-form-item>

          <!-- 预期时间 -->
          <app-form-item
            v-if="+addItem.labelTypeId === 10041"
            label="预期时间"
            :borderBottom="false"
          >
            <up-input
              v-model="addItem.exceptTimeStr"
              placeholder="请输入预期时间"
              input-align="right"
              fontSize="28rpx"
              border="none"
              clearable
            />
          </app-form-item>

          <!-- 单位类型 -->
          <app-form-item
            v-if="addItem.labelTypeId !== 10070 && addItem.labelTypeId !== 10074"
            label="单位类型"
            :required="true"
            :borderBottom="false"
          >
            <view
              :class="`w-full text-right ${addItem.objTypeText ? 'color-black-2' : 'color-gray-6'}`"
              @click="openObjTypeSelect(index)"
            >
              {{ addItem.objTypeText || '点击选择单位类型' }}
            </view>
          </app-form-item>

          <!-- 单位信息 -->
          <app-form-item
            v-if="addItem.labelTypeId !== 10070 && addItem.labelTypeId !== 10074"
            label="单位信息"
            :required="true"
            :borderBottom="false"
          >
            <view
              :class="`w-full text-right ${addItem.objName ? 'color-black-2' : 'color-gray-6'}`"
              @click="openObjSelect(index)"
            >
              {{ addItem.objName || '点击选择单位信息' }}
            </view>
          </app-form-item>

          <!-- 任务类型 (10070) -->
          <app-form-item
            v-if="addItem.labelTypeId === 10070"
            label="任务类型"
            :required="true"
            :borderBottom="false"
          >
            <view
              :class="`w-full text-right ${addItem.objName ? 'color-black-2' : 'color-gray-6'}`"
              @click="openTaskTypeSelect(index, 1)"
            >
              {{ addItem.objName || '请选择任务类型' }}
            </view>
          </app-form-item>

          <!-- 任务类型 (10074) -->
          <app-form-item
            v-if="addItem.labelTypeId === 10074"
            label="任务类型"
            :required="true"
            :borderBottom="false"
          >
            <view
              :class="`w-full text-right ${addItem.objName ? 'color-black-2' : 'color-gray-6'}`"
              @click="openTaskTypeSelect(index, 2)"
            >
              {{ addItem.objName || '请选择任务类型' }}
            </view>
          </app-form-item>

          <!-- 备注 -->
          <app-form-item label="备注" :borderBottom="false">
            <up-textarea
              v-model="addItem.labelRemark"
              class="flex-1 text-right text-14 p-8px min-h-60px w-full"
              border="none"
              placeholder="请输入备注"
              auto-height
            />
          </app-form-item>
        </up-form>
      </up-swipe-action-item>
    </up-swipe-action>

    <view class="text-center mt-2 flex justify-center py-3" @click="addListClick">
      <app-icon name="tianjia" class="color-main" size="60rpx" />
    </view>

    <app-bottom-actions class="block pt-15 px-4">
      <app-action-btn class="flex-1" text="取消" @click="cancelClick"></app-action-btn>
      <app-action-btn class="flex-1" type="primary" text="暂存" @click="onSubmit"> </app-action-btn>
    </app-bottom-actions>

    <!-- 标签选择 -->
    <up-popup :show="labelShow" mode="bottom" :round="0">
      <view class="h-65vh">
        <app-cate-select
          v-model:activeIndex="activeIndex"
          v-model:activeId="activeId"
          :items="labelTreeList"
          height="100%"
          @update:activeIndex="handleLabelNavChange"
          @update:activeId="handleLabelSelect"
        />
      </view>
    </up-popup>

    <!-- 任务类型选择 -->
    <app-action-sheet
      :show="labelShowPicker"
      :actions="needOptions"
      @select="labelTypeSelect"
      @update:show="labelShowPicker = $event"
    />
    <app-action-sheet
      :show="labelShowPicker1"
      :actions="needOptions1"
      @select="labelTypeSelect"
      @update:show="labelShowPicker1 = $event"
    />

    <!-- 单位类型选择 -->
    <app-action-sheet
      :show="objTypeShowPicker"
      :actions="objTypeActions"
      @select="objTypeSelect"
      @update:show="objTypeShowPicker = $event"
    />

    <!-- 单位选择 -->
    <up-popup
      :show="objShowPicker"
      mode="bottom"
      :round="16"
      closeable
      @close="objShowPicker = false"
    >
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">单位信息</view>
        <app-search v-model="objSearchValue" placeholder="搜索" @input="handleObjSearch" />
        <scroll-view class="h-[calc(100%-100px)]" scroll-y enable-flex @scrolltolower="handleLoad">
          <app-empty
            v-if="
              !loading &&
              ((addList[addOpIndex]?.objTypeId === 2 && !custlistOptions.length) ||
                (addList[addOpIndex]?.objTypeId === 1 && !providerInforOptions.length) ||
                (addList[addOpIndex]?.objTypeId === 3 && !goverListOptions.length))
            "
            class="pb-6"
            description="暂无数据"
          />
          <up-cell-group v-if="addList[addOpIndex] && addList[addOpIndex].objTypeId === 2">
            <app-cell
              v-for="(item, index) in custlistOptions"
              :key="index"
              clickable
              border
              :title="`${item.custId}/${item.custName}`"
              titleClass="w-full color-black-2"
              @click="changeCust(item)"
            />
          </up-cell-group>
          <up-cell-group v-if="addList[addOpIndex] && addList[addOpIndex].objTypeId === 1">
            <app-cell
              v-for="(item, index) in providerInforOptions"
              :key="index"
              clickable
              border
              :title="`${item.cpiId}/${item.providerName}`"
              titleClass="w-full color-black-2"
              @click="changeProvider(item)"
            />
          </up-cell-group>
          <up-cell-group v-if="addList[addOpIndex] && addList[addOpIndex].objTypeId === 3">
            <app-cell
              v-for="(item, index) in goverListOptions"
              :key="index"
              clickable
              border
              :title="`${item.govAttributeId}/${item.govAttributeName}(${item.orgnizationName}) --- ${item.ssqCodeName}`"
              titleClass="w-full color-black-2"
              @click="changeGover(item)"
            />
          </up-cell-group>
          <up-loadmore
            v-if="loading || !finished"
            :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
          />
        </scroll-view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
:deep(.u-textarea) {
  padding: 0 !important;

  textarea {
    font-size: 28rpx;
  }
}
</style>
