<script setup lang="ts">
defineOptions(SHARED_STYLE_OPTIONS);

interface IProps {
  item: any;
  selectLabelFlag: boolean;
  isSubmit: boolean;
  weekType?: number;
  cwrdocId: string;
  needOptions?: any[];
}

const props = withDefaults(defineProps<IProps>(), {
  needOptions: () => [],
});

const emit = defineEmits<{
  deleteClick: [item: any];
  'update:checked': [value: boolean];
  'update:exceptTimeStr': [value: string];
  'update:labelRemark': [value: string];
  'update:cwrdocId': [value: string];
}>();

const appStore = useAppStore();

// 类型映射
const objTypeMap: Record<number, string> = { 1: '供应商', 2: '下游客户', 3: '政府单位' };
const objIdMap: Record<number, string> = {
  10052: '客户拜访',
  10051: '品种进院',
  10050: '厂家协同',
  10049: '货款催收',
  10048: '其他事务',
};

const objTypeName = computed(() => objTypeMap[props.item.objType] || '');
const objIdName = computed(() => objIdMap[props.item.objId] || '');
const detailLabel = computed(() => (props.item.tableType !== 4 ? '详情' : '计划'));
const submitUserNameList = computed(() =>
  (props.item.submitUserName || '').split('/').filter(Boolean)
);

// checkbox-group的值，使用数组来管理
const checkboxValue = ref<string[]>(props.item.checked ? ['checked'] : []);
const CHECKBOX_NAME = 'checked';

watch(
  () => props.item.checked,
  val => {
    checkboxValue.value = val ? [CHECKBOX_NAME] : [];
  }
);

// 本地响应式变量
const exceptTimeStr = ref(props.item.exceptTimeStr || '');
const labelRemark = ref(props.item.labelRemark || '');

// 监听 props 变化，同步到本地变量
watch(
  () => props.item.exceptTimeStr,
  val => (exceptTimeStr.value = val || '')
);
watch(
  () => props.item.labelRemark,
  val => (labelRemark.value = val || '')
);

// 计算checked状态
const checked = computed(() => checkboxValue.value.includes(CHECKBOX_NAME));

// checkbox-group的change事件
const checkboxChange = (val: string[]) => {
  checkboxValue.value = val;
  emit('update:checked', checked.value);
};

// 遮罩层点击切换选中状态
const changeCheckClick = () => {
  const newChecked = !checked.value;
  checkboxValue.value = newChecked ? [CHECKBOX_NAME] : [];
  emit('update:checked', newChecked);
};

const inputChange = (e: any, type: number) => {
  const value = e.detail?.value || e.target?.value || e;
  if (type === 1) {
    exceptTimeStr.value = value;
    emit('update:exceptTimeStr', value);
  } else if (type === 2) {
    labelRemark.value = value;
    emit('update:labelRemark', value);
  }
  emit('update:cwrdocId', props.cwrdocId);
};

const deleteClick = () => {
  emit('deleteClick', props.item);
};
</script>

<template>
  <up-swipe-action class="my-2">
    <up-swipe-action-item
      :disabled="isSubmit"
      :options="
        !isSubmit
          ? [{ text: '删除', style: { backgroundColor: appStore.theme.color.danger } }]
          : [{ text: '' }]
      "
      class="bg-white rounded-10rpx shadow-view"
      @click="deleteClick"
    >
      <view class="shadow-view rounded-10rpx relative bg-white overflow-hidden">
        <up-form class="bg-white">
          <!-- 单位类型 -->
          <app-cell
            v-if="item.tableType !== 4"
            title="单位类型"
            :value="objTypeName"
            value-class="color-black-2"
            border
          />
          <!-- 类型 -->
          <app-cell
            v-if="item.tableType === 4"
            title="类型"
            :value="objIdName"
            value-class="color-black-2"
            border
          />
          <!-- 单位信息 -->
          <app-cell
            title="单位信息"
            :value="item.objName || ''"
            value-class="color-black-2"
            border
          />
          <!-- 预期时间 -->
          <app-form-item
            v-if="item.objId === 10041 && !isSubmit"
            label="预期时间"
            :borderBottom="true"
          >
            <up-input
              v-model="exceptTimeStr"
              class="w-full text-right text-14px border border-solid border-default rounded-4px p-4px px-8px min-h-32px"
              placeholder="请输入预期时间"
              @input="inputChange($event, 1)"
            />
          </app-form-item>
          <app-cell
            v-else-if="item.objId === 10041"
            title="预期时间"
            :value="item.exceptTimeStr"
            value-class="color-black-2"
            border
          />
          <!-- 详情/计划 -->
          <app-form-item v-if="!isSubmit" :label="detailLabel" :borderBottom="true">
            <up-textarea
              v-model="labelRemark"
              class="w-full text-right min-h-60px"
              :customStyle="{ fontSize: '28rpx' }"
              placeholder=""
              auto-height
              border="none"
              @input="inputChange($event, 2)"
            />
          </app-form-item>
          <app-cell
            v-else
            :title="detailLabel"
            :value="item.labelRemark"
            value-class="color-black-2"
            border
          />
          <!-- 填报人 -->
          <app-cell
            v-if="weekType !== 1 && item.userId"
            title="填报人"
            :value="item.userId + '/' + item.userName"
            value-class="color-black-2"
            border
          />
          <!-- 提交对象 -->
          <app-cell
            v-if="item.submitUserName && submitUserNameList.length > 0"
            title="提交对象"
            :border="false"
          >
            <view class="flex flex-wrap justify-end">
              <up-tag
                v-for="(val, index) in submitUserNameList"
                :key="index"
                :text="val"
                type="primary"
                size="mini"
                plain
                class="mr-2"
              />
            </view>
          </app-cell>
        </up-form>
        <!-- 标签选择遮罩 -->
        <view
          v-if="selectLabelFlag"
          class="absolute top-0 left-0 z-1 w-full h-full bg-[rgb(50,50,51,0.1)] flex items-center justify-end pr-2"
          @click="changeCheckClick"
        >
          <up-checkbox-group v-model="checkboxValue" @change="checkboxChange" shape="circle">
            <up-checkbox name="checked" size="30px" @tap.native.stop />
          </up-checkbox-group>
        </view>
      </view>
    </up-swipe-action-item>
  </up-swipe-action>
</template>

<style lang="scss" scoped>
:deep(.u-textarea) {
  padding: 0 !important;

  textarea {
    font-size: 28rpx;
  }
}
</style>
