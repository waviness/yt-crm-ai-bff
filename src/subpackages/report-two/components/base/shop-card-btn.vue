<template>
  <view class="shop-card-btn flex items-center justify-center bg-main" @click="handleClick">
    <up-icon name="shopping-cart" color="#fff" size="30"></up-icon>
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  cardType: string;
}
const props = defineProps<IProps>();
const handleClick = () => {
  uni.navigateTo({
    url: '/subpackages/report-two/shop-cart/index?cartType=' + props.cardType,
  });
};
</script>

<style lang="scss" scoped>
.shop-card-btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  position: fixed;
  bottom: 120rpx;
  right: 10rpx;
  z-index: 999;
}
</style>
