<template>
  <view class="flex text-14 items-center py-2 border-b-1 border-b-solid border-#ebedf0">
    <!-- 左侧内容 -->
    <view class="flex flex-1 justify-between items-center">
      <slot name="leftLabel">
        <text class="title color-gray-5 min-w-80px">{{ leftLabel }}</text>
      </slot>
      <slot name="leftContent">
        <text style="word-wrap: break-word; word-break: break-all" :class="leftClass">{{
          leftValue
        }}</text>
      </slot>
    </view>

    <!-- 分隔线 -->
    <view v-if="showRight || rightLabel" class="line"></view>

    <!-- 右侧内容 -->
    <view v-if="showRight || rightLabel" class="flex items-center flex-1 justify-between">
      <slot name="rightLabel">
        <text class="title min-w-80px">{{ rightLabel }}</text>
      </slot>
      <slot name="rightContent">
        <text :class="rightClass">{{ rightValue }}</text>
      </slot>
    </view>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  leftLabel: String;
  leftValue: String | Number;
  leftClass?: String;
  rightLabel?: String;
  rightValue?: String | Number;
  rightClass?: String;
  showRight?: boolean;
}
const props = defineProps<Props>();
</script>

<style lang="scss" scoped>
.line {
  width: 1px;
  height: 20px;
  background-color: #eee;
  margin: 0 8px;
}
</style>
