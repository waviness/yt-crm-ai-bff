<!-- VBP - 品种信息填报 -->
<script setup lang="ts">
import { useVbpProjectDetail } from './composables/use-vbp-project-detail';
import GoodsPop from './components/goods-pop.vue';

const appStore = useAppStore();

const useStatusList = ref([
  { name: 1, label: '使用' },
  { name: 0, label: '不使用' },
]);

const options = ref([
  {
    text: '删除',
    style: {
      backgroundColor: appStore.theme.color.danger,
    },
  },
]);

const {
  loading,
  goodsName,
  selectedlist,
  notSelectedlist,
  curIndex,
  deleteShow,
  curDeleteItem,
  goodsShow,
  calendarRef,
  handleClickDate,
  handleDateConfirm,
  submit,
  addNotSelect,
  handleClickGoods,
  handleChooseGoods,
  submitNotSelect,
  deleteNotSelect,
  handleDeleteConfirm,
  init,
} = useVbpProjectDetail();

onLoad((opts: any) => {
  init(opts);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="px-4 pt-2 color-gray-4 text-14">中选品种</view>
    <up-form v-for="(item, idx) in selectedlist" :key="idx" class="bg-white mt-2">
      <app-form-item label="品种名称">
        <view class="w-full text-right">
          {{ item.goodsName }}
        </view>
      </app-form-item>
      <app-form-item label="厂家">
        <view class="w-full text-right">
          {{ item.factoryName }}
        </view>
      </app-form-item>
      <app-form-item label="规格">
        <view class="w-full text-right">
          {{ item.goodsType }}
        </view>
      </app-form-item>
      <app-form-item label="是否使用" class="mt-1">
        <view
          v-if="!item.finishStatus"
          :class="`w-full text-right ${item.startDate ? '' : 'color-gray-6'}`"
          @click="calendarRef?.open()"
        >
          <up-radio-group v-model="item.isUse" class="justify-end">
            <up-radio
              v-for="(item, index) in useStatusList"
              :key="index"
              :label="item.label"
              :name="item.name"
              iconSize="16"
              labelSize="14"
            />
          </up-radio-group>
        </view>
        <view
          v-else
          :class="`w-full text-right ${item.isUse === 1 ? 'color-success' : item.isUse === 0 ? 'color-danger' : 'color-black-2'}`"
        >
          {{ item.isUse === 1 ? '使用' : item.isUse === 0 ? '不使用' : '--' }}
        </view>
      </app-form-item>
      <app-form-item label="起始日期" class="mt-1">
        <view
          v-if="!item.finishStatus"
          :class="`w-full text-right ${item.startDate ? '' : 'color-gray-6'}`"
          @click="handleClickDate(item, idx)"
        >
          {{ item.startDate || '点击选择起始日期' }}
        </view>
        <view v-else class="w-full text-right">
          {{ item.startDate || '--' }}
        </view>
      </app-form-item>
      <app-form-item label="年签约量" :borderBottom="false">
        <up-input
          v-if="!item.finishStatus"
          v-model="item.yearTarget"
          placeholder="点击输入年签约量"
          input-align="right"
          fontSize="28rpx"
          border="none"
        />
        <view v-else class="w-full text-right">
          {{ !isNaN(item.yearTarget) ? item.yearTarget : '--' }}
        </view>
      </app-form-item>
      <view v-if="!item.finishStatus" class="flex justify-between mx-4 py-2">
        <up-button shape="circle" type="primary" @click="() => submit(idx)">提交</up-button>
      </view>
    </up-form>
    <view class="px-4 pt-2 color-gray-4 text-14">非中选品种</view>
    <view v-if="notSelectedlist.length">
      <up-swipe-action>
        <up-swipe-action-item
          v-for="(item, idx) in notSelectedlist"
          :key="idx"
          :options="options"
          :disabled="!item.finishStatus"
          class="mt-2"
          @click="deleteNotSelect(item, idx)"
        >
          <up-form>
            <app-form-item label="品种名称">
              <view
                :class="`w-full text-right ${item.goodsName ? 'color-black-2' : 'color-gray-6'}`"
                @click="handleClickGoods(item, idx)"
              >
                {{ item.goodsName || '点击选择品种' }}
              </view>
            </app-form-item>
            <app-form-item label="厂家">
              <view
                :class="`w-full text-right ${item.factoryName ? 'color-black-2' : 'color-gray-6'}`"
              >
                {{ item.factoryName || '厂家信息' }}
              </view>
            </app-form-item>
            <app-form-item label="规格">
              <view
                :class="`w-full text-right ${item.goodsType ? 'color-black-2' : 'color-gray-6'}`"
              >
                {{ item.goodsType || '规格信息' }}
              </view>
            </app-form-item>
            <app-form-item label="计划量" :borderBottom="false">
              <up-input
                v-model="item.yearTarget"
                placeholder="点击输入计划量"
                :readonly="!!item.finishStatus"
                input-align="right"
                fontSize="28rpx"
                border="none"
              />
            </app-form-item>
          </up-form>
          <view v-if="!item.finishStatus" class="flex justify-between mx-4 py-2">
            <up-button
              shape="circle"
              type="primary"
              class="flex-1"
              @click="() => submitNotSelect(idx)"
              >提交</up-button
            >
          </view>
        </up-swipe-action-item>
      </up-swipe-action>
    </view>
    <app-empty v-else class="block bg-white mt-2 py-14" description="暂无数据"></app-empty>
    <view class="fix-button">
      <up-button type="primary" shape="circle" @click="addNotSelect">新增非中标品种</up-button>
    </view>
    <app-calendar ref="calendarRef" @confirm="handleDateConfirm" />
    <up-modal
      :show="deleteShow"
      confirm-text="删除"
      :confirmColor="appStore.theme.color.danger"
      showCancelButton
      @cancel="deleteShow = false"
      @confirm="handleDeleteConfirm"
    >
      <view class="text-16 pa-6 text-center">是否确认删除该条非中标品种</view>
    </up-modal>
    <goods-pop
      v-if="goodsShow"
      :goodsName="goodsName"
      @close="goodsShow = false"
      @confirm="handleChooseGoods"
    />
  </view>
</template>

<style lang="scss" scoped>
.fix-button {
  height: 40px;
  margin: 8px 120px;

  :deep(.up-button) {
    width: 100%;
    height: 100%;
    font-size: 12px;
    letter-spacing: 0.5px;
    border-radius: 42px;
    box-shadow: 0 0 6px 3px rgb(209 207 207 / 50%);
    font-weight: bold;
    padding: 0 20px;
  }
}

.delete-btn {
  width: 87px;
  height: 100%;
}
</style>
