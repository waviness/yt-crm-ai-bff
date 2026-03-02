/**
 * 高德地图定位和POI搜索 Composable
 * 支持 H5 端（高德Web API）和小程序端（高德小程序SDK）
 */
// #ifdef H5
import { isWechatBrowser } from '@/utils/env';
// @ts-ignore
import wx from 'weixin-jsapi';

// #endif
// #ifdef MP-WEIXIN
// @ts-ignore
import { AMapWX } from '@/libs/amap-wx.js';
// #endif

// 缓存键名和过期时间
const LOCATION_WEATHER_CACHE_KEY = 'location_weather_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30分钟缓存

export interface PoiItem {
  id: string;
  name: string;
  address: string;
  location: {
    lng: number;
    lat: number;
  };
  center?: { lng: number; lat: number } | [number, number]; // 高德地图支持对象或数组格式
  pname?: string;
  cityname?: string;
  adname?: string;
}

export function useAmapLocation() {
  // 状态
  const nowWeather = ref<any>({});
  const lnglatXY = ref<[number, number]>([0, 0]);
  const locationCity = ref('');
  const nowChooseId = ref('');
  const nowChooseObj = ref<PoiItem | null>(null);
  const nowChoosePlace = ref('');
  const locationList = ref<PoiItem[]>([]);
  const addressID = ref('');
  const addressDetail = ref('');
  const addressValue = ref('');
  const addressPage = ref(1);
  const mapLoading = ref(false); // 地图加载状态
  const locationPermissionLoading = ref(false); // 定位权限请求状态

  // 地图相关
  let map: any = null;
  let AMAP: any = null;
  let amapPlugin: any = null; // 小程序端
  // #ifdef H5
  let h5MapMarkers: any[] = []; // H5端：保存地图标记，用于清除
  let mapControlsAdded = false; // 标记地图控件是否已添加
  // #endif

  // 权限请求标记（避免重复请求）
  let hasRequestedPermission = false; // H5端
  let hasRequestedMPPermission = false; // 小程序端

  // #ifdef H5
  // 从环境变量获取 Key，如果没有则使用默认值（需要替换为实际Key）
  const AMAP_KEY = import.meta.env.VITE_AMAP_KEY;

  /**
   * 动态加载高德地图 JS SDK（按需加载）
   */
  const loadAMapScript = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      // 如果已经加载，直接返回
      if ((window as any).AMap) {
        resolve((window as any).AMap);
        return;
      }

      // 检查Key是否配置
      if (!AMAP_KEY || AMAP_KEY === 'YOUR_AMAP_KEY') {
        reject(new Error('高德地图Key未配置，请在.env文件中设置VITE_AMAP_KEY'));
        return;
      }

      // 检查是否正在加载
      const existingScript = document.querySelector('script[data-amap]');
      if (existingScript) {
        // 如果正在加载，等待加载完成
        existingScript.addEventListener('load', () => {
          if ((window as any).AMap) {
            resolve((window as any).AMap);
          } else {
            reject(new Error('高德地图SDK加载失败'));
          }
        });
        existingScript.addEventListener('error', () => {
          reject(new Error('高德地图脚本加载失败，请检查网络连接'));
        });
        return;
      }

      // 创建 script 标签
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${AMAP_KEY}&extensions=all`;
      script.setAttribute('data-amap', 'true');

      script.onload = () => {
        if ((window as any).AMap) {
          resolve((window as any).AMap);
        } else {
          reject(new Error('高德地图SDK加载失败：AMap对象不存在，请检查Key是否正确'));
        }
      };

      script.onerror = () => {
        reject(new Error('高德地图加载失败，请检查网络连接和Key配置'));
      };

      // 插入到 head
      document.head.appendChild(script);
    });
  };

  /**
   * 初始化高德地图（H5端）
   */
  const initAMap = async () => {
    if (AMAP) {
      return AMAP;
    }
    AMAP = await loadAMapScript();
    return AMAP;
  };

  /**
   * H5端：使用微信JS-SDK获取定位（优先方案）
   */
  const useWechatLocation = async (typeVal: string): Promise<any> => {
    const url = location.href.split('#')[0];
    locationPermissionLoading.value = true;
    console.log('微信环境，调用getSign接口获取签名');

    let data: any;
    try {
      const res = await CommonService.getSign({ url });
      data = res;
    } catch {
      locationPermissionLoading.value = false;
      showToast('获取微信签名失败，请检查网络连接');
      throw new Error('获取微信签名失败，请检查网络连接');
    }

    return new Promise((resolve, reject) => {
      if (!wx) {
        locationPermissionLoading.value = false;
        showToast('微信JS-SDK未加载，请检查网络连接');
        reject(new Error('微信JS-SDK未加载'));
        return;
      }

      wx.config({
        debug: false,
        appId: 'ww2170b959e5dac682',
        timestamp: data.timestamp,
        nonceStr: data.nonceStr,
        signature: data.signature,
        jsApiList: ['getLocation'],
      });

      wx.error((err: any) => {
        locationPermissionLoading.value = false;
        showToast('微信定位配置失败，请检查网络或联系管理员');
        reject(new Error(`微信JS-SDK配置失败: ${JSON.stringify(err)}`));
      });

      wx.ready(() => {
        wx.getLocation({
          type: 'gcj02',
          success: (res: any) => {
            lnglatXY.value = [res.longitude, res.latitude];
            locationPermissionLoading.value = false;

            if (typeVal === 'click') {
              aMapSearchNearBy(lnglatXY.value, locationCity.value, addressValue.value);
            } else {
              getPositionByLonLats(res.longitude, res.latitude);
            }
            resolve(res);
          },
          cancel: () => {
            locationPermissionLoading.value = false;
            showToast('定位权限被拒绝，请在微信中允许位置权限');
            reject(new Error('用户拒绝授权'));
          },
          fail: (err: any) => {
            locationPermissionLoading.value = false;
            const errorMsg = err?.errMsg || '定位失败';
            showToast(
              errorMsg.includes('权限')
                ? '定位权限被拒绝，请在微信中允许位置权限'
                : '定位失败，请重试'
            );
            reject(new Error(`微信定位失败: ${errorMsg}`));
          },
        });
      });
    });
  };

  /**
   * H5端：请求定位权限（仅在首次进入时请求）
   */
  const requestGeolocationPermission = async (): Promise<boolean> => {
    // 如果已经请求过权限，不再重复请求
    if (hasRequestedPermission) {
      console.log('📍 权限已请求过，跳过重复请求');
      return false;
    }

    hasRequestedPermission = true;

    // 检查是否支持 Permissions API
    if ('permissions' in navigator) {
      try {
        const permissionStatus = await (navigator as any).permissions.query({
          name: 'geolocation',
        });
        console.log('📍 定位权限状态:', permissionStatus.state);

        if (permissionStatus.state === 'granted') {
          return true;
        } else if (permissionStatus.state === 'prompt') {
          // 权限未决定，尝试请求（首次进入时会弹出授权提示）
          return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(
              () => {
                console.log('✅ 权限请求成功');
                resolve(true);
              },
              () => {
                console.log('❌ 权限请求被拒绝');
                resolve(false);
              },
              { timeout: 1000 }
            );
          });
        } else if (permissionStatus.state === 'denied') {
          // 权限已被拒绝，提示用户手动开启
          console.log('❌ 定位权限已被拒绝');
          showToast('定位权限被拒绝，请在浏览器设置中允许位置权限');
          return false;
        }
      } catch (error) {
        console.warn('Permissions API 不支持或查询失败:', error);
      }
    }
    return false;
  };

  /**
   * H5端：使用浏览器原生定位API（navigator.geolocation）
   */
  const useBrowserGeolocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位功能'));
        return;
      }

      console.log('📍 请求定位权限...');

      // 使用更宽松的定位参数，提高成功率
      navigator.geolocation.getCurrentPosition(
        position => {
          console.log('✅ 定位成功，坐标:', position.coords.longitude, position.coords.latitude);
          resolve(position);
        },
        async error => {
          let errorMsg = '定位失败';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.error('❌ 定位权限被拒绝');
              // 仅在首次进入时尝试请求权限
              if (!hasRequestedPermission) {
                const hasPermission = await requestGeolocationPermission();
                if (hasPermission) {
                  // 如果权限获取成功，重新尝试定位
                  console.log('🔄 权限获取成功，重新尝试定位...');
                  try {
                    const position = await useBrowserGeolocation();
                    resolve(position);
                    return;
                  } catch {
                    errorMsg = '定位失败，请检查定位权限';
                  }
                } else {
                  errorMsg = '定位权限被拒绝，请在浏览器设置中允许位置权限';
                }
              } else {
                // 已经请求过权限，直接提示用户去设置中开启
                errorMsg = '定位权限被拒绝，请在浏览器设置中允许位置权限';
              }
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = '定位信息不可用，请检查GPS或网络连接';
              console.error('❌ 定位信息不可用');
              break;
            case error.TIMEOUT:
              errorMsg = '定位超时，请检查网络连接或稍后重试';
              console.error('❌ 定位超时');
              break;
            default:
              errorMsg = '定位失败，错误代码: ' + error.code;
              console.error('❌ 定位失败，错误代码:', error.code);
          }
          reject(new Error(errorMsg));
        },
        {
          enableHighAccuracy: false, // 改为false，提高成功率
          timeout: 15000, // 增加到15秒
          maximumAge: 60000, // 允许使用1分钟内的缓存位置
        }
      );
    });
  };

  /**
   * H5端：降级方案 - 使用浏览器原生定位
   */
  const fallbackToBrowserLocation = async (typeVal: string): Promise<any> => {
    console.log('开始使用浏览器原生定位API...');
    try {
      // 使用浏览器原生定位API
      const position = await useBrowserGeolocation();
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;

      console.log('定位成功:', { longitude, latitude });

      // 将WGS84坐标转换为GCJ02（高德地图坐标系）
      // 注意：这里简化处理，实际应该使用坐标转换算法
      // 对于测试，先直接使用，后续可以添加坐标转换
      lnglatXY.value = [longitude, latitude];
      locationCity.value = ''; // 浏览器定位不返回城市信息，需要通过逆地理编码获取

      // 通过高德API获取城市信息
      await initAMap();
      AMAP.service('AMap.Geocoder', () => {
        const geocoder = new AMAP.Geocoder({});
        geocoder.getAddress([longitude, latitude], (status: any, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            locationCity.value = result.regeocode.addressComponent.city || '';
            console.log('获取城市信息:', locationCity.value);
          }
        });
      });

      if (typeVal === 'click') {
        console.log('开始加载地图和搜索附近位置...');
        // 等待一下确保弹窗和地图容器已渲染
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 200));
        try {
          await aMapSearchNearBy(lnglatXY.value, locationCity.value, addressValue.value);
        } catch (error) {
          console.error('地图搜索失败:', error);
          showToast('地图加载失败，请刷新重试');
        }
      } else {
        getPositionByLonLats(longitude, latitude);
      }

      return { longitude, latitude };
    } catch (error) {
      console.error('浏览器定位失败:', error);
      const errorMsg = error instanceof Error ? error.message : '定位失败';
      // 定位失败时，直接抛出错误，不使用默认位置
      throw new Error(errorMsg);
    }
  };

  /**
   * H5端：智能获取定位（带降级策略）
   * 微信环境：优先使用微信JS-SDK，失败则降级到浏览器定位
   * 普通浏览器：直接使用浏览器定位
   */
  const wxRegisterForH5 = async (typeVal: string) => {
    const isWechat = isWechatBrowser();
    console.log('当前环境:', isWechat ? '微信浏览器' : '普通浏览器');

    if (isWechat) {
      // 微信环境：优先使用微信JS-SDK，失败则降级
      try {
        console.log('微信环境，尝试使用微信JS-SDK定位');
        return await useWechatLocation(typeVal);
      } catch (error) {
        console.warn('微信JS-SDK定位失败，降级到浏览器定位:', error);
        return await fallbackToBrowserLocation(typeVal);
      }
    } else {
      // 普通浏览器：直接使用浏览器定位
      console.log('普通浏览器，使用浏览器定位');
      return await fallbackToBrowserLocation(typeVal);
    }
  };
  // #endif

  // #ifdef MP-WEIXIN
  // 从环境变量获取 Key
  const AMAP_MP_KEY = import.meta.env.VITE_AMAP_MP_KEY;

  /**
   * 小程序端：初始化高德地图SDK
   * 使用 import 方式引入，在文件顶部已通过条件编译导入
   */
  const initAMapForMP = () => {
    return new Promise((resolve, reject) => {
      try {
        // 如果已经初始化过，直接返回
        if (amapPlugin) {
          resolve(amapPlugin);
          return;
        }

        // 检查模块是否正确导入
        if (!AMapWX) {
          throw new Error(
            'amap-wx.js 文件未找到或格式错误。请确保已下载 amap-wx.js 文件到 src/libs/ 目录，并且文件格式正确（需要导出 AMapWX）。'
          );
        }

        // 初始化 SDK
        amapPlugin = new AMapWX({
          key: AMAP_MP_KEY,
        });
        resolve(amapPlugin);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        reject(
          new Error(
            `高德地图SDK加载失败: ${errorMsg}。请确保已下载 amap-wx.js 文件到 src/libs/ 目录，并且文件格式正确。`
          )
        );
      }
    });
  };

  /**
   * 小程序端：获取定位
   */
  const wxRegisterForMP = async (typeVal: string) => {
    await initAMapForMP();

    try {
      locationPermissionLoading.value = true;
      const res = await uni.getLocation({
        type: 'gcj02',
        geocode: true,
      });

      lnglatXY.value = [res.longitude, res.latitude];
      locationCity.value = res.address?.city || '';
      locationPermissionLoading.value = false;

      // 定位成功后，获取天气信息
      if (typeVal !== 'click') {
        // 如果不是点击地图，则获取天气信息
        // 即使城市信息为空，也尝试通过坐标获取天气（getPositionByLonLats会处理）
        await getPositionByLonLats(res.longitude, res.latitude);
      }

      if (typeVal === 'click') {
        searchNearByForMP(addressValue.value);
      }
    } catch (error: any) {
      // 检查是否是权限问题
      const isPermissionError =
        error?.errMsg?.includes('auth deny') ||
        error?.errMsg?.includes('权限') ||
        error?.errMsg?.includes('permission') ||
        error?.code === 'PERMISSION_DENIED';

      if (isPermissionError && !hasRequestedMPPermission) {
        // 仅在首次进入时尝试请求定位权限
        hasRequestedMPPermission = true;
        try {
          locationPermissionLoading.value = true;
          await uni.authorize({
            scope: 'scope.userLocation',
          });
          // 权限获取成功，重新尝试定位
          try {
            const res = await uni.getLocation({
              type: 'gcj02',
              geocode: true,
            });
            lnglatXY.value = [res.longitude, res.latitude];
            locationCity.value = res.address?.city || '';
            locationPermissionLoading.value = false;

            // 定位成功后，获取天气信息
            if (typeVal !== 'click') {
              // 即使城市信息为空，也尝试通过坐标获取天气（getPositionByLonLats会处理）
              await getPositionByLonLats(res.longitude, res.latitude);
            }

            if (typeVal === 'click') {
              searchNearByForMP(addressValue.value);
            }
            return; // 定位成功，直接返回
          } catch {
            locationPermissionLoading.value = false;
          }
        } catch (authError: any) {
          locationPermissionLoading.value = false;
          // 如果用户拒绝授权，提示用户去设置中开启（只提示一次）
          if (authError?.errMsg?.includes('cancel') || authError?.errMsg?.includes('deny')) {
            uni.showModal({
              title: '定位权限未开启',
              content: '需要定位权限才能使用此功能，请在设置中开启定位权限',
              confirmText: '去设置',
              showCancel: true,
              success: res => {
                if (res.confirm) {
                  uni.openSetting();
                }
              },
            });
          }
        }
      } else if (isPermissionError && hasRequestedMPPermission) {
        // 已经请求过权限，不再重复请求
        locationPermissionLoading.value = false;
      } else {
        // 非权限错误，可能是其他错误（如网络错误等）
        locationPermissionLoading.value = false;
        // 对于非权限错误，只在需要显示地图时提示，获取天气时静默失败
        if (typeVal === 'click') {
          showToast('定位失败，请通过搜索或拖拽地图选择打卡位置');
        }
        // typeVal !== 'click' 时不显示错误提示，避免干扰用户体验
        // 不抛出错误，让调用方可以静默处理
        return;
      }

      // 定位失败时，不设置坐标，让页面显示空状态
      // 注意：这里不抛出错误，让调用方可以静默处理
    }
  };
  // #endif

  /**
   * 从缓存加载定位和天气信息
   */
  const loadFromCache = (): boolean => {
    try {
      const cached = cache.get<{
        lnglatXY: [number, number];
        locationCity: string;
        nowWeather: any;
        timestamp: number;
      }>(LOCATION_WEATHER_CACHE_KEY);

      if (cached && cached.lnglatXY && cached.lnglatXY[0] && cached.lnglatXY[1]) {
        lnglatXY.value = cached.lnglatXY;
        locationCity.value = cached.locationCity || '';
        nowWeather.value = cached.nowWeather || {};
        return true;
      }
    } catch {
      // 缓存加载失败，忽略错误
    }
    return false;
  };

  /**
   * 保存定位和天气信息到缓存
   */
  const saveToCache = () => {
    try {
      if (lnglatXY.value[0] && lnglatXY.value[1]) {
        // 四舍五入到小数点后5位（约1米精度）
        const preciseLng = Math.round(lnglatXY.value[0] * 100000) / 100000;
        const preciseLat = Math.round(lnglatXY.value[1] * 100000) / 100000;
        cache.set(
          LOCATION_WEATHER_CACHE_KEY,
          {
            lnglatXY: [preciseLng, preciseLat],
            locationCity: locationCity.value,
            nowWeather: nowWeather.value,
            timestamp: Date.now(),
          },
          CACHE_TTL
        );
      }
    } catch {
      // 缓存保存失败，忽略错误
    }
  };

  /**
   * 获取定位（统一入口）
   */
  const wxRegister = async (typeVal: string = '') => {
    // 如果不是显示地图（typeVal !== 'click'），先尝试从缓存加载
    if (typeVal !== 'click') {
      const hasCache = loadFromCache();
      if (hasCache) {
        return; // 有缓存且有效，直接返回
      }
    }

    try {
      // #ifdef H5
      await wxRegisterForH5(typeVal);
      // #endif

      // #ifdef MP-WEIXIN
      await wxRegisterForMP(typeVal);
      // #endif

      // 定位成功后，保存到缓存（仅在非地图模式下）
      if (typeVal !== 'click' && lnglatXY.value[0] && lnglatXY.value[1]) {
        saveToCache();
      }
    } catch (error) {
      // 确保关闭loading（作为保险，防止某些错误路径未关闭）
      locationPermissionLoading.value = false;
      // 如果内部没有显示错误提示，这里显示一个通用提示
      const errorMsg = error instanceof Error ? error.message : '定位失败';
      if (!errorMsg.includes('定位功能仅支持微信环境') && !errorMsg.includes('定位权限被拒绝')) {
        // 避免重复提示
        showToast('定位失败，请重试');
      }
    }
  };

  /**
   * 获取天气和城市信息（H5端使用高德API）
   */
  const getPositionByLonLats = async (lng: number, lat: number) => {
    // #ifdef H5
    await initAMap();

    return new Promise<void>(resolve => {
      // 如果城市信息已存在，直接获取天气，不需要逆地理编码
      if (locationCity.value) {
        AMAP.plugin('AMap.Weather', () => {
          const weather = new AMAP.Weather();
          weather.getLive(locationCity.value, (err: any, data: any) => {
            if (err) {
              nowWeather.value = {};
              resolve(); // 即使失败也resolve，不阻塞流程
              return;
            }
            nowWeather.value = data;
            // 如果天气数据中包含城市信息，使用天气API返回的城市名称
            if (data && data.city) {
              locationCity.value = data.city;
            }
            // 保存到缓存
            saveToCache();
            resolve();
          });
        });
        return;
      }

      // 如果城市信息不存在，先进行逆地理编码获取城市信息
      AMAP.service('AMap.Geocoder', () => {
        const geocoder = new AMAP.Geocoder({});
        geocoder.getAddress([lng, lat], (status: any, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            locationCity.value = result.regeocode.addressComponent.city;

            AMAP.plugin('AMap.Weather', () => {
              const weather = new AMAP.Weather();
              weather.getLive(locationCity.value, (err: any, data: any) => {
                if (err) {
                  nowWeather.value = {};
                  resolve(); // 即使失败也resolve，不阻塞流程
                  return;
                }
                nowWeather.value = data;
                // 如果天气数据中包含城市信息，使用天气API返回的城市名称
                if (data && data.city) {
                  locationCity.value = data.city;
                }
                // 保存到缓存
                saveToCache();
                resolve();
              });
            });
          } else {
            resolve(); // 即使失败也resolve，不阻塞流程
          }
        });
      });
    });
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序端可以通过高德小程序SDK获取天气
    return new Promise<void>(async resolve => {
      try {
        if (!amapPlugin) {
          await initAMapForMP();
        }
        if (!amapPlugin) {
          nowWeather.value = {};
          resolve();
          return;
        }

        // 根据文档，getWeather 可以不传 city 参数，SDK 会自动获取当前位置并查询天气
        // 如果传入了 city，应该是 adcode（区域编码），而不是城市名称
        // 为了简化逻辑，统一使用不传 city 的方式，让 SDK 自动处理
        if (lng && lat) {
          // 有坐标，直接调用 getWeather（不传 city），SDK 会自动通过坐标获取天气
          // 注意：SDK 内部会先通过 getWxLocation 获取位置，然后通过逆地理编码获取 adcode，最后查询天气
          amapPlugin.getWeather({
            success: (data: any) => {
              try {
                nowWeather.value = data.lives[0] || {};
                // 如果天气数据中包含城市信息，使用天气API返回的城市名称
                if (nowWeather.value && nowWeather.value.city) {
                  locationCity.value = nowWeather.value.city;
                }
                console.log('小程序端获取天气成功:', nowWeather.value);
                // 保存到缓存
                saveToCache();
              } catch (error) {
                console.warn('天气数据处理失败:', error);
                nowWeather.value = {};
              }
              resolve();
            },
            fail: (error: any) => {
              console.warn('天气获取失败:', error);
              nowWeather.value = {};
              resolve();
            },
          });
        } else {
          // 没有坐标，无法获取天气
          nowWeather.value = {};
          resolve();
        }
      } catch (error) {
        // 天气获取异常，不影响主流程
        console.warn('天气获取异常:', error);
        nowWeather.value = {};
        resolve(); // 即使失败也resolve，不阻塞流程
      }
    });
    // #endif
  };

  /**
   * H5端：搜索附近位置
   */
  // #ifdef H5
  const aMapSearchNearBy = async (
    centerPoint: [number, number],
    city: string,
    keyword: string = ''
  ) => {
    // 添加超时保护，确保loading最终会被关闭（30秒超时）
    const loadingTimeout = setTimeout(() => {
      mapLoading.value = false;
      console.warn('地图加载超时，已自动关闭loading');
    }, 30000);

    try {
      // 开始加载地图
      mapLoading.value = true;
      await initAMap();

      if (addressPage.value === 1) {
        locationList.value = [];
      }

      // 等待DOM渲染完成（弹窗中的地图容器需要时间渲染）
      await nextTick();

      // 轮询检查容器是否存在且有有效尺寸（确保弹窗完全打开）
      const MAX_ATTEMPTS = 10; // 最多尝试10次
      const CHECK_INTERVAL = 200; // 每次间隔200ms
      let attempt = 0;
      let container: HTMLElement | null = null;

      while (attempt < MAX_ATTEMPTS) {
        container = document.getElementById('container');
        if (container) {
          const rect = container.getBoundingClientRect();
          // 检查容器是否有有效尺寸（宽度和高度都大于0）
          if (rect.width > 0 && rect.height > 0) {
            // 容器已准备好，可以初始化地图
            break;
          }
        }
        // 等待一段时间后再次检查
        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
        attempt++;
      }

      // 最终检查容器是否存在且有尺寸
      if (!container) {
        clearTimeout(loadingTimeout);
        mapLoading.value = false;
        showToast('地图容器不存在，请刷新重试');
        return;
      }

      const finalRect = container.getBoundingClientRect();
      if (finalRect.width === 0 || finalRect.height === 0) {
        clearTimeout(loadingTimeout);
        mapLoading.value = false;
        showToast('地图容器尺寸异常，请稍后重试');
        return;
      }

      // 地图实例复用：如果已存在则复用，否则创建新实例
      if (!map) {
        try {
          map = new AMAP.Map('container', {
            resizeEnable: true,
            center: centerPoint,
            zoom: 15, // 设置合适的初始缩放级别
            mapStyle: 'amap://styles/whitesmoke',
            // 启用地图交互功能（移动端必需）
            dragEnable: true, // 启用拖拽
            zoomEnable: true, // 启用缩放
            scrollWheelZoom: true, // 启用鼠标滚轮缩放
            touchZoom: true, // 启用触摸缩放（移动端必需）
            doubleClickZoom: true, // 启用双击缩放
            keyboardEnable: true, // 启用键盘操作
          });

          // 监听地图加载完成事件
          map.on('complete', () => {
            // 地图加载完成，隐藏loading
            clearTimeout(loadingTimeout);
            mapLoading.value = false;
          });

          // 监听地图错误事件
          map.on('error', (error: any) => {
            // 地图加载失败，隐藏loading
            clearTimeout(loadingTimeout);
            mapLoading.value = false;
            if (error && error.message) {
              showToast('地图加载失败：' + error.message);
            }
          });
        } catch (error) {
          // 地图创建失败，隐藏loading
          clearTimeout(loadingTimeout);
          mapLoading.value = false;
          if (error instanceof Error) {
            if (error.message.includes('INVALID_USER_KEY')) {
              showToast('高德地图Key无效，请检查Key配置');
            } else if (error.message.includes('DAILY_QUERY_OVER_LIMIT')) {
              showToast('高德地图Key超出每日调用量限制');
            } else {
              showToast('地图创建失败：' + error.message);
            }
          }
          throw error;
        }
      } else {
        // 地图已存在，更新中心点并重新渲染
        map.setCenter(centerPoint);
        // 清除旧标记
        // #ifdef H5
        h5MapMarkers.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        h5MapMarkers = [];
        // #endif
        map.clearMap();

        // 重要：确保地图重新渲染（解决弹窗切换后地图空白的问题）
        // 等待容器完全显示后再调用 resize
        await nextTick();
        setTimeout(() => {
          // 检查容器是否可见且有尺寸
          const mapContainer = document.getElementById('container');
          if (mapContainer) {
            const rect = mapContainer.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              // 调用 resize 确保地图重新渲染
              map.resize();
            }
          }
        }, 100);

        // 地图已存在，立即关闭loading
        clearTimeout(loadingTimeout);
        mapLoading.value = false;
      }

      // 只在首次创建地图时添加控件，避免重复添加
      if (!mapControlsAdded) {
        AMAP.plugin(['AMap.Autocomplete', 'AMap.PlaceSearch', 'AMap.Geolocation'], () => {
          const geolocation = new AMAP.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认:true
            timeout: 10000, // 超过10秒后停止定位，默认：无穷大
            maximumAge: 0, // 定位结果缓存0毫秒，默认：0
            convert: true, // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
            showButton: true, // 显示定位按钮，默认：true
            buttonPosition: 'LB', // 定位按钮停靠位置，默认：'LB'，左下角
            buttonOffset: new AMAP.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
            showMarker: true, // 定位成功后在定位到的位置显示点标记，默认：true
            showCircle: true, // 定位成功后用圆圈表示定位精度范围，默认：true
            panToLocation: true, // 定位成功后将定位到的位置作为地图中心点，默认：true
            zoomToAccuracy: true, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：false
          });
          map.addControl(geolocation);
        });
        // #ifdef H5
        mapControlsAdded = true;
        // #endif
      }

      AMAP.service(['AMap.PlaceSearch'], () => {
        const placeSearch = new AMAP.PlaceSearch({
          pageSize: 50,
          pageIndex: addressPage.value,
          citylimit: false,
          type: '汽车服务|汽车销售|汽车维修|摩托车服务|餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施',
          map: map,
          city: city,
        });

        placeSearch.searchNearBy(keyword, centerPoint, 500, (status: any, result: any) => {
          // 搜索回调开始，关闭loading和超时保护
          clearTimeout(loadingTimeout);
          mapLoading.value = false;

          // 检查 status 是否为 'complete'
          if (status !== 'complete') {
            // 状态异常时，不显示错误，允许用户继续使用地图
            return;
          }

          if (result && result.info === 'OK') {
            const count = result.poiList?.pois?.length || 0;

            if (count === 0) {
              // 即使没有找到POI，也允许用户在地图上选择位置
              showToast('未找到附近位置，可通过搜索或拖拽地图选择位置');
              // loading已在搜索回调开始时关闭（第709行），这里不需要重复关闭
              return;
            }

            locationList.value = locationList.value.concat(
              result.poiList.pois.map((poi: any) => ({
                id: poi.id,
                name: poi.name,
                address: poi.address,
                location: {
                  lng: poi.location.lng,
                  lat: poi.location.lat,
                },
                center: poi.location,
                pname: poi.pname,
                cityname: poi.cityname,
                adname: poi.adname,
              }))
            );

            if (locationList.value.length > 0) {
              nowChooseObj.value = locationList.value[0];
              nowChooseId.value = locationList.value[0].id;
            }

            // 清除旧标记（如果之前有）
            // #ifdef H5
            h5MapMarkers.forEach(marker => {
              if (marker && marker.setMap) {
                marker.setMap(null);
              }
            });
            h5MapMarkers = [];
            // #endif

            // 添加圆形标记
            locationList.value.forEach(item => {
              if (item.center) {
                const circleMarker = new AMAP.CircleMarker({
                  center: item.center,
                  radius: 12,
                  strokeColor: '#1890ff',
                  strokeWeight: 2,
                  strokeOpacity: 1,
                  fillColor: '#1890ff',
                  fillOpacity: 0.6,
                  zIndex: 10,
                  bubble: true,
                  cursor: 'pointer',
                  clickable: true,
                });
                circleMarker.setMap(map);
                // #ifdef H5
                // 保存标记引用，以便后续清除
                h5MapMarkers.push(circleMarker);
                // #endif
              }
            });

            // 添加标记点击事件
            AMAP.event.addListener(placeSearch, 'markerClick', (e: any) => {
              nowChooseId.value = e.data.id;
              const item = locationList.value.find(l => l.id === e.data.id);
              if (item) {
                nowChooseObj.value = item;
                markerClick(item);
              }
            });

            // 默认选中第一个
            if (locationList.value.length > 0) {
              markerClick(locationList.value[0]);
            }
          } else {
            // 搜索失败，确保关闭loading（loading已在搜索回调开始时关闭，这里确保清除超时）
            clearTimeout(loadingTimeout);
            if (result) {
              const errorInfo = result.info || result.infocode || '未知错误';

              if (result.info === 'INVALID_USER_KEY') {
                showToast('高德地图Key无效，请检查配置');
              } else if (result.info === 'DAILY_QUERY_OVER_LIMIT') {
                showToast('高德地图Key超出每日调用量限制');
              } else if (result.info === 'SERVICE_NOT_EXIST') {
                showToast('地图服务异常，请稍后重试');
              } else if (result.info === 'SERVICE_RESPONSE_ERROR') {
                showToast('地图服务响应异常，请稍后重试');
              } else {
                // 对于非关键错误，使用更友好的提示，允许用户继续使用地图
                const errorMsg = errorInfo || '未知错误';
                if (
                  errorMsg.includes('网络') ||
                  errorMsg.includes('timeout') ||
                  errorMsg.includes('超时')
                ) {
                  showToast('网络异常，可通过搜索或拖拽地图选择位置');
                } else {
                  showToast(`获取位置信息失败: ${errorMsg}，可通过搜索选择位置`);
                }
              }
            } else {
              showToast('获取位置信息失败，可通过搜索或拖拽地图选择位置');
            }
          }
        });
      });
    } catch (error) {
      // 地图加载过程出错，隐藏loading和超时保护
      clearTimeout(loadingTimeout);
      mapLoading.value = false;
      showToast('地图加载失败，请刷新重试');
      throw error;
    }
  };
  // #endif

  /**
   * 小程序端：搜索附近位置
   */
  // #ifdef MP-WEIXIN
  const searchNearByForMP = async (keyword: string = '') => {
    try {
      if (!amapPlugin) {
        await initAMapForMP();
      }

      if (!amapPlugin) {
        showToast('地图SDK加载失败，请重试');
        return;
      }

      // 重置列表
      locationList.value = [];

      // 根据SDK源码，getPoiAround接受的参数是 querytypes 和 querykeywords
      // SDK内部会将 querytypes 转换为 types，querykeywords 转换为 keywords
      const searchParams: any = {
        location: `${lnglatXY.value[0]},${lnglatXY.value[1]}`,
        querytypes:
          '汽车服务|汽车销售|汽车维修|摩托车服务|餐饮服务|购物服务|生活服务|体育休闲服务|医疗保健服务|住宿服务|风景名胜|商务住宅|政府机构及社会团体|科教文化服务|交通设施服务|金融保险服务|公司企业|道路附属设施|地名地址信息|公共设施',
      };

      // 只有当keyword有值时才传递querykeywords参数
      // 如果keyword为空，则不传querykeywords参数，让SDK使用默认的"附近"搜索
      if (keyword && keyword.trim()) {
        searchParams.querykeywords = keyword.trim();
      }

      amapPlugin.getPoiAround({
        ...searchParams,
        success: (data: any) => {
          try {
            // 高德小程序SDK的getPoiAround返回格式：{ markers: [...], poisData: [...] }
            // 注意：SDK内部已经将 keywords 转换为 querykeywords，types 转换为 querytypes
            // 从 amap-wx.js 源码看，返回的是 { markers: h, poisData: g.pois }
            const pois = data?.poisData || data?.pois || (data?.status === '1' ? data.pois : null);

            if (pois && Array.isArray(pois) && pois.length > 0) {
              locationList.value = pois.map((poi: any) => {
                // 处理 location 字段：可能是字符串 "lng,lat" 或对象 {lng, lat}
                let lng = 0;
                let lat = 0;
                if (typeof poi.location === 'string') {
                  const [lngStr, latStr] = poi.location.split(',');
                  lng = parseFloat(lngStr) || 0;
                  lat = parseFloat(latStr) || 0;
                } else if (poi.location && typeof poi.location === 'object') {
                  lng = parseFloat(poi.location.lng) || parseFloat(poi.location.longitude) || 0;
                  lat = parseFloat(poi.location.lat) || parseFloat(poi.location.latitude) || 0;
                }

                return {
                  id: poi.id || String(Date.now() + Math.random()),
                  name: poi.name || '未知位置',
                  address: poi.address || '',
                  location: {
                    lng,
                    lat,
                  },
                  pname: poi.pname || '',
                  cityname: poi.cityname || '',
                  adname: poi.adname || '',
                };
              });

              if (locationList.value.length > 0) {
                nowChooseObj.value = locationList.value[0];
                nowChooseId.value = locationList.value[0].id;
              } else {
                showToast('未找到附近位置');
              }
            } else {
              // 没有找到结果
              locationList.value = [];
              if (keyword) {
                showToast('未找到相关位置，请尝试其他关键词');
              }
            }
          } catch (error) {
            console.error('POI数据处理失败:', error, data);
            showToast('位置数据处理失败，请重试');
          }
        },
        fail: (error: any) => {
          console.error('POI搜索失败:', error);
          showToast('搜索失败，请重试');
        },
      });
    } catch (error) {
      console.error('POI搜索异常:', error);
      showToast('搜索失败，请重试');
    }
  };
  // #endif

  /**
   * 搜索功能（统一入口）
   */
  const onSearch = () => {
    addressPage.value = 1;
    locationList.value = [];

    // #ifdef H5
    if (lnglatXY.value[0] && lnglatXY.value[1]) {
      // 已有定位信息，直接搜索
      aMapSearchNearBy(lnglatXY.value, locationCity.value, addressValue.value);
    } else {
      // 没有定位信息，自动触发定位
      showToast('正在获取定位信息...');
      wxRegister('click').catch(() => {
        // 定位失败时，如果用户输入了搜索关键词，可以尝试使用城市搜索
        // 这里先不处理，让用户知道定位失败了
      });
    }
    // #endif

    // #ifdef MP-WEIXIN
    if (lnglatXY.value[0] && lnglatXY.value[1]) {
      searchNearByForMP(addressValue.value);
    } else {
      wxRegister('click');
    }
    // #endif
  };

  /**
   * 标记点击（H5端显示信息窗口）
   */
  const markerClick = (item: PoiItem) => {
    // #ifdef H5
    if (!AMAP || !map) return;

    const infoWindow = new AMAP.InfoWindow({ offset: new AMAP.Pixel(0, -30) });
    const marker = new AMAP.Marker({
      position: [item.location.lng, item.location.lat],
      map: map,
    });
    marker.content = `<ul style="min-width: 200px; max-width: 240px;">
      <li style="border-bottom: 1px #99adce solid;line-height: 20px">${item.name}</li>
      <li style="line-height: 20px">地址：${item.address}</li>
    </ul>`;
    marker.on('click', (e: any) => {
      infoWindow.setContent(e.target.content);
      infoWindow.open(map, e.target.getPosition());
    });
    marker.emit('click', { target: marker });
    // #endif

    // #ifdef MP-WEIXIN
    // 小程序端：更新选中对象
    nowChooseObj.value = item;
    nowChooseId.value = item.id;
    // #endif
  };

  /**
   * 列表项点击
   */
  const nowChooseClick = (item: PoiItem) => {
    nowChooseObj.value = item;
    nowChooseId.value = item.id;
    markerClick(item);
  };

  /**
   * 提交打卡
   * @returns 返回打卡ID (cciId)
   */
  const sureClick = async (): Promise<string | number> => {
    if (!nowChooseObj.value) {
      showToast('请选择打卡位置');
      throw new Error('请选择打卡位置');
    }

    showLoading('打卡中...');

    const params = {
      address:
        (nowChooseObj.value.pname || '') +
        (nowChooseObj.value.cityname || '') +
        (nowChooseObj.value.adname || '') +
        (nowChooseObj.value.address || '') +
        (nowChooseObj.value.name || ''),
      latitude: nowChooseObj.value.location.lat,
      longitude: nowChooseObj.value.location.lng,
      city: nowChooseObj.value.cityname || '',
      province: nowChooseObj.value.pname || '',
    };

    try {
      const clockInId = await CommonService.insCrmClockIn(params);
      hideLoading();
      addressID.value = String(clockInId);
      addressDetail.value = String(clockInId) + '/' + params.address;
      showSuccess('打卡成功');
      return clockInId;
    } catch (error) {
      hideLoading();
      throw error;
    }
  };

  /**
   * H5端：销毁地图实例（用于tab切换时重新创建地图）
   */
  // #ifdef H5
  const destroyMap = () => {
    if (map) {
      try {
        // 清除所有标记
        h5MapMarkers.forEach(marker => {
          if (marker && marker.setMap) {
            marker.setMap(null);
          }
        });
        h5MapMarkers = [];
        // 销毁地图实例
        map.destroy();
        map = null;
        // 重置控件添加标记，下次创建地图时可以重新添加
        mapControlsAdded = false;
      } catch (error) {
        console.warn('销毁地图实例失败:', error);
        // 即使销毁失败，也清空引用
        map = null;
        mapControlsAdded = false;
      }
    }
  };
  // #endif

  // 清理资源
  onUnmounted(() => {
    // #ifdef H5
    // 清除所有标记
    h5MapMarkers.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    h5MapMarkers = [];
    mapControlsAdded = false;
    // #endif

    if (map) {
      map.destroy();
      map = null;
    }
    hideLoading();
  });

  // #ifdef MP-WEIXIN
  /**
   * 小程序端：将 locationList 转换为地图标记点（最多显示50个）
   */
  const mapMarkers = computed(() => {
    // 限制最多显示50个标记点
    return locationList.value.slice(0, 50).map((item: PoiItem) => ({
      id: item.id,
      latitude: item.location.lat,
      longitude: item.location.lng,
      // 不设置 iconPath，使用默认标记点样式
      width: 20,
      height: 20,
      callout: {
        content: item.name,
        color: '#333',
        fontSize: 12,
        borderRadius: 4,
        bgColor: '#fff',
        padding: 5,
        display: 'BYCLICK', // 点击时显示
      },
    }));
  });

  /**
   * 小程序端：地图中心点（通过偏移隐藏右下角logo）
   * 将地图中心点稍微向上偏移，让logo区域被cover-view覆盖
   */
  const mapCenterLng = computed(() => lnglatXY.value[0] || 0);
  const mapCenterLat = computed(() => {
    // 向上偏移约0.001度（约100米），让地图中心稍微上移，logo区域更容易被覆盖
    return (lnglatXY.value[1] || 0) + 0.001;
  });

  /**
   * 小程序端：地图标记点点击事件
   */
  const onMarkerTap = (e: any) => {
    const markerId = e.detail.markerId;
    const item = locationList.value.find((l: PoiItem) => l.id === markerId);
    if (item) {
      nowChooseClick(item);
    }
  };
  // #endif

  return {
    // 状态
    nowWeather,
    lnglatXY,
    locationCity,
    nowChooseId,
    nowChooseObj,
    nowChoosePlace,
    locationList,
    addressID,
    addressDetail,
    addressValue,
    addressPage,
    mapLoading, // 地图加载状态
    locationPermissionLoading, // 定位权限请求状态
    // 方法
    wxRegister,
    getPositionByLonLats,
    onSearch,
    markerClick,
    nowChooseClick,
    sureClick,
    // #ifdef H5
    // H5端：提前初始化地图SDK（不创建实例）
    initAMap,
    // H5端：销毁地图实例（用于tab切换时重新创建）
    destroyMap,
    // #endif
    // #ifdef MP-WEIXIN
    // 小程序端地图相关
    mapMarkers,
    mapCenterLng,
    mapCenterLat,
    onMarkerTap,
    // #endif
  };
}
