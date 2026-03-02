<script setup lang="ts">
interface IProps {
  data?: any;
  gray?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
  data: () => ({}),
  gray: false,
});

const emit = defineEmits<{
  click: [];
}>();

const appStore = useAppStore();

const showAll = ref(false);
const indexCaliberWordText: any = ['', 'M', 'Q', 'H', 'Y'];
const indexCaliberTypeText: any = ['', '月', '季度', '半年', '年'];

const totalIndexCaliber = computed((): string => {
  const { minIndex, maxIndex, maxIndexType } = props.data;
  let total = `${indexCaliberWordText[maxIndexType]}${minIndex}${
    maxIndex === minIndex ? '' : `-${indexCaliberWordText[maxIndexType]}${maxIndex}`
  }`;
  if (maxIndexType === 1) {
    // M1-M3转为Q1
    if (minIndex === 1 && maxIndex === 3) {
      total = `${indexCaliberWordText[2]}1`;
    }
    // M1-M6转为H1
    if (minIndex === 1 && maxIndex === 6) {
      total = `${indexCaliberWordText[3]}1`;
    }
    // M1-M12转为Y1
    if (minIndex === 1 && maxIndex === 12) {
      total = `${indexCaliberWordText[4]}1`;
    }
    // M4-M6转为Q2
    if (minIndex === 4 && maxIndex === 6) {
      total = `${indexCaliberWordText[2]}2`;
    }
    // M7-M9转为Q3
    if (minIndex === 7 && maxIndex === 9) {
      total = `${indexCaliberWordText[2]}3`;
    }
    // M7-M12转为H2
    if (minIndex === 7 && maxIndex === 12) {
      total = `${indexCaliberWordText[3]}2`;
    }
    // M10-M12转为Q4
    if (minIndex === 10 && maxIndex === 12) {
      total = `${indexCaliberWordText[2]}4`;
    }
  } else if (maxIndexType === 2) {
    // Q1-Q2转为H1
    if (minIndex === 1 && maxIndex === 2) {
      total = `${indexCaliberWordText[3]}1`;
    }
    // Q1-Q4转为Y1
    if (minIndex === 1 && maxIndex === 4) {
      total = `${indexCaliberWordText[4]}1`;
    }
    // Q3-Q4转为H2
    if (minIndex === 3 && maxIndex === 4) {
      total = `${indexCaliberWordText[3]}2`;
    }
  } else if (maxIndexType === 3) {
    // H1-H2转为Y1
    if (minIndex === 1) {
      total = `${indexCaliberWordText[maxIndexType]}${minIndex}`;
    }
  }
  return total;
});

const onClick = () => {
  emit('click');
};
</script>

<template>
  <view
    :class="['text-left text-14 full-width', gray ? 'bg-gray-10' : 'bg-white']"
    @click="onClick"
  >
    <view class="flex items-center py-3">
      <view
        style="width: 16%; min-width: 75px"
        :class="[
          'color-main-3 flex items-center sticky left-0 pl-4',
          gray ? 'bg-gray-10' : 'bg-white',
        ]"
        @click.stop="showAll = !showAll"
      >
        <view>{{ data.name }}</view>
        <up-icon
          v-if="data.deepProjectDetailNumVOS.length"
          name="arrow-down-fill"
          size="20rpx"
          :color="appStore.theme.color.primary"
          :class="['text-10 ml-1', showAll ? 'rotate-180' : '']"
        />
      </view>
      <view style="width: 16%; min-width: 78px" class="ml-2 slh">
        {{ totalIndexCaliber }}
      </view>
      <view style="width: 16%; min-width: 78px" class="ml-2 slh">{{
        indexCaliberTypeText[data.maxIndexType]
      }}</view>
      <view style="width: 15%; min-width: 60px" class="ml-2 slh">
        {{ Math.round(data.target) }}
      </view>
      <view style="width: 20%; min-width: 102px" class="ml-2 slh flex">
        <view>{{ Math.round(data.targetCompleted) }}</view>
        <view class="color-success ml-3">
          <span v-if="data.targetCompletedInc >= 0">+</span
          >{{ Math.round(data.targetCompletedInc) }}
        </view>
      </view>
      <view style="width: 17%; min-width: 78px" class="ml-2 slh flex"
        >{{ (data.completeRate * 100).toFixed(1) }}%</view
      >
    </view>
    <template v-if="showAll">
      <view
        v-for="(item, idx) in data.deepProjectDetailNumVOS"
        :key="idx"
        class="flex items-center"
      >
        <view
          style="width: 16%; min-width: 75px; height: 44px"
          :class="['sticky left-0 pl-4', gray ? 'bg-gray-10' : 'bg-white']"
        ></view>
        <view style="width: 16%; min-width: 78px" class="py-3 ml-2 slh">
          {{ `${indexCaliberWordText[item.indexCaliberType]}${item.indexCaliber}` }}
        </view>
        <view style="width: 16%; min-width: 78px" class="py-3 ml-2 slh">
          {{ indexCaliberTypeText[item.indexCaliberType] }}
        </view>
        <view style="width: 15%; min-width: 60px" class="py-3 ml-2 slh">
          {{ Math.round(item.target) }}
        </view>
        <view style="width: 20%; min-width: 102px" class="py-3 ml-2 slh flex">
          {{ Math.round(item.targetCompleted) }}
        </view>
        <view style="width: 17%; min-width: 78px" class="py-3 ml-2 slh flex">
          {{ (item.completeRate * 100).toFixed(1) }}%
        </view>
      </view>
    </template>
  </view>
</template>
