export const TabPageMap = {
  dashboard: {
    path: RouteMap.dashboard,
    text: '数据中心',
    icon: 'ytcrm-chashujuHome',
    activeIcon: 'chashujuHome',
  },
  home: {
    path: RouteMap.home,
    text: '业务中心',
    icon: 'ytcrm-ywzxHome',
    activeIcon: 'ywzxHome',
  },
  user: {
    path: RouteMap.user,
    text: '我的',
    icon: 'ytcrm-myHome',
    activeIcon: 'myHome',
  },
} as const;
