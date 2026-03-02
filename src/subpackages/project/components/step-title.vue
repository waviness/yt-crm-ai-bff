<script setup lang="ts">
interface IProps {
  status?: number; // 0无 1进行中 2完成 3未上会
  text?: string;
}

withDefaults(defineProps<IProps>(), {
  status: 0,
  text: '',
});
</script>

<template>
  <view class="flex items-center">
    <view
      :class="[
        'w-32 h-32 rounded-full flex items-center justify-center mr-3',
        status === 1
          ? 'bg-warning-100'
          : status === 2
            ? 'bg-success-100'
            : status === 3
              ? 'bg-danger-100'
              : 'bg-white',
      ]"
    >
      <view
        :class="[
          'w-20 h-20 rounded-full',
          status === 1
            ? 'bg-warning'
            : status === 2
              ? 'bg-success'
              : status === 3
                ? 'bg-danger'
                : 'bg-default',
        ]"
      ></view>
    </view>
    {{ text }}
  </view>
</template>
