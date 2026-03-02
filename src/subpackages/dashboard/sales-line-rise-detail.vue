<template>
  <view>
    <app-watermark> </app-watermark>
    <app-page v-if="!isInnerFlag">
      <salesLineDetail :isClick="isClick" :entryObj="entryObj" />
    </app-page>
    <view v-else><salesLineDetail :isClick="isClick" :entryObj="entryObj" /></view>
  </view>
</template>

<script setup lang="ts">
import type { EntryObj } from './types';
import salesLineDetail from './components/sales-line-detail.vue';
const entryObj = ref<EntryObj>({
  deptId: '',
  deptName: '',
  deptLevel: '',
  userId: '',
  userName: '',
  customerId: '',
  customerName: '',
});
let isInnerFlag = ref(false); // 是否内部页面
const isClick = ref(true); // 是否可以继续点击

// 页面加载
onLoad(options => {
  const decodedOpts = options ? decodeObjectValues(options) : {};
  if (decodedOpts) {
    isInnerFlag.value = !!+decodedOpts.isInner;
    entryObj.value.deptLevel = decodedOpts.deptLevel;
    entryObj.value.deptId = decodedOpts.deptId;
    entryObj.value.deptName = decodedOpts.deptName;
    entryObj.value.userId = decodedOpts.userId;
    entryObj.value.userName = decodedOpts.userName;
    entryObj.value.customerId = decodedOpts.customerId;
    entryObj.value.customerName = decodedOpts.customerName;
    entryObj.value.goodsId = decodedOpts.goodsId;
    entryObj.value.goodsName = decodedOpts.goodsName;
    const getTitleName = computed(() => {
      if (+decodedOpts.deptLevel === 6) {
        return decodedOpts.customerName ? decodedOpts.customerName : decodedOpts.goodsName;
      }
      if (+decodedOpts.deptLevel === 5 && decodedOpts.userName) return decodedOpts.userName;
      if (!decodedOpts.deptId) return decodedOpts.userName;
      else return decodedOpts.deptName;
    });
    const getObjName = computed(() => {
      return decodedOpts.deptName;
    });
    entryObj.value.titleName = getTitleName.value;
    entryObj.value.objName = getObjName.value;
    if (+decodedOpts.deptLevel === 6) {
      isClick.value = false; // 详情不允许点击
    }
  }
});
</script>

<style lang="scss" scoped></style>
