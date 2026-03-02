<template>
  <view class="entry-container py-2">
    <view class="title px-2">请选择 <text class="text-main">核算单元</text>进入 </view>
    <view v-for="(item, index) in entryList" :key="index" class="item">
      <app-cell
        class="block mt-2"
        titleClass="w-400"
        @click="handleClick(item)"
        isLink
        arrowDirection="right"
        :title="item.entryid + '/' + item.entryname"
      >
        <template #right-icon>
          <up-icon name="arrow-right" size="12" class="text-gray-5" />
        </template>
      </app-cell>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Entry } from '../../types/index';
let entryList = ref<Entry[]>([]);
interface Emits {
  (e: 'handleClick', data: Entry): void;
}
const emit = defineEmits<Emits>();

const fetchEntryList = () => {
  CommonService.queryEntryid().then(res => {
    entryList.value = res || [];
  });
};
const handleClick = (item: Entry) => {
  console.log(item);
  emit('handleClick', item);
};
onMounted(() => {
  fetchEntryList();
});
</script>

<style lang="scss" scoped></style>
