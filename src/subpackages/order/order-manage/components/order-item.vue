<script lang="ts" setup>
/**
 * 订单卡片详情组件
 * 支持多种卡片类型的显示和交互
 */
import type { CustomerOrderInfo, OrderDetailInfo, CardType, LockRecordInfo } from '../types';
import { showModal, showSuccess } from '@/utils/toast';
import { SubscribeReminderService } from '@/api/subscribe-reminder';
import { OutOfStockService } from '@/api/out-of-stock';
import router from '@/utils/router';
import { RouteMap } from '@/config/route';

const appStore = useAppStore();

// 定义组件属性
interface IProps {
  info: CustomerOrderInfo | OrderDetailInfo;
  cardType: CardType;
  fatherType?: number;
  isAll?: boolean;
  managementOpflagForSaler?: boolean;
  managementOpflagForPurchaser?: boolean;
  querySelfFlag?: number;
}

const props = defineProps<IProps>();

const emit = defineEmits<{
  click: [];
  submitSuccess: [];
}>();

// 响应式数据
const showAll = ref(false);

// 锁控类型列表
const conList = ref<string[]>([
  '缺货',
  '区域限销',
  '价格限销',
  '下限锁',
  '两票制提醒',
  '紧俏药品',
  '禁限销',
  '库存状态',
  '近效期',
]);

// 工具方法
const getWY = (amount: number) => {
  if (!amount) return '0';
  return (amount / 10000).toFixed(1);
};

const getStatusStyle = (conType: number, statusFlag: number) => {
  let color = '';

  if (conType === 0 || conType === 4) {
    switch (statusFlag) {
      case 0:
        color = '#ED7B2F';
        break;
      case 1:
        color = '#00A870';
        break;
      case 2:
        color = '#00A870';
        break;
      case 3:
        color = '#2271F5';
        break;
    }
  } else if (conType === 2 || conType === 3 || conType === 5) {
    switch (statusFlag) {
      case 0:
        color = '#ED7B2F';
        break;
      case 1:
        color = '#00A870';
        break;
      case 2:
        color = '#EA394B';
        break;
    }
  } else if (conType === 6) {
    switch (statusFlag) {
      case 0:
        color = '#ED7B2F';
        break;
      case 1:
        color = '#00A870';
        break;
      case 2:
        color = '#2271F5';
        break;
    }
  } else if (conType === 7 || conType === 8) {
    switch (statusFlag) {
      case 0:
        color = '#ED7B2F';
        break;
      case 1:
        color = '#2271F5';
        break;
    }
  }

  return { color: color || '#C8C9CC' };
};

const getStatusText = (conType: number, statusFlag: number, recordid: number) => {
  if (conType !== 7 && conType !== 8 && statusFlag === 0 && !recordid) {
    return '无需审核';
  }
  if (conType === 0 || conType === 4) {
    switch (statusFlag) {
      case 0:
        return '未处理';
      case 1:
        return '已处理';
      case 2:
        return '已到货';
      case 3:
        return '已激活';
    }
  } else if (conType === 2 || conType === 3 || conType === 5) {
    switch (statusFlag) {
      case 0:
        return '未审核';
      case 1:
        return '已通过';
      case 2:
        return '未通过';
    }
  } else if (conType === 6) {
    switch (statusFlag) {
      case 0:
        return '未处理';
      case 1:
        return '已处理';
      case 2:
        return '已激活';
    }
  } else if (conType === 7 || conType === 8) {
    switch (statusFlag) {
      case 0:
        return '未激活';
      case 1:
        return '已激活';
    }
  }
  return '';
};

// 获取滑动操作按钮配置
const getSwipeOptions = computed(() => {
  const options: Array<{ text: string; style: { backgroundColor: string } }> = [];

  // 订阅到货提醒按钮（已订阅显示灰色禁用状态）
  if (props.info.goodsReminder) {
    options.push({
      text: '已订阅\n到货提醒',
      style: { backgroundColor: '#C8C9CC' },
    });
  } else {
    options.push({
      text: '订阅到\n货提醒',
      style: { backgroundColor: '#5EA3EF' },
    });
  }

  // 订阅到票提醒按钮（已订阅显示灰色禁用状态）
  if (props.info.ticketReminder) {
    options.push({
      text: '已订阅\n到票提醒',
      style: { backgroundColor: '#C8C9CC' },
    });
  } else {
    options.push({
      text: '订阅到\n票提醒',
      style: { backgroundColor: '#2271F5' },
    });
  }

  return options;
});

// 处理滑动操作按钮点击
const handleSwipeAction = (event: { index: number; name?: string } | number) => {
  // 从事件对象中提取索引（可能是对象或数字）
  const clickedIndex = typeof event === 'object' ? event.index : event;

  // 根据 options 数组的顺序判断：options[0] 是订阅到货，options[1] 是订阅到票
  if (clickedIndex === 0) {
    // 第一个按钮：订阅到货
    if (!props.info.goodsReminder) {
      subscribeArrive(1);
    }
  } else if (clickedIndex === 1) {
    // 第二个按钮：订阅到票
    if (!props.info.ticketReminder) {
      subscribeArrive(2);
    }
  }
};

// 订阅到货/到票提醒
const subscribeArrive = async (type: number) => {
  await SubscribeReminderService.subscribeArrive({
    entryId: props.info.entryId,
    goodsId: props.info.goodsId,
    subType: type,
  });

  const message = type === 1 ? '订阅到货提醒成功' : '订阅到票提醒成功';
  showSuccess(message);

  // 更新本地数据
  if (type === 1) {
    (props.info as any).goodsReminder = true;
  } else {
    (props.info as any).ticketReminder = true;
  }
};

// 激活锁控
const checkTicket = async (record: LockRecordInfo, forceFlag: number = 0) => {
  // 缺货类型需要特殊处理
  if (record.conType === 0) {
    const checkRes = await OutOfStockService.checkTicket({ taskId: record.taskid });
    showModal({
      content: !checkRes ? '确定激活?' : '该细单品种发票未到，确定激活吗?',
      success: res => {
        if (res.confirm) {
          activeSubmit(record, forceFlag);
        }
      },
    });
  } else if (record.conType === 7 || record.conType === 8) {
    // 库存状态和近效期需要选择批号
    chooseData.value = record;
    batchClick();
  } else {
    // 其他类型直接确认
    showModal({
      content: '确定激活?',
      success: res => {
        if (res.confirm) {
          activeSubmit(record, forceFlag);
        }
      },
    });
  }
};

// 提交激活
const activeSubmit = async (record: LockRecordInfo, forceFlag: number = 0) => {
  const params = {
    conDtlId: record.condtlid,
    conType: record.conType,
    taskId: record.taskid,
    forceFlag: forceFlag,
    message: statusNearRemark.value,
  };
  await OutOfStockService.salerActive(params);
  showSuccess('激活成功');
  record.activate = 1;
  emit('submitSuccess');
};

// 批号相关
const batchShow = ref(false);
const batchList = ref<any[]>([]);
const batchResult = ref<any[]>([]);
const statusNearRemark = ref('');
const chooseData = ref<any>({});

// 点击查看批号
const batchClick = () => {
  getInventoryByLot();
  batchResult.value = [];
  batchShow.value = true;
};

// 获取批号列表
const getInventoryByLot = async () => {
  const res = await OutOfStockService.getInventoryByLot({
    entryId: props.info.entryId,
    goodsId: props.info.goodsId,
  });
  batchList.value = res || [];
};

// 批号选择确认
const batchSure = () => {
  if (!batchResult.value.length) {
    showToast('至少选择一条');
    return;
  }
  statusNearRemark.value = '';
  if (batchResult.value.length) {
    const lotNoList: string[] = [];
    for (let index = 0; index < batchResult.value.length; index++) {
      const element = batchResult.value[index];
      lotNoList.push(batchList.value[element].lotNo);
    }
    statusNearRemark.value = `请开批号【${lotNoList.join(',')}】`;
  }
  batchShow.value = false;
  statusNearActive();
};

// 近效期激活
const statusNearActive = () => {
  showModal({
    content: '是否确认激活？',
    success: res => {
      if (res.confirm) {
        activeSubmit(chooseData.value);
      }
    },
  });
};

// 跳转到详情页面
const toDetailPage = () => {
  const data = {
    id: props.info.condtlId,
    entryId: props.info.entryId,
    entryName: props.info.entryName,
  };

  router.push(RouteMap.orderManageDetail, data);
};

// 跳转到锁控详情
const toLock = (record: LockRecordInfo) => {
  if (record.conType !== 7 && record.conType !== 8 && record.statusFlag === 0 && !record.recordid) {
    return;
  }
  router.push('/subpackages/lock/detail', {
    taskId: record.taskid,
    querySelfFlag: props.querySelfFlag,
    role: 1,
  });
};

// 处理卡片点击
const handleCardClick = () => {
  emit('click');
};
</script>

<template>
  <view :class="cardType != 1 ? 'mb-2 shadow-view' : ''" @click="handleCardClick">
    <view
      class="bg-white p-3 text-xs"
      :class="(cardType == 2 || cardType == 3) && 'border-l-solid border-l-10 border-l-main'"
    >
      <!-- 客户汇总卡片 -->
      <view v-if="+cardType == 0">
        <view class="text-sm mb-2">{{ info.customerId }}/{{ info.customerName }}</view>
        <view class="flex items-center justify-between mb-2">
          <view class="color-gray-4">总订单笔数</view>
          <view class="">{{ info.orderCount }}</view>
        </view>
        <view class="flex items-center justify-between mb-2">
          <view class="color-gray-4">总订单金额（万）</view>
          <view class="color-main">{{ getWY(info.orderAmount) }}</view>
        </view>
        <view class="flex items-center justify-between mb-2">
          <view class="color-gray-4">未完成笔数</view>
          <view class="">{{ info.unFinishedOrderCount }}</view>
        </view>
        <view class="flex items-center justify-between">
          <view class="color-gray-4">未完成金额（万）</view>
          <view class="color-main">{{ getWY(info.unFinishedOrderAmount) }}</view>
        </view>
      </view>

      <!-- 客户详情卡片 -->
      <view v-if="cardType == 1">
        <view class="text-sm mb-2">{{ info.customerId }}/{{ info.customerName }}</view>
        <view class="flex items-center" v-show="fatherType == 2 || (fatherType != 2 && isAll)">
          <text class="color-gray-4 mr-7">总订单笔数</text>
          <text class="">{{ info.orderCount }}</text>
          <text class="color-gray-4 mr-7 ml-auto">总订单金额（万）</text>
          <text class="color-main">{{ getWY(info.orderAmount) }}</text>
        </view>
        <view class="flex items-center" v-show="fatherType != 2 && !isAll">
          <text class="color-gray-4 mr-7">未完成笔数</text>
          <text class="">{{ info.unFinishedOrderCount }}</text>
          <text class="color-gray-4 mr-7 ml-auto">未完成金额（万）</text>
          <text class="color-main">{{ getWY(info.unFinishedOrderAmount) }}</text>
        </view>
      </view>

      <!-- 订单详情卡片 -->
      <view v-if="cardType == 2 || cardType == 3 || cardType == 4" class="pl-1 relative w-full">
        <up-swipe-action>
          <up-swipe-action-item
            :options="getSwipeOptions"
            :disabled="getSwipeOptions.length === 0"
            @click="handleSwipeAction"
          >
            <view @click="toDetailPage">
              <view class="flex items-start text-xs mb-2">
                <text class="color-gray-4 w-20%">核算单元</text>
                <text class="break-words line-height-4 font-500">
                  {{ info.entryId }}/{{ info.entryName }}
                </text>
              </view>
              <view class="flex justify-between text-xs mb-2">
                <view class="color-black-2 max-w-70% break-words flex items-center">
                  <text>{{ info.goodsId }}/{{ info.goodsName }}</text>
                  <app-icon
                    name="order-daohuo"
                    class="ml-2 color-main"
                    v-show="info.goodsReminder"
                  ></app-icon>
                  <app-icon
                    name="order-daopiao"
                    class="color-warning"
                    v-show="info.ticketReminder"
                  ></app-icon>
                </view>
                <view class="color-gray-4">{{ info.credate }}</view>
              </view>
              <view class="flex items-center text-xs mb-2">
                <text class="color-gray-4 w-16.3%">规格</text>
                <text class="color-black-2 font-500 w-51.2%">{{ info.goodsType }}</text>
                <text class="color-gray-4 w-14.6%">合同数量</text>
                <text class="color-black-2 font-500 ml-auto">{{ info.goodsQty }}</text>
              </view>
              <view class="flex items-center text-xs mb-2">
                <text class="color-gray-4 w-16.3%">细单ID</text>
                <text class="color-black-2 font-500 w-51.2%">{{ info.condtlId }}</text>
                <text class="color-gray-4 w-14.6%" v-if="!isAll">采购人</text>
                <app-tag
                  type="primary"
                  class="ml-auto"
                  :fontSize="12"
                  :name="info.supplyerName || '-'"
                  v-if="!isAll"
                />
                <view class="color-gray-4 w-20.6%" v-if="isAll">已分配数量</view>
                <view class="color-black-2 font-500 ml-auto" v-if="isAll">
                  {{ info.accstQty }}
                </view>
              </view>

              <view class="flex items-start text-xs mb-2" v-if="info && info.contactId">
                <text class="color-gray-4 w-20%">分支机构</text>
                <text class="break-words line-height-4">
                  {{ info.contactId }}/{{ info.contactName ? info.contactName : '-' }}
                </text>
              </view>

              <view class="flex items-start text-xs mb-2" v-if="info && info.purchaserId">
                <text class="color-gray-4 w-20%">调拨方采购</text>
                <text class="break-words line-height-4">
                  {{ info.purchaserId }}/{{ info.purchaserId ? info.purchaserName : '-' }}
                </text>
              </view>
              <view class="flex items-start text-xs mb-2" v-if="!isAll">
                <text class="color-gray-4 w-20%">未分配原因</text>
                <text class="color-danger break-words line-height-4">{{
                  info.zxErrormsg ? info.zxErrormsg : '-'
                }}</text>
              </view>
              <view class="flex items-start text-xs mb-2" v-if="isAll">
                <text class="color-gray-4 w-16.3%">采购人</text>
                <app-tag type="primary" :fontSize="12" :name="info.supplyerName || '-'" />
              </view>
              <view class="flex items-center text-xs">
                <text class="color-gray-4 w-20%">总单备注</text>
                <text class="color-black-2 font-500">{{ info.docMemo ? info.docMemo : '-' }}</text>
              </view>
            </view>
          </up-swipe-action-item>
        </up-swipe-action>
        <view class="swipe-left"></view>
      </view>
    </view>

    <!-- 锁控记录 -->
    <view
      v-if="
        (cardType == 2 || cardType == 3 || cardType == 4) &&
        info.wxTaskRecordDocDtoList &&
        info.wxTaskRecordDocDtoList.length > 0
      "
    >
      <view
        class="flex items-center py-2 pl-3 pr-4 mt-1 bg-white"
        @click="toLock(info.wxTaskRecordDocDtoList[0])"
      >
        <text class="text-sm color-black-2">{{
          conList[info.wxTaskRecordDocDtoList[0].conType]
        }}</text>
        <text class="color-gray-4 text-xs ml-2" style="margin-top: 1px">
          {{ info.wxTaskRecordDocDtoList[0].credate }}
        </text>
        <text
          class="text-xs mr-2 ml-auto"
          :style="
            getStatusStyle(
              info.wxTaskRecordDocDtoList[0].conType,
              info.wxTaskRecordDocDtoList[0].conType === 7 ||
                info.wxTaskRecordDocDtoList[0].conType === 8
                ? info.wxTaskRecordDocDtoList[0].activate
                : info.wxTaskRecordDocDtoList[0].statusFlag
            )
          "
        >
          {{
            getStatusText(
              info.wxTaskRecordDocDtoList[0].conType,
              info.wxTaskRecordDocDtoList[0].conType === 7 ||
                info.wxTaskRecordDocDtoList[0].conType === 8
                ? info.wxTaskRecordDocDtoList[0].activate
                : info.wxTaskRecordDocDtoList[0].statusFlag,
              info.wxTaskRecordDocDtoList[0].recordid
            )
          }}
        </text>
        <up-button
          shape="circle"
          type="primary"
          size="small"
          class="w-auto! mx-0"
          v-show="
            (((info.wxTaskRecordDocDtoList[0].conType === 0 ||
              info.wxTaskRecordDocDtoList[0].conType === 4) &&
              info.wxTaskRecordDocDtoList[0].statusFlag != 0) ||
              info.wxTaskRecordDocDtoList[0].conType === 7 ||
              info.wxTaskRecordDocDtoList[0].conType === 8) &&
            info.wxTaskRecordDocDtoList[0].activate != 1 &&
            info.wxTaskRecordDocDtoList[0].recordid &&
            !+info.accstQty &&
            !isAll
          "
          @tap.native.stop="
            checkTicket(
              info.wxTaskRecordDocDtoList[0],
              (info.wxTaskRecordDocDtoList[0].conType === 0 ||
                info.wxTaskRecordDocDtoList[0].conType === 4) &&
                +info.wxTaskRecordDocDtoList[0].statusFlag === 1
                ? 1
                : 0
            )
          "
        >
          {{
            (info.wxTaskRecordDocDtoList[0].conType === 0 ||
              info.wxTaskRecordDocDtoList[0].conType === 4) &&
            +info.wxTaskRecordDocDtoList[0].statusFlag === 1
              ? '强制激活'
              : '激活'
          }}
        </up-button>
        <up-button
          shape="circle"
          type="primary"
          size="small"
          class="w-auto! mx-0"
          v-show="
            (info.wxTaskRecordDocDtoList[0].conType === 0 ||
              info.wxTaskRecordDocDtoList[0].conType === 4 ||
              info.wxTaskRecordDocDtoList[0].conType === 7 ||
              info.wxTaskRecordDocDtoList[0].conType === 8) &&
            info.wxTaskRecordDocDtoList[0].activate == 1
          "
          disabled
        >
          已激活
        </up-button>
      </view>
      <view
        v-if="info.wxTaskRecordDocDtoList.length > 1 && !showAll"
        class="flex justify-center py-2"
        @click="showAll = true"
      >
        <text class="color-gray-4 text-xs">
          点击展开剩余
          <text class="color-main mx-1">{{ info.wxTaskRecordDocDtoList.length - 1 }}</text>
          条锁控记录
        </text>
      </view>
      <view v-if="showAll">
        <view
          v-for="(data, index) in info.wxTaskRecordDocDtoList.slice(
            1,
            info.wxTaskRecordDocDtoList.length
          )"
          :key="index"
          class="flex items-center py-2 pl-3 pr-4 mt-1 bg-white"
          @click="toLock(data)"
        >
          <text class="text-sm color-black-2">{{ conList[data.conType] }}</text>
          <text class="color-gray-4 text-xs ml-2" style="margin-top: 1px">{{ data.credate }}</text>
          <text
            class="text-xs mr-2 ml-auto"
            :style="
              getStatusStyle(
                data.conType,
                data.conType === 7 || data.conType === 8 ? data.activate : data.statusFlag
              )
            "
          >
            {{
              getStatusText(
                data.conType,
                data.conType === 7 || data.conType === 8 ? data.activate : data.statusFlag,
                data.recordid
              )
            }}
          </text>
          <up-button
            shape="circle"
            type="primary"
            size="small"
            class="w-auto! mx-0"
            v-show="
              (((data.conType === 0 || data.conType === 4) && data.statusFlag != 0) ||
                data.conType === 7 ||
                data.conType === 8) &&
              data.activate != 1 &&
              data.recordid &&
              !+info.accstQty
            "
            @tap.native.stop="
              checkTicket(
                data,
                (data.conType === 0 || data.conType === 4) && +data.statusFlag === 1 ? 1 : 0
              )
            "
          >
            {{
              (data.conType === 0 || data.conType === 4) && +data.statusFlag === 1
                ? '强制激活'
                : '激活'
            }}
          </up-button>
          <up-button
            shape="circle"
            type="primary"
            size="small"
            class="w-auto! mx-0"
            v-show="
              (data.conType === 0 ||
                data.conType === 4 ||
                data.conType === 7 ||
                data.conType === 8) &&
              data.activate == 1
            "
            disabled
          >
            已激活
          </up-button>
        </view>
        <view
          v-if="showAll && info.wxTaskRecordDocDtoList.length > 1"
          class="flex justify-center py-2 px-2"
          @click="showAll = false"
        >
          <text class="color-gray-4 text-xs">点击展开收回</text>
        </view>
      </view>
    </view>

    <!-- 批号选择弹窗 -->
    <up-popup :show="batchShow" mode="bottom" :round="16" closeable @close="batchShow = false">
      <view class="h-70vh">
        <view class="text-16 font-bold text-center py-4">查看批号</view>
        <scroll-view class="h-[calc(100%-256rpx)]" scroll-y>
          <app-empty v-if="batchList.length === 0" description="暂无数据" />
          <up-checkbox-group v-model="batchResult">
            <up-cell-group>
              <up-cell v-for="(item, index) in batchList" :key="index" clickable>
                <template #title>
                  <view class="flex flex-col">
                    <view class="text-14 mb-1">
                      <text class="color-gray-4">批号:</text>
                      <text class="ml-1">{{ item.lotNo }}</text>
                    </view>
                    <view class="text-12 color-gray-4">
                      <text>效期:</text>
                      <text class="ml-1">{{ item.invalidDate?.slice(0, 10) || '-' }}</text>
                      <text class="mx-2">|</text>
                      <text>库存:</text>
                      <text class="ml-1">{{ item.goodsQuantity || 0 }}</text>
                      <text class="mx-2">|</text>
                      <text>两票制库存:</text>
                      <text class="ml-1">{{ item.invoiceGoodsNum || 0 }}</text>
                    </view>
                    <view
                      class="text-12 color-gray-4 mt-1"
                      v-if="item.storageName || item.goodsStatus"
                    >
                      <text v-if="item.storageName">保管帐:</text>
                      <text class="ml-1" v-if="item.storageName">{{ item.storageName }}</text>
                      <text class="mx-2" v-if="item.storageName && item.goodsStatus">|</text>
                      <text v-if="item.goodsStatus">状态:</text>
                      <text class="ml-1" v-if="item.goodsStatus">{{ item.goodsStatus }}</text>
                    </view>
                  </view>
                </template>
                <template #right-icon>
                  <up-checkbox :name="index"></up-checkbox>
                </template>
              </up-cell>
            </up-cell-group>
          </up-checkbox-group>
        </scroll-view>
        <app-bottom-actions
          v-if="
            props.querySelfFlag === 1 ||
            props.managementOpflagForSaler ||
            props.managementOpflagForPurchaser
          "
          :fixed="false"
          class="block m-4"
        >
          <app-action-btn class="flex-1" text="取消" @click="batchShow = false" />
          <app-action-btn class="flex-1" text="确定" type="primary" @click="batchSure" />
        </app-bottom-actions>
      </view>
    </up-popup>
  </view>
</template>
