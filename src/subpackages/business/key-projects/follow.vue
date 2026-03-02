<template>
  <view class="h-full">
    <app-watermark />
    <!-- 搜索栏 -->
    <app-search
      v-model="searchValue"
      placeholder="请输入客户ID|名称"
      readonly
      @click="fullPopShow = true"
    />

    <!-- 空状态 -->
    <app-empty v-if="!curCustom.custName" description="请先输入指定客户" />
    <app-empty v-else-if="nopermit" description="网格层级信息未维护，请先去管理后台进行维护" />

    <!-- 主要内容 -->
    <view v-else class="pa-2 pb-20">
      <!-- 客户信息卡片 -->
      <view class="gray-block box-shadow">
        <view class="white-block pa-2">
          <view class="text-14 font-bold">{{ dataSource.custId || '' }}/</view>
          <view class="flex items-center" @click="showFullTitle = !showFullTitle">
            <view :class="['flex-1 text-14 font-bold', showFullTitle ? '' : 'line-1']">
              {{ dataSource.custName || '' }}
            </view>
            <uni-icons
              v-if="titleOverflow"
              :type="showFullTitle ? 'up' : 'down'"
              size="16"
              color="#969799"
            />
          </view>
          <view class="flex items-center mt-2">
            <view class="color-gray mr-2 text-12">联合体</view>
            <view class="font-bold text-12">
              {{
                dataSource.communtyId ? `${dataSource.communtyId}/${dataSource.communtyName}` : '无'
              }}
            </view>
          </view>
          <view class="flex items-center mt-2">
            <view class="color-gray mr-2 text-12">网格层级</view>
            <view class="font-bold text-12">{{ dataSource.gridGrade }}</view>
          </view>
        </view>
        <view class="pa-2 text-12">项目类型</view>
        <view class="flex flex-wrap px-2 pb-2">
          <app-tag
            v-for="(item, idx) in dataSource.typeList"
            :key="idx"
            :name="item.type[0]"
            type="primary"
            size="small"
            class="mb-1 mr-1"
          />
        </view>
      </view>

      <!-- 部门和业务员 -->
      <view class="white-block mt-2 rounded pa-2">
        <app-tabs
          v-if="dataSource.deptList && dataSource.deptList.length > 1"
          :current="deptCurrentIndex"
          :list="deptTabList"
          scrollable
          @change="onDeptTabChange"
        />
        <view class="flex mt-2">
          <view class="flex items-center">
            <view class="color-gray mr-2 text-12">业务员</view>
            <view class="font-bold text-14">{{ dataSource.saler }}</view>
          </view>
          <view class="flex items-center ml-4">
            <view class="color-gray mr-2 text-12">领航员</view>
            <view class="font-bold text-14">{{ dataSource.pilotName }}</view>
          </view>
        </view>
      </view>

      <!-- 统计 -->
      <view class="white-block mt-2 rounded pa-2 position-relative">
        <view class="text-14 font-bold mb-2">统计</view>
        <increase-table :data="dataSource.increaseTableData" />
        <app-local-loading v-if="dataLoading" />
      </view>

      <!-- 内容tabs -->
      <view class="white-block mt-2 rounded">
        <view class="flex justify-between items-center pt-2 px-2">
          <app-tabs
            :current="typeCurrentIndex"
            :list="typeTabList"
            @change="onTypeTabChange"
            style="width: 70%"
            scrollable
          />
          <view class="add-btn" @click="toAddPage">
            <uni-icons type="plusempty" size="20" color="#fff" />
          </view>
        </view>

        <app-pull-refresh
          :refreshing="refreshing"
          :loadmoreProps="loadmoreConfig"
          :pullRefreshHeight="pullRefreshHeight"
          @refresh="onRefresh"
          @loadmore="onLoadMore"
        >
          <!-- 拜访层级 -->
          <view v-show="typeActive === '1'" class="pa-2">
            <gr-list :list="list" @edit="toEdit" @delete="deleteItem" />
          </view>

          <!-- 目标任务 -->
          <view v-show="typeActive === '2'">
            <view class="px-2 pt-2">
              <app-tab-btn
                v-model="targetStatus"
                :options="statusOptions"
                :fixed="false"
                width="100%"
                height="32px"
                @change="changeStatus"
              />
            </view>
            <view class="pa-2">
              <target-list
                :list="list"
                :disabled="targetStatus === 2"
                @finish="finishTarget"
                @edit="toEdit"
                @delete="deleteItem"
              />
            </view>
          </view>

          <!-- 目标品种 -->
          <view v-show="typeActive === '3'" class="pa-2">
            <up-form labelPosition="left" labelWidth="120">
              <up-form-item label="时间范围" borderBottom>
                <up-input
                  v-model="dateRange"
                  placeholder="点击选择时间范围"
                  readonly
                  @click="showPickerDate = true"
                />
              </up-form-item>
              <up-form-item label="关键词" borderBottom>
                <up-input
                  v-model="goods"
                  placeholder="请输入货品ID|名称"
                  clearable
                  @clear="onRefresh"
                  @confirm="onRefresh"
                />
              </up-form-item>
            </up-form>
            <view class="mt-2">
              <goods-list :list="list" @delete="deleteItem" />
            </view>
          </view>
        </app-pull-refresh>
      </view>

      <!-- 网格化管理按钮 -->
      <app-fix-btn v-if="buttonShow" text="网格化管理" icon="wangge" @click="toKeyProjects" />
    </view>

    <!-- 日期选择 -->
    <uv-calendars
      v-model:show="showPickerDate"
      mode="range"
      :minDate="minDate"
      :maxDate="maxDate"
      @confirm="onConfirmDate"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useUserStore } from '@/store/user';
import { useKeyProjects } from './composables/use-key-projects';
import { useKeyProjectsFollow } from './composables/use-key-projects-follow';
import { usePagination } from '@/composables/use-pagination';
import { KeyProjectsService } from '@/api/key-projects';
import IncreaseTable from './components/increase-table.vue';
import GrList from './components/gr-list.vue';
import TargetList from './components/target-list.vue';
import GoodsList from './components/goods-list.vue';

const {
  typeActive,
  targetStatus,
  dateRange,
  goods,
  curDept,
  ccuId,
  custId,
  statusOptions,
  formatSearchDate,
  fetchGrList,
  fetchTargetList,
  fetchGoodsList,
  deleteGrItem,
  deleteTargetItem,
  deleteGoodsItem,
  finishTarget: finishTargetBase,
  changeStatus: changeStatusBase,
} = useKeyProjectsFollow();

const { curCustom, dataSource, active, nopermit, getData } = useKeyProjects();

const deptTabList = computed(() => {
  return (dataSource.value.deptList || []).map((item: any) => ({ name: item.deptName, ...item }));
});

const deptCurrentIndex = computed(() => {
  if (!deptTabList.value.length) return 0;
  const idx = deptTabList.value.findIndex((item: any) => item.deptId === active.value);
  return idx > -1 ? idx : 0;
});

const onDeptTabChange = ({ index }: { index: number }) => {
  const item = deptTabList.value[index];
  if (!item) return;
  active.value = item.deptId;
  handleClick();
};

const typeTabList = [
  { name: '拜访层级', value: '1' },
  { name: '目标任务', value: '2' },
  { name: '目标品种', value: '3' },
];

const typeCurrentIndex = computed(() => {
  const idx = typeTabList.findIndex(item => item.value === typeActive.value);
  return idx > -1 ? idx : 0;
});

const onTypeTabChange = ({ index }: { index: number }) => {
  const item = typeTabList[index];
  if (!item) return;
  typeActive.value = item.value;
  onRefresh();
};

const searchValue = ref('');
const fullPopShow = ref(false);
const custLoading = ref(false);
const custList = ref<any[]>([]);
const showFullTitle = ref(false);
const titleOverflow = ref(false);
const dataLoading = ref(false);
const buttonShow = ref(false);
const showPickerDate = ref(false);
const minDate = new Date(2010, 0, 1);
const maxDate = new Date();

// 分页数据
const fetchData = async (params: { pageNum: number; pageSize: number }) => {
  if (typeActive.value === '1') {
    return await fetchGrList(params);
  } else if (typeActive.value === '2') {
    return await fetchTargetList(params);
  } else if (typeActive.value === '3') {
    return await fetchGoodsList(params);
  }
  return { list: [], hasNextPage: false, total: 0 };
};

const {
  list,
  refreshing,
  loadmoreConfig,
  pullRefreshHeight,
  onRefresh,
  onLoadMore,
  calcPullRefreshHeight,
} = usePagination(
  {
    loadmoreConfig: {
      status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
      loadmoreText: '上拉加载更多',
      loadingText: '努力加载中...',
      nomoreText: '我们是有底线的',
      iconSize: 18,
    },
    pageSize: 10,
    initialPage: 1,
  },
  fetchData
);

// 获取客户列表
const getCustList = async (cust: string) => {
  if (!cust) {
    custList.value = [];
    return;
  }
  custLoading.value = true;
  try {
    const res = await KeyProjectsService.queryGridCustList({ cust });
    if (res.success) {
      custList.value = res.data || [];
    }
  } catch (error) {
    console.error('获取客户列表失败:', error);
  } finally {
    custLoading.value = false;
  }
};

// 选择客户
const onSelectCustomer = async (item: any) => {
  curCustom.value = item;
  searchValue.value = `${item.custId}/${item.custName}`;
  fullPopShow.value = false;

  dataLoading.value = true;
  const success = await getData(item.custId);
  dataLoading.value = false;

  if (success) {
    // 初始化follow数据
    ccuId.value = dataSource.value.ccuId;
    custId.value = item.custId;
    curDept.value = dataSource.value.deptList[0];
    active.value = dataSource.value.deptList[0].deptId;
    onRefresh();
  }
};

// 日期确认
const onConfirmDate = (date: any) => {
  const [start, end] = date;
  showPickerDate.value = false;
  dateRange.value = `${formatSearchDate(start)} 至 ${formatSearchDate(end)}`;
  onRefresh();
};

// 切换部门
const handleClick = () => {
  curDept.value = dataSource.value.deptList.find((item: any) => item.deptId === active.value);
  dataSource.value.saler = curDept.value.userName;
  typeActive.value = '1';
  onRefresh();
};

// 切换状态
const changeStatus = (val: number) => {
  changeStatusBase(val);
  onRefresh();
};

// 完成任务
const finishTarget = async (item: any) => {
  const success = await finishTargetBase(item);
  if (success) {
    onRefresh();
  }
};

// 新增
const toAddPage = () => {
  const type = typeActive.value;
  let url = '';
  const params: any = {
    curDept: JSON.stringify(curDept.value),
    ccuId: ccuId.value,
  };

  if (type === '1') {
    url = '/subpackages/business/key-projects/add-gr';
    params.custId = custId.value;
  } else if (type === '2') {
    url = '/subpackages/business/key-projects/add-target';
  } else if (type === '3') {
    url = '/subpackages/business/key-projects/add-goods';
  }

  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  uni.navigateTo({ url: `${url}?${query}` });
};

// 编辑
const toEdit = (type: number, item: any) => {
  let url = '';
  const params: any = {
    curDept: JSON.stringify(curDept.value),
    ccuId: ccuId.value,
    item: JSON.stringify(item),
  };

  if (type === 1) {
    url = '/subpackages/business/key-projects/add-gr';
    params.custId = custId.value;
  } else if (type === 2) {
    url = '/subpackages/business/key-projects/add-target';
  } else if (type === 3) {
    url = '/subpackages/business/key-projects/add-goods';
  }

  const query = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
  uni.navigateTo({ url: `${url}?${query}` });
};

// 删除
const deleteItem = async (type: number, item: any) => {
  uni.showModal({
    title: '提示',
    content: '确认删除？',
    success: async res => {
      if (res.confirm) {
        let success = false;
        if (type === 1) {
          success = await deleteGrItem(item);
        } else if (type === 2) {
          success = await deleteTargetItem(item);
        } else if (type === 3) {
          success = await deleteGoodsItem(item);
        }
        if (success) {
          onRefresh();
        }
      }
    },
  });
};

// 跳转到网格化管理
const toKeyProjects = () => {
  uni.redirectTo({
    url: `/subpackages/business/key-projects/index?custId=${curCustom.value.custId}&custName=${curCustom.value.custName}`,
  });
};

onLoad((options: any) => {
  if (options.custId) {
    curCustom.value = options;
    searchValue.value = `${options.custId}/${options.custName}`;
    dataLoading.value = true;
    getData(options.custId).then(success => {
      dataLoading.value = false;
      if (success) {
        ccuId.value = dataSource.value.ccuId;
        custId.value = options.custId;
        curDept.value = dataSource.value.deptList[0];
        active.value = dataSource.value.deptList[0].deptId;
      }
    });
  }

  // 检查权限
  const userStore = useUserStore();
  buttonShow.value = userStore.permissions.includes('gridManage');

  calcPullRefreshHeight();
});

onShow(() => {
  if (curCustom.value.custId) {
    onRefresh();
  }
});
</script>

<style lang="scss" scoped>
.gray-block {
  background: #f7f8fa;
  border-radius: 8px;
}
.white-block {
  background: #fff;
}
.box-shadow {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}
.rounded {
  border-radius: 8px;
}
.line-1 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.add-btn {
  width: 30px;
  height: 30px;
  background: #2271f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(34, 113, 245, 0.3);
}
</style>
