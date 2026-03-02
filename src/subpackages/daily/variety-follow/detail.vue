<template>
  <view>
    <app-watermark> </app-watermark>
    <!-- 头部固定 -->
    <up-sticky style="top: 0" bg-white>
      <varietyFollowList :itemObj="tableTopObj" :type="type" :arrowShow="false" />
    </up-sticky>

    <view class="pa-2 bg-white">
      <!-- 搜索框 -->
      <up-search
        v-model="searchValue"
        :placeholder="`按${type === 0 ? '厂牌名称' : '客户名称'}|品种名称搜索`"
        shape="round"
        @search="init"
        @clear="init"
      />

      <!-- 表格区域 -->
      <view class="table-warp bg-white mt-2">
        <view class="table-header">
          <view class="header-1 text-14">{{ type === 0 ? '厂牌名称' : '客户名称' }}</view>
          <view class="header-2 text-14">品种名称</view>
          <view class="header-3 text-14">最后一次填报状态</view>
        </view>
        <app-empty v-if="!tableData.length" class="mt-7" description="暂无数据" size="200rpx" />
        <view
          v-for="(item, index) in tableData"
          :key="
            type === 0 ? `brand-${item.brandName}-${index}` : `custom-${item.customId}-${index}`
          "
          class="table-row"
        >
          <view class="content-1 text-14">
            {{ type === 0 ? item.brandName : item.customName }}
          </view>
          <view class="content-right">
            <view
              v-for="(variety, vIndex) in item.children"
              :key="`goods-${vIndex}`"
              class="w-full py-2 flex"
              :class="Number(vIndex) % 2 === 0 ? 'bg-gray-10' : ''"
              @click="handleClick(variety, item)"
            >
              <view class="content-2 text-14">{{ variety.goodsName }}</view>
              <view
                class="content-3 text-14"
                :class="
                  variety.lastFillStatus === 1
                    ? 'color-success'
                    : variety.lastFillStatus === 2
                      ? 'color-red'
                      : variety.lastFillStatus === 3
                        ? 'color-main'
                        : ''
                "
              >
                {{
                  variety.lastFillStatus === 1
                    ? '医院已完成'
                    : variety.lastFillStatus === 2
                      ? '医院未完成'
                      : variety.lastFillStatus === 3
                        ? '医院报量未知'
                        : '待填报'
                }}
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 分页 -->
      <view v-if="tableData.length > 0" class="py-4 bg-white mt-2">
        <up-pagination
          :current-page="pageParams.currentPage"
          :page-size="pageParams.pageSize"
          :total="pageParams.total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
        />
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import varietyFollowList from './compontents/variety-follow-list.vue';

const varietyFollowStore = useVarietyFollowStore();
const tableTopObj = computed(() => varietyFollowStore.tableTopObj);
const pcObj = computed(() => varietyFollowStore.pcObj);

// 从路由获取 type
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];
const routeQuery = (currentPage as any).options || {};
const type = ref<number>(+(routeQuery.type || 0));

const tableData = ref<any[]>([]);
const searchValue = ref('');
const pageParams = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 查询按品牌分组的数据（type === 0）
const _queryCustomBrandFillList = async () => {
  try {
    const res = await varietyFollowService.queryCustomBrandFillList({
      cgtcId: pcObj.value.cgtcId,
      customId: tableTopObj.value.customId,
      pageNum: pageParams.currentPage,
      pageSize: pageParams.pageSize,
      search: searchValue.value,
    });

    pageParams.total = res.data.total || 0;

    if (+res.code === 200) {
      const originalList = res.data.list || [];
      const transformedData: any[] = [];
      const brandMap = new Map();

      originalList.forEach((item: any) => {
        const { brandName, cgtformId, goodsFlag, goodsName, goodsType, lastFillStatus } = item;

        if (!brandMap.has(brandName)) {
          brandMap.set(brandName, {
            brandName,
            children: [],
          });
        }

        brandMap.get(brandName).children.push({
          cgtformId,
          goodsName,
          goodsType,
          goodsFlag,
          lastFillStatus,
          waitReportCount: lastFillStatus === 1 ? 1 : 0,
        });
      });

      brandMap.forEach(brand => {
        transformedData.push(brand);
      });

      tableData.value = transformedData;
    }
  } catch (error: any) {
    showError(error.msg || '获取数据失败');
  }
};

// 查询按客户分组的数据（type === 1）
const _queryBrandCustomFillList = async () => {
  try {
    const res = await varietyFollowService.queryBrandCustomFillList({
      brandName: tableTopObj.value.brandName,
      pageNum: pageParams.currentPage,
      pageSize: pageParams.pageSize,
      search: searchValue.value,
      cgtcId: pcObj.value.cgtcId,
    });

    pageParams.total = res.data.total || 0;

    if (+res.code === 200) {
      const originalList = res.data.list || [];
      const transformedData: any[] = [];
      const customerMap = new Map();

      originalList.forEach((item: any) => {
        const { customId, customName, goodsFlag, cgtformId, goodsName, goodsType, lastFillStatus } =
          item;

        if (!customerMap.has(customId)) {
          customerMap.set(customId, {
            customId,
            customName,
            children: [],
          });
        }

        customerMap.get(customId).children.push({
          cgtformId,
          goodsName,
          goodsType,
          goodsFlag,
          lastFillStatus,
          waitReportCount: lastFillStatus === 1 ? 1 : 0,
        });
      });

      customerMap.forEach(customer => {
        transformedData.push(customer);
      });

      tableData.value = transformedData;
    }
  } catch (error: any) {
    showError(error.msg || '获取数据失败');
  }
};

// 分页变化
const handlePageChange = (page: number) => {
  console.log('page', page);
  pageParams.currentPage = page;
  init();
};

// 点击行
const handleClick = (variety: any, item: any) => {
  varietyFollowStore.setOpTopObj(
    type.value === 0
      ? {
          ...variety,
          brandName: item.brandName,
          customId: tableTopObj.value.customId,
          customName: tableTopObj.value.customName,
          type: type.value,
        }
      : {
          ...variety,
          brandName: tableTopObj.value.brandName,
          customId: item.customId,
          customName: item.customName,
          type: type.value,
        }
  );

  uni.navigateTo({
    url: '/subpackages/daily/variety-follow/op-detail',
  });
};

// 初始化
const init = () => {
  if (type.value === 0) {
    _queryCustomBrandFillList();
  } else {
    _queryBrandCustomFillList();
  }
};

// 页面进入时的逻辑（对应 beforeRouteEnter）
onMounted(() => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    const prevPage = pages[pages.length - 2];
    const prevRoute = prevPage?.route || '';

    if (prevRoute.includes('variety-follow') && !prevRoute.includes('table-detail')) {
      // 从 varietyFollow 进入
      searchValue.value = '';
      pageParams.currentPage = 1;
      pageParams.pageSize = 10;
      pageParams.total = 0;

      init();
    } else if (prevRoute.includes('op-detail')) {
      // 从 opDetail 返回
      init();
    } else {
      init();
    }
  } else {
    init();
  }
});
</script>

<style lang="scss" scoped>
.table-warp {
  min-width: 100%;
  overflow-x: auto;
  border-radius: 16rpx;

  .table-header {
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    background-color: #f5f6f9;
    min-width: fit-content;

    .header-1 {
      width: 30%;
      min-width: 280rpx;
      text-indent: 20rpx;
    }

    .header-2 {
      width: 33%;
      min-width: 260rpx;
      text-indent: 20rpx;
    }

    .header-3 {
      width: 37%;
      min-width: 280rpx;
      text-align: right;
    }
  }

  .table-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e5e5e5;
    min-width: fit-content;

    .content-1 {
      padding-left: 20rpx;
      width: 30%;
      min-width: 280rpx;
      text-indent: 20rpx;
      height: fit-content;
    }

    .content-right {
      min-width: 540rpx;
      width: 70%;
      text-indent: 20rpx;
      height: fit-content;
    }

    .content-2 {
      width: 53%;
      min-width: 260rpx;
    }

    .content-3 {
      text-align: right;
      min-width: 240rpx;
      padding-right: 20rpx;
      width: 47%;
    }
  }
}
</style>
