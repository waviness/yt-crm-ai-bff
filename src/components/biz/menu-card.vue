<script setup lang="ts">
import { isH5 } from '@/utils/env';

// 临时路径映射配置
const PATH_MAPPING = {
  // 项目管理相关路径
  '/projectManage': '/subpackages/project/entry',
  '/keyProjectsIndex': '/subpackages/business/key-projects/index',
  '/keyProjectsFollow': '/subpackages/business/key-projects/follow',

  // 订单管理相关路径
  '/firstAidOrder': '/subpackages/order/first-aid/index',
  '/orderManage': '/subpackages/order/order-manage/index',

  // 证照延期相关路径
  '/licenseExtensionIndex': '/subpackages/compliance/license/index',
  '/licenseExtensionApprove': '/subpackages/compliance/license/approve',
  '/subscribeReminder': '/subpackages/compliance/subscribe-reminder/index',
  '/qualityReview': '/subpackages/compliance/quality-review/index',
  '/qualityRecallManagement': '/subpackages/compliance/quality-recall/index',

  // 业务管理相关路径
  '/funding': '/subpackages/business/funding/index',
  '/fundingReport': '/subpackages/business/funding/report',
  '/receivableManage': '/subpackages/business/receivable/index',
  '/contractFind': '/subpackages/business/contract-find/index',

  // VBP相关路径
  '/vbpPolicy': '/subpackages/vbp/policy/index',
  '/vbpProject': '/subpackages/vbp/project/index',

  // 任务督办相关路径
  '/task/sendlist': '/subpackages/daily/task/send',
  '/task/supervision': '/subpackages/daily/task/supervision',

  // 冲差管理相关路径
  '/impulseDifferenceManage': '/subpackages/order/impulse-difference-manage/index',

  // 回款数据相关路径
  '/fundingData': '/subpackages/business/funding/report',
  '/fundingSystem': '/subpackages/business/funding/index',

  // 客户人员相关路径
  '/customerUnit': '/subpackages/customer/unit/index',
  '/customerUnitDetail': '/subpackages/customer/unit/detail',
  '/customerUnitPerson': '/subpackages/customer/unit/person',
  '/customerPersonAdd': '/subpackages/customer/unit/person-add',
  '/customerShare': '/subpackages/customer/unit/share',
  '/customerAddShare': '/subpackages/customer/unit/share-add',
  '/customerTransfer': '/subpackages/customer/unit/transfer',
  '/customerFollow': '/subpackages/customer/follow/index',
  '/customerFollowDetail': '/subpackages/customer/follow/detail',
  '/customerFollowAdd': '/subpackages/customer/follow/add',

  // 客情分析相关路径
  '/customerAnalysis': '/subpackages/customer/analysis/index',
  '/weekly': '/subpackages/daily/weekly/index',
  '/topic': '/subpackages/daily/topic/index',

  // 询证函相关路径
  '/inquiryLetterAssistant': '/subpackages/business/confirmation-letter/index', // 询证函助手
  '/inquiryAbnormalDeal': '/subpackages/business/confirmation-letter/abnormal', // 询证函异常
  // 末次结款
  '/finalKnot': '/subpackages/business/final-knot/index',

  // 收款认领
  '/collectionClaim': '/subpackages/business/collection-claim/index',
  // 库存查询
  '/inventoryQuery': '/subpackages/daily/inventory-query/index',

  // 生日提醒
  '/birthdayReminder': '/subpackages/daily/birthday-reminder/index',

  // 日程安排
  '/schedule': '/subpackages/daily/schedule/index',

  // 二销目录
  '/twoPinDic': '/subpackages/report-two/two-pin/index',
  // 报货单
  '/report': '/subpackages/report-two/report/index',

  // 集采勾标
  '/varietyFollow': '/subpackages/daily/variety-follow/index',

  // 微信锁控
  '/wxLock': '/subpackages/daily/wx-lock/index',

  // 高值相关路径
  '/hightValueInfo': '/subpackages/business/high-value/info/index',
  '/hightValueProcure': '/subpackages/business/high-value/info/index',
  '/hightValue': '/subpackages/business/high-value/goods/index',

  // 数字医贸相关路径
  '/medicalProjectManage': '/subpackages/medical-trade/project-search/index',
  '/medicalCustomerPersonDetail': '/subpackages/medical-trade/customer-person/detail',
  '/medicalCustomerUnitPerson': '/subpackages/medical-trade/customer-person/index',
  '/medicalVisitRecord': '/subpackages/medical-trade/visit-record/index',
  '/medicalCustomerFollow': '/subpackages/medical-trade/customer-follow/index',

  // 销退点单相关路径
  '/salesReturnOrder': '/subpackages/business/sales-return-order/index',
  '/salesReturnOrderDetail': '/subpackages/business/sales-return-order/detail',

  // 物流二销相关路径
  '/wmsTwoPinDic': '/subpackages/business/wms-two-pin-dic/index',

  // 多仓销退相关路径
  '/refundApprove': '/subpackages/business/refund-approve/index',
  '/refundApproveDetail': '/subpackages/business/refund-approve/detail',

  // 客户下单审核
  '/customerOrderApprove': '/subpackages/order/customer-order-approve/index',
  '/customerOrderApproveDetail': '/subpackages/order/customer-order-approve/detail',
};

// 定义精确的类型接口
interface MenuItem {
  path: string;
  icon: string;
  pmsName: string;
  ingShowFlag?: boolean;
  ing?: string | number;
}

interface IProps {
  ywObj: {
    isMoreShow: boolean;
    arr: MenuItem[];
    title: [string, string];
  };
}

const props = defineProps<IProps>();

// 使用computed确保showMenu随ywObj变化自动更新
const showMenu = computed<MenuItem[]>(() => {
  if (props.ywObj.isMoreShow) {
    return props.ywObj.arr.slice(0, 7); // 收起状态显示前7项
  } else {
    return props.ywObj.arr; // 展开状态显示所有项
  }
});

// 通过emit通知父组件更新状态（遵循单向数据流）
const emit = defineEmits<{
  (e: 'update:isMoreShow', value: boolean): void;
}>();

// 处理更多/收起点击
const moreClick = () => {
  emit('update:isMoreShow', !props.ywObj.isMoreShow);
};

// 路由跳转封装
const toLink = (path: string) => {
  if (path) {
    const rewrittenPath = rewritePath(path);
    uni.navigateTo({ url: rewrittenPath });
  }
};

const rewritePath = (oldPath: string) => {
  return (PATH_MAPPING as any)[oldPath] || oldPath;
};
</script>

<template>
  <view class="menu mb-2" v-if="showMenu.length">
    <view class="menu-header color-gray-5 px-3">
      <span class="text-14">{{ ywObj.title[0] }}</span>
      <span class="text-10 pl-2">{{ ywObj.title[1] }}</span>
    </view>
    <view class="bg-white menu-block">
      <view class="flex flex-wrap text-center">
        <view
          class="text-25 my-10 menu-block__item"
          v-for="(yw, index) in showMenu"
          :key="'yw' + index"
          @click="toLink(yw.path)"
        >
          <up-badge
            v-if="yw.ingShowFlag && yw.ing !== undefined && +yw.ing"
            :content="+yw.ing"
            max="99"
          >
            <app-icon :name="yw.icon.split('-').slice(1).join('-')" multi />
            <view class="text-12">{{ yw.pmsName }}</view>
          </up-badge>
          <view v-else>
            <app-icon :name="yw.icon.split('-').slice(1).join('-')" multi />
            <view class="text-12">{{ yw.pmsName }}</view>
          </view>
        </view>
        <view class="text-25 my-10 menu-block__item" v-if="ywObj.isMoreShow" @click="moreClick()">
          <view>
            <app-icon :name="'gengduo'" multi />
            <view class="text-12">更多</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.menu {
  &-header {
    width: fit-content;
    height: 64rpx;
    line-height: 64rpx;
    background: #ecf2fe;
    border-radius: 20rpx 20rpx 0 0;
  }

  &-block {
    border-radius: 0 10rpx 10rpx;

    &__item {
      width: 25%;
      box-sizing: border-box;
    }
  }
}

/* 整个容器使用 Grid 布局，每行 4 个 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

/* draggable 默认会生成一个 <div>，我们让它不占位 */
.draggable-wrapper {
  grid-column: span 4; /* 占满 4 列 */
  display: contents; /* 关键：让 draggable 的子元素直接参与 grid 布局 */
}

.grid-item {
  cursor: move;
  text-align: center;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>
