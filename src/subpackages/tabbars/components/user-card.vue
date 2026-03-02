<script setup lang="ts">
import { getStaticImageDir } from '@/utils/static-path';

interface IUser {
  userId: number;
  userName: string;
  depName: string;
  headerImg: string;
}

interface IWeather {
  weather: string;
  temperature: number | string;
}

interface IProps {
  // 接收一个字符串类型的icon
  bgIcon: string;
  user: IUser;
  locationCity?: string; // 可选参数（加 ? 表示可传可不传）
  // 接收一个对象类型的用户信息
  nowWeather?: IWeather;
  // 接收一个布尔类型的参数
  bigBg?: boolean;
  // 接收loading状态
  loading?: boolean;
}

withDefaults(defineProps<IProps>(), { bigBg: false });
// 设置默认值

// 静态资源路径（使用公共工具函数）
const staticImagePath = getStaticImageDir('images');
</script>

<template>
  <view
    class="user-card bg-white h-200 m-auto flex justify-between items-center relative overflow-hidden"
  >
    <view class="flex text-14 line-height-5">
      <up-avatar :src="user.headerImg"></up-avatar>
      <view class="user-card-left__info ml-2">
        <view>{{ user.userName }}</view>
        <view>{{ user.depName }}</view>
      </view>
    </view>
    <view class="flex items-center relative">
      <app-local-loading :show="loading" text="" bg-color="bg-white/80" />
      <view>
        <view class="text-18">{{ locationCity || '- - - -' }}</view>
        <view class="text-10">
          {{ nowWeather?.weather || '--' }}&nbsp;&nbsp;{{ nowWeather?.temperature || '？' }}℃
        </view>
      </view>
    </view>
    <image
      :class="bigBg ? 'user-card__bigbg' : 'user-card__bg'"
      :src="`${staticImagePath}${bgIcon}.png`"
    />
  </view>
</template>

<style lang="scss" scoped>
.user-card {
  box-sizing: border-box;
  padding: 0 20rpx 0 32rpx;

  &__bg {
    position: absolute;
    top: -28rpx;
    right: 16rpx;
    width: 340rpx;
  }

  &__bigbg {
    position: absolute;
    top: -108rpx;
    right: -20rpx;
    width: 504rpx;
  }
}
</style>
