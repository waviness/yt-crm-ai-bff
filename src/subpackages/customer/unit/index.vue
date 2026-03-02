<script setup lang="ts">
import CustomerFilterPop from './components/customer-filter-pop.vue';
import { useUnitDictionary } from './composables/use-unit-dictionary';

const userStore = useUserStore();
const appStore = useAppStore();
const departmentStore = useDepartmentStore();

// 部门用户相关状态（使用 store 中的 hasDept）
const hasDept = computed(() => departmentStore.hasDept);
const checkedUsers = ref<any[]>([]);
const changeTypeShow = ref(false);
const filterShow = ref(false);
const filterActive = ref(false);

// 使用分页 composable
const { list, totalNum, paginationLoading, resetAndFetchData, loadMore } =
  useSimplePagination<any>(10);

// 使用字典 composable
const { hosTypeList, saleTypeList, learnTypeList, roleTypeList, getSearchList } =
  useUnitDictionary();

// Refs
const deptUserRef = ref();
const value = ref(1); // 1: 本人, 2: 已选人员

// 筛选条件
interface FilterObj {
  custom: string; // 客户名称|ID
  hospitalLevel: string; // 医院等级
  yearSalesVolume: string; // 销售规模
  scienceLine: string; // 学术专线
  isProfit: string; // 科室角色
}

const filterVal = ref<FilterObj>({
  custom: '',
  hospitalLevel: '',
  yearSalesVolume: '',
  scienceLine: '',
  isProfit: '',
});

const isProfitList = ref<any[]>([
  { value: 1, name: '政府办' },
  { value: 2, name: '非政府办营利' },
  { value: 3, name: '非政府办非营利' },
]);

// 权限
const canEdit = ref(false);

/**
 * 获取数据列表
 */
const fetchDataList = async ({ pageNum, pageSize }: { pageNum: number; pageSize: number }) => {
  const { custom, hospitalLevel, yearSalesVolume, scienceLine, isProfit } = filterVal.value;
  const params: any = {
    type: value.value,
    custom,
    hospitalLevel,
    yearSalesVolume,
    scienceLine,
    isProfit,
    pageNum,
    pageSize,
  };
  if (value.value === 2) {
    params.userList = checkedUsers.value;
  }
  const res = await CustomerService.queryCustomInfoList(params);
  const tempList: any[] = [];
  const dataList = res.list || [];
  dataList.forEach((ele: any) => {
    if (ele.custExbandInfoVOList && ele.custExbandInfoVOList.length) {
      const target = ele.custExbandInfoVOList.find((item: any) => !item.isShare);
      if (target) {
        const temp = Object.assign({}, ele, target);
        tempList.push(temp);
      } else {
        tempList.push(ele);
      }
      ele.custExbandInfoVOList.forEach((item: any) => {
        if (!target || item.cceId !== target.cceId) {
          const temp = Object.assign({}, ele, { hasNoOpts: true }, item);
          tempList.push(temp);
        }
      });
    } else {
      const temp = Object.assign(
        {
          personNum: 0,
          warmthPersonNum: 0,
          creId: userStore.userInfor?.userId,
          creName: userStore.userInfor?.userName,
        },
        ele
      );
      tempList.push(temp);
    }
  });
  return {
    list: tempList,
    total: res.total || 0,
  };
};

/**
 * 筛选确认
 */
const onConfirm = (filterValData: FilterObj) => {
  const { custom, hospitalLevel, yearSalesVolume, scienceLine, isProfit } = filterValData;
  if (custom || hospitalLevel || yearSalesVolume || scienceLine || isProfit) {
    filterActive.value = true;
  } else {
    filterActive.value = false;
  }
  filterVal.value = filterValData;
  filterShow.value = false;
  resetAndFetchData(fetchDataList);
};

/**
 * 部门用户选择确认
 */
const onTreeConfirm = (list: any[]) => {
  changeTypeShow.value = false;
  value.value = 2;
  checkedUsers.value = list;
  resetAndFetchData(fetchDataList);
};

/**
 * 跳转到详情页
 */
const toDetail = (item: any, type: number) => {
  item.onlyRead =
    value.value === 2 && (!canEdit.value || item.creId !== userStore.userInfor?.userId);
  appStore.setDetailObj(item);
  appStore.setHadDoneOnDetail(false);
  router.push(RouteMap.customerUnitDetail, {
    type: String(type),
  });
};

/**
 * 跳转到分享页
 */
const toShare = (item: any) => {
  appStore.setHadDoneOnDetail(false);
  appStore.setDetailObj(item);
  router.push(RouteMap.customerUnitShare, {
    shareType: '1',
  });
};

/**
 * 跳转到人员维护页
 */
const toPerson = (item: any, type: number) => {
  // 1人员维护 2查看
  if (!item.orgRoleId) {
    showToast('请先维护科室角色，再新增人员信息');
    return;
  }
  item.onlyRead = type === 2;
  appStore.setHadDoneOnDetail(false);
  appStore.setDetailObj(item);
  router.push(RouteMap.customerUnitPerson);
};

/**
 * 切换到本人数据
 */
const toSelfData = () => {
  value.value = 1;
  resetAndFetchData(fetchDataList);
};

/**
 * 初始化部门树（用于设置 hasDept）
 * 使用 store 中的逻辑，如果不存在或为空则获取
 */
const initDeptTree = async () => {
  // 使用 store 初始化部门树（如果不存在或为空则获取）
  await departmentStore.initDepTree({ treeType: 1, authorizedFlag: true });
  // hasDept 通过 computed 自动从 store 获取
};

/**
 * 初始化
 */
const init = async () => {
  await getSearchList();
  // 使用 hasPermission 方法检查权限
  canEdit.value = hasPermission('CustomerUnitEditWx');
  // 初始化部门树以设置 hasDept
  await initDeptTree();
  resetAndFetchData(fetchDataList);
};

// 生命周期
onMounted(() => {
  init();
});

onShow(() => {
  if (appStore.hadDoneOnDetail) {
    resetAndFetchData(fetchDataList);
    appStore.setHadDoneOnDetail(false);
  }
});

// 上拉加载更多
onReachBottom(() => {
  loadMore(fetchDataList);
});
</script>

<template>
  <view class="pb-100">
    <app-watermark> </app-watermark>
    <!-- 顶部固定区域 -->
    <up-sticky style="top: 0">
      <customer-filter-pop
        :hosTypeList="hosTypeList"
        :saleTypeList="saleTypeList"
        :learnTypeList="learnTypeList"
        :roleTypeList="roleTypeList"
        :isProfitList="isProfitList"
        :filterActive="filterActive"
        :hasDept="hasDept"
        :value="value"
        :checkedUsers="checkedUsers"
        :changeTypeShow="changeTypeShow"
        @confirm="onConfirm"
        @update:value="value = $event"
        @update:checkedUsers="checkedUsers = $event"
        @update:changeTypeShow="changeTypeShow = $event"
        @treeConfirm="onTreeConfirm"
      />
    </up-sticky>

    <!-- 列表内容 -->
    <view class="px-10">
      <view
        v-for="(item, idx) in list"
        :key="idx"
        @click="toDetail(item, 1)"
        class="mb-2 bg-light-gray-2 rounded-10rpx shadow-view"
      >
        <view class="p-10 rounded-10rpx flex justify-between bg-white">
          <view class="font-bold">
            <view>{{ item.custId }}/</view>
            <view>{{ item.custName || '' }}</view>
          </view>
          <view class="flex flex-col justify-between ml-90px min-w-fit">
            <view class="font-bold text-right">{{ item.hospitalLevel || '' }}</view>
            <view class="flex items-baseline mt-1">
              <text class="mr-2">维护人</text>
              <text class="font-bold color-gray-4">{{
                item.cceId && item.creName ? item.creName : '暂未维护'
              }}</text>
            </view>
          </view>
        </view>
        <view v-if="!item.isShare" class="flex justify-between p-10">
          <text>已维护人数</text>
          <text class="font-bold color-main">{{ item.personNum }}</text>
        </view>
        <view v-if="!item.isShare" class="flex justify-between px-10 pt-1 pb-2">
          <text>一般客情热力值</text>
          <text class="font-bold color-success">{{ item.warmthPersonNum }}</text>
        </view>
        <view class="h-1px bg-gray-12"></view>
        <view v-if="!item.hasNoOpts && value === 1" class="p-10 flex justify-end">
          <up-button
            type="primary"
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toDetail(item, 2)"
          >
            编辑
          </up-button>
          <up-button
            v-if="item.cceId && !item.isShare"
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toShare(item)"
          >
            分享至
          </up-button>
          <up-button
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toPerson(item, 1)"
          >
            人员维护
          </up-button>
        </view>
        <view v-else-if="value === 2" class="p-10 flex justify-end">
          <up-button
            v-if="canEdit && item.creId === userStore.userInfor?.userId"
            type="primary"
            shape="circle"
            class="mx-0 ml-3 px-10 w-auto!"
            size="small"
            @click.stop="toDetail(item, 2)"
          >
            编辑
          </up-button>
          <up-button
            v-if="
              canEdit && item.creId === userStore.userInfor?.userId && item.cceId && !item.isShare
            "
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toShare(item)"
          >
            分享至
          </up-button>
          <up-button
            v-if="canEdit && item.creId === userStore.userInfor?.userId"
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toPerson(item, 1)"
          >
            人员维护
          </up-button>
          <up-button
            v-else
            shape="circle"
            size="small"
            class="mx-0 ml-3 px-10 w-auto!"
            @click.stop="toPerson(item, 2)"
          >
            查看人员
          </up-button>
        </view>
      </view>
      <app-empty v-if="!paginationLoading && !list.length" class="py-7" description="暂无数据" />
      <up-loadmore
        v-if="paginationLoading || list.length < totalNum"
        :status="paginationLoading ? 'loading' : list.length >= totalNum ? 'nomore' : 'loadmore'"
      />
    </view>

    <!-- 本人按钮 -->
    <app-fix-btn v-if="value === 2 && hasDept" text="本人" icon="juxing1" @click="toSelfData" />
  </view>
</template>
