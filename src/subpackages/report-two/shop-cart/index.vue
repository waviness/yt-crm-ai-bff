<template>
  <view>
    <app-watermark> </app-watermark>
    <view class="flex justify-between items-center pa-2">
      <view class="shop-cart-title">购物车</view>
      <view>
        <up-tag type="primary" class="mr-2" @click="queryCart">刷新</up-tag>
        <up-tag type="primary" @click="chooseWms('')">批量选择物流中心</up-tag>
      </view>
    </view>
    <view class="pb-100">
      <!-- 非空数据 -->
      <view v-if="dataList.length > 0">
        <view v-for="(item, index) in dataList" :key="index" class="w-full bg-white mb-2">
          <view>
            <!-- 商品列表头部 -->
            <view class="pa-2 flex items-center">
              <up-checkbox-group>
                <up-checkbox
                  :label="item.customName || ''"
                  @change="() => handleCheckedAll(index, item.crmCartDtlVOS)"
                  :checked="isGroupAllChecked(index, item.crmCartDtlVOS)"
                >
                </up-checkbox>
              </up-checkbox-group>
            </view>
            <view>
              <app-cell
                :required="true"
                title="运输地址"
                @click="chooseContact(item, index)"
                :value="item.addressName || ''"
                :isLink="true"
              >
                <template #right-icon>
                  <up-icon name="arrow-right" size="12" class="text-gray-5" />
                </template>
              </app-cell>
              <app-cell
                :required="true"
                title="物流中心"
                @click="chooseWms(index)"
                :value="item.logistcenterName ? item.logistcenterName : '请选择物流中心'"
                :isLink="true"
              >
                <template #right-icon>
                  <up-icon name="arrow-right" size="12" class="text-gray-5" />
                </template>
              </app-cell>
              <view class="flex items-center" style="padding: 13px 15px; font-size: 14px">
                <view class="color-gray-5">备注</view>
                <view class="flex-1"
                  ><up-input
                    border="none"
                    inputAlign="right"
                    v-model="item.docMemo"
                    placeholder="请输入备注"
                /></view>
              </view>
            </view>
            <!-- 商品列表内容 -->
            <up-checkbox-group class="">
              <view
                class="py-2 w-full shop-report-list"
                v-for="(cartItem, cartIndex) in item.crmCartDtlVOS"
                :key="cartIndex"
              >
                <up-checkbox
                  class="pl-2"
                  :name="cartItem.ccdDocId + '-' + cartItem.ccdDtlId"
                  :checked="
                    chooseResult[index]?.includes(cartItem.ccdDocId + '-' + cartItem.ccdDtlId)
                  "
                  @change="() => handleCheckedLine(index, cartItem, item.crmCartDtlVOS)"
                >
                  <template #label>
                    <shopReportList
                      @change="val => stepperChange(item, cartItem, val)"
                      v-if="+cartType === 1"
                      :item="cartItem"
                    />
                    <shopTwoList
                      @change="val => stepperChange(item, cartItem, val)"
                      v-if="+cartType === 2"
                      :item="cartItem"
                    />
                  </template>
                </up-checkbox>
              </view>
            </up-checkbox-group>
          </view>
        </view>
      </view>
      <!-- 空数据 -->
      <app-empty description="暂无数据" v-else> </app-empty>
    </view>

    <!-- 底部 -->
    <view v-if="dataList.length > 0" class="shop-cart-footer">
      <view class="flex">
        <up-checkbox-group>
          <up-checkbox
            shape="square"
            label="全选"
            :checked="checkedAll"
            @change="checkAllClick"
          ></up-checkbox>
        </up-checkbox-group>
      </view>
      <view class="flex">
        <view class="flex items-center">
          <view class="color-main text-16"> 合计：¥{{ totalPrice.toFixed(2) }} </view>
          <view class="text-red text-16 w-120 mr-2" @click="deleteSubmit">删除</view>
          <up-button type="primary" @click="onSubmit">提交订单</up-button>
        </view>
      </view>
    </view>

    <!-- 物流中心选择弹窗 -->
    <up-popup v-model:show="getWmsShow" mode="bottom">
      <view>
        <view class="pa-2 font-bold text-16">选择物流中心</view>
        <view class="popup-list">
          <app-cell
            v-for="(item, index) in wmsList"
            :key="item.wmscenterucode || item.wmscenteruOpcode || index"
            :title="item.wmscenterucodename"
            @click="chooseWmsItem(item)"
            :isLink="true"
          >
            <template #right-icon>
              <up-icon name="arrow-right" size="12" class="text-gray-5" />
            </template>
          </app-cell>
        </view>
      </view>
    </up-popup>

    <!-- 选择运输地址弹窗 -->
    <app-action-sheet
      v-model:show="getContactShow"
      :actions="contactList"
      description="选择地址"
      @select="chooseContactItem"
    />

    <up-modal
      @confirm="handlePreConfirm"
      @cancel="showModalFlag = false"
      confirm-text="继续下单"
      showConfirmButton
      showCancelButton
      :show="showModalFlag"
      title="提示"
    >
      <view class="slot-content">
        <view v-if="+cartType === 1">
          <view
            v-if="+entryChoose.entryid === 5 || +entryChoose.entryid === 38"
            class="lock-info-title"
            >电商：</view
          >
          <view>
            <app-infor-item
              title="库存下限："
              :contentClass="lockInfo.inventoryLowLimitFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.inventoryLowLimitFlag ? '无限制' : lockInfo.inventoryLowLimit"
            ></app-infor-item>
            <app-infor-item
              title="品种销量控制："
              :contentClass="lockInfo.kindControlFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.kindControlFlag ? '无限制' : lockInfo.kindControl"
            ></app-infor-item>
            <app-infor-item
              title="库存信息："
              :contentClass="lockInfo.goodsqtyInfoFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.goodsqtyInfoFlag ? '无限制' : lockInfo.goodsqtyInfo"
            ></app-infor-item>
            <app-infor-item
              title="近效期："
              :contentClass="lockInfo.nearlyEffectiveFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.nearlyEffectiveFlag ? '无限制' : lockInfo.nearlyEffective"
            ></app-infor-item>
            <app-infor-item
              title="价格限销："
              :contentClass="lockInfo.priceLimitFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.priceLimitFlag ? '无限制' : lockInfo.priceLimit"
            ></app-infor-item>
            <app-infor-item
              title="禁销限销："
              :contentClass="lockInfo.canNotSellFlag ? 'color-success' : 'color-red'"
              :content="lockInfo.canNotSellFlag ? '无限制' : lockInfo.canNotSellInfo"
            ></app-infor-item>
          </view>

          <!-- 药业部分 -->
          <view
            v-if="(+entryChoose.entryid === 5 || +entryChoose.entryid === 38) && yyLockControlInfo"
          >
            <view>
              <view>药业：</view>
              <view class="lock-info-container">
                <app-infor-item
                  title="库存下限："
                  :contentClass="
                    yyLockControlInfo.inventoryLowLimitFlag ? 'color-success' : 'color-red'
                  "
                  :content="
                    yyLockControlInfo.inventoryLowLimitFlag
                      ? '无限制'
                      : yyLockControlInfo.inventoryLowLimit
                  "
                ></app-infor-item>
                <app-infor-item
                  title="品种销量控制："
                  :contentClass="yyLockControlInfo.kindControlFlag ? 'color-success' : 'color-red'"
                  :content="
                    yyLockControlInfo.kindControlFlag ? '无限制' : yyLockControlInfo.kindControl
                  "
                ></app-infor-item>
                <app-infor-item
                  title="库存信息："
                  :contentClass="yyLockControlInfo.goodsqtyInfoFlag ? 'color-success' : 'color-red'"
                  :content="
                    yyLockControlInfo.goodsqtyInfoFlag ? '无限制' : yyLockControlInfo.goodsqtyInfo
                  "
                ></app-infor-item>
                <app-infor-item
                  title="近效期："
                  :contentClass="
                    yyLockControlInfo.nearlyEffectiveFlag ? 'color-success' : 'color-red'
                  "
                  :content="
                    yyLockControlInfo.nearlyEffectiveFlag
                      ? '无限制'
                      : yyLockControlInfo.nearlyEffective
                  "
                ></app-infor-item>
                <app-infor-item
                  title="价格限销："
                  :contentClass="yyLockControlInfo.priceLimitFlag ? 'color-success' : 'color-red'"
                  :content="
                    yyLockControlInfo.priceLimitFlag ? '无限制' : yyLockControlInfo.priceLimit
                  "
                ></app-infor-item>
                <app-infor-item
                  title="禁销限销："
                  :contentClass="yyLockControlInfo.canNotSellFlag ? 'color-success' : 'color-red'"
                  :content="
                    yyLockControlInfo.canNotSellFlag ? '无限制' : yyLockControlInfo.canNotSellInfo
                  "
                ></app-infor-item>
              </view>
            </view>
          </view>
        </view>
        <view v-else>
          <view v-for="(lock, idx) in lockInfoList" :key="idx" class="mb-2">
            <view class="lock-info-title">{{ lock.title }}：</view>
            <view>
              <app-infor-item
                title="库存下限："
                :contentClass="lock.data.inventoryLowLimitFlag ? 'color-success' : 'color-red'"
                :content="lock.data.inventoryLowLimitFlag ? '无限制' : lock.data.inventoryLowLimit"
              ></app-infor-item>
              <app-infor-item
                title="品种销量控制："
                :contentClass="lock.data.kindControlFlag ? 'color-success' : 'color-red'"
                :content="lock.data.kindControlFlag ? '无限制' : lock.data.kindControl"
              ></app-infor-item>
              <app-infor-item
                title="库存信息："
                :contentClass="lock.data.goodsqtyInfoFlag ? 'color-success' : 'color-red'"
                :content="lock.data.goodsqtyInfoFlag ? '无限制' : lock.data.goodsqtyInfo"
              ></app-infor-item>
              <app-infor-item
                title="近效期："
                :contentClass="lock.data.nearlyEffectiveFlag ? 'color-success' : 'color-red'"
                :content="lock.data.nearlyEffectiveFlag ? '无限制' : lock.data.nearlyEffective"
              ></app-infor-item>
              <app-infor-item
                title="价格限销："
                :contentClass="lock.data.priceLimitFlag ? 'color-success' : 'color-red'"
                :content="lock.data.priceLimitFlag ? '无限制' : lock.data.priceLimit"
              ></app-infor-item>
              <app-infor-item
                title="禁销限销："
                :contentClass="lock.data.canNotSellFlag ? 'color-success' : 'color-red'"
                :content="lock.data.canNotSellFlag ? '无限制' : lock.data.canNotSellInfo"
              ></app-infor-item>
            </view>
          </view>
        </view>
      </view>
    </up-modal>
  </view>
</template>

<script setup lang="ts">
import { useShopCart } from '../composables/use-shop-cart';
import shopReportList from '../components/base/shop-report-list.vue';
import shopTwoList from '../components/base/shop-two-list.vue';
// 使用购物车组合式函数
const {
  dataList,
  chooseResult,
  checkedAll,
  totalPrice,
  getWmsShow,
  wmsList,
  contactList,
  getContactShow,
  cartType,
  showModalFlag,
  lockInfo,
  yyLockControlInfo,
  entryChoose,
  lockInfoList,
  getWmsCenter,
  queryCart,
  chooseChange,
  handleCheckedAll,
  handleCheckedLine,
  deleteSubmit,
  onSubmit,
  stepperChange,
  chooseWms,
  chooseWmsItem,
  chooseContact,
  chooseContactItem,
  checkAllClick,
  isGroupAllChecked,
  handlePreConfirm,
} = useShopCart();

// const reportTwoStore = useReportTwoStore();
// const customParams = computed(() => reportTwoStore.customParams);
// const entryChoose = computed(() => reportTwoStore.entryChoose);
// const dataList: any = ref([]);
// const chooseResult: any = ref([]);
// const checkedAll = ref(false);
// const totalPrice = ref(0);
// const _queryCart = async (cartType: number) => {
//   dataList.value = [];
//   const params = {
//     entryId: entryChoose.value.entryid,
//     cartType: cartType,
//   };
//   ReportService.queryCartSaler(params).then(res => {
//     if (res.code === '200') {
//       dataList.value = res.data.map((val: any) => {
//         return {
//           ...val,
//           docMemo: '',
//         };
//       });
//       chooseResult.value = [];
//       checkedAll.value = false;
//     }
//   });
// };
// const chooseChange = () => {
//   const getParamsR = getParams(false);
//   totalPrice.value = 0;
//   for (let index = 0; index < getParamsR.length; index++) {
//     const element = getParamsR[index];
//     element.crmCartDtlVOS.map((val: any) => {
//       totalPrice.value += +((val.goodsQty * +val.price * 1000000) / 10000).toFixed(2);
//     });
//   }
// };

// // 获取预校验，下单以及删除选择参数
// const getParams = (needChange: boolean = true) => {
//   if (needChange && chooseResult.value.length === 0) {
//     showError('请选择要操作的数据');
//     return false;
//   }
//   for (let i = 0; i < dataList.value.length; i++) {
//     const element = dataList.value[i];
//     element.crmCartDtlVOS.map((val: any) => {
//       val.isCheck = false;
//     });
//   }
//   for (let index = 0; index < chooseResult.value.length; index++) {
//     const element = chooseResult.value[index];
//     if (element) {
//       element.map((item: any) => {
//         const arr = item.split('-');
//         if (arr.indexOf('all') !== -1) {
//           for (let i = 0; i < dataList.value[index].crmCartDtlVOS.length; i++) {
//             const element = dataList.value[index].crmCartDtlVOS[i];
//             element.isCheck = true;
//           }
//         } else {
//           for (let i = 0; i < dataList.value[index].crmCartDtlVOS.length; i++) {
//             const element = dataList.value[index].crmCartDtlVOS[i];
//             console.log(element);
//             console.log(arr);
//             console.log(+element.ccdDtlId === +arr[1]);
//             if (+element.ccdDtlId === +arr[1]) element.isCheck = true;
//           }
//         }
//       });
//     }
//   }
//   const params: any = JSON.parse(JSON.stringify(dataList.value));
//   const needParams: any = [];
//   params.map((val: any) => {
//     const crmCartDtlVOS = val.crmCartDtlVOS.reduce(
//       (pre: any, item: any) => (item.isCheck ? [...pre, item] : pre),
//       []
//     );
//     val.crmCartDtlVOS = crmCartDtlVOS;
//     if (crmCartDtlVOS.length > 0) {
//       needParams.push({ ...val, cartType: 2 });
//     }
//   });
//   return needParams;
// };

onLoad((options: any) => {
  cartType.value = options.cartType;
  queryCart();
  getWmsCenter();
});
</script>

<style lang="scss" scoped>
:deep(.u-checkbox__label-wrap) {
  width: calc(100% - 36rpx);
}

.shop-cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background-color: #fff;
  border-top: 1rpx solid #e5e5e5;
}
</style>
