<script setup lang="ts">
import { useCustomerFollowAdd } from './composables/use-customer-follow-add';
import CustomLabel from './components/custom-label.vue';

const {
  customerData,
  staffMemberCheckDetail,
  activeName,
  timeShowPicker,
  objTypeShowPicker,
  visitUserShow,
  objShowPicker,
  staffMemberShow,
  showAdressPicker,
  customerLabelShow,

  // 时间相关
  timeValue,
  minDate,
  maxDate,

  // 协访人相关
  visitUserValue,
  visitUserLoading,
  userOptions,
  visitUserCheck,
  visitUserContentReady,

  // 单位类型
  objTypeActions,

  // 单位相关
  objSearchValue,
  custlistOptions,
  goverListOptions,
  providerInforOptions,

  // 职员相关
  staffMemberValue,
  staffMemberCheck,
  personList,

  // 标签树
  labelTreeList,

  // 分页相关
  unitList,
  unitTotalNum,
  unitLoading,
  resetUnitData,
  loadMoreUnit,

  // 方法
  getLabelTree,
  confirmTime,
  objTypeSelect,
  getUserByParams,
  visitUserChange,
  visitUserSearch,
  openVisitUserPopup,
  closeVisitUserPopup,
  objChangeClick,
  fetchUnitList,
  objSearch,
  changeCust,
  changeProvider,
  changeGover,
  staffMemberClick,
  staffMemberSure,
  adressPickerClick,
  adressOnConfirm,
  addressChoose,
  adressCancel,
  addCustomSure,
  submitClick,
  cancelClick,
} = useCustomerFollowAdd();

// 定义 props
const props = defineProps<{
  curpId?: string;
  objId?: string;
  objName?: string;
  objTypeValue?: string | number;
}>();

// 监听 props 变化同步到 customerData
watch(
  () => props,
  newVal => {
    if (newVal.objId) customerData.value.objId = newVal.objId;
    if (newVal.objName) customerData.value.objName = newVal.objName;
    if (newVal.objTypeValue) customerData.value.objTypeValue = Number(newVal.objTypeValue);
  },
  { deep: true, immediate: true }
);

// Refs
const datetimePickerRef = ref();

/**
 * 时间格式化器
 */
const formatter = (type: string, val: number) => {
  if (type === 'year') return val + '年';
  if (type === 'month') return val + '月';
  if (type === 'day') return val + '日';
  return val;
};

/**
 * 时间过滤器（分钟只能选择15的倍数）
 */
const filter = (type: string, options: number[]) => {
  if (type === 'minute') {
    return options.filter(option => option % 15 === 0);
  }
  return options;
};

/**
 * 获取单位类型文本
 */
const getObjTypeText = (value: number) => {
  const typeMap: Record<number, string> = {
    1: '供应商',
    2: '下游客户',
    3: '政府单位',
  };
  return typeMap[value] || '';
};

/**
 * 获取热力值样式类
 */
const getHotValueClass = (hotid: number) => {
  const classMap: Record<number, string> = {
    1: 'color-success',
    2: 'color-warning',
    3: 'color-danger',
  };
  return classMap[hotid] || '';
};

/**
 * 职员选择切换
 */
const staffMemberChange = (item: any) => {
  const userId = item.userId || item.USER_ID;
  const index = staffMemberCheck.value.findIndex((val: any) => val === userId);
  if (index > -1) {
    // 已选中，取消选中
    staffMemberCheck.value.splice(index, 1);
  } else {
    // 未选中，添加到选中列表
    staffMemberCheck.value.push(userId);
  }
};

/**
 * 过滤职员列表
 */
const filteredPersonList = computed(() => {
  return personList.value.filter(
    (ele: any) => (ele.userName || ele.CU_USER_NAME || '').indexOf(staffMemberValue.value) !== -1
  );
});

/**
 * 获取外勤checkbox的数组值
 */
const getOutsideCheckArray = (item: any) => {
  return item.outsideCheck ? ['outside'] : [];
};

/**
 * 更新外勤状态
 */
const updateOutsideCheck = (item: any, value: any[]) => {
  item.outsideCheck = value.includes('outside') ? 1 : 0;
};

// 生命周期
onMounted(async () => {
  await getLabelTree();
  // 初始化协访人员列表
  await getUserByParams({ leaderFlag: false });
});

// 上拉加载更多（单位选择）
const handleLoadMoreUnit = () => {
  if (!unitLoading.value && unitList.value.length < unitTotalNum.value) {
    loadMoreUnit(fetchUnitList);
  }
};
</script>

<template>
  <view class="h-full pb-50">
    <app-watermark> </app-watermark>
    <view class="py-10 pl-10 text-14">客情新增</view>
    <scroll-view class="h-[calc(100%-140px)]" scroll-y enable-flex>
      <view class="text-14 mt-4 mb-2 px-10 mx-10 title-before">基础信息</view>
      <up-form class="bg-white">
        <app-form-item label="时间选择">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.changeTime ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="timeShowPicker = true"
          >
            {{ customerData.changeTime || '点击选择时间' }}
          </view>
        </app-form-item>
        <app-form-item label="拜访类型">
          <view class="w-full text-right">
            <up-radio-group v-model="customerData.visitType" placement="row" class="justify-end">
              <up-radio name="1" label="个人" iconSize="16" labelSize="14" />
              <up-radio name="2" label="协访" iconSize="16" labelSize="14" />
              <up-radio name="3" label="接待" iconSize="16" labelSize="14" />
            </up-radio-group>
          </view>
        </app-form-item>
        <app-form-item v-if="customerData.visitType === '2'" label="协访人">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.visitUserName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="openVisitUserPopup"
          >
            {{ customerData.visitUserName || '点击选择协访人员' }}
          </view>
        </app-form-item>
        <app-form-item label="单位类型">
          <view
            :class="[
              'w-full text-right text-14',
              getObjTypeText(customerData.objTypeValue) ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="objTypeShowPicker = true"
          >
            {{ getObjTypeText(customerData.objTypeValue) || '点击选择单位类型' }}
          </view>
        </app-form-item>
        <app-form-item label="单位信息">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.objName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="objChangeClick"
          >
            {{ customerData.objName || '点击选择单位信息' }}
          </view>
        </app-form-item>
        <app-form-item label="职员信息">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.staffMemberName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="staffMemberClick"
          >
            {{ customerData.staffMemberName || '点击选择职员信息' }}
          </view>
        </app-form-item>
        <app-form-item label="打卡信息" :borderBottom="false">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.addressDeatilValue ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="adressPickerClick"
          >
            {{
              customerData.addressDeatilValue ||
              (customerData.changeTime ? '点击选择打卡信息' : '请先选择拜访时间')
            }}
          </view>
        </app-form-item>
      </up-form>
      <view v-if="staffMemberCheckDetail.length > 0" class="add-person mt-6">
        <view class="px-10 py-2 flex items-center">
          <view class="w-5 h-20 bg-main mr-12rpx"></view>
          <text class="text-14">职员信息</text>
        </view>
        <app-tabs
          v-model="activeName"
          color="main"
          :list="
            staffMemberCheckDetail.map((item: any, index: number) => ({
              idx: index,
              name: item.userName,
            }))
          "
          @change="({ index }: { index: number }) => (activeName = index)"
        />
        <view
          v-for="(item, index) in staffMemberCheckDetail"
          :key="index"
          v-show="activeName === index"
          class="bg-white rounded-1 mb-2"
        >
          <up-form>
            <app-form-item label="电话">
              <view class="w-full text-right">{{ item.phoneNumber }}</view>
            </app-form-item>
            <app-form-item label="热力值">
              <view :class="`w-full text-right ${getHotValueClass(item.hotid)}`">
                {{ item.hotValue }}
              </view>
            </app-form-item>
            <app-form-item label="是否外勤">
              <up-checkbox-group
                class="w-full flex justify-end"
                :model-value="getOutsideCheckArray(item)"
                @update:model-value="updateOutsideCheck(item, $event)"
              >
                <up-checkbox name="outside" label="外勤" shape="circle" :labelSize="14" />
              </up-checkbox-group>
            </app-form-item>
            <app-form-item label="星标事件">
              <view class="w-full flex justify-end" @click="item.starCheck = !item.starCheck">
                <up-icon
                  :name="item.starCheck ? 'star-fill' : 'star'"
                  size="40rpx"
                  color="#FBD71B"
                />
              </view>
            </app-form-item>
            <app-form-item label="客情事件" :borderBottom="false">
              <view
                :class="[
                  'w-full flex justify-end text-14',
                  item.needLabelValueObj?.length ? 'color-black-2' : 'color-gray-7',
                ]"
                @click="customerLabelShow = true"
              >
                <view v-if="item.needLabelValueObj?.length" class="flex flex-wrap">
                  <view
                    v-for="(label, labelIndex) in item.needLabelValueObj"
                    :key="labelIndex"
                    class="bg-main-100 color-main border-main-100 text-12 rounded-10rpx h-40 leading-5 px-2 border-solid border-1 ml-2 mb-1"
                  >
                    {{ label.labelName }}
                  </view>
                </view>
                <text v-else>点击维护客情事件</text>
              </view>
            </app-form-item>
          </up-form>
        </view>
      </view>
    </scroll-view>
    <app-bottom-actions class="pt-15 px-4">
      <app-action-btn class="flex-1" text="取消" @click="cancelClick" />
      <app-action-btn class="flex-1" type="primary" text="确定" @click="submitClick" />
    </app-bottom-actions>

    <!-- 时间选择 -->
    <up-datetime-picker
      ref="datetimePickerRef"
      :show="timeShowPicker"
      v-model="timeValue"
      mode="datetime"
      title="选择完整时间"
      :minDate="minDate"
      :maxDate="maxDate"
      :formatter="formatter"
      :filter="filter"
      @close="timeShowPicker = false"
      @cancel="timeShowPicker = false"
      @confirm="confirmTime"
    />

    <!-- 单位类型选择 -->
    <app-action-sheet
      :show="objTypeShowPicker"
      :actions="objTypeActions"
      cancel-text="取消"
      description="单位类型选择"
      close-on-click-action
      @select="objTypeSelect"
      @update:show="objTypeShowPicker = $event"
    />

    <!-- 协访人选择 -->
    <up-popup
      :show="visitUserShow"
      mode="bottom"
      :round="16"
      closeable
      @close="closeVisitUserPopup"
    >
      <view class="h-85vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">协访人员选择</view>
        <app-search v-model="visitUserValue" @input="visitUserSearch" />
        <scroll-view v-if="visitUserContentReady" class="h-[calc(100%-100px)]" scroll-y enable-flex>
          <!-- 加载状态 -->
          <view v-if="visitUserLoading" class="flex items-center justify-center py-8">
            <up-loading-icon mode="circle" text="加载中..." textSize="14" />
          </view>
          <!-- 空状态 -->
          <app-empty v-else-if="!userOptions.length" class="py-8" description="暂无协访人员" />
          <!-- 数据列表 -->
          <up-checkbox-group v-else v-model="visitUserCheck" :max="1" shape="circle">
            <up-cell-group>
              <up-cell
                v-for="(item, index) in userOptions"
                :key="'visitUser' + index"
                clickable
                @click="visitUserChange(item)"
              >
                <template #title>
                  <view
                    :class="[
                      visitUserCheck.length && item.userId === visitUserCheck[0]
                        ? 'color-main'
                        : '',
                      'text-14',
                    ]"
                  >
                    <text>{{ item.userCode }}/{{ item.userName }}</text>
                  </view>
                </template>
                <template #right-icon>
                  <up-checkbox :name="item.userId" />
                </template>
              </up-cell>
            </up-cell-group>
          </up-checkbox-group>
        </scroll-view>
        <!-- 内容未准备好时显示加载状态 -->
        <view v-else class="h-[calc(100%-100px)] flex items-center justify-center">
          <up-loading-icon mode="circle" text="加载中..." textSize="14" />
        </view>
      </view>
    </up-popup>

    <!-- 单位选择 -->
    <up-popup
      :show="objShowPicker"
      mode="bottom"
      :round="16"
      closeable
      @close="objShowPicker = false"
    >
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">单位信息</view>
        <app-search v-model="objSearchValue" placeholder="搜索" @input="objSearch" />
        <scroll-view
          class="h-[calc(100%-100px)]"
          scroll-y
          enable-flex
          @scrolltolower="handleLoadMoreUnit"
        >
          <app-empty
            v-if="
              !unitLoading &&
              ((customerData.objTypeValue === 2 && !custlistOptions.length) ||
                (customerData.objTypeValue === 1 && !providerInforOptions.length) ||
                (customerData.objTypeValue === 3 && !goverListOptions.length))
            "
            class="pb-6"
            description="暂无数据"
          />
          <up-cell-group v-if="customerData.objTypeValue === 2">
            <app-cell
              v-for="(item, index) in custlistOptions"
              :key="index"
              clickable
              border
              :title="`${item.custId}/${item.custName}`"
              titleClass="w-full color-black-2"
              @click="changeCust(item)"
            />
          </up-cell-group>
          <up-cell-group v-if="customerData.objTypeValue === 1">
            <app-cell
              v-for="(item, index) in providerInforOptions"
              :key="index"
              clickable
              border
              :title="`${item.cpiId}/${item.providerName}`"
              titleClass="w-full color-black-2"
              @click="changeProvider(item)"
            />
          </up-cell-group>
          <up-cell-group v-if="customerData.objTypeValue === 3">
            <app-cell
              v-for="(item, index) in goverListOptions"
              :key="index"
              clickable
              border
              :title="`${item.govAttributeId}/${item.govAttributeName}(${item.orgnizationName}) --- ${item.ssqCodeName}`"
              titleClass="w-full color-black-2"
              @click="changeGover(item)"
            />
          </up-cell-group>
          <up-loadmore
            v-if="unitLoading || unitList.length < unitTotalNum"
            :status="
              unitLoading ? 'loading' : unitList.length >= unitTotalNum ? 'nomore' : 'loadmore'
            "
          />
        </scroll-view>
      </view>
    </up-popup>

    <!-- 职员信息选择 -->
    <up-popup
      :show="staffMemberShow"
      mode="bottom"
      :round="16"
      closeable
      @close="
        staffMemberShow = false;
        staffMemberCheck = [];
        staffMemberCheckDetail = [];
      "
    >
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">职员信息选择</view>
        <app-search v-model="staffMemberValue" />
        <scroll-view class="h-[calc(100%-440rpx)]" scroll-y enable-flex>
          <up-checkbox-group v-model="staffMemberCheck" shape="circle">
            <up-cell-group>
              <up-cell
                v-for="(item, index) in filteredPersonList"
                :key="index"
                clickable
                @click="staffMemberChange(item)"
              >
                <template #title>
                  <view
                    :class="[
                      staffMemberCheck.some(
                        (val: any) => val === item.userId || val === item.USER_ID
                      )
                        ? 'color-main'
                        : '',
                      'text-14 flex',
                    ]"
                  >
                    <view class="flex-1">{{ item.userName || item.CU_USER_NAME }}</view>
                    <view class="flex-1">{{ item.phoneNum || item.CU_PHONE_NUM }}</view>
                  </view>
                </template>
                <template #right-icon>
                  <up-checkbox :name="item.userId || item.USER_ID" />
                </template>
              </up-cell>
            </up-cell-group>
          </up-checkbox-group>
          <app-empty v-if="!filteredPersonList.length" description="暂无职员信息" />
        </scroll-view>
        <app-bottom-actions class="p-4 pb-15 block" :fixed="false">
          <app-action-btn
            class="flex-1"
            text="取消"
            @click="
              staffMemberShow = false;
              staffMemberCheck = [];
              staffMemberCheckDetail = [];
            "
          />
          <app-action-btn class="flex-1" type="primary" text="确定" @click="staffMemberSure" />
        </app-bottom-actions>
      </view>
    </up-popup>

    <!-- 打卡信息 -->
    <biz-clock-in
      v-model="showAdressPicker"
      :visitDate="customerData.changeTime"
      @adressOnConfirm="adressOnConfirm"
      @addressChoose="addressChoose"
      @adressCancel="adressCancel"
    />

    <!-- 客情事件 -->
    <CustomLabel
      v-if="customerLabelShow"
      :activeName="activeName"
      :staffMemberCheckDetail="staffMemberCheckDetail"
      :customerLabelShow="customerLabelShow"
      :customerId="customerData.objId"
      @closeClick="customerLabelShow = false"
      @addCustomSure="addCustomSure"
    />
  </view>
</template>
