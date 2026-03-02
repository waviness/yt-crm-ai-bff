<!-- 项目管理 - 准入 - 详情 -->
<script setup lang="ts">
import StatusBlock from './components/status-block.vue';

const appStore = useAppStore();
const userStore = useUserStore();
const projectStore = useProjectStore();

// 响应式数据
const productObj = computed(() => projectStore.productDetail);
const canEdit = ref(false); // 是否能编辑状态
const detail = ref<{
  projectName: string;
  productName: string;
  productPolicy: string;
  customerName: string;
  gradeName: string;
  ytAccesss: number;
  memo?: string;
  salerId: number;
  crmAccesssProjectStatusDO?: {
    temPurchase: number;
    temPurchApprove: number;
    temPurchRecord: number;
    newGood: number;
    attendMeeting: number;
    haveAttendMeeting: number;
    newGoodRecord: number;
  };
}>({
  projectName: '',
  productName: '',
  productPolicy: '',
  customerName: '',
  gradeName: '',
  ytAccesss: 0,
  salerId: 0,
});
const infor = ref<{
  lastScheduleMeetingTime?: string;
  lastMedicBoardType?: number;
  lastMedicBoardTypeMemo?: string;
  clrId?: string;
  scheduleMeetingTime?: string;
  medicBoardType?: number;
  medicBoardTypeMemo?: string;
}>({});
const statusText = ['未准入', '已准入'];

// 格式化时间
const formatScheduleTime = (date: string) => {
  return date?.split(' ')[0] || '-';
};

// 获取详情
const getDetail = async () => {
  const res = await ProjectService.getAccessProjectProductDtl({
    capId: productObj.value.data.capId,
  });
  detail.value = res;
  const res2 = await ProjectService.getYaoShiHui({
    date: productObj.value.date,
    customerId: productObj.value.data.customerId,
    productId: productObj.value.data.productId,
    projectId: productObj.value.data.projectId,
    capId: productObj.value.data.capId,
  });
  infor.value = res2;
  canEdit.value = +userStore.userInfor.userId === +detail.value.salerId;
};

// 跳转到状态详情
const toStatusDetail = () => {
  if (canEdit.value) {
    appStore.setHadDoneOnDetail(false);
    router.push(RouteMap.projectStatusDetail, detail.value.crmAccesssProjectStatusDO);
  }
};

// 跳转到药事会列表
const toYaoshihuiList = () => {
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.projectMedicBoardList);
};

// 页面加载时获取参数
onLoad(() => {
  detail.value = {
    projectName: '',
    productName: '',
    productPolicy: '',
    customerName: '',
    gradeName: '',
    ytAccesss: 0,
    salerId: 0,
  };
  getDetail();
});

onUnload(() => {
  appStore.setHadDoneOnDetail(false);
});

// 页面显示时检查是否需要刷新数据
onShow(() => {
  if (appStore.hadDoneOnDetail) {
    getDetail();
  }
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="p-10">项目管理明细</view>
    <app-cell title="项目名称" :value="detail.projectName" valueClass="color-black-2" border />
    <app-cell title="产品名称" border>
      <app-tag :name="detail.productName" />
    </app-cell>
    <app-cell title="产品政策" :value="detail.productPolicy" valueClass="color-black-2" border />
    <app-cell title="目标医院" :value="detail.customerName" valueClass="color-black-2" border />
    <app-cell title="医院等级" :value="detail.gradeName" valueClass="color-black-2" border />
    <app-cell
      title="是否准入"
      :value="statusText[detail.ytAccesss]"
      :valueClass="
        detail.ytAccesss === 0
          ? 'color-danger'
          : detail.ytAccesss === 1
            ? 'color-success'
            : 'color-black-2'
      "
      border
    />
    <app-cell title="备注" :value="detail.memo || '-'" valueClass="color-black-2" border />
    <app-cell
      title="当前状态"
      title-class="color-gray-5"
      class="bg-white"
      :border="false"
      :isLink="canEdit"
      @click="toStatusDetail"
    />
    <view class="bg-white px-4 py-3 flex items-center">
      <status-block
        text="临采单"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.temPurchase) || 0
        "
      />
      <status-block
        text="临采审批"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.temPurchApprove) ||
          0
        "
        class="ml-3"
      />
      <status-block
        text="采购记录"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.temPurchRecord) || 0
        "
        class="ml-3"
      />
    </view>
    <view class="border-top"></view>
    <view class="bg-white px-4 py-3 flex items-center">
      <status-block
        text="新药单"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.newGood) || 0
        "
      />
      <status-block
        text="是否上会"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.attendMeeting) || 0
        "
        class="ml-3"
      />
      <status-block
        text="是否过会"
        :status="
          (detail.crmAccesssProjectStatusDO &&
            detail.crmAccesssProjectStatusDO.haveAttendMeeting) ||
          0
        "
        class="ml-3"
      />
      <status-block
        text="采购记录"
        :status="
          (detail.crmAccesssProjectStatusDO && detail.crmAccesssProjectStatusDO.newGoodRecord) || 0
        "
        class="ml-3"
      />
    </view>
    <view class="px-10 pb-10 pt-4">药事会信息更新（自动关联CRM）</view>
    <app-cell
      title="上次开会日期"
      :value="formatScheduleTime(infor.lastScheduleMeetingTime)"
      valueClass="color-black-2 font-bold"
    />
    <app-cell
      title="上次药事会类型"
      :value="
        infor.lastMedicBoardType === 3
          ? infor.lastMedicBoardTypeMemo
          : infor.lastMedicBoardType === 1
            ? '新药会'
            : infor.lastMedicBoardType === 2
              ? '国谈会'
              : '-'
      "
      valueClass="color-black-2 font-bold"
    />
    <view v-if="infor.clrId" @click.capture="toYaoshihuiList">
      <app-cell
        class="block mt-2"
        title="计划开会日期"
        :value="formatScheduleTime(infor.scheduleMeetingTime)"
        valueClass="color-black-2"
      />
      <app-cell
        title="药事会类型"
        :value="
          infor.medicBoardType === 3
            ? infor.medicBoardTypeMemo
            : infor.medicBoardType === 1
              ? '新药会'
              : infor.medicBoardType === 2
                ? '国谈会'
                : '-'
        "
        valueClass="color-black-2"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.border-top {
  border-top: 1px solid #ebedf0;
  transform: scaleY(0.5);
}
</style>
