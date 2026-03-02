<template>
  <view class="approve-detail-list ma-2">
    <up-checkbox-group v-model="checkedValues" @change="onChange">
      <view
        class="approve-item bg-white pa-2 mb-2"
        v-for="(data, idx) in list"
        :key="idx"
        @click="onClick(data.auditstatus, idx)"
      >
        <view class="flex align-center justify-between">
          <view class="flex align-center">
            <up-tag
              :text="`细单ID ${data.invoicedtlid}`"
              size="mini"
              plain
              plainFill
              borderColor="transparent"
            ></up-tag>

            <up-tag
              class="ml-2"
              v-if="data.auditstatus === 2"
              text="审核未通过"
              size="mini"
              type="error"
              plain
              plainFill
              borderColor="transparent"
            ></up-tag>
            <up-tag
              class="ml-2"
              v-if="data.auditstatus === 1"
              text="审核通过"
              size="mini"
              type="error"
              plain
              plainFill
              borderColor="transparent"
            ></up-tag>

            <up-tag
              class="ml-2"
              v-else
              text="未审核"
              size="mini"
              type="warning"
              plain
              plainFill
              borderColor="transparent"
            ></up-tag>
          </view>
          <up-checkbox
            v-show="data.auditstatus === 0"
            :name="data.invoicedtlid"
            shape="circle"
            activeColor="#2271F5"
            @click.stop
          ></up-checkbox>
        </view>
        <app-infor-item
          title="货品"
          :content="`${data.goodsid}/${data.goodsname}`"
          class="mt-2"
        ></app-infor-item>
        <app-infor-item title="厂家" :content="data.zxfactoryname" class="mt-2"></app-infor-item>
        <app-infor-item title="规格" :content="data.goodstype" class="mt-2"></app-infor-item>
        <app-infor-item title="数量" :content="data.goodsqty" class="mt-2"></app-infor-item>
        <app-infor-item title="价格" :content="data.goodsoffer" class="mt-2"></app-infor-item>
        <app-infor-item
          title="细单合计"
          :content="data.dtltotolprice"
          class="mt-2"
        ></app-infor-item>
        <app-infor-item
          title="效期至"
          :content="data.invaliddate ? data.invaliddate.split(' ')[0] : ''"
          class="mt-2"
        ></app-infor-item>
        <app-infor-item title="备注" :content="data.memo || '-'" class="mt-2"></app-infor-item>
      </view>
    </up-checkbox-group>
  </view>
</template>

<script lang="ts" setup>
const props = defineProps({
  list: {
    type: Array as () => any[],
    default: () => [],
  },
});

const emit = defineEmits(['change']);

const checkedValues = ref<any[]>([]);

/**
 * 点击列表项，切换复选框状态
 */
const onClick = (auditstatus: number, index: number) => {
  if (auditstatus === 0) {
    const item = props.list[index];
    const itemId = item.invoicedtlid;
    const idx = checkedValues.value.indexOf(itemId);

    if (idx > -1) {
      checkedValues.value.splice(idx, 1);
    } else {
      checkedValues.value.push(itemId);
    }
  }
};

/**
 * 发送选中项变化事件
 */
const onChange = () => {
  const checkedList = props.list.filter((item: any) =>
    checkedValues.value.includes(item.invoicedtlid)
  );
  emit('change', checkedList);
};

// 同步 list 中的 checked 状态
watch(
  checkedValues,
  newVal => {
    props.list.forEach((item: any) => {
      item.checked = newVal.includes(item.invoicedtlid);
    });
    onChange();
  },
  { deep: true }
);
</script>

<style lang="scss" scoped>
.approve-item {
  border-radius: 10px;
  width: 100%;
}
</style>
