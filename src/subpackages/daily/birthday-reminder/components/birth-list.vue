<script setup lang="ts">
import { useBirthdayList } from '../composables/use-birthday-list';
import { useBirthdayOperations } from '../composables/use-birthday-operations';
import BirthCard from './birth-card.vue';

defineOptions(SHARED_STYLE_OPTIONS);

const appStore = useAppStore();

const { addUser } = useBirthdayOperations();

const {
  birthList1,
  birthList2,
  birthList3,
  loading,
  finished,
  params,
  isAll,
  selectedList,
  selectedIdList,
  onLoad,
  handleFilter,
  resetList,
  toggleBatchMode,
  handleSelectionChange,
  isItemSelected,
  handleCheckboxGroupChange,
} = useBirthdayList();

// 筛选弹窗
const showFilter = ref(false);

// 部门用户选择
const changeTypeShow = ref(false);
const hasDept = ref(false);
const checkedUsers = ref<string[]>([]);

// 筛选处理
const handleFilterClick = (birthFlag: string) => {
  showFilter.value = false;
  handleFilter(birthFlag);
};

// 批量操作
const editAll = () => {
  toggleBatchMode();
};

// 推送至指定人员
const toPersonChoose = () => {
  if (selectedList.value.length === 0) {
    showToast('请选择要推送的生日信息');
    return;
  }
  changeTypeShow.value = true;
};

// 确认选择用户
const handleTreeConfirm = (list: string[]) => {
  if (list.length === 0) {
    showToast('未选择推送人');
    return;
  }

  checkedUsers.value = list;
  changeTypeShow.value = false;

  addUser(selectedList.value, list, () => {
    isAll.value = false;
    selectedList.value = [];
  });
};

// 查看详情
const handleShowDetail = (data: any) => {
  if (isAll.value) return;

  const { getSurplusDay } = useBirthdayOperations();

  const detailInfo = {
    ...data,
    count1: data.birthday ? getSurplusDay(data.birthday) : '-',
    count2: data.politicsBirthday ? getSurplusDay(data.politicsBirthday) : '-',
  };

  uni.navigateTo({
    url: `/subpackages/daily/birthday-reminder/detail?data=${encodeURIComponent(JSON.stringify(detailInfo))}`,
  });
};

// 暴露方法给父组件
const handleSearch = (keyword: string) => {
  params.value.user = keyword;
  resetList();
};

defineExpose({
  handleSearch,
});

// 生命周期
onMounted(() => {
  resetList();
});
</script>

<template>
  <view class="birth-list">
    <scroll-view class="h-full box-sizing-border" scroll-y enable-flex @scrolltolower="onLoad">
      <app-empty
        v-if="!loading && !birthList1.length && !birthList2.length && !birthList3.length"
        description="暂无数据"
        class="bg-white mt-2 pb-4"
      />

      <!-- 使用 checkbox-group 包裹所有列表项 -->
      <up-checkbox-group
        v-model="selectedIdList"
        @change="handleCheckboxGroupChange"
        class="w-full"
      >
        <!-- 即将过生日 -->
        <view v-if="birthList1.length" class="birth-section">
          <view class="text-12 color-gray-4 my-2">即将过生日</view>
          <birth-card
            v-for="(item, index) in birthList1"
            :key="'birth-1-' + index"
            :data="item"
            :is-all="isAll"
            :selected="isItemSelected(item)"
            @click="handleShowDetail(item)"
          />
        </view>

        <!-- 近期过生日 -->
        <view v-if="birthList2.length" class="birth-section">
          <view class="text-12 color-gray-4 my-2">近期过生日</view>
          <birth-card
            v-for="(item, index) in birthList2"
            :key="'birth-2-' + index"
            :data="item"
            :is-all="isAll"
            :selected="isItemSelected(item)"
            @click="handleShowDetail(item)"
          />
        </view>

        <!-- 一个月后过生日 -->
        <view v-if="birthList3.length" class="birth-section">
          <view class="text-12 color-gray-4 my-2">一个月后过生日</view>
          <birth-card
            v-for="(item, index) in birthList3"
            :key="'birth-3-' + index"
            :data="item"
            :is-all="isAll"
            :selected="isItemSelected(item)"
            @click="handleShowDetail(item)"
          />
        </view>
      </up-checkbox-group>

      <up-loadmore
        v-if="loading || !finished"
        :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
      />
      <!-- 底部占位，防止被固定按钮遮挡 -->
      <view class="h-200" />
    </scroll-view>

    <!-- 底部操作栏 -->
    <app-bottom-actions :count="2">
      <template v-if="!isAll">
        <app-action-btn
          class="flex-1"
          type="plain"
          icon="lujing2"
          :multi="false"
          text="批量操作"
          @click="editAll"
        />
        <app-action-btn
          class="flex-1"
          type="primary"
          icon="filter-o"
          :multi="false"
          :text="
            !params.birthFlag
              ? '条件筛选'
              : params.birthFlag === '1'
                ? '点击切换为「政治生日」'
                : '点击切换为「生日」'
          "
          @click="showFilter = true"
        />
      </template>
      <template v-else>
        <app-action-btn class="flex-1" type="plain" :multi="false" text="取消" @click="editAll" />
        <app-action-btn
          class="flex-1"
          type="primary"
          :multi="false"
          :text="`附加推送至 已选${selectedList.length}条`"
          @click="toPersonChoose"
        />
      </template>
    </app-bottom-actions>

    <!-- 筛选弹窗 -->
    <up-popup :show="showFilter" mode="bottom" :round="16" @close="showFilter = false">
      <view class="bg-white">
        <view class="text-14 color-gray-4 text-center py-4 border-b">生日类型</view>
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilterClick('1')"
          >生日</view
        >
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilterClick('2')"
          >政治生日</view
        >
        <view class="h-8px bg-light-gray" />
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilterClick('')"
          >取消</view
        >
      </view>
    </up-popup>

    <!-- 部门用户选择 -->
    <biz-dept-user
      v-model:show="changeTypeShow"
      v-model:checkedUsers="checkedUsers"
      v-model:hasDept="hasDept"
      @confirm="handleTreeConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
.birth-list {
  height: 100%;
  padding: 0 10px;
}

.birth-section {
  width: 100%;
}

// 确保 checkbox-group 占满宽度
:deep(.up-checkbox-group) {
  width: 100% !important;
  display: block !important;
}
</style>
