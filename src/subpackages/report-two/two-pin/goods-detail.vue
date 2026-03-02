<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <view class="flex justify-center items-center bg-white h-320">
      <!-- #ifdef H5 -->
      <up-image
        height="144"
        :src="
          goodsDetail.bigimglink &&
          goodsDetail.bigimglink !==
            'http://pic.drugoogle.com/medicine/260x190/2010070114525558283.jpg'
            ? goodsDetail.bigimglink
            : ''
        "
      />
      <!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <up-image height="144" src="/static/images/no-image.png" />
      <!-- #endif -->
    </view>
    <view class="pa-2">
      <view class="bg-white pa-2">
        <view class="flex items-center">
          <up-tag
            borderColor="transparent"
            :text="goodsDetail.nearlyEffectiveFlag ? '近效期' : '待处理'"
            :type="goodsDetail.nearlyEffectiveFlag ? 'warning' : 'error'"
            plain
            plainFill
          ></up-tag>
          <view class="pl-1">{{ goodsDetail.goodsId }}/{{ goodsDetail.goodsName }}</view>
        </view>
        <app-infor-item
          class="pt-1"
          title="规格："
          :content="goodsDetail.goodstype + '/' + goodsDetail.goodsunit"
        ></app-infor-item>
        <app-infor-item
          title="包装大小："
          class="pt-1"
          v-if="logList && logList.length > 0 && logList[0]?.packsizeList?.length > 0"
          contentClass="color-main"
          :content="logList.length > 0 ? logList[0].packsizeList[0] : ''"
        ></app-infor-item>
        <app-infor-item
          class="pt-1"
          title="厂家："
          :content="goodsDetail.factoryname"
        ></app-infor-item>
        <app-infor-item
          v-if="customParams.customid && +type === 2"
          class="pt-1"
          title="客户信息："
          :content="customParams.customid + '/' + customParams.customname"
        ></app-infor-item>
        <app-infor-item
          v-if="customParams.CONTACTID && +type === 2"
          class="pt-1"
          title="分支机构："
          :content="customParams.CONTACTID + '/' + customParams.CONTACTMAN"
        ></app-infor-item>
        <app-infor-item
          v-if="goodsDetail.ADDRESS && +type === 2"
          class="pt-1"
          title="运输地址："
          contentClass="color-main"
          :content="goodsDetail.ADDRESS"
        ></app-infor-item>
        <app-infor-item
          v-if="+type === 2 && goodsDetail.price && goodsDetail.price > 0"
          class="flex-1"
          title="单价："
          :content="`￥${goodsDetail.price}`"
        ></app-infor-item>
      </view>
      <up-collapse
        v-if="logList && logList.length > 0"
        bg-white
        :border="false"
        :value="activeNames"
      >
        <up-collapse-item title="批号信息" name="1">
          <up-checkbox-group class="mb-2" @change="checkAllChange" v-model="checkedAllList">
            <up-checkbox name="全选" :label="checkedAll ? '取消全选' : '全选'"> </up-checkbox>
          </up-checkbox-group>
          <up-checkbox-group v-model="lotCheckList" ref="checkboxGroup" @change="logChange">
            <up-checkbox :name="item.lotno" v-for="(item, index) in logList" :key="index">
              <template #label>
                <view class="w-full flex items-center">
                  <view class="pos-relative">
                    <u-image
                      class="pl-2"
                      width="110"
                      height="100"
                      :src="
                        item.smallimglink &&
                        item.smallimglink !=
                          '`http://pic.drugoogle.com/medicine/75x66/2010070114525558283.jpg`'
                          ? item.smallimglink
                          : ''
                      "
                    />
                    <view
                      v-show="item.goodsStatusId"
                      class="pos-absolute label text-12"
                      :class="item.goodsStatusId === 3 ? 'status' : 'deal'"
                    >
                      {{ item.goodsStatus }}
                    </view>
                  </view>
                  <view class="text-12 pl-2">
                    <app-infor-item title="批号：" :content="item.lotno"></app-infor-item>
                    <app-infor-item
                      title="可销库存："
                      :content="item.mindtlgoodsqty"
                    ></app-infor-item>
                    <app-infor-item
                      title="效期："
                      :content="`${item.invalidDate.substring(0, 10)}(${item.diffDay}天)`"
                    ></app-infor-item>

                    <view class="flex justify-end">
                      <up-number-box
                        buttonSize="24"
                        v-model="item.twoPinNumber"
                        @change="handleChange"
                        :max="item.twoPinNumberMax"
                        :min="0"
                        :step="1"
                        :show-value="false"
                      />
                    </view>
                    <view class="flex justify-end pt-1">
                      <up-button
                        @click.stop="regularCustomDetailClick(1, item)"
                        round
                        size="small"
                        class="mr-2"
                        type="info"
                        >仓管员反馈信息</up-button
                      >
                      <up-button
                        @click.stop="regularCustomDetailClick(2, item)"
                        class="ml-1"
                        round
                        size="small"
                        type="info"
                        >常销客户</up-button
                      >
                    </view>
                  </view>
                </view>
              </template>
            </up-checkbox>
          </up-checkbox-group>
        </up-collapse-item>
      </up-collapse>
    </view>
    <up-form>
      <app-form-item
        v-if="+type === 1"
        :borderBottom="false"
        class="bg-white border-bottom"
        label="价格"
      >
        <up-input
          inputAlign="right"
          placeholder="请输入报货单价格"
          v-model="twoPinPrice"
          border="none"
        ></up-input>
      </app-form-item>
      <view v-if="+type === 1">
        <app-cell
          title="客户信息"
          border
          :value="customParams.customname ? customParams.customname : '点击选择单位信息'"
          @click="customShow = true"
        >
          <template #right-icon>
            <up-icon name="arrow-right" size="12" class="text-gray-5" />
          </template>
        </app-cell>
        <app-cell
          v-if="customParams.CONTACTID"
          title="分支机构："
          border
          :value="customParams.CONTACTID + '/' + customParams.CONTACTMAN"
        ></app-cell>
        <app-cell
          title="运输地址信息"
          border
          :value="chooseAddress.ADDRESS ? chooseAddress.ADDRESS : '点击选择运输地址'"
          @click="cellClickAddress"
        >
          <template #right-icon>
            <up-icon name="arrow-right" size="12" class="text-gray-5" />
          </template>
        </app-cell>
      </view>
      <app-form-item :borderBottom="false" class="bg-white border-bottom" label="备注">
        <up-input border="none" inputAlign="right" v-model="twoPinMemo" placeholder="请输入备注" />
      </app-form-item>
    </up-form>
    <view class="add-cart-btn flex justify-between items-center pa-2 bg-white mt-2">
      <view>
        总数：
        <text class="color-main">{{ allTwoPinNumber }}</text>
      </view>
      <view class="pl-2">
        合计：
        <text class="color-main text-16">
          {{ +((allTwoPinNumber * +twoPinPrice * 1000000) / 1000000).toFixed(2).toString() }}
          元</text
        >
      </view>
      <up-button
        class="mr-4"
        size="large"
        @click="addCartClick"
        shape="circle"
        type="primary"
        color="#2271F5"
        style="width: 160px"
      >
        加入购物车
      </up-button>
    </view>
    <!-- 客户选择弹窗 -->
    <up-popup
      class="van-popup-bg"
      :customStyle="{ height: '90vh' }"
      v-model:show="customShow"
      shape="circle"
      mode="bottom"
      :safe-area-inset-bottom="true"
    >
      <view class="text-16 py-2 font-bold text-center">单位信息</view>
      <biz-custom-list @cell-click="chooseCustomClick" :entryid="entryChoose.entryid + ''" />
    </up-popup>
    <!-- 选择运输地址弹窗 -->
    <app-action-sheet
      v-model:show="addressShow"
      :actions="addressList"
      description="选择地址"
      @select="handleSelectAddress"
    />
    <up-popup
      :show="regularCustomDetailVisible"
      mode="bottom"
      :round="16"
      :customStyle="{ height: '90vh' }"
      @close="regularCustomDetailVisible = false"
    >
      <regular-custom-detail
        v-if="regularCustomDetailVisible"
        :titleString="titleString"
        :detailInfor="customDetailInfor"
      />
    </up-popup>
    <shop-card-btn cardType="2" />
  </view>
</template>

<script lang="ts" setup>
import shopCardBtn from '../components/base/shop-card-btn.vue';
import regularCustomDetail from '../components/business/regular-custom-detail.vue';

import { useTwoPinGoodsDetail } from '../composables/use-two-pin-goods-detail';
// 使用composable
const {
  chooseAddress,
  addressList,
  addressShow,
  allTwoPinNumber,
  twoPinPrice,
  logList,
  activeNames,
  checkedAll,
  checkedAllList,
  lotCheckList,
  twoPinMemo,
  customShow,
  type,
  goodsDetail,
  entryChoose,
  customParams,
  regularCustomDetailVisible,
  titleString,
  customDetailInfor,
  regularCustomDetailClick,
  handleSelectAddress,
  cellClickAddress,
  checkAllChange,
  logChange,
  addCartClick,
  handleChange,
  chooseCustomClick,
  initData,
} = useTwoPinGoodsDetail();

onLoad(options => {
  initData(options);
});
</script>

<style lang="scss" scoped>
.border-bottom {
  border-bottom: 1px solid rgb(214 215 217 / 50%);
}

.add-cart-btn {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #fff;
}

.label {
  width: 100px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  top: 50%;
  left: 50%;
  margin: -12px 0 0 -50px;
  color: white;
}

.deal {
  background: #ea394b;
  border-radius: 2px;
  border: 1px solid #ea394b;
}

.status {
  background: #ed7b2f;
  border-radius: 2px;
  border: 1px solid #ed7b2f;
}
</style>
