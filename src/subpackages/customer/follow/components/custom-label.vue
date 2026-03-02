<script setup lang="ts">
interface IProps {
  activeName?: number;
  customerLabelShow: boolean;
  customerId?: number;
  staffMemberCheckDetail?: any[];
}

const props = withDefaults(defineProps<IProps>(), {
  activeName: 0,
  customerId: 0,
  staffMemberCheckDetail: () => [],
});

const emit = defineEmits<{
  closeClick: [];
  addCustomSure: [val: any];
}>();

const appStore = useAppStore();

const innerCustomerLabelShow = ref(false);
const labelShow = ref(false);
const productsShow = ref(false);
const keywords = ref('');
const productsLoading = ref(false);
const isContain = ref(0);
const productsList = ref<any[]>([]);
const activeNames = ref<any[]>([]);
const changeLabelIndex = ref(0);
const activeIndex = ref(0);
const actionShow = ref(false);
const calendarRef = ref();

const labelTreeList = ref<any[]>([]);
const staffMemberCheckDetail = ref<any[]>([]);

const actions = [
  { id: 1, name: '新药会' },
  { id: 2, name: '国谈会' },
  { id: 3, name: '其他' },
];

/**
 * 格式化计划时间
 */
const formatScheduleTime = (date: string) => {
  return date?.split(' ')[0] || '';
};

/**
 * 获取药事会类型名称
 */
const medicBoardTypeName = (medicBoardType: number) => {
  const typeMap: Record<number, string> = {
    1: '新药会',
    2: '国谈会',
    3: '其他',
  };
  return typeMap[medicBoardType] || '';
};

/**
 * 验证函数
 */
const validator = (val: any) => {
  return !!val;
};

/**
 * 选择药事会类型
 */
const handleSelect = (item: any) => {
  actionShow.value = false;
  if (staffMemberCheckDetail.value[props.activeName]?.remarkValueList?.[changeLabelIndex.value]) {
    staffMemberCheckDetail.value[props.activeName].remarkValueList[
      changeLabelIndex.value
    ].medicBoardType = item.id;
  }
};

/**
 * 日期确认
 */
const handleDateConfirm = (value: any) => {
  actionShow.value = false;
  if (staffMemberCheckDetail.value[props.activeName]?.remarkValueList?.[changeLabelIndex.value]) {
    staffMemberCheckDetail.value[props.activeName].remarkValueList[
      changeLabelIndex.value
    ].scheduleMeetingTime = time.format(value.fulldate, time.FORMATS.ISO_DATE);
  }
};

/**
 * 标签树项点击
 */
const labelTreeItemClick = (val: any) => {
  console.log('val', val);
  labelShow.value = false;
  const currentItem =
    staffMemberCheckDetail.value[props.activeName]?.remarkValueList?.[changeLabelIndex.value];
  if (!currentItem) return;

  if (currentItem.labelId === val.LABEL_ID) return;

  currentItem.labelId = val.LABEL_ID;
  currentItem.labelName = val.LABEL_NAME;
  currentItem.remark = '';
  currentItem.medicBoardMemo = '';
  currentItem.scheduleMeetingTime = '';
  currentItem.medicBoardType = '';
  currentItem.medicBoardTypeMemo = '';
};

/**
 * 删除客情事件
 */
const deleteItemClick = (index: number) => {
  const remarkList = staffMemberCheckDetail.value[props.activeName]?.remarkValueList;
  if (!remarkList) return;

  if (remarkList.length === 1) {
    changeLabelIndex.value = 0;
    remarkList.splice(0, 1, {
      labelId: '',
      labelName: '',
    });
  } else {
    changeLabelIndex.value = index;
    remarkList.splice(index, 1);
  }
};

/**
 * 关闭
 */
const closeClick = () => {
  emit('closeClick');
};

/**
 * 新增客情事件
 */
const addCustomList = () => {
  const remarkList = staffMemberCheckDetail.value[props.activeName]?.remarkValueList;
  if (remarkList) {
    remarkList.push({
      labelId: '',
      labelName: '',
    });
  }
};

/**
 * 确认添加
 */
const addCustomSure = async () => {
  const remarkList = staffMemberCheckDetail.value[props.activeName]?.remarkValueList;
  if (!remarkList) return;

  for (let index = 0; index < remarkList.length; index++) {
    const element = remarkList[index];
    if (!element.labelId) {
      showToast('事件分类未全部维护');
      return;
    }
    if (element.labelName !== '药事会信息' && !element.remark) {
      showToast('客情事件备注未全部维护');
      return;
    }
    if (
      element.labelName === '药事会信息' &&
      element.medicBoardType === 3 &&
      !element.medicBoardTypeMemo
    ) {
      showToast('药事会类型备注未全部维护');
      return;
    }
  }

  staffMemberCheckDetail.value[props.activeName].needLabelValueObj = [...remarkList];

  if (appStore.detailObj?.cuvId) {
    await _insOrUpdRemark(staffMemberCheckDetail.value);
  } else {
    appStore.setDetailObj(appStore.detailObj);
    emit('closeClick');
  }
};

/**
 * 新增或修改备注
 */
const _insOrUpdRemark = async (val: any[]) => {
  const staffMemberCheckDetailItem = val[0];
  const remarkList = staffMemberCheckDetailItem.remarkValueList;

  for (let index = 0; index < remarkList.length; index++) {
    const element = remarkList[index];
    if (!element.labelId) {
      showToast('事件分类未全部维护');
      return;
    }
    if (element.labelName !== '药事会信息' && !element.remark) {
      showToast('客情事件备注未全部维护');
      return;
    }
    if (
      element.labelName === '药事会信息' &&
      element.medicBoardType === 3 &&
      !element.medicBoardTypeMemo
    ) {
      showToast('药事会类型备注未全部维护');
      return;
    }
  }

  const params: any[] = [];
  for (let index = 0; index < remarkList.length; index++) {
    const element = remarkList[index];
    if (!element.cuvId) {
      params.push(
        Object.assign(element, {
          cuvId: appStore.detailObj.cuvId,
          isSign: false,
          userIdList: [],
          isSyncToTopic: true,
        })
      );
    } else {
      params.push(
        Object.assign(element, {
          isSign: false,
          userIdList: [],
          isSyncToTopic: true,
        })
      );
    }
  }

  await CustomerFollowService.insOrUpdRemark(params);
  showSuccess('成功');
  const detailObj = appStore.detailObj;
  detailObj.crmLabelRemarkDtoList = params;
  appStore.setDetailObj(detailObj);
  appStore.setHadDoneOnDetail(true);
  emit('closeClick');
};

/**
 * 显示产品列表
 */
const showProducts = (show: boolean = false) => {
  if (show) {
    productsShow.value = true;
  }
};

/**
 * 获取产品列表
 */
const getProductsList = async () => {
  productsLoading.value = true;
  const res = await ProjectService.getProducts({
    key: keywords.value,
    customerId: props.customerId,
  });
  isContain.value = res.isContain;
  productsList.value = res.products;
  productsLoading.value = false;
};

/**
 * 获取标签树
 */
const getLabelTree = async () => {
  const res = await CommonService.getLabelTree({ type: '1' });
  labelTreeList.value = res.map((item: any) => ({
    id: item.LABEL_ID,
    text: item.LABEL_NAME,
    children: (item.CHILD_LIST || []).map((child: any) => ({
      id: child.LABEL_ID,
      text: child.LABEL_NAME,
      LABEL_ID: child.LABEL_ID,
      LABEL_NAME: child.LABEL_NAME,
    })),
    LABEL_ID: item.LABEL_ID,
    LABEL_NAME: item.LABEL_NAME,
    CHILD_LIST: item.CHILD_LIST,
  }));
};

const activeId = ref<number | string>('');

/**
 * 标签导航变化
 */
const handleLabelNavChange = (index: number) => {
  activeIndex.value = index;
  activeId.value = '';
};

/**
 * 标签选择
 */
const handleLabelSelect = (id: number | string) => {
  const currentChildren = labelTreeList.value[activeIndex.value]?.children || [];
  const selectedItem = currentChildren.find((item: any) => item.id === id);
  console.log('id', id);
  console.log('selectedItem', selectedItem);
  if (selectedItem) {
    labelTreeItemClick({
      LABEL_ID: selectedItem.LABEL_ID || selectedItem.id,
      LABEL_NAME: selectedItem.LABEL_NAME || selectedItem.text,
    });
  }
};

watch(
  () => props.customerLabelShow,
  newVal => {
    innerCustomerLabelShow.value = newVal;
    if (newVal) {
      staffMemberCheckDetail.value = props.staffMemberCheckDetail.length
        ? props.staffMemberCheckDetail
        : appStore.detailObj?.staffMemberCheckDetail || [];
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await getLabelTree();
  await getProductsList();
});
</script>

<template>
  <up-popup :show="innerCustomerLabelShow" mode="bottom" :round="16" closeable @close="closeClick">
    <view v-if="innerCustomerLabelShow" class="h-95vh">
      <view class="text-16px font-bold text-center pt-4">客情事件新增</view>
      <scroll-view v-if="staffMemberCheckDetail.length" class="h-[calc(100%-312rpx)]" scroll-y>
        <up-swipe-action class="py-3">
          <up-swipe-action-item
            v-for="(item, index) in staffMemberCheckDetail[activeName]?.remarkValueList"
            :key="index"
            class="bg-white rounded-10rpx shadow-view m-2"
            :options="[{ text: '删除', style: { backgroundColor: appStore.theme.color.danger } }]"
            :disabled="!!item.clrId"
            @click="deleteItemClick(index)"
          >
            <up-form>
              <app-form-item label="事件分类">
                <view
                  :class="['w-full text-right', item.labelName ? 'color-black-2' : 'color-gray-7']"
                  @click="
                    labelShow = true;
                    changeLabelIndex = index;
                  "
                >
                  {{ item.labelName || '点击维护事件分类' }}
                </view>
              </app-form-item>
              <view v-if="item.labelName === '药事会信息'">
                <app-form-item label="药事会类型">
                  <view
                    :class="[
                      'w-full text-right',
                      medicBoardTypeName(item.medicBoardType) ? 'color-black-2' : 'color-gray-7',
                    ]"
                    @click="
                      changeLabelIndex = index;
                      actionShow = true;
                    "
                  >
                    {{ medicBoardTypeName(item.medicBoardType) || '选择药事会类型' }}
                  </view>
                </app-form-item>
                <app-form-item v-if="item.medicBoardType === 3" label="药事会类型备注" required>
                  <up-input
                    v-model="item.medicBoardTypeMemo"
                    clearable
                    input-align="right"
                    fontSize="28rpx"
                    border="none"
                    placeholder="请输入药事会类型备注"
                  />
                </app-form-item>
                <app-form-item label="计划开会日期">
                  <view
                    :class="[
                      'w-full text-right',
                      formatScheduleTime(item.scheduleMeetingTime)
                        ? 'color-black-2'
                        : 'color-gray-7',
                    ]"
                    @click="
                      changeLabelIndex = index;
                      calendarRef.open();
                    "
                  >
                    {{ formatScheduleTime(item.scheduleMeetingTime) || '选择日期' }}
                  </view>
                </app-form-item>
                <app-form-item label="备注">
                  <up-input
                    v-model="item.medicBoardMemo"
                    clearable
                    input-align="right"
                    fontSize="28rpx"
                    border="none"
                    placeholder="请输入备注"
                  />
                </app-form-item>
                <app-form-item label="是否存在准入项目" :borderBottom="false">
                  <view
                    :class="['w-full text-right', isContain ? 'color-success' : 'color-danger']"
                    @click="showProducts(isContain)"
                  >
                    {{ isContain ? '是' : '否' }}
                  </view>
                </app-form-item>
              </view>
              <app-form-item v-else label="客情事件" :borderBottom="false">
                <up-input
                  v-model="item.remark"
                  input-align="right"
                  placeholder="请输入客情事件"
                  fontSize="28rpx"
                  border="none"
                />
              </app-form-item>
            </up-form>
          </up-swipe-action-item>
        </up-swipe-action>
      </scroll-view>
      <app-bottom-actions class="block pt-15 px-4">
        <app-action-btn class="flex-1" text="新增客情事件" @click="addCustomList" />
        <app-action-btn class="flex-1" type="primary" text="确定" @click="addCustomSure" />
      </app-bottom-actions>
    </view>

    <!-- 标签选择 -->
    <up-popup
      :show="labelShow"
      mode="bottom"
      :round="0"
      closeOnClickOverlay
      @close="labelShow = false"
    >
      <view class="h-60vh">
        <app-cate-select
          v-model:activeIndex="activeIndex"
          v-model:activeId="activeId"
          :items="labelTreeList"
          height="100%"
          @update:activeIndex="handleLabelNavChange"
          @update:activeId="handleLabelSelect"
        />
      </view>
    </up-popup>

    <!-- 产品列表 -->
    <up-popup :show="productsShow" mode="bottom" :round="16">
      <view class="h-95vh">
        <view class="text-16px font-bold text-center pt-4">准入项目品种详情</view>
        <app-search v-model="keywords" @input="getProductsList" />
        <app-empty
          v-show="!productsLoading && !productsList.length"
          class="mt-7"
          description="暂无数据"
        />
        <up-loading-icon v-show="productsLoading" mode="spinner" color="main" />
        <up-collapse
          v-show="!productsLoading && productsList.length"
          v-model="activeNames"
          class="overflow-y-auto h-[calc(100%-91px)]"
        >
          <up-collapse-item
            v-for="item in productsList"
            :key="item.projectId"
            :title="item.projectName"
            :name="item.projectId"
          >
            <view
              v-for="(product, idx) in item.productVO"
              :key="idx"
              :class="['px-7 color-black-2', idx === 0 ? '' : 'pt-6']"
            >
              {{ product.productName }}
            </view>
          </up-collapse-item>
        </up-collapse>
      </view>
    </up-popup>

    <!-- 药事会类型选择 -->
    <app-action-sheet
      :show="actionShow"
      :actions="actions"
      cancel-text="取消"
      description="药事会类型"
      close-on-click-action
      @select="handleSelect"
      @update:show="actionShow = $event"
    />

    <!-- 日期选择 -->
    <app-calendar
      ref="calendarRef"
      title="计划日期选择"
      @confirm="handleDateConfirm"
      @close="actionShow = false"
    />
  </up-popup>
</template>
