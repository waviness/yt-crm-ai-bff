<script setup lang="ts">
import router from '@/utils/router';

const appStore = useAppStore();

// 路由参数
const type = ref<number>(1); // 1客户分享 2人员分享
const personDetail = ref<any>({});
const formData = ref<any>({});

// 状态
const actionShow = ref(false);
const actionType = ref(0); // 1人员 2是否更新 3过期时间
const shareCustList = ref<any[]>([]);
const submitLoading = ref(false);

const selectOptions = [
  { value: 0, name: '否' },
  { value: 1, name: '是' },
];

const calendarRef = ref();

/**
 * 获取可分享用户列表
 */
const getRoleList = async () => {
  shareCustList.value = [];
  const detailInfor = appStore.detailObj || {};
  const res =
    type.value === 1
      ? await CustomerService.queryShareCust({
          custId: detailInfor.custId,
          igonreUserId: detailInfor.creId,
          exbandId: detailInfor.cceId,
        })
      : await CustomerService.queryPersonShareUser({
          custId: detailInfor.custId,
          igonreUserId: personDetail.value.operationId,
          exbandId: personDetail.value.cueId,
          orgRoleId: personDetail.value.orgnizationRoleId,
          userId: personDetail.value.userId,
        });
  shareCustList.value = res.map((ele: any) => {
    const { userId, userName, isAlreadyShare } = ele;
    return {
      value: userId,
      name: userId + '/' + userName,
      disabled: isAlreadyShare,
    };
  });
};

/**
 * 选择筛选
 */
const chooseFilter = (filterType: number) => {
  if (filterType !== 1 || !formData.value.cesId) {
    if (filterType === 3) {
      calendarRef.value?.open();
    } else {
      actionShow.value = true;
      actionType.value = filterType;
    }
  }
};

/**
 * 选择用户
 */
const onSelectUser = (action: any) => {
  actionShow.value = false;
  formData.value.user = action;
};

/**
 * 选择是否更新
 */
const onSelectUpdate = (action: any) => {
  actionShow.value = false;
  formData.value.isUpdate = action;
};

/**
 * 日期确认
 */
const onDateConfirm = (value: any) => {
  formData.value.date = time.format(value.fulldate, time.FORMATS.ISO_DATE);
};

/**
 * 提交
 */
const submit = async () => {
  if (!formData.value.user?.name) {
    showToast('请选择人员');
    return;
  }
  if (!formData.value.isUpdate?.name) {
    showToast('请选择是否更新');
    return;
  }
  submitLoading.value = true;
  const detailInfor = appStore.detailObj || {};
  let res: any = {};
  if (type.value === 1) {
    // 客户分享
    if (formData.value.cesId) {
      res = await CustomerService.updateShare({
        isUpdate: formData.value.isUpdate.value,
        validDate: formData.value.date,
        cesId: formData.value.cesId,
      });
    } else {
      res = await CustomerService.share({
        cceId: detailInfor.cceId,
        shareToUserId: formData.value.user.value,
        shareToUserName: formData.value.user.name.split('/')[1],
        isUpdate: formData.value.isUpdate.value,
        validDate: formData.value.date,
      });
    }
  } else {
    // 人员分享
    if (formData.value.cesId) {
      res = await CustomerService.updateSharePerson({
        isModify: 0,
        isUpdate: formData.value.isUpdate.value,
        validDate: formData.value.date,
        cesId: formData.value.cesId,
      });
    } else {
      res = await CustomerService.sharePerson({
        cueId: personDetail.value.cueId,
        shareToUserId: formData.value.user.value,
        shareToUserName: formData.value.user.name.split('/')[1],
        isModify: 0,
        isUpdate: formData.value.isUpdate.value,
        validDate: formData.value.date,
      });
    }
  }
  appStore.setHadDoneOnDetail(true);
  submitLoading.value = false;
  showSuccess('分享成功');
  router.back();
};

// 页面加载
onLoad((options: any) => {
  // 解码路由参数
  const decodedOpts = decodeObjectValues(options);

  // 接收路由参数
  type.value = +(decodedOpts.type || '1');

  personDetail.value = JSON.parse(decodedOpts.personDetail || '{}');

  // 处理 formData，可能是字符串需要解析
  formData.value = JSON.parse(decodedOpts.formData || '{}');

  // 初始化数据
  getRoleList();
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="text-14 p-10">分享至</view>
    <up-form>
      <view class="rounded-1 mb-2">
        <app-form-item
          label="人员"
          class="bg-white block"
          :required="true"
          :borderBottom="false"
          :arrow="true"
        >
          <view
            :class="[
              'flex-1 text-right mr-2 text-14',
              formData.user?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(1)"
          >
            {{ formData.user?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item
          label="是否更新"
          class="bg-white block mt-2"
          :required="true"
          :borderBottom="false"
          :arrow="true"
        >
          <view
            :class="[
              'flex-1 text-right mr-2 text-14',
              formData.isUpdate?.name ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(2)"
          >
            {{ formData.isUpdate?.name || '点击选择' }}
          </view>
        </app-form-item>
        <app-form-item
          label="过期时间"
          class="bg-white block mt-2"
          :borderBottom="false"
          :arrow="true"
        >
          <view
            :class="[
              'flex-1 text-right mr-2 text-14',
              formData.date ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="chooseFilter(3)"
          >
            {{ formData.date || '点击选择' }}
          </view>
        </app-form-item>
      </view>
    </up-form>
    <app-bottom-actions class="mt-15 mx-4 block" :count="2" :fixed="false">
      <app-action-btn class="flex-1" text="取消" @click="router.back()" />
      <app-action-btn class="flex-1" text="提交" type="primary" @click="submit" />
    </app-bottom-actions>
    <app-action-sheet
      v-if="actionType === 1"
      :show="actionShow"
      :actions="shareCustList"
      @select="onSelectUser"
      @update:show="actionShow = $event"
    />
    <app-action-sheet
      v-if="actionType === 2"
      :show="actionShow"
      :actions="selectOptions"
      @select="onSelectUpdate"
      @update:show="actionShow = $event"
    />
    <app-calendar ref="calendarRef" @confirm="onDateConfirm" />
  </view>
</template>
