<template>
  <view>
    <view class="pa-2 bg-white">
      <up-search
        @search="onSearch"
        @clear="onSearch"
        v-model="searchValue"
        shape="round"
      ></up-search>
    </view>
    <app-pull-refresh
      :refreshing="refreshing"
      :loadmoreProps="loadmoreConfig"
      :pullRefreshHeight="pullRefreshHeight"
      @refresh="onRefresh"
      @loadmore="onLoadMore"
    >
      <up-collapse bg-white :value="activeNames">
        <view v-for="(item, index) in list" :key="item.customid + index">
          <up-collapse-item v-if="item.contactList && item.contactList.length">
            <template #title>
              <view>
                <view class="mr-2">{{ item.customid + '/' + item.customname }}</view>
                <view class="color-gray-4 text-12 pt-2" v-show="item.entryid"
                  >{{ item.entryid }}/{{ item.entryname }}</view
                >
                <!-- <li v-if="item.contactFlag" class="color-never font-12">无可下单分支机构（不在效期），不可下单</li> -->
                <view v-if="item.contactFlag" class="color-never font-12"
                  >无可下单分支机构（不在效期），不可下单</view
                >
              </view>
            </template>
            <up-cell
              class="block mt-2"
              titleClass="w-90%"
              border
              isLink
              v-for="(contact, index) in item.contactList"
              :key="contact.CONTACTID + index"
              @click="handleClick(item, contact)"
            >
              <template #title>
                <view>{{ contact.CONTACTID + '/' + contact.CONTACTMAN }}</view>
                <view v-if="contact.dialyPass" class="text-12 color-warning"
                  >最小效期为:{{ new Date(contact.miniTime).toLocaleDateString() }}</view
                >
              </template>
              <template #right-icon>
                <up-icon name="arrow-right" size="16" class="text-gray-5" /> </template
            ></up-cell>
          </up-collapse-item>
          <up-cell
            border
            titleClass="w-90%"
            isLink
            v-else
            @click="handleClick(item)"
            :title="item.customid + '/' + item.customname"
          >
            <template #right-icon>
              <up-icon name="arrow-right" size="16" class="text-gray-5" />
            </template>
          </up-cell>
        </view>
      </up-collapse>
    </app-pull-refresh>
  </view>
</template>

<script lang="ts" setup>
import { CommonService } from '@/api/common';
interface Props {
  entryid: string;
  type?: number;
}
const props = defineProps<Props>();
const emit = defineEmits(['cell-click']);
const searchValue = ref('');
const activeNames = ref([]);
const handleClick = (item: any, contact?: any) => {
  if (item.contactFlag) {
    showError('无可下单分支机构（不在效期），不可下单');
    return;
  }
  const needItem = Object.assign({ customid: item.customid, customname: item.customname }, contact);
  if (contact) {
    if (contact.dialyPass) {
      showModal({
        title: '提示',
        content: `${contact.CONTACTMAN}有多个不同的有效期且已过期，不允许选择，最小效期为:${new Date(
          contact.miniTime
        ).toLocaleDateString()}`,
        confirmText: '确定',
        confirmColor: '#2271F5',
      });
      return;
    }
  }
  emit('cell-click', needItem);
};
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  const response = await CommonService.getSalesmanCustom({
    condition: searchValue.value,
    entryid: props.entryid,
    pageNum: params.pageNum,
    pageSize: params.pageSize,
  });
  return {
    list: response.list || [],
    hasNextPage: response.hasNextPage || false,
    total: response.total || 0,
  };
};
const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
  changeRowValue,
} = usePagination(
  {
    pageSize: 20,
    initialPage: 1,
    toolBarHeight: 100,
  },
  fetchData
);
const onSearch = () => {
  onRefresh();
};
onMounted(() => {
  calcPullRefreshHeight();
  onRefresh();
});
</script>

<style lang="scss" scoped></style>
