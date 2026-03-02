<template>
  <view class="card mb-2" @click="handleClick">
    <view class="pa-2 bg-white flex flex-col">
      <view class="flex justify-between align-center">
        <view>
          <up-tag
            v-if="item.status !== 1 && item.orderType === 14"
            style="margin-right: 10px"
            :type="
              item.status === 2
                ? 'success'
                : item.status === 3
                  ? 'error'
                  : item.status === 4
                    ? 'error'
                    : item.status === 5
                      ? 'error'
                      : item.status === 6
                        ? 'primary'
                        : item.status === 7
                          ? 'success'
                          : item.status === 8
                            ? 'success'
                            : 'error'
            "
            :plain="
              item.status === 2
                ? true
                : item.status === 3
                  ? true
                  : item.status === 4
                    ? false
                    : item.status === 5
                      ? false
                      : item.status === 6
                        ? false
                        : item.status === 7
                          ? false
                          : item.status === 8
                            ? false
                            : true
            "
          >
            {{
              item.status === 2
                ? '已生成订单'
                : item.status === 3
                  ? '审核未通过'
                  : item.status === 4
                    ? '传输到ERP报错'
                    : item.status === 5
                      ? 'ERP作废'
                      : item.status === 6
                        ? 'ERP临时'
                        : item.status === 7
                          ? 'ERP正式'
                          : item.status === 8
                            ? 'ERP完成'
                            : '未知'
            }}
          </up-tag>
          <up-tag
            v-if="item.orderType === 6"
            style="margin-right: 10px"
            :type="
              item.status === 0
                ? 'info'
                : item.status === 1
                  ? 'info'
                  : item.status === 2
                    ? 'success'
                    : item.status === 3
                      ? 'error'
                      : item.status === 4
                        ? 'error'
                        : item.status === 5
                          ? 'error'
                          : item.status === 6
                            ? 'primary'
                            : item.status === 7
                              ? 'success'
                              : item.status === 8
                                ? 'success'
                                : 'error'
            "
            :plain="
              item.status === 0
                ? false
                : item.status === 1
                  ? true
                  : item.status === 2
                    ? true
                    : item.status === 3
                      ? true
                      : item.status === 4
                        ? false
                        : item.status === 5
                          ? false
                          : item.status === 6
                            ? false
                            : item.status === 7
                              ? false
                              : item.status === 8
                                ? false
                                : true
            "
          >
            {{
              item.status === 0
                ? '未生成'
                : item.status === 1
                  ? '已审核'
                  : item.status === 2
                    ? '已生成订单'
                    : item.status === 3
                      ? '审核未通过'
                      : item.status === 4
                        ? '传输到ERP报错'
                        : item.status === 5
                          ? 'ERP作废'
                          : item.status === 6
                            ? 'ERP临时'
                            : item.status === 7
                              ? 'ERP正式'
                              : item.status === 8
                                ? 'ERP完成'
                                : '未知'
            }}
          </up-tag>
        </view>
        <view class="font-bold">{{ item.createTime }}</view>
      </view>
      <app-infor-item
        class="mt-2"
        title="总价格"
        contentClass="color-main"
        :content="`￥${item.totalPrice}`"
      />

      <app-infor-item class="mt-2" title="总单ID" :content="`${item.codDocId}`" />
      <app-infor-item class="mt-2" title="销售合同ID" :content="`${item.conid || '待生成'}`" />
      <app-infor-item
        class="mt-2"
        title="客户信息"
        :content="`${item.customId}/${item.customName}`"
      />
      <app-infor-item
        class="mt-2"
        title="运输地址"
        :content="`${item.addressId}/${item.addressName}`"
      />
      <app-infor-item
        v-show="item.docMemo"
        class="mt-2"
        title="总单备注"
        :content="`${item.docMemo}`"
      />
      <app-infor-item
        v-if="!item.conid && item.sendResultMsg"
        class="mt-2"
        title="异常信息"
        :content="`${item.sendResultMsg}`"
      />
      <app-infor-item
        class="mt-2"
        title="下单人"
        contentClass="color-main"
        :content="`${item.userId}/${item.userName}`"
      />
    </view>
  </view>
</template>

<script lang="ts" setup>
interface IProps {
  item: any;
}
const props = defineProps<IProps>();
const emit = defineEmits(['click']);

const handleClick = () => {
  emit('click');
};
</script>

<style lang="scss" scoped></style>
