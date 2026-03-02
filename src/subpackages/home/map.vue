<template>
  <view class="customer-situation-map pos-relative">
    <!-- 顶部日期选择栏 -->
    <view class="top-bar" @click="calendarRef.open()">
      <view class="icon d-flex align-center justify-center">
        <app-icon name="a-rili_calendar-thirty-two2" size="24" color="#fff" />
      </view>
      <view class="date">{{ startTime }}至{{ endTime }}</view>
    </view>

    <!-- H5端：高德地图容器 -->
    <!-- #ifdef H5 -->
    <view id="map" class="map-container"></view>
    <!-- #endif -->

    <!-- 小程序端：官方map组件 -->
    <!-- #ifdef MP-WEIXIN -->
    <view class="map-container relative overflow-hidden">
      <map
        :latitude="mapCenterLat"
        :longitude="mapCenterLng"
        :scale="10"
        :markers="markers"
        @markertap="onMpMarkerTap"
        style="width: 100%; height: 100%"
      ></map>
      <!-- 覆盖地图logo -->
      <cover-view
        class="absolute right-0 bottom-0"
        style="
          width: 180rpx;
          height: 80rpx;
          background: rgb(255 255 255 / 80%);
          backdrop-filter: blur(4px);
          border-top-left-radius: 8px;
        "
      ></cover-view>
    </view>
    <!-- #endif -->

    <!-- 底部信息卡片 -->
    <view v-if="selectedStation.address" class="station-info">
      <view class="flex items-center">
        <view class="font-bold text-16">{{ selectedStation.address }}</view>
      </view>
      <view class="d-flex align-center pt-1">
        <up-tag
          :text="selectedStation.userName"
          type="primary"
          plain
          plainFill
          borderColor="transparent"
        ></up-tag>
        <view class="color-gray-4 pl-2 pb-2">{{ selectedStation.creDate }}</view>
      </view>
    </view>

    <!-- 底部搜索栏 -->
    <view class="bottom-search" @click="searchPersonClick">
      <up-search class="flex-1" shape="round" placeholder="请输入搜索关键词" />
      <view class="change-button flex items-center justify-center" @click.stop="insertListClick">
        <app-icon name="bianzu2" size="24" color="#fff" />
      </view>
    </view>

    <!-- 人员筛选弹窗 -->
    <up-popup
      :show="searchPersonFlag"
      round="16"
      position="bottom"
      :customStyle="{ height: '90vh' }"
    >
      <view class="popup-search">
        <up-search
          class="flex-1"
          @search="searchUser"
          @clear="searchUser('')"
          v-model="searchVal"
          shape="round"
          placeholder="请输入搜索关键词"
        />
        <view class="change-button flex items-center justify-center" @click.stop="insertListClick">
          <app-icon name="bianzu2" size="24" color="#fff" />
        </view>
      </view>
      <view class="popup-content">
        <up-radio-group class="pb-100" v-model="personRadio">
          <up-cell-group>
            <up-cell title="全部" clickable @click="personClick('')">
              <template #right-icon>
                <up-icon color="#3561F2" v-if="personRadio === ''" name="checkmark" />
              </template>
            </up-cell>
            <up-cell
              v-for="(user, index) in userList"
              :key="index"
              :title="`${user.userId}/${user.userName}`"
              clickable
              @click="personClick(user)"
            >
              <template #right-icon>
                <up-icon color="#3561F2" v-if="personRadio === user.userId" name="checkmark" />
              </template>
            </up-cell>
          </up-cell-group>
        </up-radio-group>
      </view>
      <app-bottom-actions>
        <up-button size="small" shape="circle" plain @click="searchPersonFlag = false"
          >取消</up-button
        >
        <up-button
          size="small"
          color="#2271F5"
          type="info"
          @click="userSure"
          native-type="submit"
          shape="circle"
          >确定</up-button
        >
      </app-bottom-actions>
    </up-popup>

    <!-- 日期选择弹窗 -->
    <app-calendar ref="calendarRef" :endDate="maxDate" mode="range" @confirm="calendarConfirm" />
  </view>
</template>

<script setup lang="ts">
const { initAMap } = useAmapLocation(); // 复用H5端的AMap初始化
// 静态资源路径（使用公共工具函数）
const staticImagePath = getStaticImageDir('images');
// ========== 响应式数据 ==========
// 地图核心
const map = ref<any>(null); // H5地图实例
const stations = ref<any[]>([]); // 接口返回的点位数据
const markers = ref<any[]>([]); // 小程序端marker列表
const selectedStation = ref({
  address: '',
  userName: '',
  creDate: '',
  cciId: 0,
  longitude: '',
  latitude: '',
});
const activeMarkerId = ref<number | null>(null);
const shownLabelIds = ref<Set<number>>(new Set()); // H5端标签显示状态

// 业务筛选
const searchPersonFlag = ref(false);
const personRadio = ref<any>('');
const personObj = ref<any>({});
const searchVal = ref('');
const userList = ref<any[]>([]);
const userListMiddle = ref<any[]>([]);

// 日期相关
const calendarRef = ref();
const maxDate = ref(time.format(time.add(new Date(), 0, 'year'), time.FORMATS.ISO_DATE));
const startTime = ref(time.format(time.add(new Date(), -5, 'day'), time.FORMATS.ISO_DATE));
const endTime = ref(time.format(new Date(), time.FORMATS.ISO_DATE));

// 地图中心点（基于返回数据的第一个点位）
const mapCenterLng = computed(() => {
  return stations.value.length > 0 ? stations.value[0].longitude : 120.15507;
});
const mapCenterLat = computed(() => {
  return stations.value.length > 0 ? stations.value[0].latitude : 30.274085;
});

// ========== 核心方法 ==========
/**
 * 初始化地图（H5+小程序）
 * @param center 中心点经纬度 [lng, lat]
 */
const initMap = async (center: any = [120.15507, 30.274085]) => {
  // 重置选中状态
  selectedStation.value = {
    address: '',
    userName: '',
    creDate: '',
    cciId: 0,
    longitude: '',
    latitude: '',
  };
  activeMarkerId.value = null;
  shownLabelIds.value.clear();

  // #ifdef H5
  try {
    const AMap = await initAMap(); // 复用的H5端AMap初始化
    if (!AMap) return;

    // 创建H5地图实例
    map.value = new AMap.Map('map', {
      resizeEnable: true,
      center: center,
      zoom: 10,
      mapStyle: 'amap://styles/whitesmoke',
    });
    map.value.setStatus({ scrollWheel: true });

    // 添加H5端Marker
    addH5Markers(AMap);
  } catch (err) {
    console.error('H5地图初始化失败:', err);
    showError('地图加载失败，请刷新重试');
  }
  // #endif

  // #ifdef MP-WEIXIN
  // 小程序端直接生成marker列表（无需定位）
  addMpMarkers();
  // #endif
};

/**
 * H5端添加Marker
 */
const addH5Markers = (AMap: any) => {
  console.log(map.value);
  console.log(stations.value);
  if (!map.value || stations.value.length === 0) return;

  // 清空原有marker
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];

  // 添加新marker
  stations.value.forEach(station => {
    const marker = new AMap.Marker({
      position: [station.longitude, station.latitude],
      title: station.userName,
      icon: `${staticImagePath}/dot.svg`,
      label: {
        content: `<div class="custom-marker" style="display: none"></div>`,
        offset: new AMap.Pixel(-55, -60),
      },
    });

    // 绑定点击事件
    marker.on('click', () => handleH5MarkerClick(marker, station));
    marker.setMap(map.value);
    markers.value.push(marker);
  });
};

/**
 * 小程序端添加Marker
 */
const addMpMarkers = () => {
  if (stations.value.length === 0) return;

  // 生成小程序规范的marker列表

  markers.value = stations.value.map(station => ({
    id: station.cciId,
    longitude: Number(station.longitude),
    latitude: Number(station.latitude),
    title: station.userName,
    iconPath: `${staticImagePath}/dot.svg`,
    width: 32,
    height: 32,
    // 小程序端点击显示callout（替代H5的label）
    callout: {
      content: `${station.userName}\n${station.creDate}`,
      color: '#fff',
      fontSize: 12,
      borderRadius: 8,
      bgColor: '#3561f2',
      padding: 8,
      display: 'BYCLICK',
      textAlign: 'left',
    },
    zIndex: 10,
  }));
};

/**
 * H5端Marker点击事件
 */
const handleH5MarkerClick = (marker: any, station: any) => {
  const AMap = (window as any).AMap;
  if (!AMap) return;

  // 隐藏其他marker的标签
  markers.value.forEach(m => {
    if (m !== marker) {
      m.setLabel({
        content: `<div class="custom-marker" style="display: none"></div>`,
        offset: new AMap.Pixel(-55, -60),
      });
    }
  });

  shownLabelIds.value.clear();

  nextTick(() => {
    if (shownLabelIds.value.has(station.cciId)) {
      // 隐藏当前标签
      marker.setLabel({
        content: `<div class="custom-marker" style="display: none"></div>`,
        offset: new AMap.Pixel(-55, -60),
      });
      shownLabelIds.value.delete(station.cciId);
      selectedStation.value = {
        address: '',
        userName: '',
        creDate: '',
        cciId: 0,
        longitude: '',
        latitude: '',
      };
    } else {
      // 显示当前标签
      marker.setLabel({
        content: `<div class="custom-marker">
          <div class="marker-title">${station.userName}</div>
          <div class="marker-price pt-1">${station.creDate}</div>
        </div>`,
        offset: new AMap.Pixel(-55, -60),
      });
      shownLabelIds.value.add(station.cciId);
      selectedStation.value = station;
    }

    // Marker置顶
    marker.setTop(true);
    activeMarkerId.value = station.cciId;
  });
};

/**
 * 小程序端Marker点击事件
 */
const onMpMarkerTap = (e: any) => {
  const markerId = e.detail.markerId;
  const station = stations.value.find(item => item.cciId === markerId);

  if (station) {
    selectedStation.value = station;
    activeMarkerId.value = markerId;
  }
};

/**
 * 业务1：显示所有Marker标签（仅H5端）
 */
const showLabelsForBusiness1 = () => {
  // 关闭弹窗
  searchPersonFlag.value = false;
  // ========== 新增：重置选中状态 ==========
  selectedStation.value = {
    address: '',
    userName: '',
    creDate: '',
    cciId: 0,
    longitude: '',
    latitude: '',
  };
  activeMarkerId.value = null;
  shownLabelIds.value.clear();
  // 仅H5端处理
  // #ifdef H5
  const AMap = (window as any).AMap;
  if (!AMap || !map.value || stations.value.length === 0) return;

  // 清空原有marker
  markers.value.forEach(marker => marker.setMap(null));
  markers.value = [];
  shownLabelIds.value.clear();

  // 重新添加marker并显示所有标签
  stations.value.forEach((station, index) => {
    const marker = new AMap.Marker({
      position: [station.longitude, station.latitude],
      title: station.userName,
      icon: `${staticImagePath}/dot.svg`,
      label: {
        content: `<div class="custom-marker-white">
          <div class="marker-price pt-1 align-center d-flex">
            <span>No.${index + 1}：</span>${station.creDate}
          </div>
        </div>`,
        offset: new AMap.Pixel(-55, -60),
      },
    });

    // 绑定点击事件
    marker.on('click', () => {
      marker.setTop(true);

      // 重置其他marker的标签
      markers.value.forEach((m, idx) => {
        if (m !== marker) {
          m.setLabel({
            content: `<div class="custom-marker-white">
              <div class="marker-price pt-1 align-center d-flex">
                <span>No.${idx + 1}：</span>${stations.value[idx].creDate}
              </div>
            </div>`,
            offset: new AMap.Pixel(-55, -60),
          });
        }
      });

      shownLabelIds.value.clear();
      nextTick(() => {
        if (shownLabelIds.value.has(station.cciId)) {
          // 隐藏标签
          marker.setLabel({
            content: `<div class="custom-marker" style="display: none"></div>`,
            offset: new AMap.Pixel(-55, -60),
          });
          shownLabelIds.value.delete(station.cciId);
          selectedStation.value = {
            address: '',
            userName: '',
            creDate: '',
            cciId: 0,
            longitude: '',
            latitude: '',
          };
        } else {
          // 显示高亮标签
          marker.setLabel({
            content: `<div class="custom-marker">
              <div class="marker-price d-flex align-center pt-1">
                <span>No.${index + 1}：</span>${station.creDate}
              </div>
            </div>`,
            offset: new AMap.Pixel(-55, -60),
          });
          shownLabelIds.value.add(station.cciId);
          selectedStation.value = station;
        }
        activeMarkerId.value = station.cciId;
      });
    });

    marker.setMap(map.value);
    markers.value.push(marker);
    shownLabelIds.value.add(station.cciId);
  });
  // #endif

  // #ifdef MP-WEIXIN
  addMpMarkers();
  // #endif
};

// ========== 筛选/查询方法 ==========
/**
 * 日期选择确认
 */
const calendarConfirm = (val: { range: { before: string; after: string } }) => {
  if (!val?.range?.before || !val?.range?.after) return;
  startTime.value = val.range.before;
  endTime.value = val.range.after;
  fetchQueryVisitMapList();
};

/**
 * 人员选择
 */
const personClick = (user: any) => {
  if (user === '') {
    personRadio.value = '';
    personObj.value = {};
    return;
  }
  personRadio.value = user.userId;
  personObj.value = user;
};

/**
 * 人员筛选确认
 */
const userSure = () => {
  fetchQueryVisitMapList(personRadio.value);
};

/**
 * 搜索用户筛选
 */
const searchUser = (val: any) => {
  console.log(val);
  searchVal.value = val;
  userList.value = userListMiddle.value.filter(ele => {
    return (
      ele.userName.indexOf(searchVal.value) !== -1 ||
      String(ele.userId).indexOf(searchVal.value) !== -1
    );
  });
};

/**
 * 获取点位数据
 * @param user 筛选的用户ID
 */
const fetchQueryVisitMapList = (user: any = '') => {
  const params = {
    start: startTime.value,
    end: endTime.value,
    keyword: '',
    user: user,
  };

  CustomerSituationMapService.queryVisitMapList(params)
    .then((res: any) => {
      if (+res.code === 200) {
        stations.value = [];
        markers.value = [];
        selectedStation.value = {
          address: '',
          userName: '',
          creDate: '',
          cciId: 0,
          longitude: '',
          latitude: '',
        };
        activeMarkerId.value = null;
        shownLabelIds.value.clear();
        // ========== 关键修复2：判断是否有数据 ==========
        if (res.data && res.data.length > 0) {
          stations.value = res.data;

          // 普通查询：初始化地图
          if (!user) {
            const center = [stations.value[0].longitude, stations.value[0].latitude];
            initMap(center);
            searchPersonFlag.value = false;
          }
          // 人员筛选：显示所有标签
          else {
            nextTick(() => {
              showLabelsForBusiness1();
            });
          }
        } else {
          // ========== 关键修复3：无数据时主动清空地图 ==========
          // #ifdef H5
          if (map.value) {
            map.value.clearMap(); // 清空H5地图所有覆盖物
          }
          markers.value = []; // 清空Marker缓存

          // #endif

          // #ifdef MP-WEIXIN
          markers.value = []; // 小程序清空Marker列表（组件会自动刷新）
          // #endif

          searchPersonFlag.value = false;
          initMap(); // 初始化地图到默认杭州
          showToast('该人员暂无打卡信息'); // 提示无数据
        }
      }
    })
    .catch(err => {
      console.error('点位数据查询失败:', err);
      showError('数据加载失败，请重试');
    });
};

/**
 * 获取用户列表
 */
const _queryUser = () => {
  if (userList.value.length > 0) return;

  CustomerSituationMapService.queryUser({})
    .then((res: any) => {
      if (+res.code === 200) {
        userList.value = res.data;
        userListMiddle.value = JSON.parse(JSON.stringify(res.data));
      } else {
        showError(res.msg || '用户列表查询失败');
      }
    })
    .catch(err => {
      console.error('用户列表查询失败:', err);
      showError('用户列表加载失败');
    });
};

// ========== 事件处理 ==========
const searchPersonClick = () => {
  searchPersonFlag.value = true;
  _queryUser();
};

const insertListClick = () => {
  console.log('startTime.value', startTime.value);
  console.log('endTime.value', endTime.value);
  router.push('/subpackages/home/map-list', {
    start: startTime.value,
    end: endTime.value,
    user: personRadio.value,
  });
};

// ========== 生命周期 ==========
onMounted(() => {
  // 初始加载点位数据
  fetchQueryVisitMapList();
});

onUnmounted(() => {
  // #ifdef H5
  // 销毁H5地图实例
  if (map.value) {
    try {
      map.value.destroy();
    } catch (err) {
      console.warn('地图销毁失败:', err);
    }
    map.value = null;
  }
  // #endif
});
</script>

<style lang="scss" scoped>
.customer-situation-map {
  width: 100%;
  height: 100vh;
  position: relative;

  .top-bar {
    position: absolute;
    top: 12px;
    left: 16px;
    background: white;
    border-radius: 12px;
    z-index: 100;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

    .icon {
      width: 37px;
      height: 37px;
      background: #3561f2;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .date {
      padding: 0 12px;
      font-size: 16px;
      color: #323233;
    }
  }

  .map-container {
    width: 100%;
    height: 100vh;
    position: relative;
  }

  .station-info {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 100px;
    margin: 0 16px;
    padding: 16px;
    background: #fff;
    border-radius: 30px;
    z-index: 90;
    box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
  }

  .bottom-search {
    width: calc(100% - 32px);
    height: 70px;
    padding: 10px 16px;
    background: #fff;
    border-radius: 20px 20px 0 0;
    position: absolute;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    z-index: 160;
    box-shadow: 0 -2px 8px rgb(0 0 0 / 5%);
  }
}

/* 弹窗样式 */
.popup-search {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  z-index: 9;
}

.popup-content {
  height: calc(100% - 100px);
  overflow: auto;
}

.change-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #3561f2;
  margin-left: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* H5端Marker标签样式 */

:deep(.amap-marker-label) {
  border: none;
  background: transparent;
  box-shadow: none;
  z-index: 10;
}

:deep(.amap-icon img) {
  z-index: 9 !important;
}

:deep(.amap-marker-label .custom-marker) {
  background: #3561f2;
  border-radius: 16px 16px 16px 0;
  padding: 6px 14px 6px 12px;
  font-size: 14px;
  color: #fff;
  text-align: left;
  min-width: 80px;
  position: relative;

  .marker-title {
    font-weight: bold;
    font-size: 14px;
    margin-bottom: 2px;
    letter-spacing: 1px;
    text-shadow: 0 1px 2px rgb(0 0 0 / 8%);
  }

  .marker-price {
    color: #fff;
    font-size: 12px;
    font-weight: 500;
    margin-top: 2px;
    text-shadow: 0 1px 2px rgb(0 0 0 / 8%);
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -10px;
    margin-left: -10px;
    width: 0;
    height: 0;
    border-width: 10px 8px 0;
    border-style: solid;
    border-color: #3561f2 transparent transparent;
  }
}

:deep(.amap-marker-label .custom-marker-white) {
  background: #fff;
  border-radius: 16px 16px 16px 0;
  padding: 6px 14px 6px 12px;
  font-size: 14px;
  text-align: left;
  min-width: 80px;
  position: relative;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);

  .marker-price {
    font-size: 12px;
    font-weight: 500;
    margin-top: 2px;
    color: #333;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -10px;
    margin-left: -10px;
    width: 0;
    height: 0;
    border-width: 10px 8px 0;
    border-style: solid;
    border-color: white transparent transparent;
  }
}

page {
  height: 100%;
}

/* 小程序map组件层级修复 */
map {
  z-index: 1;
}
</style>
