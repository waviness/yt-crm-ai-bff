<template>
  <view class="bg-white card mb-2" @click="handleDetailClick">
    <view class="pa-2 flex flex-col">
      <view class="flex justify-between items-center mb-2">
        <text class="font-bold flex-1"
          >{{ item.customerId }}/{{ item.customerName?.split('/')[0] }}</text
        >
        <text class="color-gray-4 min-w-120">{{ formatTime(item.createTime) }}</text>
      </view>
      <view v-if="item.contactId" class="mb-2">
        {{ item.contactId }}/{{ item.contactName?.split('/')[0] }}
      </view>
      <app-infor-item
        class="mb-2"
        title="核算单元"
        :content="`${item.entryId}/${item.entryName}`"
      />
      <app-infor-item class="mb-2" title="发起人" :content="`${item.userId}/${item.userName}`" />
    </view>
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  item: {
    customerId?: string;
    customerName?: string;
    createTime?: string;
    contactId?: string;
    contactName?: string;
    entryId?: string;
    entryName?: string;
    userId?: string;
    userName?: string;
    [key: string]: any;
  };
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  detailClick: [];
}>();

const formatTime = (time?: string) => {
  if (!time) return '';
  return time.substring(0, 16);
};

const handleDetailClick = () => {
  emit('detailClick');
};
</script>

<style lang="scss" scoped>
.card {
  box-shadow: 0 1px 6px 1px rgb(209 207 207 / 30%);
}
</style>
