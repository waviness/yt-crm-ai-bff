<script setup lang="ts">
import router from '@/utils/router';

const appStore = useAppStore();

// 路由参数
const cupId = ref<string>('');
const igonreCustId = ref<string>('');

// 状态
const actionShow = ref(false);
const actionType = ref(0); // 1科室角色 2部门信息 3职位信息 4客户信息
const custPopShow = ref(false);
const custLoading = ref(false);
const custList = ref<any[]>([]);
const custSearchValue = ref('');
const submitLoading = ref(false);

// 选择数据
const customer = ref<any>({});
const role = ref<any>({});
const dept = ref<any>({});
const position = ref<any>({});

// 选项列表
const roleList = ref<any[]>([]);
const deptList = ref<any[]>([]);
const positionList = ref<any[]>([]);

/**
 * 获取客户列表
 */
const getCustList = async (custom: string) => {
  custList.value = [];
  if (custom !== '') {
    custLoading.value = true;
    const res = await CustomerService.queryPM4CustList({
      custom,
      igonreCustId: igonreCustId.value,
    });
    custList.value = res || [];
    custLoading.value = false;
  }
};

/**
 * 获取科室角色列表
 */
const getRoleList = async (custId: any) => {
  const res = await CustomerService.queryOrgRoleList({ custId });
  roleList.value = res.map((item: any) => ({
    value: item.creId + '-' + item.orgRoleId,
    name: `${item.orgRoleName}（${item.creName}）`,
  }));
};

/**
 * 获取部门列表
 */
const getDeptList = async (val: any) => {
  const params = {
    dicUpperSelectId: val,
    keyword: '',
    pageNum: 1,
    pageSize: 10000,
    typeId: 3,
    upperTypeId: 2,
    usestatus: 1,
    typeSecondId: 1,
  };
  const res = await CommonService.getDictionaries(params);
  deptList.value = res.list.map((ele: any) => ({
    value: ele.DIC_SELECT_ID,
    name: ele.DIC_SELECT_NAME,
  }));
};

/**
 * 获取职位列表
 */
const getPostionFun = async (val: any) => {
  const params = {
    dicUpperSelectId: val,
    keyword: '',
    pageNum: 1,
    pageSize: 10000,
    typeId: 4,
    upperTypeId: 3,
    usestatus: 1,
    typeSecondId: 1,
  };
  const res = await CommonService.getDictionaries(params);
  positionList.value = res.list.map((ele: any) => ({
    value: ele.DIC_SELECT_ID,
    name: ele.DIC_SELECT_NAME,
  }));
};

/**
 * 选择客户
 */
const handleSelectCustomer = (item: any) => {
  customer.value = item;
  role.value = {};
  dept.value = {};
  position.value = {};
  getRoleList(item.custId);
  handleCustPopClose();
};

/**
 * 选择科室角色
 */
const handleSelectRole = (action: any) => {
  actionShow.value = false;
  role.value = action;
  dept.value = {};
  position.value = {};
  getDeptList(action.value.split('-')[1]);
};

/**
 * 选择部门
 */
const handleSelectDept = (action: any) => {
  actionShow.value = false;
  dept.value = action;
  position.value = {};
  getPostionFun(action.value);
};

/**
 * 选择职位
 */
const handleSelectPosition = (action: any) => {
  actionShow.value = false;
  position.value = action;
};

/**
 * 选择筛选
 */
const chooseFilter = (filterType: number) => {
  if (filterType === 4) {
    custPopShow.value = true;
  } else {
    actionShow.value = true;
    actionType.value = filterType;
  }
};

/**
 * 客户搜索
 */
const handleCustSearch = () => {
  getCustList(custSearchValue.value);
};

/**
 * 关闭客户选择弹窗
 */
const handleCustPopClose = () => {
  custPopShow.value = false;
  custSearchValue.value = '';
  custList.value = [];
};

/**
 * 提交转职
 */
const transfer = async () => {
  if (!customer.value.custId) {
    showToast('请选择客户');
    return;
  }
  if (!role.value.value) {
    showToast('请选择科室角色');
    return;
  }
  if (!dept.value.value) {
    showToast('请选择部门');
    return;
  }
  if (!position.value.value) {
    showToast('请选择职位');
    return;
  }
  submitLoading.value = true;
  const res = await CustomerService.personTransfer({
    custId: customer.value.custId,
    orgRoleId: role.value.value.split('-')[1],
    deptId: dept.value.value,
    positionId: position.value.value,
    oldCupId: cupId.value,
    userId: role.value.value.split('-')[0],
  });
  appStore.setHadDoneOnDetail(true);
  showSuccess('转职成功');
  router.back();
  submitLoading.value = false;
};

// 页面加载
onLoad((options: any) => {
  // 接收路由参数
  cupId.value = options?.cupId || '';
  igonreCustId.value = options?.igonreCustId || '';
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="text-14 p-10">转职至</view>
    <up-form>
      <app-form-item
        class="bg-white block"
        label="客户信息"
        :required="true"
        :borderBottom="false"
        :arrow="true"
      >
        <view
          :class="['flex-1 text-right text-14', customer.custId ? 'color-black-2' : 'color-gray-4']"
          @click="chooseFilter(4)"
        >
          {{ customer.custId ? `${customer.custId}/${customer.custName}` : '请输入关键词' }}
        </view>
      </app-form-item>
      <app-form-item
        class="bg-white block mt-2"
        label="科室角色"
        :required="true"
        :borderBottom="false"
        :arrow="true"
      >
        <view
          :class="['flex-1 text-right text-14', role.name ? 'color-black-2' : 'color-gray-4']"
          @click="chooseFilter(1)"
        >
          {{ role.name || '点击选择' }}
        </view>
      </app-form-item>
      <app-form-item
        class="bg-white block mt-2"
        label="部门信息"
        :required="true"
        :borderBottom="false"
        :arrow="true"
      >
        <view
          :class="['flex-1 text-right text-14', dept.name ? 'color-black-2' : 'color-gray-4']"
          @click="chooseFilter(2)"
        >
          {{ dept.name || '点击选择' }}
        </view>
      </app-form-item>
      <app-form-item
        class="bg-white block mt-2"
        label="职位信息"
        :required="true"
        :borderBottom="false"
        :arrow="true"
      >
        <view
          :class="['flex-1 text-right text-14', position.name ? 'color-black-2' : 'color-gray-4']"
          @click="chooseFilter(3)"
        >
          {{ position.name || '点击选择' }}
        </view>
      </app-form-item>
    </up-form>
    <app-bottom-actions class="mt-15 mx-4 block" :fixed="false">
      <app-action-btn class="flex-1" text="取消" @click="router.back()" />
      <app-action-btn
        class="flex-1"
        :loading="submitLoading"
        text="提交"
        type="primary"
        @click="transfer"
      />
    </app-bottom-actions>
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="roleList"
      @select="handleSelectRole"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="deptList"
      @select="handleSelectDept"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 3"
      :show="actionShow"
      :actions="positionList"
      @select="handleSelectPosition"
      @update:show="actionShow = $event"
    />
    <!-- 客户选择弹窗 -->
    <up-popup :show="custPopShow" mode="bottom" :round="0" :customStyle="{ height: '100vh' }">
      <app-search
        v-model="custSearchValue"
        placeholder="请输入搜索关键词"
        cancelButton="always"
        @input="handleCustSearch"
        @clear="handleCustSearch"
        @cancel="handleCustPopClose"
      />
      <scroll-view class="h-[calc(100%-112rpx)]" scroll-y enable-flex>
        <app-empty
          v-if="!custLoading && custList.length === 0 && custSearchValue"
          class="mt-7"
          description="暂无数据"
        />
        <view
          v-for="(item, index) in custList"
          :key="index"
          class="p-12px border-0 border-b border-solid border-gray-12 text-14 color-black-2"
          @click="handleSelectCustomer(item)"
        >
          {{ item.custId }}/{{ item.custName }}
        </view>
        <up-loading-icon v-if="custLoading" mode="spinner" color="main" class="py-4" />
      </scroll-view>
    </up-popup>
  </view>
</template>
