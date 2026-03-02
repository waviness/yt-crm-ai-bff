<template>
  <view class="h-full">
    <app-watermark />
    <!-- 搜索栏 -->
    <view class="search-wrap bg-white z-10 sticky top-0">
      <app-search
        v-model="searchValue"
        placeholder="请输入客户ID|名称"
        @input="onSearchInput"
        @focus="onSearchFocus"
        @clear="onClearSearch"
      />
      <!-- 搜索建议列表 -->
      <view
        v-if="showSearchList"
        class="search-list fixed left-0 right-0 bg-white z-20"
        style="top: var(--window-top); margin-top: 54px; bottom: 0; overflow-y: auto"
      >
        <view v-if="custLoading" class="py-4 flex justify-center">
          <up-loading-icon mode="circle"></up-loading-icon>
        </view>
        <template v-else>
          <view v-if="!custList.length" class="py-4 text-center text-gray-400 text-14"
            >暂无数据</view
          >
          <view
            v-else
            v-for="(item, index) in custList"
            :key="index"
            class="p-3 border-b border-gray-100 flex items-center active:bg-gray-50"
            @click="onSelectCustomer(item)"
          >
            <text class="text-14">{{ item.custId }}/{{ item.custName }}</text>
          </view>
        </template>
      </view>
    </view>

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
            <view
              :class="['flex-1 text-14 font-bold', showFullTitle ? '' : 'line-1']"
              :id="`custName_${curCustom.custId}`"
            >
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
            :name="item.type?.[0] || ''"
            type="primary"
            size="small"
            class="mb-1 mr-1"
          />
        </view>
      </view>

      <!-- 部门和业务员信息 -->
      <view class="white-block mt-2 rounded pa-2">
        <app-tabs
          v-if="dataSource.deptList && dataSource.deptList.length > 0"
          :current="currentTabIndex"
          :list="tabList"
          :scrollable="tabList.length > 2"
          @change="onTabChange"
        />
        <view class="flex items-center mt-2">
          <view class="flex-1 flex items-center justify-center pr-2" style="min-width: 0">
            <text class="color-gray text-12" style="white-space: nowrap">业务员</text>
            <text class="font-bold text-14 ml-2" style="white-space: nowrap">{{
              dataSource.saler
            }}</text>
          </view>
          <view class="flex-1 flex items-center justify-center px-2" style="min-width: 0">
            <text class="color-gray text-12" style="white-space: nowrap">领航员</text>
            <text class="font-bold text-14 ml-2" style="white-space: nowrap">{{
              dataSource.pilotName
            }}</text>
          </view>
          <view class="flex-1 flex items-center justify-center pl-2" style="min-width: 0">
            <up-button
              type="primary"
              size="mini"
              text="发送通知"
              style="width: 100%"
              @click="onContact(dataSource.custId)"
            >
              <template #icon>
                <app-icon name="#ytcrm-tongzhi" class="mr-1" />
              </template>
            </up-button>
          </view>
        </view>
      </view>

      <!-- 拜访图表 -->
      <view class="white-block mt-2 rounded pa-2 position-relative">
        <view class="text-14 font-bold mb-2">拜访</view>
        <view class="visit-chart">
          <qiun-data-charts
            type="column"
            :opts="visitChartOpts"
            :chartData="visitChartData"
            :loadingType="infoLoading ? 1 : 0"
          />
        </view>
      </view>

      <!-- 拜访层级图表 -->
      <view class="white-block mt-2 rounded pa-2 position-relative">
        <view class="text-14 font-bold mb-2">拜访层级</view>
        <view class="key-gr">
          <qiun-data-charts
            type="ring"
            :opts="gradeChartOpts"
            :chartData="gradeChartData"
            :loadingType="infoLoading ? 1 : 0"
          />
        </view>
      </view>

      <!-- 热力值 -->
      <view class="white-block mt-2 rounded pa-2 position-relative">
        <view class="text-14 font-bold mb-2">热力值</view>
        <view class="flex items-center justify-around mt-3">
          <view class="text-center">
            <app-tag name="一般客情" type="normal" size="small" />
            <view class="flex justify-center mt-2 font-bold">
              <view class="color-normal text-18 mr-1">{{ dataSource.normal || 0 }}</view>
              <view :class="Number(dataSource.normalUp) > 0 ? 'color-normal' : 'color-never'">
                {{ (Number(dataSource.normalUp) > 0 ? '+' : '') + (dataSource.normalUp || '') }}
              </view>
            </view>
          </view>
          <view class="text-center">
            <app-tag name="需进阶客情" type="advanced" size="small" />
            <view class="flex justify-center mt-2 font-bold">
              <view class="color-main text-18 mr-1">{{ dataSource.lack || 0 }}</view>
              <view :class="Number(dataSource.lackUp) > 0 ? 'color-normal' : 'color-never'">
                {{ (Number(dataSource.lackUp) > 0 ? '+' : '') + (dataSource.lackUp || '') }}
              </view>
            </view>
          </view>
          <view class="text-center">
            <app-tag name="未接触客情" type="never" size="small" />
            <view class="flex justify-center mt-2 font-bold">
              <view class="color-never text-18 mr-1">{{ dataSource.never || 0 }}</view>
              <view :class="Number(dataSource.neverUp) > 0 ? 'color-normal' : 'color-never'">
                {{ (Number(dataSource.neverUp) > 0 ? '+' : '') + (dataSource.neverUp || '') }}
              </view>
            </view>
          </view>
        </view>
        <app-local-loading v-if="infoLoading" />
      </view>

      <!-- 统计表格 -->
      <view class="white-block mt-2 rounded pa-2 position-relative">
        <view class="text-14 font-bold mb-2">统计</view>
        <increase-table :data="dataSource.increaseTableData" />
        <app-local-loading v-if="infoLoading" />
      </view>

      <!-- 最新话题 -->
      <view class="white-block mt-2 rounded pa-2">
        <view class="flex justify-between items-center mb-2" @click="showMore">
          <view class="text-14 font-bold">最新话题</view>
          <uni-icons type="right" size="18" color="#969799" />
        </view>
        <app-empty v-if="!topicLoading && !topicList.length" description="暂无相关话题" />
        <view v-else id="topicPullContainer">
          <app-pull-refresh
            :refreshing="refreshing"
            :loadmoreProps="loadmoreConfig"
            :pullRefreshHeight="pullRefreshHeight"
            @refresh="onRefreshTopic"
            @loadmore="onLoadMoreTopic"
          >
            <topic-item v-for="(item, index) in topicList" :key="index" :data="item" class="mb-2" />
          </app-pull-refresh>
        </view>
      </view>

      <!-- 工作跟进按钮 -->
      <app-fix-btn text="工作跟进" icon="gongzuoliu" @click="toWorkFollow" />
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import { useKeyProjects } from './composables/use-key-projects';
import { KeyProjectsService } from '@/api/key-projects';
import { usePagination } from '@/composables/use-pagination';
import IncreaseTable from './components/increase-table.vue';
import TopicItem from './components/topic-item.vue';
import QiunDataCharts from '@/subpackages/dashboard/uni_modules/qiun-data-charts/components/qiun-data-charts/qiun-data-charts.vue';

const {
  curCustom,
  dataSource,
  active,
  infoLoading,
  topicList,
  showFullTitle,
  titleOverflow,
  nopermit,
  getData,
  getSaleInfo,
  handleDeptChange: handleDeptChangeBase,
  onContact,
} = useKeyProjects();

const searchValue = ref('');
const isSearching = ref(false);
const lockSearch = ref(false); // 搜索锁定标志，防止自动填充时触发搜索
const showSearchList = computed(() => isSearching.value && searchValue.value);
const custLoading = ref(false);
const custList = ref<any[]>([]);

// 搜索输入
const onSearchInput = (val: string) => {
  if (lockSearch.value) {
    lockSearch.value = false;
    return;
  }
  searchValue.value = val;
  if (!val) {
    custList.value = [];
    isSearching.value = false;
    return;
  }
  isSearching.value = true;
  // 防抖处理
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    getCustList(val);
  }, 300);
};

// 搜索聚焦
const onSearchFocus = () => {
  if (lockSearch.value) return;
  if (searchValue.value) {
    isSearching.value = true;
  }
};

let timer: any = null;

// 清空搜索
const onClearSearch = () => {
  searchValue.value = '';
  custList.value = [];
  isSearching.value = false;
};

// 话题列表分页
const topicLoading = ref(false);
const refreshing = ref(false);
const topicPage = ref(1);
const topicFinished = ref(false);
const pullRefreshHeight = ref('300px');

const loadmoreConfig = ref({
  status: 'loadmore' as 'loadmore' | 'loading' | 'nomore',
  loadmoreText: '上拉加载更多',
  loadingText: '努力加载中...',
  nomoreText: '我们是有底线的',
  iconSize: 18,
});

// u-charts配置 - 拜访图表
const visitChartOpts = ref({
  color: ['#73A0FA', '#F7C739'],
  padding: [15, 15, 0, 5],
  enableScroll: false,
  dataLabel: true,
  legend: {
    show: true,
    position: 'top',
    float: 'right',
    padding: 5,
    margin: 5,
    itemGap: 10,
  },
  xAxis: {
    disableGrid: true,
  },
  yAxis: {
    disabled: true,
    disableGrid: true,
  },
  extra: {
    column: {
      type: 'group',
      width: 30,
      activeBgColor: '#000000',
      activeBgOpacity: 0.08,
      seriesGap: 2,
      categoryGap: 3,
    },
  },
});

const visitChartData = computed(() => {
  return {
    categories: ['个人拜访', '领导协访'],
    series: [
      {
        name: '目标次数 次/月',
        data: [dataSource.value.personVisitTarget || 0, dataSource.value.leaderVisitTarget || 0],
      },
      {
        name: '当月次数 次/月',
        data: [dataSource.value.personVisitTimes || 0, dataSource.value.leaderVisitTimes || 0],
      },
    ],
  };
});

// u-charts配置 - 拜访层级图表
const gradeChartOpts = ref({
  color: ['#F7C739', '#73A0FA', '#73DEB3', '#7585A2'],
  padding: [5, 5, 5, 5],
  enableScroll: false,
  dataLabel: false,
  legend: {
    show: true,
    position: 'right',
    lineHeight: 25,
  },
  extra: {
    ring: {
      ringWidth: 30,
      activeOpacity: 0.5,
      activeRadius: 10,
      offsetAngle: 0,
      labelWidth: 15,
      border: true,
      borderWidth: 3,
      borderColor: '#FFFFFF',
    },
  },
});

const gradeChartData = computed(() => {
  return {
    series: [
      {
        data: dataSource.value.gradeData || [],
      },
    ],
  };
});

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
  lockSearch.value = true; // 锁定搜索，防止赋值触发 input/focus 事件
  curCustom.value = item;
  searchValue.value = `${item.custId}/${item.custName}`;
  isSearching.value = false; // 关闭搜索建议列表
  custList.value = []; // 清空搜索列表，确保 v-if 逻辑正确
  uni.hideKeyboard(); // 隐藏软键盘，使搜索栏失去焦点

  // 延迟解锁，以防宏任务中的事件触发
  setTimeout(() => {
    lockSearch.value = false;
  }, 500);

  const success = await getData(item.custId);
  if (success) {
    checkTitleOverflow();
    onRefreshTopic();
  }
};

// 刷新话题列表
const onRefreshTopic = () => {
  topicFinished.value = false;
  topicLoading.value = true;
  topicList.value = [];
  topicPage.value = 1;
  getTopicList();
};

// 加载更多话题
const onLoadMoreTopic = () => {
  if (!topicFinished.value && !topicLoading.value) {
    getTopicList();
  }
};

// 获取话题列表
const getTopicList = async () => {
  if (!curCustom.value.custId) return;

  topicLoading.value = true;
  loadmoreConfig.value.status = 'loading';

  try {
    const res = await KeyProjectsService.queryTopic({
      custId: curCustom.value.custId,
      pageNum: topicPage.value,
      pageSize: 10,
    });

    if (res.success) {
      topicList.value = [...topicList.value, ...(res.data.list || [])];
      topicFinished.value = !res.data.hasNextPage;
      topicPage.value++;
      loadmoreConfig.value.status = topicFinished.value ? 'nomore' : 'loadmore';
    }
  } catch (error) {
    console.error('获取话题列表失败:', error);
    loadmoreConfig.value.status = 'loadmore';
  } finally {
    topicLoading.value = false;
    refreshing.value = false;
  }
};

// Tabs配置与切换
const tabList = computed(() => {
  return (dataSource.value.deptList || []).map((item: any) => ({
    name: item.deptName,
    ...item,
  }));
});

const currentTabIndex = computed(() => {
  if (!tabList.value.length) return 0;
  const index = tabList.value.findIndex((item: any) => item.deptId === active.value);
  return index > -1 ? index : 0;
});

const onTabChange = ({ index }: { index: number }) => {
  const item = tabList.value[index];
  if (item) {
    active.value = item.deptId;
    handleDeptChangeBase();
  }
};

// 跳转到工作跟进
const toWorkFollow = () => {
  uni.navigateTo({
    url: `/subpackages/business/key-projects/follow?custId=${curCustom.value.custId}&custName=${curCustom.value.custName}`,
  });
};

// 查看更多话题
const showMore = () => {
  uni.navigateTo({
    url: `/subpackages/business/key-projects/topic?personVisit=${encodeURIComponent(
      JSON.stringify(dataSource.value.personVisit || [])
    )}&leaderVisit=${encodeURIComponent(JSON.stringify(dataSource.value.leaderVisit || []))}`,
  });
};

// 检查标题是否溢出
const checkTitleOverflow = () => {
  nextTick(() => {
    const query = uni.createSelectorQuery();
    query
      .select(`#custName_${curCustom.value.custId}`)
      .boundingClientRect((data: any) => {
        if (data) {
          // 注意: scrollWidth在uniapp中可能不可用,这里简化处理
          titleOverflow.value = false;
        }
      })
      .exec();
  });
};

// 计算下拉刷新高度
const calcPullRefreshHeight = () => {
  nextTick(() => {
    const windowInfo = uni.getWindowInfo();
    const query = uni.createSelectorQuery();
    query
      .select('#topicPullContainer')
      .boundingClientRect((data: any) => {
        if (!data) return;
        const bottomReserve = 120;
        const height = Math.max(220, windowInfo.windowHeight - data.top - bottomReserve);
        pullRefreshHeight.value = `${height}px`;
      })
      .exec();
  });
};

onLoad((options: any) => {
  if (options.custId) {
    curCustom.value = options;
    searchValue.value = `${options.custId}/${options.custName}`;
    // onLoad 时设置个标记，onShow 就不用再调了
    curCustom.value._loaded = true;
    getData(options.custId).then(success => {
      if (success) {
        checkTitleOverflow();
        onRefreshTopic();
      }
    });
  }
  calcPullRefreshHeight();
});

onShow(() => {
  if (curCustom.value.custId) {
    // 只有非 onLoad 触发的（比如从下一页返回）才刷新
    if (curCustom.value._loaded) {
      delete curCustom.value._loaded; // 消费掉标记
      return;
    }
    getData(curCustom.value.custId);
    onRefreshTopic();
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
.visit-chart {
  width: 100%;
  height: 420rpx;
}
.key-gr {
  width: 100%;
  height: 356rpx;
}
.line-1 {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* stylelint-disable-next-line selector-class-pattern */
:deep(.u-tabs__wrapper__nav__item-active .u-tabs__wrapper__nav__item__text) {
  font-weight: 700 !important;
}
</style>
