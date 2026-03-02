<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  type?: string;
  name: string;
  topicSquareNum?: number;
  todayNum?: number;
}

const props = withDefaults(defineProps<IProps>(), {
  topicSquareNum: 0,
  todayNum: 0,
});

const emit = defineEmits<{
  cardClick: [];
}>();

const handleClick = () => {
  emit('cardClick');
};
</script>

<template>
  <view class="card bg-white px-4 py-3 mb-1 flex justify-between items-center" @click="handleClick">
    <view class="card-warp flex">
      <view class="card-block" />
      <view
        class="card-content flex flex-col pl-10"
        :class="type ? 'justify-center' : 'justify-between'"
      >
        <view class="text-14">{{ name }}</view>
        <view v-if="!type" :class="todayNum <= 0 ? 'color-gray-5' : 'color-main'">
          今日新增{{ todayNum }}条
        </view>
      </view>
    </view>
    <view
      v-if="!type"
      class="card-number text-12"
      :style="topicSquareNum === 0 ? 'background:#969799;' : 'background:#4970F3;'"
    >
      {{ topicSquareNum }}
    </view>
  </view>
</template>

<style lang="scss" scoped>
.card {
  box-sizing: border-box;
  width: calc(50% - 6px);
  height: 70px;

  &-warp {
    height: 100%;
  }

  &-block {
    width: 4px;
    height: 100%;
    background: #0052d9;
    border-radius: 5px;
  }

  &-number {
    color: #fff;
    font-size: 12px;
    font-weight: 600;
    border-radius: 8px;
    height: 12px;
    line-height: 12px;
    padding: 0 6px;
  }
}
</style>
