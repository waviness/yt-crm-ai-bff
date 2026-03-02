<template>
  <view>
    <salesHeader
      @update:dateTime="calendarConfirm"
      :searchShowFlag="false"
      :deptNameShowFlag="true"
      :entryObj="entryObj"
    >
      <view class="bg-white flex">
        <up-search
          v-show="pageTypeValue !== 2"
          v-model="searchVal"
          @search="searchClick"
          @clear="searchClick"
          :bgColor="'#f7f8fa'"
          placeholder="搜索"
          :showAction="false"
          input-align="center"
          :clearabled="true"
        />
        <view class="flex flex-1 ml-2" v-show="tabFlag">
          <view class="status-tab flex flex-2 mr-2">
            <!--  -->
            <view
              class="flex-1 flex items-center"
              @click="statusTabClick(0)"
              :class="statusActive === 0 ? 'active' : ''"
            >
              <app-icon
                class="ml-2"
                :name="statusActive === 0 ? 'sjzx-ywkb-white' : 'sjzx-ywkb-blue'"
                multi
                size="18"
              />
              <text class="pl-1">品种</text>
            </view>
            <!--   -->
            <view
              class="flex-1 flex items-center"
              @click="statusTabClick(1)"
              :class="statusActive === 1 ? 'active' : ''"
            >
              <app-icon class="ml-2" name="sjzx-fill" multi size="18" />
              <text class="pl-1">业态</text>
            </view>
          </view>
        </view>
        <view
          v-show="areaFlag"
          @click="areaShow = true"
          class="flex items-center color-gray-4 font-bold text-16 px-2"
        >
          <text> {{ areaArr[0] ? `${areaArr[1].split('市')[0]}地区` : '地区: 全部' }}</text>
          <up-icon name="arrow-down" size="14"></up-icon>
        </view>
      </view>
    </salesHeader>

    <up-picker
      :show="areaShow"
      ref="uPickerRef"
      :columns="areaColumns"
      @confirm="areaConfirm"
      @close="areaClose"
      @cancel="areaClose"
      @change="changeHandler"
    ></up-picker>
  </view>
</template>

<script lang="ts" setup>
import salesHeader from '../base/header.vue';
import type { EntryObj } from '../../types';
const props = defineProps({
  entryObj: {
    type: Object as PropType<EntryObj>,
    required: true,
  },
  statusActive: {
    type: Number,
    required: true,
  },
  pageTypeValue: {
    type: Number,
    required: true,
  },
  tabFlag: {
    type: Boolean,
    required: false,
  },
  areaFlag: {
    type: Boolean,
    required: false,
  },
  areaColumns: {
    type: Array,
    required: false,
  },
  areaColumnData: {
    type: Array,
    required: false,
  },
  areaArr: {
    type: reactive(Array<string>),
    default: () => reactive(['', '']),
    required: false,
  },
});
declare const upPicker: any;
const searchVal = ref('');
const searchClick = () => {
  emit('searchClick', searchVal.value);
};
const calendarConfirm = (date: string) => {
  emit('update:dateTime', date);
};
const emit = defineEmits(['statusTabClick', 'areaConfirm', 'searchClick', 'update:dateTime']);
const areaShow = ref(false);
const uPickerRef = ref<InstanceType<typeof upPicker> | null>(null);
const changeHandler = (e: any) => {
  const { columnIndex, value, values, index } = e;
  if (columnIndex === 0) {
    uPickerRef.value?.setColumnValues(1, props.areaColumnData?.[index]);
  }
};
const areaConfirm = ({ value }: { value: Array<string> }) => {
  console.log('confirm', value);
  areaShow.value = false;
  emit('areaConfirm', value);
};
const areaClose = () => {
  areaShow.value = false;
};
const statusTabClick = (index: number) => {
  searchVal.value = '';
  emit('statusTabClick', index);
};
</script>

<style lang="scss" scoped>
.status-tab {
  height: 37px;
  line-height: 37px;
  border-radius: 30px;
  font-size: 16px;
  border: 1px solid #e7e7e7;

  .active {
    background: #3561f2;
    color: white;
    border-radius: 30px;
  }
}
</style>
