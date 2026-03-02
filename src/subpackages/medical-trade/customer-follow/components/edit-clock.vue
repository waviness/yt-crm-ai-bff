<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import ClockIn from './clock-in.vue';

interface IProps {
  clockObj: {
    clickInValue: string;
    clickOutValue: string;
    addressInDeatilValue: string;
    addressOutDeatilValue: string;
  };
  clockShow: boolean;
  visitDate: string;
}

const props = defineProps<IProps>();
const emit = defineEmits(['clockCancel', 'clockSure']);

// 状态
const innerClockShow = ref(false);
const showAdressPicker = ref(false);
const clickType = ref(0); // 1: 签到, 2: 签退

// 打卡数据
const clickInValue = ref('');
const clickOutValue = ref('');
const addressInDeatilValue = ref('');
const addressOutDeatilValue = ref('');

/**
 * 打卡签到
 */
const clickInChange = () => {
  clickType.value = 1;
  showAdressPicker.value = true;
};

/**
 * 打卡签退
 */
const clickOutChange = () => {
  clickType.value = 2;
  showAdressPicker.value = true;
};

/**
 * 选择已有打卡信息
 */
const adressOnConfirm = (item: any) => {
  if (!item) {
    if (clickType.value === 1) {
      clickInValue.value = '';
      addressInDeatilValue.value = '';
    } else if (clickType.value === 2) {
      clickOutValue.value = '';
      addressOutDeatilValue.value = '';
    }
    showAdressPicker.value = false;
    return;
  }

  if (clickType.value === 1) {
    clickInValue.value = item.cciId;
    addressInDeatilValue.value = `${item.cciId}/${item.address}`;
  } else if (clickType.value === 2) {
    clickOutValue.value = item.cciId;
    addressOutDeatilValue.value = `${item.cciId}/${item.address}`;
  }
  showAdressPicker.value = false;
};

/**
 * 立即打卡确认
 */
const addressChoose = (val: any) => {
  if (clickType.value === 1) {
    clickInValue.value = val.addressID;
    addressInDeatilValue.value = val.addressDetail;
  } else if (clickType.value === 2) {
    clickOutValue.value = val.addressID;
    addressOutDeatilValue.value = val.addressDetail;
  }
  showAdressPicker.value = false;
};

/**
 * 取消
 */
const clockCancel = () => {
  emit('clockCancel');
};

/**
 * 确认
 */
const clockSure = () => {
  const params = {
    clickInValue: clickInValue.value,
    clickOutValue: clickOutValue.value,
    addressInDeatilValue: addressInDeatilValue.value,
    addressOutDeatilValue: addressOutDeatilValue.value,
  };
  emit('clockSure', params);
};

// 监听显示状态
watch(
  () => props.clockShow,
  val => {
    innerClockShow.value = val;
  },
  { immediate: true }
);

// 初始化数据
onMounted(() => {
  clickInValue.value = props.clockObj.clickInValue;
  clickOutValue.value = props.clockObj.clickOutValue;
  addressInDeatilValue.value = props.clockObj.addressInDeatilValue;
  addressOutDeatilValue.value = props.clockObj.addressOutDeatilValue;
});
</script>

<template>
  <up-popup
    :show="innerClockShow"
    mode="bottom"
    round="16"
    closeable
    :customStyle="{ height: '85vh' }"
    @close="clockCancel"
  >
    <view class="h-full flex flex-col">
      <view class="text-16 font-bold text-center py-4">编辑打卡信息</view>

      <up-form class="flex-1">
        <app-form-item label="打卡签到">
          <view
            :class="`w-full text-right ${addressInDeatilValue ? '' : 'color-gray-6'}`"
            @click="clickInChange"
          >
            {{ addressInDeatilValue || '点击选择打卡签到信息' }}
          </view>
        </app-form-item>

        <app-form-item label="打卡签退" :borderBottom="false">
          <view
            :class="`w-full text-right ${addressOutDeatilValue ? '' : 'color-gray-6'}`"
            @click="clickOutChange"
          >
            {{ addressOutDeatilValue || '点击选择打卡签退信息' }}
          </view>
        </app-form-item>
      </up-form>

      <view class="p-10 flex items-center justify-center">
        <up-button size="large" shape="circle" plain class="flex-1 mr-3" @click="clockCancel">
          取消
        </up-button>
        <up-button size="large" shape="circle" type="primary" class="flex-1" @click="clockSure">
          确定
        </up-button>
      </view>
    </view>
  </up-popup>

  <!-- 打卡信息选择 -->
  <clock-in
    v-if="showAdressPicker"
    :visitDate="visitDate"
    :showAdressPicker="showAdressPicker"
    @adressOnConfirm="adressOnConfirm"
    @addressChoose="addressChoose"
    @adressCancel="showAdressPicker = false"
  />
</template>

<style lang="scss" scoped></style>
