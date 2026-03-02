<script setup lang="ts">
import { useBirthdayOperations } from './composables/use-birthday-operations';
import BirthCard from './components/birth-card.vue';
// 导入默认头像
import defaultAvatar from '@/static/images/default_head/(12).png';

defineOptions(SHARED_STYLE_OPTIONS);

const appStore = useAppStore();
const { getSurplusDay, updateUser } = useBirthdayOperations();

// 人员信息
const person = ref<any>({});

// 列表数据
const birthList1 = ref<any[]>([]);
const birthList2 = ref<any[]>([]);
const birthList3 = ref<any[]>([]);

// 分页
const loading = ref(false);
const finished = ref(false);
const page = ref(1);

// 查询参数
const params = ref({
  userId: '',
  birthFlag: '',
  user: '',
  pageNum: 1,
  pageSize: 10,
});

// 批量操作
const isAll = ref(false);
const selectedList = ref<any[]>([]);

// 筛选弹窗
const showFilter = ref(false);
const searchValue = ref('');

/**
 * 查询人员的生日列表
 */
const queryBirthByUser = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    const res = await BirthdayService.queryBirthByUser({
      ...params.value,
      pageNum: page.value,
    });

    // 处理数据，按天数分类
    res.list.forEach((data: any) => {
      if (data.birthFlag === 1) {
        data.count = getSurplusDay(data.birthday);
      } else {
        data.count = getSurplusDay(data.politicsBirthday);
      }

      if (data.count <= 7) {
        birthList1.value.push(data);
      } else if (data.count <= 30) {
        birthList2.value.push(data);
      } else {
        birthList3.value.push(data);
      }
    });

    if (!res.hasNextPage) {
      finished.value = true;
    } else {
      page.value++;
    }
  } catch (error) {
    console.error('查询失败:', error);
    finished.value = true;
  } finally {
    loading.value = false;
  }
};

// 加载更多
const onLoadMore = () => {
  queryBirthByUser();
};

// 搜索
const handleSearch = () => {
  params.value.user = searchValue.value;
  resetList();
};

// 筛选
const handleFilter = (birthFlag: string) => {
  showFilter.value = false;
  params.value.birthFlag = birthFlag;
  resetList();
};

// 重置列表
const resetList = () => {
  page.value = 1;
  birthList1.value = [];
  birthList2.value = [];
  birthList3.value = [];
  finished.value = false;
  queryBirthByUser();
};

// 批量操作
const editAll = () => {
  isAll.value = !isAll.value;
  if (!isAll.value) {
    selectedList.value = [];
  }
};

// 取消推送
const deleteCard = async () => {
  if (selectedList.value.length === 0) {
    showToast('请选择要取消推送的信息');
    return;
  }

  try {
    await showModal({
      content: '确定移除推送?',
    });

    await updateUser([person.value.userId], selectedList.value, () => {
      isAll.value = false;
      selectedList.value = [];
      person.value.count -= selectedList.value.length;

      // 设置标记，通知列表页刷新
      appStore.setHadDoneOnDetail(true);
      resetList();
    });
  } catch (error) {
    console.log('取消删除');
  }
};

// 生命周期
onLoad((options: any) => {
  if (options.data) {
    try {
      person.value = JSON.parse(decodeURIComponent(options.data));
      params.value.userId = person.value.userId;
      resetList();
    } catch (e) {
      showToast('数据解析失败');
    }
  }
});
</script>

<template>
  <view class="person-detail h-full">
    <app-watermark />

    <!-- 搜索栏 -->
    <app-search
      v-model="searchValue"
      placeholder="搜索"
      @input="handleSearch"
      class="px-4 py-2 bg-white"
    />

    <!-- 人员卡片 -->
    <view class="person-card flex bg-white">
      <up-avatar :src="defaultAvatar" size="30" shape="circle" class="card-img" />
      <view class="ml-2">
        <view class="text-14 font-bold">{{ person.userName }}</view>
        <view class="text-12 font-bold color-gray-4">/{{ person.userId }}</view>
      </view>
      <view class="ml-auto">
        <view class="text-16 font-bold text-right color-main">{{ person.count }}条</view>
        <view class="text-12 color-gray-3">已推送信息数</view>
      </view>
    </view>

    <!-- 列表 -->
    <view class="card-list">
      <scroll-view
        class="h-[calc(100%-70px)] px-10 scroll-y enable-flex"
        @scrolltolower="onLoadMore"
      >
        <!-- 即将过生日 -->
        <view v-if="birthList1.length" class="birth-section">
          <view class="text-12 color-gray-4 my-2">即将过生日</view>
          <birth-card
            v-for="(item, index) in birthList1"
            :key="'birth-1-' + index"
            :data="item"
            :is-all="isAll"
            :selected="selectedList.includes(item)"
            @update:selected="
              val =>
                (selectedList = val
                  ? [...selectedList, item]
                  : selectedList.filter(i => i !== item))
            "
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
            :selected="selectedList.includes(item)"
            @update:selected="
              val =>
                (selectedList = val
                  ? [...selectedList, item]
                  : selectedList.filter(i => i !== item))
            "
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
            :selected="selectedList.includes(item)"
            @update:selected="
              val =>
                (selectedList = val
                  ? [...selectedList, item]
                  : selectedList.filter(i => i !== item))
            "
          />
        </view>

        <up-loadmore
          v-if="loading || !finished"
          :status="loading ? 'loading' : finished ? 'nomore' : 'loadmore'"
        />
      </scroll-view>

      <!-- 底部操作栏 -->
      <view
        class="flex items-center justify-center p-4 fixed bottom-40 left-0 right-0 bg-[#f5f6f9] z-10"
      >
        <template v-if="!isAll">
          <app-action-btn
            class="shadow-btn w-240 mr-4"
            type="plain"
            icon="lujing2"
            :multi="false"
            text="批量操作"
            @click="editAll"
          />
          <app-action-btn
            class="shadow-btn w-240"
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
          <app-action-btn
            class="shadow-btn w-180 mr-4"
            type="plain"
            :multi="false"
            text="取消"
            @click="editAll"
          />
          <app-action-btn
            class="shadow-btn w-240"
            type="primary"
            :multi="false"
            :text="`取消推送 已选${selectedList.length}条`"
            @click="deleteCard"
          />
        </template>
      </view>
    </view>

    <!-- 筛选弹窗 -->
    <up-popup :show="showFilter" mode="bottom" :round="16" @close="showFilter = false">
      <view class="bg-white">
        <view class="text-14 color-gray-4 text-center py-4 border-b">生日类型</view>
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilter('1')"> 生日 </view>
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilter('2')">
          政治生日
        </view>
        <view class="h-8px bg-light-gray" />
        <view class="text-16 color-gray-5 text-center py-3" @click="handleFilter('')"> 取消 </view>
      </view>
    </up-popup>
  </view>
</template>

<style lang="scss" scoped>
.person-card {
  padding: 6px 16px;

  .card-img {
    border: 1px solid #e9e9e9;
    margin-top: 3px;
  }
}

.card-list {
  height: calc(100% - 102px);
}
</style>
