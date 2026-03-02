<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>

    <view class="flex justify-center items-center bg-white h-320 mb-2">
      <!-- #ifdef H5 -->
      <up-image
        height="144"
        :src="
          goodsDtlObj.bigimglink &&
          goodsDtlObj.bigimglink !==
            'http://pic.drugoogle.com/medicine/260x190/2010070114525558283.jpg'
            ? goodsDtlObj.bigimglink
            : ''
        "
      /><!-- #endif -->
      <!-- #ifdef MP-WEIXIN -->
      <up-image height="144" src="/static/images/no-image.png" />
      <!-- #endif -->
    </view>
    <view class="bg-white">
      <app-cell
        :titleValue="'w-130'"
        title="药品名称"
        border
        :value="`${goodsDtlObj.goodsId}/${goodsDtlObj.goodsName}`"
      ></app-cell>
      <app-cell
        title="采购员"
        border
        :valueClass="'color-main'"
        :value="`${goodsDtlObj.supplyerid}/${goodsDtlObj.supplyername}`"
      >
      </app-cell>
      <app-cell title="规格" border :value="`${goodsDtlObj.goodstype}/${goodsDtlObj.goodsunit}`">
      </app-cell>
      <app-cell title="包装大小" border :value="`${goodsDtlObj.packsizeList}`"> </app-cell>
      <app-cell title="厂家" border :value="`${goodsDtlObj.factoryid}/${goodsDtlObj.factoryname}`">
      </app-cell>
      <app-cell title="客户" border :value="`${customParams.customid}/${customParams.customname}`">
      </app-cell>
      <app-cell
        v-if="customParams.CONTACTID"
        title="分支机构"
        border
        :value="`${customParams.CONTACTID}/${customParams.CONTACTMAN}`"
      >
      </app-cell>
      <app-cell title="运输地址" border :value="`${goodsDetail.ADDRESSID}/${goodsDetail.ADDRESS}`">
      </app-cell>

      <view class="text-14" style="padding: 0 15px">
        <view class="border-bottom flex" style="padding: 13px 0">
          <view class="w-120">库存下限</view>
          <view class="flex-1 flex justify-end items-center">
            <view>
              <view v-if="goodsDetail.limitQty === null" class="color-success">
                {{
                  +goodsDetail.entryId === 5 || +goodsDetail.entryId === 38 ? '电商' : ''
                }}当前货品无库存下限
              </view>
              <view v-else-if="goodsDetail.bgzQty <= goodsDetail.limitQty" class="color-red">
                {{
                  +goodsDetail.entryId === 5 || +goodsDetail.entryId === 38 ? '电商' : ''
                }}保管账库存低于库存下限
              </view>
              <view v-else>
                {{
                  +goodsDetail.entryId === 5 || +goodsDetail.entryId === 38 ? '电商' : ''
                }}库存下限：{{ goodsDetail.limitQty }}(保管账库存：{{ goodsDetail.bgzQty }})
              </view>
              <view v-if="+goodsDetail.entryId === 5 || +goodsDetail.entryId === 38">
                <view v-if="goodsDetail.limitQtyOfYy === null" class="color-success"
                  >药业当前货品无库存下限</view
                >
                <view
                  v-else-if="goodsDetail.yyBgzQty <= goodsDetail.limitQtyOfYy"
                  class="color-red"
                >
                  药业保管账库存低于库存下限
                </view>
                <view v-else class="">
                  药业库存下限：{{ goodsDetail.limitQtyOfYy }}(保管账库存：{{
                    goodsDetail.yyBgzQty
                  }})
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view class="text-14" style="padding: 0 15px">
        <view class="border-bottom flex" style="padding: 13px 0">
          <view class="w-180">品种销量控制</view>
          <view class="flex-1 flex justify-end items-center">
            <view>
              <view v-if="String(goodsDtlObj.maxCanSellQty) === 'null'" class="color-success">
                {{
                  +goodsDtlObj.entryId === 5 || +goodsDtlObj.entryId === 38 ? '电商' : ''
                }}当前客户当前货品无销量限制
              </view>
              <view v-else-if="goodsDtlObj.maxCanSellQty > 0">
                {{
                  +goodsDtlObj.entryId === 5 || +goodsDtlObj.entryId === 38 ? '电商' : ''
                }}当前客户当前货品可销{{ goodsDtlObj.maxCanSellQty }}
              </view>
              <view v-else class="color-red" @click="targetGoodShow(1)">
                {{
                  +goodsDtlObj.entryId === 5 || +goodsDtlObj.entryId === 38 ? '电商' : ''
                }}当前客户当前货品已超销量限制
                <view class="click-for-detail">（点击查看）</view>
              </view>
              <view v-if="+goodsDtlObj.entryId === 5 || +goodsDtlObj.entryId === 38">
                <view v-if="String(goodsDtlObj.yyMaxCanSellQty) === 'null'" class="color-success">
                  药业当前客户当前货品无销量限制
                </view>
                <view v-else-if="goodsDtlObj.yyMaxCanSellQty > 0" class="">
                  药业当前客户当前货品可销{{ goodsDtlObj.yyMaxCanSellQty }}
                </view>
                <view v-else class="color-red" @click="targetGoodShow(2)">
                  药业当前客户当前货品已超销量限制
                  <view class="text-12">（点击查看）</view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <app-cell
        title="批号信息"
        border
        valueClass="color-gray-6"
        @click="showLot"
        value="点击查看批号信息"
      >
      </app-cell>
      <app-cell
        title="最小销售数量"
        border
        :valueClass="
          goodsDtlObj.salesqtycontrol === 1
            ? 'color-red'
            : goodsDtlObj.salesqtycontrol === 2
              ? 'color-success'
              : '--'
        "
        :value="`${goodsDtlObj.leastsaleqty}（${goodsDtlObj.salesqtycontrol === 1 ? '严控' : goodsDtlObj.salesqtycontrol === 2 ? '非严控' : '--'}）`"
      >
      </app-cell>
      <up-form>
        <app-form-item label="报货数量">
          <up-input
            inputAlign="right"
            placeholder="请输入报货数量"
            v-model="reportNumber"
            border="none"
          ></up-input>
        </app-form-item>
        <view class="flex two-row mx-4 border-bottom">
          <app-cell
            class="flex-1"
            title="上次销价"
            :borderBottom="false"
            :value="goodsDtlObj.lastSellPrice || '--' + '元'"
          ></app-cell>
          <app-cell
            class="flex-1"
            title="上次销售数量"
            :borderBottom="false"
            :value="goodsDtlObj.lastSellQty || '--' + '元'"
          ></app-cell>
        </view>
        <app-cell title="上次销售时间" border :value="goodsDtlObj.lastSellDate || '--'"></app-cell>

        <app-form-item label="报货单价格">
          <up-input
            inputAlign="right"
            placeholder="请输入报货单价格"
            v-model="reportPrice"
            border="none"
          ></up-input>
        </app-form-item>
        <app-form-item label="细单备注">
          <up-input
            inputAlign="right"
            placeholder="请输入细单备注"
            v-model="reportRemark"
            border="none"
          ></up-input>
        </app-form-item>
      </up-form>
    </view>
    <view class="add-cart-btn flex justify-between items-center pa-2 bg-white mt-2">
      <span>
        合计：
        <span class="color-main">{{ totalPrice }} 元</span>
      </span>
      <up-button
        class="mr-4"
        size="large"
        @click="_addCart"
        shape="circle"
        type="primary"
        color="#2271F5"
        style="width: 160px"
      >
        加入购物车
      </up-button>
    </view>
    <up-popup
      :show="dialogVisible"
      mode="bottom"
      :round="16"
      :customStyle="{ height: '70vh' }"
      @close="dialogVisible = false"
    >
      <view v-if="showTargetGoodType === 1" class="mt-2 common-detail">
        <app-cell title="单笔可销数量" border :value="goodsDtlObj.dtlSinglenum"></app-cell>
        <app-cell title="当月可销数量" border :value="goodsDtlObj.dtlMonthnum"></app-cell>
        <app-cell
          title="本月已销售数量"
          border
          :valueClass="
            goodsDtlObj.sellQtyOfThisMonth &&
            goodsDtlObj.dtlMonthnum &&
            goodsDtlObj.sellQtyOfThisMonth > goodsDtlObj.dtlMonthnum
              ? 'color-red'
              : ''
          "
          :value="goodsDtlObj.sellQtyOfThisMonth"
        ></app-cell>
        <app-cell
          :title="`向前推${goodsDtlObj.dtlForwarddays}天可销数量`"
          border
          :value="goodsDtlObj.dtlForwarddaysnum"
        ></app-cell>
        <app-cell
          :title="`向前推${goodsDtlObj.dtlForwarddays}天已销售数量`"
          border
          :valueClass="
            goodsDtlObj.qtyOfForwardDays &&
            goodsDtlObj.dtlForwarddaysnum &&
            goodsDtlObj.qtyOfForwardDays > goodsDtlObj.dtlForwarddaysnum
              ? 'color-red'
              : ''
          "
          :value="goodsDtlObj.qtyOfForwardDays"
        ></app-cell>
      </view>
      <view v-else class="target-goods">
        <app-cell title="单笔可销数量" border :value="goodsDtlObj.yyDtlSinglenum"></app-cell>
        <app-cell title="当月可销数量" border :value="goodsDtlObj.yyDtlMonthnum"></app-cell>
        <app-cell
          title="本月已销售数量"
          border
          :valueClass="
            goodsDtlObj.yySellQtyOfThisMonth &&
            goodsDtlObj.yyDtlMonthnum &&
            goodsDtlObj.yySellQtyOfThisMonth > goodsDtlObj.yyDtlMonthnum
              ? 'color-red'
              : ''
          "
          :value="goodsDtlObj.yySellQtyOfThisMonth"
        ></app-cell>
        <app-cell
          :title="`向前推${goodsDtlObj.yyDtlForwarddays}天可销数量`"
          border
          :value="goodsDtlObj.yyDtlForwarddaysnum"
        ></app-cell>
        <app-cell
          :title="`向前推${goodsDtlObj.yyDtlForwarddays}天已销售数量`"
          border
          :valueClass="
            goodsDtlObj.yyQtyOfForwardDays &&
            goodsDtlObj.yyDtlForwarddaysnum &&
            goodsDtlObj.yyQtyOfForwardDays > goodsDtlObj.yyDtlForwarddaysnum
              ? 'color-red'
              : ''
          "
          :value="goodsDtlObj.yyQtyOfForwardDays"
        ></app-cell>
      </view>
    </up-popup>
    <up-popup
      :show="lotVisible"
      mode="bottom"
      :round="16"
      :customStyle="{ height: '70vh' }"
      @close="lotVisible = false"
    >
      <view class="header pa-2 font-bold text-16">批号信息详情</view>
      <view class="font-16 color-success pl-2 pb-4 font-bold">
        总可销库存：{{ inventoryObj.curtotalLot }}
      </view>
      <app-empty v-if="inventoryList.length === 0" description="暂无数据" class="py-7"></app-empty>
      <view class="px-2">
        <view class="lot-card pa-2 mb-2" v-for="(item, index) in inventoryList" :key="index">
          <view class="flex pb-2"
            ><app-infor-item class="flex-1" title="批号" :content="item.lotno"></app-infor-item>
            <app-infor-item
              class="flex-1 pl-2"
              title="效期"
              :content="item.invaliddate.split(' ')[0]"
            ></app-infor-item
          ></view>
          <view class="flex pb-2">
            <app-infor-item class="flex-2" title="库存" :content="item.goodsqty"></app-infor-item>
            <app-infor-item
              :class="
                !(item.specialInventory && item.specialInventory.length) ? 'flex-2' : 'flex-1'
              "
              class="pl-2"
              title="两票制库存"
              :content="item.goodsNum"
            ></app-infor-item>
            <view
              class="color-main flex-1"
              v-if="item.specialInventory && item.specialInventory.length"
              >有特惠库存</view
            >
          </view>
          <view class="flex pb-2"
            ><app-infor-item
              class="flex-1"
              title="包装数"
              :content="`${item.packsize}${item.goodsunit}/${item.packname}`"
            ></app-infor-item>
            <app-infor-item
              class="flex-1 pl-2"
              title="货品状态"
              :content="item.goodsstatus"
            ></app-infor-item
          ></view>
          <app-infor-item
            v-if="+item.entryId === 5 || +item.entryId === 38"
            title="核算单元ID"
            :content="item.entryId"
          ></app-infor-item>
        </view>
      </view>
    </up-popup>
    <shop-card-btn cardType="1" />
  </view>
</template>

<script lang="ts" setup>
import type { GoodsDetail } from '../types';
import shopCardBtn from '../components/base/shop-card-btn.vue';
const reportTwoStore = useReportTwoStore();
const goodsDetail = computed(() => reportTwoStore.goodsDetail);
const customParams = computed(() => reportTwoStore.customParams);
const entryChoose = computed(() => reportTwoStore.entryChoose);
const reportPrice = ref(''); // 报货单价格
const reportNumber = ref(''); // 报货数量
const reportRemark = ref(''); // 细单备注
const totalPrice = computed(() => {
  if (reportNumber.value && reportPrice.value)
    return (+reportNumber.value * (+reportPrice.value * 1000)) / 1000;
  else return '--';
});
const goodsDtlObj = ref<GoodsDetail>({
  supplyerid: '',
  supplyername: '',
  price: 0,
  smallimglink: '',
  bigimglink: '',
  goodsId: '',
  goodsName: '',
  goodstype: '',
  goodsunit: '',
  factoryid: '',
  factoryname: '',
  packsizeList: '',
  limitQty: 0,
  entryId: '',
  bgzQty: 0,
  limitQtyOfYy: 0,
  yyBgzQty: 0,
  maxCanSellQty: 0,
  yyMaxCanSellQty: 0,
  salesqtycontrol: 0,
  leastsaleqty: 0,
});
const inventoryList = ref<any[]>([]);
const inventoryObj = ref({
  curtotalLot: 0,
  nowLotId: '',
  nowLotno: '',
});
const fetchGoodsDtl = async () => {
  const params = {
    customId: customParams.value.customid,
    entryId: entryChoose.value.entryid,
    goodsId: goodsDetail.value.goodsId,
  };
  const response = await ReportService.getGoodsDtl(params);
  let packsizeList = '';

  if (+response.code === 200) {
    if (response.data.price.packsizeList) {
      response.data.price.packsizeList.forEach((item: any, index: any) => {
        if (index !== response.data.price.packsizeList.length - 1) {
          packsizeList += item + '、';
        } else {
          packsizeList += item;
        }
      });
    }
    goodsDtlObj.value = {
      ...response.data.price,
      packsizeList,
      addressId: customParams.value.ADDRESSID,
      address: customParams.value.ADDRESS,
    };
    inventoryList.value = response.data.inventory;

    let tempLotId = '';
    let tempLotNo = '';
    let tempLot = 0;
    let curtotalLot = 0;
    for (let index = 0; index < inventoryList.value.length; index++) {
      curtotalLot += inventoryList.value[index].goodsqty || 0;
      if (inventoryList.value[index].goodsqty > tempLot) {
        tempLot = inventoryList.value[index].goodsqty;
        tempLotId = inventoryList.value[index].lotid;
        tempLotNo = inventoryList.value[index].lotno;
      }
    }
    inventoryObj.value.curtotalLot = curtotalLot;
    inventoryObj.value.nowLotId = tempLotId;
    inventoryObj.value.nowLotno = tempLotNo;
    reportPrice.value = goodsDtlObj.value.price + '';
    console.log(reportPrice.value);
  }
};
const dialogVisible = ref(false);
const showTargetGoodType = ref(0);
const targetGoodShow = (type: number) => {
  dialogVisible.value = true;
  showTargetGoodType.value = type;
};
const lotVisible = ref(false);
const showLot = () => {
  lotVisible.value = true;
};
const _addCart = () => {
  if (+reportNumber.value <= 0) {
    showError('报货数量不能为空且必须大于0');
    return;
  } else if (reportPrice.value === '' || Number(reportPrice.value) < 0) {
    showError('报货价格不能为空且必须大于或等于0');
    return;
  } else if (!goodsDetail.value.ADDRESSID) {
    showError('运输地址不能为空');
    return;
  }
  if (goodsDtlObj.value.leastsaleqty && goodsDtlObj.value.salesqtycontrol) {
    if (
      goodsDtlObj.value.salesqtycontrol === 1 &&
      Number(reportNumber.value) % goodsDtlObj.value.leastsaleqty !== 0
    ) {
      showError(`报货数量必须为${goodsDtlObj.value.leastsaleqty}的倍数，请重新输入`);
      return;
    } else if (
      goodsDtlObj.value.salesqtycontrol === 2 &&
      Number(reportNumber.value) % goodsDtlObj.value.leastsaleqty !== 0
    ) {
      showModal({
        title: '提示',
        content: `报货数量应该为${goodsDtlObj.value.leastsaleqty}的倍数，是否继续加入购物车？`,
        confirmText: '确定',
        confirmColor: '#2271F5',
        success: res => {
          if (res.confirm) {
            showModal({
              title: '提示',
              content: '当前品种无库存, 是否继续加入购物车?',
              confirmText: '确定',
              confirmColor: '#2271F5',
              success: res => {
                if (res.confirm) {
                  addCartInterFace();
                }
                // 如果用户点击取消，不做任何操作
              },
            });
          }
          // 如果用户点击取消，不做任何操作
        },
      });
      return;
    }
  }
  if (!inventoryObj.value.nowLotId) {
    showModal({
      title: '提示',
      content: '当前品种无库存, 是否继续加入购物车?',
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: res => {
        if (res.confirm) {
          addCartInterFace();
        }
        // 如果用户点击取消，不做任何操作
      },
    });
  } else {
    addCartInterFace();
  }
};
const addCartInterFace = async () => {
  let params = {
    cartType: 1,
    entryId: entryChoose.value.entryid,
    entryName: entryChoose.value.entryname,
    customId: customParams.value.customid,
    customName: customParams.value.customname,
    contactId: customParams.value.CONTACTID,
    contactName: customParams.value.CONTACTMAN,
    addressName: goodsDetail.value.ADDRESS,
    addressId: goodsDetail.value.ADDRESSID,
    goodsId: goodsDetail.value.goodsId,
    goodsName: goodsDetail.value.goodsName,
    lotId: inventoryObj.value.nowLotId,
    lotNo: inventoryObj.value.nowLotno,
    goodsQty: reportNumber.value,
    price: reportPrice.value,
    zxSpecialFlag: 0,
    invoiceWay: 1,
    dtlMemo: reportRemark.value,
  };
  const res = await ShopCartService.addCartSaler([params]);
  if (res.success) {
    showSuccess(res.data);
  } else {
    showError(res.data);
  }
};
onMounted(() => {
  fetchGoodsDtl();
});
</script>

<style lang="scss" scoped>
:deep(.u-cell__title) {
  width: 180rpx !important;
}

:deep(.u-cell) {
  padding: 0 15px !important;
}

:deep(.u-cell__body) {
  padding: 13px 0 !important;
}

.two-row {
  :deep(.u-cell) {
    padding: 0 !important;
  }
}

.border-bottom {
  border-bottom: 1px solid rgb(214 215 217 / 50%);
}

.add-cart-btn {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #fff;
}

.lot-card {
  border-radius: 16rpx;
  border: 1px solid rgb(214 215 217 / 50%);
}
</style>
