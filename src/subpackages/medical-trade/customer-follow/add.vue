<script setup lang="ts">
import { uploadSingleFile } from '@/utils/upload';
import dayjs from 'dayjs';
import ClockIn from './components/clock-in.vue';
import CustomLabel from './components/custom-label.vue';

const appStore = useAppStore();
const userStore = useUserStore();

// 基础数据
interface CustomerData {
  dateTime: string;
  visitType: string;
  objId: string;
  objName: string;
  contactId: string;
  contactName: string;
  transportId: string;
  transportName: string;
  clickInValue: string;
  addressInDeatilValue: string;
  clickOutValue: string;
  addressOutDeatilValue: string;
  visitUserName: string;
  imagefiles: any[];
}

const customerData = ref<CustomerData>({
  dateTime: '',
  visitType: '1',
  objId: '',
  objName: '',
  contactId: '',
  contactName: '',
  transportId: '',
  transportName: '',
  clickInValue: '',
  addressInDeatilValue: '',
  clickOutValue: '',
  addressOutDeatilValue: '',
  visitUserName: '',
  imagefiles: [],
});

// 弹窗状态
const timeShowPicker = ref(false);
const objShowPicker = ref(false);
const contactShow = ref(false);
const transportShow = ref(false);
const staffMemberShow = ref(false);
const customerLabelShow = ref(false);
const showAdressPicker = ref(false);
const clickType = ref(0); // 1: 签到, 2: 签退

// 选项列表
const sourceType = ref(0); // 0: 拓展客户, 1: 系统内客户

// 客户来源标签页列表
const sourceTypeTabList = [{ name: '拓展客户' }, { name: '系统内客户' }];
const custlistOptions = ref<any[]>([]);
const contactListOptions = ref<any[]>([]);
const transportListOptions = ref<any[]>([]);
const userListOptions = ref<any[]>([]);

// 搜索关键词
const objSearchValue = ref('');
const staffMemberValue = ref('');

// 分页相关
const page = ref(1);
const loading = ref(false);
const refreshing = ref(false);
const finished = ref(false);

// 职员选择
const staffMemberCheck = ref<any[]>([]);
const staffMemberCheckDetail = ref<any[]>([]);
const personActive = ref(0);

// 标签页列表
const tabList = computed(() => {
  return staffMemberCheckDetail.value.map(member => ({
    name: member.userName,
  }));
});

// 处理人员标签页切换
const handlePersonTabChange = ({ index }: { index: number }) => {
  personActive.value = index;
};

// 字典数据
const labelTreeList = ref<any[]>([]);

// 时间选择相关
const minDate = new Date(2019, 0, 1);
const maxDate = new Date();

// 过滤职员列表
const filteredPersonList = computed(() => {
  return userListOptions.value.filter(
    (ele: any) => (ele.userName || '').indexOf(staffMemberValue.value) !== -1
  );
});

/**
 * 时间格式化
 */
const formatter = (type: string, val: string) => {
  if (type === 'year') return val + '年';
  if (type === 'month') return val + '月';
  if (type === 'day') return val + '日';
  if (type === 'hour') return val + '时';
  if (type === 'minute') return val + '分';
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
 * 时间选择确认
 */
const confirmTime = (val: any) => {
  customerData.value.dateTime = dayjs(val).format('YYYY-MM-DD HH:mm');
  timeShowPicker.value = false;
};

/**
 * 获取客户列表
 */
const fetchCustomerList = async () => {
  if (loading.value) return;
  loading.value = true;

  try {
    const params = {
      selectType: 0,
      userIdList: [],
      sourceType: sourceType.value,
      customerType: '',
      relStatus: '',
      keyword: objSearchValue.value,
      pageSize: 10,
      pageNum: page.value,
      dataBelongEntry: 41,
    };

    const res = await SzymCustomerService.getSzymCustomerMng(params);
    if (res.success) {
      const newList = res.data?.list || [];
      if (page.value === 1) {
        custlistOptions.value = newList;
      } else {
        custlistOptions.value = [...custlistOptions.value, ...newList];
      }
      finished.value = !res.data?.hasNextPage;
      if (res.data?.hasNextPage) {
        page.value++;
      }
    }
  } catch (error) {
    console.error('获取客户列表失败', error);
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

/**
 * 客户搜索
 */
const objSearch = (val: string) => {
  page.value = 1;
  custlistOptions.value = [];
  finished.value = false;
  if (!val) {
    fetchCustomerList();
    return;
  }
  fetchCustomerList();
};

/**
 * 打开客户选择
 */
const objChangeClick = () => {
  objShowPicker.value = true;
  custlistOptions.value = [];
  objSearchValue.value = '';
  page.value = 1;
  finished.value = false;
  loading.value = false;
};

/**
 * 下拉刷新
 */
const onRefresh = () => {
  page.value = 1;
  custlistOptions.value = [];
  finished.value = false;
  refreshing.value = true;
  fetchCustomerList();
};

/**
 * 加载更多
 */
const onLoadMore = () => {
  if (finished.value || loading.value) return;
  fetchCustomerList();
};

/**
 * 切换客户来源
 */
const onSourceTypeChange = ({ index }: { index: number }) => {
  sourceType.value = index;
  onRefresh();
};

/**
 * 选择客户
 */
const changeCust = async (item: any) => {
  objShowPicker.value = false;
  customerData.value.objId = item.szymCustomerId;
  customerData.value.objName = item.customerName;
  customerData.value.contactId = '';
  customerData.value.contactName = '';
  customerData.value.transportId = '';
  customerData.value.transportName = '';
  staffMemberCheckDetail.value = [];
  staffMemberCheck.value = [];
  customerData.value.visitUserName = '';

  // 获取客户职员
  await getSzymCustomerStaff(item.szymCustomerId, item.customerStaffNum);
  // 获取分支机构
  await getSzymCustomerContact(item.szymCustomerId);
  // 获取拜访地址
  await getSzymCustomerTransport(item.szymCustomerId);
};

/**
 * 获取客户职员
 */
const getSzymCustomerStaff = async (szymCustomerId: string, pageSize: number) => {
  try {
    const res = await SzymCustomerService.getSzymCustomerStaff({
      szymCustomerId,
      pageNum: 1,
      pageSize,
      dataBelongEntry: 41,
    });
    if (res.success) {
      userListOptions.value = res.data?.list || [];
    }
  } catch (error) {
    console.error('获取客户职员失败', error);
  }
};

/**
 * 获取分支机构
 */
const getSzymCustomerContact = async (szymCustomerId: string) => {
  try {
    const res = await SzymCustomerService.getSzymCustomerContact({
      szymCustomerId,
      dataBelongEntry: 41,
    });
    if (res.success) {
      contactListOptions.value = res.data || [];
    }
  } catch (error) {
    console.error('获取分支机构失败', error);
  }
};

/**
 * 获取拜访地址
 */
const getSzymCustomerTransport = async (szymCustomerId: string) => {
  try {
    const res = await SzymCustomerService.getSzymCustomerTransport({
      szymCustomerId,
      dataBelongEntry: 41,
    });
    if (res.success) {
      transportListOptions.value = res.data || [];
    }
  } catch (error) {
    console.error('获取拜访地址失败', error);
  }
};

/**
 * 职员选择
 */
const staffMemberClick = () => {
  if (!customerData.value.objId || !customerData.value.objName) {
    showToast('请先选择单位信息');
    return;
  }
  staffMemberShow.value = true;
};

/**
 * 职员复选框切换
 */
const staffMemberChange = (item: any) => {
  const userId = item.userId;
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
 * 职员选择确定
 */
const staffMemberSure = () => {
  staffMemberShow.value = false;
  customerData.value.visitUserName = '';
  staffMemberCheckDetail.value = [];

  const selectedUsers = userListOptions.value.filter((ele: any) =>
    staffMemberCheck.value.includes(ele.userId)
  );

  selectedUsers.forEach((user: any, index: number) => {
    customerData.value.visitUserName += user.userName;
    if (index < selectedUsers.length - 1) {
      customerData.value.visitUserName += '،';
    }

    staffMemberCheckDetail.value.push({
      userId: user.userId,
      userName: user.userName,
      phoneNumber: user.phoneNum,
      positionName: user.positionName,
      remarkValueList: [],
    });
  });
};

/**
 * 打卡签到
 */
const clickInChange = () => {
  if (!customerData.value.dateTime) {
    showToast('请先选择拜访时间');
    return;
  }
  clickType.value = 1;
  showAdressPicker.value = true;
};

/**
 * 打卡签退
 */
const clickOutChange = () => {
  if (!customerData.value.dateTime) {
    showToast('请先选择拜访时间');
    return;
  }
  clickType.value = 2;
  showAdressPicker.value = true;
};

/**
 * 打卡信息确认
 */
const adressOnConfirm = (item: any) => {
  if (!item) {
    if (clickType.value === 1) {
      customerData.value.clickInValue = '';
      customerData.value.addressInDeatilValue = '';
    } else if (clickType.value === 2) {
      customerData.value.clickOutValue = '';
      customerData.value.addressOutDeatilValue = '';
    }
    showAdressPicker.value = false;
    return;
  }

  if (clickType.value === 1) {
    customerData.value.clickInValue = item.cciId;
    customerData.value.addressInDeatilValue = `${item.cciId}/${item.address}`;
  } else if (clickType.value === 2) {
    customerData.value.clickOutValue = item.cciId;
    customerData.value.addressOutDeatilValue = `${item.cciId}/${item.address}`;
  }
  showAdressPicker.value = false;
};

/**
 * 立即打卡确认
 */
const addressChoose = (val: any) => {
  if (clickType.value === 1) {
    customerData.value.clickInValue = val.addressID;
    customerData.value.addressInDeatilValue = val.addressDetail;
  } else if (clickType.value === 2) {
    customerData.value.clickOutValue = val.addressID;
    customerData.value.addressOutDeatilValue = val.addressDetail;
  }
  showAdressPicker.value = false;
};

/**
 * 客情事件保存
 */
const addCustomSure = (val: any) => {
  staffMemberCheckDetail.value[personActive.value].remarkValueList = val;
  customerLabelShow.value = false;
};

/**
 * 上传图片
 */
const uploadImages = async () => {
  if (!customerData.value.imagefiles.length) return [];

  showLoading('上传中...');
  const uploadPromises = customerData.value.imagefiles.map(async (file: any) => {
    const fileUrl = await uploadSingleFile({ url: file.url });
    const fileName = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
    const fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
    return {
      fileName,
      fileType,
      fileUrl,
    };
  });

  const result = await Promise.all(uploadPromises);
  hideLoading();
  return result;
};

/**
 * 提交表单
 */
const submitClick = async () => {
  try {
    // 验证必填项
    if (!customerData.value.dateTime) {
      showToast('拜访时间必填!');
      return;
    }
    if (!customerData.value.contactId) {
      showToast('分支机构信息必填!');
      return;
    }
    if (!customerData.value.transportId) {
      showToast('拜访地址信息必填!');
      return;
    }
    if (!staffMemberCheckDetail.value.length) {
      showToast('人员信息必填!');
      return;
    }
    if (!customerData.value.clickInValue) {
      showToast('打卡签到必填!');
      return;
    }
    if (staffMemberCheckDetail.value.some((val: any) => !val.remarkValueList.length)) {
      showToast('客情事件必填!');
      return;
    }

    // 上传图片
    const uploadedImages = await uploadImages();

    // 构建参数
    const params = staffMemberCheckDetail.value.map((person: any) => ({
      taskType: customerData.value.visitType,
      visitTime: customerData.value.dateTime,
      userId: userStore.userInfor?.userId,
      szymCustomerId: customerData.value.objId,
      szymContactId: customerData.value.contactId,
      szymTransportId: customerData.value.transportId,
      visitUserId: person.userId,
      signinCciId: customerData.value.clickInValue,
      signoutCciId: customerData.value.clickOutValue,
      picFileVOList: uploadedImages,
      szymLabelRemarkDOReqList: person.remarkValueList,
      dataBelongEntry: 41,
    }));

    showLoading('提交中...');
    const res = await SzymUserVisitService.optSzymUserVisit(params);
    hideLoading();

    if (res.success) {
      showToast('提交成功');
      appStore.setHadDoneOnDetail(true);
      router.back();
    } else {
      showToast(res.msg || '提交失败');
    }
  } catch (error) {
    hideLoading();
    console.error('提交失败', error);
    showToast('提交失败');
  }
};

/**
 * 取消
 */
const cancelClick = () => {
  router.back();
};

/**
 * 获取字典数据
 */
const initDictData = async () => {
  try {
    const res = await CommonService.getDictionaries({
      full: true,
      pageNum: 1,
      pageSize: 100000,
      usestatus: 1,
      typeId: 73,
    });
    if (res.data?.list) {
      labelTreeList.value = res.data.list.map((ele: any) => ({
        value: ele.DIC_SELECT_ID,
        name: ele.DIC_SELECT_NAME,
      }));
    }
  } catch (error) {
    console.error('获取字典数据失败', error);
  }
};

// 生命周期
onMounted(() => {
  initDictData();
});
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
              customerData.dateTime ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="timeShowPicker = true"
          >
            {{ customerData.dateTime || '点击选择时间' }}
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
        <app-form-item label="客户信息">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.objName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="objChangeClick"
          >
            {{ customerData.objName || '点击选择客户信息' }}
          </view>
        </app-form-item>
        <app-form-item label="分支机构">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.contactName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="contactShow = true"
          >
            {{ customerData.contactName || '点击选择分支机构' }}
          </view>
        </app-form-item>
        <app-form-item label="拜访地址">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.transportName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="transportShow = true"
          >
            {{ customerData.transportName || '点击选择拜访地址' }}
          </view>
        </app-form-item>
        <app-form-item label="打卡签到">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.addressInDeatilValue ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="clickInChange"
          >
            {{
              customerData.dateTime
                ? customerData.addressInDeatilValue || '点击选择打卡签到信息'
                : '请先选择拜访时间'
            }}
          </view>
        </app-form-item>
        <app-form-item label="打卡签退">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.addressOutDeatilValue ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="clickOutChange"
          >
            {{
              customerData.dateTime
                ? customerData.addressOutDeatilValue || '点击选择打卡签退信息'
                : '请先选择拜访时间'
            }}
          </view>
        </app-form-item>
        <app-form-item label="人员信息">
          <view
            :class="[
              'w-full text-right text-14',
              customerData.visitUserName ? 'color-black-2' : 'color-gray-7',
            ]"
            @click="staffMemberClick"
          >
            {{ customerData.visitUserName || '点击选择人员信息' }}
          </view>
        </app-form-item>
        <app-form-item label="医院照片" :borderBottom="false">
          <up-upload v-model="customerData.imagefiles" :maxCount="9" :previewFullImage="true" />
        </app-form-item>
      </up-form>
      <view v-if="staffMemberCheckDetail.length > 0" class="add-person mt-6">
        <view class="px-10 py-2 flex items-center">
          <view class="w-5 h-20 bg-main mr-12rpx"></view>
          <text class="text-14">职员信息</text>
        </view>
        <app-tabs
          v-model="personActive"
          color="main"
          :list="
            staffMemberCheckDetail.map((item: any, index: number) => ({
              idx: index,
              name: item.userName,
            }))
          "
          @change="({ index }: { index: number }) => (personActive = index)"
        />
        <view
          v-for="(item, index) in staffMemberCheckDetail"
          :key="index"
          v-show="personActive === index"
          class="bg-white rounded-1 mb-2"
        >
          <up-form>
            <app-form-item label="人员职务">
              <view class="w-full text-right">{{ item.positionName || '--' }}</view>
            </app-form-item>
            <app-form-item label="客情事件" :borderBottom="false">
              <view
                :class="[
                  'w-full flex justify-end text-14',
                  item.remarkValueList?.length ? 'color-black-2' : 'color-gray-7',
                ]"
                @click="customerLabelShow = true"
              >
                <view v-if="item.remarkValueList?.length" class="flex flex-wrap">
                  <view
                    v-for="(label, labelIndex) in item.remarkValueList"
                    :key="labelIndex"
                    class="bg-main-100 color-main border-main-100 text-12 rounded-10rpx h-40 leading-5 px-2 border-solid border-1 ml-2 mb-1"
                  >
                    {{ label.name || label.labelName }}
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
      :show="timeShowPicker"
      v-model="customerData.dateTime"
      mode="datetime"
      title="选择完整时间"
      :minDate="minDate.getTime()"
      :maxDate="maxDate.getTime()"
      :formatter="formatter"
      :filter="filter"
      @close="timeShowPicker = false"
      @cancel="timeShowPicker = false"
      @confirm="confirmTime"
    />

    <!-- 客户选择 -->
    <up-popup
      :show="objShowPicker"
      mode="bottom"
      :round="16"
      closeable
      @close="objShowPicker = false"
    >
      <view class="h-85vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">客户信息</view>
        <app-tabs :list="sourceTypeTabList" :current="sourceType" @change="onSourceTypeChange" />
        <app-search v-model="objSearchValue" placeholder="搜索" @input="objSearch" />
        <scroll-view class="h-[calc(100%-100px)]" scroll-y enable-flex @scrolltolower="onLoadMore">
          <app-empty
            v-if="!loading && !custlistOptions.length"
            class="pb-6"
            description="暂无数据"
          />
          <up-cell-group>
            <app-cell
              v-for="(item, index) in custlistOptions"
              :key="index"
              clickable
              border
              :title="`${item.szymCustomerId}/${item.customerName}`"
              titleClass="w-full color-black-2"
              @click="changeCust(item)"
            />
          </up-cell-group>
          <up-loadmore
            v-if="loading || custlistOptions.length"
            :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
          />
        </scroll-view>
      </view>
    </up-popup>

    <!-- 分支机构选择 -->
    <up-popup :show="contactShow" mode="bottom" :round="16" closeable @close="contactShow = false">
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">分支机构选择</view>
        <scroll-view class="h-[calc(100%-100px)]" scroll-y enable-flex>
          <app-empty v-if="!contactListOptions.length" class="pb-6" description="暂无数据" />
          <up-cell-group>
            <up-cell
              clickable
              border
              title="取消选择"
              titleClass="w-full color-black-2"
              @click="
                customerData.contactId = '';
                customerData.contactName = '';
                contactShow = false;
              "
            />
            <up-cell
              v-for="(contact, index) in contactListOptions"
              :key="index"
              clickable
              border
              :title="contact.contactName"
              titleClass="w-full color-black-2"
              @click="
                customerData.contactName = contact.contactName;
                customerData.contactId = contact.szymContactId;
                contactShow = false;
              "
            />
          </up-cell-group>
        </scroll-view>
      </view>
    </up-popup>

    <!-- 拜访地址选择 -->
    <up-popup
      :show="transportShow"
      mode="bottom"
      :round="16"
      closeable
      @close="transportShow = false"
    >
      <view class="h-80vh">
        <view class="text-16 font-bold text-center pt-4 pb-2">拜访地址选择</view>
        <scroll-view class="h-[calc(100%-100px)]" scroll-y enable-flex>
          <app-empty v-if="!transportListOptions.length" class="pb-6" description="暂无数据" />
          <up-cell-group>
            <up-cell
              clickable
              border
              title="取消选择"
              titleClass="w-full color-black-2"
              @click="
                customerData.transportId = '';
                customerData.transportName = '';
                transportShow = false;
              "
            />
            <up-cell
              v-for="(transport, index) in transportListOptions"
              :key="index"
              clickable
              border
              :title="transport.transportName"
              titleClass="w-full color-black-2"
              @click="
                customerData.transportName = transport.transportName;
                customerData.transportId = transport.szymTransportId;
                transportShow = false;
              "
            />
          </up-cell-group>
        </scroll-view>
      </view>
    </up-popup>

    <!-- 职员选择 -->
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
                      staffMemberCheck.some((val: any) => val === item.userId) ? 'color-main' : '',
                      'text-14 flex',
                    ]"
                  >
                    <view class="flex-1">{{ item.userName }}</view>
                    <view class="flex-1">{{ item.phoneNum }}</view>
                  </view>
                </template>
                <template #right-icon>
                  <up-checkbox :name="item.userId" />
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

    <!-- 客情事件 -->
    <CustomLabel
      v-if="customerLabelShow"
      :activeName="personActive"
      :staffMemberCheckDetail="staffMemberCheckDetail"
      :labelTreeList="labelTreeList"
      :customerLabelShow="customerLabelShow"
      :customerId="customerData.objId"
      @closeClick="customerLabelShow = false"
      @addCustomSure="addCustomSure"
    />

    <!-- 打卡信息 -->
    <ClockIn
      v-if="showAdressPicker"
      :visitDate="customerData.dateTime"
      :showAdressPicker="showAdressPicker"
      @adressOnConfirm="adressOnConfirm"
      @addressChoose="addressChoose"
      @adressCancel="showAdressPicker = false"
    />
  </view>
</template>

<style lang="scss" scoped>
.tag-primary-plain {
  padding: 4rpx 12rpx;
  border: 1px solid $u-primary;
  color: $u-primary;
  border-radius: 8rpx;
  font-size: 24rpx;
}
</style>
