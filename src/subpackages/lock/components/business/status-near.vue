<!-- 库存状态/近效期 -->
<template>
  <view class="bg-white mt-2">
    <view v-if="detailObj.activate !== 0">
      <lockRow class="px-4" :leftLabel="'备注'" :leftValue="detailObj.remark || '--'"> </lockRow>
    </view>
    <view
      v-if="
        detailObj.activate === 0 &&
        role === 1 &&
        (querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser)
      "
    >
      <up-form>
        <app-form-item label="备注">
          <up-textarea
            v-model="statusNearRemark"
            placeholder="请输入库存批号"
            height="30px"
            autoHeight
          ></up-textarea>
        </app-form-item>
      </up-form>
    </view>
    <view>
      <app-bottom-actions>
        <up-button v-if="role === 1" type="info" @click="batchClick" shape="circle">
          查看批号
        </up-button>
        <up-button
          v-if="
            detailObj.activate === 0 &&
            role === 1 &&
            !detailObj.confirmedQuantity &&
            (querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser)
          "
          type="primary"
          @click="statusNearActive"
          shape="circle"
        >
          激活
        </up-button>
      </app-bottom-actions>
    </view>
    <up-popup
      v-model:show="batchShow"
      position="bottom"
      :customStyle="{ height: '90vh' }"
      round="16"
      closeable
    >
      <view class="text-16 py-4 text-center">查看批号</view>
      <view
        style="height: calc(70vh - 120rpx)"
        class="overflow-auto pb-100"
        v-if="entryList.length === 1"
      >
        <up-checkbox-group v-model="batchResult" placement="column">
          <up-checkbox
            :customStyle="{
              marginBottom: '8px',
              width: 'calc(100%- 20px)',
              padding: '10px',
              background: '#fff',
            }"
            v-for="item in batchList"
            :key="item.lotNo"
            :name="item.lotNo"
          >
            <template style="width: 100%" #label>
              <view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="批号:" :content="item.lotNo" />
                  <app-infor-item
                    class="flex-1 pl-4"
                    title="效期:"
                    :content="item.invalidDate.slice(0, 10)"
                  />
                </view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="库存:" :content="item.goodsQuantity" />
                  <app-infor-item
                    class="flex-1 pl-4"
                    title="两票制库存:"
                    :content="item.invoiceGoodsNum"
                  />
                </view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="保管帐:" :content="item.storageName" />
                  <app-infor-item class="flex-1 pl-4" title="状态:" :content="item.goodsStatus" />
                </view>
              </view>
            </template>
          </up-checkbox>
        </up-checkbox-group>
      </view>
      <view class="overflow-auto" v-if="entryList.length > 1">
        <app-tabs :list="entryList" :active="entryIdVal" @change="entryChange" />
        <up-checkbox-group v-model="batchResult" placement="column">
          <up-checkbox
            :customStyle="{
              marginBottom: '8px',
              width: 'calc(100%- 20px)',
              padding: '10px',
              background: '#fff',
            }"
            v-for="item in batchObj[entryIdVal]"
            :key="item.lotNo"
            :name="item.lotNo"
          >
            <template style="width: 100%" #label>
              <view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="批号:" :content="item.lotNo" />
                  <app-infor-item
                    class="flex-1 pl-4"
                    title="效期:"
                    :content="item.invalidDate.slice(0, 10)"
                  />
                </view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="库存:" :content="item.goodsQuantity" />
                  <app-infor-item
                    class="flex-1 pl-4"
                    title="两票制库存:"
                    :content="item.invoiceGoodsNum"
                  />
                </view>
                <view class="flex w-full">
                  <app-infor-item class="flex-1" title="保管帐:" :content="item.storageName" />
                  <app-infor-item class="flex-1 pl-4" title="状态:" :content="item.goodsStatus" />
                </view>
              </view>
            </template>
          </up-checkbox>
        </up-checkbox-group>
      </view>
      <view
        v-if="querySelfNumber === 1 || managementOpflagForSaler || managementOpflagForPurchaser"
      >
        <app-bottom-actions>
          <up-button shape="circle" @click="batchCancel" plain>取消</up-button>
          <up-button shape="circle" type="primary" @click="batchSure">确定</up-button>
        </app-bottom-actions>
      </view>
    </up-popup>
  </view>
</template>

<script lang="ts" setup>
/**
 * 库存状态/近效期组件
 * 用于展示和编辑库存状态、近效期商品的备注信息
 * 支持查看批号、选择批号、激活商品等功能
 */
import lockRow from '../base/lock-row.vue';

/**
 * 批号列表项类型
 */
interface BatchItem {
  /** 批号 */
  lotNo: string;
  /** 效期 */
  invalidDate: string;
  /** 库存数量 */
  goodsQuantity: number;
  /** 两票制库存数量 */
  invoiceGoodsNum: number;
  /** 保管帐名称 */
  storageName: string;
  /** 商品状态 */
  goodsStatus: string;
  /** 核算单元ID */
  entryId: string;
  /** 核算单元名称 */
  entryName: string;
}

/**
 * 核算单元类型
 */
interface EntryItem {
  /** 核算单元ID */
  entryId: string;
  /** 核算单元名称 */
  entryName: string;
  /** 显示名称 */
  name: string;
  /** 值 */
  value: string;
}

/**
 * 组件属性接口
 */
interface Props {
  /** 商品详情对象 */
  detailObj: any;
  /** 用户角色（1-销售 2-采购） */
  role: number;
  /** 是否查询自己的数据（1-是 0-否） */
  querySelfNumber: number;
  /** 销售是否有管理操作权限 */
  managementOpflagForSaler: boolean;
  /** 采购是否有管理操作权限 */
  managementOpflagForPurchaser: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['submitSuccess']);

/**
 * 库存状态/近效期备注
 */
const statusNearRemark = ref('');

/**
 * 是否显示批号弹窗
 */
const batchShow = ref(false);

/**
 * 选择的批号结果
 */
const batchResult = ref<string[]>([]);

/**
 * 核算单元列表
 */
const entryList = ref<EntryItem[]>([]);

/**
 * 批号列表
 */
const batchList = ref<BatchItem[]>([]);

/**
 * 按核算单元分组的批号对象
 */
const batchObj = ref<Record<string, BatchItem[]>>({});

/**
 * 当前选中的核算单元ID
 */
const entryIdVal = ref<string>('');

/**
 * 查看批号
 */
const batchClick = async () => {
  batchShow.value = true;
  try {
    // 调用接口获取批号列表
    const data = await OutOfStockService.getInventoryByLot({
      entryId: props.detailObj.entryId,
      goodsId: props.detailObj.goodsId,
    });
    // const dataMiddle = data;
    // .concat({
    //   buyerName: '蒋天奇',
    //   entryId: 16, // 修改后的 entryId
    //   entryName: '嘉兴英特药业有限责任公司',
    //   goodsId: 3044,
    //   goodsName: '加巴喷丁胶囊',
    //   goodsQuantity: 5,
    //   goodsStatus: '待处理中度',
    //   goodsStatusId: 12,
    //   goodsType: '0.3g*10粒',
    //   goodsUnit: '盒',
    //   invalidDate: '2028-08-13 00:00:00',
    //   invoiceFlag: 1,
    //   invoiceGoodsNum: 400,
    //   lotNo: '250814MC',
    //   packName: '件1',
    //   packSize: 200,
    //   prodArea: '江苏恒瑞',
    //   storageName: '英特药业保管账',
    // });
    entryList.value = [];
    batchObj.value = {};
    data.map((val: BatchItem) => {
      if (!batchObj.value[val.entryId]) {
        batchObj.value[val.entryId] = [];
      }
      batchObj.value[val.entryId].push(val);
      if (!entryList.value.some((entryVal: EntryItem) => entryVal.entryId === val.entryId)) {
        entryList.value.push({
          entryId: val.entryId,
          entryName: val.entryName,
          name: val.entryName,
          value: val.entryId,
        });
      }
    });
    if (entryList.value.length > 0) {
      entryIdVal.value = entryList.value[0].entryId;
    }
    batchList.value = data;
  } catch (error) {
    uni.showToast({ title: '获取批号列表失败', icon: 'none' });
  }
};

/**
 * 取消选择批号
 */
const batchCancel = () => {
  batchShow.value = false;
};

/**
 * 确认选择批号
 */
const batchSure = () => {
  statusNearRemark.value = '';
  if (!batchResult.value.length) {
    showError('请选择要备注的批号信息');
    return;
  }
  const lotNoList = [];
  for (let index = 0; index < batchResult.value.length; index++) {
    const element = batchResult.value[index];
    lotNoList.push(element);
  }
  statusNearRemark.value = `请开批号【${lotNoList.join(',')}】`;
  batchShow.value = false;
};

/**
 * 激活商品
 */
const statusNearActive = async () => {
  try {
    const params = {
      conDtlId: props.detailObj.conDtlId,
      conType: props.detailObj.conType,
      taskId: props.detailObj.taskId,
      forceFlag: 0, // 0-正常激活 1-强制激活
    };
    const response = await OutOfStockService.salerActive(params);
    console.log(response);
    if (response.success) {
      uni.showToast({ title: '激活成功', icon: 'success' });
      emit('submitSuccess');
    } else {
      uni.showToast({ title: '激活失败', icon: 'none' });
    }
  } catch (error) {
    uni.showToast({ title: '激活失败', icon: 'none' });
  }
};

/**
 * 核算单元变更
 */
const entryChange = ({ index }: { index: number }) => {
  if (batchResult.value.length > 0) {
    showModal({
      title: '提示',
      content: '批号仅能选取单一核算单元数据，切换会导致已选择批号清空，是否继续？',
      confirmText: '确定',
      confirmColor: '#2271F5',
      success: res => {
        if (res.confirm) {
          batchResult.value = [];
        }
        entryIdVal.value = entryList.value[index].entryId;
        batchList.value = batchObj.value[entryIdVal.value] || [];
      },
    });
  } else {
    entryIdVal.value = entryList.value[index].entryId;
    batchList.value = batchObj.value[entryIdVal.value] || [];
  }
};
</script>

<style lang="scss" scoped>
:deep(.u-checkbox__label-wrap) {
  width: 100%;
}
:deep(.uni-textarea-placeholder) {
  text-align: right;
}
</style>
