<script setup lang="ts">
import { useUnitDictionary } from './composables/use-unit-dictionary';

const appStore = useAppStore();

// 获取路由参数
const type = ref<string | number>(1); // 1查看 2修改
const customerInfo = ref<any>(appStore.detailObj || {});

// 使用字典 composable
const {
  hosTypeList,
  saleTypeList,
  learnTypeList,
  roleTypeList,
  getSearchList: fetchDictionaryList,
} = useUnitDictionary();

// 状态
const submitLoading = ref(false);
const actionShow = ref(false);
const actionType = ref(0); // 1科室角色 2销售规模 3学术专线 4经营性质

const isProfitList = ref<any[]>([
  { value: 1, name: '政府办' },
  { value: 2, name: '非政府办营利' },
  { value: 3, name: '非政府办非营利' },
]);
const orgRoleEdit = ref(true);

// 表单数据
const formData = ref<any>({
  orgRole: {},
  yearSalesVolume: {},
  intPercent: '',
  scienceLine: {},
  shareholderCompose: '',
  isProfit: {},
  profitProperty: '',
  ...customerInfo.value,
});

/**
 * 获取字典数据并初始化表单
 */
const getSearchList = async () => {
  try {
    await fetchDictionaryList();

    // 初始化表单数据
    formData.value = { ...customerInfo.value };
    formData.value.orgRole = formData.value.orgRoleId
      ? {
          value: formData.value.orgRoleId,
          name:
            roleTypeList.value.find((item: any) => item.value === +formData.value.orgRoleId)
              ?.name || '',
        }
      : {};
    formData.value.yearSalesVolume = formData.value.yearSalesVolume
      ? {
          value: formData.value.yearSalesVolume,
          name:
            saleTypeList.value.find((item: any) => item.value === +formData.value.yearSalesVolume)
              ?.name || '',
        }
      : {};
    formData.value.scienceLine = formData.value.scienceLine
      ? {
          value: formData.value.scienceLine,
          name:
            learnTypeList.value.find((item: any) => item.value === +formData.value.scienceLine)
              ?.name || '',
        }
      : {};
    formData.value.isProfit = {
      value: formData.value.isProfit,
      name:
        formData.value.isProfit === 1
          ? '政府办'
          : formData.value.isProfit === 2
            ? '非政府办营利'
            : formData.value.isProfit === 3
              ? '非政府办非营利'
              : '',
    };
  } catch (error) {
    console.error('获取字典数据失败:', error);
  }
};

/**
 * 选择筛选
 */
const chooseFilter = (filterType: number) => {
  actionShow.value = true;
  actionType.value = filterType;
};

/**
 * 选择科室角色
 */
const onSelectRoleType = (action: any) => {
  actionShow.value = false;
  formData.value.orgRole = action;
};

/**
 * 选择销售规模
 */
const onSelectSaleType = (action: any) => {
  actionShow.value = false;
  formData.value.yearSalesVolume = action;
};

/**
 * 选择学术专线
 */
const onSelectLearnType = (action: any) => {
  actionShow.value = false;
  formData.value.scienceLine = action;
};

/**
 * 选择经营性质
 */
const onSelectProfit = (action: any) => {
  actionShow.value = false;
  formData.value.isProfit = action;
};

/**
 * 检查是否允许修改科室角色
 */
const isAllow = async (custId: any) => {
  try {
    await CustomerService.isAllowUpdateOrgRole({ custId });
    orgRoleEdit.value = true;
  } catch (error) {
    orgRoleEdit.value = false;
    console.error('检查权限失败:', error);
  }
};

/**
 * 提交保存
 */
const submit = async () => {
  const {
    cceId,
    custId,
    custName,
    intPercent,
    profitProperty,
    shareholderCompose,
    orgRole,
    scienceLine,
    yearSalesVolume,
    isProfit,
  } = formData.value;
  if (!orgRole.value) {
    showToast('请选择科室角色');
    return;
  }
  if (!scienceLine.value) {
    showToast('请选择学术专线');
    return;
  }
  submitLoading.value = true;
  await CustomerService.updateCustomInfo({
    cceId,
    customId: custId,
    customName: custName,
    intPercent,
    isProfit: isProfit.value || '',
    orgRoleId: orgRole.value,
    profitProperty,
    scienceLine: scienceLine.value,
    shareholderCompose,
    yearSalesVolume: yearSalesVolume.value || '',
  });
  appStore.setHadDoneOnDetail(true);
  submitLoading.value = false;
  showSuccess('保存成功');
  setTimeout(() => {
    router.back();
  }, 500);
};

/**
 * 编辑详情
 */
const editDetail = () => {
  type.value = 2;
  if (customerInfo.value.cceId) {
    isAllow(customerInfo.value.custId);
  }
};

// 生命周期
onLoad((opts: any) => {
  type.value = +opts.type;
  getSearchList();
  if (+type.value === 2 && customerInfo.value.cceId) {
    isAllow(customerInfo.value.custId);
  }
});
</script>

<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="pb-100">
      <view class="text-14 p-10">客户信息{{ +type === 1 ? '详情' : '编辑' }}</view>
      <view class="text-14 mt-4 mb-2 px-10 mx-10 title-before">基础信息</view>
      <view class="bg-white rounded-1 mb-2">
        <app-cell
          title="客户信息"
          :value="formData.custId ? formData.custId + '/' + formData.custName : ''"
          border
        />
        <app-cell
          title="医院等级"
          :value="formData.hospitalLevel || '-'"
          value-class="color-gray-5"
          border
        />
        <app-cell
          v-if="!formData.isShare"
          title="已维护人数"
          :value="formData.personNum"
          value-class="color-main"
          border
        />
        <app-cell
          v-if="!formData.isShare"
          title="一般客情热力值"
          :value="formData.warmthPersonNum"
          value-class="color-success"
          border
        />
        <app-cell
          title="维护人"
          :value="formData.cceId && formData.creName ? formData.creName : ''"
          value-class="color-gray-5"
        />
      </view>
      <view class="text-14 mt-4 mb-2 px-10 mx-10 title-before">拓展信息</view>
      <view v-if="+type === 2" class="bg-white rounded-1 mb-2">
        <up-form>
          <app-form-item v-if="orgRoleEdit" label="科室角色维护" :required="orgRoleEdit">
            <view
              :class="`w-full text-right ${formData.orgRole?.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(1)"
            >
              {{ formData.orgRole?.name || '点击选择' }}
            </view>
          </app-form-item>
          <app-form-item v-else label="科室角色维护">
            <view class="w-full text-right">
              {{ formData.orgRole?.name || '' }}
            </view>
          </app-form-item>
          <app-form-item label="年药品总采购额">
            <view
              :class="`w-full text-right ${formData.yearSalesVolume?.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(2)"
            >
              {{ formData.yearSalesVolume?.name || '点击选择' }}
            </view>
          </app-form-item>
          <app-form-item label="英特占比">
            <up-input
              v-model="formData.intPercent"
              type="number"
              placeholder="请输入英特占比(数字)"
              input-align="right"
              fontSize="28rpx"
              border="none"
            />
          </app-form-item>
          <app-form-item label="学术专线" :required="true">
            <view
              :class="`w-full text-right ${formData.scienceLine?.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(3)"
            >
              {{ formData.scienceLine?.name || '点击选择' }}
            </view>
          </app-form-item>
          <app-form-item label="股东成分">
            <up-input
              v-model="formData.shareholderCompose"
              placeholder="请输入股东成分"
              input-align="right"
              fontSize="28rpx"
              border="none"
            />
          </app-form-item>
          <app-form-item label="经营性质">
            <view
              :class="`w-full text-right ${formData.isProfit?.name ? '' : 'color-gray-6'}`"
              @click="chooseFilter(4)"
            >
              {{ formData.isProfit?.name || '点击选择' }}
            </view>
          </app-form-item>
          <app-form-item label="营利性质">
            <up-input
              v-model="formData.profitProperty"
              placeholder="请输入营利性质"
              input-align="right"
              fontSize="28rpx"
              border="none"
            />
          </app-form-item>
        </up-form>
      </view>
      <view v-else class="bg-white rounded-1 mb-2">
        <app-cell title="科室角色维护" :value="formData.orgRole?.name || ''" border />
        <app-cell title="年药品总采购额" :value="formData.yearSalesVolume?.name || ''" border />
        <app-cell title="英特占比" :value="formData.intPercent || ''" border />
        <app-cell title="学术专线" :value="formData.scienceLine?.name || ''" border />
        <app-cell title="股东成分" :value="formData.shareholderCompose || ''" border />
        <app-cell
          title="经营性质"
          :value="
            formData.isProfit
              ? formData.isProfit.value === 1
                ? '政府办'
                : formData.isProfit.value === 2
                  ? '非政府办营利'
                  : formData.isProfit.value === 3
                    ? '非政府办非营利'
                    : ''
              : ''
          "
          border
        />
        <app-cell title="营利性质" :value="formData.profitProperty || ''" />
      </view>
      <view class="flex justify-center mx-4 mt-7">
        <up-button
          v-if="+type === 2"
          :loading="submitLoading"
          type="primary"
          shape="circle"
          @click="submit"
        >
          保存
        </up-button>
        <up-button
          v-else-if="!customerInfo.onlyRead"
          type="primary"
          shape="circle"
          @click="editDetail"
        >
          编辑
        </up-button>
      </view>
      <app-action-sheet
        v-if="actionType === 1"
        :show="actionShow"
        :actions="roleTypeList"
        @select="onSelectRoleType"
        @update:show="actionShow = $event"
      />
      <app-action-sheet
        v-if="actionType === 2"
        :show="actionShow"
        :actions="saleTypeList"
        @select="onSelectSaleType"
        @update:show="actionShow = $event"
      />
      <app-action-sheet
        v-if="actionType === 3"
        :show="actionShow"
        :actions="learnTypeList"
        @select="onSelectLearnType"
        @update:show="actionShow = $event"
      />
      <app-action-sheet
        v-if="actionType === 4"
        :show="actionShow"
        :actions="isProfitList"
        @select="onSelectProfit"
        @update:show="actionShow = $event"
      />
    </view>
  </view>
</template>
