<template>
  <view>
    <app-icon style="width: 26px; height: 26px" :name="`sjzx-${Item.leftIco}`" class="mb-2" multi />
    <!-- <img class="card-icon" :src="`/static/images/sjzx-${Item.leftIco}`" alt="" /> -->
    <img class="card-arrow" :src="'/static/images/sjzx-jitou.png'" alt="" />
    <view class="card-title">
      {{ Item.titlePrefix
      }}<span v-if="Item.titleHighlight" class="color-main">{{ Item.titleHighlight }}</span>
    </view>
    <view class="card-desc">{{ Item.desc }}</view>
  </view>
</template>
<script setup lang="ts">
interface cardProps {
  // 接收一个字符串类型的文字
  Item: any;
}
defineProps<cardProps>();
</script>
<style lang="scss" scoped>
.card-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 9px;
}

.card-arrow {
  position: absolute;
  right: 20px;
  top: 20px;
  width: 16px;
  height: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;

  span {
    color: #2271f5;
  }
}

.card-desc {
  font-size: 10px;
  color: #b0b0b0;
  margin-top: 8px;
}
</style>
