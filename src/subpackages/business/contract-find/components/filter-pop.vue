<script setup lang="ts">
import time from '@/utils/time';
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  formData: {
    custom: string;
    goods: string;
    start: string;
    end: string;
  };
}

const props = defineProps<IProps>();
const emit = defineEmits<{
  confirm: [value: any];
}>();

const filterShow = ref(false);
const calendarRef = ref();
const minDate = ref(new Date(2010, 0, 1));
const maxDate = ref(new Date());

const filterVal = ref({
  goods: '',
  custom: '',
  start: time.format(new Date(), time.FORMATS.ISO_DATE),
  end: time.format(new Date(), time.FORMATS.ISO_DATE),
});

// 是否有筛选条件
const filterSome = computed(() => {
  if (
    !filterShow.value &&
    (filterVal.value.goods || filterVal.value.custom || filterVal.value.start)
  ) {
    return true;
  }
  return false;
});

// 日期选择确认
const onDateConfirm = (value: any) => {
  filterVal.value.start = time.format(value.range.before, time.FORMATS.ISO_DATE);
  filterVal.value.end = time.format(value.range.after, time.FORMATS.ISO_DATE);
};

// 重置
const reset = () => {
  filterVal.value = {
    goods: '',
    custom: '',
    start: time.format(new Date(), time.FORMATS.ISO_DATE),
    end: time.format(new Date(), time.FORMATS.ISO_DATE),
  };
};

// 确认
const onConfirm = () => {
  filterShow.value = false;
  emit('confirm', filterVal.value);
};

// 监听 formData 变化
watch(
  () => props.formData,
  newVal => {
    filterVal.value = { ...newVal };
  },
  { deep: true, immediate: true }
);
</script>

<template>
  <view>
    <view class="filter flex bg-white p-10 relative z-9999">
      <view
        :class="[
          'filter-item justify-between px-10',
          filterShow ? 'color-main' : '',
          filterSome ? 'bg-main color-white' : '',
        ]"
        @click="filterShow = !filterShow"
      >
        <view>条件筛选</view>
        <up-icon
          :name="filterShow ? 'arrow-up' : 'arrow-down'"
          :color="filterSome ? 'white' : ''"
          size="32rpx"
        />
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <up-popup
      :show="filterShow"
      mode="top"
      round="16"
      customStyle="top: 116rpx"
      @close="filterShow = false"
    >
      <up-form>
        <!-- 确认时间范围 -->
        <app-form-item label="确认时间范围" :borderBottom="true">
          <view
            class="w-full text-right text-14"
            :class="filterVal.start ? 'color-black-2' : 'color-gray-6'"
            @click="calendarRef.open()"
          >
            {{ filterVal.start ? `${filterVal.start} 至 ${filterVal.end}` : '点击选择' }}
          </view>
        </app-form-item>

        <!-- 客户ID|客户名称 -->
        <app-form-item label="客户ID|客户名称" :borderBottom="true">
          <up-input
            v-model="filterVal.custom"
            placeholder="请输入客户ID|客户名称"
            input-align="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>

        <!-- 货品ID|货品名称 -->
        <app-form-item label="货品ID|货品名称" :borderBottom="false">
          <up-input
            v-model="filterVal.goods"
            placeholder="请输入货品ID|货品名称"
            input-align="right"
            fontSize="28rpx"
            border="none"
            clearable
          />
        </app-form-item>
      </up-form>

      <view class="dropdown-opts h-80px flex justify-evenly items-center">
        <up-button
          class="dropdown-opts__btn"
          :customStyle="{
            width: '44%',
            height: '40px',
            borderRadius: '40px',
          }"
          @click="reset"
        >
          重置
        </up-button>

        <up-button
          class="dropdown-opts__btn"
          type="primary"
          :customStyle="{
            width: '44%',
            height: '40px',
            borderRadius: '40px',
            background: '#2271F5',
          }"
          @click="onConfirm"
        >
          确认
        </up-button>
      </view>
    </up-popup>

    <!-- 日期选择器 -->
    <app-calendar
      ref="calendarRef"
      mode="range"
      :date="filterVal.start ? [filterVal.start, filterVal.end] : ''"
      :min-date="time.format(minDate, time.FORMATS.ISO_DATE)"
      :max-date="time.format(maxDate, time.FORMATS.ISO_DATE)"
      title="选择时间范围"
      @confirm="onDateConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
.filter {
  position: relative;
  z-index: 9999;

  &-item {
    border-radius: 10px;
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    display: flex;
    align-items: center;
    border: 1px solid #bababa;
    width: 100%;
  }
}

.dropdown-opts {
  &__btn {
    height: 40px;
  }
}
</style>
