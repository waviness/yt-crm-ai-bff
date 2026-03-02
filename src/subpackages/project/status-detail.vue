<!-- 项目管理 - 准入 - 详情 - 修改状态 -->
<script setup lang="ts">
import StatusBlock from './components/status-block.vue';
import StepTitle from './components/step-title.vue';

// 使用 store
const appStore = useAppStore();

// 响应式数据
const active = ref(0);
const statusDetail = ref<{
  temPurchase?: number;
  temPurchApprove?: number;
  temPurchRecord?: number;
  newGood?: number;
  attendMeeting?: number;
  haveAttendMeeting?: number;
  newGoodRecord?: number;
  [key: string]: any;
}>({});
const submitLoading = ref(false);
const statusArr = ['', 'warning', 'success', 'danger'];
const statusList = [
  {
    name: '临采流程',
    value: 0,
  },
  {
    name: '新药流程',
    value: 1,
  },
];

// 点击临采
const onClickLincai = (type: number) => {
  statusDetail.value.temPurchase = type === statusDetail.value.temPurchase ? 0 : type;
};

// 点击临采审批
const onClickLincaiSp = (type: number) => {
  statusDetail.value.temPurchApprove = type === statusDetail.value.temPurchApprove ? 0 : type;
};

// 点击临采记录
const onClickLincaiJl = (type: number) => {
  statusDetail.value.temPurchRecord = type === statusDetail.value.temPurchRecord ? 0 : type;
};

// 点击新药
const onClickXinyao = (type: number) => {
  statusDetail.value.newGood = type === statusDetail.value.newGood ? 0 : type;
};

// 点击新药上会
const onClickXinyaoSh = (type: number) => {
  statusDetail.value.attendMeeting = type === statusDetail.value.attendMeeting ? 0 : type;
};

// 点击新药过会
const onClickXinyaoGh = (type: number) => {
  statusDetail.value.haveAttendMeeting = type === statusDetail.value.haveAttendMeeting ? 0 : type;
};

// 点击新药记录
const onClickXinyaoJl = (type: number) => {
  statusDetail.value.newGoodRecord = type === statusDetail.value.newGoodRecord ? 0 : type;
};

// 提交
const submit = async () => {
  submitLoading.value = true;
  let params: any = {
    capsId: statusDetail.value.capsId,
    flag: active.value + 1,
  };
  if (active.value === 0) {
    const { temPurchase, temPurchApprove, temPurchRecord } = statusDetail.value;
    params = { ...params, temPurchase, temPurchApprove, temPurchRecord };
  } else {
    const { newGood, attendMeeting, haveAttendMeeting, newGoodRecord } = statusDetail.value;
    params = { ...params, newGood, attendMeeting, haveAttendMeeting, newGoodRecord };
  }
  await ProjectService.updateStatus(params);
  submitLoading.value = false;
  appStore.setHadDoneOnDetail(true);
  showSuccess('成功');
  goBack();
};

// 返回
const goBack = () => {
  router.back();
};

onLoad((opts: any) => {
  const decodedOpts = decodeObjectValues(opts);
  const {
    capsId,
    temPurchase,
    temPurchApprove,
    temPurchRecord,
    newGood,
    attendMeeting,
    haveAttendMeeting,
    newGoodRecord,
  } = decodedOpts;
  statusDetail.value = {
    capsId,
    temPurchase,
    temPurchApprove,
    temPurchRecord,
    newGood,
    attendMeeting,
    haveAttendMeeting,
    newGoodRecord,
  };
});
</script>

<template>
  <view>
    <app-watermark> </app-watermark>
    <app-tabs
      :current="active"
      :list="statusList"
      @change="
        ({ index }: { index: number }) => {
          active = index;
        }
      "
    />
    <view class="mt-2 bg-white p-6 text-sm">
      <view v-if="active === 0">
        <step-title text="临采单" :status="+statusDetail.temPurchase || 0" />
        <view
          :class="[
            'text-gray-800 flex items-center step-div ml-2 pt-3 pl-5 pb-6',
            statusDetail.temPurchase ? `step-div--${statusArr[statusDetail.temPurchase]}` : '',
          ]"
        >
          <status-block
            text="进行中"
            :status="+statusDetail.temPurchase === 1 ? +statusDetail.temPurchase : 0"
            @click="onClickLincai(1)"
            clickable
          />
          <status-block
            text="已完成"
            :status="+statusDetail.temPurchase === 2 ? +statusDetail.temPurchase : 0"
            class="ml-3"
            @click="onClickLincai(2)"
            clickable
          />
        </view>
        <step-title text="临采审批" :status="+statusDetail.temPurchApprove || 0" />
        <view
          :class="[
            'text-gray-800 flex items-center step-div ml-2 pt-3 pl-5 pb-6',
            statusDetail.temPurchApprove
              ? `step-div--${statusArr[+statusDetail.temPurchApprove]}`
              : '',
          ]"
        >
          <status-block
            text="进行中"
            :status="+statusDetail.temPurchApprove === 1 ? +statusDetail.temPurchApprove : 0"
            @click="onClickLincaiSp(1)"
            clickable
          />
          <status-block
            text="已完成"
            :status="+statusDetail.temPurchApprove === 2 ? +statusDetail.temPurchApprove : 0"
            class="ml-3"
            @click="onClickLincaiSp(2)"
            clickable
          />
        </view>
        <step-title text="采购记录" :status="+statusDetail.temPurchRecord || 0" />
        <view class="text-gray-800 flex items-center step-div step-div--none ml-2 pt-3 pl-5 pb-6">
          <status-block
            text="进行中"
            :status="+statusDetail.temPurchRecord === 1 ? +statusDetail.temPurchRecord : 0"
            @click="onClickLincaiJl(1)"
            clickable
          />
          <status-block
            text="已完成"
            :status="+statusDetail.temPurchRecord === 2 ? +statusDetail.temPurchRecord : 0"
            class="ml-3"
            @click="onClickLincaiJl(2)"
            clickable
          />
        </view>
      </view>
      <view v-else>
        <step-title text="新药单" :status="+statusDetail.newGood || 0" />
        <view
          :class="[
            'text-gray-800 flex items-center step-div ml-2 pt-3 pl-5 pb-6',
            statusDetail.newGood ? `step-div--${statusArr[+statusDetail.newGood]}` : '',
          ]"
        >
          <status-block
            text="进行中"
            :status="+statusDetail.newGood === 1 ? +statusDetail.newGood : 0"
            @click="onClickXinyao(1)"
            clickable
          />
          <status-block
            text="已完成"
            :status="+statusDetail.newGood === 2 ? +statusDetail.newGood : 0"
            class="ml-3"
            @click="onClickXinyao(2)"
            clickable
          />
        </view>
        <step-title text="是否上会" :status="+statusDetail.attendMeeting || 0" />
        <view
          :class="[
            'text-gray-800 flex items-center step-div ml-2 pt-3 pl-5 pb-6',
            statusDetail.attendMeeting ? `step-div--${statusArr[+statusDetail.attendMeeting]}` : '',
          ]"
        >
          <status-block
            text="进行中"
            :status="+statusDetail.attendMeeting === 1 ? +statusDetail.attendMeeting : 0"
            @click="onClickXinyaoSh(1)"
            clickable
          />
          <status-block
            text="上会"
            :status="+statusDetail.attendMeeting === 2 ? +statusDetail.attendMeeting : 0"
            class="ml-3"
            @click="onClickXinyaoSh(2)"
            clickable
          />
          <status-block
            text="未上会"
            :status="+statusDetail.attendMeeting === 3 ? +statusDetail.attendMeeting : 0"
            class="ml-3"
            @click="onClickXinyaoSh(3)"
            clickable
          />
        </view>
        <step-title text="是否过会" :status="+statusDetail.haveAttendMeeting || 0" />
        <view
          :class="[
            'text-gray-800 flex items-center step-div ml-2 pt-3 pl-5 pb-6',
            statusDetail.haveAttendMeeting
              ? `step-div--${statusArr[+statusDetail.haveAttendMeeting]}`
              : '',
          ]"
        >
          <status-block
            text="进行中"
            :status="+statusDetail.haveAttendMeeting === 1 ? +statusDetail.haveAttendMeeting : 0"
            @click="onClickXinyaoGh(1)"
            clickable
          />
          <status-block
            text="过会"
            :status="+statusDetail.haveAttendMeeting === 2 ? +statusDetail.haveAttendMeeting : 0"
            class="ml-3"
            @click="onClickXinyaoGh(2)"
            clickable
          />
          <status-block
            text="未过会"
            :status="+statusDetail.haveAttendMeeting === 3 ? +statusDetail.haveAttendMeeting : 0"
            class="ml-3"
            @click="onClickXinyaoGh(3)"
            clickable
          />
        </view>
        <step-title text="采购记录" :status="+statusDetail.newGoodRecord || 0" />
        <view class="text-gray-800 flex items-center step-div step-div--none ml-2 pt-3 pl-5 pb-6">
          <status-block
            text="进行中"
            :status="+statusDetail.newGoodRecord === 1 ? +statusDetail.newGoodRecord : 0"
            @click="onClickXinyaoJl(1)"
            clickable
          />
          <status-block
            text="已完成"
            :status="+statusDetail.newGoodRecord === 2 ? +statusDetail.newGoodRecord : 0"
            class="ml-3"
            @click="onClickXinyaoJl(2)"
            clickable
          />
        </view>
      </view>
    </view>
    <app-bottom-actions class="block pt-15 px-4" :fixed="false">
      <app-action-btn class="flex-1" :disabled="submitLoading" text="取消" @click="goBack" />
      <app-action-btn
        class="flex-1"
        :loading="submitLoading"
        text="保存"
        type="primary"
        @click="submit"
      />
    </app-bottom-actions>
  </view>
</template>

<style lang="scss" scoped>
.step-div {
  border-left: 1px solid #dcdee0;
  margin-top: 2px;
  margin-bottom: 5px;

  &--success {
    border-left: 1px solid #00a870;
  }

  &--warning {
    border-left: 1px solid #ed7b2f;
  }

  &--danger {
    border-left: 1px solid #ea394b;
  }

  &--none {
    border-left: 1px solid #fff;
  }
}
</style>
