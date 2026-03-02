<script setup lang="ts">
interface IProps {
  list?: any[];
}

const props = withDefaults(defineProps<IProps>(), {
  list: () => [],
});

const show = ref(true);

const emit = defineEmits<{
  close: [];
}>();

const onClose = () => {
  emit('close');
};
</script>

<template>
  <up-popup :show="show" closeable position="bottom" round="16" @close="onClose">
    <view class="flex flex-col h-50vh">
      <view class="text-16 font-bold text-center py-3">已回执 {{ list.length }} 人</view>
      <scroll-view class="flex-1" scroll-y style="height: 0">
        <view class="text-14 color-gray-5 mx-4 pt-3" v-for="(item, idx) in list" :key="idx">
          {{ item.sendUserName }}
          <view class="w-full h-2 translate-y-1 bg-[#ebedf0] mt-3"></view>
        </view>
      </scroll-view>
    </view>
  </up-popup>
</template>
